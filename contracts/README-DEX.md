# AEGIS Universal DEX

A universal decentralized exchange (DEX) contract for cross-chain token swaps on ZetaChain, built using the Universal Contract pattern.

## 🎯 Overview

The AEGIS Universal DEX enables seamless cross-chain token swaps between any connected blockchain (Ethereum, Bitcoin, Solana, etc.) through a single contract deployed on ZetaChain. The contract handles:

- **Cross-chain token swaps** via ZetaChain's omnichain infrastructure
- **Automatic gas fee management** for destination chains
- **Uniswap V2 integration** for token swaps on ZetaChain
- **Bitcoin compatibility** with compact message encoding
- **Automatic refund handling** for failed transactions

## 🏗️ Architecture

### Core Components

1. **Universal Contract Pattern**: Inherits from ZetaChain's `UniversalContract`
2. **Cross-Chain Gateway**: Integrates with ZetaChain's cross-chain messaging system
3. **Uniswap V2 Router**: Handles token swaps on ZetaChain
4. **Gas Fee Management**: Automatically calculates and handles destination chain gas fees
5. **Bitcoin Support**: Special handling for Bitcoin's 80-byte OP_RETURN constraint

### Contract Structure

```
UniversalDEX
├── UniversalContract (ZetaChain)
├── ReentrancyGuard (OpenZeppelin)
├── Ownable (OpenZeppelin)
└── SafeERC20 (OpenZeppelin)
```

## 🔧 Key Features

### 1. Cross-Chain Swaps

Users can swap tokens from any connected chain to any other chain:

```solidity
// Example: Swap USDC from Ethereum to WETH on Base
function onCall(
    MessageContext calldata context,
    address zrc20,        // USDC ZRC-20 on ZetaChain
    uint256 amount,       // 1000 USDC
    bytes calldata message // Encoded swap parameters
) external override onlyGateway
```

### 2. Automatic Gas Fee Handling

The DEX automatically:
- Calculates gas fees for destination chains
- Swaps input tokens to cover gas requirements
- Ensures successful cross-chain withdrawals

```solidity
function _getGasInfo(address token) internal view returns (GasInfo memory) {
    (address gasZRC20, uint256 gasFee) = IZRC20(token).withdrawGasFee();
    
    // Apply gas fee buffer for reliability
    uint256 gasAmount = gasFee + (gasFee * gasFeeBuffer) / 100;
    
    return GasInfo({
        gasZRC20: gasZRC20,
        gasFee: gasFee,
        gasAmount: gasAmount
    });
}
```

### 3. Bitcoin Compatibility

Special message encoding for Bitcoin chains to work within the 80-byte constraint:

```solidity
// Bitcoin compact format: [20 bytes token][recipient][1 byte withdraw][1 byte slippage]
if (chainId == BITCOIN_MAINNET || chainId == BITCOIN_TESTNET) {
    require(message.length >= 42, "Invalid Bitcoin message length");
    
    params.targetToken = _bytesToAddress(message, 0);
    params.recipient = message[20:message.length-2];
    params.withdraw = message[message.length-2] != 0;
    params.slippageTolerance = uint256(uint8(message[message.length-1])) * 100;
}
```

### 4. Failed Transaction Handling

Automatic refund mechanism for failed cross-chain withdrawals:

```solidity
function onRevert(
    address asset,
    uint256 amount,
    bytes calldata revertMessage
) external override onlyGateway {
    // Decode revert message: (sender, originalToken, gasFee)
    (bytes memory sender, address originalToken, uint256 gasFee) = abi.decode(
        revertMessage,
        (bytes, address, uint256)
    );
    
    // Swap failed asset back to original token
    uint256 refundAmount = _swapToOriginalToken(asset, amount, originalToken);
    
    // Withdraw refund to original sender
    _withdrawRefund(sender, refundAmount, originalToken, gasFee);
}
```

## 📋 Usage

### 1. Deploy the Contract

```bash
# Deploy to ZetaChain testnet
npx hardhat run scripts/deployDEX.ts --network zeta_testnet

# Deploy to ZetaChain mainnet
npx hardhat run scripts/deployDEX.ts --network zeta_mainnet
```

### 2. Configure Parameters

```solidity
// Set swap fee (0.3%)
await universalDEX.setSwapFee(30);

// Set gas fee buffer (20%)
await universalDEX.setGasFeeBuffer(20);

// Set Uniswap router
await universalDEX.setUniswapRouter(routerAddress);

// Set price oracle
await universalDEX.setPriceOracle(oracleAddress);
```

### 3. Execute Cross-Chain Swaps

#### For EVM Chains

```solidity
// Encode swap parameters
bytes memory message = abi.encode(
    targetToken,    // Address of target token
    recipient,      // Recipient address on destination chain
    true,          // Withdraw flag
    500            // Slippage tolerance (5% = 500 basis points)
);

// Send via ZetaChain Gateway
gateway.call(
    universalDEXAddress,
    message,
    inputToken,
    inputAmount
);
```

#### For Bitcoin

```solidity
// Create compact Bitcoin message
bytes memory message = ethers.concat([
    targetToken,                    // 20 bytes
    recipient,                      // Recipient bytes
    new Uint8Array([1]),           // 1 byte withdraw flag
    new Uint8Array([5])            // 1 byte slippage (0.5%)
]);

// Send via ZetaChain Gateway
gateway.call(
    universalDEXAddress,
    message,
    inputToken,
    inputAmount
);
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/UniversalDEX.test.ts

# Run with coverage
npx hardhat coverage
```

