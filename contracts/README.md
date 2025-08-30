# AEGIS Universal Lending Protocol - Smart Contracts

## Overview

AEGIS is an omnichain lending protocol built on ZetaChain that enables cross-chain lending and borrowing using a single universal contract. The protocol leverages ZetaChain's cross-chain messaging (CCM) to manage collateral and loans across multiple blockchains without deploying separate contracts on each chain.

## Key Features

### 🔗 **Omnichain Interoperability**
- Single contract manages lending across all supported chains
- Native support for Bitcoin and EVM chains
- Cross-chain collateral and loan management

### 🤖 **AI-Powered Risk Management**
- Real-time risk assessment via AI oracle
- Dynamic interest rates based on asset volatility
- Automated liquidation triggers

### 🎯 **Universal Asset Support**
- Fungible tokens (ERC-20) across all chains
- Non-fungible tokens (ERC-721) with cross-chain bridging
- Native BTC support without wrapping

### 🛡️ **Security Features**
- Reentrancy protection
- Pausable functionality
- Owner-controlled emergency functions
- Comprehensive access controls

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AEGIS Protocol                          │
│                 (ZetaChain)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Collateral  │  │   Loans    │  │    NFTs     │        │
│  │ Management  │  │ Management │  │ Management  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    AI Oracle                               │
│              (Risk Assessment)                            │
├─────────────────────────────────────────────────────────────┤
│                 ZetaChain CCM                             │
│              (Cross-Chain Messaging)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Ethereum   │  │   Polygon   │  │     BSC     │        │
│  │   (Chain 1) │  │  (Chain 137)│  │ (Chain 56) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Contract Structure

### Core Contracts

#### `AegisUniversalLending.sol`
The main protocol contract that handles:
- Collateral locking and management
- Loan issuance and tracking
- Cross-chain operations
- Risk management integration
- NFT bridging

#### `MockAIOracle.sol`
Mock implementation of the AI oracle for testing:
- Risk profile management
- Price feeds
- Liquidation triggers

#### `MockUniversalToken.sol`
Mock implementation of universal tokens for testing:
- Cross-chain balance tracking
- Mint/burn operations
- Chain-specific supply management

### Interfaces

#### `IAIOracle.sol`
Interface for AI oracle integration:
- Risk assessment functions
- Price feed functions
- Liquidation request functions

#### `IUniversalToken.sol`
Interface for universal token operations:
- Cross-chain minting/burning
- Balance queries
- Transfer operations

#### `IUniversalNFT.sol`
Interface for universal NFT operations:
- Cross-chain transfers
- Metadata queries
- Ownership tracking

## Data Structures

### CollateralPosition
```solidity
struct CollateralPosition {
    address owner;           // Collateral owner
    uint256 chainId;         // Source chain ID
    address asset;           // Asset address
    uint256 amount;          // Asset amount
    uint256 tokenId;         // NFT token ID (if applicable)
    bool isNFT;              // Whether asset is NFT
    uint256 lockedTimestamp; // When collateral was locked
    uint256 lastPriceUpdate; // Last price update timestamp
    uint256 currentValue;    // Current USD value (8 decimals)
}
```

### LoanPosition
```solidity
struct LoanPosition {
    address owner;              // Loan owner
    uint256 collateralId;       // Associated collateral ID
    uint256 debtChainId;        // Target chain for debt
    address debtAsset;          // Debt asset address
    uint256 debtAmount;         // Debt amount
    uint256 interestRate;       // Annual interest rate (basis points)
    uint256 issuedTimestamp;    // When loan was issued
    uint256 lastInterestAccrual; // Last interest accrual
    bool liquidated;            // Whether loan is liquidated
    uint256 healthFactor;       // Current health factor
}
```

### RiskProfile
```solidity
struct RiskProfile {
    uint256 maxLTV;              // Maximum LTV ratio (basis points)
    uint256 liquidationThreshold; // Liquidation threshold (basis points)
    uint256 volatilityScore;     // Volatility score (0-100)
    uint256 lastUpdate;          // Last update timestamp
}
```

## Key Functions

