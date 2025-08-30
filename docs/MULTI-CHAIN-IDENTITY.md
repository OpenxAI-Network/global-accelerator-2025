# 🔗 Multi-Chain Identity System for Aegis AI

A comprehensive solution for unifying user identities across multiple blockchain networks using ZetaChain's Universal Smart Contract technology.

## 🎯 **Overview**

The Multi-Chain Identity System solves the fundamental problem of fragmented user identities across different blockchains. Instead of having separate profiles on each chain, users get a **single canonical identity** anchored on ZetaChain that links to their wallets on:

- **Bitcoin** (BTC)
- **Solana** (SOL)
- **Ethereum** (ETH)
- **Avalanche** (AVAX)
- **Base** (L2)
- **Polygon** (MATIC)
- **ZetaChain** (Primary Identity)

## 🏗️ **Architecture**

### **Core Components**

1. **MultiChainIdentity Smart Contract** (ZetaChain)
   - Stores wallet address mappings
   - Manages user profiles and reputation
   - Handles wallet linking/unlinking

2. **Backend API** (Node.js)
   - Signature verification for all chains
   - Rate limiting and security
   - Database integration

3. **Frontend Interface** (React)
   - User-friendly wallet linking
   - Real-time status updates
   - Cross-chain wallet management

### **Data Flow**

```
User Wallet → Signature → API Verification → Smart Contract → ZetaChain Storage
     ↓
Cross-Chain Events → ZetaChain Gateway → Identity Resolution → Unified Profile
```

## 🚀 **Key Features**

### **1. Cryptographic Proof of Ownership**
- **BTC**: Bitcoin message signing
- **Solana**: Ed25519 signature verification
- **EVM**: ECDSA signature verification
- **Timestamp protection** against replay attacks

### **2. Unified User Profile**
- Single reputation score across all chains
- Cross-chain transaction history
- Unified credit scoring for DeFi operations

### **3. Security & Privacy**
- No private keys stored
- On-chain verification only
- Optional privacy features with ZK proofs

### **4. Developer-Friendly**
- RESTful API endpoints
- Comprehensive SDK
- Real-time webhook notifications

## 📱 **User Experience**

### **Wallet Linking Process**

1. **Connect Primary Wallet**
   - User connects EVM wallet (MetaMask, etc.)
   - Gets assigned ZetaChain identity

2. **Link Additional Wallets**
   - Select chain type (BTC, Solana, etc.)
   - Enter wallet address
   - Sign verification message
   - Wallet linked to identity

3. **Unified Dashboard**
   - View all linked wallets
   - Cross-chain portfolio overview
   - Unified transaction history

### **Supported Wallet Types**

| Chain | Wallet Support | Signature Method |
|-------|----------------|------------------|
| **Bitcoin** | Hardware wallets, software wallets | Bitcoin message signing |
| **Solana** | Phantom, Solflare, CLI | Ed25519 signatures |
| **Ethereum** | MetaMask, WalletConnect | ECDSA signatures |
| **Avalanche** | MetaMask, Core | ECDSA signatures |
| **Base** | MetaMask, Coinbase Wallet | ECDSA signatures |
| **Polygon** | MetaMask, WalletConnect | ECDSA signatures |

## 🔧 **Technical Implementation**

### **Smart Contract Functions**

```solidity
// Link BTC wallet
function linkBTCWallet(
    bytes calldata btcAddr,
    bytes calldata signature,
    string calldata message
) external

// Link Solana wallet
function linkSolanaWallet(
    bytes32 solanaAddr,
    bytes calldata signature,
    string calldata message
) external

// Get linked wallets
function getLinkedWallets(address user) external view returns (LinkedWallet memory)

// Update profile
function updateProfile(string calldata username, bytes32 avatarHash) external
```

### **API Endpoints**

```javascript
// Link wallets
POST /api/identity/link/btc
POST /api/identity/link/solana
POST /api/identity/link/evm

// Query identity
GET /api/identity/user/:evmAddress
GET /api/identity/lookup/:chainType/:address

// Manage links
DELETE /api/identity/unlink/:chainType
```

### **Frontend Integration**

```jsx
import WalletLinking from './components/WalletLinking';

function App() {
    return (
        <WalletLinking 
            userAddress={userAddress}
            onWalletLinked={(chainType, address) => {
                console.log(`${chainType} wallet linked: ${address}`);
            }}
        />
    );
}
```

## 🛡️ **Security Features**

### **Signature Verification**
- **Multi-chain support**: Each chain uses its native signature algorithm
- **Message validation**: Prevents signature reuse and replay attacks
- **Timestamp protection**: 5-minute window for request validity

### **Access Control**
- **Owner-only functions**: Admin functions restricted to contract owner
- **User verification**: Only wallet owners can link/unlink their wallets
- **Rate limiting**: API endpoints protected against abuse

