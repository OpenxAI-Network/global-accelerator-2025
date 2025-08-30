export const CONFIG = {
  ZETA_API_KEY: process.env.VITE_ZETA_API_KEY || '',
  GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || 'AIzaSyDpmYQsbFIZP7L1ZGSkjOPL3YT2nGTFSBI',
  RPC_ENDPOINTS: {
    ethereum: 'https://eth.llamarpc.com',
    bitcoin: 'https://btc.llamarpc.com',
    solana: 'https://api.mainnet-beta.solana.com',
    zetachain: 'https://zetachain-evm.blockpi.network/v1/rpc/public'
  }
};