### Collateral Management
- `lockCollateral()` - Lock fungible assets as collateral
- `lockNFT()` - Lock NFT assets as collateral
- `_lockCollateral()` - Internal collateral locking logic

### Lending Operations
- `borrowAgainstCollateral()` - Borrow against locked collateral
- `_borrowAgainstCollateral()` - Internal borrowing logic
- `_calculateInterestRate()` - Dynamic interest rate calculation

### Risk Management
- `executeLiquidation()` - Execute liquidation (AI Oracle only)
- `_updateLoanHealthFactors()` - Update position health factors
- `_calculateHealthFactor()` - Calculate position health

### Cross-Chain Operations
- `onZetaMessage()` - Handle incoming cross-chain messages
- `_liquidateFungible()` - Cross-chain fungible asset liquidation
- `_liquidateNFT()` - Cross-chain NFT liquidation

## Protocol Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `BASIS_POINTS` | 10,000 | Basis points for percentage calculations |
| `MIN_LIQUIDATION_THRESHOLD` | 8,000 | Minimum liquidation threshold (80%) |
| `MAX_LIQUIDATION_THRESHOLD` | 9,500 | Maximum liquidation threshold (95%) |
| `LIQUIDATION_PENALTY` | 500 | Liquidation penalty (5%) |
| `MAX_INTEREST_RATE` | 2,000 | Maximum annual interest rate (20%) |

## Supported Chains

| Chain | Chain ID | Description |
|-------|----------|-------------|
| Ethereum | 1 | Mainnet |
| Polygon | 137 | Polygon PoS |
| BSC | 56 | Binance Smart Chain |
| Arbitrum | 42161 | Arbitrum One |
| Optimism | 10 | Optimism |
| ZetaChain Testnet | 7001 | Testnet |
| ZetaChain Mainnet | 7000 | Mainnet |
| Localnet | 1337 | Local development |

## Installation & Setup

### Prerequisites
- Node.js 18+
- Hardhat
- Solidity 0.8.20+

### Installation
```bash
cd contracts
npm install
```

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm run test
```

### Deployment
```bash
# Testnet
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet

# Localnet
npm run deploy:localnet
```

## Usage Examples

### 1. Lock Collateral
```solidity
// Lock 10 ETH as collateral on Ethereum
await aegisProtocol.lockCollateral(
    ethTokenAddress,
    ethers.parseUnits("10", 18),
    1 // Ethereum chain ID
);
```

### 2. Borrow Against Collateral
```solidity
// Borrow 5,000 USDC against ETH collateral
await aegisProtocol.borrowAgainstCollateral(
    1, // collateralId
    137, // Polygon chain ID
    usdcTokenAddress,
    ethers.parseUnits("5000", 6)
);
```

### 3. Lock NFT
```solidity
// Lock NFT as collateral
await aegisProtocol.lockNFT(
    nftContractAddress,
    123, // tokenId
    1 // Ethereum chain ID
);
```

## Security Considerations

### Access Control
- Owner-only functions for critical operations
- AI Oracle-only liquidation execution
- CLI-only functions for administrative operations

### Reentrancy Protection
- All external calls are protected
- State changes before external calls
- Comprehensive modifier usage

### Emergency Functions
- Pausable functionality
- Emergency withdrawals
- Owner-controlled operations

## Testing

The test suite covers:
- Contract deployment and initialization
- Collateral management operations
- Lending and borrowing functionality
- Risk management and liquidations
- Cross-chain operations
- Emergency functions
- Access control validation

Run tests with:
```bash
npm run test
```

## Deployment

### Environment Variables
Create a `.env` file:
```env
PRIVATE_KEY=your_private_key_here
ZETA_API_KEY=your_zeta_api_key_here
```

### Network Configuration
The deployment script automatically detects the network and uses appropriate configurations for:
- ZetaChain testnet/mainnet
- Local development networks
- EVM-compatible chains

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Join our community channels

## Roadmap

- [ ] Real AI Oracle integration
- [ ] Advanced risk models
- [ ] Multi-asset collateral pools
- [ ] Automated market making
- [ ] Governance token implementation
- [ ] Advanced liquidation strategies
- [ ] Cross-chain yield farming
- [ ] Mobile SDK development 