### **Data Integrity**
- **On-chain storage**: All mappings stored on ZetaChain
- **Immutable records**: Once linked, addresses cannot be modified without proper verification
- **Audit trail**: All operations emit events for transparency

## 📊 **Use Cases in Aegis AI**

### **1. Cross-Chain Lending**
```
User has BTC collateral → Can borrow on Ethereum
User repays on Solana → Credit score updated across all chains
```

### **2. Unified Portfolio Management**
```
Single dashboard showing assets across all chains
Real-time cross-chain balance aggregation
Unified risk assessment and AI recommendations
```

### **3. Cross-Chain DeFi Operations**
```
Borrow on Base using Polygon collateral
Yield farm on Avalanche with Ethereum rewards
Liquidity provision across multiple chains
```

### **4. AI-Powered Security**
```
Threat detection across all linked wallets
Cross-chain risk assessment
Unified security scoring and recommendations
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- Solidity 0.8.20+
- ZetaChain testnet access
- MetaMask or compatible EVM wallet

### **Installation**

1. **Clone Repository**
```bash
git clone https://github.com/your-org/aegis-ai-liquid-vault.git
cd aegis-ai-liquid-vault
```

2. **Install Dependencies**
```bash
npm install
cd backend && npm install
cd ../ui && npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Deploy Smart Contract**
```bash
npx hardhat deploy --network zetachain-testnet
```

5. **Start Backend**
```bash
cd backend
npm run dev
```

6. **Start Frontend**
```bash
cd ui
npm run dev
```

### **Configuration**

```env
# ZetaChain Configuration
ZETA_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETA_CHAIN_ID=7000
ZETA_PRIVATE_KEY=your_private_key

# Database Configuration
DATABASE_URL=your_database_url
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3001
API_SECRET=your_api_secret
```

## 🧪 **Testing**

### **Smart Contract Tests**
```bash
npx hardhat test
```

### **API Tests**
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
npm run test:integration
```

## 📈 **Performance & Scalability**

### **Current Limits**
- **Wallets per user**: Unlimited
- **API requests**: 100 per 15 minutes per IP
- **Transaction throughput**: ZetaChain network limits
- **Response time**: <200ms for most operations

### **Optimization Strategies**
- **Batch operations**: Link multiple wallets in single transaction
- **Caching**: Redis for frequently accessed data
- **Indexing**: Database indexes for fast lookups
- **CDN**: Static assets served via CDN

## 🔮 **Future Enhancements**

### **Phase 2: Advanced Features**
- **DID Integration**: W3C Decentralized Identifiers
- **Social Recovery**: Multi-signature account recovery
- **Privacy Layer**: Zero-knowledge proof integration
- **Mobile SDK**: Native mobile wallet support

### **Phase 3: Enterprise Features**
- **Multi-sig Support**: Corporate wallet management
- **Compliance Tools**: KYC/AML integration
- **Analytics Dashboard**: Advanced reporting
- **API Marketplace**: Third-party integrations

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Signature Verification Fails**
   - Check wallet connection
   - Verify message format
   - Ensure correct chain ID

2. **Transaction Reverts**
   - Check gas limits
   - Verify contract state
   - Check user permissions

3. **API Errors**
   - Verify API keys
   - Check rate limits
   - Validate request format

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=true npm run dev

# Check contract state
npx hardhat console --network zetachain-testnet
```

## 📚 **API Reference**

### **Authentication**
All API endpoints require proper signature verification. See the [API Documentation](./API.md) for detailed examples.

### **Rate Limits**
- **Public endpoints**: 100 requests per 15 minutes
- **Private endpoints**: 50 requests per 15 minutes
- **Admin endpoints**: 10 requests per 15 minutes

### **Error Codes**
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid signature)
- `403`: Forbidden (insufficient permissions)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🤝 **Contributing**

### **Development Guidelines**
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

### **Code Standards**
- **Solidity**: Follow OpenZeppelin patterns
- **JavaScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **Testing**: 90%+ coverage required

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Documentation**
- [API Reference](./API.md)
- [Smart Contract Docs](./CONTRACTS.md)
- [Frontend Guide](./FRONTEND.md)

### **Community**
- **Discord**: [Aegis AI Community](https://discord.gg/aegis-ai)
- **Telegram**: [@AegisAI](https://t.me/AegisAI)
- **Twitter**: [@AegisAI](https://twitter.com/AegisAI)

### **Technical Support**
- **GitHub Issues**: [Report bugs](https://github.com/your-org/aegis-ai-liquid-vault/issues)
- **Email**: support@aegis.ai
- **Discord**: #technical-support channel

---

**Built with ❤️ by the Aegis AI Team**

*Empowering cross-chain DeFi with unified identity and AI-powered security.*
