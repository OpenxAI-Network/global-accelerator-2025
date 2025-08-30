import { ethers } from 'ethers';
import axios from 'axios';
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

/**
 * Cross-Chain Messaging Service for NFT Lending
 * Integrates with ZetaChain for seamless cross-chain operations
 */
class CrossChainMessagingService extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            zetaApiKey: config.ZETA_API_KEY,
            zetaApiUrl: config.ZETA_API_URL || 'https://api.zetachain.com',
            zetaGatewayAddress: config.ZETA_GATEWAY_ADDRESS,
            supportedChains: config.SUPPORTED_CHAINS || [
                { id: 1, name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/' },
                { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' },
                { id: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
                { id: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io' },
                { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org' },
                { id: 43114, name: 'Avalanche', rpc: 'https://api.avax.network/ext/bc/C/rpc' },
                { id: 56, name: 'BNB Chain', rpc: 'https://bsc-dataseed.binance.org' },
                { id: 7000, name: 'ZetaChain', rpc: 'https://zetachain-athens-evm.blockpi.network' }
            ],
            ...config
        };

        this.providers = new Map();
        this.messageQueue = new Map();
        this.pendingMessages = new Map();
        this.messageHistory = new Map();
        this.isInitialized = false;
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds

        this.initialize();
    }

    /**
     * Initialize the cross-chain messaging service
     */
    async initialize() {
        try {
            logger.info('Initializing Cross-Chain Messaging Service...');

            // Initialize providers for each supported chain
            await this.initializeProviders();

            // Start message monitoring
            this.startMessageMonitoring();

            // Start health checks
            this.startHealthChecks();

            this.isInitialized = true;
            logger.info('Cross-Chain Messaging Service initialized successfully');

            this.emit('initialized');
        } catch (error) {
            logger.error('Failed to initialize Cross-Chain Messaging Service:', error);
            this.emit('error', error);
        }
    }

    /**
     * Initialize RPC providers for each supported chain
     */
    async initializeProviders() {
        for (const chain of this.config.supportedChains) {
            try {
                const provider = new ethers.JsonRpcProvider(chain.rpc);
                this.providers.set(chain.id, {
                    provider,
                    chain,
                    isHealthy: true,
                    lastHealthCheck: Date.now()
                });
                logger.info(`Provider initialized for ${chain.name} (Chain ID: ${chain.id})`);
            } catch (error) {
                logger.error(`Failed to initialize provider for ${chain.name}:`, error);
            }
        }
    }

    /**
     * Send cross-chain message for NFT lending operations
     * @param {Object} message - Message object
     * @param {string} message.type - Message type (LOAN_REQUEST, LOAN_APPROVED, etc.)
     * @param {number} message.fromChainId - Source chain ID
     * @param {number} message.toChainId - Destination chain ID
     * @param {Object} message.payload - Message payload
     * @param {string} message.userAddress - User address
     * @param {string} message.nftContract - NFT contract address
     * @param {number} message.tokenId - NFT token ID
     * @param {number} message.loanAmount - Requested loan amount
     * @returns {Promise<Object>} Message result
     */
    async sendCrossChainMessage(message) {
        try {
            if (!this.isInitialized) {
                throw new Error('Cross-Chain Messaging Service not initialized');
            }

            // Validate message
            this.validateMessage(message);

            // Generate message ID
            const messageId = this.generateMessageId(message);

            // Add to message queue
            this.messageQueue.set(messageId, {
                ...message,
                id: messageId,
                status: 'pending',
                timestamp: Date.now(),
                attempts: 0
            });

            // Send message via ZetaChain
            const result = await this.sendViaZetaChain(message);

            // Update message status
            this.messageQueue.get(messageId).status = 'sent';
            this.messageQueue.get(messageId).zetaTxHash = result.txHash;

            // Add to pending messages for monitoring
            this.pendingMessages.set(messageId, {
                ...message,
                id: messageId,
                zetaTxHash: result.txHash,
                timestamp: Date.now()
            });

            logger.info(`Cross-chain message sent: ${messageId}`, {
                type: message.type,
                fromChain: message.fromChainId,
                toChain: message.toChainId,
                zetaTxHash: result.txHash
            });

            this.emit('messageSent', { messageId, message, result });

            return {
                messageId,
                status: 'sent',
                zetaTxHash: result.txHash,
                timestamp: Date.now()
            };

        } catch (error) {
            logger.error('Failed to send cross-chain message:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Send message via ZetaChain API
     * @param {Object} message - Message object
     * @returns {Promise<Object>} ZetaChain response
     */
    async sendViaZetaChain(message) {
        try {
            const payload = this.encodeMessagePayload(message);
            
            const response = await axios.post(`${this.config.zetaApiUrl}/v1/messages`, {
                fromChainId: message.fromChainId,
                toChainId: message.toChainId,
                payload: payload,
                gasLimit: this.calculateGasLimit(message),
                priority: this.calculatePriority(message)
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.zetaApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (response.status !== 200) {
                throw new Error(`ZetaChain API error: ${response.status}`);
            }

            return {
                txHash: response.data.txHash,
                messageId: response.data.messageId,
                status: 'pending'
            };

        } catch (error) {
            logger.error('ZetaChain API error:', error);
            throw new Error(`Failed to send via ZetaChain: ${error.message}`);
        }
    }

    /**
     * Encode message payload for cross-chain transmission
     * @param {Object} message - Message object
     * @returns {string} Encoded payload
     */
    encodeMessagePayload(message) {
        const payload = {
            version: '1.0',
            timestamp: Date.now(),
            type: message.type,
            data: {
                userAddress: message.userAddress,
                nftContract: message.nftContract,
                tokenId: message.tokenId,
                loanAmount: message.loanAmount,
                metadata: message.metadata || {}
            }
        };

        // Add type-specific data
        switch (message.type) {
            case 'LOAN_REQUEST':
                payload.data.collateralPositionId = message.collateralPositionId;
                payload.data.requestedAmount = message.loanAmount;
                break;
            case 'LOAN_APPROVED':
                payload.data.loanId = message.loanId;
                payload.data.approvedAmount = message.loanAmount;
                payload.data.interestRate = message.interestRate;
                break;
            case 'LOAN_REJECTED':
                payload.data.requestId = message.requestId;
                payload.data.reason = message.reason;
                break;
            case 'LOAN_REPAID':
                payload.data.loanId = message.loanId;
                payload.data.repaidAmount = message.repaidAmount;
                break;
            case 'LOAN_LIQUIDATED':
                payload.data.loanId = message.loanId;
                payload.data.reason = message.reason;
                break;
            case 'POSITION_CLOSURE':
                payload.data.positionId = message.positionId;
                break;
            default:
                throw new Error(`Unsupported message type: ${message.type}`);
        }

        return ethers.utils.defaultAbiCoder.encode(
            ['tuple(string,uint256,address,uint256,uint256,bytes)'],
            [
                [
                    payload.type,
                    payload.timestamp,
                    payload.data.userAddress,
                    payload.data.nftContract,
                    payload.data.tokenId,
                    ethers.utils.defaultAbiCoder.encode(
                        ['uint256', 'uint256', 'string'],
                        [
                            payload.data.loanAmount || 0,
                            payload.data.collateralPositionId || 0,
                            JSON.stringify(payload.data.metadata)
                        ]
                    )
                ]
            ]
        );
    }

    /**
     * Calculate gas limit for cross-chain message
     * @param {Object} message - Message object
     * @returns {number} Gas limit
     */
    calculateGasLimit(message) {
        const baseGas = 500000; // Base gas for cross-chain message
        
        // Add gas based on message type complexity
        switch (message.type) {
            case 'LOAN_REQUEST':
                return baseGas + 200000; // Additional gas for loan processing
            case 'LOAN_APPROVED':
                return baseGas + 150000; // Additional gas for loan issuance
            case 'LOAN_REPAID':
                return baseGas + 100000; // Additional gas for position closure
            case 'LOAN_LIQUIDATED':
                return baseGas + 300000; // Additional gas for liquidation
            default:
                return baseGas;
        }
    }

    /**
     * Calculate message priority
     * @param {Object} message - Message object
     * @returns {string} Priority level
     */
    calculatePriority(message) {
        // High priority for critical operations
        if (['LOAN_LIQUIDATED', 'POSITION_CLOSURE'].includes(message.type)) {
            return 'high';
        }
        
        // Medium priority for loan operations
        if (['LOAN_REQUEST', 'LOAN_APPROVED', 'LOAN_REPAID'].includes(message.type)) {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Start monitoring for cross-chain messages
     */
    startMessageMonitoring() {
        setInterval(async () => {
            await this.processPendingMessages();
        }, 10000); // Check every 10 seconds

        setInterval(async () => {
            await this.cleanupOldMessages();
        }, 60000); // Cleanup every minute
    }

    /**
     * Process pending cross-chain messages
     */
    async processPendingMessages() {
        for (const [messageId, message] of this.pendingMessages) {
            try {
                // Check message status on ZetaChain
                const status = await this.checkMessageStatus(message.zetaTxHash);
                
                if (status === 'confirmed') {
                    // Message confirmed, move to history
                    this.messageHistory.set(messageId, {
                        ...message,
                        status: 'confirmed',
                        confirmedAt: Date.now()
                    });
                    
                    this.pendingMessages.delete(messageId);
                    this.messageQueue.delete(messageId);
                    
                    this.emit('messageConfirmed', { messageId, message });
                    
                    logger.info(`Cross-chain message confirmed: ${messageId}`);
                } else if (status === 'failed') {
                    // Message failed, retry if possible
                    await this.handleMessageFailure(messageId, message);
                }
                
            } catch (error) {
                logger.error(`Error processing message ${messageId}:`, error);
            }
        }
    }

    /**
     * Check message status on ZetaChain
     * @param {string} zetaTxHash - ZetaChain transaction hash
     * @returns {Promise<string>} Message status
     */
    async checkMessageStatus(zetaTxHash) {
        try {
            const response = await axios.get(
                `${this.config.zetaApiUrl}/v1/messages/${zetaTxHash}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.zetaApiKey}`
                    }
                }
            );

            return response.data.status;

        } catch (error) {
            logger.error('Failed to check message status:', error);
            return 'unknown';
        }
    }

    /**
     * Handle failed cross-chain message
     * @param {string} messageId - Message ID
     * @param {Object} message - Message object
     */
    async handleMessageFailure(messageId, message) {
        const queueMessage = this.messageQueue.get(messageId);
        
        if (queueMessage && queueMessage.attempts < this.retryAttempts) {
            // Retry message
            queueMessage.attempts++;
            queueMessage.status = 'retrying';
            
            logger.info(`Retrying cross-chain message: ${messageId} (Attempt ${queueMessage.attempts})`);
            
            // Wait before retry
            setTimeout(async () => {
                try {
                    await this.sendCrossChainMessage(message);
                } catch (error) {
                    logger.error(`Retry failed for message ${messageId}:`, error);
                }
            }, this.retryDelay * queueMessage.attempts);
            
        } else {
            // Max retries reached, mark as failed
            this.messageHistory.set(messageId, {
                ...message,
                status: 'failed',
                failedAt: Date.now(),
                attempts: queueMessage?.attempts || 0
            });
            
            this.pendingMessages.delete(messageId);
            this.messageQueue.delete(messageId);
            
            this.emit('messageFailed', { messageId, message });
            
            logger.error(`Cross-chain message failed permanently: ${messageId}`);
        }
    }

    /**
     * Start health checks for all providers
     */
    startHealthChecks() {
        setInterval(async () => {
            await this.performHealthChecks();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Perform health checks for all providers
     */
    async performHealthChecks() {
        for (const [chainId, providerInfo] of this.providers) {
            try {
                const blockNumber = await providerInfo.provider.getBlockNumber();
                const currentTime = Date.now();
                
                providerInfo.isHealthy = true;
                providerInfo.lastHealthCheck = currentTime;
                providerInfo.lastBlockNumber = blockNumber;
                
            } catch (error) {
                providerInfo.isHealthy = false;
                providerInfo.lastError = error.message;
                providerInfo.lastHealthCheck = Date.now();
                
                logger.warn(`Provider health check failed for chain ${chainId}:`, error.message);
            }
        }
    }

    /**
     * Cleanup old messages from history
     */
    async cleanupOldMessages() {
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        
        for (const [messageId, message] of this.messageHistory) {
            if (message.timestamp < cutoffTime) {
                this.messageHistory.delete(messageId);
            }
        }
    }

    /**
     * Validate cross-chain message
     * @param {Object} message - Message object
     */
    validateMessage(message) {
        if (!message.type) {
            throw new Error('Message type is required');
        }
        
        if (!message.fromChainId || !message.toChainId) {
            throw new Error('Source and destination chain IDs are required');
        }
        
        if (!message.userAddress || !ethers.utils.isAddress(message.userAddress)) {
            throw new Error('Valid user address is required');
        }
        
        if (!message.nftContract || !ethers.utils.isAddress(message.nftContract)) {
            throw new Error('Valid NFT contract address is required');
        }
        
        if (typeof message.tokenId !== 'number' || message.tokenId < 0) {
            throw new Error('Valid token ID is required');
        }
        
        if (message.loanAmount && (typeof message.loanAmount !== 'number' || message.loanAmount <= 0)) {
            throw new Error('Valid loan amount is required');
        }
        
        // Validate chain IDs
        const fromChain = this.config.supportedChains.find(c => c.id === message.fromChainId);
        const toChain = this.config.supportedChains.find(c => c.id === message.toChainId);
        
        if (!fromChain) {
            throw new Error(`Unsupported source chain: ${message.fromChainId}`);
        }
        
        if (!toChain) {
            throw new Error(`Unsupported destination chain: ${message.toChainId}`);
        }
        
        if (message.fromChainId === message.toChainId) {
            throw new Error('Source and destination chains must be different');
        }
    }

    /**
     * Generate unique message ID
     * @param {Object} message - Message object
     * @returns {string} Message ID
     */
    generateMessageId(message) {
        const data = `${message.type}-${message.fromChainId}-${message.toChainId}-${message.userAddress}-${message.nftContract}-${message.tokenId}-${Date.now()}`;
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
    }

    /**
     * Get message status
     * @param {string} messageId - Message ID
     * @returns {Object} Message status
     */
    getMessageStatus(messageId) {
        if (this.messageQueue.has(messageId)) {
            return this.messageQueue.get(messageId);
        }
        
        if (this.pendingMessages.has(messageId)) {
            return this.pendingMessages.get(messageId);
        }
        
        if (this.messageHistory.has(messageId)) {
            return this.messageHistory.get(messageId);
        }
        
        return null;
    }

    /**
     * Get all messages for a user
     * @param {string} userAddress - User address
     * @returns {Array} User messages
     */
    getUserMessages(userAddress) {
        const userMessages = [];
        
        // Check message queue
        for (const [messageId, message] of this.messageQueue) {
            if (message.userAddress.toLowerCase() === userAddress.toLowerCase()) {
                userMessages.push({ ...message, messageId });
            }
        }
        
        // Check pending messages
        for (const [messageId, message] of this.pendingMessages) {
            if (message.userAddress.toLowerCase() === userAddress.toLowerCase()) {
                userMessages.push({ ...message, messageId });
            }
        }
        
        // Check message history
        for (const [messageId, message] of this.messageHistory) {
            if (message.userAddress.toLowerCase() === userAddress.toLowerCase()) {
                userMessages.push({ ...message, messageId });
            }
        }
        
        return userMessages.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get service statistics
     * @returns {Object} Service statistics
     */
    getStatistics() {
        return {
            isInitialized: this.isInitialized,
            totalMessages: this.messageQueue.size + this.pendingMessages.size + this.messageHistory.size,
            queuedMessages: this.messageQueue.size,
            pendingMessages: this.pendingMessages.size,
            confirmedMessages: Array.from(this.messageHistory.values()).filter(m => m.status === 'confirmed').length,
            failedMessages: Array.from(this.messageHistory.values()).filter(m => m.status === 'failed').length,
            healthyProviders: Array.from(this.providers.values()).filter(p => p.isHealthy).length,
            totalProviders: this.providers.size
        };
    }

    /**
     * Get provider health status
     * @returns {Array} Provider health status
     */
    getProviderHealth() {
        return Array.from(this.providers.values()).map(provider => ({
            chainId: provider.chain.id,
            chainName: provider.chain.name,
            isHealthy: provider.isHealthy,
            lastHealthCheck: provider.lastHealthCheck,
            lastBlockNumber: provider.lastBlockNumber,
            lastError: provider.lastError
        }));
    }
}

export default CrossChainMessagingService;
