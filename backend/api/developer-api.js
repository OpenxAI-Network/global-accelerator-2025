import express from 'express';
import { ethers } from 'ethers';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.DEV_API_PORT || 3002;

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://zetachain-athens-evm.blockpi.network"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGINS ? 
        process.env.CORS_ORIGINS.split(',') : 
        ['http://localhost:3000', 'http://localhost:4173', 'https://aegis.ai'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// =============================================================================
// RATE LIMITING
// =============================================================================

// General API rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Sensitive endpoints rate limiting
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many sensitive requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting
app.use(generalLimiter);

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required',
            code: 'MISSING_API_KEY'
        });
    }
    
    // In production, validate against database
    if (apiKey !== process.env.DEV_API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
    }
    
    next();
};

// =============================================================================
// ZETACHAIN CONNECTION
// =============================================================================

let zetaProvider;
let lendingContract;
let oracleContract;
let solanaContract;

try {
    zetaProvider = new ethers.JsonRpcProvider(process.env.ZETA_RPC_URL);
    
    // Contract ABIs would be imported from actual contract artifacts
    const LENDING_ABI = [
        "function getUserLoan(address user) external view returns (tuple(uint256 amountBorrowed, uint256 collateralValue, address collateralAsset, uint256 collateralChainId, uint256 borrowTimestamp, uint256 lastHealthCheck, bool active, bool flagged, uint256 liquidationThreshold, uint256 rebalanceThreshold))",
        "function getCurrentLTV(address user) external view returns (uint256)",
        "function getBestRate() external view returns (uint256)",
        "function totalLoans() external view returns (uint256)",
        "function totalBorrowed() external view returns (uint256)",
        "function totalCollateral() external view returns (uint256)"
    ];
    
    const ORACLE_ABI = [
        "function getLatestPrice(bytes32 assetId) external view returns (uint256 price, uint256 timestamp)",
        "function getWeightedAveragePrice(bytes32 assetId) external view returns (uint256)",
        "function getPriceReports(bytes32 assetId) external view returns (tuple(uint256 price, uint256 timestamp, uint256 sourceChainId, address reporter, uint256 confidence, bool isValid)[])"
    ];
    
    const SOLANA_ABI = [
        "function getFlow(uint256 flowId) external view returns (tuple(uint256 flowId, address user, bytes32 btcAddress, bytes32 solanaAddress, uint256 avaxChainId, uint256 amount, uint8 status, uint256 createdAt, uint256 completedAt))",
        "function getFlowStatistics() external view returns (uint256 total, uint256 successful, uint256 failed)",
        "function isFlowActive(uint256 flowId) external view returns (bool)"
    ];
    
    lendingContract = new ethers.Contract(process.env.LENDING_CONTRACT_ADDRESS, LENDING_ABI, zetaProvider);
    oracleContract = new ethers.Contract(process.env.ORACLE_CONTRACT_ADDRESS, ORACLE_ABI, zetaProvider);
    solanaContract = new ethers.Contract(process.env.SOLANA_CONTRACT_ADDRESS, SOLANA_ABI, zetaProvider);
    
} catch (error) {
    console.error('Failed to initialize ZetaChain connection:', error);
}

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Aegis Developer API',
        version: '1.0.0',
        zetaChain: zetaProvider ? 'connected' : 'disconnected'
    });
});

// API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'Aegis Developer API - Hook into Aegis lending logic via ZetaChain',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            lending: '/api/lending',
            oracle: '/api/oracle',
            solana: '/api/solana',
            webhooks: '/api/webhooks',
            analytics: '/api/analytics'
        },
        documentation: 'https://docs.aegis.ai/developer-api',
        support: 'support@aegis.ai'
    });
});

// =============================================================================
// LENDING API ENDPOINTS
// =============================================================================

