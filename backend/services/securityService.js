import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createHash } from 'crypto';

/**
 * Aegis Security Service
 * Provides comprehensive security features for the backend API
 */
class SecurityService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
        this.rateLimiters = new Map();
        this.blacklistedTokens = new Set();
        this.securityEvents = [];
        this.maxSecurityEvents = 1000;
        
        // Initialize security configurations
        this.initializeSecurityConfigs();
    }

    /**
     * Initialize security configurations
     */
    initializeSecurityConfigs() {
        // API rate limiting
        this.rateLimiters.set('api', rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 200, // limit each IP to 200 requests per windowMs
            message: 'Too many requests from this IP, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.logSecurityEvent('RATE_LIMIT_EXCEEDED', req.ip, {
                    path: req.path,
                    method: req.method,
                    userAgent: req.get('User-Agent')
                });
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: Math.ceil(15 * 60 / 1000)
                });
            }
        }));

        // Authentication rate limiting
        this.rateLimiters.set('auth', rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 auth attempts per windowMs
            message: 'Too many authentication attempts, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', req.ip, {
                    path: req.path,
                    method: req.method
                });
                res.status(429).json({
                    error: 'Too many authentication attempts',
                    retryAfter: Math.ceil(15 * 60 / 1000)
                });
            }
        }));

        // Admin operations rate limiting
        this.rateLimiters.set('admin', rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 10, // limit each IP to 10 admin operations per hour
            message: 'Too many admin operations, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.logSecurityEvent('ADMIN_RATE_LIMIT_EXCEEDED', req.ip, {
                    path: req.path,
                    method: req.method,
                    user: req.user?.address
                });
                res.status(429).json({
                    error: 'Too many admin operations',
                    retryAfter: Math.ceil(60 * 60 / 1000)
                });
            }
        }));
    }

    /**
     * Get Helmet configuration for security headers
     */
    getHelmetConfig() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "wss:", "https:"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            noSniff: true,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
        });
    }

    /**
     * Get rate limiter by type
     */
    getRateLimiter(type) {
        return this.rateLimiters.get(type) || this.rateLimiters.get('api');
    }

    /**
     * Generate JWT token
     */
    generateToken(payload, expiresIn = '24h') {
        try {
            return jwt.sign(payload, this.jwtSecret, {
                expiresIn,
                issuer: 'aegis-ai',
                audience: 'aegis-users'
            });
        } catch (error) {
            this.logSecurityEvent('JWT_GENERATION_FAILED', 'system', { error: error.message });
            throw new Error('Failed to generate authentication token');
        }
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            // Check if token is blacklisted
            if (this.blacklistedTokens.has(token)) {
                this.logSecurityEvent('BLACKLISTED_TOKEN_USED', 'unknown', { token: this.hashToken(token) });
                throw new Error('Token has been revoked');
            }

            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'aegis-ai',
                audience: 'aegis-users'
            });

            return decoded;
        } catch (error) {
            this.logSecurityEvent('JWT_VERIFICATION_FAILED', 'unknown', { 
                error: error.message,
                token: this.hashToken(token)
            });
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Blacklist a token
     */
    blacklistToken(token) {
        this.blacklistedTokens.add(token);
        this.logSecurityEvent('TOKEN_BLACKLISTED', 'system', { 
            token: this.hashToken(token)
        });
        
        // Clean up old blacklisted tokens periodically
        if (this.blacklistedTokens.size > 10000) {
            this.cleanupBlacklistedTokens();
        }
    }

    /**
     * Clean up old blacklisted tokens
     */
    cleanupBlacklistedTokens() {
        // Keep only the last 5000 tokens
        const tokensArray = Array.from(this.blacklistedTokens);
        this.blacklistedTokens.clear();
        tokensArray.slice(-5000).forEach(token => this.blacklistedTokens.add(token));
    }

    /**
     * Hash token for logging (security)
     */
    hashToken(token) {
        return createHash('sha256').update(token).digest('hex').substring(0, 8);
    }

    /**
     * Validate input data
     */
    validateInput(data, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            if (value !== undefined && value !== null) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }
                
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be no more than ${rules.maxLength} characters`);
                }
                
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${field} format is invalid`);
                }
                
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }
        
        if (errors.length > 0) {
            this.logSecurityEvent('INPUT_VALIDATION_FAILED', 'unknown', { errors });
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        
        return true;
    }

    /**
     * Sanitize user input
     */
    sanitizeInput(input) {
        if (typeof input === 'string') {
            // Remove potential XSS vectors
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        return input;
    }

    /**
     * Validate Ethereum address
     */
    validateEthereumAddress(address) {
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!ethAddressRegex.test(address)) {
            this.logSecurityEvent('INVALID_ETH_ADDRESS', 'unknown', { address });
            throw new Error('Invalid Ethereum address format');
        }
        return true;
    }

    /**
     * Validate chain ID
     */
    validateChainId(chainId) {
        const validChainIds = [1, 137, 56, 42161, 10, 8453, 59144]; // Mainnet, Polygon, BSC, Arbitrum, Optimism, Base, Linea
        if (!validChainIds.includes(Number(chainId))) {
            this.logSecurityEvent('INVALID_CHAIN_ID', 'unknown', { chainId });
            throw new Error('Unsupported chain ID');
        }
        return true;
    }

    /**
     * Secure API call to ZetaChain
     */
    async secureZetaChainCall(endpoint, data, apiKey) {
        try {
            const timestamp = Date.now();
            const nonce = crypto.randomBytes(16).toString('hex');
            
            // Create signature for API call
            const payload = JSON.stringify({
                ...data,
                timestamp,
                nonce
            });
            
            const signature = crypto
                .createHmac('sha256', apiKey)
                .update(payload)
                .digest('hex');
            
            const response = await fetch(`${process.env.ZETA_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey,
                    'X-Timestamp': timestamp,
                    'X-Nonce': nonce,
                    'X-Signature': signature
                },
                body: payload,
                timeout: 10000 // 10 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`ZetaChain API error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Log successful API call
            this.logSecurityEvent('ZETA_API_CALL_SUCCESS', 'system', {
                endpoint,
                timestamp,
                nonce
            });
            
            return result;
            
        } catch (error) {
            this.logSecurityEvent('ZETA_API_CALL_FAILED', 'system', {
                endpoint,
                error: error.message
            });
            throw new Error(`Failed to communicate with ZetaChain: ${error.message}`);
        }
    }

    /**
     * Log security event
     */
    logSecurityEvent(type, source, details) {
        const event = {
            id: crypto.randomUUID(),
            type,
            source,
            details,
            timestamp: new Date().toISOString(),
            ip: details.ip || 'unknown'
        };
        
        this.securityEvents.push(event);
        
        // Keep only the last N events
        if (this.securityEvents.length > this.maxSecurityEvents) {
            this.securityEvents = this.securityEvents.slice(-this.maxSecurityEvents);
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔒 Security Event [${type}]:`, event);
        }
        
        // In production, you might want to send this to a security monitoring service
        // this.sendToSecurityMonitoring(event);
    }

    /**
     * Get security events
     */
    getSecurityEvents(limit = 100, type = null) {
        let events = this.securityEvents;
        
        if (type) {
            events = events.filter(event => event.type === type);
        }
        
        return events.slice(-limit).reverse();
    }

    /**
     * Get security statistics
     */
    getSecurityStats() {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recentEvents = this.securityEvents.filter(
            event => new Date(event.timestamp) > last24h
        );
        
        const eventCounts = {};
        recentEvents.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        return {
            totalEvents: this.securityEvents.length,
            eventsLast24h: recentEvents.length,
            eventCounts,
            blacklistedTokens: this.blacklistedTokens.size,
            rateLimiters: Array.from(this.rateLimiters.keys())
        };
    }

    /**
     * Middleware for JWT authentication
     */
    authenticateToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
            
            if (!token) {
                this.logSecurityEvent('MISSING_AUTH_TOKEN', req.ip, {
                    path: req.path,
                    method: req.method
                });
                return res.status(401).json({ error: 'Access token required' });
            }
            
            const decoded = this.verifyToken(token);
            req.user = decoded;
            next();
            
        } catch (error) {
            this.logSecurityEvent('AUTH_FAILED', req.ip, {
                path: req.path,
                method: req.method,
                error: error.message
            });
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    /**
     * Middleware for admin role verification
     */
    requireAdminRole(req, res, next) {
        if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
            this.logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', req.ip, {
                path: req.path,
                method: req.method,
                user: req.user?.address
            });
            return res.status(403).json({ error: 'Admin role required' });
        }
        next();
    }

    /**
     * Middleware for input validation
     */
    validateInputMiddleware(schema) {
        return (req, res, next) => {
            try {
                const data = { ...req.body, ...req.params, ...req.query };
                this.validateInput(data, schema);
                next();
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
        };
    }
}

export default SecurityService;
