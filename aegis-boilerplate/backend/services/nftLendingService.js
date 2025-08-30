import { ethers } from 'ethers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import CrossChainMessagingService from './crossChainMessagingService.js';

/**
 * NFT Lending Service
 * Manages cross-chain NFT lending operations with AI-powered risk assessment
 */
class NFTLendingService {
    constructor(config) {
        this.config = {
            geminiApiKey: config.GEMINI_API_KEY,
            supportedChains: config.SUPPORTED_CHAINS || [],
            nftPriceApis: config.NFT_PRICE_APIS || {},
            riskThresholds: config.RISK_THRESHOLDS || {
                maxLTV: 70,
                maxRiskScore: 75,
                minUserReputation: 60
            },
            ...config
        };

        // Initialize Gemini AI
        this.gemini = new GoogleGenerativeAI(this.config.geminiApiKey);
        this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Initialize cross-chain messaging service
        this.crossChainService = new CrossChainMessagingService(config);

        // Service state
        this.activeLoans = new Map();
        this.collateralPositions = new Map();
        this.userProfiles = new Map();
        this.collectionRiskProfiles = new Map();
        this.loanHistory = new Map();

        // Initialize service
        this.initialize();
    }

    /**
     * Initialize the NFT lending service
     */
    async initialize() {
        try {
            logger.info('Initializing NFT Lending Service...');

            // Wait for cross-chain service to initialize
            await new Promise((resolve) => {
                if (this.crossChainService.isInitialized) {
                    resolve();
                } else {
                    this.crossChainService.once('initialized', resolve);
                }
            });

            // Load initial data
            await this.loadInitialData();

            // Start monitoring
            this.startMonitoring();

            logger.info('NFT Lending Service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize NFT Lending Service:', error);
            throw error;
        }
    }

    /**
     * Load initial data for the service
     */
    async loadInitialData() {
        // Load collection risk profiles
        await this.loadCollectionRiskProfiles();
        
        // Load user profiles
        await this.loadUserProfiles();
        
        // Load active loans
        await this.loadActiveLoans();
        
        // Load collateral positions
        await this.loadCollateralPositions();
    }

    /**
     * Start monitoring for loan health and cross-chain events
     */
    startMonitoring() {
        // Monitor loan health every 5 minutes
        setInterval(async () => {
            await this.monitorLoanHealth();
        }, 5 * 60 * 1000);

        // Monitor cross-chain messages
        this.crossChainService.on('messageConfirmed', async (data) => {
            await this.handleCrossChainMessage(data);
        });

        this.crossChainService.on('messageFailed', async (data) => {
            await this.handleCrossChainMessageFailure(data);
        });

        // Monitor for liquidation events
        setInterval(async () => {
            await this.checkLiquidationEvents();
        }, 2 * 60 * 1000); // Every 2 minutes
    }

    /**
     * Request a loan against NFT collateral
     * @param {Object} loanRequest - Loan request object
     * @returns {Promise<Object>} Loan request result
     */
    async requestLoan(loanRequest) {
        try {
            logger.info('Processing loan request:', loanRequest);

            // Validate loan request
            this.validateLoanRequest(loanRequest);

            // Get NFT valuation
            const nftValuation = await this.getNFTValuation(
                loanRequest.nftContract,
                loanRequest.tokenId,
                loanRequest.chainId
            );

            // Perform AI risk assessment
            const riskAssessment = await this.performRiskAssessment(loanRequest, nftValuation);

            if (!riskAssessment.isApproved) {
                return {
                    success: false,
                    reason: riskAssessment.reason,
                    riskScore: riskAssessment.riskScore
                };
            }

            // Create collateral position
            const positionId = await this.createCollateralPosition(loanRequest, nftValuation);

            // Send cross-chain loan request
            const crossChainResult = await this.crossChainService.sendCrossChainMessage({
                type: 'LOAN_REQUEST',
                fromChainId: loanRequest.chainId,
                toChainId: loanRequest.loanChainId,
                userAddress: loanRequest.userAddress,
                nftContract: loanRequest.nftContract,
                tokenId: loanRequest.tokenId,
                loanAmount: loanRequest.loanAmount,
                collateralPositionId: positionId,
                metadata: {
                    nftValuation,
                    riskAssessment,
                    loanTerms: this.calculateLoanTerms(loanRequest, riskAssessment)
                }
            });

            // Create loan record
            const loanId = await this.createLoanRecord(loanRequest, positionId, crossChainResult.messageId);

            logger.info('Loan request processed successfully:', { loanId, positionId });

            return {
                success: true,
                loanId,
                positionId,
                crossChainMessageId: crossChainResult.messageId,
                riskAssessment,
                loanTerms: this.calculateLoanTerms(loanRequest, riskAssessment)
            };

        } catch (error) {
            logger.error('Failed to process loan request:', error);
            throw error;
        }
    }

