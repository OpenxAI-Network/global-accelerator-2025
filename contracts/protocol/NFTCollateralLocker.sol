// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTCollateralLocker
 * @dev Secure NFT collateral locking with cross-chain messaging integration
 * @author Aegis AI Team
 */
contract NFTCollateralLocker is Ownable, ReentrancyGuard, Pausable, IERC721Receiver {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    // =============================================================================
    // INTERFACES
    // =============================================================================

    interface ICrossChainGateway {
        function sendCrossChainMessage(
            uint256 destChainId,
            bytes calldata payload
        ) external;
    }

    interface IPriceOracle {
        function getNFTPrice(address nftContract, uint256 tokenId) external view returns (uint256);
        function getCollectionFloorPrice(address nftContract) external view returns (uint256);
    }

    // =============================================================================
    // STRUCTS
    // =============================================================================

    struct CollateralPosition {
        address owner;
        uint256 tokenId;
        uint256 lockedAt;
        uint256 estimatedValue;
        uint256 loanAmount;
        uint256 loanChainId;
        bool isActive;
        bool isLiquidated;
        uint256 liquidationThreshold;
        uint256 lastHealthCheck;
        string metadataURI;
    }

    struct CrossChainMessage {
        uint256 messageId;
        uint256 destChainId;
        bytes payload;
        uint256 timestamp;
        bool executed;
        bool acknowledged;
    }

    struct NFTMetadata {
        string name;
        string symbol;
        string description;
        string imageURI;
        string externalURL;
        address creator;
        uint256 royaltyPercentage;
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    ICrossChainGateway public crossChainGateway;
    IPriceOracle public priceOracle;
    
    mapping(uint256 => CollateralPosition) public collateralPositions;
    mapping(address => uint256[]) public userPositions;
    mapping(uint256 => CrossChainMessage) public crossChainMessages;
    mapping(address => NFTMetadata) public nftMetadata;
    
    Counters.Counter private _positionCounter;
    Counters.Counter private _messageCounter;
    
    uint256 public constant MIN_LOCK_DURATION = 1 days;
    uint256 public constant MAX_LOCK_DURATION = 365 days;
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% LTV
    uint256 public constant HEALTH_CHECK_INTERVAL = 1 hours;
    
    uint256 public totalLockedValue;
    uint256 public totalActivePositions;
    uint256 public totalLiquidatedPositions;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event NFTCollateralLocked(
        uint256 indexed positionId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 estimatedValue,
        uint256 timestamp
    );

    event NFTCollateralUnlocked(
        uint256 indexed positionId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 timestamp
    );

    event CrossChainMessageSent(
        uint256 indexed messageId,
        uint256 destChainId,
        bytes payload,
        uint256 timestamp
    );

    event CrossChainMessageAcknowledged(
        uint256 indexed messageId,
        uint256 destChainId,
        uint256 timestamp
    );

    event PositionLiquidated(
        uint256 indexed positionId,
        address indexed owner,
        uint256 timestamp,
        string reason
    );

    event MetadataUpdated(
        address indexed nftContract,
        string name,
        string symbol,
        uint256 timestamp
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyPositionOwner(uint256 positionId) {
        require(collateralPositions[positionId].owner == msg.sender, "Not position owner");
        _;
    }

    modifier positionExists(uint256 positionId) {
        require(collateralPositions[positionId].owner != address(0), "Position does not exist");
        _;
    }

    modifier positionActive(uint256 positionId) {
        require(collateralPositions[positionId].isActive, "Position not active");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(
        address _crossChainGateway,
        address _priceOracle
    ) {
        crossChainGateway = ICrossChainGateway(_crossChainGateway);
        priceOracle = IPriceOracle(_priceOracle);
    }

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * @dev Lock NFT as collateral and create cross-chain position
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param loanAmount Requested loan amount
     * @param loanChainId Target chain for loan issuance
     * @param metadataURI URI for NFT metadata
     */
    function lockNFTCollateral(
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        uint256 loanChainId,
        string calldata metadataURI
    ) external nonReentrant whenNotPaused {
        require(nftContract != address(0), "Invalid NFT contract");
        require(loanAmount > 0, "Invalid loan amount");
        require(loanChainId > 0, "Invalid loan chain ID");

        // Transfer NFT to this contract
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        // Get NFT valuation
        uint256 estimatedValue = priceOracle.getNFTPrice(nftContract, tokenId);
        require(estimatedValue > 0, "Unable to determine NFT value");

        // Calculate liquidation threshold
        uint256 liquidationThreshold = loanAmount.mul(100).div(estimatedValue);
        require(liquidationThreshold <= LIQUIDATION_THRESHOLD, "Loan amount too high");

        // Create collateral position
        uint256 positionId = _positionCounter.current();
        _positionCounter.increment();

        collateralPositions[positionId] = CollateralPosition({
            owner: msg.sender,
            tokenId: tokenId,
            lockedAt: block.timestamp,
            estimatedValue: estimatedValue,
            loanAmount: loanAmount,
            loanChainId: loanChainId,
            isActive: true,
            isLiquidated: false,
            liquidationThreshold: liquidationThreshold,
            lastHealthCheck: block.timestamp,
            metadataURI: metadataURI
        });

        userPositions[msg.sender].push(positionId);
        totalActivePositions = totalActivePositions.add(1);
        totalLockedValue = totalLockedValue.add(estimatedValue);

        // Send cross-chain message for loan issuance
        _sendCrossChainMessage(loanChainId, _createLoanRequestPayload(positionId, nftContract, tokenId, loanAmount));

        emit NFTCollateralLocked(positionId, msg.sender, nftContract, tokenId, estimatedValue, block.timestamp);
    }

    /**
     * @dev Unlock NFT collateral after loan repayment
     * @param positionId ID of the collateral position
     */
    function unlockNFTCollateral(uint256 positionId) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyPositionOwner(positionId) 
        positionExists(positionId) 
        positionActive(positionId) 
    {
        CollateralPosition storage position = collateralPositions[positionId];
        
        // Check if loan is fully repaid (this would be verified via cross-chain message)
        require(position.loanAmount == 0, "Loan not fully repaid");
        require(block.timestamp >= position.lockedAt.add(MIN_LOCK_DURATION), "Lock duration not met");

        // Transfer NFT back to owner
        IERC721(msg.sender).safeTransferFrom(address(this), msg.sender, position.tokenId);

        // Update state
        position.isActive = false;
        totalActivePositions = totalActivePositions.sub(1);
        totalLockedValue = totalLockedValue.sub(position.estimatedValue);

        // Send cross-chain message for position closure
        _sendCrossChainMessage(position.loanChainId, _createPositionClosurePayload(positionId));

        emit NFTCollateralUnlocked(positionId, msg.sender, msg.sender, position.tokenId, block.timestamp);
    }

    /**
     * @dev Liquidate position if health check fails
     * @param positionId ID of the collateral position
     * @param reason Reason for liquidation
     */
    function liquidatePosition(uint256 positionId, string calldata reason) 
        external 
        onlyOwner 
        positionExists(positionId) 
        positionActive(positionId) 
    {
        CollateralPosition storage position = collateralPositions[positionId];
        
        require(!position.isLiquidated, "Position already liquidated");
        require(_isPositionUnhealthy(positionId), "Position is healthy");

        position.isLiquidated = true;
        position.isActive = false;
        totalActivePositions = totalActivePositions.sub(1);
        totalLiquidatedPositions = totalLiquidatedPositions.add(1);

        // Send cross-chain liquidation message
        _sendCrossChainMessage(position.loanChainId, _createLiquidationPayload(positionId, reason));

        emit PositionLiquidated(positionId, position.owner, block.timestamp, reason);
    }

    /**
     * @dev Update NFT metadata for better valuation
     * @param nftContract Address of the NFT contract
     * @param name NFT collection name
     * @param symbol NFT collection symbol
     * @param description NFT collection description
     * @param imageURI URI for collection image
     * @param externalURL External URL for collection
     * @param creator Creator address
     * @param royaltyPercentage Royalty percentage (0-100)
     */
    function updateNFTMetadata(
        address nftContract,
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata imageURI,
        string calldata externalURL,
        address creator,
        uint256 royaltyPercentage
    ) external onlyOwner {
        require(nftContract != address(0), "Invalid NFT contract");
        require(royaltyPercentage <= 100, "Invalid royalty percentage");

        nftMetadata[nftContract] = NFTMetadata({
            name: name,
            symbol: symbol,
            description: description,
            imageURI: imageURI,
            externalURL: externalURL,
            creator: creator,
            royaltyPercentage: royaltyPercentage
        });

        emit MetadataUpdated(nftContract, name, symbol, block.timestamp);
    }

    // =============================================================================
    // CROSS-CHAIN INTEGRATION
    // =============================================================================

    /**
     * @dev Send cross-chain message via ZetaChain
     * @param destChainId Destination chain ID
     * @param payload Message payload
     */
    function _sendCrossChainMessage(uint256 destChainId, bytes memory payload) internal {
        uint256 messageId = _messageCounter.current();
        _messageCounter.increment();

        crossChainMessages[messageId] = CrossChainMessage({
            messageId: messageId,
            destChainId: destChainId,
            payload: payload,
            timestamp: block.timestamp,
            executed: false,
            acknowledged: false
        });

        crossChainGateway.sendCrossChainMessage(destChainId, payload);

        emit CrossChainMessageSent(messageId, destChainId, payload, block.timestamp);
    }

    /**
     * @dev Acknowledge cross-chain message execution
     * @param messageId ID of the cross-chain message
     */
    function acknowledgeCrossChainMessage(uint256 messageId) external onlyOwner {
        require(crossChainMessages[messageId].messageId != 0, "Message does not exist");
        require(!crossChainMessages[messageId].acknowledged, "Message already acknowledged");

        crossChainMessages[messageId].acknowledged = true;
        crossChainMessages[messageId].executed = true;

        emit CrossChainMessageAcknowledged(
            messageId, 
            crossChainMessages[messageId].destChainId, 
            block.timestamp
        );
    }

    // =============================================================================
    // HEALTH MONITORING
    // =============================================================================

    /**
     * @dev Check if position is healthy
     * @param positionId ID of the collateral position
     * @return bool True if position is healthy
     */
    function _isPositionUnhealthy(uint256 positionId) internal view returns (bool) {
        CollateralPosition storage position = collateralPositions[positionId];
        
        // Check if health check is overdue
        if (block.timestamp.sub(position.lastHealthCheck) > HEALTH_CHECK_INTERVAL) {
            return true;
        }

        // Check if LTV exceeds liquidation threshold
        uint256 currentValue = priceOracle.getNFTPrice(msg.sender, position.tokenId);
        uint256 currentLTV = position.loanAmount.mul(100).div(currentValue);
        
        return currentLTV > position.liquidationThreshold;
    }

    /**
     * @dev Perform health check on position
     * @param positionId ID of the collateral position
     */
    function performHealthCheck(uint256 positionId) 
        external 
        onlyPositionOwner(positionId) 
        positionExists(positionId) 
        positionActive(positionId) 
    {
        CollateralPosition storage position = collateralPositions[positionId];
        position.lastHealthCheck = block.timestamp;

        // Update estimated value
        uint256 currentValue = priceOracle.getNFTPrice(msg.sender, position.tokenId);
        if (currentValue != position.estimatedValue) {
            totalLockedValue = totalLockedValue.sub(position.estimatedValue).add(currentValue);
            position.estimatedValue = currentValue;
        }
    }

    // =============================================================================
    // PAYLOAD CREATION
    // =============================================================================

    function _createLoanRequestPayload(
        uint256 positionId,
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount
    ) internal pure returns (bytes memory) {
        return abi.encode(
            "LOAN_REQUEST",
            positionId,
            nftContract,
            tokenId,
            loanAmount
        );
    }

    function _createPositionClosurePayload(uint256 positionId) internal pure returns (bytes memory) {
        return abi.encode("POSITION_CLOSURE", positionId);
    }

    function _createLiquidationPayload(uint256 positionId, string memory reason) internal pure returns (bytes memory) {
        return abi.encode("LIQUIDATION", positionId, reason);
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @dev Get user's active positions
     * @param user User address
     * @return uint256[] Array of position IDs
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    /**
     * @dev Get position details
     * @param positionId ID of the position
     * @return CollateralPosition Position details
     */
    function getPosition(uint256 positionId) external view returns (CollateralPosition memory) {
        return collateralPositions[positionId];
    }

    /**
     * @dev Get cross-chain message details
     * @param messageId ID of the message
     * @return CrossChainMessage Message details
     */
    function getCrossChainMessage(uint256 messageId) external view returns (CrossChainMessage memory) {
        return crossChainMessages[messageId];
    }

    /**
     * @dev Get NFT metadata
     * @param nftContract Address of the NFT contract
     * @return NFTMetadata NFT metadata
     */
    function getNFTMetadata(address nftContract) external view returns (NFTMetadata memory) {
        return nftMetadata[nftContract];
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Update cross-chain gateway address
     * @param newGateway New gateway address
     */
    function updateCrossChainGateway(address newGateway) external onlyOwner {
        require(newGateway != address(0), "Invalid gateway address");
        crossChainGateway = ICrossChainGateway(newGateway);
    }

    /**
     * @dev Update price oracle address
     * @param newOracle New oracle address
     */
    function updatePriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(newOracle);
    }

    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // IERC721Receiver IMPLEMENTATION
    // =============================================================================

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // =============================================================================
    // FALLBACK
    // =============================================================================

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
