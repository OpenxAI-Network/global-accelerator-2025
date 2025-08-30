/**
 * @title Bitcoin Integration for Aegis Cross-Chain Lending
 * @dev This module handles Bitcoin deposits using ZetaChain's native BTC support
 * and communicates with the Gateway API for cross-chain lending operations.
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

// ============ TYPES ============

export interface BTCTransaction {
    txid: string;
    from: string;
    to: string;
    amount: number;
    confirmations: number;
    blockHeight: number;
    timestamp: number;
    fee: number;
}

export interface BTCDeposit {
    user: string;
    amount: number;
    txid: string;
    confirmations: number;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'locked' | 'unlocked';
    lockTime?: number;
    unlockTime?: number;
}

export interface CrossChainMessage {
    messageId: string;
    fromChain: string;
    toChain: string;
    messageType: 'DEPOSIT' | 'WITHDRAW' | 'LOAN_CREATE' | 'LOAN_REPAY' | 'LIQUIDATION';
    data: any;
    timestamp: number;
    status: 'pending' | 'sent' | 'received' | 'processed' | 'failed';
}

export interface ZetaChainConfig {
    gatewayUrl: string;
    apiKey: string;
    network: 'mainnet' | 'testnet';
    btcVaultAddress: string;
    minConfirmations: number;
    lockPeriod: number; // in seconds
}

// ============ BITCOIN INTEGRATION CLASS ============

export class BitcoinIntegration extends EventEmitter {
    private config: ZetaChainConfig;
    private deposits: Map<string, BTCDeposit> = new Map();
    private crossChainMessages: Map<string, CrossChainMessage> = new Map();
    private isMonitoring: boolean = false;
    private messageCounter: number = 0;

    constructor(config: ZetaChainConfig) {
        super();
        this.config = config;
        this.validateConfig();
    }

    // ============ CORE FUNCTIONS ============

    /**
     * Start monitoring Bitcoin addresses for deposits
     */
    public async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            throw new Error('Bitcoin monitoring is already active');
        }

        try {
            console.log('🚀 Starting Bitcoin monitoring for address:', this.config.btcVaultAddress);
            
            // Initialize ZetaChain connection
            await this.initializeZetaChainConnection();
            
            // Start monitoring the BTC vault address
            await this.monitorBTCAddress(this.config.btcVaultAddress);
            
            this.isMonitoring = true;
            console.log('✅ Bitcoin monitoring started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start Bitcoin monitoring:', error);
            throw error;
        }
    }

    /**
     * Stop monitoring Bitcoin addresses
     */
    public async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) {
            return;
        }

        try {
            console.log('🛑 Stopping Bitcoin monitoring...');
            
            // Stop monitoring processes
            this.isMonitoring = false;
            
            // Clean up connections
            await this.cleanupConnections();
            
            console.log('✅ Bitcoin monitoring stopped successfully');
            
        } catch (error) {
            console.error('❌ Error stopping Bitcoin monitoring:', error);
            throw error;
        }
    }

    /**
     * Process a Bitcoin deposit and lock it in ZetaChain
     */
    public async processBTCDeposit(tx: BTCTransaction): Promise<void> {
        try {
            console.log(`💰 Processing BTC deposit: ${tx.amount} BTC from ${tx.from}`);
            
            // Validate transaction
            if (!this.validateBTCTransaction(tx)) {
                throw new Error('Invalid BTC transaction');
            }
            
            // Check if transaction is already processed
            if (this.deposits.has(tx.txid)) {
                console.log(`⚠️ Transaction ${tx.txid} already processed`);
                return;
            }
            
            // Wait for required confirmations
            if (tx.confirmations < this.config.minConfirmations) {
                console.log(`⏳ Waiting for confirmations: ${tx.confirmations}/${this.config.minConfirmations}`);
                return;
            }
            
            // Create deposit record
            const deposit: BTCDeposit = {
                user: tx.from,
                amount: tx.amount,
                txid: tx.txid,
                confirmations: tx.confirmations,
                timestamp: tx.timestamp,
                status: 'confirmed',
                lockTime: tx.timestamp,
                unlockTime: tx.timestamp + this.config.lockPeriod
            };
            
            // Store deposit
            this.deposits.set(tx.txid, deposit);
            
            // Lock BTC in ZetaChain
            await this.lockBTCInZetaChain(deposit);
            
            // Send cross-chain message to ZetaChain
            await this.sendCrossChainMessage('zeta', 'DEPOSIT', {
                user: deposit.user,
                asset: 'BTC',
                amount: deposit.amount,
                chainId: 'bitcoin',
                txid: deposit.txid,
                lockTime: deposit.lockTime
            });
            
            // Update deposit status
            deposit.status = 'locked';
            this.deposits.set(tx.txid, deposit);
            
            // Emit deposit event
            this.emit('btcDeposited', deposit);
            
            console.log(`✅ BTC deposit processed and locked: ${deposit.amount} BTC`);
            
        } catch (error) {
            console.error('❌ Error processing BTC deposit:', error);
            throw error;
        }
    }

    /**
     * Unlock BTC from ZetaChain (for withdrawals or liquidations)
     */
    public async unlockBTCFromZetaChain(
        user: string,
        amount: number,
        reason: 'withdrawal' | 'liquidation'
    ): Promise<void> {
        try {
            console.log(`🔓 Unlocking BTC: ${amount} BTC for user ${user} (${reason})`);
            
            // Find user's locked deposits
            const userDeposits = Array.from(this.deposits.values())
                .filter(d => d.user === user && d.status === 'locked');
            
            if (userDeposits.length === 0) {
                throw new Error('No locked BTC deposits found for user');
            }
            
            // Calculate total locked amount
            const totalLocked = userDeposits.reduce((sum, d) => sum + d.amount, 0);
            
            if (totalLocked < amount) {
                throw new Error(`Insufficient locked BTC: ${totalLocked} < ${amount}`);
            }
            
            // Unlock BTC in ZetaChain
            await this.unlockBTCInZetaChain(user, amount, reason);
            
            // Update deposit statuses
            let remainingAmount = amount;
            for (const deposit of userDeposits) {
                if (remainingAmount <= 0) break;
                
                const unlockAmount = Math.min(deposit.amount, remainingAmount);
                deposit.amount -= unlockAmount;
                remainingAmount -= unlockAmount;
                
                if (deposit.amount === 0) {
                    deposit.status = 'unlocked';
                }
                
                this.deposits.set(deposit.txid, deposit);
            }
            
            // Send cross-chain message
            await this.sendCrossChainMessage('zeta', 'WITHDRAW', {
                user,
                asset: 'BTC',
                amount,
                chainId: 'bitcoin',
                reason
            });
            
            console.log(`✅ BTC unlocked successfully: ${amount} BTC`);
            
        } catch (error) {
            console.error('❌ Error unlocking BTC:', error);
            throw error;
        }
    }

    /**
     * Get user's BTC deposit information
     */
    public getUserBTCDeposits(user: string): BTCDeposit[] {
        return Array.from(this.deposits.values())
            .filter(d => d.user === user)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get all BTC deposits
     */
    public getAllBTCDeposits(): BTCDeposit[] {
        return Array.from(this.deposits.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get BTC vault statistics
     */
    public getBTCVaultStats(): {
        totalDeposits: number;
        totalLocked: number;
        totalUnlocked: number;
        activeUsers: number;
        averageLockTime: number;
    } {
        const deposits = Array.from(this.deposits.values());
        const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalLocked = deposits
            .filter(d => d.status === 'locked')
            .reduce((sum, d) => sum + d.amount, 0);
        const totalUnlocked = deposits
            .filter(d => d.status === 'unlocked')
            .reduce((sum, d) => sum + d.amount, 0);
        
        const activeUsers = new Set(
            deposits
                .filter(d => d.status === 'locked')
                .map(d => d.user)
        ).size;
        
        const lockedDeposits = deposits.filter(d => d.status === 'locked');
        const averageLockTime = lockedDeposits.length > 0
            ? lockedDeposits.reduce((sum, d) => sum + (Date.now() / 1000 - d.lockTime!), 0) / lockedDeposits.length
            : 0;
        
        return {
            totalDeposits,
            totalLocked,
            totalUnlocked,
            activeUsers,
            averageLockTime
        };
    }

    // ============ ZETACHAIN INTEGRATION ============

    /**
     * Initialize connection to ZetaChain
     */
    private async initializeZetaChainConnection(): Promise<void> {
        try {
            console.log('🔗 Initializing ZetaChain connection...');
            
            // Test connection to ZetaChain Gateway
            const response = await fetch(`${this.config.gatewayUrl}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`ZetaChain Gateway health check failed: ${response.statusText}`);
            }
            
            console.log('✅ ZetaChain connection established');
            
        } catch (error) {
            console.error('❌ Failed to connect to ZetaChain:', error);
            throw error;
        }
    }

    /**
     * Lock BTC in ZetaChain
     */
    private async lockBTCInZetaChain(deposit: BTCDeposit): Promise<void> {
        try {
            console.log(`🔒 Locking BTC in ZetaChain: ${deposit.amount} BTC`);
            
            const response = await fetch(`${this.config.gatewayUrl}/btc/lock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: deposit.user,
                    amount: deposit.amount,
                    txid: deposit.txid,
                    lockTime: deposit.lockTime,
                    unlockTime: deposit.unlockTime
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to lock BTC in ZetaChain: ${error}`);
            }
            
            console.log('✅ BTC locked in ZetaChain successfully');
            
        } catch (error) {
            console.error('❌ Error locking BTC in ZetaChain:', error);
            throw error;
        }
    }

    /**
     * Unlock BTC from ZetaChain
     */
    private async unlockBTCInZetaChain(
        user: string,
        amount: number,
        reason: string
    ): Promise<void> {
        try {
            console.log(`🔓 Unlocking BTC from ZetaChain: ${amount} BTC`);
            
            const response = await fetch(`${this.config.gatewayUrl}/btc/unlock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user,
                    amount,
                    reason,
                    unlockTime: Date.now() / 1000
                })
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to unlock BTC from ZetaChain: ${error}`);
            }
            
            console.log('✅ BTC unlocked from ZetaChain successfully');
            
        } catch (error) {
            console.error('❌ Error unlocking BTC from ZetaChain:', error);
            throw error;
        }
    }

    // ============ CROSS-CHAIN MESSAGING ============

    /**
     * Send cross-chain message to ZetaChain
     */
    private async sendCrossChainMessage(
        targetChain: string,
        messageType: string,
        data: any
    ): Promise<void> {
        try {
            this.messageCounter++;
            const messageId = `btc_${this.messageCounter}_${Date.now()}`;
            
            const message: CrossChainMessage = {
                messageId,
                fromChain: 'bitcoin',
                toChain: targetChain,
                messageType: messageType as any,
                data,
                timestamp: Date.now(),
                status: 'pending'
            };
            
            // Store message
            this.crossChainMessages.set(messageId, message);
            
            // Send to ZetaChain Gateway
            const response = await fetch(`${this.config.gatewayUrl}/message/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to send cross-chain message: ${response.statusText}`);
            }
            
            // Update message status
            message.status = 'sent';
            this.crossChainMessages.set(messageId, message);
            
            // Emit message sent event
            this.emit('crossChainMessageSent', message);
            
            console.log(`📤 Cross-chain message sent: ${messageType} to ${targetChain}`);
            
        } catch (error) {
            console.error('❌ Error sending cross-chain message:', error);
            throw error;
        }
    }

    /**
     * Receive cross-chain message from ZetaChain
     */
    public async receiveCrossChainMessage(message: CrossChainMessage): Promise<void> {
        try {
            console.log(`📥 Received cross-chain message: ${message.messageType} from ${message.fromChain}`);
            
            // Store message
            this.crossChainMessages.set(message.messageId, message);
            
            // Process message based on type
            switch (message.messageType) {
                case 'LOAN_APPROVAL':
                    await this.processLoanApproval(message.data);
                    break;
                case 'LIQUIDATION':
                    await this.processLiquidation(message.data);
                    break;
                default:
                    console.log(`⚠️ Unknown message type: ${message.messageType}`);
            }
            
            // Update message status
            message.status = 'processed';
            this.crossChainMessages.set(message.messageId, message);
            
            // Emit message received event
            this.emit('crossChainMessageReceived', message);
            
        } catch (error) {
            console.error('❌ Error processing cross-chain message:', error);
            message.status = 'failed';
            this.crossChainMessages.set(message.messageId, message);
            throw error;
        }
    }

    // ============ MESSAGE PROCESSING ============

    /**
     * Process loan approval message from ZetaChain
     */
    private async processLoanApproval(data: any): Promise<void> {
        try {
            console.log(`✅ Processing loan approval: ${data.amount} ${data.asset} for ${data.user}`);
            
            // In a real implementation, this would:
            // 1. Verify the user has sufficient BTC collateral
            // 2. Update the user's loan status
            // 3. Potentially unlock some BTC for the loan
            
            this.emit('loanApproved', data);
            
        } catch (error) {
            console.error('❌ Error processing loan approval:', error);
            throw error;
        }
    }

    /**
     * Process liquidation message from ZetaChain
     */
    private async processLiquidation(data: any): Promise<void> {
        try {
            console.log(`💀 Processing liquidation: ${data.amount} ${data.asset} for ${data.user}`);
            
            // In a real implementation, this would:
            // 1. Seize the user's BTC collateral
            // 2. Transfer it to the liquidator
            // 3. Update the user's status
            
            await this.unlockBTCFromZetaChain(data.user, data.amount, 'liquidation');
            
            this.emit('liquidationExecuted', data);
            
        } catch (error) {
            console.error('❌ Error processing liquidation:', error);
            throw error;
        }
    }

    // ============ BITCOIN MONITORING ============

    /**
     * Monitor BTC address for deposits
     */
    private async monitorBTCAddress(address: string): Promise<void> {
        try {
            console.log(`👀 Monitoring BTC address: ${address}`);
            
            // In a real implementation, this would:
            // 1. Connect to Bitcoin node or API
            // 2. Watch for new transactions to the address
            // 3. Process incoming deposits
            
            // For demo purposes, simulate monitoring
            this.simulateBTCMonitoring(address);
            
        } catch (error) {
            console.error('❌ Error monitoring BTC address:', error);
            throw error;
        }
    }

    /**
     * Simulate BTC monitoring for demo purposes
     */
    private simulateBTCMonitoring(address: string): void {
        // Simulate incoming BTC deposits every 30 seconds
        setInterval(() => {
            if (!this.isMonitoring) return;
            
            // Generate mock transaction
            const mockTx: BTCTransaction = {
                txid: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                from: `mock_user_${Math.random().toString(36).substr(2, 9)}`,
                to: address,
                amount: Math.random() * 0.1 + 0.001, // 0.001 to 0.101 BTC
                confirmations: 6,
                blockHeight: 800000 + Math.floor(Math.random() * 1000),
                timestamp: Date.now() / 1000,
                fee: 0.00001
            };
            
            // Process the mock transaction
            this.processBTCDeposit(mockTx);
            
        }, 30000); // 30 seconds
    }

    // ============ VALIDATION FUNCTIONS ============

    /**
     * Validate configuration
     */
    private validateConfig(): void {
        if (!this.config.gatewayUrl) {
            throw new Error('ZetaChain Gateway URL is required');
        }
        if (!this.config.apiKey) {
            throw new Error('ZetaChain API key is required');
        }
        if (!this.config.btcVaultAddress) {
            throw new Error('BTC vault address is required');
        }
        if (this.config.minConfirmations < 1) {
            throw new Error('Minimum confirmations must be at least 1');
        }
        if (this.config.lockPeriod < 3600) {
            throw new Error('Lock period must be at least 1 hour');
        }
    }

    /**
     * Validate BTC transaction
     */
    private validateBTCTransaction(tx: BTCTransaction): boolean {
        if (!tx.txid || tx.txid.length !== 64) return false;
        if (!tx.from || tx.from.length < 26) return false;
        if (!tx.to || tx.to.length < 26) return false;
        if (tx.amount <= 0) return false;
        if (tx.confirmations < 0) return false;
        if (tx.blockHeight < 0) return false;
        if (tx.timestamp <= 0) return false;
        if (tx.fee < 0) return false;
        
        return true;
    }

    // ============ UTILITY FUNCTIONS ============

    /**
     * Clean up connections
     */
    private async cleanupConnections(): Promise<void> {
        try {
            // Close any open connections
            console.log('🧹 Cleaning up connections...');
            
            // In a real implementation, this would close:
            // - Bitcoin node connections
            // - ZetaChain Gateway connections
            // - Database connections
            
        } catch (error) {
            console.error('❌ Error cleaning up connections:', error);
        }
    }

    /**
     * Generate unique message ID
     */
    private generateMessageId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const hash = createHash('sha256')
            .update(`${timestamp}_${random}`)
            .digest('hex')
            .substr(0, 16);
        
        return `btc_${hash}`;
    }

    /**
     * Get cross-chain message by ID
     */
    public getCrossChainMessage(messageId: string): CrossChainMessage | undefined {
        return this.crossChainMessages.get(messageId);
    }

    /**
     * Get all cross-chain messages
     */
    public getAllCrossChainMessages(): CrossChainMessage[] {
        return Array.from(this.crossChainMessages.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }
}

// ============ EXPORT DEFAULT CONFIG ============

export const defaultZetaChainConfig: ZetaChainConfig = {
    gatewayUrl: 'https://gateway.zetachain.com',
    apiKey: process.env.ZETACHAIN_API_KEY || 'demo_key',
    network: 'testnet',
    btcVaultAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minConfirmations: 6,
    lockPeriod: 7 * 24 * 3600 // 7 days in seconds
};

// ============ EXPORT FACTORY FUNCTION ============

export function createBitcoinIntegration(config?: Partial<ZetaChainConfig>): BitcoinIntegration {
    const finalConfig = { ...defaultZetaChainConfig, ...config };
    return new BitcoinIntegration(finalConfig);
}
