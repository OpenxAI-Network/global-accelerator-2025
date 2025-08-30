import { ethers } from "hardhat";

async function main() {
  console.log("🚀 AEGIS Protocol Demo");
  console.log("=======================");
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  try {
    // Deploy mock contracts
    console.log("\n📦 Deploying Mock Contracts...");
    
    const MockAIOracle = await ethers.getContractFactory("MockAIOracle");
    const mockAIOracle = await MockAIOracle.deploy();
    await mockAIOracle.waitForDeployment();
    console.log(`✅ Mock AI Oracle: ${await mockAIOracle.getAddress()}`);
    
    const MockUniversalToken = await ethers.getContractFactory("MockUniversalToken");
    const mockUSDC = await MockUniversalToken.deploy(
      "USD Coin",
      "USDC",
      ethers.parseUnits("1000000", 6)
    );
    await mockUSDC.waitForDeployment();
    console.log(`✅ Mock USDC: ${await mockUSDC.getAddress()}`);
    
    const mockETH = await MockUniversalToken.deploy(
      "Ethereum",
      "ETH",
      ethers.parseUnits("1000", 18)
    );
    await mockETH.waitForDeployment();
    console.log(`✅ Mock ETH: ${await mockETH.getAddress()}`);
    
    // Deploy AEGIS protocol
    console.log("\n🏗️ Deploying AEGIS Protocol...");
    
    const AegisUniversalLending = await ethers.getContractFactory("AegisUniversalLending");
    const aegisProtocol = await AegisUniversalLending.deploy(
      ethers.ZeroAddress, // Mock connector
      await mockAIOracle.getAddress(),
      ethers.ZeroAddress  // Mock localnet connector
    );
    await aegisProtocol.waitForDeployment();
    console.log(`✅ AEGIS Protocol: ${await aegisProtocol.getAddress()}`);
    
    // Configure protocol
    console.log("\n⚙️ Configuring Protocol...");
    
    const chains = [1, 137, 56, 42161, 10]; // Ethereum, Polygon, BSC, Arbitrum, Optimism
    
    for (const chainId of chains) {
      await aegisProtocol.approveToken(await mockUSDC.getAddress(), chainId);
      await aegisProtocol.approveToken(await mockETH.getAddress(), chainId);
    }
    console.log("✅ Approved tokens for all chains");
    
    // Set up risk profiles
    for (const chainId of chains) {
      // USDC: Low volatility, high LTV
      await mockAIOracle.setMockRiskProfile(
        await mockUSDC.getAddress(),
        chainId,
        8500, // 85% max LTV
        9000, // 90% liquidation threshold
        20    // Low volatility
      );
      
      // ETH: Medium volatility, medium LTV
      await mockAIOracle.setMockRiskProfile(
        await mockETH.getAddress(),
        chainId,
        7500, // 75% max LTV
        8500, // 85% liquidation threshold
        60    // Medium volatility
      );
    }
    console.log("✅ Set risk profiles for all assets");
    
    // Set mock prices
    for (const chainId of chains) {
      await mockAIOracle.setMockPrice(await mockUSDC.getAddress(), chainId, 100000000); // $1.00
      await mockAIOracle.setMockPrice(await mockETH.getAddress(), chainId, 2000000000); // $2000
    }
    console.log("✅ Set prices for all assets");
    
    // Demo: Lock collateral
    console.log("\n🔒 Demo: Locking Collateral...");
    
    await aegisProtocol.lockCollateral(
      await mockETH.getAddress(),
      ethers.parseUnits("5", 18), // 5 ETH
      1 // Ethereum chain
    );
    console.log("✅ Locked 5 ETH as collateral");
    
    // Demo: Borrow against collateral
    console.log("\n💰 Demo: Borrowing Against Collateral...");
    
    await aegisProtocol.borrowAgainstCollateral(
      1, // collateralId
      137, // Polygon chain
      await mockUSDC.getAddress(), // USDC debt
      ethers.parseUnits("5000", 6) // 5,000 USDC
    );
    console.log("✅ Borrowed 5,000 USDC against ETH collateral");
    
    // Demo: Lock NFT
    console.log("\n🖼️ Demo: Locking NFT...");
    
    const mockNFTAddress = "0x1234567890123456789012345678901234567890";
    await aegisProtocol.cliLockCollateral(
      mockNFTAddress,
      1, // 1 NFT
      123, // Token ID 123
      1, // Ethereum chain
      true // Is NFT
    );
    console.log("✅ Locked NFT as collateral");
    
    // View protocol state
    console.log("\n📊 Protocol State:");
    
    const collateralCount = await aegisProtocol.collateralCounter();
    const loanCount = await aegisProtocol.loanCounter();
    const nftCount = await aegisProtocol.nftCounter();
    
    console.log(`- Total Collaterals: ${collateralCount}`);
    console.log(`- Total Loans: ${loanCount}`);
    console.log(`- Total NFTs: ${nftCount}`);
    
    // View user position
    const userPosition = await aegisProtocol.getUserPosition(deployer.address);
    console.log("\n👤 User Position:");
    console.log(`- Collateral Count: ${userPosition.collateralCount}`);
    console.log(`- Active Loans: ${userPosition.activeLoans}`);
    console.log(`- Total Collateral Value: ${ethers.formatUnits(userPosition.totalCollateralValue, 8)} USD`);
    console.log(`- Total Debt Value: ${ethers.formatUnits(userPosition.totalDebtValue, 6)} USD`);
    
    // Demo: Risk assessment
    console.log("\n📈 Demo: Risk Assessment...");
    
    const ethRiskProfile = await mockAIOracle.getRiskProfile(1, await mockETH.getAddress());
    console.log("ETH Risk Profile:");
    console.log(`- Max LTV: ${ethRiskProfile.maxLTV / 100}%`);
    console.log(`- Liquidation Threshold: ${ethRiskProfile.liquidationThreshold / 100}%`);
    console.log(`- Volatility Score: ${ethRiskProfile.volatilityScore}`);
    
    const usdcRiskProfile = await mockAIOracle.getRiskProfile(1, await mockUSDC.getAddress());
    console.log("USDC Risk Profile:");
    console.log(`- Max LTV: ${usdcRiskProfile.maxLTV / 100}%`);
    console.log(`- Liquidation Threshold: ${usdcRiskProfile.liquidationThreshold / 100}%`);
    console.log(`- Volatility Score: ${usdcRiskProfile.volatilityScore}`);
    
    // Demo: Price feeds
    console.log("\n💵 Demo: Price Feeds...");
    
    const ethPrice = await mockAIOracle.getAssetPrice(1, await mockETH.getAddress());
    const usdcPrice = await mockAIOracle.getAssetPrice(1, await mockUSDC.getAddress());
    
    console.log(`ETH Price: $${ethers.formatUnits(ethPrice.price, 8)}`);
    console.log(`USDC Price: $${ethers.formatUnits(usdcPrice.price, 8)}`);
    
    // Demo: Health factor calculation
    console.log("\n🏥 Demo: Health Factor Calculation...");
    
    const loan = await aegisProtocol.getLoan(1);
    console.log(`Loan Health Factor: ${ethers.formatUnits(loan.healthFactor, 2)}`);
    console.log(`Interest Rate: ${loan.interestRate / 100}%`);
    
    // Demo: Cross-chain operations
    console.log("\n🌐 Demo: Cross-Chain Operations...");
    
    const ethBalanceOnPolygon = await mockETH.balanceOfUniversal(137, deployer.address);
    console.log(`ETH balance on Polygon: ${ethers.formatUnits(ethBalanceOnPolygon, 18)}`);
    
    const usdcBalanceOnPolygon = await mockUSDC.balanceOfUniversal(137, deployer.address);
    console.log(`USDC balance on Polygon: ${ethers.formatUnits(usdcBalanceOnPolygon, 6)}`);
    
    console.log("\n🎉 Demo completed successfully!");
    console.log("\n📋 Summary:");
    console.log("1. Deployed mock contracts (AI Oracle, USDC, ETH)");
    console.log("2. Deployed AEGIS protocol");
    console.log("3. Configured risk profiles and prices");
    console.log("4. Locked ETH collateral");
    console.log("5. Borrowed USDC against collateral");
    console.log("6. Locked NFT collateral");
    console.log("7. Demonstrated cross-chain operations");
    
    console.log("\n🔗 Contract Addresses:");
    console.log(`AEGIS Protocol: ${await aegisProtocol.getAddress()}`);
    console.log(`Mock AI Oracle: ${await mockAIOracle.getAddress()}`);
    console.log(`Mock USDC: ${await mockUSDC.getAddress()}`);
    console.log(`Mock ETH: ${await mockETH.getAddress()}`);
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Demo failed:", error);
  process.exit(1);
}); 