# Aegis + Avalon Finance Integration

A comprehensive integration between Aegis cross-chain lending and Avalon Finance's lending/borrowing protocols, leveraging ZetaChain for seamless cross-chain operations.

## 🏗️ Architecture Overview

### Core Components
- **AvalonIntegrationService**: Backend service managing Avalon lending operations
- **Avalon API Routes**: RESTful endpoints for loan management
- **Cross-Chain Messaging**: ZetaChain integration for inter-chain operations
- **Mock Data System**: Comprehensive demonstration data for testing

## 🚀 Key Features

### 1. Avalon Lending Integration
- **Loan Creation**: Create loans using NFT collateral via Avalon
- **ZETA Borrowing**: Borrow ZETA tokens against locked NFTs
- **Cross-Chain Operations**: Seamless asset movement across chains
- **Risk Management**: Automated liquidation and monitoring

### 2. Collateral Management
- **NFT Locking**: Secure NFT collateral locking
- **Multi-Chain Support**: Ethereum, Polygon, BSC, Arbitrum
- **Valuation Tracking**: Real-time NFT value monitoring
- **LTV Monitoring**: Loan-to-value ratio tracking

### 3. Advanced Loan Features
- **Flexible Repayment**: Partial and full loan repayment
- **Loan Extensions**: Extend loan duration with calculated fees
- **Audit Logging**: Complete transaction history
- **Cross-Chain Events**: Real-time event synchronization

## 📊 Mock Data Structure

### Users
```json
{
  "userId": "0xA1B2C3D4E5F6",
  "name": "Alice",
  "avatar": "https://api.adorable.io/avatars/80/alice.png",
  "reputationScore": 85,
  "totalLoans": 3,
  "repaidLoans": 2,
  "defaultedLoans": 0
}
```

### NFTs (Collateral)
```json
{
  "nftId": "2149",
  "name": "Avalon Dragon #2149",
  "ownerId": "0xA1B2C3D4E5F6",
  "image": "https://nft.avalon.xyz/images/dragons/2149.png",
  "valuedUSD": 5000,
  "locked": true,
  "collection": "Avalon Dragons",
  "rarityScore": 85
}
```

### Loans
```json
{
  "loanId": "LN1001",
  "borrowerId": "0xA1B2C3D4E5F6",
  "principal": 2000,
  "interestRate": 0.07,
  "durationDays": 30,
  "collateralNFT": "2149",
  "status": "active",
  "borrowedToken": "ZETA",
  "borrowedAmount": 2000,
  "collateralValue": 5000,
  "ltvRatio": 40
}
```

### Lending Pools
```json
{
  "poolId": "POOL001",
  "name": "ZETA Lending Pool",
  "token": "ZETA",
  "totalLiquidity": 1000000,
  "totalBorrowed": 750000,
  "utilizationRate": 75,
  "apy": 0.08,
  "maxLTV": 66.67
}
```

## 🎯 API Endpoints

### Loan Management
- `POST /api/avalon/loans/create` - Create new loan
- `POST /api/avalon/loans/repay` - Repay loan
- `POST /api/avalon/loans/extend` - Extend loan duration
- `GET /api/avalon/loans` - Get user's loans
- `GET /api/avalon/loans/:id` - Get specific loan details

### Collateral Management
- `POST /api/avalon/collateral/lock` - Lock NFT as collateral
- `POST /api/avalon/collateral/unlock` - Unlock NFT collateral
- `GET /api/avalon/collateral` - Get collateral positions

### Analytics & Monitoring
- `GET /api/avalon/lending-pools` - Get available pools
- `GET /api/avalon/audit-logs` - Get transaction logs
- `GET /api/avalon/cross-chain-events` - Get cross-chain events
- `GET /api/avalon/statistics` - Get comprehensive stats
- `GET /api/avalon/health` - Service health check

## 🔄 Cross-Chain Flow

### Loan Creation Process
```
1. User locks NFT as collateral
2. Loan request submitted to Avalon
3. Cross-chain message sent via ZetaChain
4. Loan issued on destination chain
5. ZETA tokens transferred to borrower
6. State synchronized across chains
```

### Repayment Process
```
1. User submits repayment
2. ZETA tokens transferred back
3. Cross-chain message sent
4. Collateral unlocked
5. Loan status updated
6. Audit log created
```

## 🔧 Configuration

### Environment Variables
```bash
# Avalon Integration
AVALON_CONTRACTS={
  "lendingPool": "0x...",
  "collateralManager": "0x...",
  "loanManager": "0x..."
}

# ZetaChain Configuration
ZETA_CHAIN_CONFIG={
  "gateway": "https://gateway.zetachain.com",
  "apiKey": "your_api_key"
}

# Supported Chains
SUPPORTED_CHAINS=[
  {"id": 1, "name": "Ethereum"},
  {"id": 137, "name": "Polygon"},
  {"id": 56, "name": "BSC"},
  {"id": 42161, "name": "Arbitrum"}
]
```

