#!/usr/bin/env node

import { ethers } from "hardhat";
import { Command } from "commander";
import chalk from "chalk";

const program = new Command();

// CLI Commands for AEGIS Protocol
program
  .name("aegis-cli")
  .description("CLI for AEGIS Universal Lending Protocol")
  .version("1.0.0");

// Lock collateral command
program
  .command("lock-collateral")
  .description("Lock collateral in the AEGIS protocol")
  .requiredOption("-a, --asset <address>", "Asset contract address")
  .requiredOption("-am, --amount <amount>", "Amount to lock")
  .requiredOption("-c, --chain <chainId>", "Chain ID")
  .option("-n, --nft", "Lock as NFT")
  .option("-t, --tokenId <id>", "NFT token ID")
  .action(async (options) => {
    try {
      console.log(chalk.blue("🔒 Locking collateral..."));
      
      const [deployer] = await ethers.getSigners();
      const aegisProtocol = await ethers.getContractAt(
        "AegisUniversalLending",
        process.env.AEGIS_PROTOCOL_ADDRESS || "0x..."
      );
      
      if (options.nft) {
        await aegisProtocol.lockNFT(
          options.asset,
          options.tokenId || 0,
          parseInt(options.chain)
        );
        console.log(chalk.green(`✅ NFT locked successfully! Token ID: ${options.tokenId}`));
      } else {
        await aegisProtocol.lockCollateral(
          options.asset,
          ethers.parseUnits(options.amount, 18),
          parseInt(options.chain)
        );
        console.log(chalk.green(`✅ Collateral locked successfully! Amount: ${options.amount}`));
      }
    } catch (error) {
      console.error(chalk.red("❌ Error locking collateral:"), error);
    }
  });

// Borrow command
program
  .command("borrow")
  .description("Borrow against locked collateral")
  .requiredOption("-c, --collateralId <id>", "Collateral ID")
  .requiredOption("-t, --targetChain <chainId>", "Target chain ID")
  .requiredOption("-a, --asset <address>", "Debt asset address")
  .requiredOption("-am, --amount <amount>", "Amount to borrow")
  .action(async (options) => {
    try {
      console.log(chalk.blue("💰 Borrowing against collateral..."));
      
      const [deployer] = await ethers.getSigners();
      const aegisProtocol = await ethers.getContractAt(
        "AegisUniversalLending",
        process.env.AEGIS_PROTOCOL_ADDRESS || "0x..."
      );
      
      await aegisProtocol.borrowAgainstCollateral(
        parseInt(options.collateralId),
        parseInt(options.targetChain),
        options.asset,
        ethers.parseUnits(options.amount, 6)
      );
      
      console.log(chalk.green(`✅ Borrowed successfully! Amount: ${options.amount}`));
    } catch (error) {
      console.error(chalk.red("❌ Error borrowing:"), error);
    }
  });