### Test Scenarios

1. **Basic Functionality**
   - Contract deployment
   - Parameter configuration
   - Access control

2. **Swap Operations**
   - Token swaps via Uniswap
   - Gas fee calculations
   - Slippage protection

3. **Cross-Chain Operations**
   - Message decoding
   - Cross-chain withdrawals
   - Failed transaction handling

4. **Bitcoin Integration**
   - Compact message format
   - UTXO constraint handling
   - Bitcoin-specific operations

5. **Security Features**
   - Reentrancy protection
   - Access control
   - Parameter validation

## 🔒 Security Features

### Access Control

- **Owner-only functions**: Critical parameter updates
- **Gateway-only entry**: Cross-chain operations
- **Reentrancy protection**: Secure external calls

### Parameter Validation

- **Slippage limits**: Maximum 10% slippage tolerance
- **Fee limits**: Maximum 1% swap fee
- **Buffer limits**: Maximum 100% gas fee buffer

### Emergency Functions

- **Emergency withdrawal**: Owner can withdraw stuck tokens
- **Pause functionality**: Can be added for emergency stops
- **Upgrade mechanism**: UUPS proxy pattern support

## 📊 Configuration

### Default Parameters

```solidity
// Swap fees
uint256 public swapFee = 30;           // 0.3%

// Gas fee buffer
uint256 public gasFeeBuffer = 20;      // 20%

// Gas limits
uint256 public constant DEFAULT_GAS_LIMIT = 300000;

// Bitcoin chain IDs
uint256 public constant BITCOIN_MAINNET = 8332;
uint256 public constant BITCOIN_TESTNET = 18332;
```

### Supported Networks

- **Ethereum**: Mainnet, Sepolia, Goerli
- **Base**: Mainnet, Sepolia
- **Polygon**: Mainnet, Mumbai
- **BSC**: Mainnet, Testnet
- **Arbitrum**: Mainnet, Sepolia
- **Optimism**: Mainnet, Sepolia
- **Bitcoin**: Mainnet, Testnet
- **Solana**: Mainnet, Devnet

## 🚀 Deployment

### Prerequisites

1. **ZetaChain CLI**: Install and configure
2. **Private Keys**: Set in environment variables
3. **RPC URLs**: Configure for target networks
4. **Gas Tokens**: Ensure sufficient balance

### Environment Variables

```bash
# .env file
ZETACHAIN_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
ZETACHAIN_PRIVATE_KEY=your_private_key
UNISWAP_ROUTER=0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe
PRICE_ORACLE=0x0000000000000000000000000000000000000000
```

### Deployment Commands

```bash
# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Verify contracts
npm run verify:testnet
npm run verify:mainnet
```

## 📈 Monitoring

### Events to Track

1. **SwapExecuted**: Successful cross-chain swaps
2. **SwapReverted**: Failed transaction handling
3. **GasFeeUpdated**: Gas fee parameter changes
4. **SwapFeeUpdated**: Swap fee parameter changes

### Key Metrics

- **Total swaps executed**
- **Gas fees collected**
- **Failed transaction rate**
- **Cross-chain volume**

## 🔧 Integration

### Frontend Integration

```typescript
// Example: React hook for swap quotes
const useSwapQuote = (inputToken: string, outputToken: string, amount: string) => {
  const [quote, setQuote] = useState(null);
  
  useEffect(() => {
    const getQuote = async () => {
      const result = await universalDEX.getSwapQuote(
        inputToken,
        outputToken,
        ethers.parseUnits(amount, 18)
      );
      setQuote(result);
    };
    
    getQuote();
  }, [inputToken, outputToken, amount]);
  
  return quote;
};
```

### API Integration

```typescript
// Example: API endpoint for swap execution
app.post('/api/swap', async (req, res) => {
  const { inputToken, outputToken, amount, recipient, chainId } = req.body;
  
  // Encode message based on chain type
  const message = chainId === 8332 || chainId === 18332
    ? encodeBitcoinMessage(outputToken, recipient, true, 500)
    : encodeEVMMessage(outputToken, recipient, true, 500);
  
  // Execute swap via ZetaChain
  const result = await executeSwap(inputToken, amount, message);
  
  res.json({ success: true, txHash: result.hash });
});
```

## 🛠️ Development

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy locally
npx hardhat run scripts/deployDEX.ts --network localhost

# Run tests
npx hardhat test
```

### Hardhat Configuration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    zeta_testnet: {
      url: process.env.ZETACHAIN_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 7001
    },
    zeta_mainnet: {
      url: process.env.ZETACHAIN_MAINNET_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 7000
    }
  }
};

export default config;
```

## 📚 Additional Resources

### Documentation

- [ZetaChain Universal Contracts](https://docs.zetachain.com/developers/contracts/universal-contracts)
- [Cross-Chain Messaging](https://docs.zetachain.com/developers/contracts/cross-chain-messaging)
- [Bitcoin Integration](https://docs.zetachain.com/developers/contracts/bitcoin)

### Examples

- [Universal DEX Template](https://github.com/zeta-chain/template-dex)
- [Cross-Chain Swap Examples](https://github.com/zeta-chain/example-contracts)
- [Bitcoin Integration Examples](https://github.com/zeta-chain/example-contracts/tree/main/bitcoin)

### Support

- [ZetaChain Discord](https://discord.gg/zetachain)
- [GitHub Issues](https://github.com/zeta-chain/example-contracts/issues)
- [Documentation](https://docs.zetachain.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## ⚠️ Disclaimer

This software is for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses or damages resulting from the use of this software. 