## 📈 Risk Management

### LTV Monitoring
- **Maximum LTV**: 66.67% (configurable per pool)
- **Liquidation Threshold**: 80% (automatic trigger)
- **Real-time Monitoring**: Continuous LTV calculation
- **Automated Actions**: Liquidation triggers and alerts

### Liquidation Triggers
- **LTV Exceeded**: Automatic liquidation at 80% LTV
- **Overdue Loans**: Liquidation for past-due loans
- **Market Volatility**: Dynamic risk adjustment
- **Collection Risk**: Collection-specific thresholds

## 🚨 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure API authentication
- **Wallet Signatures**: Cryptographic verification
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

### Cross-Chain Security
- **Message Signing**: Cryptographic verification
- **State Validation**: Cross-chain consistency checks
- **Failure Handling**: Graceful degradation
- **Audit Logging**: Complete transaction history

## 🧪 Testing & Development

### Mock Data Usage
```javascript
// Load mock data for development
await avalonService.loadMockData();

// Access mock data
const users = Array.from(avalonService.userProfiles.values());
const loans = Array.from(avalonService.activeLoans.values());
const nfts = Array.from(avalonService.collateralPositions.values());
```

### Service Testing
```javascript
// Test loan creation
const result = await avalonService.createLoan({
    borrowerId: "0xA1B2C3D4E5F6",
    principal: 1000,
    collateralNFT: "2149",
    durationDays: 30
});

// Test cross-chain messaging
await avalonService.crossChainService.sendCrossChainMessage({
    type: 'AVALON_LOAN_CREATED',
    // ... message data
});
```

## 🔮 Future Enhancements

### Planned Features
- **Automated Market Making**: Dynamic interest rates
- **Portfolio Management**: Multi-NFT collateral
- **Social Lending**: Peer-to-peer pools
- **Advanced Analytics**: ML risk prediction
- **Mobile App**: Native mobile interface

### Technical Improvements
- **Layer 2 Scaling**: Optimistic rollups
- **Zero-Knowledge Proofs**: Privacy preservation
- **Decentralized Identity**: Self-sovereign identity
- **Cross-Chain NFTs**: Native standards

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd aegis-boilerplate/backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Configure Avalon and ZetaChain settings
```

### 3. Start Services
```bash
npm run dev
```

### 4. Test Integration
```bash
# Test loan creation
curl -X POST http://localhost:3001/api/avalon/loans/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "principal": 1000,
    "collateralNFT": "2149",
    "durationDays": 30,
    "sourceChainId": 1,
    "destinationChainId": 137
  }'
```

## 📚 API Examples

### Create Loan
```javascript
const loanRequest = {
    principal: 2000,
    collateralNFT: "2149",
    durationDays: 30,
    borrowedToken: "ZETA",
    sourceChainId: 1,        // Ethereum
    destinationChainId: 137  // Polygon
};

const result = await fetch('/api/avalon/loans/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(loanRequest)
});
```

### Repay Loan
```javascript
const repaymentRequest = {
    loanId: "LN1001",
    repaymentAmount: 2100,
    sourceChainId: 1,
    destinationChainId: 137
};

const result = await fetch('/api/avalon/loans/repay', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(repaymentRequest)
});
```

### Get Statistics
```javascript
const stats = await fetch('/api/avalon/statistics', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

const data = await stats.json();
console.log('User Stats:', data.data.user);
console.log('Global Stats:', data.data.global);
```

## 🤝 Integration Benefits

### For Users
- **Seamless Experience**: Single interface for cross-chain lending
- **ZETA Access**: Easy borrowing of ZetaChain's native token
- **NFT Utilization**: Leverage NFT collections for liquidity
- **Risk Management**: Automated monitoring and alerts

### For Aegis
- **Expanded Market**: Access to Avalon's lending pools
- **Cross-Chain Synergy**: Enhanced multi-chain capabilities
- **Ecosystem Integration**: Deeper ZetaChain integration
- **User Growth**: Attract Avalon users to Aegis

### For Avalon
- **Cross-Chain Reach**: Extend beyond single-chain operations
- **Enhanced Liquidity**: Access to multi-chain user base
- **Risk Diversification**: Broader collateral and user base
- **Innovation**: Advanced cross-chain features

## 📄 License

This integration is part of the Aegis protocol and follows the same licensing terms.

## 🆘 Support

### Documentation
- [API Reference](docs/api.md)
- [Integration Guide](docs/integration.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- [Discord](https://discord.gg/aegis)
- [GitHub Issues](https://github.com/aegis-protocol/issues)

---

**Aegis + Avalon Integration** - Unifying cross-chain lending with ZetaChain's native ecosystem.