    /**
     * Process cross-chain loan request from another chain
     * @param {Object} crossChainRequest - Cross-chain loan request
     * @returns {Promise<Object>} Processing result
     */
    async processCrossChainLoanRequest(crossChainRequest) {
        try {
            logger.info('Processing cross-chain loan request:', crossChainRequest);

            // Validate cross-chain request
            this.validateCrossChainRequest(crossChainRequest);

            // Perform risk assessment
            const riskAssessment = await this.performRiskAssessment(crossChainRequest, {
                value: crossChainRequest.nftValuation,
                chainId: crossChainRequest.fromChainId
            });

            if (riskAssessment.isApproved) {
                // Issue loan
                const loanId = await this.issueCrossChainLoan(crossChainRequest, riskAssessment);

                // Send approval message back
                await this.crossChainService.sendCrossChainMessage({
                    type: 'LOAN_APPROVED',
                    fromChainId: crossChainRequest.toChainId,
                    toChainId: crossChainRequest.fromChainId,
                    userAddress: crossChainRequest.userAddress,
                    nftContract: crossChainRequest.nftContract,
                    tokenId: crossChainRequest.tokenId,
                    loanAmount: crossChainRequest.loanAmount,
                    loanId,
                    interestRate: riskAssessment.recommendedInterestRate,
                    metadata: { riskAssessment }
                });

                return {
                    success: true,
                    loanId,
                    riskAssessment
                };
            } else {
                // Send rejection message back
                await this.crossChainService.sendCrossChainMessage({
                    type: 'LOAN_REJECTED',
                    fromChainId: crossChainRequest.toChainId,
                    toChainId: crossChainRequest.fromChainId,
                    userAddress: crossChainRequest.userAddress,
                    nftContract: crossChainRequest.nftContract,
                    tokenId: crossChainRequest.tokenId,
                    requestId: crossChainRequest.requestId,
                    reason: riskAssessment.reason,
                    metadata: { riskAssessment }
                });

                return {
                    success: false,
                    reason: riskAssessment.reason,
                    riskAssessment
                };
            }

        } catch (error) {
            logger.error('Failed to process cross-chain loan request:', error);
            throw error;
        }
    }

    /**
     * Perform AI-powered risk assessment
     * @param {Object} loanRequest - Loan request
     * @param {Object} nftValuation - NFT valuation data
     * @returns {Promise<Object>} Risk assessment result
     */
    async performRiskAssessment(loanRequest, nftValuation) {
        try {
            // Get user profile
            const userProfile = await this.getUserProfile(loanRequest.userAddress);
            
            // Get collection risk profile
            const collectionProfile = await this.getCollectionRiskProfile(loanRequest.nftContract);
            
            // Calculate LTV ratio
            const ltvRatio = (loanRequest.loanAmount / nftValuation.value) * 100;
            
            // Prepare data for AI analysis
            const analysisData = {
                nftValuation,
                userProfile,
                collectionProfile,
                loanRequest,
                ltvRatio,
                marketConditions: await this.getMarketConditions(),
                timestamp: new Date().toISOString()
            };

            // Generate AI prompt
            const prompt = this.generateRiskAssessmentPrompt(analysisData);
            
            // Get AI response
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const aiAnalysis = response.text();

            // Parse AI response and calculate risk score
            const riskScore = this.calculateRiskScore(analysisData, aiAnalysis);
            
            // Determine approval
            const isApproved = this.determineApproval(riskScore, ltvRatio, userProfile, collectionProfile);
            
            // Generate reason
            const reason = this.generateApprovalReason(riskScore, ltvRatio, aiAnalysis, isApproved);

            return {
                riskScore,
                isApproved,
                reason,
                aiAnalysis,
                ltvRatio,
                recommendedInterestRate: this.calculateRecommendedInterestRate(riskScore, collectionProfile),
                maxLTV: this.calculateMaxLTV(riskScore, collectionProfile),
                liquidationThreshold: this.calculateLiquidationThreshold(riskScore, collectionProfile),
                confidence: this.calculateConfidence(analysisData)
            };

        } catch (error) {
            logger.error('Failed to perform risk assessment:', error);
            
            // Fallback to basic risk assessment
            return this.performBasicRiskAssessment(loanRequest, nftValuation);
        }
    }