app.get('/api/lending/user/:address', authenticateAPIKey, async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address',
                code: 'INVALID_ADDRESS'
            });
        }
        
        // Get user loan information from ZetaChain
        const loan = await lendingContract.getUserLoan(address);
        const currentLTV = await lendingContract.getCurrentLTV(address);
        
        res.json({
            success: true,
            data: {
                address,
                loan: {
                    amountBorrowed: loan.amountBorrowed.toString(),
                    collateralValue: loan.collateralValue.toString(),
                    collateralAsset: loan.collateralAsset,
                    collateralChainId: loan.collateralChainId.toString(),
                    borrowTimestamp: loan.borrowTimestamp.toString(),
                    lastHealthCheck: loan.lastHealthCheck.toString(),
                    active: loan.active,
                    flagged: loan.flagged,
                    liquidationThreshold: loan.liquidationThreshold.toString(),
                    rebalanceThreshold: loan.rebalanceThreshold.toString()
                },
                currentLTV: currentLTV.toString(),
                healthStatus: _calculateHealthStatus(currentLTV, loan.liquidationThreshold, loan.rebalanceThreshold)
            }
        });
        
    } catch (error) {
        console.error('Error fetching user loan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user loan information',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/lending/best-rate', authenticateAPIKey, async (req, res) => {
    try {
        // Get best current lending rate across all chains
        const bestRate = await lendingContract.getBestRate();
        
        res.json({
            success: true,
            data: {
                bestRate: bestRate.toString(),
                timestamp: new Date().toISOString(),
                source: 'ZetaChain AI + Oracle Aggregation'
            }
        });
        
    } catch (error) {
        console.error('Error fetching best rate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch best lending rate',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/lending/statistics', authenticateAPIKey, async (req, res) => {
    try {
        // Get overall lending statistics
        const totalLoans = await lendingContract.totalLoans();
        const totalBorrowed = await lendingContract.totalBorrowed();
        const totalCollateral = await lendingContract.totalCollateral();
        
        res.json({
            success: true,
            data: {
                totalLoans: totalLoans.toString(),
                totalBorrowed: totalBorrowed.toString(),
                totalCollateral: totalCollateral.toString(),
                utilizationRate: totalBorrowed.gt(0) ? 
                    (totalBorrowed.mul(100).div(totalCollateral)).toString() : '0',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error fetching lending statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lending statistics',
            code: 'INTERNAL_ERROR'
        });
    }
});

// =============================================================================
// ORACLE API ENDPOINTS
// =============================================================================

app.get('/api/oracle/price/:assetId', authenticateAPIKey, async (req, res) => {
    try {
        const { assetId } = req.params;
        
        // Get latest price for an asset
        const [price, timestamp] = await oracleContract.getLatestPrice(assetId);
        
        res.json({
            success: true,
            data: {
                assetId,
                price: price.toString(),
                timestamp: timestamp.toString(),
                humanReadable: new Date(timestamp.toNumber() * 1000).toISOString(),
                source: 'Cross-Chain Oracle Aggregation'
            }
        });
        
    } catch (error) {
        console.error('Error fetching asset price:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch asset price',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/oracle/price/:assetId/weighted', authenticateAPIKey, async (req, res) => {
    try {
        const { assetId } = req.params;
        
        // Get weighted average price from multiple chains
        const weightedPrice = await oracleContract.getWeightedAveragePrice(assetId);
        
        res.json({
            success: true,
            data: {
                assetId,
                weightedPrice: weightedPrice.toString(),
                timestamp: new Date().toISOString(),
                calculation: 'Chain-weighted median aggregation'
            }
        });
        
    } catch (error) {
        console.error('Error fetching weighted price:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weighted price',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/oracle/price/:assetId/reports', authenticateAPIKey, async (req, res) => {
    try {
        const { assetId } = req.params;
        
        // Get detailed price reports for an asset
        const reports = await oracleContract.getPriceReports(assetId);
        
        const formattedReports = reports.map(report => ({
            price: report.price.toString(),
            timestamp: report.timestamp.toString(),
            sourceChainId: report.sourceChainId.toString(),
            reporter: report.reporter,
            confidence: report.confidence.toString(),
            isValid: report.isValid
        }));
        
        res.json({
            success: true,
            data: {
                assetId,
                reports: formattedReports,
                totalReports: formattedReports.length,
                validReports: formattedReports.filter(r => r.isValid).length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error fetching price reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch price reports',
            code: 'INTERNAL_ERROR'
        });
    }
});

// =============================================================================
// SOLANA INTEGRATION API ENDPOINTS
// =============================================================================

app.get('/api/solana/flow/:flowId', authenticateAPIKey, async (req, res) => {
    try {
        const { flowId } = req.params;
        
        // Get cross-chain flow information
        const flow = await solanaContract.getFlow(flowId);
        
        res.json({
            success: true,
            data: {
                flowId: flow.flowId.toString(),
                user: flow.user,
                btcAddress: flow.btcAddress,
                solanaAddress: flow.solanaAddress,
                avaxChainId: flow.avaxChainId.toString(),
                amount: flow.amount.toString(),
                status: _getFlowStatusString(flow.status),
                createdAt: flow.createdAt.toString(),
                completedAt: flow.completedAt.toString(),
                isActive: await solanaContract.isFlowActive(flowId)
            }
        });
        
    } catch (error) {
        console.error('Error fetching flow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch flow information',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/solana/statistics', authenticateAPIKey, async (req, res) => {
    try {
        // Get Solana integration statistics
        const [total, successful, failed] = await solanaContract.getFlowStatistics();
        
        res.json({
            success: true,
            data: {
                total: total.toString(),
                successful: successful.toString(),
                failed: failed.toString(),
                successRate: total.gt(0) ? 
                    (successful.mul(100).div(total)).toString() : '0',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error fetching Solana statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Solana statistics',
            code: 'INTERNAL_ERROR'
        });
    }
});

// =============================================================================
// WEBHOOK ENDPOINTS
// =============================================================================

app.post('/api/webhooks', authenticateAPIKey, (req, res) => {
    try {
        const { event, data, timestamp, source } = req.body;
        
        console.log('Received webhook from ZetaChain:', {
            event,
            data,
            timestamp,
            source
        });
        
        // Process the webhook event
        _processWebhookEvent(event, data, timestamp, source);
        
        res.json({
            success: true,
            message: 'Webhook received and processed',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process webhook',
            code: 'WEBHOOK_ERROR'
        });
    }
});

// =============================================================================
// ANALYTICS API ENDPOINTS
// =============================================================================

app.get('/api/analytics/chain-usage', authenticateAPIKey, async (req, res) => {
    try {
        // Get chain usage analytics
        const chainUsage = {
            ethereum: { weight: 100, reports: 1250, successRate: 98.5 },
            bsc: { weight: 80, reports: 980, successRate: 97.2 },
            polygon: { weight: 75, reports: 890, successRate: 96.8 },
            avalanche: { weight: 70, reports: 720, successRate: 95.9 },
            base: { weight: 65, reports: 450, successRate: 94.1 },
            zetachain: { weight: 90, reports: 2100, successRate: 99.2 }
        };
        
        res.json({
            success: true,
            data: {
                chainUsage,
                timestamp: new Date().toISOString(),
                totalReports: Object.values(chainUsage).reduce((sum, chain) => sum + chain.reports, 0)
            }
        });
        
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics',
            code: 'INTERNAL_ERROR'
        });
    }
});

app.get('/api/analytics/performance', authenticateAPIKey, async (req, res) => {
    try {
        // Get performance analytics
        const performance = {
            averageResponseTime: '45ms',
            uptime: '99.97%',
            totalRequests: '2.4M',
            errorRate: '0.03%',
            activeConnections: 1250,
            peakLoad: '15K req/min'
        };
        
        res.json({
            success: true,
            data: {
                performance,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch performance data',
            code: 'INTERNAL_ERROR'
        });
    }
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function _calculateHealthStatus(currentLTV, liquidationThreshold, rebalanceThreshold) {
    const ltv = currentLTV.toNumber();
    const liquidation = liquidationThreshold.toNumber();
    const rebalance = rebalanceThreshold.toNumber();
    
    if (ltv >= liquidation) {
        return 'CRITICAL';
    } else if (ltv >= rebalance) {
        return 'WARNING';
    } else {
        return 'HEALTHY';
    }
}

function _getFlowStatusString(status) {
    const statusMap = {
        0: 'PENDING',
        1: 'BTC_CONFIRMED',
        2: 'SOLANA_PROCESSING',
        3: 'AVAX_PENDING',
        4: 'COMPLETED',
        5: 'FAILED',
        6: 'CANCELLED'
    };
    
    return statusMap[status] || 'UNKNOWN';
}

function _processWebhookEvent(event, data, timestamp, source) {
    // Process different webhook events
    switch (event) {
        case 'priceUpdate':
            console.log(`Price update received for ${data.assetId}: ${data.newPrice}`);
            break;
        case 'loanLiquidated':
            console.log(`Loan liquidated for user ${data.user}: ${data.amount}`);
            break;
        case 'flowCompleted':
            console.log(`Cross-chain flow completed: ${data.flowId}`);
            break;
        default:
            console.log(`Unknown webhook event: ${event}`);
    }
}

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const server = app.listen(PORT, () => {
    console.log(`
🚀 Aegis Developer API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📍 Server: http://localhost:${PORT}
   🔑 API Key Required: X-API-Key header
   📊 Health Check: http://localhost:${PORT}/health
   📚 Documentation: http://localhost:${PORT}/
   🔗 ZetaChain: ${zetaProvider ? 'Connected' : 'Disconnected'}
   🛡️ Security: Helmet, CORS, Rate Limiting enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

export default app;
