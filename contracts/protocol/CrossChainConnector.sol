// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title CrossChainConnector
 * @dev Connector contract deployed on each connected chain to handle AEGIS protocol operations
 * This contract receives cross-chain messages from ZetaChain and executes local operations
 */
contract CrossChainConnector is Ownable, ReentrancyGuard {
    
    // AEGIS protocol contract on ZetaChain
    address public aegisProtocol;
    
    // Supported tokens for this chain
    mapping(address => bool) public supportedTokens;
    
    // User balances (for minting/burning)
    mapping(address => mapping(address => uint256)) public userBalances;
    
    // Collateral tracking
    mapping(uint256 => CollateralInfo) public collaterals;
    mapping(address => uint256[]) public userCollaterals;
    
    // Loan tracking
    mapping(uint256 => LoanInfo) public loans;
    mapping(address => uint256[]) public userLoans;
    
    // Events
    event TokenMinted(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 indexed loanId
    );
    
    event TokenBurned(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 indexed loanId
    );
    
    event CollateralLocked(
        uint256 indexed collateralId,
        address indexed owner,
        address indexed asset,
        uint256 amount
    );
    
    event CollateralReleased(
        uint256 indexed collateralId,
        address indexed owner,
        address indexed asset,
        uint256 amount
    );
    
    event CollateralLiquidated(
        uint256 indexed collateralId,
        address indexed liquidator,
        address indexed asset,
        uint256 amount
    );
    
    // Structs
    struct CollateralInfo {
        address owner;
        address asset;
        uint256 amount;
        bool isNFT;
        uint256 tokenId;
        bool isLocked;
        uint256 lockTimestamp;
    }
    
    struct LoanInfo {
        address owner;
        address debtAsset;
        uint256 debtAmount;
        uint256 collateralId;
        bool active;
        uint256 issuedTimestamp;
    }
    
    // Modifiers
    modifier onlyAegisProtocol() {
        require(msg.sender == aegisProtocol, "Only AEGIS protocol");
        _;
    }
    
    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }
    
    constructor(address _aegisProtocol) Ownable(msg.sender) {
        aegisProtocol = _aegisProtocol;
    }
    
    // ==================== CROSS-CHAIN OPERATIONS ====================
    
    /**
     * @dev Mint debt tokens (called by AEGIS protocol via cross-chain message)
     */
    function mintDebtTokens(
        address recipient,
        address debtAsset,
        uint256 debtAmount,
        uint256 loanId
    ) external onlyAegisProtocol onlySupportedToken(debtAsset) {
        // Mint tokens to recipient
        userBalances[recipient][debtAsset] += debtAmount;
        
        // Create loan record
        loans[loanId] = LoanInfo({
            owner: recipient,
            debtAsset: debtAsset,
            debtAmount: debtAmount,
            collateralId: 0, // Will be set when collateral is locked
            active: true,
            issuedTimestamp: block.timestamp
        });
        
        userLoans[recipient].push(loanId);
        
        emit TokenMinted(debtAsset, recipient, debtAmount, loanId);
    }
    
    /**
     * @dev Burn debt tokens (called by AEGIS protocol via cross-chain message)
     */
    function burnDebtTokens(
        address from,
        address debtAsset,
        uint256 debtAmount,
        uint256 loanId
    ) external onlyAegisProtocol onlySupportedToken(debtAsset) {
        require(userBalances[from][debtAsset] >= debtAmount, "Insufficient balance");
        
        // Burn tokens
        userBalances[from][debtAsset] -= debtAmount;
        
        // Update loan status
        if (loans[loanId].active) {
            loans[loanId].active = false;
        }
        
        emit TokenBurned(debtAsset, from, debtAmount, loanId);
    }
    
    /**
     * @dev Lock collateral (called by AEGIS protocol via cross-chain message)
     */
    function lockCollateral(
        uint256 collateralId,
        address owner,
        address asset,
        uint256 amount,
        bool isNFT,
        uint256 tokenId
    ) external onlyAegisProtocol onlySupportedToken(asset) {
        // Create collateral record
        collaterals[collateralId] = CollateralInfo({
            owner: owner,
            asset: asset,
            amount: amount,
            isNFT: isNFT,
            tokenId: tokenId,
            isLocked: true,
            lockTimestamp: block.timestamp
        });
        
        userCollaterals[owner].push(collateralId);
        
        emit CollateralLocked(collateralId, owner, asset, amount);
    }
    
    /**
     * @dev Release collateral (called by AEGIS protocol via cross-chain message)
     */
    function releaseCollateral(
        uint256 collateralId,
        address owner
    ) external onlyAegisProtocol {
        CollateralInfo storage col = collaterals[collateralId];
        require(col.owner == owner, "Not collateral owner");
        require(col.isLocked, "Collateral not locked");
        
        // Release collateral
        col.isLocked = false;
        
        // Transfer tokens back to owner
        if (col.isNFT) {
            // For NFTs, we assume the contract has custody
            // In a real implementation, this would transfer the NFT
        } else {
            // For fungible tokens, mint back to owner
            userBalances[owner][col.asset] += col.amount;
        }
        
        emit CollateralReleased(collateralId, owner, col.asset, col.amount);
    }
    
    /**
     * @dev Liquidate collateral (called by AEGIS protocol via cross-chain message)
     */
    function liquidateCollateral(
        uint256 collateralId,
        uint256 amount,
        address liquidator
    ) external onlyAegisProtocol {
        CollateralInfo storage col = collaterals[collateralId];
        require(col.isLocked, "Collateral not locked");
        require(amount <= col.amount, "Amount exceeds collateral");
        
        // Transfer liquidated amount to liquidator
        if (col.isNFT) {
            // For NFTs, transfer ownership
            col.owner = liquidator;
        } else {
            // For fungible tokens, mint to liquidator
            userBalances[liquidator][col.asset] += amount;
            col.amount -= amount;
        }
        
        emit CollateralLiquidated(collateralId, liquidator, col.asset, amount);
    }
    
    /**
     * @dev Transfer collateral between chains
     */
    function transferCollateral(
        uint256 collateralId,
        uint256 targetChainId,
        uint256 amount
    ) external onlyAegisProtocol {
        CollateralInfo storage col = collaterals[collateralId];
        require(col.isLocked, "Collateral not locked");
        require(amount <= col.amount, "Amount exceeds collateral");
        
        // Reduce amount on current chain
        col.amount -= amount;
        
        // If all collateral transferred, mark as inactive
        if (col.amount == 0) {
            col.isLocked = false;
        }
        
        // Send cross-chain message to target chain
        _sendTransferMessage(targetChainId, collateralId, amount);
    }
    
    // ==================== USER OPERATIONS ====================
    
    /**
     * @dev User withdraws their minted tokens
     */
    function withdrawTokens(
        address token,
        uint256 amount
    ) external nonReentrant onlySupportedToken(token) {
        require(userBalances[msg.sender][token] >= amount, "Insufficient balance");
        
        userBalances[msg.sender][token] -= amount;
        
        // Transfer tokens to user
        IERC20(token).transfer(msg.sender, amount);
    }
    
    /**
     * @dev User deposits tokens to repay debt
     */
    function depositForRepayment(
        address token,
        uint256 amount
    ) external nonReentrant onlySupportedToken(token) {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Add to user's balance for repayment
        userBalances[msg.sender][token] += amount;
    }
    
    /**
     * @dev User repays loan
     */
    function repayLoan(
        uint256 loanId,
        uint256 amount
    ) external nonReentrant {
        LoanInfo storage loan = loans[loanId];
        require(loan.owner == msg.sender, "Not loan owner");
        require(loan.active, "Loan not active");
        require(amount <= loan.debtAmount, "Amount exceeds debt");
        
        // Deduct from user's balance
        require(userBalances[msg.sender][loan.debtAsset] >= amount, "Insufficient balance");
        userBalances[msg.sender][loan.debtAsset] -= amount;
        
        // Update loan
        loan.debtAmount -= amount;
        if (loan.debtAmount == 0) {
            loan.active = false;
        }
        
        // Send cross-chain message to AEGIS protocol
        _sendRepaymentMessage(loanId, amount);
    }
    
    // ==================== INTERNAL FUNCTIONS ====================
    
    /**
     * @dev Send transfer message to target chain
     */
    function _sendTransferMessage(
        uint256 targetChainId,
        uint256 collateralId,
        uint256 amount
    ) internal {
        // In a real implementation, this would send a cross-chain message
        // For now, we'll just emit an event
        emit CollateralLiquidated(collateralId, address(0), address(0), amount);
    }
    
    /**
     * @dev Send repayment message to AEGIS protocol
     */
    function _sendRepaymentMessage(
        uint256 loanId,
        uint256 amount
    ) internal {
        // In a real implementation, this would send a cross-chain message to ZetaChain
        // For now, we'll just emit an event
        emit TokenBurned(address(0), msg.sender, amount, loanId);
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Set AEGIS protocol address
     */
    function setAegisProtocol(address _aegisProtocol) external onlyOwner {
        aegisProtocol = _aegisProtocol;
    }
    
    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }
    
    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
    
    /**
     * @dev Emergency withdraw tokens
     */
    function emergencyWithdraw(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(recipient, amount);
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get user's collateral
     */
    function getUserCollaterals(address user) external view returns (uint256[] memory) {
        return userCollaterals[user];
    }
    
    /**
     * @dev Get user's loans
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    /**
     * @dev Get user's token balance
     */
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }
    
    /**
     * @dev Get collateral details
     */
    function getCollateral(uint256 collateralId) external view returns (CollateralInfo memory) {
        return collaterals[collateralId];
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (LoanInfo memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Check if token is supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }
} 