    /**
     * Generate AI prompt for risk assessment
     * @param {Object} analysisData - Analysis data
     * @returns {string} AI prompt
     */
    generateRiskAssessmentPrompt(analysisData) {
        return `
        You are an AI risk assessment specialist for NFT lending. Analyze the following loan request and provide a comprehensive risk assessment.

        NFT Information:
        - Contract: ${analysisData.nftValuation.contract}
        - Token ID: ${analysisData.nftValuation.tokenId}
        - Estimated Value: $${analysisData.nftValuation.value}
        - Collection: ${analysisData.nftValuation.collection}
        - Rarity Score: ${analysisData.nftValuation.rarityScore || 'Unknown'}

        User Profile:
        - Address: ${analysisData.userProfile.address}
        - Reputation Score: ${analysisData.userProfile.reputationScore}
        - Total Loans: ${analysisData.userProfile.totalLoans}
        - Repayment Rate: ${analysisData.userProfile.repaymentRate}%
        - Default Rate: ${analysisData.userProfile.defaultRate}%

        Loan Request:
        - Requested Amount: $${analysisData.loanRequest.loanAmount}
        - LTV Ratio: ${analysisData.ltvRatio.toFixed(2)}%
        - Chain: ${analysisData.loanRequest.chainId}

        Collection Risk Profile:
        - Risk Score: ${analysisData.collectionProfile.riskScore}
        - Max LTV: ${analysisData.collectionProfile.maxLTV}%
        - Risk Category: ${analysisData.collectionProfile.riskCategory}

        Market Conditions:
        - Overall Sentiment: ${analysisData.marketConditions.sentiment}
        - NFT Market Trend: ${analysisData.marketConditions.nftTrend}
        - Volatility: ${analysisData.marketConditions.volatility}

        Please provide:
        1. Overall risk assessment (1-10 scale, 10 being highest risk)
        2. Key risk factors identified
        3. Recommendations for loan terms
        4. Specific concerns or positive indicators
        5. Suggested LTV adjustments
        6. Interest rate recommendations

        Format your response as JSON with the following structure:
        {
          "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
          "riskScore": 1-10,
          "keyRiskFactors": ["factor1", "factor2"],
          "recommendations": ["rec1", "rec2"],
          "concerns": ["concern1", "concern2"],
          "positiveIndicators": ["indicator1", "indicator2"],
          "suggestedLTV": "percentage",
          "suggestedInterestRate": "percentage",
          "overallAssessment": "detailed text assessment"
        }
        `;
    }

    /**
     * Calculate risk score from analysis data and AI response
     * @param {Object} analysisData - Analysis data
     * @param {string} aiAnalysis - AI analysis response
     * @returns {number} Risk score (0-100)
     */
    calculateRiskScore(analysisData, aiAnalysis) {
        try {
            // Parse AI response
            const aiResponse = JSON.parse(aiAnalysis);
            
            // Base risk score from AI (1-10 scale to 0-100)
            let riskScore = (aiResponse.riskScore || 5) * 10;
            
            // Adjust based on LTV ratio
            if (analysisData.ltvRatio > 80) riskScore += 20;
            else if (analysisData.ltvRatio > 70) riskScore += 10;
            else if (analysisData.ltvRatio < 30) riskScore -= 10;
            
            // Adjust based on user reputation
            if (analysisData.userProfile.reputationScore < 50) riskScore += 15;
            else if (analysisData.userProfile.reputationScore > 80) riskScore -= 10;
            
            // Adjust based on collection risk
            if (analysisData.collectionProfile.riskScore > 80) riskScore += 15;
            else if (analysisData.collectionProfile.riskScore < 30) riskScore -= 10;
            
            // Adjust based on market conditions
            if (analysisData.marketConditions.sentiment === 'bearish') riskScore += 10;
            else if (analysisData.marketConditions.sentiment === 'bullish') riskScore -= 5;
            
            // Ensure score is within bounds
            return Math.max(0, Math.min(100, riskScore));
            
        } catch (error) {
            logger.error('Failed to parse AI response, using fallback calculation:', error);
            return this.calculateFallbackRiskScore(analysisData);
        }
    }

