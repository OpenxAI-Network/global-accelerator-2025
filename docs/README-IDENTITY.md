# Aegis Multi-Chain User Identity System

A comprehensive solution for unifying user identities across multiple blockchain networks using ZetaChain's Universal Smart Contracts. This system allows users to link wallets from Bitcoin, Solana, Ethereum, Avalanche, Base, and Polygon networks to a single canonical identity.

## 🚀 Features

### **Multi-Chain Wallet Linking**
- **Bitcoin (BTC)**: Native BTC address linking with message signing
- **Solana (SOL)**: Phantom and other Solana wallet integration
- **Ethereum (ETH)**: MetaMask and other EVM wallet support
- **Avalanche (AVAX)**: C-Chain wallet integration
- **Base (BASE)**: L2 wallet support
- **Polygon (POLYGON)**: Polygon network integration

### **Security & Verification**
- **Cryptographic Signatures**: All wallet linking requires cryptographic proof of ownership
- **Message Signing**: Custom messages for each linking request with replay protection
- **Multi-Chain Validation**: Chain-specific signature verification algorithms
- **Rate Limiting**: API protection against abuse and spam

### **Unified Identity Management**
- **Single Profile**: One identity across all connected blockchains
- **Reputation System**: Cross-chain reputation scoring and trust metrics
- **Verification Status**: KYC and identity verification support
- **Activity Tracking**: Monitor usage and transactions across all chains

## 🏗️ Architecture

### **Smart Contract Layer (ZetaChain)**
```
MultiChainIdentity.sol
├── Wallet Linking Functions
│   ├── linkBTCWallet()
│   ├── linkSolanaWallet()
│   ├── linkEVMWallet()
│   └── linkAvalancheWallet()
├── Identity Management
│   ├── updateProfile()
│   ├── updateReputation()
│   └── getUserByChainAddress()
└── Security Features
    ├── Signature Verification
    ├── Access Control
    └── Emergency Functions
```

### **Backend API Layer (Node.js)**
```
backend/
├── server.js              # Main Express server
├── routes/
│   └── identity.js        # Identity management endpoints
├── middleware/
│   ├── rate-limit.js      # Rate limiting
│   ├── validation.js      # Input validation
│   └── auth.js           # Authentication
└── utils/
    ├── signature.js       # Signature verification
    ├── blockchain.js      # Blockchain interactions
    └── database.js        # Data persistence
```

### **Frontend Layer (React)**
```
ui/
├── pages/
│   └── IdentityManagement.js  # Main identity page
├── components/
│   └── WalletLinking.js       # Wallet linking component
├── styles/
│   └── identity.css           # Identity-specific styles
└── identity-demo.html         # Standalone demo page
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18.0.0+
- npm 8.0.0+
- ZetaChain testnet access
- MetaMask or other EVM wallet

### **1. Clone the Repository**
```bash
git clone https://github.com/aegis-ai/aegis-ai-liquid-vault.git
cd aegis-ai-liquid-vault
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install UI dependencies
cd ../ui
npm install
```

### **3. Environment Configuration**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment (if needed)
cd ../ui
cp .env.example .env
# Edit .env with your configuration
```

### **4. Deploy Smart Contracts**
```bash
# Deploy to ZetaChain testnet
cd contracts
npx hardhat deploy --network zetachain-testnet
```

### **5. Start the System**
```bash
# Start backend API
cd backend
npm run dev

# Start frontend (in new terminal)
cd ui
npm run dev

# Or start both from root
npm run dev:all
```

## 🔧 Configuration

### **Backend Environment Variables**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:4173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain Configuration
ZETA_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETA_CHAIN_ID=7000

# Contract Addresses
MULTI_CHAIN_IDENTITY_ADDRESS=0x...
```

### **Frontend Configuration**
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ZETA_CHAIN_ID=7000

# Blockchain Configuration
REACT_APP_SUPPORTED_CHAINS=1,56,137,42161,10,8453,1101,59144
```

## 📱 Usage

### **1. Connect Your Primary Wallet**
```javascript
// Connect EVM wallet (MetaMask, etc.)
const connectWallet = async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        setUserAddress(accounts[0]);
    }
};
```

### **2. Link Additional Wallets**
```javascript
// Link BTC wallet
const linkBTCWallet = async (btcAddress) => {
    const message = `Link BTC wallet ${btcAddress} to Aegis identity`;
    const signature = await signMessage(message);
    
    const response = await fetch('/api/identity/link/btc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            evmAddress: userAddress,
            btcAddress,
            signature,
            message,
            timestamp: Math.floor(Date.now() / 1000)
        })
    });
};
```

### **3. Query Linked Wallets**
```javascript
// Get all linked wallets for a user
const getLinkedWallets = async (userAddress) => {
    const response = await fetch(`/api/identity/user/${userAddress}`);
    const data = await response.json();
    return data.data.linkedWallets;
};

// Look up user by chain address
const findUser = async (chainType, address) => {
    const response = await fetch(`/api/identity/lookup/${chainType}/${address}`);
    const data = await response.json();
    return data.data;
};
```

## 🔒 Security Features

### **Signature Verification**
- **BTC**: Bitcoin message signing with address verification
- **Solana**: Ed25519 signature verification using @solana/web3.js
- **EVM**: ECDSA signature recovery using ethers.js
- **Replay Protection**: Timestamp-based request validation

### **Rate Limiting**
- **API Protection**: Configurable rate limits per IP address
- **Window-based**: Sliding window rate limiting
- **Customizable**: Different limits for different endpoints

