// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTLoanIssuer
 * @dev Cross-chain NFT lending with AI-powered risk assessment
 * @author Aegis AI Team
 */
contract NFTLoanIssuer is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
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

    interface IAIRiskEngine {
        function assessLoanRisk(
            address nftContract,
            uint256 tokenId,
            uint256 loanAmount,
            address borrower
        ) external view returns (
            uint256 riskScore,
            bool isApproved,
            string memory reason
        );
    }

    // =============================================================================
    // STRUCTS
    // =============================================================================

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 collateralPositionId;
        uint256 collateralChainId;
        address nftContract;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 originationFee;
        uint256 totalRepayAmount;
        uint256 issuedAt;
        uint256 dueDate;
        uint256 lastPaymentDate;
        uint256 amountPaid;
        LoanStatus status;
        bool isCrossChain;
        string metadataURI;
    }

    struct LoanTerms {
        uint256 minLoanAmount;
        uint256 maxLoanAmount;
        uint256 minLoanDuration;
        uint256 maxLoanDuration;
        uint256 baseInterestRate;
        uint256 originationFeeRate;
        uint256 maxLTV;
        uint256 liquidationThreshold;
        bool requiresCollateral;
    }

    struct CrossChainLoanRequest {
        uint256 requestId;
        uint256 collateralPositionId;
        uint256 collateralChainId;
        address nftContract;
        uint256 tokenId;
        uint256 requestedAmount;
        address borrower;
        uint256 timestamp;
        bool processed;
        bool approved;
        string rejectionReason;
    }

    enum LoanStatus {
        PENDING,
        ACTIVE,
        REPAID,
        DEFAULTED,
        LIQUIDATED,
        CANCELLED
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    ICrossChainGateway public crossChainGateway;
    IAIRiskEngine public aiRiskEngine;
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(uint256 => CrossChainLoanRequest) public crossChainRequests;
    mapping(address => LoanTerms) public loanTerms;
    
    Counters.Counter private _loanCounter;
    Counters.Counter private _requestCounter;
    
    uint256 public constant MIN_LOAN_AMOUNT = 100 * 10**18; // 100 USDC
    uint256 public constant MAX_LOAN_AMOUNT = 1000000 * 10**18; // 1M USDC
    uint256 public constant MIN_LOAN_DURATION = 7 days;
    uint256 public constant MAX_LOAN_DURATION = 365 days;
    uint256 public constant BASE_INTEREST_RATE = 1200; // 12% APY (basis points)
    uint256 public constant ORIGINATION_FEE_RATE = 200; // 2% (basis points)
    uint256 public constant MAX_LTV = 70; // 70% LTV
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% LTV
    
    uint256 public totalLoansIssued;
    uint256 public totalActiveLoans;
    uint256 public totalLoansRepaid;
    uint256 public totalLoansDefaulted;
    uint256 public totalLoansLiquidated;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event LoanIssued(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 dueDate
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 remainingBalance
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 daysOverdue
    );

    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        string reason
    );

    event CrossChainLoanRequested(
        uint256 indexed requestId,
        uint256 collateralPositionId,
        uint256 collateralChainId,
        address indexed borrower,
        uint256 amount
    );

    event CrossChainLoanProcessed(
        uint256 indexed requestId,
        bool approved,
        string reason
    );

    event LoanTermsUpdated(
        address indexed nftContract,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 interestRate
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyLoanOwner(uint256 loanId) {
        require(loans[loanId].borrower == msg.sender, "Not loan owner");
        _;
    }

    modifier loanExists(uint256 loanId) {
        require(loans[loanId].borrower != address(0), "Loan does not exist");
        _;
    }

    modifier loanActive(uint256 loanId) {
        require(loans[loanId].status == LoanStatus.ACTIVE, "Loan not active");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(
        address _crossChainGateway,
        address _aiRiskEngine
    ) {
        crossChainGateway = ICrossChainGateway(_crossChainGateway);
        aiRiskEngine = IAIRiskEngine(_aiRiskEngine);
    }

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * @dev Issue a loan against NFT collateral
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param loanAmount Requested loan amount
     * @param loanDuration Duration of the loan in seconds
     * @param metadataURI URI for loan metadata
     */
    function issueLoan(
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        uint256 loanDuration,
        string calldata metadataURI
    ) external nonReentrant whenNotPaused {
        require(nftContract != address(0), "Invalid NFT contract");
        require(loanAmount >= MIN_LOAN_AMOUNT, "Loan amount too low");
        require(loanAmount <= MAX_LOAN_AMOUNT, "Loan amount too high");
        require(loanDuration >= MIN_LOAN_DURATION, "Loan duration too short");
        require(loanDuration <= MAX_LOAN_DURATION, "Loan duration too long");

        // Get loan terms for this NFT contract
        LoanTerms memory terms = loanTerms[nftContract];
        if (terms.minLoanAmount > 0) {
            require(loanAmount >= terms.minLoanAmount, "Below minimum loan amount");
            require(loanAmount <= terms.maxLoanAmount, "Above maximum loan amount");
        }

        // AI risk assessment
        (uint256 riskScore, bool isApproved, string memory reason) = aiRiskEngine.assessLoanRisk(
            nftContract,
            tokenId,
            loanAmount,
            msg.sender
        );
        require(isApproved, string(abi.encodePacked("Loan rejected: ", reason)));

        // Calculate loan terms
        uint256 interestRate = _calculateInterestRate(riskScore, terms);
        uint256 originationFee = loanAmount.mul(ORIGINATION_FEE_RATE).div(10000);
        uint256 totalRepayAmount = loanAmount.add(
            loanAmount.mul(interestRate).mul(loanDuration).div(365 days).div(10000)
        );

        // Create loan
        uint256 loanId = _loanCounter.current();
        _loanCounter.increment();

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            collateralPositionId: 0, // Will be set for cross-chain loans
            collateralChainId: 0,
            nftContract: nftContract,
            tokenId: tokenId,
            loanAmount: loanAmount,
            interestRate: interestRate,
            originationFee: originationFee,
            totalRepayAmount: totalRepayAmount,
            issuedAt: block.timestamp,
            dueDate: block.timestamp.add(loanDuration),
            lastPaymentDate: block.timestamp,
            amountPaid: 0,
            status: LoanStatus.ACTIVE,
            isCrossChain: false,
            metadataURI: metadataURI
        });

        userLoans[msg.sender].push(loanId);
        totalLoansIssued = totalLoansIssued.add(1);
        totalActiveLoans = totalActiveLoans.add(1);

        // Transfer loan amount to borrower
        IERC20(msg.sender).safeTransfer(msg.sender, loanAmount);

        emit LoanIssued(loanId, msg.sender, loanAmount, interestRate, block.timestamp.add(loanDuration));
    }

    /**
     * @dev Process cross-chain loan request
     * @param collateralPositionId ID of the collateral position on source chain
     * @param collateralChainId Source chain ID
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param requestedAmount Requested loan amount
     * @param borrower Borrower address
     * @param metadataURI URI for loan metadata
     */
    function processCrossChainLoanRequest(
        uint256 collateralPositionId,
        uint256 collateralChainId,
        address nftContract,
        uint256 tokenId,
        uint256 requestedAmount,
        address borrower,
        string calldata metadataURI
    ) external nonReentrant whenNotPaused {
        require(collateralPositionId > 0, "Invalid collateral position ID");
        require(collateralChainId > 0, "Invalid collateral chain ID");
        require(borrower != address(0), "Invalid borrower address");

        // Create cross-chain request
        uint256 requestId = _requestCounter.current();
        _requestCounter.increment();

        crossChainRequests[requestId] = CrossChainLoanRequest({
            requestId: requestId,
            collateralPositionId: collateralPositionId,
            collateralChainId: collateralChainId,
            nftContract: nftContract,
            tokenId: tokenId,
            requestedAmount: requestedAmount,
            borrower: borrower,
            timestamp: block.timestamp,
            processed: false,
            approved: false,
            rejectionReason: ""
        });

        // AI risk assessment
        (uint256 riskScore, bool isApproved, string memory reason) = aiRiskEngine.assessLoanRisk(
            nftContract,
            tokenId,
            requestedAmount,
            borrower
        );

        if (isApproved) {
            // Issue the loan
            _issueCrossChainLoan(requestId, requestedAmount, metadataURI);
        } else {
            // Reject the loan
            crossChainRequests[requestId].processed = true;
            crossChainRequests[requestId].rejectionReason = reason;

            // Send rejection message back to source chain
            _sendCrossChainMessage(collateralChainId, _createLoanRejectionPayload(requestId, reason));
        }

        emit CrossChainLoanRequested(requestId, collateralPositionId, collateralChainId, borrower, requestedAmount);
        emit CrossChainLoanProcessed(requestId, isApproved, reason);
    }

    /**
     * @dev Repay loan (partial or full)
     * @param loanId ID of the loan
     * @param amount Amount to repay
     */
    function repayLoan(uint256 loanId, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyLoanOwner(loanId) 
        loanExists(loanId) 
        loanActive(loanId) 
    {
        Loan storage loan = loans[loanId];
        require(amount > 0, "Invalid repayment amount");
        require(amount <= loan.totalRepayAmount.sub(loan.amountPaid), "Amount exceeds remaining balance");

        // Transfer payment from borrower
        IERC20(msg.sender).safeTransferFrom(msg.sender, address(this), amount);

        // Update loan state
        loan.amountPaid = loan.amountPaid.add(amount);
        loan.lastPaymentDate = block.timestamp;

        // Check if loan is fully repaid
        if (loan.amountPaid >= loan.totalRepayAmount) {
            loan.status = LoanStatus.REPAID;
            totalActiveLoans = totalActiveLoans.sub(1);
            totalLoansRepaid = totalLoansRepaid.add(1);

            // If cross-chain loan, send unlock message
            if (loan.isCrossChain) {
                _sendCrossChainMessage(
                    loan.collateralChainId, 
                    _createLoanRepaymentPayload(loanId, loan.collateralPositionId)
                );
            }
        }

        emit LoanRepaid(loanId, msg.sender, amount, loan.totalRepayAmount.sub(loan.amountPaid));
    }

    /**
     * @dev Liquidate defaulted loan
     * @param loanId ID of the loan
     * @param reason Reason for liquidation
     */
    function liquidateLoan(uint256 loanId, string calldata reason) 
        external 
        onlyOwner 
        loanExists(loanId) 
        loanActive(loanId) 
    {
        Loan storage loan = loans[loanId];
        require(_isLoanDefaulted(loanId), "Loan not defaulted");

        loan.status = LoanStatus.LIQUIDATED;
        totalActiveLoans = totalActiveLoans.sub(1);
        totalLoansLiquidated = totalLoansLiquidated.add(1);

        // If cross-chain loan, send liquidation message
        if (loan.isCrossChain) {
            _sendCrossChainMessage(
                loan.collateralChainId, 
                _createLoanLiquidationPayload(loanId, loan.collateralPositionId, reason)
            );
        }

        emit LoanLiquidated(loanId, loan.borrower, loan.loanAmount, reason);
    }

    // =============================================================================
    // CROSS-CHAIN INTEGRATION
    // =============================================================================

    /**
     * @dev Issue cross-chain loan after approval
     * @param requestId ID of the cross-chain request
     * @param loanAmount Approved loan amount
     * @param metadataURI URI for loan metadata
     */
    function _issueCrossChainLoan(uint256 requestId, uint256 loanAmount, string memory metadataURI) internal {
        CrossChainLoanRequest storage request = crossChainRequests[requestId];
        request.processed = true;
        request.approved = true;

        // Calculate loan terms
        uint256 interestRate = BASE_INTEREST_RATE;
        uint256 originationFee = loanAmount.mul(ORIGINATION_FEE_RATE).div(10000);
        uint256 totalRepayAmount = loanAmount.add(
            loanAmount.mul(interestRate).mul(365 days).div(365 days).div(10000)
        );

        // Create loan
        uint256 loanId = _loanCounter.current();
        _loanCounter.increment();

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: request.borrower,
            collateralPositionId: request.collateralPositionId,
            collateralChainId: request.collateralChainId,
            nftContract: request.nftContract,
            tokenId: request.tokenId,
            loanAmount: loanAmount,
            interestRate: interestRate,
            originationFee: originationFee,
            totalRepayAmount: totalRepayAmount,
            issuedAt: block.timestamp,
            dueDate: block.timestamp.add(365 days),
            lastPaymentDate: block.timestamp,
            amountPaid: 0,
            status: LoanStatus.ACTIVE,
            isCrossChain: true,
            metadataURI: metadataURI
        });

        userLoans[request.borrower].push(loanId);
        totalLoansIssued = totalLoansIssued.add(1);
        totalActiveLoans = totalActiveLoans.add(1);

        // Transfer loan amount to borrower
        IERC20(request.borrower).safeTransfer(request.borrower, loanAmount);

        // Send approval message to source chain
        _sendCrossChainMessage(
            request.collateralChainId, 
            _createLoanApprovalPayload(requestId, loanId, loanAmount)
        );

        emit LoanIssued(loanId, request.borrower, loanAmount, interestRate, block.timestamp.add(365 days));
    }

    /**
     * @dev Send cross-chain message via ZetaChain
     * @param destChainId Destination chain ID
     * @param payload Message payload
     */
    function _sendCrossChainMessage(uint256 destChainId, bytes memory payload) internal {
        crossChainGateway.sendCrossChainMessage(destChainId, payload);
    }

    // =============================================================================
    // PAYLOAD CREATION
    // =============================================================================

    function _createLoanApprovalPayload(
        uint256 requestId,
        uint256 loanId,
        uint256 loanAmount
    ) internal pure returns (bytes memory) {
        return abi.encode("LOAN_APPROVED", requestId, loanId, loanAmount);
    }

    function _createLoanRejectionPayload(
        uint256 requestId,
        string memory reason
    ) internal pure returns (bytes memory) {
        return abi.encode("LOAN_REJECTED", requestId, reason);
    }

    function _createLoanRepaymentPayload(
        uint256 loanId,
        uint256 collateralPositionId
    ) internal pure returns (bytes memory) {
        return abi.encode("LOAN_REPAID", loanId, collateralPositionId);
    }

    function _createLoanLiquidationPayload(
        uint256 loanId,
        uint256 collateralPositionId,
        string memory reason
    ) internal pure returns (bytes memory) {
        return abi.encode("LOAN_LIQUIDATED", loanId, collateralPositionId, reason);
    }

    // =============================================================================
    // HELPER FUNCTIONS
    // =============================================================================

    /**
     * @dev Calculate interest rate based on risk score
     * @param riskScore AI-generated risk score (0-100)
     * @param terms Custom loan terms for NFT contract
     * @return uint256 Calculated interest rate
     */
    function _calculateInterestRate(uint256 riskScore, LoanTerms memory terms) internal view returns (uint256) {
        uint256 baseRate = terms.baseInterestRate > 0 ? terms.baseInterestRate : BASE_INTEREST_RATE;
        
        // Adjust rate based on risk score (higher risk = higher rate)
        if (riskScore > 80) {
            return baseRate.mul(150).div(100); // 50% increase for high risk
        } else if (riskScore > 60) {
            return baseRate.mul(125).div(100); // 25% increase for medium risk
        } else {
            return baseRate; // Base rate for low risk
        }
    }

    /**
     * @dev Check if loan is defaulted
     * @param loanId ID of the loan
     * @return bool True if loan is defaulted
     */
    function _isLoanDefaulted(uint256 loanId) internal view returns (bool) {
        Loan storage loan = loans[loanId];
        return block.timestamp > loan.dueDate && loan.amountPaid < loan.totalRepayAmount;
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @dev Get user's loans
     * @param user User address
     * @return uint256[] Array of loan IDs
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    /**
     * @dev Get loan details
     * @param loanId ID of the loan
     * @return Loan Loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @dev Get cross-chain request details
     * @param requestId ID of the request
     * @return CrossChainLoanRequest Request details
     */
    function getCrossChainRequest(uint256 requestId) external view returns (CrossChainLoanRequest memory) {
        return crossChainRequests[requestId];
    }

    /**
     * @dev Get loan terms for NFT contract
     * @param nftContract Address of the NFT contract
     * @return LoanTerms Loan terms
     */
    function getLoanTerms(address nftContract) external view returns (LoanTerms memory) {
        return loanTerms[nftContract];
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Update loan terms for specific NFT contract
     * @param nftContract Address of the NFT contract
     * @param minAmount Minimum loan amount
     * @param maxAmount Maximum loan amount
     * @param minDuration Minimum loan duration
     * @param maxDuration Maximum loan duration
     * @param interestRate Base interest rate
     * @param originationFeeRate Origination fee rate
     * @param maxLTV Maximum loan-to-value ratio
     * @param liquidationThreshold Liquidation threshold
     * @param requiresCollateral Whether collateral is required
     */
    function updateLoanTerms(
        address nftContract,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 interestRate,
        uint256 originationFeeRate,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        bool requiresCollateral
    ) external onlyOwner {
        require(nftContract != address(0), "Invalid NFT contract");
        require(minAmount <= maxAmount, "Invalid amount range");
        require(minDuration <= maxDuration, "Invalid duration range");
        require(interestRate <= 5000, "Interest rate too high"); // Max 50% APY
        require(originationFeeRate <= 1000, "Origination fee too high"); // Max 10%
        require(maxLTV <= 90, "LTV too high"); // Max 90%
        require(liquidationThreshold <= 95, "Liquidation threshold too high"); // Max 95%

        loanTerms[nftContract] = LoanTerms({
            minLoanAmount: minAmount,
            maxLoanAmount: maxAmount,
            minLoanDuration: minDuration,
            maxLoanDuration: maxDuration,
            baseInterestRate: interestRate,
            originationFeeRate: originationFeeRate,
            maxLTV: maxLTV,
            liquidationThreshold: liquidationThreshold,
            requiresCollateral: requiresCollateral
        });

        emit LoanTermsUpdated(nftContract, minAmount, maxAmount, interestRate);
    }

    /**
     * @dev Update cross-chain gateway address
     * @param newGateway New gateway address
     */
    function updateCrossChainGateway(address newGateway) external onlyOwner {
        require(newGateway != address(0), "Invalid gateway address");
        crossChainGateway = ICrossChainGateway(newGateway);
    }

    /**
     * @dev Update AI risk engine address
     * @param newEngine New engine address
     */
    function updateAIRiskEngine(address newEngine) external onlyOwner {
        require(newEngine != address(0), "Invalid engine address");
        aiRiskEngine = IAIRiskEngine(newEngine);
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
    // FALLBACK
    // =============================================================================

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