    /**
     * Calculate fallback risk score when AI analysis fails
     * @param {Object} analysisData - Analysis data
     * @returns {number} Risk score (0-100)
     */
    calculateFallbackRiskScore(analysisData) {
        let riskScore = 50; // Base neutral score
        
        // LTV adjustment
        if (analysisData.ltvRatio > 80) riskScore += 30;
        else if (analysisData.ltvRatio > 70) riskScore += 20;
        else if (analysisData.ltvRatio > 60) riskScore += 10;
        else if (analysisData.ltvRatio < 30) riskScore -= 15;
        
        // User reputation adjustment
        if (analysisData.userProfile.reputationScore < 50) riskScore += 20;
        else if (analysisData.userProfile.reputationScore > 80) riskScore -= 15;
        
        // Collection risk adjustment
        if (analysisData.collectionProfile.riskScore > 80) riskScore += 20;
        else if (analysisData.collectionProfile.riskScore < 30) riskScore -= 15;
        
        return Math.max(0, Math.min(100, riskScore));
    }

    /**
     * Determine loan approval based on risk assessment
     * @param {number} riskScore - Risk score (0-100)
     * @param {number} ltvRatio - Loan-to-value ratio
     * @param {Object} userProfile - User profile
     * @param {Object} collectionProfile - Collection risk profile
     * @returns {boolean} Whether loan is approved
     */
    determineApproval(riskScore, ltvRatio, userProfile, collectionProfile) {
        // Check risk score threshold
        if (riskScore > this.config.riskThresholds.maxRiskScore) {
            return false;
        }
        
        // Check LTV threshold
        if (ltvRatio > this.config.riskThresholds.maxLTV) {
            return false;
        }
        
        // Check user reputation
        if (userProfile.reputationScore < this.config.riskThresholds.minUserReputation) {
            return false;
        }
        
        // Check collection blacklist
        if (collectionProfile.isBlacklisted) {
            return false;
        }
        
        return true;
    }

    /**
     * Generate approval/rejection reason
     * @param {number} riskScore - Risk score
     * @param {number} ltvRatio - LTV ratio
     * @param {string} aiAnalysis - AI analysis
     * @param {boolean} isApproved - Whether loan is approved
     * @returns {string} Reason for decision
     */
    generateApprovalReason(riskScore, ltvRatio, aiAnalysis, isApproved) {
        if (isApproved) {
            return `Loan approved. Risk score: ${riskScore}, LTV: ${ltvRatio.toFixed(2)}%. AI analysis indicates acceptable risk level.`;
        } else {
            if (riskScore > this.config.riskThresholds.maxRiskScore) {
                return `Loan rejected: Risk score ${riskScore} exceeds maximum threshold of ${this.config.riskThresholds.maxRiskScore}`;
            } else if (ltvRatio > this.config.riskThresholds.maxLTV) {
                return `Loan rejected: LTV ratio ${ltvRatio.toFixed(2)}% exceeds maximum threshold of ${this.config.riskThresholds.maxLTV}%`;
            } else {
                return `Loan rejected: Risk assessment failed. Risk score: ${riskScore}, LTV: ${ltvRatio.toFixed(2)}%`;
            }
        }
    }

    /**
     * Calculate recommended interest rate
     * @param {number} riskScore - Risk score
     * @param {Object} collectionProfile - Collection risk profile
     * @returns {number} Recommended interest rate (basis points)
     */
    calculateRecommendedInterestRate(riskScore, collectionProfile) {
        let baseRate = 1200; // 12% base rate
        
        // Adjust based on risk score
        if (riskScore > 80) baseRate = Math.floor(baseRate * 1.5); // 50% increase
        else if (riskScore > 60) baseRate = Math.floor(baseRate * 1.25); // 25% increase
        else if (riskScore < 30) baseRate = Math.floor(baseRate * 0.9); // 10% decrease
        
        // Adjust based on collection profile
        if (collectionProfile.interestRateMultiplier) {
            baseRate = Math.floor(baseRate * collectionProfile.interestRateMultiplier / 100);
        }
        
        return baseRate;
    }