### **Input Validation**
- **Address Format**: Chain-specific address validation
- **Signature Length**: Cryptographic signature validation
- **Message Content**: Custom message validation
- **Timestamp Check**: Replay attack prevention

## 🧪 Testing

### **Smart Contract Tests**
```bash
cd contracts
npx hardhat test
```

### **Backend API Tests**
```bash
cd backend
npm test
```

### **Frontend Tests**
```bash
cd ui
npm test
```

### **Integration Tests**
```bash
# Run full test suite
npm run test:all
```

## 📊 API Reference

### **Wallet Linking Endpoints**

#### **Link BTC Wallet**
```http
POST /api/identity/link/btc
Content-Type: application/json

{
    "evmAddress": "0x...",
    "btcAddress": "bc1...",
    "signature": "base64_signature",
    "message": "Link BTC wallet...",
    "timestamp": 1234567890
}
```

#### **Link Solana Wallet**
```http
POST /api/identity/link/solana
Content-Type: application/json

{
    "evmAddress": "0x...",
    "solanaAddress": "base58_address",
    "signature": "base64_signature",
    "message": "Link Solana wallet...",
    "timestamp": 1234567890
}
```

#### **Link EVM Wallet**
```http
POST /api/identity/link/evm
Content-Type: application/json

{
    "primaryAddress": "0x...",
    "secondaryAddress": "0x...",
    "signature": "0x...",
    "message": "Link EVM wallet...",
    "timestamp": 1234567890,
    "chainId": 1
}
```

### **Query Endpoints**

#### **Get User Identity**
```http
GET /api/identity/user/{evmAddress}
```

#### **Lookup User by Chain Address**
```http
GET /api/identity/lookup/{chainType}/{address}
```

#### **Unlink Wallet**
```http
DELETE /api/identity/unlink/{chainType}
Content-Type: application/json

{
    "evmAddress": "0x...",
    "signature": "0x...",
    "message": "Unlink wallet...",
    "timestamp": 1234567890
}
```

## 🚀 Deployment

### **Smart Contract Deployment**
```bash
# Deploy to ZetaChain mainnet
npx hardhat deploy --network zetachain-mainnet

# Verify contracts on ZetaScan
npx hardhat verify --network zetachain-mainnet DEPLOYED_ADDRESS
```

### **Backend Deployment**
```bash
# Build for production
npm run build

# Deploy to cloud platform (example: Heroku)
heroku create aegis-identity-api
git push heroku main
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Deploy to static hosting (example: Vercel)
vercel --prod
```

## 🔧 Development

### **Adding New Chain Support**
1. **Update Smart Contract**: Add new chain type and linking function
2. **Update Backend**: Add signature verification for new chain
3. **Update Frontend**: Add UI components for new chain
4. **Update Tests**: Add comprehensive test coverage

### **Example: Adding Cardano Support**
```solidity
// In MultiChainIdentity.sol
enum ChainType {
    EVM, BTC, SOLANA, AVAX, BASE, POLYGON, CARDANO
}

function linkCardanoWallet(
    bytes32 cardanoAddr,
    bytes calldata signature,
    string calldata message
) external nonReentrant {
    // Implementation
}
```

## 📈 Performance & Scalability

### **Optimization Strategies**
- **Caching**: Redis-based caching for frequently accessed data
- **Batch Processing**: Bulk operations for multiple wallet links
- **Async Processing**: Non-blocking signature verification
- **Database Indexing**: Optimized queries for large datasets

### **Monitoring & Metrics**
- **API Response Times**: Track endpoint performance
- **Error Rates**: Monitor failure rates and types
- **User Activity**: Track wallet linking patterns
- **Chain Usage**: Monitor which chains are most popular

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-chain-support`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Submit a pull request with detailed description

### **Code Standards**
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow project ESLint configuration
- **Testing**: Maintain >90% test coverage
- **Documentation**: Update README and API docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [API Documentation](docs/api.md)
- [Smart Contract Documentation](docs/contracts.md)
- [Frontend Component Library](docs/components.md)

### **Community**
- [Discord](https://discord.gg/aegis-ai)
- [Telegram](https://t.me/aegis_ai)
- [GitHub Issues](https://github.com/aegis-ai/aegis-ai-liquid-vault/issues)

### **Contact**
- **Email**: support@aegis.ai
- **Twitter**: [@AegisAI](https://twitter.com/AegisAI)
- **Website**: [https://aegis.ai](https://aegis.ai)

## 🔮 Roadmap

### **Phase 1: Core Identity (Current)**
- ✅ Multi-chain wallet linking
- ✅ Cryptographic signature verification
- ✅ Basic identity management
- ✅ API endpoints

### **Phase 2: Advanced Features**
- 🔄 Reputation system with on-chain scoring
- 🔄 Cross-chain transaction history
- 🔄 Identity verification (KYC)
- 🔄 Privacy controls and data encryption

### **Phase 3: Ecosystem Integration**
- 📋 DeFi protocol integration
- 📋 Cross-chain messaging
- 📋 Identity-based access control
- 📋 Mobile application

### **Phase 4: Enterprise Features**
- 📋 Multi-signature support
- 📋 Organization identity management
- 📋 Compliance and regulatory features
- 📋 Advanced analytics and reporting

---

**Built with ❤️ by the Aegis AI Team**

*Empowering the future of decentralized identity and cross-chain interoperability.*
