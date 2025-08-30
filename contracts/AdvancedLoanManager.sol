// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AdvancedLoanManager
 * @dev Advanced loan management contract for Avalon Finance integration
 * Provides features like partial repayments, loan extensions, and collateral management
 */
contract AdvancedLoanManager is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Structs
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principal;
        uint256 interestRate; // basis points (e.g. 500 = 5%)
        uint256 startTime;
        uint256 duration; // in seconds
        uint256 lastPaymentTime;
        uint256 totalPaid;
        uint256 remainingPrincipal;
        address collateralToken;
        uint256 collateralTokenId;
        bool isActive;
        bool isLiquidated;
        uint256 liquidationTime;
        uint256 maxLTV; // maximum loan-to-value ratio
        uint256 currentLTV;
        uint256 extensionCount;
        uint256 maxExtensions;
    }

    struct CollateralPosition {
        address token;
        uint256 tokenId;
        uint256 value;
        uint256 lockedAt;
        bool isLocked;
        address owner;
    }

    struct LendingPool {
        address token;
        uint256 totalLiquidity;
        uint256 totalBorrowed;
        uint256 utilizationRate;
        uint256 baseInterestRate;
        uint256 maxLTV;
        bool isActive;
    }

    // State variables
    IERC20 public immutable stablecoin;
    Counters.Counter private _loanIds;
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => mapping(uint256 => CollateralPosition)) public collateralPositions;
    mapping(address => LendingPool) public lendingPools;
    mapping(address => uint256) public borrowerCreditScore;
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interestRate,
        uint256 duration,
        address collateralToken,
        uint256 collateralTokenId
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 remainingPrincipal
    );
    
    event LoanExtended(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 extraDuration,
        uint256 newDueDate
    );
    
    event CollateralLocked(
        address indexed token,
        uint256 indexed tokenId,
        address indexed owner,
        uint256 value
    );
    
    event CollateralUnlocked(
        address indexed token,
        uint256 indexed tokenId,
        address indexed owner
    );
    
    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 liquidatedAmount,
        address liquidator
    );
    
    event LendingPoolUpdated(
        address indexed token,
        uint256 totalLiquidity,
        uint256 totalBorrowed,
        uint256 utilizationRate
    );

    // Modifiers
    modifier onlyBorrower(uint256 loanId) {
        require(loans[loanId].borrower == msg.sender, "Not the borrower");
        _;
    }
    
    modifier loanExists(uint256 loanId) {
        require(loans[loanId].loanId != 0, "Loan does not exist");
        _;
    }
    
    modifier loanActive(uint256 loanId) {
        require(loans[loanId].isActive, "Loan is not active");
        require(!loans[loanId].isLiquidated, "Loan is liquidated");
        _;
    }

    // Constructor
    constructor(address _stablecoin) {
        require(_stablecoin != address(0), "Invalid stablecoin address");
        stablecoin = IERC20(_stablecoin);
    }

    /**
     * @dev Create a new loan
     * @param principal Amount to borrow
     * @param interestRate Interest rate in basis points
     * @param duration Loan duration in seconds
     * @param collateralToken NFT token address
     * @param collateralTokenId NFT token ID
     * @param maxLTV Maximum loan-to-value ratio
     */
    function createLoan(
        uint256 principal,
        uint256 interestRate,
        uint256 duration,
        address collateralToken,
        uint256 collateralTokenId,
        uint256 maxLTV
    ) external nonReentrant returns (uint256) {
        require(principal > 0, "Principal must be greater than 0");
        require(interestRate >= 300, "Interest rate too low"); // Minimum 3%
        require(interestRate <= 5000, "Interest rate too high"); // Maximum 50%
        require(duration >= 1 days, "Duration too short");
        require(duration <= 365 days, "Duration too long");
        require(maxLTV <= 8000, "Max LTV too high"); // Maximum 80%
        
        // Check if borrower has active loans
        require(borrowerLoans[msg.sender].length < 5, "Too many active loans");
        
        // Verify collateral ownership and lock it
        require(
            IERC721(collateralToken).ownerOf(collateralTokenId) == msg.sender,
            "Not the owner of collateral"
        );
        
        // Calculate LTV
        uint256 collateralValue = getCollateralValue(collateralToken, collateralTokenId);
        uint256 currentLTV = (principal * 10000) / collateralValue;
        require(currentLTV <= maxLTV, "LTV exceeds maximum");
        
        // Transfer collateral to contract
        IERC721(collateralToken).transferFrom(msg.sender, address(this), collateralTokenId);
        
        // Create loan
        _loanIds.increment();
        uint256 loanId = _loanIds.current();
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            principal: principal,
            interestRate: interestRate,
            startTime: block.timestamp,
            duration: duration,
            lastPaymentTime: block.timestamp,
            totalPaid: 0,
            remainingPrincipal: principal,
            collateralToken: collateralToken,
            collateralTokenId: collateralTokenId,
            isActive: true,
            isLiquidated: false,
            liquidationTime: 0,
            maxLTV: maxLTV,
            currentLTV: currentLTV,
            extensionCount: 0,
            maxExtensions: 3
        });
        
        // Update borrower loans
        borrowerLoans[msg.sender].push(loanId);
        
        // Lock collateral
        collateralPositions[collateralToken][collateralTokenId] = CollateralPosition({
            token: collateralToken,
            tokenId: collateralTokenId,
            value: collateralValue,
            lockedAt: block.timestamp,
            isLocked: true,
            owner: msg.sender
        });
        
        // Transfer stablecoins to borrower
        require(
            stablecoin.transfer(msg.sender, principal),
            "Failed to transfer stablecoins"
        );
        
        emit LoanCreated(
            loanId,
            msg.sender,
            principal,
            interestRate,
            duration,
            collateralToken,
            collateralTokenId
        );
        
        emit CollateralLocked(
            collateralToken,
            collateralTokenId,
            msg.sender,
            collateralValue
        );
        
        return loanId;
    }

    /**
     * @dev Repay loan (partial or full)
     * @param loanId ID of the loan to repay
     * @param amount Amount to repay
     */
    function repayLoan(uint256 loanId, uint256 amount) 
        external 
        nonReentrant 
        loanExists(loanId) 
        onlyBorrower(loanId) 
        loanActive(loanId) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= loans[loanId].remainingPrincipal, "Amount exceeds remaining principal");
        
        // Calculate interest
        uint256 interest = calculateInterest(loanId);
        uint256 totalOwed = loans[loanId].remainingPrincipal + interest;
        
        // Transfer stablecoins from borrower
        require(
            stablecoin.transferFrom(msg.sender, address(this), amount),
            "Failed to transfer stablecoins"
        );
        
        // Update loan state
        loans[loanId].totalPaid += amount;
        loans[loanId].lastPaymentTime = block.timestamp;
        
        if (amount >= totalOwed) {
            // Full repayment
            loans[loanId].remainingPrincipal = 0;
            loans[loanId].isActive = false;
            
            // Unlock collateral
            _unlockCollateral(loanId);
        } else {
            // Partial repayment
            loans[loanId].remainingPrincipal = totalOwed - amount;
        }
        
        emit LoanRepaid(loanId, msg.sender, amount, loans[loanId].remainingPrincipal);
    }

    /**
     * @dev Extend loan duration
     * @param loanId ID of the loan to extend
     * @param extraDuration Additional duration in seconds
     */
    function extendLoan(uint256 loanId, uint256 extraDuration) 
        external 
        nonReentrant 
        loanExists(loanId) 
        onlyBorrower(loanId) 
        loanActive(loanId) 
    {
        require(extraDuration > 0, "Extra duration must be greater than 0");
        require(extraDuration <= 30 days, "Extension too long");
        require(
            loans[loanId].extensionCount < loans[loanId].maxExtensions,
            "Max extensions reached"
        );
        
        // Calculate extension fee
        uint256 extensionFee = calculateExtensionFee(loanId, extraDuration);
        
        // Transfer extension fee
        require(
            stablecoin.transferFrom(msg.sender, address(this), extensionFee),
            "Failed to transfer extension fee"
        );
        
        // Extend loan
        loans[loanId].duration += extraDuration;
        loans[loanId].extensionCount++;
        
        emit LoanExtended(loanId, msg.sender, extraDuration, loans[loanId].startTime + loans[loanId].duration);
    }

    /**
     * @dev Lock additional collateral
     * @param token NFT token address
     * @param tokenId NFT token ID
     */
    function lockCollateral(address token, uint256 tokenId) external nonReentrant {
        require(
            IERC721(token).ownerOf(tokenId) == msg.sender,
            "Not the owner of collateral"
        );
        
        require(
            !collateralPositions[token][tokenId].isLocked,
            "Collateral already locked"
        );
        
        uint256 value = getCollateralValue(token, tokenId);
        require(value > 0, "Invalid collateral value");
        
        // Transfer NFT to contract
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);
        
        // Lock collateral
        collateralPositions[token][tokenId] = CollateralPosition({
            token: token,
            tokenId: tokenId,
            value: value,
            lockedAt: block.timestamp,
            isLocked: true,
            owner: msg.sender
        });
        
        emit CollateralLocked(token, tokenId, msg.sender, value);
    }

    /**
     * @dev Unlock collateral (only if no active loans)
     * @param token NFT token address
     * @param tokenId NFT token ID
     */
    function unlockCollateral(address token, uint256 tokenId) external nonReentrant {
        CollateralPosition storage position = collateralPositions[token][tokenId];
        require(position.isLocked, "Collateral not locked");
        require(position.owner == msg.sender, "Not the owner");
        
        // Check if collateral is used in any active loans
        require(!_isCollateralUsedInActiveLoans(token, tokenId), "Collateral used in active loan");
        
        // Unlock collateral
        position.isLocked = false;
        
        // Transfer NFT back to owner
        IERC721(token).transfer(msg.sender, tokenId);
        
        emit CollateralUnlocked(token, tokenId, msg.sender);
    }

    /**
     * @dev Liquidate loan when conditions are met
     * @param loanId ID of the loan to liquidate
     */
    function liquidateLoan(uint256 loanId) external nonReentrant loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isLiquidated, "Loan already liquidated");
        
        // Check liquidation conditions
        require(
            _shouldLiquidate(loanId) || 
            block.timestamp > loan.startTime + loan.duration,
            "Liquidation conditions not met"
        );
        
        // Mark loan as liquidated
        loan.isLiquidated = true;
        loan.isActive = false;
        loan.liquidationTime = block.timestamp;
        
        // Transfer collateral to liquidator (could be auctioned or sold)
        // For now, transfer to contract owner (can be enhanced with auction mechanism)
        address liquidator = msg.sender;
        
        // Calculate liquidated amount
        uint256 liquidatedAmount = loan.remainingPrincipal + calculateInterest(loanId);
        
        emit LoanLiquidated(loanId, loan.borrower, liquidatedAmount, liquidator);
    }

    /**
     * @dev Update lending pool parameters
     * @param token Token address
     * @param totalLiquidity New total liquidity
     * @param baseInterestRate New base interest rate
     * @param maxLTV New maximum LTV
     */
    function updateLendingPool(
        address token,
        uint256 totalLiquidity,
        uint256 baseInterestRate,
        uint256 maxLTV
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(maxLTV <= 8000, "Max LTV too high");
        
        lendingPools[token] = LendingPool({
            token: token,
            totalLiquidity: totalLiquidity,
            totalBorrowed: lendingPools[token].totalBorrowed,
            utilizationRate: _calculateUtilizationRate(token, totalLiquidity),
            baseInterestRate: baseInterestRate,
            maxLTV: maxLTV,
            isActive: true
        });
        
        emit LendingPoolUpdated(
            token,
            totalLiquidity,
            lendingPools[token].totalBorrowed,
            lendingPools[token].utilizationRate
        );
    }

    /**
     * @dev Get loan information
     * @param loanId ID of the loan
     * @return Loan information
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @dev Get borrower's loans
     * @param borrower Borrower address
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    /**
     * @dev Get collateral position
     * @param token NFT token address
     * @param tokenId NFT token ID
     * @return Collateral position information
     */
    function getCollateralPosition(address token, uint256 tokenId) 
        external 
        view 
        returns (CollateralPosition memory) 
    {
        return collateralPositions[token][tokenId];
    }

    /**
     * @dev Get lending pool information
     * @param token Token address
     * @return Lending pool information
     */
    function getLendingPool(address token) external view returns (LendingPool memory) {
        return lendingPools[token];
    }

    /**
     * @dev Calculate interest for a loan
     * @param loanId ID of the loan
     * @return Interest amount
     */
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        if (!loan.isActive || loan.isLiquidated) return 0;
        
        uint256 timeElapsed = block.timestamp - loan.lastPaymentTime;
        return (loan.remainingPrincipal * loan.interestRate * timeElapsed) / (365 days * 10000);
    }

    /**
     * @dev Calculate extension fee
     * @param loanId ID of the loan
     * @param extraDuration Additional duration
     * @return Extension fee
     */
    function calculateExtensionFee(uint256 loanId, uint256 extraDuration) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        uint256 baseFee = loan.remainingPrincipal * 100 / 10000; // 1% base fee
        uint256 timeFee = (loan.remainingPrincipal * loan.interestRate * extraDuration) / (365 days * 10000);
        return baseFee + timeFee;
    }

    /**
     * @dev Get current LTV for a loan
     * @param loanId ID of the loan
     * @return Current LTV ratio
     */
    function getCurrentLTV(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) return 0;
        
        uint256 collateralValue = getCollateralValue(loan.collateralToken, loan.collateralTokenId);
        uint256 totalOwed = loan.remainingPrincipal + calculateInterest(loanId);
        
        return (totalOwed * 10000) / collateralValue;
    }

    /**
     * @dev Check if loan should be liquidated
     * @param loanId ID of the loan
     * @return True if should be liquidated
     */
    function _shouldLiquidate(uint256 loanId) internal view returns (bool) {
        Loan storage loan = loans[loanId];
        uint256 currentLTV = getCurrentLTV(loanId);
        return currentLTV > loan.maxLTV;
    }

    /**
     * @dev Unlock collateral for a loan
     * @param loanId ID of the loan
     */
    function _unlockCollateral(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        CollateralPosition storage position = collateralPositions[loan.collateralToken][loan.collateralTokenId];
        
        if (position.isLocked) {
            position.isLocked = false;
            IERC721(loan.collateralToken).transfer(loan.borrower, loan.collateralTokenId);
            
            emit CollateralUnlocked(
                loan.collateralToken,
                loan.collateralTokenId,
                loan.borrower
            );
        }
    }

    /**
     * @dev Check if collateral is used in active loans
     * @param token NFT token address
     * @param tokenId NFT token ID
     * @return True if used in active loan
     */
    function _isCollateralUsedInActiveLoans(address token, uint256 tokenId) internal view returns (bool) {
        for (uint256 i = 0; i < borrowerLoans[msg.sender].length; i++) {
            uint256 loanId = borrowerLoans[msg.sender][i];
            Loan storage loan = loans[loanId];
            if (loan.isActive && 
                loan.collateralToken == token && 
                loan.collateralTokenId == tokenId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Calculate utilization rate for a lending pool
     * @param token Token address
     * @param totalLiquidity Total liquidity
     * @return Utilization rate
     */
    function _calculateUtilizationRate(address token, uint256 totalLiquidity) internal view returns (uint256) {
        if (totalLiquidity == 0) return 0;
        return (lendingPools[token].totalBorrowed * 10000) / totalLiquidity;
    }

    /**
     * @dev Get collateral value (placeholder - should integrate with oracle)
     * @param token NFT token address
     * @param tokenId NFT token ID
     * @return Collateral value in stablecoin units
     */
    function getCollateralValue(address token, uint256 tokenId) public view returns (uint256) {
        // This is a placeholder implementation
        // In production, this should integrate with a price oracle or NFT valuation service
        // For now, return a fixed value based on token ID for demonstration
        return 1000 * 10**18; // 1000 stablecoin units
    }

    /**
     * @dev Emergency function to pause all operations (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would pause all loan operations in case of emergency
    }

    /**
     * @dev Withdraw fees collected by the contract (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = stablecoin.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(
            stablecoin.transfer(owner(), balance),
            "Failed to transfer fees"
        );
    }
}
