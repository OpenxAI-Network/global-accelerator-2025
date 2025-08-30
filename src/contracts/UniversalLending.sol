// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniversalLending - ZetaChain Cross-Chain Lending Hub
 * @dev This contract acts as the "liquidity brain" for Aegis, managing lending across:
 * - ZetaChain (Hub)
 * - Solana (Non-EVM, High-Speed Layer 1)
 * - Bitcoin (UTXO Model)
 * - Base (EVM Layer 2)
 * - Avalanche (EVM-Compatible C-Chain)
 */
contract UniversalLending is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // ============ STRUCTS ============
    
    struct CrossChainAsset {
        string chainId;           // "zeta", "solana", "bitcoin", "base", "avalanche"
        string assetSymbol;       // "BTC", "SOL", "ETH", "USDC", "AVAX"
        uint256 collateralAmount; // Amount locked as collateral
        uint256 lastUpdateTime;   // Last cross-chain sync
        bool isActive;            // Asset status
    }
    
    struct Loan {
        uint256 loanId;
        address borrower;
        string collateralChain;   // Chain where collateral is locked
        string collateralAsset;   // Asset used as collateral
        uint256 collateralAmount;
        string borrowChain;       // Chain where loan is taken
        string borrowAsset;       // Asset borrowed
        uint256 borrowAmount;
        uint256 interestRate;
        uint256 startTime;
        uint256 dueTime;
        uint256 lastPaymentTime;
        uint256 totalPaid;
        LoanStatus status;
        uint256 creditScore;      // AI-generated credit score
    }
    
    struct LiquidityPool {
        string chainId;
        string assetSymbol;
        uint256 totalLiquidity;
        uint256 borrowedAmount;
        uint256 availableAmount;
        uint256 utilizationRate;
        uint256 apy;
        uint256 lastUpdateTime;
    }
    
    enum LoanStatus { PENDING, ACTIVE, REPAID, DEFAULTED, LIQUIDATED }
    enum CrossChainMessageType { DEPOSIT, WITHDRAW, LOAN_CREATE, LOAN_REPAY, LIQUIDATION }
    
    // ============ STATE VARIABLES ============
    
    Counters.Counter private _loanIds;
    Counters.Counter private _messageIds;
    
    // Cross-chain asset tracking
    mapping(address => mapping(string => CrossChainAsset)) public userAssets;
    mapping(address => string[]) public userAssetChains;
    
    // Loan management
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
    // Liquidity pools per chain
    mapping(string => mapping(string => LiquidityPool)) public liquidityPools;
    
    // Cross-chain message tracking
    mapping(uint256 => CrossChainMessage) public crossChainMessages;
    
    // Supported chains and assets
    string[] public supportedChains;
    mapping(string => string[]) public supportedAssets;
    
    // Risk parameters
    uint256 public minCollateralRatio = 150; // 150% collateralization
    uint256 public liquidationThreshold = 125; // 125% threshold
    uint256 public maxLoanAmount = 1000000 * 10**18; // 1M USDC equivalent
    
    // ============ EVENTS ============
    
    event CrossChainMessageSent(
        uint256 indexed messageId,
        string fromChain,
        string toChain,
        CrossChainMessageType messageType,
        bytes data
    );
    
    event CrossChainMessageReceived(
        uint256 indexed messageId,
        string fromChain,
        string toChain,
        CrossChainMessageType messageType,
        bytes data
    );
    
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        string collateralChain,
        string collateralAsset,
        uint256 collateralAmount,
        string borrowChain,
        string borrowAsset,
        uint256 borrowAmount,
        uint256 creditScore
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        string repayChain
    );
    
    event LiquidationTriggered(
        uint256 indexed loanId,
        address indexed borrower,
        string liquidatedAsset,
        uint256 amount
    );
    
    event AssetDeposited(
        address indexed user,
        string chainId,
        string assetSymbol,
        uint256 amount
    );
    
    event AssetWithdrawn(
        address indexed user,
        string chainId,
        string assetSymbol,
        uint256 amount
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initialize supported chains
        supportedChains = ["zeta", "solana", "bitcoin", "base", "avalanche"];
        
        // Initialize supported assets per chain
        supportedAssets["zeta"] = ["ZETA", "USDC", "ETH"];
        supportedAssets["solana"] = ["SOL", "USDC", "RAY"];
        supportedAssets["bitcoin"] = ["BTC"];
        supportedAssets["base"] = ["ETH", "USDC", "USDbC"];
        supportedAssets["avalanche"] = ["AVAX", "USDC", "WETH"];
        
        // Initialize liquidity pools
        _initializeLiquidityPools();
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Deposit collateral from any supported chain
     * @param chainId The blockchain where collateral is deposited
     * @param assetSymbol The asset symbol
     * @param amount The amount deposited
     * @param crossChainProof Proof of cross-chain deposit
     */
    function depositCrossChainCollateral(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount,
        bytes memory crossChainProof
    ) external nonReentrant {
        require(_isChainSupported(chainId), "Chain not supported");
        require(_isAssetSupported(chainId, assetSymbol), "Asset not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        // Verify cross-chain proof (in production, this would validate ZetaChain messages)
        _verifyCrossChainProof(chainId, assetSymbol, amount, crossChainProof);
        
        // Update user's cross-chain asset portfolio
        if (userAssets[msg.sender][chainId].isActive) {
            userAssets[msg.sender][chainId].collateralAmount += amount;
        } else {
            userAssets[msg.sender][chainId] = CrossChainAsset({
                chainId: chainId,
                assetSymbol: assetSymbol,
                collateralAmount: amount,
                lastUpdateTime: block.timestamp,
                isActive: true
            });
            
            userAssetChains[msg.sender].push(chainId);
        }
        
        // Update liquidity pool
        _updateLiquidityPool(chainId, assetSymbol, amount, true);
        
        emit AssetDeposited(msg.sender, chainId, assetSymbol, amount);
    }
    
    /**
     * @dev Create a cross-chain loan
     * @param collateralChain Chain where collateral is locked
     * @param collateralAsset Asset used as collateral
     * @param borrowChain Chain where loan is taken
     * @param borrowAsset Asset to borrow
     * @param borrowAmount Amount to borrow
     */
    function createCrossChainLoan(
        string memory collateralChain,
        string memory collateralAsset,
        string memory borrowChain,
        string memory borrowAsset,
        uint256 borrowAmount
    ) external nonReentrant returns (uint256) {
        require(_isChainSupported(collateralChain), "Collateral chain not supported");
        require(_isChainSupported(borrowChain), "Borrow chain not supported");
        require(borrowAmount > 0, "Borrow amount must be greater than 0");
        require(borrowAmount <= maxLoanAmount, "Borrow amount exceeds maximum");
        
        // Check collateral availability
        CrossChainAsset memory collateral = userAssets[msg.sender][collateralChain];
        require(collateral.isActive, "No collateral on specified chain");
        require(collateral.assetSymbol == collateralAsset, "Asset mismatch");
        
        // Calculate collateral ratio
        uint256 collateralValue = _calculateCollateralValue(collateralChain, collateralAsset, collateral.collateralAmount);
        uint256 borrowValue = _calculateBorrowValue(borrowChain, borrowAsset, borrowAmount);
        uint256 collateralRatio = (collateralValue * 100) / borrowValue;
        
        require(collateralRatio >= minCollateralRatio, "Insufficient collateral ratio");
        
        // Check liquidity availability
        require(_checkLiquidityAvailability(borrowChain, borrowAsset, borrowAmount), "Insufficient liquidity");
        
        // Generate AI credit score (in production, this would call Gemini AI)
        uint256 creditScore = _generateCreditScore(msg.sender, collateralChain, borrowChain);
        require(creditScore >= 650, "Credit score too low");
        
        // Create loan
        _loanIds.increment();
        uint256 loanId = _loanIds.current();
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            collateralChain: collateralChain,
            collateralAsset: collateralAsset,
            collateralAmount: collateral.collateralAmount,
            borrowChain: borrowChain,
            borrowAsset: borrowAsset,
            borrowAmount: borrowAmount,
            interestRate: _calculateInterestRate(creditScore, borrowChain, borrowAsset),
            startTime: block.timestamp,
            dueTime: block.timestamp + 30 days, // 30-day loan term
            lastPaymentTime: block.timestamp,
            totalPaid: 0,
            status: LoanStatus.ACTIVE,
            creditScore: creditScore
        });
        
        userLoans[msg.sender].push(loanId);
        
        // Update liquidity pool
        _updateLiquidityPool(borrowChain, borrowAsset, borrowAmount, false);
        
        // Send cross-chain message to borrow chain
        _sendCrossChainMessage(borrowChain, CrossChainMessageType.LOAN_CREATE, abi.encode(loanId, msg.sender, borrowAmount));
        
        emit LoanCreated(
            loanId,
            msg.sender,
            collateralChain,
            collateralAsset,
            collateral.collateralAmount,
            borrowChain,
            borrowAsset,
            borrowAmount,
            creditScore
        );
        
        return loanId;
    }
    
    /**
     * @dev Repay loan on any supported chain
     * @param loanId The loan ID to repay
     * @param repayAmount Amount to repay
     * @param repayChain Chain where repayment is made
     */
    function repayCrossChainLoan(
        uint256 loanId,
        uint256 repayAmount,
        string memory repayChain
    ) external nonReentrant {
        require(_isChainSupported(repayChain), "Repay chain not supported");
        
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.status == LoanStatus.ACTIVE, "Loan not active");
        require(repayAmount > 0, "Repay amount must be greater than 0");
        
        // Calculate repayment details
        uint256 totalDue = _calculateTotalDue(loanId);
        uint256 remainingBalance = totalDue - loan.totalPaid;
        
        if (repayAmount >= remainingBalance) {
            // Full repayment
            loan.status = LoanStatus.REPAID;
            loan.totalPaid = totalDue;
        } else {
            // Partial repayment
            loan.totalPaid += repayAmount;
        }
        
        loan.lastPaymentTime = block.timestamp;
        
        // Update liquidity pool
        _updateLiquidityPool(repayChain, loan.borrowAsset, repayAmount, true);
        
        // Send cross-chain message
        _sendCrossChainMessage(repayChain, CrossChainMessageType.LOAN_REPAY, abi.encode(loanId, repayAmount));
        
        emit LoanRepaid(loanId, msg.sender, repayAmount, repayChain);
    }
    
    /**
     * @dev Liquidate undercollateralized loans
     * @param loanId The loan ID to liquidate
     */
    function liquidateLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "Loan not active");
        
        // Check if loan is undercollateralized
        uint256 collateralValue = _calculateCollateralValue(loan.collateralChain, loan.collateralAsset, loan.collateralAmount);
        uint256 borrowValue = _calculateBorrowValue(loan.borrowChain, loan.borrowAsset, loan.borrowAmount);
        uint256 currentRatio = (collateralValue * 100) / borrowValue;
        
        require(currentRatio < liquidationThreshold, "Loan not undercollateralized");
        
        // Mark loan as liquidated
        loan.status = LoanStatus.LIQUIDATED;
        
        // Calculate liquidation bonus (5% for liquidator)
        uint256 liquidationBonus = (loan.collateralAmount * 5) / 100;
        
        // Transfer collateral to liquidator
        // In production, this would trigger cross-chain transfers
        
        // Send cross-chain liquidation message
        _sendCrossChainMessage(loan.collateralChain, CrossChainMessageType.LIQUIDATION, abi.encode(loanId, msg.sender, liquidationBonus));
        
        emit LiquidationTriggered(loanId, loan.borrower, loan.collateralAsset, loan.collateralAmount);
    }
    
    // ============ CROSS-CHAIN MESSAGING ============
    
    /**
     * @dev Send cross-chain message to other blockchains
     */
    function _sendCrossChainMessage(
        string memory targetChain,
        CrossChainMessageType messageType,
        bytes memory data
    ) internal {
        _messageIds.increment();
        uint256 messageId = _messageIds.current();
        
        CrossChainMessage memory message = CrossChainMessage({
            messageId: messageId,
            fromChain: "zeta",
            toChain: targetChain,
            messageType: messageType,
            data: data,
            timestamp: block.timestamp,
            status: MessageStatus.PENDING
        });
        
        crossChainMessages[messageId] = message;
        
        emit CrossChainMessageSent(messageId, "zeta", targetChain, messageType, data);
        
        // In production, this would trigger ZetaChain's cross-chain messaging system
        // _triggerZetaChainMessage(targetChain, messageType, data);
    }
    
    /**
     * @dev Receive cross-chain message from other blockchains
     */
    function receiveCrossChainMessage(
        string memory fromChain,
        CrossChainMessageType messageType,
        bytes memory data
    ) external onlyOwner {
        _messageIds.increment();
        uint256 messageId = _messageIds.current();
        
        CrossChainMessage memory message = CrossChainMessage({
            messageId: messageId,
            fromChain: fromChain,
            toChain: "zeta",
            messageType: messageType,
            data: data,
            timestamp: block.timestamp,
            status: MessageStatus.RECEIVED
        });
        
        crossChainMessages[messageId] = message;
        
        emit CrossChainMessageReceived(messageId, fromChain, "zeta", messageType, data);
        
        // Process the message based on type
        _processCrossChainMessage(message);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's cross-chain portfolio
     */
    function getUserPortfolio(address user) external view returns (CrossChainAsset[] memory) {
        string[] memory userChains = userAssetChains[user];
        CrossChainAsset[] memory portfolio = new CrossChainAsset[](userChains.length);
        
        for (uint256 i = 0; i < userChains.length; i++) {
            portfolio[i] = userAssets[user][userChains[i]];
        }
        
        return portfolio;
    }
    
    /**
     * @dev Get user's active loans
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Get liquidity pool status
     */
    function getLiquidityPool(string memory chainId, string memory assetSymbol) external view returns (LiquidityPool memory) {
        return liquidityPools[chainId][assetSymbol];
    }
    
    /**
     * @dev Get supported chains
     */
    function getSupportedChains() external view returns (string[] memory) {
        return supportedChains;
    }
    
    /**
     * @dev Get supported assets for a chain
     */
    function getSupportedAssets(string memory chainId) external view returns (string[] memory) {
        return supportedAssets[chainId];
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _isChainSupported(string memory chainId) internal view returns (bool) {
        for (uint256 i = 0; i < supportedChains.length; i++) {
            if (keccak256(bytes(supportedChains[i])) == keccak256(bytes(chainId))) {
                return true;
            }
        }
        return false;
    }
    
    function _isAssetSupported(string memory chainId, string memory assetSymbol) internal view returns (bool) {
        string[] memory assets = supportedAssets[chainId];
        for (uint256 i = 0; i < assets.length; i++) {
            if (keccak256(bytes(assets[i])) == keccak256(bytes(assetSymbol))) {
                return true;
            }
        }
        return false;
    }
    
    function _initializeLiquidityPools() internal {
        // Initialize liquidity pools for each chain and asset
        for (uint256 i = 0; i < supportedChains.length; i++) {
            string memory chainId = supportedChains[i];
            string[] memory assets = supportedAssets[chainId];
            
            for (uint256 j = 0; j < assets.length; j++) {
                string memory asset = assets[j];
                
                liquidityPools[chainId][asset] = LiquidityPool({
                    chainId: chainId,
                    assetSymbol: asset,
                    totalLiquidity: 1000000 * 10**18, // 1M initial liquidity
                    borrowedAmount: 0,
                    availableAmount: 1000000 * 10**18,
                    utilizationRate: 0,
                    apy: _getDefaultAPY(chainId, asset),
                    lastUpdateTime: block.timestamp
                });
            }
        }
    }
    
    function _getDefaultAPY(string memory chainId, string memory asset) internal pure returns (uint256) {
        // Default APY rates (in basis points, 100 = 1%)
        if (keccak256(bytes(asset)) == keccak256(bytes("USDC"))) {
            return 500; // 5% APY for stablecoins
        } else if (keccak256(bytes(asset)) == keccak256(bytes("ETH")) || 
                   keccak256(bytes(asset)) == keccak256(bytes("BTC"))) {
            return 300; // 3% APY for major cryptocurrencies
        } else {
            return 400; // 4% APY for other assets
        }
    }
    
    function _updateLiquidityPool(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount,
        bool isDeposit
    ) internal {
        LiquidityPool storage pool = liquidityPools[chainId][assetSymbol];
        
        if (isDeposit) {
            pool.totalLiquidity += amount;
            pool.availableAmount += amount;
        } else {
            pool.borrowedAmount += amount;
            pool.availableAmount -= amount;
        }
        
        pool.utilizationRate = (pool.borrowedAmount * 10000) / pool.totalLiquidity;
        pool.lastUpdateTime = block.timestamp;
    }
    
    function _checkLiquidityAvailability(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount
    ) internal view returns (bool) {
        LiquidityPool memory pool = liquidityPools[chainId][assetSymbol];
        return pool.availableAmount >= amount;
    }
    
    function _calculateCollateralValue(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount
    ) internal pure returns (uint256) {
        // In production, this would fetch real-time prices from oracles
        // For demo purposes, using fixed conversion rates
        if (keccak256(bytes(assetSymbol)) == keccak256(bytes("BTC"))) {
            return amount * 45000; // 1 BTC = $45,000
        } else if (keccak256(bytes(assetSymbol)) == keccak256(bytes("ETH"))) {
            return amount * 3000; // 1 ETH = $3,000
        } else if (keccak256(bytes(assetSymbol)) == keccak256(bytes("SOL"))) {
            return amount * 100; // 1 SOL = $100
        } else if (keccak256(bytes(assetSymbol)) == keccak256(bytes("AVAX"))) {
            return amount * 25; // 1 AVAX = $25
        } else {
            return amount; // Stablecoins
        }
    }
    
    function _calculateBorrowValue(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount
    ) internal pure returns (uint256) {
        // Similar to collateral value calculation
        return _calculateCollateralValue(chainId, assetSymbol, amount);
    }
    
    function _calculateInterestRate(
        uint256 creditScore,
        string memory chainId,
        string memory assetSymbol
    ) internal pure returns (uint256) {
        // Base interest rate (in basis points, 100 = 1%)
        uint256 baseRate = 800; // 8% base rate
        
        // Credit score adjustment
        if (creditScore >= 800) {
            baseRate -= 200; // -2% for excellent credit
        } else if (creditScore >= 700) {
            baseRate -= 100; // -1% for good credit
        } else if (creditScore < 650) {
            baseRate += 200; // +2% for poor credit
        }
        
        // Chain-specific adjustments
        if (keccak256(bytes(chainId)) == keccak256(bytes("base"))) {
            baseRate -= 50; // -0.5% for Base (lower fees)
        } else if (keccak256(bytes(chainId)) == keccak256(bytes("avalanche"))) {
            baseRate -= 25; // -0.25% for Avalanche
        }
        
        return baseRate;
    }
    
    function _calculateTotalDue(uint256 loanId) internal view returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowAmount * loan.interestRate * timeElapsed) / (365 days * 10000);
        return loan.borrowAmount + interest;
    }
    
    function _generateCreditScore(
        address user,
        string memory collateralChain,
        string memory borrowChain
    ) internal view returns (uint256) {
        // In production, this would call Gemini AI for credit scoring
        // For demo purposes, generating a score based on user's portfolio
        
        uint256 baseScore = 700;
        
        // Add points for having collateral on multiple chains
        string[] memory userChains = userAssetChains[user];
        if (userChains.length > 1) {
            baseScore += 50;
        }
        
        // Add points for having collateral on the same chain as borrowing
        if (keccak256(bytes(collateralChain)) == keccak256(bytes(borrowChain))) {
            baseScore += 25;
        }
        
        // Add points for having multiple assets
        uint256 totalAssets = 0;
        for (uint256 i = 0; i < userChains.length; i++) {
            if (userAssets[user][userChains[i]].isActive) {
                totalAssets++;
            }
        }
        if (totalAssets > 1) {
            baseScore += 25;
        }
        
        // Ensure score is within valid range
        if (baseScore > 850) baseScore = 850;
        if (baseScore < 600) baseScore = 600;
        
        return baseScore;
    }
    
    function _verifyCrossChainProof(
        string memory chainId,
        string memory assetSymbol,
        uint256 amount,
        bytes memory proof
    ) internal pure {
        // In production, this would validate ZetaChain cross-chain proofs
        // For demo purposes, accepting all proofs
        require(proof.length > 0, "Invalid proof");
    }
    
    function _processCrossChainMessage(CrossChainMessage memory message) internal {
        // Process incoming cross-chain messages
        // This would handle updates from other chains
        if (message.messageType == CrossChainMessageType.DEPOSIT) {
            // Process deposit confirmation
        } else if (message.messageType == CrossChainMessageType.LOAN_REPAY) {
            // Process loan repayment confirmation
        } else if (message.messageType == CrossChainMessageType.LIQUIDATION) {
            // Process liquidation confirmation
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update risk parameters
     */
    function updateRiskParameters(
        uint256 _minCollateralRatio,
        uint256 _liquidationThreshold,
        uint256 _maxLoanAmount
    ) external onlyOwner {
        minCollateralRatio = _minCollateralRatio;
        liquidationThreshold = _liquidationThreshold;
        maxLoanAmount = _maxLoanAmount;
    }
    
    /**
     * @dev Add new supported chain
     */
    function addSupportedChain(string memory chainId, string[] memory assets) external onlyOwner {
        require(!_isChainSupported(chainId), "Chain already supported");
        supportedChains.push(chainId);
        supportedAssets[chainId] = assets;
        
        // Initialize liquidity pools for new chain
        for (uint256 i = 0; i < assets.length; i++) {
            liquidityPools[chainId][assets[i]] = LiquidityPool({
                chainId: chainId,
                assetSymbol: assets[i],
                totalLiquidity: 1000000 * 10**18,
                borrowedAmount: 0,
                availableAmount: 1000000 * 10**18,
                utilizationRate: 0,
                apy: _getDefaultAPY(chainId, assets[i]),
                lastUpdateTime: block.timestamp
            });
        }
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
    }
}

// Additional structs for cross-chain messaging
struct CrossChainMessage {
    uint256 messageId;
    string fromChain;
    string toChain;
    CrossChainMessageType messageType;
    bytes data;
    uint256 timestamp;
    MessageStatus status;
}

enum MessageStatus { PENDING, SENT, RECEIVED, PROCESSED, FAILED }
