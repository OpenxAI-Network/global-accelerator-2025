import { ethers } from 'ethers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import CrossChainMessagingService from './crossChainMessagingService.js';

class AvalonIntegrationService {
    constructor(config) {
        this.config = config;
        this.gemini = new GoogleGenerativeAI(config.geminiApiKey);
        this.crossChainService = new CrossChainMessagingService(config.zetaChainConfig);
        
        // Mock data storage
        this.userProfiles = new Map();
        this.collateralPositions = new Map();
        this.activeLoans = new Map();
        this.lendingPools = new Map();
        this.auditLogs = [];
        this.crossChainEvents = [];
        
        // Service state
        this.isInitialized = false;
        this.monitoringInterval = null;
    }

    async initialize() {
        try {
            logger.info('Initializing Avalon Integration Service...');
            
            // Initialize cross-chain messaging
            await this.crossChainService.initialize();
            
            // Load mock data
            await this.loadMockData();
            
            // Start monitoring
            this.startMonitoring();
            
            this.isInitialized = true;
            logger.info('Avalon Integration Service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize Avalon Integration Service:', error);
            throw error;
        }
    }

    async loadMockData() {
        // Mock users
        const users = [
            {
                userId: "0xA1B2C3D4E5F6",
                name: "Alice",
                avatar: "https://api.adorable.io/avatars/80/alice.png",
                reputationScore: 85,
                totalLoans: 3,
                repaidLoans: 2,
                defaultedLoans: 0
            },
            {
                userId: "0xB7C8D9E0F1A2",
                name: "Bob",
                avatar: "https://api.adorable.io/avatars/80/bob.png",
                reputationScore: 92,
                totalLoans: 5,
                repaidLoans: 4,
                defaultedLoans: 0
            },
            {
                userId: "0xC3D4E5F6A1B2",
                name: "Charlie",
                avatar: "https://api.adorable.io/avatars/80/charlie.png",
                reputationScore: 78,
                totalLoans: 2,
                repaidLoans: 1,
                defaultedLoans: 1
            }
        ];

        // Mock NFTs
        const nfts = [
            {
                nftId: "2149",
                name: "Avalon Dragon #2149",
                ownerId: "0xA1B2C3D4E5F6",
                image: "https://nft.avalon.xyz/images/dragons/2149.png",
                valuedUSD: 5000,
                locked: true,
                collection: "Avalon Dragons",
                rarityScore: 85
            },
            {
                nftId: "3178",
                name: "Avalon Wizard #3178",
                ownerId: "0xC3D4E5F6A1B2",
                image: "https://nft.avalon.xyz/images/wizards/3178.png",
                valuedUSD: 12000,
                locked: false,
                collection: "Avalon Wizards",
                rarityScore: 92
            }
        ];

        // Mock loans
        const loans = [
            {
                loanId: "LN1001",
                borrowerId: "0xA1B2C3D4E5F6",
                principal: 2000,
                interestRate: 0.07,
                durationDays: 30,
                collateralNFT: "2149",
                status: "active",
                borrowedToken: "ZETA",
                borrowedAmount: 2000,
                collateralValue: 5000,
                ltvRatio: 40,
                startDate: "2025-08-01",
                dueDate: "2025-08-31",
                liquidationFlag: false
            },
            {
                loanId: "LN1002",
                borrowerId: "0xB7C8D9E0F1A2",
                principal: 5000,
                interestRate: 0.10,
                durationDays: 60,
                collateralNFT: "3178",
                status: "repaid",
                borrowedToken: "ZETA",
                borrowedAmount: 5000,
                collateralValue: 12000,
                ltvRatio: 41.67,
                startDate: "2025-07-01",
                dueDate: "2025-08-30",
                liquidationFlag: false
            }
        ];

        // Mock lending pools
        const pools = [
            {
                poolId: "POOL001",
                name: "ZETA Lending Pool",
                token: "ZETA",
                totalLiquidity: 1000000,
                totalBorrowed: 750000,
                utilizationRate: 75,
                apy: 0.08,
                maxLTV: 66.67
            }
        ];

        // Load data into maps
        users.forEach(user => this.userProfiles.set(user.userId, user));
        nfts.forEach(nft => this.collateralPositions.set(nft.nftId, nft));
        loans.forEach(loan => this.activeLoans.set(loan.loanId, loan));
        pools.forEach(pool => this.lendingPools.set(pool.poolId, pool));

        logger.info('Mock data loaded successfully');
    }

    startMonitoring() {
        // Monitor loan health every 5 minutes
        this.monitoringInterval = setInterval(async () => {
            await this.monitorLoanHealth();
        }, 5 * 60 * 1000);
    }