    /**
     * Calculate maximum LTV ratio
     * @param {number} riskScore - Risk score
     * @param {Object} collectionProfile - Collection risk profile
     * @returns {number} Maximum LTV ratio
     */
    calculateMaxLTV(riskScore, collectionProfile) {
        let maxLTV = 70; // Base 70% LTV
        
        // Adjust based on risk score
        if (riskScore > 80) maxLTV -= 20; // Reduce to 50%
        else if (riskScore > 60) maxLTV -= 10; // Reduce to 60%
        
        // Adjust based on collection profile
        if (collectionProfile.maxLTV > 0) {
            maxLTV = Math.min(maxLTV, collectionProfile.maxLTV);
        }
        
        return maxLTV;
    }

    /**
     * Calculate liquidation threshold
     * @param {number} riskScore - Risk score
     * @param {Object} collectionProfile - Collection risk profile
     * @returns {number} Liquidation threshold
     */
    calculateLiquidationThreshold(riskScore, collectionProfile) {
        const maxLTV = this.calculateMaxLTV(riskScore, collectionProfile);
        return maxLTV + 10; // 10% buffer
    }

    /**
     * Calculate confidence score
     * @param {Object} analysisData - Analysis data
     * @returns {number} Confidence score (0-100)
     */
    calculateConfidence(analysisData) {
        let confidence = 80; // Base confidence
        
        // Reduce confidence for high volatility
        if (analysisData.marketConditions.volatility > 30) {
            confidence -= 20;
        }
        
        // Reduce confidence for new users
        if (analysisData.userProfile.totalLoans < 3) {
            confidence -= 15;
        }
        
        // Reduce confidence for low liquidity collections
        if (analysisData.collectionProfile.liquidityScore < 50) {
            confidence -= 10;
        }
        
        return Math.max(0, confidence);
    }

