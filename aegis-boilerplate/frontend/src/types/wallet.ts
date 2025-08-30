export enum WalletType {
  EVM = 'evm',
  SOLANA = 'solana',
  BTC = 'btc',
  UNIVERSAL = 'universal'
}

export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface ConnectedWallet {
  id: string;
  name: string;
  icon: string;
  address: string;
  chainId: number;
  chainName: string;
  type: WalletType;
  status: WalletStatus;
  balance?: string;
  lastConnected?: Date;
}

export interface WalletConnectionError {
  walletId: string;
  message: string;
  code?: string;
}

export interface ChainInfo {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl?: string;
}
