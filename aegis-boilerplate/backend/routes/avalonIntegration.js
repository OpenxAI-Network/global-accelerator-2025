import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import AvalonIntegrationService from '../services/avalonIntegrationService.js';
import { authenticateUser } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/avalon/loans/create
 * @desc    Create a loan using Avalon's lending protocol
 * @access  Private
 */
router.post('/loans/create',
    authenticateUser,
    rateLimiter,
    [
        body('principal')
            .isFloat({ min: 0.01 })
            .withMessage('Valid principal amount is required'),
        body('collateralNFT')
            .isString()
            .withMessage('Collateral NFT ID is required'),
        body('durationDays')
            .isInt({ min: 1, max: 1095 })
            .withMessage('Duration must be between 1 and 1095 days'),
        body('borrowedToken')
            .optional()
            .isString()
            .withMessage('Borrowed token must be a string'),
        body('sourceChainId')
            .isInt({ min: 1 })
            .withMessage('Valid source chain ID is required'),
        body('destinationChainId')
            .isInt({ min: 1 })
            .withMessage('Valid destination chain ID is required')
    ],
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                principal,
                collateralNFT,
                durationDays,
                borrowedToken = 'ZETA',
                sourceChainId,
                destinationChainId
            } = req.body;

            const loanRequest = {
                borrowerId: req.user.address,
                principal: parseFloat(principal),
                collateralNFT,
                durationDays: parseInt(durationDays),
                borrowedToken,
                sourceChainId: parseInt(sourceChainId),
                destinationChainId: parseInt(destinationChainId)
            };

            const avalonService = req.app.locals.avalonIntegrationService;
            const result = await avalonService.createLoan(loanRequest);

            if (result.success) {
                logger.info('Avalon loan created successfully:', { 
                    userId: req.user.id, 
                    loanId: result.loanId 
                });

                res.status(201).json({
                    success: true,
                    message: 'Loan created successfully via Avalon',
                    data: {
                        loanId: result.loanId,
                        loan: result.loan,
                        crossChainMessageId: result.crossChainMessageId,
                        loanTerms: result.loanTerms
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to create loan',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Failed to create Avalon loan:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   POST /api/avalon/loans/repay
 * @desc    Repay an Avalon loan
 * @access  Private
 */
router.post('/loans/repay',
    authenticateUser,
    rateLimiter,
    [
        body('loanId')
            .isString()
            .withMessage('Valid loan ID is required'),
        body('repaymentAmount')
            .isFloat({ min: 0.01 })
            .withMessage('Valid repayment amount is required'),
        body('sourceChainId')
            .isInt({ min: 1 })
            .withMessage('Valid source chain ID is required'),
        body('destinationChainId')
            .isInt({ min: 1 })
            .withMessage('Valid destination chain ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                loanId,
                repaymentAmount,
                sourceChainId,
                destinationChainId
            } = req.body;

            const repaymentRequest = {
                loanId,
                repaymentAmount: parseFloat(repaymentAmount),
                borrowerId: req.user.address,
                sourceChainId: parseInt(sourceChainId),
                destinationChainId: parseInt(destinationChainId)
            };

            const avalonService = req.app.locals.avalonIntegrationService;
            const result = await avalonService.repayLoan(repaymentRequest);

            if (result.success) {
                logger.info('Avalon loan repaid successfully:', { 
                    userId: req.user.id, 
                    loanId,
                    repaymentAmount 
                });

                res.json({
                    success: true,
                    message: 'Loan repaid successfully',
                    data: result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to repay loan',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Failed to repay Avalon loan:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   POST /api/avalon/loans/extend
 * @desc    Extend an Avalon loan duration
 * @access  Private
 */
router.post('/loans/extend',
    authenticateUser,
    rateLimiter,
    [
        body('loanId')
            .isString()
            .withMessage('Valid loan ID is required'),
        body('extensionDays')
            .isInt({ min: 1, max: 365 })
            .withMessage('Extension must be between 1 and 365 days'),
        body('sourceChainId')
            .isInt({ min: 1 })
            .withMessage('Valid source chain ID is required'),
        body('destinationChainId')
            .isInt({ min: 1 })
            .withMessage('Valid destination chain ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                loanId,
                extensionDays,
                sourceChainId,
                destinationChainId
            } = req.body;

            const extensionRequest = {
                loanId,
                extensionDays: parseInt(extensionDays),
                borrowerId: req.user.address,
                sourceChainId: parseInt(sourceChainId),
                destinationChainId: parseInt(destinationChainId)
            };

            const avalonService = req.app.locals.avalonIntegrationService;
            const result = await avalonService.extendLoan(extensionRequest);

            if (result.success) {
                logger.info('Avalon loan extended successfully:', { 
                    userId: req.user.id, 
                    loanId,
                    extensionDays 
                });

                res.json({
                    success: true,
                    message: 'Loan extended successfully',
                    data: result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to extend loan',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Failed to extend Avalon loan:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/loans
 * @desc    Get user's Avalon loans
 * @access  Private
 */
router.get('/loans',
    authenticateUser,
    rateLimiter,
    [
        query('status')
            .optional()
            .isIn(['active', 'repaid', 'overdue', 'liquidated', 'failed'])
            .withMessage('Invalid status filter'),
        query('borrowedToken')
            .optional()
            .isString()
            .withMessage('Invalid token filter'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                status,
                borrowedToken,
                page = 1,
                limit = 20
            } = req.query;

            const avalonService = req.app.locals.avalonIntegrationService;
            const userLoans = Array.from(avalonService.activeLoans.values())
                .filter(loan => loan.borrowerId === req.user.address);

            // Apply filters
            let filteredLoans = userLoans;
            if (status) {
                filteredLoans = filteredLoans.filter(loan => loan.status === status);
            }
            if (borrowedToken) {
                filteredLoans = filteredLoans.filter(loan => loan.borrowedToken === borrowedToken);
            }

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

            // Calculate pagination info
            const totalLoans = filteredLoans.length;
            const totalPages = Math.ceil(totalLoans / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            res.json({
                success: true,
                data: {
                    loans: paginatedLoans.map(loan => ({
                        loanId: loan.loanId,
                        principal: loan.principal,
                        interestRate: loan.interestRate,
                        durationDays: loan.durationDays,
                        collateralNFT: loan.collateralNFT,
                        status: loan.status,
                        startDate: loan.startDate,
                        dueDate: loan.dueDate,
                        borrowedToken: loan.borrowedToken,
                        borrowedAmount: loan.borrowedAmount,
                        collateralValue: loan.collateralValue,
                        ltvRatio: loan.ltvRatio,
                        liquidationFlag: loan.liquidationFlag
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalLoans,
                        hasNextPage,
                        hasPrevPage,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Failed to fetch Avalon loans:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/loans/:loanId
 * @desc    Get specific Avalon loan details
 * @access  Private
 */
router.get('/loans/:loanId',
    authenticateUser,
    rateLimiter,
    [
        param('loanId')
            .isString()
            .withMessage('Valid loan ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { loanId } = req.params;
            const avalonService = req.app.locals.avalonIntegrationService;
            const loan = avalonService.activeLoans.get(loanId);

            if (!loan) {
                return res.status(404).json({
                    success: false,
                    message: 'Loan not found'
                });
            }

            // Check if user owns this loan
            if (loan.borrowerId !== req.user.address) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get collateral position
            const collateral = avalonService.collateralPositions.get(loan.collateralNFT);

            res.json({
                success: true,
                data: {
                    loan: {
                        loanId: loan.loanId,
                        principal: loan.principal,
                        interestRate: loan.interestRate,
                        durationDays: loan.durationDays,
                        collateralNFT: loan.collateralNFT,
                        status: loan.status,
                        startDate: loan.startDate,
                        dueDate: loan.dueDate,
                        borrowedToken: loan.borrowedToken,
                        borrowedAmount: loan.borrowedAmount,
                        collateralValue: loan.collateralValue,
                        ltvRatio: loan.ltvRatio,
                        liquidationFlag: loan.liquidationFlag,
                        overdueAt: loan.overdueAt,
                        repaidAt: loan.repaidAt,
                        liquidatedAt: loan.liquidatedAt,
                        liquidationReason: loan.liquidationReason
                    },
                    collateral: collateral ? {
                        id: collateral.id,
                        nft: collateral.nft,
                        status: collateral.status,
                        lockedAt: collateral.lockedAt
                    } : null
                }
            });

        } catch (error) {
            logger.error('Failed to fetch Avalon loan details:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   POST /api/avalon/collateral/lock
 * @desc    Lock NFT as collateral
 * @access  Private
 */
router.post('/collateral/lock',
    authenticateUser,
    rateLimiter,
    [
        body('nftId')
            .isString()
            .withMessage('Valid NFT ID is required'),
        body('estimatedValue')
            .isFloat({ min: 0.01 })
            .withMessage('Valid estimated value is required'),
        body('collection')
            .optional()
            .isString()
            .withMessage('Collection must be a string'),
        body('rarityScore')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('Rarity score must be between 0 and 100'),
        body('sourceChainId')
            .isInt({ min: 1 })
            .withMessage('Valid source chain ID is required'),
        body('destinationChainId')
            .isInt({ min: 1 })
            .withMessage('Valid destination chain ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                nftId,
                estimatedValue,
                collection,
                rarityScore,
                sourceChainId,
                destinationChainId
            } = req.body;

            const collateralRequest = {
                nftId,
                ownerId: req.user.address,
                estimatedValue: parseFloat(estimatedValue),
                collection,
                rarityScore: rarityScore ? parseInt(rarityScore) : undefined,
                sourceChainId: parseInt(sourceChainId),
                destinationChainId: parseInt(destinationChainId)
            };

            const avalonService = req.app.locals.avalonIntegrationService;
            const result = await avalonService.lockCollateral(collateralRequest);

            if (result.success) {
                logger.info('NFT locked as collateral successfully:', { 
                    userId: req.user.id, 
                    nftId 
                });

                res.status(201).json({
                    success: true,
                    message: 'NFT locked as collateral successfully',
                    data: result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to lock collateral',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Failed to lock collateral:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   POST /api/avalon/collateral/unlock
 * @desc    Unlock NFT collateral
 * @access  Private
 */
router.post('/collateral/unlock',
    authenticateUser,
    rateLimiter,
    [
        body('nftId')
            .isString()
            .withMessage('Valid NFT ID is required'),
        body('sourceChainId')
            .isInt({ min: 1 })
            .withMessage('Valid source chain ID is required'),
        body('destinationChainId')
            .isInt({ min: 1 })
            .withMessage('Valid destination chain ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                nftId,
                sourceChainId,
                destinationChainId
            } = req.body;

            const unlockRequest = {
                nftId,
                ownerId: req.user.address,
                sourceChainId: parseInt(sourceChainId),
                destinationChainId: parseInt(destinationChainId)
            };

            const avalonService = req.app.locals.avalonIntegrationService;
            const result = await avalonService.unlockCollateral(unlockRequest);

            if (result.success) {
                logger.info('NFT collateral unlocked successfully:', { 
                    userId: req.user.id, 
                    nftId 
                });

                res.json({
                    success: true,
                    message: 'NFT collateral unlocked successfully',
                    data: result
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to unlock collateral',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Failed to unlock collateral:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/collateral
 * @desc    Get user's collateral positions
 * @access  Private
 */
router.get('/collateral',
    authenticateUser,
    rateLimiter,
    [
        query('status')
            .optional()
            .isIn(['locked', 'available'])
            .withMessage('Invalid status filter'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                status,
                page = 1,
                limit = 20
            } = req.query;

            const avalonService = req.app.locals.avalonIntegrationService;
            const userPositions = Array.from(avalonService.collateralPositions.values())
                .filter(position => position.nft.ownerId === req.user.address);

            // Apply filters
            let filteredPositions = userPositions;
            if (status) {
                filteredPositions = filteredPositions.filter(position => position.status === status);
            }

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedPositions = filteredPositions.slice(startIndex, endIndex);

            // Calculate pagination info
            const totalPositions = filteredPositions.length;
            const totalPages = Math.ceil(totalPositions / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            res.json({
                success: true,
                data: {
                    positions: paginatedPositions.map(position => ({
                        id: position.id,
                        nft: position.nft,
                        status: position.status,
                        lockedAt: position.lockedAt
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalPositions,
                        hasNextPage,
                        hasPrevPage,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Failed to fetch collateral positions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/lending-pools
 * @desc    Get available lending pools
 * @access  Public
 */
router.get('/lending-pools',
    async (req, res) => {
        try {
            const avalonService = req.app.locals.avalonIntegrationService;
            const pools = Array.from(avalonService.lendingPools.values());

            res.json({
                success: true,
                data: {
                    pools: pools.map(pool => ({
                        poolId: pool.poolId,
                        name: pool.name,
                        token: pool.token,
                        totalLiquidity: pool.totalLiquidity,
                        totalBorrowed: pool.totalBorrowed,
                        utilizationRate: pool.utilizationRate,
                        apy: pool.apy,
                        minCollateralRatio: pool.minCollateralRatio,
                        maxLTV: pool.maxLTV
                    }))
                }
            });

        } catch (error) {
            logger.error('Failed to fetch lending pools:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/audit-logs
 * @desc    Get audit logs for user's activities
 * @access  Private
 */
router.get('/audit-logs',
    authenticateUser,
    rateLimiter,
    [
        query('loanId')
            .optional()
            .isString()
            .withMessage('Valid loan ID is required'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                loanId,
                page = 1,
                limit = 20
            } = req.query;

            const avalonService = req.app.locals.avalonIntegrationService;
            let userLogs = Array.from(avalonService.auditLogs.values());

            // Filter by user's loans
            if (loanId) {
                userLogs = userLogs.filter(log => log.loanId === loanId);
            } else {
                // Get all logs for user's loans
                const userLoanIds = Array.from(avalonService.activeLoans.values())
                    .filter(loan => loan.borrowerId === req.user.address)
                    .map(loan => loan.loanId);
                userLogs = userLogs.filter(log => 
                    userLoanIds.includes(log.loanId) || log.loanId === 'COLLATERAL'
                );
            }

            // Sort by timestamp (newest first)
            userLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedLogs = userLogs.slice(startIndex, endIndex);

            // Calculate pagination info
            const totalLogs = userLogs.length;
            const totalPages = Math.ceil(totalLogs / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            res.json({
                success: true,
                data: {
                    logs: paginatedLogs.map(log => ({
                        logId: log.logId,
                        loanId: log.loanId,
                        action: log.action,
                        timestamp: log.timestamp,
                        details: log.details
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalLogs,
                        hasNextPage,
                        hasPrevPage,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Failed to fetch audit logs:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/cross-chain-events
 * @desc    Get cross-chain events for user
 * @access  Private
 */
router.get('/cross-chain-events',
    authenticateUser,
    rateLimiter,
    [
        query('chain')
            .optional()
            .isString()
            .withMessage('Chain must be a string'),
        query('action')
            .optional()
            .isString()
            .withMessage('Action must be a string'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                chain,
                action,
                page = 1,
                limit = 20
            } = req.query;

            const avalonService = req.app.locals.avalonIntegrationService;
            let userEvents = Array.from(avalonService.crossChainEvents.values());

            // Filter by user's loans
            const userLoanIds = Array.from(avalonService.activeLoans.values())
                .filter(loan => loan.borrowerId === req.user.address)
                .map(loan => loan.loanId);
            userEvents = userEvents.filter(event => 
                userLoanIds.includes(event.loanId) || event.nftId
            );

            // Apply filters
            if (chain) {
                userEvents = userEvents.filter(event => event.chain === chain);
            }
            if (action) {
                userEvents = userEvents.filter(event => event.action === action);
            }

            // Sort by timestamp (newest first)
            userEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedEvents = userEvents.slice(startIndex, endIndex);

            // Calculate pagination info
            const totalEvents = userEvents.length;
            const totalPages = Math.ceil(totalEvents / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            res.json({
                success: true,
                data: {
                    events: paginatedEvents.map(event => ({
                        eventId: event.eventId,
                        chain: event.chain,
                        action: event.action,
                        loanId: event.loanId,
                        nftId: event.nftId,
                        timestamp: event.timestamp,
                        status: event.status
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalEvents,
                        hasNextPage,
                        hasPrevPage,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Failed to fetch cross-chain events:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/statistics
 * @desc    Get Avalon integration statistics
 * @access  Private
 */
router.get('/statistics',
    authenticateUser,
    rateLimiter,
    async (req, res) => {
        try {
            const avalonService = req.app.locals.avalonIntegrationService;
            const stats = avalonService.getStatistics();

            // Filter user-specific statistics
            const userLoans = Array.from(avalonService.activeLoans.values())
                .filter(loan => loan.borrowerId === req.user.address);
            
            const userPositions = Array.from(avalonService.collateralPositions.values())
                .filter(position => position.nft.ownerId === req.user.address);

            const userStats = {
                totalLoans: userLoans.length,
                activeLoans: userLoans.filter(loan => loan.status === 'active').length,
                repaidLoans: userLoans.filter(loan => loan.status === 'repaid').length,
                overdueLoans: userLoans.filter(loan => loan.status === 'overdue').length,
                liquidatedLoans: userLoans.filter(loan => loan.status === 'liquidated').length,
                totalPositions: userPositions.length,
                lockedPositions: userPositions.filter(pos => pos.status === 'locked').length,
                availablePositions: userPositions.filter(pos => pos.status === 'available').length,
                totalBorrowed: userLoans.reduce((sum, loan) => sum + loan.borrowedAmount, 0),
                totalCollateralValue: userPositions.reduce((sum, pos) => sum + pos.nft.valuedUSD, 0)
            };

            res.json({
                success: true,
                data: {
                    user: userStats,
                    global: {
                        totalActiveLoans: stats.totalActiveLoans,
                        totalLoans: stats.totalLoans,
                        totalCollateralPositions: stats.totalCollateralPositions,
                        totalUsers: stats.totalUsers,
                        totalLendingPools: stats.totalLendingPools,
                        totalLiquidity: stats.totalLiquidity,
                        totalBorrowed: stats.totalBorrowed,
                        loansByStatus: stats.loansByStatus,
                        positionsByStatus: stats.positionsByStatus
                    },
                    crossChain: {
                        totalEvents: stats.crossChainEvents,
                        totalAuditLogs: stats.auditLogs
                    }
                }
            });

        } catch (error) {
            logger.error('Failed to fetch Avalon statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        }
    }
);

/**
 * @route   GET /api/avalon/health
 * @desc    Get Avalon integration service health status
 * @access  Public
 */
router.get('/health',
    async (req, res) => {
        try {
            const avalonService = req.app.locals.avalonIntegrationService;
            const stats = avalonService.getStatistics();

            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                service: {
                    activeLoans: stats.totalActiveLoans,
                    totalLoans: stats.totalLoans,
                    collateralPositions: stats.totalCollateralPositions,
                    lendingPools: stats.totalLendingPools,
                    crossChainEvents: stats.crossChainEvents,
                    auditLogs: stats.auditLogs,
                    lastActivity: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Avalon health check failed:', error);
            res.status(500).json({
                success: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }
);

export default router;