// View positions command
program
  .command("positions")
  .description("View user positions")
  .option("-u, --user <address>", "User address (default: deployer)")
  .action(async (options) => {
    try {
      console.log(chalk.blue("📊 Fetching user positions..."));
      
      const [deployer] = await ethers.getSigners();
      const userAddress = options.user || await deployer.getAddress();
      
      const aegisProtocol = await ethers.getContractAt(
        "AegisUniversalLending",
        process.env.AEGIS_PROTOCOL_ADDRESS || "0x..."
      );
      
      const position = await aegisProtocol.getUserPosition(userAddress);
      
      console.log(chalk.cyan("\n=== User Position ==="));
      console.log(`User: ${userAddress}`);
      console.log(`Collateral Count: ${position.collateralCount}`);
      console.log(`Active Loans: ${position.activeLoans}`);
      console.log(`Total Collateral Value: ${ethers.formatUnits(position.totalCollateralValue, 8)} USD`);
      console.log(`Total Debt Value: ${ethers.formatUnits(position.totalDebtValue, 6)} USD`);
      
      // Show individual collaterals
      if (position.collateralCount > 0) {
        console.log(chalk.cyan("\n=== Collaterals ==="));
        for (let i = 1; i <= position.collateralCount; i++) {
          try {
            const collateral = await aegisProtocol.getCollateral(i);
            if (collateral.owner === userAddress) {
              console.log(`ID: ${i}`);
              console.log(`  Asset: ${collateral.asset}`);
              console.log(`  Amount: ${ethers.formatUnits(collateral.amount, 18)}`);
              console.log(`  Chain: ${collateral.chainId}`);
              console.log(`  Is NFT: ${collateral.isNFT}`);
              console.log(`  Value: ${ethers.formatUnits(collateral.currentValue, 8)} USD`);
              console.log("  ---");
            }
          } catch (error) {
            // Skip if collateral doesn't exist
          }
        }
      }
      
      // Show individual loans
      if (position.activeLoans > 0) {
        console.log(chalk.cyan("\n=== Loans ==="));
        for (let i = 1; i <= position.activeLoans; i++) {
          try {
            const loan = await aegisProtocol.getLoan(i);
            if (loan.owner === userAddress && !loan.liquidated) {
              console.log(`ID: ${i}`);
              console.log(`  Collateral ID: ${loan.collateralId}`);
              console.log(`  Debt Asset: ${loan.debtAsset}`);
              console.log(`  Debt Amount: ${ethers.formatUnits(loan.debtAmount, 6)}`);
              console.log(`  Target Chain: ${loan.debtChainId}`);
              console.log(`  Interest Rate: ${loan.interestRate / 100}%`);
              console.log(`  Health Factor: ${ethers.formatUnits(loan.healthFactor, 2)}`);
              console.log("  ---");
            }
          } catch (error) {
            // Skip if loan doesn't exist
          }
        }
      }
      
    } catch (error) {
      console.error(chalk.red("❌ Error fetching positions:"), error);
    }
  });