    async createLoan(loanRequest) {
        try {
            logger.info('Creating loan:', loanRequest);

            // Validate request
            this.validateLoanRequest(loanRequest);

            // Check collateral availability
            const collateral = this.collateralPositions.get(loanRequest.collateralNFT);
            if (!collateral || collateral.locked) {
                throw new Error('Collateral NFT not available');
            }

            // Calculate loan terms
            const loanTerms = this.calculateLoanTerms(loanRequest);

            // Create loan record
            const loanId = `LN${Date.now()}`;
            const loan = {
                loanId,
                borrowerId: loanRequest.borrowerId,
                principal: loanRequest.principal,
                interestRate: loanTerms.interestRate,
                durationDays: loanRequest.durationDays,
                collateralNFT: loanRequest.collateralNFT,
                status: "active",
                borrowedToken: loanRequest.borrowedToken || "ZETA",
                borrowedAmount: loanRequest.principal,
                collateralValue: collateral.valuedUSD,
                ltvRatio: (loanRequest.principal / collateral.valuedUSD) * 100,
                startDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + loanRequest.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                liquidationFlag: false,
                sourceChainId: loanRequest.sourceChainId,
                destinationChainId: loanRequest.destinationChainId
            };

            // Lock collateral
            collateral.locked = true;
            collateral.ownerId = loanRequest.borrowerId;

            // Store loan
            this.activeLoans.set(loanId, loan);

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_LOAN_CREATED',
                loanId,
                data: loan
            });

            // Create audit log
            this.createAuditLog(loanId, 'Loan Created', loan);

