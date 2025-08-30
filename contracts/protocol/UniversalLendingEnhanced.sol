// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title UniversalLendingEnhanced
 * @dev Enhanced Universal Lending Contract with ZetaChain Gateway Event Subscriptions
 * @author Aegis AI Team
 */
contract UniversalLendingEnhanced is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // =============================================================================
    // INTERFACES
    // =============================================================================

    interface IGateway {
        function sendCrossChainMessage(
            uint256 destChainId,
            bytes calldata payload
        ) external;
    }

    interface IPriceOracle {
        function getPrice(address asset) external view returns (uint256);
        function getPriceWithTimestamp(address asset) external view returns (uint256, uint256);
    }

    // =============================================================================
    // STRUCTS
    // =============================================================================

    struct Loan {
        uint256 amountBorrowed;
        uint256 collateralValue;
        address collateralAsset;
        uint256 collateralChainId;
        uint256 borrowTimestamp;
        uint256 lastHealthCheck;
        bool active;
        bool flagged;
        uint256 liquidationThreshold;
        uint256 rebalanceThreshold;
    }

    struct AssetConfig {
        uint256 maxLTV;
        uint256 liquidationThreshold;
        uint256 rebalanceThreshold;
        bool enabled;
        uint256 priceDecimals;
    }

    struct CrossChainAction {
        uint256 destChainId;
        bytes payload;
        uint256 timestamp;
        bool executed;
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    IGateway public gateway;
    IPriceOracle public priceOracle;
    
    uint256 public constant HEALTH_THRESHOLD = 80; // 80% LTV threshold
    uint256 public constant REBALANCE_THRESHOLD = 70; // 70% LTV threshold
    uint256 public constant LIQUIDATION_THRESHOLD = 85; // 85% LTV threshold
    
    uint256 public constant PRICE_UPDATE_WINDOW = 300; // 5 minutes
    uint256 public constant LIQUIDATION_DELAY = 3600; // 1 hour grace period
    
    mapping(address => Loan) public loans;
    mapping(address => AssetConfig) public assetConfigs;
    mapping(bytes32 => CrossChainAction) public crossChainActions;
    mapping(address => uint256[]) public userLoanHistory;
    
    uint256 public totalLoans;
    uint256 public totalBorrowed;
    uint256 public totalCollateral;
    uint256 public actionCounter;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event LoanCreated(
        address indexed user,
        uint256 amountBorrowed,
        address collateralAsset,
        uint256 collateralValue,
        uint256 chainId
    );

    event LoanLiquidated(
        address indexed user,
        uint256 amountRecovered,
        uint256 ltvAtLiquidation,
        uint256 timestamp
    );

    event LoanRebalanced(
        address indexed user,
        uint256 oldLTV,
        uint256 newLTV,
        uint256 timestamp
    );

    event PriceUpdateReceived(
        address indexed asset,
        uint256 newPrice,
        uint256 timestamp,
        uint256 sourceChainId
    );

    event CrossChainMessageSent(
        uint256 indexed destChainId,
        bytes payload,
        uint256 actionId
    );

    event HealthCheckTriggered(
        address indexed user,
        uint256 currentLTV,
        string action,
        uint256 timestamp
    );

    event AssetConfigUpdated(
        address indexed asset,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 rebalanceThreshold
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyGateway() {
        require(msg.sender == address(gateway), "Only gateway can call this");
        _;
    }

    modifier onlyActiveLoan(address user) {
        require(loans[user].active, "Loan not active");
        _;
    }

    modifier onlyValidAsset(address asset) {
        require(assetConfigs[asset].enabled, "Asset not enabled");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(address _gateway, address _priceOracle) {
        gateway = IGateway(_gateway);
        priceOracle = IPriceOracle(_priceOracle);
        
        // Initialize default asset configs
        _initializeDefaultAssets();
    }

    // =============================================================================
    // GATEWAY EVENT SUBSCRIPTION FUNCTIONS
    // =============================================================================

    /**
     * @dev Gateway subscription hook - called by ZetaChain on price update event
     * @param user The user address to check
     * @param asset The asset that was updated
     * @param newPrice The new price of the asset
     * @param sourceChainId The chain ID where the price update originated
     */
    function onPriceUpdate(
        address user,
        address asset,
        uint256 newPrice,
        uint256 sourceChainId
    ) external onlyGateway {
        require(user != address(0), "Invalid user address");
        require(asset != address(0), "Invalid asset address");
        
        emit PriceUpdateReceived(asset, newPrice, block.timestamp, sourceChainId);
        
        // Update collateral value if this asset is used as collateral
        if (loans[user].active && loans[user].collateralAsset == asset) {
            _updateCollateralValue(user, newPrice);
            _performHealthCheck(user);
        }
    }

    /**
     * @dev Gateway subscription hook - called by ZetaChain on cross-chain warning
     * @param user The user address
     * @param predictedDropPercent Predicted price drop percentage
     * @param sourceChainId The chain ID where the warning originated
     */
    function onCrossChainWarning(
        address user,
        uint256 predictedDropPercent,
        uint256 sourceChainId
    ) external onlyGateway {
        require(user != address(0), "Invalid user address");
        require(loans[user].active, "Loan not active");
        
        if (predictedDropPercent > 10) { // >10% price drop predicted
            _triggerPreemptiveAction(user, predictedDropPercent, sourceChainId);
        }
    }

    /**
     * @dev Gateway subscription hook - called by ZetaChain on liquidation event
     * @param user The user address
     * @param liquidator The address performing the liquidation
     * @param amount The amount being liquidated
     */
    function onLiquidationEvent(
        address user,
        address liquidator,
        uint256 amount
    ) external onlyGateway {
        require(user != address(0), "Invalid user address");
        require(loans[user].active, "Loan not active");
        
        _executeLiquidation(user, liquidator, amount);
    }

    // =============================================================================
    // CORE LENDING FUNCTIONS
    // =============================================================================

    /**
     * @dev Create a new loan with cross-chain collateral
     * @param collateralAsset The collateral asset address
     * @param collateralValue The collateral value
     * @param collateralChainId The chain ID where collateral is held
     * @param borrowAmount The amount to borrow
     */
    function createLoan(
        address collateralAsset,
        uint256 collateralValue,
        uint256 collateralChainId,
        uint256 borrowAmount
    ) external onlyValidAsset(collateralAsset) nonReentrant whenNotPaused {
        require(collateralValue > 0, "Invalid collateral value");
        require(borrowAmount > 0, "Invalid borrow amount");
        require(!loans[msg.sender].active, "User already has active loan");
        
        AssetConfig memory config = assetConfigs[collateralAsset];
        uint256 maxBorrow = collateralValue.mul(config.maxLTV).div(100);
        require(borrowAmount <= maxBorrow, "Borrow amount exceeds max LTV");
        
        // Create loan
        loans[msg.sender] = Loan({
            amountBorrowed: borrowAmount,
            collateralValue: collateralValue,
            collateralAsset: collateralAsset,
            collateralChainId: collateralChainId,
            borrowTimestamp: block.timestamp,
            lastHealthCheck: block.timestamp,
            active: true,
            flagged: false,
            liquidationThreshold: config.liquidationThreshold,
            rebalanceThreshold: config.rebalanceThreshold
        });
        
        userLoanHistory[msg.sender].push(totalLoans);
        totalLoans = totalLoans.add(1);
        totalBorrowed = totalBorrowed.add(borrowAmount);
        totalCollateral = totalCollateral.add(collateralValue);
        
        emit LoanCreated(
            msg.sender,
            borrowAmount,
            collateralAsset,
            collateralValue,
            collateralChainId
        );
        
        // Subscribe to price updates for this asset
        _subscribeToPriceUpdates(collateralAsset, collateralChainId);
    }

    /**
     * @dev Repay loan and close position
     * @param repayAmount The amount to repay
     */
    function repayLoan(uint256 repayAmount) external onlyActiveLoan(msg.sender) nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(repayAmount <= loan.amountBorrowed, "Repay amount exceeds borrowed amount");
        
        loan.amountBorrowed = loan.amountBorrowed.sub(repayAmount);
        totalBorrowed = totalBorrowed.sub(repayAmount);
        
        if (loan.amountBorrowed == 0) {
            _closeLoan(msg.sender);
        }
    }

    /**
     * @dev Add additional collateral to improve LTV
     * @param additionalValue The additional collateral value
     */
    function addCollateral(uint256 additionalValue) external onlyActiveLoan(msg.sender) nonReentrant {
        require(additionalValue > 0, "Invalid additional value");
        
        Loan storage loan = loans[msg.sender];
        loan.collateralValue = loan.collateralValue.add(additionalValue);
        totalCollateral = totalCollateral.add(additionalValue);
        
        // Perform health check after adding collateral
        _performHealthCheck(msg.sender);
    }

    // =============================================================================
    // HEALTH CHECK & AUTOMATION FUNCTIONS
    // =============================================================================

    /**
     * @dev Perform health check on a user's loan
     * @param user The user address to check
     */
    function _performHealthCheck(address user) internal {
        Loan storage loan = loans[user];
        require(loan.active, "Loan not active");
        
        uint256 currentLTV = _calculateLTV(user);
        loan.lastHealthCheck = block.timestamp;
        
        if (currentLTV >= loan.liquidationThreshold) {
            emit HealthCheckTriggered(user, currentLTV, "LIQUIDATE", block.timestamp);
            _triggerLiquidation(user);
        } else if (currentLTV >= loan.rebalanceThreshold) {
            emit HealthCheckTriggered(user, currentLTV, "REBALANCE", block.timestamp);
            _triggerRebalance(user);
        } else if (loan.flagged) {
            loan.flagged = false; // Clear flag if LTV is now healthy
        }
    }

    /**
     * @dev Trigger liquidation process
     * @param user The user address to liquidate
     */
    function _triggerLiquidation(address user) internal {
        Loan storage loan = loans[user];
        loan.flagged = true;
        
        // Send liquidation message to the chain holding collateral
        bytes memory payload = abi.encode(
            "liquidate",
            user,
            loan.collateralAsset,
            loan.collateralValue,
            block.timestamp
        );
        
        uint256 actionId = _sendCrossChainMessage(loan.collateralChainId, payload);
        
        emit CrossChainMessageSent(loan.collateralChainId, payload, actionId);
    }

    /**
     * @dev Trigger rebalancing process
     * @param user The user address to rebalance
     */
    function _triggerRebalance(address user) internal {
        Loan storage loan = loans[user];
        
        // Send rebalance message to the chain holding collateral
        bytes memory payload = abi.encode(
            "rebalance",
            user,
            loan.collateralAsset,
            loan.collateralValue,
            block.timestamp
        );
        
        uint256 actionId = _sendCrossChainMessage(loan.collateralChainId, payload);
        
        emit CrossChainMessageSent(loan.collateralChainId, payload, actionId);
    }

    /**
     * @dev Trigger preemptive action based on cross-chain warnings
     * @param user The user address
     * @param predictedDrop The predicted price drop percentage
     * @param sourceChainId The source chain ID
     */
    function _triggerPreemptiveAction(
        address user,
        uint256 predictedDrop,
        uint256 sourceChainId
    ) internal {
        Loan storage loan = loans[user];
        
        // Send margin call message
        bytes memory payload = abi.encode(
            "marginCall",
            user,
            predictedDrop,
            block.timestamp
        );
        
        uint256 actionId = _sendCrossChainMessage(loan.collateralChainId, payload);
        
        emit CrossChainMessageSent(loan.collateralChainId, payload, actionId);
    }

    // =============================================================================
    // CROSS-CHAIN MESSAGING
    // =============================================================================

    /**
     * @dev Send cross-chain message via ZetaChain Gateway
     * @param destChainId The destination chain ID
     * @param payload The message payload
     * @return actionId The unique action ID
     */
    function _sendCrossChainMessage(
        uint256 destChainId,
        bytes memory payload
    ) internal returns (uint256) {
        actionCounter = actionCounter.add(1);
        
        CrossChainAction storage action = crossChainActions[bytes32(actionCounter)];
        action.destChainId = destChainId;
        action.payload = payload;
        action.timestamp = block.timestamp;
        action.executed = false;
        
        // Send message via gateway
        gateway.sendCrossChainMessage(destChainId, payload);
        
        return actionCounter;
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * @dev Calculate current LTV for a user
     * @param user The user address
     * @return The current LTV percentage
     */
    function _calculateLTV(address user) internal view returns (uint256) {
        Loan storage loan = loans[user];
        if (loan.collateralValue == 0) return 0;
        
        return loan.amountBorrowed.mul(100).div(loan.collateralValue);
    }

    /**
     * @dev Update collateral value for a user
     * @param user The user address
     * @param newPrice The new asset price
     */
    function _updateCollateralValue(address user, uint256 newPrice) internal {
        Loan storage loan = loans[user];
        // Update collateral value based on new price
        // This is a simplified calculation - in production, you'd use actual asset amounts
        loan.collateralValue = newPrice;
    }

    /**
     * @dev Close a loan and clean up state
     * @param user The user address
     */
    function _closeLoan(address user) internal {
        Loan storage loan = loans[user];
        totalCollateral = totalCollateral.sub(loan.collateralValue);
        loan.active = false;
        
        // Clear loan data
        delete loans[user];
    }

    /**
     * @dev Subscribe to price updates for an asset
     * @param asset The asset address
     * @param chainId The chain ID where the asset is located
     */
    function _subscribeToPriceUpdates(address asset, uint256 chainId) internal {
        // In production, this would register with ZetaChain's event subscription system
        // For now, we'll emit an event to indicate subscription
        emit CrossChainMessageSent(
            chainId,
            abi.encode("subscribe", asset, address(this)),
            actionCounter
        );
    }

    /**
     * @dev Execute liquidation from cross-chain event
     * @param user The user address
     * @param liquidator The liquidator address
     * @param amount The liquidation amount
     */
    function _executeLiquidation(
        address user,
        address liquidator,
        uint256 amount
    ) internal {
        Loan storage loan = loans[user];
        require(loan.active, "Loan not active");
        
        uint256 ltvAtLiquidation = _calculateLTV(user);
        
        // Close the loan
        _closeLoan(user);
        
        emit LoanLiquidated(user, amount, ltvAtLiquidation, block.timestamp);
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Update asset configuration
     * @param asset The asset address
     * @param maxLTV The maximum LTV percentage
     * @param liquidationThreshold The liquidation threshold
     * @param rebalanceThreshold The rebalance threshold
     */
    function updateAssetConfig(
        address asset,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 rebalanceThreshold
    ) external onlyOwner {
        require(asset != address(0), "Invalid asset address");
        require(maxLTV < 100, "Max LTV must be less than 100%");
        require(liquidationThreshold > rebalanceThreshold, "Invalid thresholds");
        
        assetConfigs[asset] = AssetConfig({
            maxLTV: maxLTV,
            liquidationThreshold: liquidationThreshold,
            rebalanceThreshold: rebalanceThreshold,
            enabled: true,
            priceDecimals: 18
        });
        
        emit AssetConfigUpdated(asset, maxLTV, liquidationThreshold, rebalanceThreshold);
    }

    /**
     * @dev Update gateway address
     * @param _gateway The new gateway address
     */
    function updateGateway(address _gateway) external onlyOwner {
        require(_gateway != address(0), "Invalid gateway address");
        gateway = IGateway(_gateway);
    }

    /**
     * @dev Update price oracle address
     * @param _priceOracle The new price oracle address
     */
    function updatePriceOracle(address _priceOracle) external onlyOwner {
        require(_priceOracle != address(0), "Invalid price oracle address");
        priceOracle = IPriceOracle(_priceOracle);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @dev Get user loan information
     * @param user The user address
     * @return The loan information
     */
    function getUserLoan(address user) external view returns (Loan memory) {
        return loans[user];
    }

    /**
     * @dev Get current LTV for a user
     * @param user The user address
     * @return The current LTV percentage
     */
    function getCurrentLTV(address user) external view returns (uint256) {
        return _calculateLTV(user);
    }

    /**
     * @dev Get asset configuration
     * @param asset The asset address
     * @return The asset configuration
     */
    function getAssetConfig(address asset) external view returns (AssetConfig memory) {
        return assetConfigs[asset];
    }

    /**
     * @dev Get cross-chain action details
     * @param actionId The action ID
     * @return The cross-chain action details
     */
    function getCrossChainAction(uint256 actionId) external view returns (CrossChainAction memory) {
        return crossChainActions[bytes32(actionId)];
    }

    // =============================================================================
    // INITIALIZATION
    // =============================================================================

    /**
     * @dev Initialize default asset configurations
     */
    function _initializeDefaultAssets() internal {
        // ETH configuration
        assetConfigs[address(0)] = AssetConfig({
            maxLTV: 75,
            liquidationThreshold: 85,
            rebalanceThreshold: 70,
            enabled: true,
            priceDecimals: 18
        });
        
        // USDC configuration (example)
        assetConfigs[address(1)] = AssetConfig({
            maxLTV: 80,
            liquidationThreshold: 90,
            rebalanceThreshold: 75,
            enabled: true,
            priceDecimals: 6
        });
    }
}
