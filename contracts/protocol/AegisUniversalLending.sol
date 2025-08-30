// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IAIOracle.sol";
import "../interfaces/IUniversalToken.sol";
import "../interfaces/IUniversalNFT.sol";

/**
 * @title AegisUniversalLending
 * @dev AEGIS Universal Lending Protocol on ZetaChain using Universal Contract pattern
 * 
 * Key Features:
 * 1. Accepts collateral from any chain (including native BTC) via Universal Contract
 * 2. Issues loans on any chain using cross-chain messaging
 * 3. Uses AI oracle for risk management and liquidations
 * 4. Cross-chain messaging via ZetaChain CCM
 * 5. Universal Token and NFT support
 */
contract AegisUniversalLending is UniversalContract, Ownable, ReentrancyGuard, Pausable {
    using UniversalToken for address;
    
    // ==================== STRUCTS ====================
    
    struct CollateralPosition {
        address owner;
        uint256 chainId;
        address asset;
        uint256 amount;
        uint256 tokenId; // For NFTs
        bool isNFT;
        uint256 lockedTimestamp;
        uint256 lastPriceUpdate;
        uint256 currentValue; // In USD with 8 decimals
        bytes32 proof; // Cross-chain proof
    }
    
    struct LoanPosition {
        address owner;
        uint256 collateralId;
        uint256 debtChainId;
        address debtAsset;
        uint256 debtAmount;
        uint256 interestRate; // Annual rate in basis points
        uint256 issuedTimestamp;
        uint256 lastInterestAccrual;
        bool liquidated;
        uint256 healthFactor;
        uint256 totalDebt; // Principal + accrued interest
    }
    
    struct UniversalNFT {
        address contractAddress;
        uint256 tokenId;
        uint256 originalChainId;
        bool isLocked;
    }
    
    struct RiskProfile {
        uint256 maxLTV; // Maximum Loan-to-Value ratio in basis points
        uint256 liquidationThreshold; // Liquidation threshold in basis points
        uint256 volatilityScore; // 0-100, higher = more volatile
        uint256 lastUpdate;
    }
    
    // ==================== STATE VARIABLES ====================
    
    mapping(uint256 => CollateralPosition) public collaterals;
    mapping(uint256 => LoanPosition) public loans;
    mapping(uint256 => UniversalNFT) public universalNFTs;
    mapping(address => mapping(uint256 => bool)) public approvedTokens;
    mapping(address => mapping(uint256 => RiskProfile)) public tokenRiskProfiles;
    mapping(address => uint256[]) public userCollaterals;
    mapping(address => uint256[]) public userLoans;
    mapping(uint256 => address) public crossChainContracts; // Chain ID -> contract address
    
    uint256 public collateralCounter;
    uint256 public loanCounter;
    uint256 public nftCounter;
    
    address public aiOracle;
    address public priceOracle;
    
    // Protocol parameters
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_LIQUIDATION_THRESHOLD = 8000; // 80%
    uint256 public constant MAX_LIQUIDATION_THRESHOLD = 9500; // 95%
    uint256 public constant LIQUIDATION_PENALTY = 500; // 5%
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20%
    uint256 public constant PROTOCOL_FEE_RATE = 50; // 0.5%
    
    // Events
    event CollateralLocked(
        uint256 indexed collateralId,
        address indexed owner,
        uint256 chainId,
        address asset,
        uint256 amount,
        bool isNFT,
        bytes32 proof
    );
    
    event LoanIssued(
        uint256 indexed loanId,
        address indexed owner,
        uint256 collateralId,
        uint256 debtChainId,
        address debtAsset,
        uint256 debtAmount,
        uint256 interestRate
    );
    
    event CollateralLiquidated(
        uint256 indexed loanId,
        uint256 indexed collateralId,
        address liquidator,
        uint256 penalty
    );
    
    event CrossChainMessageSent(
        uint256 indexed targetChainId,
        address indexed targetContract,
        bytes message
    );
    
    event RiskProfileUpdated(
        address indexed asset,
        uint256 indexed chainId,
        uint256 maxLTV,
        uint256 liquidationThreshold
    );
    
    // ==================== MODIFIERS ====================
    
    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Only AI Oracle");
        _;
    }
    
    modifier onlyCrossChainContract(uint256 chainId) {
        require(msg.sender == crossChainContracts[chainId], "Only cross-chain contract");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(
        address systemContract,
        address _aiOracle,
        address _priceOracle
    ) UniversalContract(systemContract) {
        aiOracle = _aiOracle;
        priceOracle = _priceOracle;
    }
    
    // ==================== UNIVERSAL CONTRACT IMPLEMENTATION ====================
    
    /**
     * @dev Main entry point for cross-chain calls (Universal Contract pattern)
     * @param context Message context from ZetaChain
     * @param zrc20 ZRC-20 token address (if applicable)
     * @param amount Amount of tokens
     * @param message Encoded message data
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // Decode message type and data
        (bytes4 selector, bytes memory data) = abi.decode(message, (bytes4, bytes));
        
        if (selector == this.lockCollateralFromChain.selector) {
            _lockCollateralFromChain(context, zrc20, amount, data);
        } else if (selector == this.confirmLoanRepayment.selector) {
            _confirmLoanRepayment(context, data);
        } else if (selector == this.confirmCollateralTransfer.selector) {
            _confirmCollateralTransfer(context, data);
        } else if (selector == this.handleBitcoinDeposit.selector) {
            _handleBitcoinDeposit(context, data);
        }
    }
    
    // ==================== CROSS-CHAIN COLLATERAL MANAGEMENT ====================
    
    /**
     * @dev Lock collateral from external chain
     */
    function _lockCollateralFromChain(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes memory data
    ) internal {
        (address owner, address asset, uint256 tokenId, bool isNFT) = abi.decode(
            data, 
            (address, address, uint256, bool)
        );
        
        uint256 collateralId = ++collateralCounter;
        
        collaterals[collateralId] = CollateralPosition({
            owner: owner,
            chainId: context.chainID,
            asset: asset,
            amount: amount,
            tokenId: tokenId,
            isNFT: isNFT,
            lockedTimestamp: block.timestamp,
            lastPriceUpdate: block.timestamp,
            currentValue: _getAssetValue(context.chainID, asset, amount),
            proof: keccak256(abi.encodePacked(context.chainID, asset, amount, block.timestamp))
        });
        
        userCollaterals[owner].push(collateralId);
        
        if (isNFT) {
            universalNFTs[++nftCounter] = UniversalNFT({
                contractAddress: asset,
                tokenId: tokenId,
                originalChainId: context.chainID,
                isLocked: true
            });
        }
        
        emit CollateralLocked(
            collateralId, 
            owner, 
            context.chainID, 
            asset, 
            amount, 
            isNFT,
            collaterals[collateralId].proof
        );
    }
    
    /**
     * @dev Handle native Bitcoin deposits
     */
    function _handleBitcoinDeposit(
        MessageContext calldata context,
        bytes memory data
    ) internal {
        (address owner, bytes memory btcAddress, uint256 amount) = abi.decode(
            data,
            (address, bytes, uint256)
        );
        
        uint256 collateralId = ++collateralCounter;
        
        collaterals[collateralId] = CollateralPosition({
            owner: owner,
            chainId: 18332, // Bitcoin testnet chain ID
            asset: address(0), // Native BTC marker
            amount: amount,
            tokenId: 0,
            isNFT: false,
            lockedTimestamp: block.timestamp,
            lastPriceUpdate: block.timestamp,
            currentValue: _getAssetValue(18332, address(0), amount),
            proof: keccak256(abi.encodePacked(btcAddress, amount, block.timestamp))
        });
        
        userCollaterals[owner].push(collateralId);
        
        emit CollateralLocked(
            collateralId,
            owner,
            18332,
            address(0),
            amount,
            false,
            collaterals[collateralId].proof
        );
    }
    
    // ==================== LENDING OPERATIONS ====================
    
    /**
     * @dev Borrow against collateral with cross-chain minting
     */
    function borrowAgainstCollateral(
        uint256 collateralId,
        uint256 targetChainId,
        address debtAsset,
        uint256 debtAmount
    ) external nonReentrant whenNotPaused {
        CollateralPosition storage col = collaterals[collateralId];
        require(col.owner == msg.sender, "Not collateral owner");
        require(col.currentValue > 0, "Collateral value not set");
        
        // Get AI risk assessment
        RiskProfile memory risk = _getRiskProfile(col.chainId, col.asset);
        require(risk.maxLTV > 0, "Risk profile not set");
        
        // Calculate max borrow based on LTV
        uint256 maxBorrow = (col.currentValue * risk.maxLTV) / BASIS_POINTS;
        require(debtAmount <= maxBorrow, "Exceeds borrowing limit");
        
        // Calculate dynamic interest rate
        uint256 interestRate = _calculateInterestRate(risk.volatilityScore);
        
        // Create loan record
        uint256 loanId = ++loanCounter;
        loans[loanId] = LoanPosition({
            owner: msg.sender,
            collateralId: collateralId,
            debtChainId: targetChainId,
            debtAsset: debtAsset,
            debtAmount: debtAmount,
            interestRate: interestRate,
            issuedTimestamp: block.timestamp,
            lastInterestAccrual: block.timestamp,
            liquidated: false,
            healthFactor: _calculateHealthFactor(col.currentValue, debtAmount, risk.liquidationThreshold),
            totalDebt: debtAmount
        });
        
        userLoans[msg.sender].push(loanId);
        
        // Send cross-chain minting message
        _sendCrossChainMint(targetChainId, msg.sender, debtAsset, debtAmount, loanId);
        
        emit LoanIssued(
            msg.sender, 
            loanId, 
            collateralId, 
            targetChainId, 
            debtAsset, 
            debtAmount,
            interestRate
        );
    }
    
    /**
     * @dev Send cross-chain mint message
     */
    function _sendCrossChainMint(
        uint256 targetChainId,
        address recipient,
        address debtAsset,
        uint256 debtAmount,
        uint256 loanId
    ) internal {
        bytes memory message = abi.encodeWithSignature(
            "mintDebtTokens(address,address,uint256,uint256)",
            recipient,
            debtAsset,
            debtAmount,
            loanId
        );
        
        // Calculate gas requirements
        uint256 gasLimit = _estimateGasCost(targetChainId, message.length);
        
        // Send through ZetaConnector
        systemContract.interchainCall(
            targetChainId,
            crossChainContracts[targetChainId],
            gasLimit,
            message
        );
        
        emit CrossChainMessageSent(targetChainId, crossChainContracts[targetChainId], message);
    }
    
    // ==================== LIQUIDATION SYSTEM ====================
    
    /**
     * @dev Execute AI-driven liquidation
     */
    function executeLiquidation(uint256 loanId, uint256 severity) external onlyAIOracle nonReentrant {
        LoanPosition storage loan = loans[loanId];
        require(!loan.liquidated, "Already liquidated");
        
        CollateralPosition storage col = collaterals[loan.collateralId];
        require(col.currentValue > 0, "Collateral value not set");
        
        // Calculate liquidation amount based on severity
        uint256 liquidationAmount = (col.amount * severity) / 100;
        uint256 repaymentAmount = (loan.totalDebt * severity) / 100;
        
        // Execute cross-chain liquidation
        _liquidateCollateralCrossChain(loan.collateralId, liquidationAmount, col.chainId);
        
        // Update loan state
        if (severity >= 100) {
            loan.liquidated = true;
            col.currentValue = 0;
        } else {
            col.amount -= liquidationAmount;
            col.currentValue = _getAssetValue(col.chainId, col.asset, col.amount);
            loan.totalDebt -= repaymentAmount;
        }
        
        emit CollateralLiquidated(loanId, loan.collateralId, msg.sender, severity);
    }
    
    /**
     * @dev Liquidate collateral on external chain
     */
    function _liquidateCollateralCrossChain(
        uint256 collateralId,
        uint256 amount,
        uint256 targetChainId
    ) internal {
        bytes memory message = abi.encodeWithSignature(
            "liquidateCollateral(uint256,uint256,address)",
            collateralId,
            amount,
            msg.sender
        );
        
        systemContract.interchainCall(
            targetChainId,
            crossChainContracts[targetChainId],
            300000, // Gas limit
            message
        );
    }
    
    // ==================== CROSS-CHAIN CONFIRMATIONS ====================
    
    /**
     * @dev Confirm loan repayment from external chain
     */
    function _confirmLoanRepayment(
        MessageContext calldata context,
        bytes memory data
    ) internal {
        (uint256 loanId, uint256 repaidAmount) = abi.decode(data, (uint256, uint256));
        
        LoanPosition storage loan = loans[loanId];
        require(loan.owner != address(0), "Loan not found");
        
        loan.totalDebt -= repaidAmount;
        
        if (loan.totalDebt == 0) {
            // Loan fully repaid
            _releaseCollateral(loan.collateralId);
        }
    }
    
    /**
     * @dev Confirm collateral transfer from external chain
     */
    function _confirmCollateralTransfer(
        MessageContext calldata context,
        bytes memory data
    ) internal {
        (uint256 collateralId, uint256 newAmount) = abi.decode(data, (uint256, uint256));
        
        CollateralPosition storage col = collaterals[collateralId];
        require(col.owner != address(0), "Collateral not found");
        
        col.amount = newAmount;
        col.currentValue = _getAssetValue(col.chainId, col.asset, newAmount);
        col.lastPriceUpdate = block.timestamp;
        
        // Update health factors for associated loans
        _updateLoanHealthFactors(collateralId);
    }
    
    // ==================== RISK MANAGEMENT ====================
    
    /**
     * @dev Get risk profile from AI Oracle
     */
    function _getRiskProfile(uint256 chainId, address asset) internal returns (RiskProfile memory) {
        try IAIOracle(aiOracle).getRiskProfile(chainId, asset) returns (
            uint256 maxLTV,
            uint256 liquidationThreshold,
            uint256 volatilityScore
        ) {
            // Update stored profile
            tokenRiskProfiles[asset][chainId] = RiskProfile({
                maxLTV: maxLTV,
                liquidationThreshold: liquidationThreshold,
                volatilityScore: volatilityScore,
                lastUpdate: block.timestamp
            });
            
            return tokenRiskProfiles[asset][chainId];
        } catch {
            // Return stored profile or default
            RiskProfile storage profile = tokenRiskProfiles[asset][chainId];
            if (profile.lastUpdate > 0) {
                return profile;
            }
            
            // Default risk profile
            return RiskProfile({
                maxLTV: 7500, // 75%
                liquidationThreshold: 8500, // 85%
                volatilityScore: 50, // Medium
                lastUpdate: block.timestamp
            });
        }
    }
    
    /**
     * @dev Calculate dynamic interest rate
     */
    function _calculateInterestRate(uint256 volatilityScore) internal pure returns (uint256) {
        uint256 baseRate = 500; // 5% base
        uint256 volatilityAdjustment = (volatilityScore * 150) / 100; // Max 15% additional
        return baseRate + volatilityAdjustment;
    }
    
    /**
     * @dev Calculate health factor
     */
    function _calculateHealthFactor(
        uint256 collateralValue,
        uint256 debtValue,
        uint256 liquidationThreshold
    ) internal pure returns (uint256) {
        if (debtValue == 0) return type(uint256).max;
        return (collateralValue * liquidationThreshold) / (debtValue * BASIS_POINTS);
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * @dev Get asset value in USD
     */
    function _getAssetValue(
        uint256 chainId,
        address asset,
        uint256 amount
    ) internal view returns (uint256) {
        // Implementation would query price oracle
        // For now, return simplified value
        if (asset == address(0)) {
            // BTC: $40,000 per BTC
            return amount * 40000000000 / 1e8; // 8 decimals
        }
        return amount * 1e10; // Simplified 1:1 ratio with 18 decimals
    }
    
    /**
     * @dev Estimate gas cost for cross-chain operation
     */
    function _estimateGasCost(uint256 targetChainId, uint256 messageLength) internal pure returns (uint256) {
        // Base gas + message size adjustment
        return 200000 + (messageLength * 100);
    }
    
    /**
     * @dev Update loan health factors
     */
    function _updateLoanHealthFactors(uint256 collateralId) internal {
        for (uint256 i = 1; i <= loanCounter; i++) {
            LoanPosition storage loan = loans[i];
            if (loan.collateralId == collateralId && !loan.liquidated) {
                CollateralPosition storage col = collaterals[collateralId];
                RiskProfile storage risk = tokenRiskProfiles[col.asset][col.chainId];
                
                loan.healthFactor = _calculateHealthFactor(
                    col.currentValue,
                    loan.totalDebt,
                    risk.liquidationThreshold
                );
            }
        }
    }
    
    /**
     * @dev Release collateral after loan repayment
     */
    function _releaseCollateral(uint256 collateralId) internal {
        CollateralPosition storage col = collaterals[collateralId];
        col.currentValue = 0;
        
        // Send cross-chain message to release collateral
        bytes memory message = abi.encodeWithSignature(
            "releaseCollateral(uint256,address)",
            collateralId,
            col.owner
        );
        
        systemContract.interchainCall(
            col.chainId,
            crossChainContracts[col.chainId],
            200000,
            message
        );
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Set cross-chain contract address
     */
    function setCrossChainContract(uint256 chainId, address contractAddress) external onlyOwner {
        crossChainContracts[chainId] = contractAddress;
    }
    
    /**
     * @dev Update AI Oracle
     */
    function setAIOracle(address _aiOracle) external onlyOwner {
        aiOracle = _aiOracle;
    }
    
    /**
     * @dev Update price oracle
     */
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = _priceOracle;
    }
    
    /**
     * @dev Pause/unpause system
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get user position summary
     */
    function getUserPosition(address user) external view returns (
        uint256 collateralCount,
        uint256 activeLoans,
        uint256 totalCollateralValue,
        uint256 totalDebtValue
    ) {
        uint256[] memory userCollateralIds = userCollaterals[user];
        uint256[] memory userLoanIds = userLoans[user];
        
        uint256 collateralValue = 0;
        uint256 debtValue = 0;
        
        for (uint256 i = 0; i < userCollateralIds.length; i++) {
            CollateralPosition storage col = collaterals[userCollateralIds[i]];
            if (col.owner == user && col.currentValue > 0) {
                collateralValue += col.currentValue;
            }
        }
        
        for (uint256 i = 0; i < userLoanIds.length; i++) {
            LoanPosition storage loan = loans[userLoanIds[i]];
            if (loan.owner == user && !loan.liquidated) {
                debtValue += loan.totalDebt;
            }
        }
        
        return (
            userCollateralIds.length,
            userLoanIds.length,
            collateralValue,
            debtValue
        );
    }
    
    /**
     * @dev Get collateral details
     */
    function getCollateral(uint256 collateralId) external view returns (CollateralPosition memory) {
        return collaterals[collateralId];
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (LoanPosition memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Get protocol statistics
     */
    function getProtocolStats() external view returns (
        uint256 totalCollaterals,
        uint256 totalLoans,
        uint256 totalCollateralValue,
        uint256 totalDebtValue
    ) {
        uint256 collateralValue = 0;
        uint256 debtValue = 0;
        
        for (uint256 i = 1; i <= collateralCounter; i++) {
            collateralValue += collaterals[i].currentValue;
        }
        
        for (uint256 i = 1; i <= loanCounter; i++) {
            if (!loans[i].liquidated) {
                debtValue += loans[i].totalDebt;
            }
        }
        
        return (collateralCounter, loanCounter, collateralValue, debtValue);
    }
} 