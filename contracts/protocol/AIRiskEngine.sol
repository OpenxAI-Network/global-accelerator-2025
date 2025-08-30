// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title AIRiskEngine
 * @dev AI-powered risk assessment for NFT lending with on-chain validation
 * @author Aegis AI Team
 */
contract AIRiskEngine is Ownable, Pausable {
    using SafeMath for uint256;

    // =============================================================================
    // INTERFACES
    // =============================================================================

    interface IPriceOracle {
        function getNFTPrice(address nftContract, uint256 tokenId) external view returns (uint256);
        function getCollectionFloorPrice(address nftContract) external view returns (uint256);
        function getPriceVolatility(address nftContract) external view returns (uint256);
    }

    interface IUserReputation {
        function getUserScore(address user) external view returns (uint256);
        function getUserLoanHistory(address user) external view returns (
            uint256 totalLoans,
            uint256 repaidLoans,
            uint256 defaultedLoans,
            uint256 averageLoanAmount
        );
    }

    // =============================================================================
    // STRUCTS
    // =============================================================================

    struct RiskAssessment {
        uint256 riskScore; // 0-100, lower is better
        bool isApproved;
        string reason;
        uint256 confidence;
        uint256 maxLoanAmount;
        uint256 recommendedInterestRate;
        uint256 maxLTV;
        uint256 liquidationThreshold;
    }

    struct RiskFactors {
        uint256 nftValue;
        uint256 requestedAmount;
        uint256 ltvRatio;
        uint256 priceVolatility;
        uint256 userReputation;
        uint256 loanHistory;
        uint256 marketConditions;
        uint256 collectionRarity;
        uint256 liquidityScore;
        uint256 timeBasedRisk;
    }

    struct RiskThresholds {
        uint256 maxRiskScore;
        uint256 maxLTV;
        uint256 maxLoanAmount;
        uint256 minUserReputation;
        uint256 maxPriceVolatility;
        uint256 maxCollectionRisk;
    }

    struct CollectionRiskProfile {
        address nftContract;
        uint256 riskScore;
        uint256 maxLTV;
        uint256 maxLoanAmount;
        uint256 interestRateMultiplier;
        bool isBlacklisted;
        string riskCategory;
        uint256 lastUpdated;
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    IPriceOracle public priceOracle;
    IUserReputation public userReputation;
    
    mapping(address => CollectionRiskProfile) public collectionRiskProfiles;
    mapping(address => uint256) public userRiskScores;
    mapping(bytes32 => RiskAssessment) public riskAssessments;
    
    RiskThresholds public riskThresholds;
    
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant MIN_CONFIDENCE = 70;
    uint256 public constant PRICE_VOLATILITY_THRESHOLD = 30; // 30% max volatility
    uint256 public constant REPUTATION_WEIGHT = 25; // 25% weight for user reputation
    uint256 public constant COLLECTION_WEIGHT = 30; // 30% weight for collection risk
    uint256 public constant MARKET_WEIGHT = 20; // 20% weight for market conditions
    uint256 public constant LIQUIDITY_WEIGHT = 25; // 25% weight for liquidity

    // =============================================================================
    // EVENTS
    // =============================================================================

    event RiskAssessmentCompleted(
        bytes32 indexed assessmentId,
        address indexed user,
        address indexed nftContract,
        uint256 tokenId,
        uint256 riskScore,
        bool isApproved,
        string reason
    );

    event CollectionRiskProfileUpdated(
        address indexed nftContract,
        uint256 riskScore,
        uint256 maxLTV,
        string riskCategory
    );

    event UserRiskScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore
    );

    event RiskThresholdsUpdated(
        uint256 maxRiskScore,
        uint256 maxLTV,
        uint256 maxLoanAmount
    );

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(
        address _priceOracle,
        address _userReputation
    ) {
        priceOracle = IPriceOracle(_priceOracle);
        userReputation = IUserReputation(_userReputation);
        
        // Set default risk thresholds
        riskThresholds = RiskThresholds({
            maxRiskScore: 75,
            maxLTV: 70,
            maxLoanAmount: 1000000 * 10**18, // 1M USDC
            minUserReputation: 60,
            maxPriceVolatility: 30,
            maxCollectionRisk: 80
        });
    }

    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================

    /**
     * @dev Assess loan risk using AI-powered analysis
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param loanAmount Requested loan amount
     * @param borrower Borrower address
     * @return riskScore Risk score (0-100)
     * @return isApproved Whether loan is approved
     * @return reason Reason for approval/rejection
     */
    function assessLoanRisk(
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        address borrower
    ) external view returns (
        uint256 riskScore,
        bool isApproved,
        string memory reason
    ) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(borrower != address(0), "Invalid borrower address");
        require(loanAmount > 0, "Invalid loan amount");

        // Generate assessment ID
        bytes32 assessmentId = keccak256(abi.encodePacked(
            nftContract,
            tokenId,
            loanAmount,
            borrower,
            block.timestamp
        ));

        // Check if assessment already exists
        if (riskAssessments[assessmentId].riskScore > 0) {
            RiskAssessment memory assessment = riskAssessments[assessmentId];
            return (assessment.riskScore, assessment.isApproved, assessment.reason);
        }

        // Perform risk assessment
        RiskAssessment memory assessment = _performRiskAssessment(
            nftContract,
            tokenId,
            loanAmount,
            borrower
        );

        // Determine approval
        isApproved = _determineApproval(assessment);
        reason = _generateReason(assessment, isApproved);

        return (assessment.riskScore, isApproved, reason);
    }

    /**
     * @dev Perform comprehensive risk assessment
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param loanAmount Requested loan amount
     * @param borrower Borrower address
     * @return RiskAssessment Complete risk assessment
     */
    function _performRiskAssessment(
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        address borrower
    ) internal view returns (RiskAssessment memory) {
        // Calculate risk factors
        RiskFactors memory factors = _calculateRiskFactors(
            nftContract,
            tokenId,
            loanAmount,
            borrower
        );

        // Calculate weighted risk score
        uint256 riskScore = _calculateWeightedRiskScore(factors);

        // Get collection risk profile
        CollectionRiskProfile memory collectionProfile = collectionRiskProfiles[nftContract];

        // Calculate max loan amount based on risk
        uint256 maxLoanAmount = _calculateMaxLoanAmount(factors, collectionProfile);

        // Calculate recommended interest rate
        uint256 recommendedInterestRate = _calculateRecommendedInterestRate(riskScore, collectionProfile);

        // Calculate LTV and liquidation thresholds
        uint256 maxLTV = _calculateMaxLTV(riskScore, collectionProfile);
        uint256 liquidationThreshold = maxLTV.add(10); // 10% buffer

        // Calculate confidence score
        uint256 confidence = _calculateConfidence(factors);

        return RiskAssessment({
            riskScore: riskScore,
            isApproved: false, // Will be determined later
            reason: "",
            confidence: confidence,
            maxLoanAmount: maxLoanAmount,
            recommendedInterestRate: recommendedInterestRate,
            maxLTV: maxLTV,
            liquidationThreshold: liquidationThreshold
        });
    }

    /**
     * @dev Calculate individual risk factors
     * @param nftContract Address of the NFT contract
     * @param tokenId ID of the NFT token
     * @param loanAmount Requested loan amount
     * @param borrower Borrower address
     * @return RiskFactors Calculated risk factors
     */
    function _calculateRiskFactors(
        address nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        address borrower
    ) internal view returns (RiskFactors memory) {
        // Get NFT value
        uint256 nftValue = priceOracle.getNFTPrice(nftContract, tokenId);
        require(nftValue > 0, "Unable to determine NFT value");

        // Calculate LTV ratio
        uint256 ltvRatio = loanAmount.mul(100).div(nftValue);

        // Get price volatility
        uint256 priceVolatility = priceOracle.getPriceVolatility(nftContract);

        // Get user reputation score
        uint256 userRep = userReputation.getUserScore(borrower);

        // Get loan history
        (uint256 totalLoans, uint256 repaidLoans, uint256 defaultedLoans, uint256 avgLoanAmount) = 
            userReputation.getUserLoanHistory(borrower);

        // Calculate loan history score
        uint256 loanHistoryScore = _calculateLoanHistoryScore(totalLoans, repaidLoans, defaultedLoans);

        // Get market conditions (placeholder for now)
        uint256 marketConditions = _getMarketConditions();

        // Calculate collection rarity
        uint256 collectionRarity = _calculateCollectionRarity(nftContract);

        // Calculate liquidity score
        uint256 liquidityScore = _calculateLiquidityScore(nftContract);

        // Calculate time-based risk
        uint256 timeBasedRisk = _calculateTimeBasedRisk();

        return RiskFactors({
            nftValue: nftValue,
            requestedAmount: loanAmount,
            ltvRatio: ltvRatio,
            priceVolatility: priceVolatility,
            userReputation: userRep,
            loanHistory: loanHistoryScore,
            marketConditions: marketConditions,
            collectionRarity: collectionRarity,
            liquidityScore: liquidityScore,
            timeBasedRisk: timeBasedRisk
        });
    }

    /**
     * @dev Calculate weighted risk score from factors
     * @param factors Risk factors
     * @return uint256 Weighted risk score
     */
    function _calculateWeightedRiskScore(RiskFactors memory factors) internal pure returns (uint256) {
        uint256 totalScore = 0;
        uint256 totalWeight = 0;

        // User reputation (25% weight)
        uint256 reputationScore = _normalizeScore(factors.userReputation, 0, 100);
        totalScore = totalScore.add(reputationScore.mul(REPUTATION_WEIGHT));
        totalWeight = totalWeight.add(REPUTATION_WEIGHT);

        // Collection risk (30% weight)
        uint256 collectionScore = _calculateCollectionRiskScore(factors);
        totalScore = totalScore.add(collectionScore.mul(COLLECTION_WEIGHT));
        totalWeight = totalWeight.add(COLLECTION_WEIGHT);

        // Market conditions (20% weight)
        uint256 marketScore = _normalizeScore(factors.marketConditions, 0, 100);
        totalScore = totalScore.add(marketScore.mul(MARKET_WEIGHT));
        totalWeight = totalWeight.add(MARKET_WEIGHT);

        // Liquidity (25% weight)
        uint256 liquidityScore = _normalizeScore(factors.liquidityScore, 0, 100);
        totalScore = totalScore.add(liquidityScore.mul(LIQUIDITY_WEIGHT));
        totalWeight = totalWeight.add(LIQUIDITY_WEIGHT);

        // Additional risk factors
        uint256 ltvRisk = _calculateLTVRisk(factors.ltvRatio);
        uint256 volatilityRisk = _calculateVolatilityRisk(factors.priceVolatility);
        uint256 historyRisk = _normalizeScore(factors.loanHistory, 0, 100);

        // Apply additional risk adjustments
        totalScore = totalScore.add(ltvRisk.mul(10)).add(volatilityRisk.mul(10)).add(historyRisk.mul(10));
        totalWeight = totalWeight.add(30);

        return totalScore.div(totalWeight);
    }

    /**
     * @dev Calculate collection risk score
     * @param factors Risk factors
     * @return uint256 Collection risk score
     */
    function _calculateCollectionRiskScore(RiskFactors memory factors) internal pure returns (uint256) {
        uint256 rarityScore = _normalizeScore(factors.collectionRarity, 0, 100);
        uint256 liquidityScore = _normalizeScore(factors.liquidityScore, 0, 100);
        
        // Higher rarity = higher risk, higher liquidity = lower risk
        return rarityScore.mul(60).add(liquidityScore.mul(40)).div(100);
    }

    /**
     * @dev Calculate LTV risk score
     * @param ltvRatio Loan-to-value ratio
     * @return uint256 LTV risk score
     */
    function _calculateLTVRisk(uint256 ltvRatio) internal pure returns (uint256) {
        if (ltvRatio <= 30) return 10; // Low risk
        if (ltvRatio <= 50) return 30; // Medium risk
        if (ltvRatio <= 70) return 60; // High risk
        return 100; // Very high risk
    }

    /**
     * @dev Calculate volatility risk score
     * @param volatility Price volatility percentage
     * @return uint256 Volatility risk score
     */
    function _calculateVolatilityRisk(uint256 volatility) internal pure returns (uint256) {
        if (volatility <= 10) return 10; // Low volatility
        if (volatility <= 25) return 40; // Medium volatility
        if (volatility <= 50) return 70; // High volatility
        return 100; // Very high volatility
    }

    /**
     * @dev Calculate loan history score
     * @param totalLoans Total number of loans
     * @param repaidLoans Number of repaid loans
     * @param defaultedLoans Number of defaulted loans
     * @return uint256 Loan history score
     */
    function _calculateLoanHistoryScore(
        uint256 totalLoans,
        uint256 repaidLoans,
        uint256 defaultedLoans
    ) internal pure returns (uint256) {
        if (totalLoans == 0) return 50; // No history = neutral score
        
        uint256 repaymentRate = repaidLoans.mul(100).div(totalLoans);
        uint256 defaultRate = defaultedLoans.mul(100).div(totalLoans);
        
        if (repaymentRate >= 95 && defaultRate <= 5) return 90; // Excellent
        if (repaymentRate >= 85 && defaultRate <= 10) return 75; // Good
        if (repaymentRate >= 70 && defaultRate <= 20) return 60; // Fair
        if (repaymentRate >= 50 && defaultRate <= 30) return 40; // Poor
        return 20; // Very poor
    }

    /**
     * @dev Determine loan approval based on risk assessment
     * @param assessment Risk assessment
     * @return bool Whether loan is approved
     */
    function _determineApproval(RiskAssessment memory assessment) internal view returns (bool) {
        // Check risk score threshold
        if (assessment.riskScore > riskThresholds.maxRiskScore) {
            return false;
        }

        // Check confidence threshold
        if (assessment.confidence < MIN_CONFIDENCE) {
            return false;
        }

        // Check LTV threshold
        if (assessment.maxLTV > riskThresholds.maxLTV) {
            return false;
        }

        return true;
    }

    /**
     * @dev Generate approval/rejection reason
     * @param assessment Risk assessment
     * @param isApproved Whether loan is approved
     * @return string Reason for decision
     */
    function _generateReason(RiskAssessment memory assessment, bool isApproved) internal pure returns (string memory) {
        if (isApproved) {
            return string(abi.encodePacked(
                "Loan approved. Risk score: ",
                _uint2str(assessment.riskScore),
                ", Max LTV: ",
                _uint2str(assessment.maxLTV),
                "%, Recommended rate: ",
                _uint2str(assessment.recommendedInterestRate),
                " basis points"
            ));
        } else {
            if (assessment.riskScore > 75) {
                return "Loan rejected: Risk score too high";
            } else if (assessment.confidence < MIN_CONFIDENCE) {
                return "Loan rejected: Insufficient confidence in assessment";
            } else if (assessment.maxLTV > 70) {
                return "Loan rejected: LTV ratio too high";
            } else {
                return "Loan rejected: Risk assessment failed";
            }
        }
    }

    // =============================================================================
    // CALCULATION FUNCTIONS
    // =============================================================================

    function _calculateMaxLoanAmount(
        RiskFactors memory factors,
        CollectionRiskProfile memory collectionProfile
    ) internal pure returns (uint256) {
        uint256 baseAmount = factors.nftValue.mul(70).div(100); // Base 70% LTV
        
        // Adjust based on collection risk
        if (collectionProfile.riskScore > 0) {
            uint256 riskMultiplier = 100 - collectionProfile.riskScore;
            baseAmount = baseAmount.mul(riskMultiplier).div(100);
        }
        
        return baseAmount;
    }

    function _calculateRecommendedInterestRate(
        uint256 riskScore,
        CollectionRiskProfile memory collectionProfile
    ) internal pure returns (uint256) {
        uint256 baseRate = 1200; // 12% base rate
        
        // Adjust based on risk score
        if (riskScore > 80) {
            baseRate = baseRate.mul(150).div(100); // 50% increase
        } else if (riskScore > 60) {
            baseRate = baseRate.mul(125).div(100); // 25% increase
        }
        
        // Adjust based on collection profile
        if (collectionProfile.interestRateMultiplier > 0) {
            baseRate = baseRate.mul(collectionProfile.interestRateMultiplier).div(100);
        }
        
        return baseRate;
    }

    function _calculateMaxLTV(
        uint256 riskScore,
        CollectionRiskProfile memory collectionProfile
    ) internal pure returns (uint256) {
        uint256 baseLTV = 70; // Base 70% LTV
        
        // Adjust based on risk score
        if (riskScore > 80) {
            baseLTV = baseLTV.sub(20); // Reduce to 50%
        } else if (riskScore > 60) {
            baseLTV = baseLTV.sub(10); // Reduce to 60%
        }
        
        // Adjust based on collection profile
        if (collectionProfile.maxLTV > 0) {
            baseLTV = collectionProfile.maxLTV;
        }
        
        return baseLTV;
    }

    function _calculateConfidence(RiskFactors memory factors) internal pure returns (uint256) {
        uint256 confidence = 80; // Base confidence
        
        // Reduce confidence for high volatility
        if (factors.priceVolatility > 30) {
            confidence = confidence.sub(20);
        }
        
        // Reduce confidence for low liquidity
        if (factors.liquidityScore < 50) {
            confidence = confidence.sub(15);
        }
        
        // Reduce confidence for new users
        if (factors.userReputation < 50) {
            confidence = confidence.sub(10);
        }
        
        return confidence > 0 ? confidence : 0;
    }

    // =============================================================================
    // HELPER FUNCTIONS
    // =============================================================================

    function _normalizeScore(uint256 score, uint256 min, uint256 max) internal pure returns (uint256) {
        if (score <= min) return 0;
        if (score >= max) return 100;
        return score.sub(min).mul(100).div(max.sub(min));
    }

    function _calculateCollectionRarity(address nftContract) internal view returns (uint256) {
        // Placeholder implementation
        // In practice, this would query NFT metadata and rarity APIs
        return 50; // Default medium rarity
    }

    function _calculateLiquidityScore(address nftContract) internal view returns (uint256) {
        // Placeholder implementation
        // In practice, this would analyze trading volume and market depth
        return 70; // Default medium liquidity
    }

    function _getMarketConditions() internal view returns (uint256) {
        // Placeholder implementation
        // In practice, this would query market sentiment APIs
        return 60; // Default neutral market conditions
    }

    function _calculateTimeBasedRisk() internal view returns (uint256) {
        // Placeholder implementation
        // In practice, this would consider market cycles and seasonal factors
        return 50; // Default neutral time risk
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Update collection risk profile
     * @param nftContract Address of the NFT contract
     * @param riskScore Risk score (0-100)
     * @param maxLTV Maximum LTV ratio
     * @param maxLoanAmount Maximum loan amount
     * @param interestRateMultiplier Interest rate multiplier
     * @param isBlacklisted Whether collection is blacklisted
     * @param riskCategory Risk category string
     */
    function updateCollectionRiskProfile(
        address nftContract,
        uint256 riskScore,
        uint256 maxLTV,
        uint256 maxLoanAmount,
        uint256 interestRateMultiplier,
        bool isBlacklisted,
        string calldata riskCategory
    ) external onlyOwner {
        require(nftContract != address(0), "Invalid NFT contract");
        require(riskScore <= MAX_RISK_SCORE, "Invalid risk score");
        require(maxLTV <= 90, "Invalid max LTV");
        require(interestRateMultiplier <= 200, "Invalid interest rate multiplier");

        collectionRiskProfiles[nftContract] = CollectionRiskProfile({
            nftContract: nftContract,
            riskScore: riskScore,
            maxLTV: maxLTV,
            maxLoanAmount: maxLoanAmount,
            interestRateMultiplier: interestRateMultiplier,
            isBlacklisted: isBlacklisted,
            riskCategory: riskCategory,
            lastUpdated: block.timestamp
        });

        emit CollectionRiskProfileUpdated(nftContract, riskScore, maxLTV, riskCategory);
    }

    /**
     * @dev Update user risk score
     * @param user User address
     * @param newScore New risk score
     */
    function updateUserRiskScore(address user, uint256 newScore) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(newScore <= MAX_RISK_SCORE, "Invalid risk score");

        uint256 oldScore = userRiskScores[user];
        userRiskScores[user] = newScore;

        emit UserRiskScoreUpdated(user, oldScore, newScore);
    }

    /**
     * @dev Update risk thresholds
     * @param maxRiskScore Maximum allowed risk score
     * @param maxLTV Maximum allowed LTV ratio
     * @param maxLoanAmount Maximum allowed loan amount
     */
    function updateRiskThresholds(
        uint256 maxRiskScore,
        uint256 maxLTV,
        uint256 maxLoanAmount
    ) external onlyOwner {
        require(maxRiskScore <= MAX_RISK_SCORE, "Invalid max risk score");
        require(maxLTV <= 90, "Invalid max LTV");
        require(maxLoanAmount > 0, "Invalid max loan amount");

        riskThresholds.maxRiskScore = maxRiskScore;
        riskThresholds.maxLTV = maxLTV;
        riskThresholds.maxLoanAmount = maxLoanAmount;

        emit RiskThresholdsUpdated(maxRiskScore, maxLTV, maxLoanAmount);
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
     * @dev Update user reputation contract address
     * @param newReputation New reputation contract address
     */
    function updateUserReputation(address newReputation) external onlyOwner {
        require(newReputation != address(0), "Invalid reputation address");
        userReputation = IUserReputation(newReputation);
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
    // VIEW FUNCTIONS
    // =============================================================================

    /**
     * @dev Get collection risk profile
     * @param nftContract Address of the NFT contract
     * @return CollectionRiskProfile Risk profile
     */
    function getCollectionRiskProfile(address nftContract) external view returns (CollectionRiskProfile memory) {
        return collectionRiskProfiles[nftContract];
    }

    /**
     * @dev Get user risk score
     * @param user User address
     * @return uint256 Risk score
     */
    function getUserRiskScore(address user) external view returns (uint256) {
        return userRiskScores[user];
    }

    /**
     * @dev Get risk thresholds
     * @return RiskThresholds Current risk thresholds
     */
    function getRiskThresholds() external view returns (RiskThresholds memory) {
        return riskThresholds;
    }

    // =============================================================================
    // FALLBACK
    // =============================================================================

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
