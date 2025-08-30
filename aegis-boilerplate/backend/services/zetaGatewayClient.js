import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

/**
 * ZetaGatewayClient - Client for interacting with ZetaChain's cross-chain gateway
 * Handles cross-chain messaging, event listening, and state synchronization
 */
class ZetaGatewayClient extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 second
        this.heartbeatInterval = null;
        this.messageQueue = [];
        this.pendingMessages = new Map();
        this.messageIdCounter = 0;
        
        // Bind methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.reconnect = this.reconnect.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.processMessage = this.processMessage.bind(this);
        this.handleHeartbeat = this.handleHeartbeat.bind(this);
    }

    /**
     * Initialize the ZetaGateway client
     */
    async initialize() {
        try {
            logger.info('Initializing ZetaGateway client...');
            
            // Validate configuration
            this.validateConfig();
            
            // Connect to gateway
            await this.connect();
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Process queued messages
            this.processMessageQueue();
            
            logger.info('ZetaGateway client initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ZetaGateway client:', error);
            throw error;
        }
    }

    /**
     * Validate client configuration
     */
    validateConfig() {
        if (!this.config.gateway) {
            throw new Error('Gateway URL is required');
        }
        if (!this.config.apiKey) {
            throw new Error('API key is required');
        }
        if (!this.config.supportedChains || !Array.isArray(this.config.supportedChains)) {
            throw new Error('Supported chains configuration is required');
        }
    }

    /**
     * Connect to ZetaChain gateway
     */
    async connect() {
        try {
            logger.info('Connecting to ZetaChain gateway...');
            
            // Simulate connection (in real implementation, this would be WebSocket or HTTP connection)
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Emit connection event
            this.emit('connected');
            
            logger.info('Connected to ZetaChain gateway');
        } catch (error) {
            logger.error('Failed to connect to ZetaChain gateway:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Disconnect from gateway
     */
    async disconnect() {
        try {
            logger.info('Disconnecting from ZetaChain gateway...');
            
            this.isConnected = false;
            
            // Stop heartbeat
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            
            // Emit disconnect event
            this.emit('disconnected');
            
            logger.info('Disconnected from ZetaChain gateway');
        } catch (error) {
            logger.error('Error disconnecting from gateway:', error);
        }
    }

    /**
     * Attempt to reconnect
     */
    async reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached');
            this.emit('reconnect_failed');
            return;
        }

        try {
            this.reconnectAttempts++;
            logger.info(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            // Wait before reconnecting
            await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));
            
            await this.connect();
        } catch (error) {
            logger.error('Reconnection failed:', error);
            // Schedule next reconnection attempt
            setTimeout(() => this.reconnect(), this.reconnectDelay * this.reconnectAttempts);
        }
    }

    /**
     * Send cross-chain message
     * @param {Object} message - Message to send
     * @returns {Promise<Object>} - Message result
     */
    async sendMessage(message) {
        try {
            if (!this.isConnected) {
                // Queue message if not connected
                this.messageQueue.push(message);
                throw new Error('Gateway not connected, message queued');
            }

            // Generate message ID
            const messageId = this.generateMessageId();
            
            // Add to pending messages
            this.pendingMessages.set(messageId, {
                message,
                timestamp: Date.now(),
                status: 'pending'
            });

            // Validate message
            this.validateMessage(message);

            // Simulate message sending (in real implementation, this would send to ZetaChain)
            const result = await this.simulateMessageSend(message, messageId);
            
            // Update pending message status
            if (this.pendingMessages.has(messageId)) {
                this.pendingMessages.get(messageId).status = 'sent';
            }

            // Emit message sent event
            this.emit('message_sent', { messageId, message, result });

            logger.info(`Cross-chain message sent: ${messageId}`, { type: message.type, result });
            
            return {
                success: true,
                messageId,
                result
            };
        } catch (error) {
            logger.error('Failed to send cross-chain message:', error);
            
            // Emit message failed event
            this.emit('message_failed', { message, error: error.message });
            
            throw error;
        }
    }

    /**
     * Simulate message sending (placeholder for real ZetaChain integration)
     * @param {Object} message - Message to send
     * @param {string} messageId - Message ID
     * @returns {Promise<Object>} - Simulated result
     */
    async simulateMessageSend(message, messageId) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate
        
        if (!success) {
            throw new Error('Simulated network failure');
        }

        // Return simulated result
        return {
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            blockNumber: Math.floor(Math.random() * 1000000),
            gasUsed: Math.floor(Math.random() * 100000),
            status: 'success'
        };
    }

    /**
     * Process incoming cross-chain message
     * @param {Object} message - Incoming message
     */
    async processMessage(message) {
        try {
            logger.info('Processing incoming cross-chain message:', message.type);
            
            // Validate incoming message
            this.validateIncomingMessage(message);
            
            // Emit message received event
            this.emit('message_received', message);
            
            // Process based on message type
            switch (message.type) {
                case 'AVALON_LOAN_CREATED':
                    await this.handleLoanCreated(message);
                    break;
                case 'AVALON_LOAN_REPAID':
                    await this.handleLoanRepaid(message);
                    break;
                case 'AVALON_LOAN_EXTENDED':
                    await this.handleLoanExtended(message);
                    break;
                case 'AVALON_COLLATERAL_LOCKED':
                    await this.handleCollateralLocked(message);
                    break;
                case 'AVALON_COLLATERAL_UNLOCKED':
                    await this.handleCollateralUnlocked(message);
                    break;
                case 'AVALON_LOAN_LIQUIDATED':
                    await this.handleLoanLiquidated(message);
                    break;
                default:
                    logger.warn('Unknown message type:', message.type);
            }
            
            // Emit message processed event
            this.emit('message_processed', message);
            
        } catch (error) {
            logger.error('Error processing cross-chain message:', error);
            
            // Emit message processing failed event
            this.emit('message_processing_failed', { message, error: error.message });
        }
    }

    /**
     * Handle loan created message
     * @param {Object} message - Loan created message
     */
    async handleLoanCreated(message) {
        logger.info('Handling loan created message:', message.loanId);
        
        // Emit specific event for loan creation
        this.emit('loan_created', {
            loanId: message.loanId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Handle loan repaid message
     * @param {Object} message - Loan repaid message
     */
    async handleLoanRepaid(message) {
        logger.info('Handling loan repaid message:', message.loanId);
        
        // Emit specific event for loan repayment
        this.emit('loan_repaid', {
            loanId: message.loanId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Handle loan extended message
     * @param {Object} message - Loan extended message
     */
    async handleLoanExtended(message) {
        logger.info('Handling loan extended message:', message.loanId);
        
        // Emit specific event for loan extension
        this.emit('loan_extended', {
            loanId: message.loanId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Handle collateral locked message
     * @param {Object} message - Collateral locked message
     */
    async handleCollateralLocked(message) {
        logger.info('Handling collateral locked message:', message.nftId);
        
        // Emit specific event for collateral lock
        this.emit('collateral_locked', {
            nftId: message.nftId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Handle collateral unlocked message
     * @param {Object} message - Collateral unlocked message
     */
    async handleCollateralUnlocked(message) {
        logger.info('Handling collateral unlocked message:', message.nftId);
        
        // Emit specific event for collateral unlock
        this.emit('collateral_unlocked', {
            nftId: message.nftId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Handle loan liquidated message
     * @param {Object} message - Loan liquidated message
     */
    async handleLoanLiquidated(message) {
        logger.info('Handling loan liquidated message:', message.loanId);
        
        // Emit specific event for loan liquidation
        this.emit('loan_liquidated', {
            loanId: message.loanId,
            data: message.data,
            timestamp: Date.now()
        });
    }

    /**
     * Start heartbeat to maintain connection
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(this.handleHeartbeat, 30000); // 30 seconds
    }

    /**
     * Handle heartbeat
     */
    async handleHeartbeat() {
        try {
            if (!this.isConnected) {
                logger.warn('Gateway not connected, attempting reconnection...');
                await this.reconnect();
                return;
            }

            // Simulate heartbeat (in real implementation, this would ping the gateway)
            logger.debug('Heartbeat sent to ZetaChain gateway');
            
        } catch (error) {
            logger.error('Heartbeat failed:', error);
            this.isConnected = false;
            this.emit('connection_lost');
            
            // Attempt reconnection
            await this.reconnect();
        }
    }

    /**
     * Process queued messages
     */
    async processMessageQueue() {
        if (this.messageQueue.length === 0) return;

        logger.info(`Processing ${this.messageQueue.length} queued messages`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];

        for (const message of messages) {
            try {
                await this.sendMessage(message);
            } catch (error) {
                logger.error('Failed to process queued message:', error);
                // Re-queue failed messages
                this.messageQueue.push(message);
            }
        }
    }

    /**
     * Generate unique message ID
     * @returns {string} - Message ID
     */
    generateMessageId() {
        this.messageIdCounter++;
        return `msg_${Date.now()}_${this.messageIdCounter}`;
    }

    /**
     * Validate outgoing message
     * @param {Object} message - Message to validate
     */
    validateMessage(message) {
        if (!message.type) {
            throw new Error('Message type is required');
        }
        if (!message.data) {
            throw new Error('Message data is required');
        }
        if (message.sourceChainId && !this.isChainSupported(message.sourceChainId)) {
            throw new Error('Source chain not supported');
        }
        if (message.destinationChainId && !this.isChainSupported(message.destinationChainId)) {
            throw new Error('Destination chain not supported');
        }
    }

    /**
     * Validate incoming message
     * @param {Object} message - Message to validate
     */
    validateIncomingMessage(message) {
        if (!message.type) {
            throw new Error('Incoming message type is required');
        }
        if (!message.timestamp) {
            throw new Error('Incoming message timestamp is required');
        }
    }

    /**
     * Check if chain is supported
     * @param {number} chainId - Chain ID to check
     * @returns {boolean} - True if supported
     */
    isChainSupported(chainId) {
        return this.config.supportedChains.some(chain => chain.id === chainId);
    }

    /**
     * Get connection status
     * @returns {Object} - Connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            pendingMessages: this.pendingMessages.size,
            queuedMessages: this.messageQueue.length,
            supportedChains: this.config.supportedChains
        };
    }

    /**
     * Get pending messages
     * @returns {Array} - Array of pending messages
     */
    getPendingMessages() {
        return Array.from(this.pendingMessages.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    /**
     * Clear pending messages
     */
    clearPendingMessages() {
        this.pendingMessages.clear();
        logger.info('Pending messages cleared');
    }

    /**
     * Shutdown client
     */
    async shutdown() {
        try {
            logger.info('Shutting down ZetaGateway client...');
            
            await this.disconnect();
            
            // Clear intervals
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
            }
            
            // Clear event listeners
            this.removeAllListeners();
            
            logger.info('ZetaGateway client shutdown complete');
        } catch (error) {
            logger.error('Error during shutdown:', error);
        }
    }
}

export default ZetaGatewayClient;