    /**
     * Get NFT valuation from multiple sources
     * @param {string} nftContract - NFT contract address
     * @param {number} tokenId - Token ID
     * @param {number} chainId - Chain ID
     * @returns {Promise<Object>} NFT valuation data
     */
    async getNFTValuation(nftContract, tokenId, chainId) {
        try {
            // Try multiple price APIs
            const priceSources = [
                this.getNFTPriceFromOpenSea(nftContract, tokenId, chainId),
                this.getNFTPriceFromReservoir(nftContract, tokenId, chainId),
                this.getNFTPriceFromChainlink(nftContract, tokenId, chainId)
            ];

            const results = await Promise.allSettled(priceSources);
            const validPrices = results
                .filter(result => result.status === 'fulfilled' && result.value?.price > 0)
                .map(result => result.value);

            if (validPrices.length === 0) {
                throw new Error('No valid price sources available');
            }

            // Calculate median price
            const prices = validPrices.map(p => p.price).sort((a, b) => a - b);
            const medianPrice = prices[Math.floor(prices.length / 2)];

            // Get collection metadata
            const collectionMetadata = await this.getCollectionMetadata(nftContract, chainId);

            return {
                contract: nftContract,
                tokenId,
                chainId,
                price: medianPrice,
                value: medianPrice,
                collection: collectionMetadata.name,
                rarityScore: await this.calculateRarityScore(nftContract, tokenId, chainId),
                priceSources: validPrices.length,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Failed to get NFT valuation:', error);
            throw new Error(`Unable to determine NFT value: ${error.message}`);
        }
    }

    /**
     * Get user profile and reputation data
     * @param {string} userAddress - User address
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(userAddress) {
        if (this.userProfiles.has(userAddress)) {
            return this.userProfiles.get(userAddress);
        }

        // Create default profile
        const profile = {
            address: userAddress,
            reputationScore: 50,
            totalLoans: 0,
            repaidLoans: 0,
            defaultedLoans: 0,
            repaymentRate: 100,
            defaultRate: 0,
            firstSeen: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        this.userProfiles.set(userAddress, profile);
        return profile;
    }

    /**
     * Get collection risk profile
     * @param {string} nftContract - NFT contract address
     * @returns {Promise<Object>} Collection risk profile
     */
    async getCollectionRiskProfile(nftContract) {
        if (this.collectionRiskProfiles.has(nftContract)) {
            return this.collectionRiskProfiles.get(nftContract);
        }

        // Create default profile
        const profile = {
            contract: nftContract,
            riskScore: 50,
            maxLTV: 70,
            maxLoanAmount: 1000000,
            interestRateMultiplier: 100,
            isBlacklisted: false,
            riskCategory: 'MEDIUM',
            liquidityScore: 70,
            lastUpdated: new Date().toISOString()
        };

        this.collectionRiskProfiles.set(nftContract, profile);
        return profile;
    }

    /**
     * Get market conditions
     * @returns {Promise<Object>} Market conditions
     */
    async getMarketConditions() {
        // Placeholder implementation
        // In practice, this would query market sentiment APIs
        return {
            sentiment: 'neutral',
            nftTrend: 'stable',
            volatility: 25,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate loan request
     * @param {Object} loanRequest - Loan request
     */
    validateLoanRequest(loanRequest) {
        if (!loanRequest.userAddress || !ethers.utils.isAddress(loanRequest.userAddress)) {
            throw new Error('Valid user address is required');
        }
        
        if (!loanRequest.nftContract || !ethers.utils.isAddress(loanRequest.nftContract)) {
            throw new Error('Valid NFT contract address is required');
        }
        
        if (typeof loanRequest.tokenId !== 'number' || loanRequest.tokenId < 0) {
            throw new Error('Valid token ID is required');
        }
        
        if (typeof loanRequest.loanAmount !== 'number' || loanRequest.loanAmount <= 0) {
            throw new Error('Valid loan amount is required');
        }
        
        if (!loanRequest.chainId || !this.config.supportedChains.find(c => c.id === loanRequest.chainId)) {
            throw new Error('Valid chain ID is required');
        }
        
        if (!loanRequest.loanChainId || !this.config.supportedChains.find(c => c.id === loanRequest.loanChainId)) {
            throw new Error('Valid loan chain ID is required');
        }
    }

    /**
     * Validate cross-chain request
     * @param {Object} crossChainRequest - Cross-chain request
     */
    validateCrossChainRequest(crossChainRequest) {
        if (!crossChainRequest.userAddress || !ethers.utils.isAddress(crossChainRequest.userAddress)) {
            throw new Error('Valid user address is required');
        }
        
        if (!crossChainRequest.nftContract || !ethers.utils.isAddress(crossChainRequest.nftContract)) {
            throw new Error('Valid NFT contract address is required');
        }
        
        if (typeof crossChainRequest.tokenId !== 'number' || crossChainRequest.tokenId < 0) {
            throw new Error('Valid token ID is required');
        }
        
        if (typeof crossChainRequest.loanAmount !== 'number' || crossChainRequest.loanAmount <= 0) {
            throw new Error('Valid loan amount is required');
        }
        
        if (!crossChainRequest.fromChainId || !this.config.supportedChains.find(c => c.id === crossChainRequest.fromChainId)) {
            throw new Error('Valid source chain ID is required');
        }
        
        if (!crossChainRequest.toChainId || !this.config.supportedChains.find(c => c.id === crossChainRequest.toChainId)) {
            throw new Error('Valid destination chain ID is required');
        }
    }

    /**
     * Create collateral position record
     * @param {Object} loanRequest - Loan request
     * @param {Object} nftValuation - NFT valuation
     * @returns {Promise<string>} Position ID
     */
    async createCollateralPosition(loanRequest, nftValuation) {
        const positionId = ethers.utils.id(
            `${loanRequest.userAddress}-${loanRequest.nftContract}-${loanRequest.tokenId}-${Date.now()}`
        );

        const position = {
            id: positionId,
            userAddress: loanRequest.userAddress,
            nftContract: loanRequest.nftContract,
            tokenId: loanRequest.tokenId,
            chainId: loanRequest.chainId,
            nftValue: nftValuation.value,
            requestedLoanAmount: loanRequest.loanAmount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            metadata: {
                collection: nftValuation.collection,
                rarityScore: nftValuation.rarityScore
            }
        };

        this.collateralPositions.set(positionId, position);
        return positionId;
    }

    /**
     * Create loan record
     * @param {Object} loanRequest - Loan request
     * @param {string} positionId - Collateral position ID
     * @param {string} crossChainMessageId - Cross-chain message ID
     * @returns {Promise<string>} Loan ID
     */
    async createLoanRecord(loanRequest, positionId, crossChainMessageId) {
        const loanId = ethers.utils.id(
            `${loanRequest.userAddress}-${positionId}-${Date.now()}`
        );

        const loan = {
            id: loanId,
            userAddress: loanRequest.userAddress,
            positionId,
            crossChainMessageId,
            nftContract: loanRequest.nftContract,
            tokenId: loanRequest.tokenId,
            requestedAmount: loanRequest.loanAmount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            metadata: {
                fromChainId: loanRequest.chainId,
                toChainId: loanRequest.loanChainId
            }
        };

        this.activeLoans.set(loanId, loan);
        return loanId;
    }

    /**
     * Issue cross-chain loan
     * @param {Object} crossChainRequest - Cross-chain request
     * @param {Object} riskAssessment - Risk assessment
     * @returns {Promise<string>} Loan ID
     */
    async issueCrossChainLoan(crossChainRequest, riskAssessment) {
        const loanId = ethers.utils.id(
            `${crossChainRequest.userAddress}-${crossChainRequest.collateralPositionId}-${Date.now()}`
        );

        const loan = {
            id: loanId,
            userAddress: crossChainRequest.userAddress,
            collateralPositionId: crossChainRequest.collateralPositionId,
            nftContract: crossChainRequest.nftContract,
            tokenId: crossChainRequest.tokenId,
            loanAmount: crossChainRequest.loanAmount,
            interestRate: riskAssessment.recommendedInterestRate,
            maxLTV: riskAssessment.maxLTV,
            liquidationThreshold: riskAssessment.liquidationThreshold,
            status: 'active',
            isCrossChain: true,
            fromChainId: crossChainRequest.fromChainId,
            toChainId: crossChainRequest.toChainId,
            issuedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            metadata: {
                riskAssessment,
                crossChainRequest
            }
        };

        this.activeLoans.set(loanId, loan);
        return loanId;
    }

    /**
     * Calculate loan terms
     * @param {Object} loanRequest - Loan request
     * @param {Object} riskAssessment - Risk assessment
     * @returns {Object} Loan terms
     */
    calculateLoanTerms(loanRequest, riskAssessment) {
        return {
            loanAmount: loanRequest.loanAmount,
            interestRate: riskAssessment.recommendedInterestRate,
            maxLTV: riskAssessment.maxLTV,
            liquidationThreshold: riskAssessment.liquidationThreshold,
            originationFee: Math.floor(loanRequest.loanAmount * 0.02), // 2% origination fee
            totalRepayAmount: Math.floor(
                loanRequest.loanAmount * (1 + riskAssessment.recommendedInterestRate / 10000)
            ),
            loanDuration: 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
        };
    }

    /**
     * Handle cross-chain message confirmation
     * @param {Object} data - Message data
     */
    async handleCrossChainMessage(data) {
        try {
            logger.info('Handling confirmed cross-chain message:', data);

            // Update loan status based on message type
            switch (data.message.type) {
                case 'LOAN_APPROVED':
                    await this.handleLoanApproval(data.message);
                    break;
                case 'LOAN_REJECTED':
                    await this.handleLoanRejection(data.message);
                    break;
                case 'LOAN_REPAID':
                    await this.handleLoanRepayment(data.message);
                    break;
                case 'LOAN_LIQUIDATED':
                    await this.handleLoanLiquidation(data.message);
                    break;
                case 'POSITION_CLOSURE':
                    await this.handlePositionClosure(data.message);
                    break;
                default:
                    logger.warn('Unknown cross-chain message type:', data.message.type);
            }

        } catch (error) {
            logger.error('Failed to handle cross-chain message:', error);
        }
    }

    /**
     * Handle cross-chain message failure
     * @param {Object} data - Message data
     */
    async handleCrossChainMessageFailure(data) {
        try {
            logger.error('Cross-chain message failed:', data);

            // Update loan status to failed
            const loan = Array.from(this.activeLoans.values())
                .find(l => l.crossChainMessageId === data.messageId);

            if (loan) {
                loan.status = 'failed';
                loan.failedAt = new Date().toISOString();
                loan.failureReason = 'Cross-chain message failed';
            }

        } catch (error) {
            logger.error('Failed to handle cross-chain message failure:', error);
        }
    }

    /**
     * Monitor loan health
     */
    async monitorLoanHealth() {
        try {
            for (const [loanId, loan] of this.activeLoans) {
                if (loan.status !== 'active') continue;

                // Check if loan is overdue
                if (new Date() > new Date(loan.dueDate)) {
                    loan.status = 'overdue';
                    loan.overdueAt = new Date().toISOString();
                    
                    // Trigger liquidation if overdue
                    await this.triggerLiquidation(loanId, 'Loan overdue');
                }

                // Check LTV ratio
                const currentLTV = await this.calculateCurrentLTV(loan);
                if (currentLTV > loan.liquidationThreshold) {
                    await this.triggerLiquidation(loanId, 'LTV exceeded liquidation threshold');
                }
            }
        } catch (error) {
            logger.error('Failed to monitor loan health:', error);
        }
    }

    /**
     * Check for liquidation events
     */
    async checkLiquidationEvents() {
        try {
            for (const [loanId, loan] of this.activeLoans) {
                if (loan.status !== 'active') continue;

                // Check if liquidation is needed
                const shouldLiquidate = await this.shouldLiquidateLoan(loan);
                if (shouldLiquidate) {
                    await this.triggerLiquidation(loanId, 'Automatic liquidation triggered');
                }
            }
        } catch (error) {
            logger.error('Failed to check liquidation events:', error);
        }
    }

    /**
     * Trigger loan liquidation
     * @param {string} loanId - Loan ID
     * @param {string} reason - Liquidation reason
     */
    async triggerLiquidation(loanId, reason) {
        try {
            const loan = this.activeLoans.get(loanId);
            if (!loan || loan.status !== 'active') return;

            loan.status = 'liquidated';
            loan.liquidatedAt = new Date().toISOString();
            loan.liquidationReason = reason;

            // Send liquidation message if cross-chain
            if (loan.isCrossChain) {
                await this.crossChainService.sendCrossChainMessage({
                    type: 'LOAN_LIQUIDATED',
                    fromChainId: loan.toChainId,
                    toChainId: loan.fromChainId,
                    userAddress: loan.userAddress,
                    nftContract: loan.nftContract,
                    tokenId: loan.tokenId,
                    loanId: loan.id,
                    reason,
                    metadata: { liquidation: { timestamp: new Date().toISOString() } }
                });
            }

            logger.info(`Loan ${loanId} liquidated: ${reason}`);

        } catch (error) {
            logger.error('Failed to trigger liquidation:', error);
        }
    }

    /**
     * Get service statistics
     * @returns {Object} Service statistics
     */
    getStatistics() {
        const activeLoans = Array.from(this.activeLoans.values());
        const collateralPositions = Array.from(this.collateralPositions.values());
        const userProfiles = Array.from(this.userProfiles.values());

        return {
            totalActiveLoans: activeLoans.length,
            totalCollateralPositions: collateralPositions.length,
            totalUsers: userProfiles.length,
            totalCollections: this.collectionRiskProfiles.size,
            loansByStatus: this.groupByStatus(activeLoans, 'status'),
            positionsByStatus: this.groupByStatus(collateralPositions, 'status'),
            crossChainService: this.crossChainService.getStatistics()
        };
    }

    /**
     * Group items by status
     * @param {Array} items - Items to group
     * @param {string} statusKey - Status key to group by
     * @returns {Object} Grouped items
     */
    groupByStatus(items, statusKey) {
        return items.reduce((groups, item) => {
            const status = item[statusKey] || 'unknown';
            groups[status] = (groups[status] || 0) + 1;
            return groups;
        }, {});
    }

    // Placeholder methods for external integrations
    async loadCollectionRiskProfiles() {}
    async loadUserProfiles() {}
    async loadActiveLoans() {}
    async loadCollateralPositions() {}
    async getNFTPriceFromOpenSea() {}
    async getNFTPriceFromReservoir() {}
    async getNFTPriceFromChainlink() {}
    async getCollectionMetadata() {}
    async calculateRarityScore() {}
    async handleLoanApproval() {}
    async handleLoanRejection() {}
    async handleLoanRepayment() {}
    async handleLoanLiquidation() {}
    async handlePositionClosure() {}
    async calculateCurrentLTV() {}
    async shouldLiquidateLoan() {}
}

export default NFTLendingService;
