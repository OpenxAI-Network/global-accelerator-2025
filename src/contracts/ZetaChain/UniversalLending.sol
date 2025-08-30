// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title AEGIS Universal Lending Contract
 * @notice Deployed on ZetaChain to manage cross-chain lending operations
 * @dev Central hub for all cross-chain collateral and loan states
 */
contract UniversalLending is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    // ============ STRUCTS ============
    
    struct Collateral {
        uint256 id;
        address user;
        uint256 amount;
        string asset;
        uint256 chainId;
        uint256 timestamp;
        bool isActive;
        uint256 lockPeriod;
        uint256 unlockTime;
        string metadata; // JSON string for additional data
    }
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 collateralId;
        uint256 amount;
        string asset;
        uint256 chainId;
        uint256 interestRate;
        uint256 dueDate;
        uint256 createdAt;
        bool isActive;
        bool isRepaid;
        bool isLiquidated;
        uint256 lastPaymentDate;
        uint256 totalPaid;
        string metadata;
    }
    
    struct CrossChainMessage {
        uint256 messageId;
        string fromChain;
        string toChain;
        string messageType;
        bytes data;
        uint256 timestamp;
        bool isProcessed;
        uint256 gasUsed;
        string status;
    }
    
    struct RiskAssessment {
        uint256 assessmentId;
        address user;
        uint256 riskScore;
        uint256 creditLimit;
        uint256 collateralRatio;
        bool isApproved;
        uint256 timestamp;
        string aiReasoning;
        string riskFactors;
    }

    // ============ STATE VARIABLES ============
    
    Counters.Counter private _collateralIds;
    Counters.Counter private _loanIds;
    Counters.Counter private _messageIds;
    Counters.Counter private _assessmentIds;
    
    address public gateway;
    address public aiOracle;
    address public treasury;
    
    uint256 public minCollateralRatio = 150; // 150% = 1.5x
    uint256 public liquidationThreshold = 125; // 125% = 1.25x
    uint256 public maxInterestRate = 50; // 50% APY
    uint256 public protocolFee = 25; // 0.25%
    
    mapping(uint256 => Collateral) public collaterals;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => CrossChainMessage) public crossChainMessages;
    mapping(uint256 => RiskAssessment) public riskAssessments;
    
    mapping(address => uint256[]) public userCollaterals;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256[]) public userAssessments;
    
    mapping(string => bool) public supportedAssets;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public authorizedOperators;
    
    // ============ EVENTS ============
    
    event CollateralDeposited(
        uint256 indexed collateralId,
        address indexed user,
        uint256 amount,
        string asset,
        uint256 chainId,
        uint256 timestamp
    );
    
    event CollateralWithdrawn(
        uint256 indexed collateralId,
        address indexed user,
        uint256 amount,
        string asset,
        uint256 timestamp
    );
    
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 collateralId,
        uint256 amount,
        string asset,
        uint256 interestRate,
        uint256 dueDate
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 timestamp
    );
    
    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed liquidator,
        uint256 amount,
        uint256 timestamp
    );
    
    event CrossChainMessageSent(
        uint256 indexed messageId,
        string fromChain,
        string toChain,
        string messageType,
        bytes data,
        uint256 timestamp
    );
    
    event CrossChainMessageProcessed(
        uint256 indexed messageId,
        string status,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event RiskAssessmentUpdated(
        uint256 indexed assessmentId,
        address indexed user,
        uint256 riskScore,
        uint256 creditLimit,
        bool isApproved
    );
    
    event ProtocolParametersUpdated(
        uint256 minCollateralRatio,
        uint256 liquidationThreshold,
        uint256 maxInterestRate,
        uint256 protocolFee
    );

    // ============ MODIFIERS ============
    
    modifier onlyGateway() {
        require(msg.sender == gateway, "UniversalLending: Not authorized gateway");
        _;
    }
    
    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "UniversalLending: Not authorized AI oracle");
        _;
    }
    
    modifier onlyAuthorizedOperator() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "UniversalLending: Not authorized");
        _;
    }
    
    modifier collateralExists(uint256 collateralId) {
        require(collaterals[collateralId].id != 0, "UniversalLending: Collateral does not exist");
        _;
    }
    
    modifier loanExists(uint256 loanId) {
        require(loans[loanId].id != 0, "UniversalLending: Loan does not exist");
        _;
    }
    
    modifier loanActive(uint256 loanId) {
        require(loans[loanId].isActive, "UniversalLending: Loan is not active");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _gateway,
        address _aiOracle,
        address _treasury
    ) {
        gateway = _gateway;
        aiOracle = _aiOracle;
        treasury = _treasury;
        
        // Initialize supported assets
        supportedAssets["ETH"] = true;
        supportedAssets["BTC"] = true;
        supportedAssets["SOL"] = true;
        supportedAssets["AVAX"] = true;
        supportedAssets["MATIC"] = true;
        supportedAssets["USDC"] = true;
        supportedAssets["USDT"] = true;
        
        // Initialize supported chains
        supportedChains[1] = true;    // Ethereum
        supportedChains[137] = true;  // Polygon
        supportedChains[56] = true;   // BSC
        supportedChains[8453] = true; // Base
        supportedChains[43114] = true; // Avalanche
        supportedChains[0] = true;    // Bitcoin (special case)
        
        // Set initial parameters
        minCollateralRatio = 150;
        liquidationThreshold = 125;
        maxInterestRate = 50;
        protocolFee = 25;
    }

    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Register collateral from external chains
     * @param user User address
     * @param amount Collateral amount
     * @param asset Asset symbol
     * @param chainId Origin chain ID
     * @param lockPeriod Lock period in seconds
     * @param metadata Additional metadata
     */
    function registerCollateral(
        address user,
        uint256 amount,
        string memory asset,
        uint256 chainId,
        uint256 lockPeriod,
        string memory metadata
    ) external onlyGateway nonReentrant whenNotPaused returns (uint256) {
        require(supportedAssets[asset], "UniversalLending: Asset not supported");
        require(supportedChains[chainId], "UniversalLending: Chain not supported");
        require(amount > 0, "UniversalLending: Amount must be greater than 0");
        require(user != address(0), "UniversalLending: Invalid user address");
        
        _collateralIds.increment();
        uint256 collateralId = _collateralIds.current();
        
        Collateral memory newCollateral = Collateral({
            id: collateralId,
            user: user,
            amount: amount,
            asset: asset,
            chainId: chainId,
            timestamp: block.timestamp,
            isActive: true,
            lockPeriod: lockPeriod,
            unlockTime: block.timestamp.add(lockPeriod),
            metadata: metadata
        });
        
        collaterals[collateralId] = newCollateral;
        userCollaterals[user].push(collateralId);
        
        emit CollateralDeposited(
            collateralId,
            user,
            amount,
            asset,
            chainId,
            block.timestamp
        );
        
        return collateralId;
    }
    
    /**
     * @notice Create a new loan with AI approval
     * @param borrower Borrower address
     * @param collateralId Collateral ID
     * @param amount Loan amount
     * @param asset Asset symbol
     * @param chainId Target chain ID
     * @param interestRate Interest rate (APY)
     * @param dueDate Due date timestamp
     * @param riskScore AI risk assessment score
     */
    function createLoan(
        address borrower,
        uint256 collateralId,
        uint256 amount,
        string memory asset,
        uint256 chainId,
        uint256 interestRate,
        uint256 dueDate,
        uint256 riskScore
    ) external onlyGateway nonReentrant whenNotPaused returns (uint256) {
        require(collateralExists(collateralId), "UniversalLending: Collateral does not exist");
        require(collaterals[collateralId].isActive, "UniversalLending: Collateral not active");
        require(collaterals[collateralId].user == borrower, "UniversalLending: Not collateral owner");
        require(amount > 0, "UniversalLending: Amount must be greater than 0");
        require(interestRate <= maxInterestRate, "UniversalLending: Interest rate too high");
        require(dueDate > block.timestamp, "UniversalLending: Invalid due date");
        require(riskScore <= 100, "UniversalLending: Invalid risk score");
        
        // Check collateral ratio
        uint256 collateralValue = collaterals[collateralId].amount;
        uint256 collateralRatio = collateralValue.mul(100).div(amount);
        require(collateralRatio >= minCollateralRatio, "UniversalLending: Insufficient collateral ratio");
        
        // Create loan
        _loanIds.increment();
        uint256 loanId = _loanIds.current();
        
        Loan memory newLoan = Loan({
            id: loanId,
            borrower: borrower,
            collateralId: collateralId,
            amount: amount,
            asset: asset,
            chainId: chainId,
            interestRate: interestRate,
            dueDate: dueDate,
            createdAt: block.timestamp,
            isActive: true,
            isRepaid: false,
            isLiquidated: false,
            lastPaymentDate: block.timestamp,
            totalPaid: 0,
            metadata: ""
        });
        
        loans[loanId] = newLoan;
        userLoans[borrower].push(loanId);
        
        // Lock collateral
        collaterals[collateralId].isActive = false;
        
        emit LoanCreated(
            loanId,
            borrower,
            collateralId,
            amount,
            asset,
            interestRate,
            dueDate
        );
        
        return loanId;
    }
    
    /**
     * @notice Process loan repayment
     * @param loanId Loan ID
     * @param amount Repayment amount
     */
    function processRepayment(
        uint256 loanId,
        uint256 amount
    ) external onlyGateway nonReentrant whenNotPaused {
        require(loanExists(loanId), "UniversalLending: Loan does not exist");
        require(loanActive(loanId), "UniversalLending: Loan is not active");
        require(amount > 0, "UniversalLending: Amount must be greater than 0");
        
        Loan storage loan = loans[loanId];
        require(amount <= loan.amount, "UniversalLending: Amount exceeds loan amount");
        
        loan.totalPaid = loan.totalPaid.add(amount);
        loan.lastPaymentDate = block.timestamp;
        
        // Check if loan is fully repaid
        if (loan.totalPaid >= loan.amount) {
            loan.isRepaid = true;
            loan.isActive = false;
            
            // Unlock collateral
            uint256 collateralId = loan.collateralId;
            collaterals[collateralId].isActive = true;
            
            emit LoanRepaid(loanId, loan.borrower, amount, block.timestamp);
        }
    }
    
    /**
     * @notice Liquidate undercollateralized loan
     * @param loanId Loan ID
     * @param liquidator Liquidator address
     */
    function liquidateLoan(
        uint256 loanId,
        address liquidator
    ) external onlyGateway nonReentrant whenNotPaused {
        require(loanExists(loanId), "UniversalLending: Loan does not exist");
        require(loanActive(loanId), "UniversalLending: Loan is not active");
        require(liquidator != address(0), "UniversalLending: Invalid liquidator");
        
        Loan storage loan = loans[loanId];
        uint256 collateralId = loan.collateralId;
        Collateral storage collateral = collaterals[collateralId];
        
        // Check if liquidation is needed
        uint256 currentCollateralRatio = collateral.amount.mul(100).div(loan.amount);
        require(currentCollateralRatio < liquidationThreshold, "UniversalLending: No liquidation needed");
        
        loan.isLiquidated = true;
        loan.isActive = false;
        
        // Transfer collateral to liquidator (minus protocol fee)
        uint256 protocolFeeAmount = collateral.amount.mul(protocolFee).div(10000);
        uint256 liquidatorAmount = collateral.amount.sub(protocolFeeAmount);
        
        // In a real implementation, you would transfer the actual tokens
        // For now, we just emit the event
        
        emit LoanLiquidated(
            loanId,
            loan.borrower,
            liquidator,
            liquidatorAmount,
            block.timestamp
        );
    }

    // ============ CROSS-CHAIN MESSAGING ============
    
    /**
     * @notice Send cross-chain message
     * @param toChain Target chain identifier
     * @param messageType Message type
     * @param data Message data
     */
    function sendCrossChainMessage(
        string memory toChain,
        string memory messageType,
        bytes memory data
    ) external onlyAuthorizedOperator whenNotPaused returns (uint256) {
        _messageIds.increment();
        uint256 messageId = _messageIds.current();
        
        CrossChainMessage memory newMessage = CrossChainMessage({
            messageId: messageId,
            fromChain: "zetachain",
            toChain: toChain,
            messageType: messageType,
            data: data,
            timestamp: block.timestamp,
            isProcessed: false,
            gasUsed: 0,
            status: "sent"
        });
        
        crossChainMessages[messageId] = newMessage;
        
        emit CrossChainMessageSent(
            messageId,
            "zetachain",
            toChain,
            messageType,
            data,
            block.timestamp
        );
        
        return messageId;
    }
    
    /**
     * @notice Process incoming cross-chain message
     * @param messageId Message ID
     * @param status Processing status
     * @param gasUsed Gas used for processing
     */
    function processCrossChainMessage(
        uint256 messageId,
        string memory status,
        uint256 gasUsed
    ) external onlyGateway whenNotPaused {
        require(crossChainMessages[messageId].messageId != 0, "UniversalLending: Message does not exist");
        require(!crossChainMessages[messageId].isProcessed, "UniversalLending: Message already processed");
        
        CrossChainMessage storage message = crossChainMessages[messageId];
        message.isProcessed = true;
        message.status = status;
        message.gasUsed = gasUsed;
        
        emit CrossChainMessageProcessed(
            messageId,
            status,
            gasUsed,
            block.timestamp
        );
    }

    // ============ AI INTEGRATION ============
    
    /**
     * @notice Update risk assessment from AI oracle
     * @param user User address
     * @param riskScore Risk score (0-100)
     * @param creditLimit Credit limit
     * @param collateralRatio Collateral ratio
     * @param isApproved Approval status
     * @param aiReasoning AI reasoning
     * @param riskFactors Risk factors
     */
    function updateRiskAssessment(
        address user,
        uint256 riskScore,
        uint256 creditLimit,
        uint256 collateralRatio,
        bool isApproved,
        string memory aiReasoning,
        string memory riskFactors
    ) external onlyAIOracle whenNotPaused returns (uint256) {
        require(user != address(0), "UniversalLending: Invalid user address");
        require(riskScore <= 100, "UniversalLending: Invalid risk score");
        
        _assessmentIds.increment();
        uint256 assessmentId = _assessmentIds.current();
        
        RiskAssessment memory newAssessment = RiskAssessment({
            assessmentId: assessmentId,
            user: user,
            riskScore: riskScore,
            creditLimit: creditLimit,
            collateralRatio: collateralRatio,
            isApproved: isApproved,
            timestamp: block.timestamp,
            aiReasoning: aiReasoning,
            riskFactors: riskFactors
        });
        
        riskAssessments[assessmentId] = newAssessment;
        userAssessments[user].push(assessmentId);
        
        emit RiskAssessmentUpdated(
            assessmentId,
            user,
            riskScore,
            creditLimit,
            isApproved
        );
        
        return assessmentId;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update protocol parameters
     * @param _minCollateralRatio New minimum collateral ratio
     * @param _liquidationThreshold New liquidation threshold
     * @param _maxInterestRate New maximum interest rate
     * @param _protocolFee New protocol fee
     */
    function updateProtocolParameters(
        uint256 _minCollateralRatio,
        uint256 _liquidationThreshold,
        uint256 _maxInterestRate,
        uint256 _protocolFee
    ) external onlyOwner {
        require(_minCollateralRatio > 100, "UniversalLending: Invalid collateral ratio");
        require(_liquidationThreshold > 100, "UniversalLending: Invalid liquidation threshold");
        require(_maxInterestRate <= 100, "UniversalLending: Invalid interest rate");
        require(_protocolFee <= 1000, "UniversalLending: Invalid protocol fee");
        
        minCollateralRatio = _minCollateralRatio;
        liquidationThreshold = _liquidationThreshold;
        maxInterestRate = _maxInterestRate;
        protocolFee = _protocolFee;
        
        emit ProtocolParametersUpdated(
            minCollateralRatio,
            liquidationThreshold,
            maxInterestRate,
            protocolFee
        );
    }
    
    /**
     * @notice Add or remove authorized operator
     * @param operator Operator address
     * @param isAuthorized Authorization status
     */
    function setAuthorizedOperator(
        address operator,
        bool isAuthorized
    ) external onlyOwner {
        require(operator != address(0), "UniversalLending: Invalid operator address");
        authorizedOperators[operator] = isAuthorized;
    }
    
    /**
     * @notice Update gateway address
     * @param _gateway New gateway address
     */
    function updateGateway(address _gateway) external onlyOwner {
        require(_gateway != address(0), "UniversalLending: Invalid gateway address");
        gateway = _gateway;
    }
    
    /**
     * @notice Update AI oracle address
     * @param _aiOracle New AI oracle address
     */
    function updateAIOracle(address _aiOracle) external onlyOwner {
        require(_aiOracle != address(0), "UniversalLending: Invalid AI oracle address");
        aiOracle = _aiOracle;
    }
    
    /**
     * @notice Pause/unpause contract
     * @param _paused Pause status
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's total collateral value
     * @param user User address
     * @return Total collateral value
     */
    function getUserTotalCollateral(address user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userCollaterals[user].length; i++) {
            uint256 collateralId = userCollaterals[user][i];
            if (collaterals[collateralId].isActive) {
                total = total.add(collaterals[collateralId].amount);
            }
        }
        return total;
    }
    
    /**
     * @notice Get user's active loans
     * @param user User address
     * @return Array of active loan IDs
     */
    function getUserActiveLoans(address user) external view returns (uint256[] memory) {
        uint256[] memory activeLoans = new uint256[](userLoans[user].length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < userLoans[user].length; i++) {
            uint256 loanId = userLoans[user][i];
            if (loans[loanId].isActive) {
                activeLoans[activeCount] = loanId;
                activeCount++;
            }
        }
        
        // Resize array to actual active count
        assembly {
            mstore(activeLoans, activeCount)
        }
        
        return activeLoans;
    }
    
    /**
     * @notice Get loan health status
     * @param loanId Loan ID
     * @return isHealthy Health status
     * @return collateralRatio Current collateral ratio
     * @return daysUntilDue Days until due date
     */
    function getLoanHealth(uint256 loanId) external view returns (
        bool isHealthy,
        uint256 collateralRatio,
        uint256 daysUntilDue
    ) {
        require(loanExists(loanId), "UniversalLending: Loan does not exist");
        
        Loan storage loan = loans[loanId];
        if (!loan.isActive) {
            return (false, 0, 0);
        }
        
        Collateral storage collateral = collaterals[loan.collateralId];
        collateralRatio = collateral.amount.mul(100).div(loan.amount);
        
        if (block.timestamp >= loan.dueDate) {
            daysUntilDue = 0;
        } else {
            daysUntilDue = loan.dueDate.sub(block.timestamp).div(1 days);
        }
        
        isHealthy = collateralRatio >= liquidationThreshold;
        
        return (isHealthy, collateralRatio, daysUntilDue);
    }
    
    /**
     * @notice Get contract statistics
     * @return totalCollaterals Total number of collaterals
     * @return totalLoans Total number of loans
     * @return activeLoans Number of active loans
     * @return totalValueLocked Total value locked
     */
    function getContractStats() external view returns (
        uint256 totalCollaterals,
        uint256 totalLoans,
        uint256 activeLoans,
        uint256 totalValueLocked
    ) {
        totalCollaterals = _collateralIds.current();
        totalLoans = _loanIds.current();
        
        for (uint256 i = 1; i <= totalLoans; i++) {
            if (loans[i].isActive) {
                activeLoans++;
                totalValueLocked = totalValueLocked.add(loans[i].amount);
            }
        }
        
        return (totalCollaterals, totalLoans, activeLoans, totalValueLocked);
    }
}
