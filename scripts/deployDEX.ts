import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  const hre: HardhatRuntimeEnvironment = await import("hardhat");
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying AEGIS Universal DEX");
  console.log("=================================");
  console.log("Deployer:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // ==================== DEPLOYMENT CONFIGURATION ====================
  
  // Network configuration
  const network = hre.network.name;
  
  // Uniswap V2 Router addresses for different networks
  const UNISWAP_ROUTERS = {
    zeta_testnet: "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe",
    zeta_mainnet: "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe", // Update with mainnet address
    localnet: ethers.ZeroAddress
  };
  
  // Price Oracle addresses (Chainlink or similar)
  const PRICE_ORACLES = {
    zeta_testnet: "0x0000000000000000000000000000000000000000", // Update with actual oracle
    zeta_mainnet: "0x0000000000000000000000000000000000000000", // Update with actual oracle
    localnet: ethers.ZeroAddress
  };
  
  // ZRC-20 addresses for common tokens on ZetaChain testnet
  const ZRC20_TOKENS = {
    // Gas tokens for different chains
    ETH: "0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb", // Ethereum Sepolia
    BASE: "0x13a0c5930c028511dc02665e7285134b6d11a5f4", // Base Sepolia
    BSC: "0x0000000000000000000000000000000000000000", // BSC Testnet
    POLYGON: "0x0000000000000000000000000000000000000000", // Polygon Mumbai
    ARBITRUM: "0x0000000000000000000000000000000000000000", // Arbitrum Sepolia
    OPTIMISM: "0x0000000000000000000000000000000000000000", // Optimism Sepolia
    
    // Common tokens
    USDC: "0x0000000000000000000000000000000000000000", // USDC on ZetaChain
    USDT: "0x0000000000000000000000000000000000000000", // USDT on ZetaChain
    WETH: "0x0000000000000000000000000000000000000000", // Wrapped ETH on ZetaChain
    WBTC: "0x0000000000000000000000000000000000000000"  // Wrapped BTC on ZetaChain
  };
  
  // ==================== DEPLOY UNIVERSAL DEX ====================
  
  console.log("\n🏗️ Deploying Universal DEX...");
  
  const UniversalDEX = await ethers.getContractFactory("UniversalDEX");
  const universalDEX = await UniversalDEX.deploy(
    ethers.ZeroAddress, // System contract (will be set by ZetaChain)
    UNISWAP_ROUTERS[network as keyof typeof UNISWAP_ROUTERS] || ethers.ZeroAddress,
    PRICE_ORACLES[network as keyof typeof PRICE_ORACLES] || ethers.ZeroAddress
  );
  
  await universalDEX.waitForDeployment();
  const dexAddress = await universalDEX.getAddress();
  console.log("✅ Universal DEX deployed to:", dexAddress);
  
  // ==================== CONFIGURE DEX PARAMETERS ====================
  
  console.log("\n⚙️ Configuring DEX Parameters...");
  
  // Set swap fee (0.3%)
  await universalDEX.setSwapFee(30);
  console.log("✅ Set swap fee to 0.3%");
  
  // Set gas fee buffer (20%)
  await universalDEX.setGasFeeBuffer(20);
  console.log("✅ Set gas fee buffer to 20%");
  
  // ==================== DEPLOY MOCK TOKENS FOR TESTING ====================
  
  console.log("\n🪙 Deploying Mock Tokens for Testing...");
  
  const MockToken = await ethers.getContractFactory("MockUniversalToken");
  
  // Deploy mock USDC
  const mockUSDC = await MockToken.deploy(
    "USD Coin",
    "USDC",
    ethers.parseUnits("1000000", 6)
  );
  await mockUSDC.waitForDeployment();
  console.log("✅ Mock USDC:", await mockUSDC.getAddress());
  
  // Deploy mock WETH
  const mockWETH = await MockToken.deploy(
    "Wrapped Ethereum",
    "WETH",
    ethers.parseUnits("1000", 18)
  );
  await mockWETH.waitForDeployment();
  console.log("✅ Mock WETH:", await mockWETH.getAddress());
  
  // Deploy mock WBTC
  const mockWBTC = await MockToken.deploy(
    "Wrapped Bitcoin",
    "WBTC",
    ethers.parseUnits("100", 8)
  );
  await mockWBTC.waitForDeployment();
  console.log("✅ Mock WBTC:", await mockWBTC.getAddress());
  
  // ==================== SETUP TEST ENVIRONMENT ====================
  
  console.log("\n🧪 Setting up Test Environment...");
  
  // Fund the DEX with some tokens for testing
  await mockUSDC.transfer(dexAddress, ethers.parseUnits("10000", 6));
  await mockWETH.transfer(dexAddress, ethers.parseUnits("10", 18));
  await mockWBTC.transfer(dexAddress, ethers.parseUnits("1", 8));
  
  console.log("✅ Funded DEX with test tokens");
  
  // ==================== TEST SWAP QUOTES ====================
  
  console.log("\n📊 Testing Swap Quotes...");
  
  try {
    // Test USDC to WETH quote
    const usdcToWethQuote = await universalDEX.getSwapQuote(
      await mockUSDC.getAddress(),
      await mockWETH.getAddress(),
      ethers.parseUnits("1000", 6) // 1000 USDC
    );
    
    console.log("📈 USDC → WETH Quote:");
    console.log(`  Input: 1000 USDC`);
    console.log(`  Output: ${ethers.formatUnits(usdcToWethQuote.outputAmount, 18)} WETH`);
    console.log(`  Gas Fee: ${ethers.formatUnits(usdcToWethQuote.gasFee, 18)} ETH`);
    
    // Test WETH to WBTC quote
    const wethToWbtcQuote = await universalDEX.getSwapQuote(
      await mockWETH.getAddress(),
      await mockWBTC.getAddress(),
      ethers.parseUnits("1", 18) // 1 WETH
    );
    
    console.log("📈 WETH → WBTC Quote:");
    console.log(`  Input: 1 WETH`);
    console.log(`  Output: ${ethers.formatUnits(wethToWbtcQuote.outputAmount, 8)} WBTC`);
    console.log(`  Gas Fee: ${ethers.formatUnits(wethToWbtcQuote.gasFee, 8)} BTC`);
    
  } catch (error) {
    console.log("⚠️ Swap quotes not available (Uniswap router not configured)");
  }
  
  // ==================== TEST BITCOIN MESSAGE DECODING ====================
  
  console.log("\n₿ Testing Bitcoin Message Decoding...");
  
  // Test Bitcoin mainnet
  const isBitcoinMainnet = await universalDEX.isBitcoinChain(8332);
  console.log("✅ Bitcoin Mainnet (8332):", isBitcoinMainnet);
  
  // Test Bitcoin testnet
  const isBitcoinTestnet = await universalDEX.isBitcoinChain(18332);
  console.log("✅ Bitcoin Testnet (18332):", isBitcoinTestnet);
  
  // Test Ethereum
  const isEthereum = await universalDEX.isBitcoinChain(1);
  console.log("✅ Ethereum (1):", !isEthereum);
  
  // ==================== DEPLOYMENT SUMMARY ====================
  
  console.log("\n🎯 Deployment Summary");
  console.log("=====================");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("\n📋 Contract Addresses:");
  console.log("Universal DEX:", dexAddress);
  console.log("Mock USDC:", await mockUSDC.getAddress());
  console.log("Mock WETH:", await mockWETH.getAddress());
  console.log("Mock WBTC:", await mockWBTC.getAddress());
  
  console.log("\n🔧 Configuration:");
  console.log("Uniswap Router:", UNISWAP_ROUTERS[network as keyof typeof UNISWAP_ROUTERS] || "Not set");
  console.log("Price Oracle:", PRICE_ORACLES[network as keyof typeof PRICE_ORACLES] || "Not set");
  console.log("Swap Fee:", "0.3%");
  console.log("Gas Fee Buffer:", "20%");
  
  // Save deployment addresses to file
  const deploymentInfo = {
    network,
    deployer: deployer.address,
    contracts: {
      universalDEX: dexAddress,
      mockUSDC: await mockUSDC.getAddress(),
      mockWETH: await mockWETH.getAddress(),
      mockWBTC: await mockWBTC.getAddress()
    },
    configuration: {
      uniswapRouter: UNISWAP_ROUTERS[network as keyof typeof UNISWAP_ROUTERS] || "Not set",
      priceOracle: PRICE_ORACLES[network as keyof typeof PRICE_ORACLES] || "Not set",
      swapFee: "0.3%",
      gasFeeBuffer: "20%"
    },
    zrc20Tokens: ZRC20_TOKENS,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    `deployment-dex-${network}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n💾 Deployment info saved to: deployment-dex-${network}.json`);
  
  // ==================== NEXT STEPS ====================
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Configure Uniswap V2 router address");
  console.log("2. Set up price oracle for accurate quotes");
  console.log("3. Test cross-chain swaps via ZetaChain Gateway");
  console.log("4. Deploy to mainnet when ready");
  console.log("5. Integrate with frontend applications");
  
  console.log("\n🎉 AEGIS Universal DEX deployment completed successfully!");
  
  // ==================== USAGE EXAMPLES ====================
  
  console.log("\n📖 Usage Examples:");
  console.log("\n1. Cross-Chain Swap (Ethereum → Base):");
  console.log(`   - Send tokens to DEX on ZetaChain`);
  console.log(`   - Include message: (targetToken, recipient, true, slippage)`);
  console.log(`   - DEX will swap and withdraw to Base`);
  
  console.log("\n2. Bitcoin Swap:");
  console.log(`   - Use compact format: [20-byte token][recipient][withdraw][slippage]`);
  console.log(`   - DEX handles UTXO constraints automatically`);
  
  console.log("\n3. Failed Withdrawal Handling:");
  console.log(`   - DEX automatically refunds failed transactions`);
  console.log(`   - Swaps failed assets back to original tokens`);
  console.log(`   - Sends refund to original sender`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 