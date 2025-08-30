import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  const hre: HardhatRuntimeEnvironment = await import("hardhat");
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying AEGIS Universal Lending Protocol");
  console.log("=============================================");
  console.log("Deployer:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // ==================== DEPLOYMENT CONFIGURATION ====================
  
  // Chain IDs for different networks
  const CHAIN_IDS = {
    ETHEREUM: 1,
    POLYGON: 137,
    BSC: 56,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    ZETA_TESTNET: 7001,
    ZETA_MAINNET: 7000,
    BITCOIN_TESTNET: 18332,
    LOCALNET: 1337
  };
  
  // Mock connector addresses (replace with real ones in production)
  const MOCK_CONNECTORS = {
    [CHAIN_IDS.ZETA_TESTNET]: "0x0000000000000000000000000000000000000000",
    [CHAIN_IDS.ZETA_MAINNET]: "0x0000000000000000000000000000000000000000",
    [CHAIN_IDS.LOCALNET]: "0x0000000000000000000000000000000000000000"
  };
  
  // ==================== DEPLOY MOCK CONTRACTS ====================
  
  console.log("\n📦 Deploying Mock Contracts...");
  
  // Deploy Mock AI Oracle
  const MockAIOracle = await ethers.getContractFactory("MockAIOracle");
  const mockAIOracle = await MockAIOracle.deploy();
  await mockAIOracle.waitForDeployment();
  const mockAIOracleAddress = await mockAIOracle.getAddress();
  console.log("✅ Mock AI Oracle:", mockAIOracleAddress);
  
  // Deploy Mock Universal Token (USDC)
  const MockUniversalToken = await ethers.getContractFactory("MockUniversalToken");
  const mockUSDC = await MockUniversalToken.deploy(
    "USD Coin",
    "USDC",
    ethers.parseUnits("1000000", 6) // 1M USDC
  );
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ Mock USDC:", mockUSDCAddress);
  
  // Deploy Mock Universal Token (ETH)
  const mockETH = await MockUniversalToken.deploy(
    "Ethereum",
    "ETH",
    ethers.parseUnits("1000", 18) // 1000 ETH
  );
  await mockETH.waitForDeployment();
  const mockETHAddress = await mockETH.getAddress();
  console.log("✅ Mock ETH:", mockETHAddress);
  
  // Deploy Mock Universal Token (BTC)
  const mockBTC = await MockUniversalToken.deploy(
    "Bitcoin",
    "BTC",
    ethers.parseUnits("100", 8) // 100 BTC
  );
  await mockBTC.waitForDeployment();
  const mockBTCAddress = await mockBTC.getAddress();
  console.log("✅ Mock BTC:", mockBTCAddress);
  
  // ==================== DEPLOY AEGIS PROTOCOL ====================
  
  console.log("\n🏗️ Deploying AEGIS Protocol...");
  
  // Get the appropriate connector address based on network
  const network = hre.network.name;
  let connectorAddress: string;
  
  if (network === "zeta_testnet") {
    connectorAddress = MOCK_CONNECTORS[CHAIN_IDS.ZETA_TESTNET];
  } else if (network === "zeta_mainnet") {
    connectorAddress = MOCK_CONNECTORS[CHAIN_IDS.ZETA_MAINNET];
  } else {
    connectorAddress = MOCK_CONNECTORS[CHAIN_IDS.LOCALNET];
  }
  
  // Deploy AEGIS Universal Lending Protocol
  const AegisUniversalLending = await ethers.getContractFactory("AegisUniversalLending");
  const aegisProtocol = await AegisUniversalLending.deploy(
    connectorAddress, // System contract address
    mockAIOracleAddress,
    connectorAddress // Price oracle (using connector for now)
  );
  await aegisProtocol.waitForDeployment();
  const aegisProtocolAddress = await aegisProtocol.getAddress();
  console.log("✅ AEGIS Protocol:", aegisProtocolAddress);
  
  // ==================== DEPLOY BITCOIN CONNECTOR ====================
  
  console.log("\n₿ Deploying Bitcoin Connector...");
  
  const BitcoinConnector = await ethers.getContractFactory("BitcoinConnector");
  const bitcoinConnector = await BitcoinConnector.deploy(connectorAddress);
  await bitcoinConnector.waitForDeployment();
  const bitcoinConnectorAddress = await bitcoinConnector.getAddress();
  console.log("✅ Bitcoin Connector:", bitcoinConnectorAddress);
  
  // ==================== DEPLOY CROSS-CHAIN CONNECTORS ====================
  
  console.log("\n🔗 Deploying Cross-Chain Connectors...");
  
  const CrossChainConnector = await ethers.getContractFactory("CrossChainConnector");
  
  // Deploy connector for Ethereum
  const ethereumConnector = await CrossChainConnector.deploy(aegisProtocolAddress);
  await ethereumConnector.waitForDeployment();
  console.log("✅ Ethereum Connector:", await ethereumConnector.getAddress());
  
  // Deploy connector for Polygon
  const polygonConnector = await CrossChainConnector.deploy(aegisProtocolAddress);
  await polygonConnector.waitForDeployment();
  console.log("✅ Polygon Connector:", await polygonConnector.getAddress());
  
  // Deploy connector for BSC
  const bscConnector = await CrossChainConnector.deploy(aegisProtocolAddress);
  await bscConnector.waitForDeployment();
  console.log("✅ BSC Connector:", await bscConnector.getAddress());
  
  // Deploy connector for Arbitrum
  const arbitrumConnector = await CrossChainConnector.deploy(aegisProtocolAddress);
  await arbitrumConnector.waitForDeployment();
  console.log("✅ Arbitrum Connector:", await arbitrumConnector.getAddress());
  
  // Deploy connector for Optimism
  const optimismConnector = await CrossChainConnector.deploy(aegisProtocolAddress);
  await optimismConnector.waitForDeployment();
  console.log("✅ Optimism Connector:", await optimismConnector.getAddress());
  
  // ==================== CONFIGURE PROTOCOL ====================
  
  console.log("\n⚙️ Configuring Protocol...");
  
  // Set cross-chain contract addresses in AEGIS protocol
  await aegisProtocol.setCrossChainContract(CHAIN_IDS.ETHEREUM, await ethereumConnector.getAddress());
  await aegisProtocol.setCrossChainContract(CHAIN_IDS.POLYGON, await polygonConnector.getAddress());
  await aegisProtocol.setCrossChainContract(CHAIN_IDS.BSC, await bscConnector.getAddress());
  await aegisProtocol.setCrossChainContract(CHAIN_IDS.ARBITRUM, await arbitrumConnector.getAddress());
  await aegisProtocol.setCrossChainContract(CHAIN_IDS.OPTIMISM, await optimismConnector.getAddress());
  console.log("✅ Set cross-chain contract addresses");
  
  // Approve tokens for different chains
  const chains = [CHAIN_IDS.ETHEREUM, CHAIN_IDS.POLYGON, CHAIN_IDS.BSC, CHAIN_IDS.ARBITRUM, CHAIN_IDS.OPTIMISM];
  
  for (const chainId of chains) {
    await aegisProtocol.approveToken(mockUSDCAddress, chainId);
    await aegisProtocol.approveToken(mockETHAddress, chainId);
    await aegisProtocol.approveToken(mockBTCAddress, chainId);
  }
  console.log("✅ Approved tokens for all chains");
  
  // Set up mock risk profiles via AI Oracle
  for (const chainId of chains) {
    // USDC: Low volatility, high LTV
    await mockAIOracle.setMockRiskProfile(
      mockUSDCAddress,
      chainId,
      8500, // 85% max LTV
      9000, // 90% liquidation threshold
      20    // Low volatility
    );
    
    // ETH: Medium volatility, medium LTV
    await mockAIOracle.setMockRiskProfile(
      mockETHAddress,
      chainId,
      7500, // 75% max LTV
      8500, // 85% liquidation threshold
      60    // Medium volatility
    );
    
    // BTC: High volatility, lower LTV
    await mockAIOracle.setMockRiskProfile(
      mockBTCAddress,
      chainId,
      7000, // 70% max LTV
      8000, // 80% liquidation threshold
      80    // High volatility
    );
  }
  console.log("✅ Set risk profiles for all assets");
  
  // Set mock prices
  for (const chainId of chains) {
    await mockAIOracle.setMockPrice(mockUSDCAddress, chainId, 100000000); // $1.00
    await mockAIOracle.setMockPrice(mockETHAddress, chainId, 2000000000); // $2000
    await mockAIOracle.setMockPrice(mockBTCAddress, chainId, 40000000000); // $40000
  }
  console.log("✅ Set prices for all assets");
  
  // Configure cross-chain connectors
  const connectors = [
    { contract: ethereumConnector, chainId: CHAIN_IDS.ETHEREUM },
    { contract: polygonConnector, chainId: CHAIN_IDS.POLYGON },
    { contract: bscConnector, chainId: CHAIN_IDS.BSC },
    { contract: arbitrumConnector, chainId: CHAIN_IDS.ARBITRUM },
    { contract: optimismConnector, chainId: CHAIN_IDS.OPTIMISM }
  ];
  
  for (const { contract, chainId } of connectors) {
    await contract.addSupportedToken(mockUSDCAddress);
    await contract.addSupportedToken(mockETHAddress);
    await contract.addSupportedToken(mockBTCAddress);
    console.log(`✅ Configured connector for chain ${chainId}`);
  }
  
  // Configure Bitcoin connector
  await bitcoinConnector.setAegisProtocol(aegisProtocolAddress);
  console.log("✅ Configured Bitcoin connector");
  
  // ==================== UNIVERSAL CONTRACT DEMO ====================
  
  console.log("\n🌐 Universal Contract Demo...");
  
  // Simulate cross-chain collateral deposit
  const user1 = ethers.Wallet.createRandom();
  const user2 = ethers.Wallet.createRandom();
  
  // Simulate BTC deposit via Universal Contract pattern
  const btcDepositMessage = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes4", "bytes"],
    [
      "0x12345678", // handleBitcoinDeposit selector
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "bytes", "uint256"],
        [user1.address, "0xbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", ethers.parseUnits("1", 8)]
      )
    ]
  );
  
  console.log("✅ Simulated BTC deposit for user:", user1.address);
  
  // Simulate ETH deposit from Ethereum
  const ethDepositMessage = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes4", "bytes"],
    [
      "0x87654321", // lockCollateralFromChain selector
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "bool"],
        [user2.address, mockETHAddress, ethers.parseUnits("10", 18), false]
      )
    ]
  );
  
  console.log("✅ Simulated ETH deposit for user:", user2.address);
  
  // ==================== CROSS-CHAIN LENDING DEMO ====================
  
  console.log("\n💰 Cross-Chain Lending Demo...");
  
  // Lock collateral via CLI
  await aegisProtocol.cliLockCollateral(
    mockETHAddress,
    ethers.parseUnits("5", 18), // 5 ETH
    0, // No token ID for fungible
    1, // Ethereum chain
    false // Not NFT
  );
  console.log("✅ CLI: Locked 5 ETH collateral");
  
  // Borrow against collateral via CLI
  await aegisProtocol.cliBorrow(
    1, // collateralId
    137, // Polygon chain
    mockUSDCAddress, // USDC debt
    ethers.parseUnits("5000", 6) // 5,000 USDC
  );
  console.log("✅ CLI: Borrowed 5,000 USDC against ETH collateral");
  
  // ==================== UNIVERSAL NFT DEMO ====================
  
  console.log("\n🖼️ Universal NFT Demo...");
  
  // Create a mock NFT contract address
  const mockNFTAddress = "0x1234567890123456789012345678901234567890";
  
  // Lock NFT collateral
  await aegisProtocol.cliLockCollateral(
    mockNFTAddress,
    1, // 1 NFT
    123, // Token ID 123
    1, // Ethereum chain
    true // Is NFT
  );
  console.log("✅ CLI: Locked NFT collateral (Token ID: 123)");
  
  // ==================== VERIFICATION ====================
  
  console.log("\n🔍 Verification...");
  
  // Check protocol state
  const protocolStats = await aegisProtocol.getProtocolStats();
  console.log("📊 Protocol Statistics:");
  console.log(`- Total Collaterals: ${protocolStats.totalCollaterals}`);
  console.log(`- Total Loans: ${protocolStats.totalLoans}`);
  console.log(`- Total Collateral Value: ${ethers.formatUnits(protocolStats.totalCollateralValue, 8)} USD`);
  console.log(`- Total Debt Value: ${ethers.formatUnits(protocolStats.totalDebtValue, 6)} USD`);
  
  // Check user positions
  const deployerPosition = await aegisProtocol.getUserPosition(deployer.address);
  console.log("\n👤 Deployer Position:");
  console.log(`- Collateral Count: ${deployerPosition.collateralCount}`);
  console.log(`- Active Loans: ${deployerPosition.activeLoans}`);
  console.log(`- Total Collateral Value: ${ethers.formatUnits(deployerPosition.totalCollateralValue, 8)} USD`);
  console.log(`- Total Debt Value: ${ethers.formatUnits(deployerPosition.totalDebtValue, 6)} USD`);
  
  // Check Bitcoin connector
  const btcConnectorOwner = await bitcoinConnector.owner();
  console.log("\n₿ Bitcoin Connector:");
  console.log(`- Owner: ${btcConnectorOwner}`);
  console.log(`- AEGIS Protocol: ${await bitcoinConnector.aegisProtocol()}`);
  
  // ==================== DEPLOYMENT SUMMARY ====================
  
  console.log("\n🎯 Deployment Summary");
  console.log("=====================");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("\n📋 Contract Addresses:");
  console.log("Mock AI Oracle:", mockAIOracleAddress);
  console.log("Mock USDC:", mockUSDCAddress);
  console.log("Mock ETH:", mockETHAddress);
  console.log("Mock BTC:", mockBTCAddress);
  console.log("AEGIS Protocol:", aegisProtocolAddress);
  console.log("Bitcoin Connector:", bitcoinConnectorAddress);
  console.log("Ethereum Connector:", await ethereumConnector.getAddress());
  console.log("Polygon Connector:", await polygonConnector.getAddress());
  console.log("BSC Connector:", await bscConnector.getAddress());
  console.log("Arbitrum Connector:", await arbitrumConnector.getAddress());
  console.log("Optimism Connector:", await optimismConnector.getAddress());
  
  // Save deployment addresses to file
  const deploymentInfo = {
    network,
    deployer: deployer.address,
    contracts: {
      mockAIOracle: mockAIOracleAddress,
      mockUSDC: mockUSDCAddress,
      mockETH: mockETHAddress,
      mockBTC: mockBTCAddress,
      aegisProtocol: aegisProtocolAddress,
      bitcoinConnector: bitcoinConnectorAddress,
      ethereumConnector: await ethereumConnector.getAddress(),
      polygonConnector: await polygonConnector.getAddress(),
      bscConnector: await bscConnector.getAddress(),
      arbitrumConnector: await arbitrumConnector.getAddress(),
      optimismConnector: await optimismConnector.getAddress()
    },
    chainIds: CHAIN_IDS,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    `deployment-${network}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n💾 Deployment info saved to: deployment-${network}.json`);
  console.log("\n🎉 AEGIS Universal Lending Protocol deployment completed successfully!");
  console.log("\n🚀 Next Steps:");
  console.log("1. Test the protocol with: npm run test");
  console.log("2. Run demo with: npm run demo");
  console.log("3. Deploy to testnet with: npm run deploy:testnet");
  console.log("4. Configure real AI Oracle and price feeds");
  console.log("5. Deploy cross-chain connectors to target chains");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 