            logger.info('Loan created successfully:', loanId);
            return { success: true, loanId, loan };
        } catch (error) {
            logger.error('Failed to create loan:', error);
            throw error;
        }
    }

    async repayLoan(repaymentRequest) {
        try {
            logger.info('Processing loan repayment:', repaymentRequest);

            const loan = this.activeLoans.get(repaymentRequest.loanId);
            if (!loan) {
                throw new Error('Loan not found');
            }

            if (loan.status !== 'active') {
                throw new Error('Loan is not active');
            }

            // Calculate repayment
            const totalOwed = loan.principal * (1 + loan.interestRate * (loan.durationDays / 365));
            const remainingAmount = totalOwed - repaymentRequest.repaymentAmount;

            if (remainingAmount <= 0) {
                // Full repayment
                loan.status = 'repaid';
                loan.principal = 0;
                
                // Unlock collateral
                const collateral = this.collateralPositions.get(loan.collateralNFT);
                if (collateral) {
                    collateral.locked = false;
                }
            } else {
                // Partial repayment
                loan.principal = remainingAmount;
            }

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_LOAN_REPAID',
                loanId: repaymentRequest.loanId,
                data: { repaymentAmount: repaymentRequest.repaymentAmount, remainingAmount }
            });

            // Create audit log
            this.createAuditLog(repaymentRequest.loanId, 'Loan Repaid', { repaymentAmount: repaymentRequest.repaymentAmount });

            logger.info('Loan repayment processed successfully');
            return { success: true, remainingAmount };
        } catch (error) {
            logger.error('Failed to process loan repayment:', error);
            throw error;
        }
    }

    async extendLoan(extensionRequest) {
        try {
            logger.info('Processing loan extension:', extensionRequest);

            const loan = this.activeLoans.get(extensionRequest.loanId);
            if (!loan) {
                throw new Error('Loan not found');
            }

            if (loan.status !== 'active') {
                throw new Error('Loan is not active');
            }

            // Calculate extension fee
            const extensionFee = this.calculateExtensionFee(loan, extensionRequest.extraDays);

            // Extend loan
            loan.durationDays += extensionRequest.extraDays;
            loan.dueDate = new Date(Date.now() + loan.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_LOAN_EXTENDED',
                loanId: extensionRequest.loanId,
                data: { extraDays: extensionRequest.extraDays, newDueDate: loan.dueDate }
            });

            // Create audit log
            this.createAuditLog(extensionRequest.loanId, 'Loan Extended', { extraDays: extensionRequest.extraDays, extensionFee });

            logger.info('Loan extension processed successfully');
            return { success: true, newDueDate: loan.dueDate, extensionFee };
        } catch (error) {
            logger.error('Failed to process loan extension:', error);
            throw error;
        }
    }

    async lockCollateral(lockRequest) {
        try {
            logger.info('Locking collateral:', lockRequest);

            const nft = this.collateralPositions.get(lockRequest.nftId);
            if (!nft) {
                throw new Error('NFT not found');
            }

            if (nft.locked) {
                throw new Error('NFT already locked');
            }

            // Lock NFT
            nft.locked = true;
            nft.ownerId = lockRequest.userId;

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_COLLATERAL_LOCKED',
                nftId: lockRequest.nftId,
                data: { userId: lockRequest.userId, chainId: lockRequest.chainId }
            });

            // Create audit log
            this.createAuditLog(null, 'Collateral Locked', { nftId: lockRequest.nftId, userId: lockRequest.userId });

            logger.info('Collateral locked successfully');
            return { success: true };
        } catch (error) {
            logger.error('Failed to lock collateral:', error);
            throw error;
        }
    }

    async unlockCollateral(unlockRequest) {
        try {
            logger.info('Unlocking collateral:', unlockRequest);

            const nft = this.collateralPositions.get(unlockRequest.nftId);
            if (!nft) {
                throw new Error('NFT not found');
            }

            if (!nft.locked) {
                throw new Error('NFT not locked');
            }

            // Check if any active loans use this collateral
            const activeLoan = Array.from(this.activeLoans.values()).find(loan => 
                loan.collateralNFT === unlockRequest.nftId && loan.status === 'active'
            );

            if (activeLoan) {
                throw new Error('Cannot unlock collateral with active loan');
            }

            // Unlock NFT
            nft.locked = false;

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_COLLATERAL_UNLOCKED',
                nftId: unlockRequest.nftId,
                data: { userId: unlockRequest.userId, chainId: unlockRequest.chainId }
            });

            // Create audit log
            this.createAuditLog(null, 'Collateral Unlocked', { nftId: unlockRequest.nftId, userId: unlockRequest.userId });

            logger.info('Collateral unlocked successfully');
            return { success: true };
        } catch (error) {
            logger.error('Failed to unlock collateral:', error);
            throw error;
        }
    }

    async getLoans(userId, filters = {}) {
        let loans = Array.from(this.activeLoans.values());

        if (userId) {
            loans = loans.filter(loan => loan.borrowerId === userId);
        }

        if (filters.status) {
            loans = loans.filter(loan => loan.status === filters.status);
        }

        if (filters.chainId) {
            loans = loans.filter(loan => loan.sourceChainId === filters.chainId || loan.destinationChainId === filters.chainId);
        }

        return loans;
    }

    async getCollateralPositions(userId) {
        let positions = Array.from(this.collateralPositions.values());

        if (userId) {
            positions = positions.filter(pos => pos.ownerId === userId);
        }

        return positions;
    }

    async getLendingPools() {
        return Array.from(this.lendingPools.values());
    }

    async getAuditLogs(filters = {}) {
        let logs = [...this.auditLogs];

        if (filters.loanId) {
            logs = logs.filter(log => log.loanId === filters.loanId);
        }

        if (filters.action) {
            logs = logs.filter(log => log.action === filters.action);
        }

        if (filters.startDate && filters.endDate) {
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= new Date(filters.startDate) && logDate <= new Date(filters.endDate);
            });
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async getCrossChainEvents(filters = {}) {
        let events = [...this.crossChainEvents];

        if (filters.chainId) {
            events = events.filter(event => event.chainId === filters.chainId);
        }

        if (filters.type) {
            events = events.filter(event => event.type === filters.type);
        }

        return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async getStatistics(userId = null) {
        const allLoans = Array.from(this.activeLoans.values());
        const allPositions = Array.from(this.collateralPositions.values());
        const allPools = Array.from(this.lendingPools.values());

        const userStats = userId ? {
            totalLoans: allLoans.filter(loan => loan.borrowerId === userId).length,
            activeLoans: allLoans.filter(loan => loan.borrowerId === userId && loan.status === 'active').length,
            totalBorrowed: allLoans.filter(loan => loan.borrowerId === userId).reduce((sum, loan) => sum + loan.principal, 0),
            totalCollateral: allPositions.filter(pos => pos.ownerId === userId && pos.locked).reduce((sum, pos) => sum + pos.valuedUSD, 0)
        } : null;

        const globalStats = {
            totalLoans: allLoans.length,
            activeLoans: allLoans.filter(loan => loan.status === 'active').length,
            totalBorrowed: allLoans.reduce((sum, loan) => sum + loan.principal, 0),
            totalCollateral: allPositions.filter(pos => pos.locked).reduce((sum, pos) => sum + pos.valuedUSD, 0),
            totalLiquidity: allPools.reduce((sum, pool) => sum + pool.totalLiquidity, 0),
            totalUtilization: allPools.reduce((sum, pool) => sum + pool.utilizationRate, 0) / allPools.length
        };

        return { user: userStats, global: globalStats };
    }

    async monitorLoanHealth() {
        try {
            const activeLoans = Array.from(this.activeLoans.values()).filter(loan => loan.status === 'active');
            
            for (const loan of activeLoans) {
                // Check if loan is overdue
                const dueDate = new Date(loan.dueDate);
                const now = new Date();
                
                if (now > dueDate) {
                    await this.triggerLiquidation(loan.loanId, 'Loan overdue');
                }

                // Check LTV ratio
                const currentLTV = await this.calculateCurrentLTV(loan);
                if (currentLTV > 80) { // 80% threshold
                    await this.triggerLiquidation(loan.loanId, 'LTV exceeded threshold');
                }
            }
        } catch (error) {
            logger.error('Error monitoring loan health:', error);
        }
    }

    async triggerLiquidation(loanId, reason) {
        try {
            const loan = this.activeLoans.get(loanId);
            if (!loan || loan.status !== 'active') {
                return;
            }

            loan.status = 'liquidated';
            loan.liquidationFlag = true;

            // Send cross-chain message
            await this.sendCrossChainMessage({
                type: 'AVALON_LOAN_LIQUIDATED',
                loanId,
                data: { reason, timestamp: new Date().toISOString() }
            });

            // Create audit log
            this.createAuditLog(loanId, 'Loan Liquidated', { reason });

            logger.info(`Loan ${loanId} liquidated: ${reason}`);
        } catch (error) {
            logger.error('Error triggering liquidation:', error);
        }
    }

    async sendCrossChainMessage(message) {
        try {
            const result = await this.crossChainService.sendCrossChainMessage(message);
            
            // Store cross-chain event
            this.crossChainEvents.push({
                eventId: `EVT${Date.now()}`,
                type: message.type,
                chainId: message.data?.chainId || 1,
                action: message.type,
                loanId: message.loanId,
                nftId: message.data?.nftId,
                timestamp: new Date().toISOString(),
                data: message.data
            });

            return result;
        } catch (error) {
            logger.error('Failed to send cross-chain message:', error);
            throw error;
        }
    }

    validateLoanRequest(loanRequest) {
        if (!loanRequest.borrowerId) {
            throw new Error('Borrower ID is required');
        }
        if (!loanRequest.principal || loanRequest.principal <= 0) {
            throw new Error('Valid principal amount is required');
        }
        if (!loanRequest.collateralNFT) {
            throw new Error('Collateral NFT is required');
        }
        if (!loanRequest.durationDays || loanRequest.durationDays <= 0) {
            throw new Error('Valid duration is required');
        }
    }

    calculateLoanTerms(loanRequest) {
        // Simple interest rate calculation based on duration and amount
        let baseRate = 0.05; // 5% base rate
        
        if (loanRequest.durationDays > 90) {
            baseRate += 0.02; // +2% for long-term loans
        }
        
        if (loanRequest.principal > 10000) {
            baseRate -= 0.01; // -1% for large loans
        }

        return {
            interestRate: Math.max(baseRate, 0.03), // Minimum 3%
            maxLTV: 66.67,
            liquidationThreshold: 80
        };
    }

    calculateExtensionFee(loan, extraDays) {
        const baseFee = loan.principal * 0.01; // 1% base fee
        const dailyFee = (loan.principal * loan.interestRate * extraDays) / 365;
        return baseFee + dailyFee;
    }

    async calculateCurrentLTV(loan) {
        const collateral = this.collateralPositions.get(loan.collateralNFT);
        if (!collateral) {
            return 100; // 100% LTV if collateral not found
        }

        // Calculate accrued interest
        const startDate = new Date(loan.startDate);
        const now = new Date();
        const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
        const accruedInterest = loan.principal * loan.interestRate * (daysElapsed / 365);
        
        const totalOwed = loan.principal + accruedInterest;
        return (totalOwed / collateral.valuedUSD) * 100;
    }

    createAuditLog(loanId, action, data) {
        const log = {
            logId: `LOG${Date.now()}`,
            loanId,
            action,
            timestamp: new Date().toISOString(),
            data
        };
        
        this.auditLogs.push(log);
        
        // Keep only last 1000 logs
        if (this.auditLogs.length > 1000) {
            this.auditLogs = this.auditLogs.slice(-1000);
        }
    }

    async getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                crossChainMessaging: this.crossChainService.isInitialized,
                mockData: this.userProfiles.size > 0,
                monitoring: !!this.monitoringInterval
            },
            metrics: {
                totalUsers: this.userProfiles.size,
                totalLoans: this.activeLoans.size,
                totalCollateral: this.collateralPositions.size,
                totalAuditLogs: this.auditLogs.length,
                totalCrossChainEvents: this.crossChainEvents.length
            }
        };
    }

    async shutdown() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.crossChainService) {
            await this.crossChainService.shutdown();
        }
        
        logger.info('Avalon Integration Service shutdown complete');
    }
}

export default AvalonIntegrationService;