// Risk profile command
program
  .command("risk-profile")
  .description("View or set risk profiles")
  .option("-a, --asset <address>", "Asset address")
  .option("-c, --chain <chainId>", "Chain ID")
  .option("-s, --set", "Set risk profile")
  .option("-l, --ltv <ltv>", "Max LTV (basis points)")
  .option("-t, --threshold <threshold>", "Liquidation threshold (basis points)")
  .option("-v, --volatility <score>", "Volatility score (0-100)")
  .action(async (options) => {
    try {
      if (options.set) {
        console.log(chalk.blue("⚙️ Setting risk profile..."));
        
        const mockAIOracle = await ethers.getContractAt(
          "MockAIOracle",
          process.env.MOCK_AI_ORACLE_ADDRESS || "0x..."
        );
        
        await mockAIOracle.setMockRiskProfile(
          options.asset,
          parseInt(options.chain),
          parseInt(options.ltv),
          parseInt(options.threshold),
          parseInt(options.volatility)
        );
        
        console.log(chalk.green("✅ Risk profile set successfully!"));
      } else {
        console.log(chalk.blue("📈 Fetching risk profile..."));
        
        const mockAIOracle = await ethers.getContractAt(
          "MockAIOracle",
          process.env.MOCK_AI_ORACLE_ADDRESS || "0x..."
        );
        
        const profile = await mockAIOracle.getRiskProfile(
          parseInt(options.chain),
          options.asset
        );
        
        console.log(chalk.cyan("\n=== Risk Profile ==="));
        console.log(`Asset: ${options.asset}`);
        console.log(`Chain: ${options.chain}`);
        console.log(`Max LTV: ${profile.maxLTV / 100}%`);
        console.log(`Liquidation Threshold: ${profile.liquidationThreshold / 100}%`);
        console.log(`Volatility Score: ${profile.volatilityScore}`);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error with risk profile:"), error);
    }
  });

// Price command
program
  .command("price")
  .description("View or set asset prices")
  .requiredOption("-a, --asset <address>", "Asset address")
  .requiredOption("-c, --chain <chainId>", "Chain ID")
  .option("-s, --set <price>", "Set price (in USD)")
  .action(async (options) => {
    try {
      if (options.set) {
        console.log(chalk.blue("💰 Setting asset price..."));
        
        const mockAIOracle = await ethers.getContractAt(
          "MockAIOracle",
          process.env.MOCK_AI_ORACLE_ADDRESS || "0x..."
        );
        
        const priceInUSD = parseFloat(options.set);
        const priceInWei = Math.floor(priceInUSD * 100000000); // 8 decimals
        
        await mockAIOracle.setMockPrice(
          options.asset,
          parseInt(options.chain),
          priceInWei
        );
        
        console.log(chalk.green(`✅ Price set to $${priceInUSD}`));
      } else {
        console.log(chalk.blue("💵 Fetching asset price..."));
        
        const mockAIOracle = await ethers.getContractAt(
          "MockAIOracle",
          process.env.MOCK_AI_ORACLE_ADDRESS || "0x..."
        );
        
        const priceData = await mockAIOracle.getAssetPrice(
          parseInt(options.chain),
          options.asset
        );
        
        const priceInUSD = priceData.price / 100000000; // Convert from 8 decimals
        
        console.log(chalk.cyan("\n=== Asset Price ==="));
        console.log(`Asset: ${options.asset}`);
        console.log(`Chain: ${options.chain}`);
        console.log(`Price: $${priceInUSD.toFixed(2)}`);
        console.log(`Last Update: ${new Date(Number(priceData.timestamp) * 1000).toLocaleString()}`);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error with price:"), error);
    }
  });

// Protocol info command
program
  .command("info")
  .description("View protocol information")
  .action(async () => {
    try {
      console.log(chalk.blue("ℹ️ Fetching protocol information..."));
      
      const aegisProtocol = await ethers.getContractAt(
        "AegisUniversalLending",
        process.env.AEGIS_PROTOCOL_ADDRESS || "0x..."
      );
      
      const collateralCount = await aegisProtocol.collateralCounter();
      const loanCount = await aegisProtocol.loanCounter();
      const nftCount = await aegisProtocol.nftCounter();
      const owner = await aegisProtocol.owner();
      const aiOracle = await aegisProtocol.aiOracle();
      const paused = await aegisProtocol.paused();
      
      console.log(chalk.cyan("\n=== AEGIS Protocol Info ==="));
      console.log(`Owner: ${owner}`);
      console.log(`AI Oracle: ${aiOracle}`);
      console.log(`Paused: ${paused ? "Yes" : "No"}`);
      console.log(`Total Collaterals: ${collateralCount}`);
      console.log(`Total Loans: ${loanCount}`);
      console.log(`Total NFTs: ${nftCount}`);
      
      // Protocol parameters
      const basisPoints = await aegisProtocol.BASIS_POINTS();
      const minLiquidationThreshold = await aegisProtocol.MIN_LIQUIDATION_THRESHOLD();
      const maxLiquidationThreshold = await aegisProtocol.MAX_LIQUIDATION_THRESHOLD();
      const liquidationPenalty = await aegisProtocol.LIQUIDATION_PENALTY();
      const maxInterestRate = await aegisProtocol.MAX_INTEREST_RATE();
      
      console.log(chalk.cyan("\n=== Protocol Parameters ==="));
      console.log(`Basis Points: ${basisPoints}`);
      console.log(`Min Liquidation Threshold: ${minLiquidationThreshold / 100}%`);
      console.log(`Max Liquidation Threshold: ${maxLiquidationThreshold / 100}%`);
      console.log(`Liquidation Penalty: ${liquidationPenalty / 100}%`);
      console.log(`Max Interest Rate: ${maxInterestRate / 100}%`);
      
    } catch (error) {
      console.error(chalk.red("❌ Error fetching protocol info:"), error);
    }
  });

// Help command
program
  .command("help")
  .description("Show help information")
  .action(() => {
    console.log(chalk.cyan("\n=== AEGIS Protocol CLI Help ==="));
    console.log("Available commands:");
    console.log("  lock-collateral  - Lock collateral in the protocol");
    console.log("  borrow           - Borrow against locked collateral");
    console.log("  positions        - View user positions");
    console.log("  risk-profile     - View or set risk profiles");
    console.log("  price            - View or set asset prices");
    console.log("  info             - View protocol information");
    console.log("  help             - Show this help message");
    console.log("\nUse --help with any command for detailed options.");
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
} 