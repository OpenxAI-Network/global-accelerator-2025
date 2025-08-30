import { ethers } from 'ethers';
import { EventEmitter } from 'events';

export interface ZetaChainConfig {
  rpcUrl: string;
  chainId: number;
  gatewayAddress: string;
  universalLendingAddress: string;
  privateKey?: string;
  gasLimit: number;
  gasPrice: number;
}

export interface CrossChainMessage {
  messageId: string;
  fromChain: string;
  toChain: string;
  messageType: 'DEPOSIT' | 'WITHDRAW' | 'LOAN_CREATE' | 'LOAN_REPAY' | 'LIQUIDATION' | 'RISK_ASSESSMENT';
  data: any;
  timestamp: number;
  status: 'pending' | 'sent' | 'confirmed' | 'failed';
  gasUsed?: number;
  transactionHash?: string;
}

export interface ZetaChainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ChainStatus {
  chainId: string;
  chainName: string;
  isOnline: boolean;
  blockHeight: number;
  gasPrice: string;
  lastUpdate: number;
  latency: number;
}

export class ZetaChainGateway extends EventEmitter {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet | ethers.providers.JsonRpcSigner;
  private config: ZetaChainConfig;
  private messageQueue: Map<string, CrossChainMessage> = new Map();
  private chainStatuses: Map<string, ChainStatus> = new Map();
  private isConnected: boolean = false;
  private reconnectInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: ZetaChainConfig) {
    super();
    this.config = config;
    this.initializeProvider();
    this.startHealthChecks();
  }

  // ============ INITIALIZATION ============

  private async initializeProvider() {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
      
      if (this.config.privateKey) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
      } else {
        this.signer = this.provider.getSigner();
      }

      // Test connection
      const network = await this.provider.getNetwork();
      if (network.chainId !== this.config.chainId) {
        throw new Error(`Chain ID mismatch: expected ${this.config.chainId}, got ${network.chainId}`);
      }

      this.isConnected = true;
      this.emit('connected', { chainId: network.chainId, rpcUrl: this.config.rpcUrl });
      
      // Start monitoring
      this.startBlockMonitoring();
      this.startMessageProcessing();
      
    } catch (error) {
      console.error('Failed to initialize ZetaChain provider:', error);
      this.isConnected = false;
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    
    this.reconnectInterval = setTimeout(() => {
      console.log('Attempting to reconnect to ZetaChain...');
      this.initializeProvider();
    }, 5000);
  }

  // ============ HEALTH MONITORING ============

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkChainHealth();
    }, 30000); // Every 30 seconds
  }

  private async checkChainHealth() {
    try {
      const startTime = Date.now();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      const latency = Date.now() - startTime;

      const status: ChainStatus = {
        chainId: this.config.chainId.toString(),
        chainName: 'ZetaChain',
        isOnline: true,
        blockHeight: blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        lastUpdate: Date.now(),
        latency
      };

      this.chainStatuses.set('zetachain', status);
      this.emit('chainStatusUpdate', status);

    } catch (error) {
      const status: ChainStatus = {
        chainId: this.config.chainId.toString(),
        chainName: 'ZetaChain',
        isOnline: false,
        blockHeight: 0,
        gasPrice: '0',
        lastUpdate: Date.now(),
        latency: -1
      };

      this.chainStatuses.set('zetachain', status);
      this.emit('chainStatusUpdate', status);
      this.emit('error', error);
    }
  }

  // ============ BLOCK MONITORING ============

  private startBlockMonitoring() {
    this.provider.on('block', async (blockNumber: number) => {
      try {
        const block = await this.provider.getBlock(blockNumber);
        if (block) {
          this.emit('newBlock', {
            blockNumber,
            timestamp: block.timestamp,
            transactions: block.transactions.length,
            gasUsed: block.gasUsed.toString(),
            gasLimit: block.gasLimit.toString()
          });

          // Process any pending messages
          await this.processPendingMessages(blockNumber);
        }
      } catch (error) {
        console.error('Error processing new block:', error);
      }
    });
  }

  // ============ CROSS-CHAIN MESSAGING ============

  async sendCrossChainMessage(
    toChain: string,
    messageType: CrossChainMessage['messageType'],
    data: any
  ): Promise<string> {
    if (!this.isConnected) {
      throw new Error('ZetaChain gateway not connected');
    }

    const messageId = this.generateMessageId();
    const message: CrossChainMessage = {
      messageId,
      fromChain: 'zetachain',
      toChain,
      messageType,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.messageQueue.set(messageId, message);
    this.emit('messageQueued', message);

    try {
      // Send message to ZetaChain contract
      const messageHash = await this.sendMessageToContract(message);
      message.status = 'sent';
      message.transactionHash = messageHash;
      
      this.messageQueue.set(messageId, message);
      this.emit('messageSent', message);

      return messageId;
    } catch (error) {
      message.status = 'failed';
      this.messageQueue.set(messageId, message);
      this.emit('messageFailed', { message, error });
      throw error;
    }
  }

  private async sendMessageToContract(message: CrossChainMessage): Promise<string> {
    try {
      // Create contract instance
      const contract = new ethers.Contract(
        this.config.gatewayAddress,
        this.getGatewayABI(),
        this.signer
      );

      // Encode message data
      const encodedData = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'bytes'],
        [message.toChain, message.messageType, JSON.stringify(message.data)]
      );

      // Send transaction
      const tx = await contract.sendCrossChainMessage(
        message.toChain,
        message.messageType,
        encodedData,
        {
          gasLimit: this.config.gasLimit,
          gasPrice: ethers.utils.parseUnits(this.config.gasPrice.toString(), 'gwei')
        }
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Failed to send message to contract:', error);
      throw error;
    }
  }

  private async processPendingMessages(blockNumber: number) {
    for (const [messageId, message] of this.messageQueue) {
      if (message.status === 'pending' || message.status === 'sent') {
        try {
          await this.checkMessageStatus(messageId);
        } catch (error) {
          console.error(`Error checking message status for ${messageId}:`, error);
        }
      }
    }
  }

  private async checkMessageStatus(messageId: string) {
    const message = this.messageQueue.get(messageId);
    if (!message || !message.transactionHash) return;

    try {
      const receipt = await this.provider.getTransactionReceipt(message.transactionHash);
      
      if (receipt && receipt.confirmations >= 3) {
        message.status = 'confirmed';
        message.gasUsed = receipt.gasUsed.toNumber();
        
        this.messageQueue.set(messageId, message);
        this.emit('messageConfirmed', message);
        
        // Remove confirmed messages from queue
        this.messageQueue.delete(messageId);
      }
    } catch (error) {
      // Transaction might still be pending
      console.debug(`Message ${messageId} still pending:`, error.message);
    }
  }

  // ============ UNIVERSAL LENDING CONTRACT INTERACTIONS ============

  async registerCollateral(
    user: string,
    amount: number,
    asset: string,
    chainId: number,
    lockPeriod: number,
    metadata: string
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.signer
      );

      const tx = await contract.registerCollateral(
        user,
        ethers.utils.parseUnits(amount.toString(), 18),
        asset,
        chainId,
        lockPeriod,
        metadata,
        {
          gasLimit: this.config.gasLimit,
          gasPrice: ethers.utils.parseUnits(this.config.gasPrice.toString(), 'gwei')
        }
      );

      const receipt = await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to register collateral:', error);
      throw error;
    }
  }

  async createLoan(
    borrower: string,
    collateralId: number,
    amount: number,
    asset: string,
    chainId: number,
    interestRate: number,
    dueDate: number,
    riskScore: number
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.signer
      );

      const tx = await contract.createLoan(
        borrower,
        collateralId,
        ethers.utils.parseUnits(amount.toString(), 18),
        asset,
        chainId,
        interestRate,
        dueDate,
        riskScore,
        {
          gasLimit: this.config.gasLimit,
          gasPrice: ethers.utils.parseUnits(this.config.gasPrice.toString(), 'gwei')
        }
      );

      const receipt = await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to create loan:', error);
      throw error;
    }
  }

  async processRepayment(loanId: number, amount: number): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.signer
      );

      const tx = await contract.processRepayment(
        loanId,
        ethers.utils.parseUnits(amount.toString(), 18),
        {
          gasLimit: this.config.gasLimit,
          gasPrice: ethers.utils.parseUnits(this.config.gasPrice.toString(), 'gwei')
        }
      );

      const receipt = await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to process repayment:', error);
      throw error;
    }
  }

  async liquidateLoan(loanId: number, liquidator: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.signer
      );

      const tx = await contract.liquidateLoan(
        loanId,
        liquidator,
        {
          gasLimit: this.config.gasLimit,
          gasPrice: ethers.utils.parseUnits(this.config.gasPrice.toString(), 'gwei')
        }
      );

      const receipt = await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to liquidate loan:', error);
      throw error;
    }
  }

  // ============ QUERY FUNCTIONS ============

  async getContractStats() {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.provider
      );

      const stats = await contract.getContractStats();
      return {
        totalCollaterals: stats[0].toNumber(),
        totalLoans: stats[1].toNumber(),
        activeLoans: stats[2].toNumber(),
        totalValueLocked: ethers.utils.formatUnits(stats[3], 18)
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      throw error;
    }
  }

  async getUserCollateral(user: string) {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.provider
      );

      const totalCollateral = await contract.getUserTotalCollateral(user);
      return ethers.utils.formatUnits(totalCollateral, 18);
    } catch (error) {
      console.error('Failed to get user collateral:', error);
      throw error;
    }
  }

  async getUserActiveLoans(user: string) {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.provider
      );

      const loanIds = await contract.getUserActiveLoans(user);
      return loanIds.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Failed to get user active loans:', error);
      throw error;
    }
  }

  async getLoanHealth(loanId: number) {
    try {
      const contract = new ethers.Contract(
        this.config.universalLendingAddress,
        this.getUniversalLendingABI(),
        this.provider
      );

      const health = await contract.getLoanHealth(loanId);
      return {
        isHealthy: health[0],
        collateralRatio: health[1].toNumber(),
        daysUntilDue: health[2].toNumber()
      };
    } catch (error) {
      console.error('Failed to get loan health:', error);
      throw error;
    }
  }

  // ============ UTILITY FUNCTIONS ============

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getGatewayABI() {
    return [
      'function sendCrossChainMessage(string toChain, string messageType, bytes data) external returns (uint256)',
      'event CrossChainMessageSent(uint256 indexed messageId, string fromChain, string toChain, string messageType, bytes data, uint256 timestamp)'
    ];
  }

  private getUniversalLendingABI() {
    return [
      'function registerCollateral(address user, uint256 amount, string asset, uint256 chainId, uint256 lockPeriod, string metadata) external returns (uint256)',
      'function createLoan(address borrower, uint256 collateralId, uint256 amount, string asset, uint256 chainId, uint256 interestRate, uint256 dueDate, uint256 riskScore) external returns (uint256)',
      'function processRepayment(uint256 loanId, uint256 amount) external',
      'function liquidateLoan(uint256 loanId, address liquidator) external',
      'function getContractStats() external view returns (uint256, uint256, uint256, uint256)',
      'function getUserTotalCollateral(address user) external view returns (uint256)',
      'function getUserActiveLoans(address user) external view returns (uint256[])',
      'function getLoanHealth(uint256 loanId) external view returns (bool, uint256, uint256)',
      'event CollateralDeposited(uint256 indexed collateralId, address indexed user, uint256 amount, string asset, uint256 chainId, uint256 timestamp)',
      'event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 collateralId, uint256 amount, string asset, uint256 interestRate, uint256 dueDate)',
      'event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 timestamp)',
      'event LoanLiquidated(uint256 indexed loanId, address indexed borrower, address indexed liquidator, uint256 amount, uint256 timestamp)'
    ];
  }

  // ============ PUBLIC INTERFACE ============

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getChainStatuses(): Map<string, ChainStatus> {
    return new Map(this.chainStatuses);
  }

  public getMessageQueue(): Map<string, CrossChainMessage> {
    return new Map(this.messageQueue);
  }

  public async disconnect() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }
}

// ============ FACTORY FUNCTION ============

export function createZetaChainGateway(config: ZetaChainConfig): ZetaChainGateway {
  return new ZetaChainGateway(config);
}

// ============ DEFAULT CONFIGURATION ============

export const DEFAULT_ZETACHAIN_CONFIG: ZetaChainConfig = {
  rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  chainId: 7001, // ZetaChain Athens testnet
  gatewayAddress: '0x0000000000000000000000000000000000000000', // Replace with actual address
  universalLendingAddress: '0x0000000000000000000000000000000000000000', // Replace with actual address
  gasLimit: 500000,
  gasPrice: 20 // gwei
};
