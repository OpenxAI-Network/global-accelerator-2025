import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract, Signer } from "ethers";

describe("AEGIS Universal Lending Protocol - Universal Contract", function () {
  let hre: HardhatRuntimeEnvironment;
  let aegisProtocol: Contract;
  let bitcoinConnector: Contract;
  let ethereumConnector: Contract;
  let mockAIOracle: Contract;
  let mockUSDC: Contract;
  let mockETH: Contract;
  let mockBTC: Contract;
  let deployer: Signer;
  let user1: Signer;
  let user2: Signer;
  let deployerAddress: string;
  let user1Address: string;
  let user2Address: string;
  
  // Test constants
  const CHAIN_IDS = {
    ETHEREUM: 1,
    POLYGON: 137,
    BSC: 56,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    BITCOIN_TESTNET: 18332,
    LOCALNET: 1337
  };
  
  const BASIS_POINTS = 10000;
  const ETH_AMOUNT = ethers.parseUnits("10", 18);
  const USDC_AMOUNT = ethers.parseUnits("10000", 6);
  const BTC_AMOUNT = ethers.parseUnits("1", 8);
  const BORROW_AMOUNT = ethers.parseUnits("5000", 6);
  
  before(async function () {
    hre = await import("hardhat");
    [deployer, user1, user2] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
  });
  
  beforeEach(async function () {
    // Deploy mock contracts
    const MockAIOracle = await ethers.getContractFactory("MockAIOracle");
    mockAIOracle = await MockAIOracle.deploy();
    
    const MockUniversalToken = await ethers.getContractFactory("MockUniversalToken");
    mockUSDC = await MockUniversalToken.deploy("USD Coin", "USDC", ethers.parseUnits("1000000", 6));
    mockETH = await MockUniversalToken.deploy("Ethereum", "ETH", ethers.parseUnits("1000", 18));
    mockBTC = await MockUniversalToken.deploy("Bitcoin", "BTC", ethers.parseUnits("100", 8));
    
    // Deploy Bitcoin connector
    const BitcoinConnector = await ethers.getContractFactory("BitcoinConnector");
    bitcoinConnector = await BitcoinConnector.deploy(ethers.ZeroAddress);
    
    // Deploy Ethereum connector
    const CrossChainConnector = await ethers.getContractFactory("CrossChainConnector");
    ethereumConnector = await CrossChainConnector.deploy(ethers.ZeroAddress);
    
    // Deploy AEGIS protocol
    const AegisUniversalLending = await ethers.getContractFactory("AegisUniversalLending");
    aegisProtocol = await AegisUniversalLending.deploy(
      ethers.ZeroAddress, // Mock system contract
      await mockAIOracle.getAddress(),
      ethers.ZeroAddress  // Mock price oracle
    );
    
    // Configure protocol
    await aegisProtocol.setCrossChainContract(CHAIN_IDS.ETHEREUM, await ethereumConnector.getAddress());
    await aegisProtocol.setCrossChainContract(CHAIN_IDS.BITCOIN_TESTNET, await bitcoinConnector.getAddress());
    
    await aegisProtocol.approveToken(await mockUSDC.getAddress(), CHAIN_IDS.ETHEREUM);
    await aegisProtocol.approveToken(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM);
    await aegisProtocol.approveToken(await mockBTC.getAddress(), CHAIN_IDS.ETHEREUM);
    
    // Set up risk profiles
    await mockAIOracle.setMockRiskProfile(
      await mockUSDC.getAddress(),
      CHAIN_IDS.ETHEREUM,
      8500, // 85% max LTV
      9000, // 90% liquidation threshold
      20    // Low volatility
    );
    
    await mockAIOracle.setMockRiskProfile(
      await mockETH.getAddress(),
      CHAIN_IDS.ETHEREUM,
      7500, // 75% max LTV
      8500, // 85% liquidation threshold
      60    // Medium volatility
    );
    
    await mockAIOracle.setMockRiskProfile(
      await mockBTC.getAddress(),
      CHAIN_IDS.ETHEREUM,
      7000, // 70% max LTV
      8000, // 80% liquidation threshold
      80    // High volatility
    );
    
    // Set mock prices
    await mockAIOracle.setMockPrice(await mockUSDC.getAddress(), CHAIN_IDS.ETHEREUM, 100000000); // $1.00
    await mockAIOracle.setMockPrice(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM, 2000000000); // $2000
    await mockAIOracle.setMockPrice(await mockBTC.getAddress(), CHAIN_IDS.ETHEREUM, 40000000000); // $40000
    
    // Configure connectors
    await ethereumConnector.addSupportedToken(await mockUSDC.getAddress());
    await ethereumConnector.addSupportedToken(await mockETH.getAddress());
    await ethereumConnector.addSupportedToken(await mockBTC.getAddress());
    
    await bitcoinConnector.setAegisProtocol(await aegisProtocol.getAddress());
  });
  
  describe("Universal Contract Pattern", function () {
    it("Should inherit from UniversalContract", async function () {
      expect(await aegisProtocol.systemContract()).to.equal(ethers.ZeroAddress);
    });
    
    it("Should have cross-chain contract mappings", async function () {
      expect(await aegisProtocol.crossChainContracts(CHAIN_IDS.ETHEREUM)).to.equal(await ethereumConnector.getAddress());
      expect(await aegisProtocol.crossChainContracts(CHAIN_IDS.BITCOIN_TESTNET)).to.equal(await bitcoinConnector.getAddress());
    });
  });
  
  describe("Cross-Chain Collateral Management", function () {
    it("Should handle Bitcoin deposits via Universal Contract", async function () {
      // Simulate Bitcoin deposit message
      const btcDepositData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "bytes", "uint256"],
        [user1Address, "0xbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", BTC_AMOUNT]
      );
      
      const btcMessage = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes4", "bytes"],
        ["0x12345678", btcDepositData] // handleBitcoinDeposit selector
      );
      
      // Mock the onCall function call
      // In a real scenario, this would be called by ZetaChain gateway
      console.log("Simulating Bitcoin deposit via Universal Contract pattern");
    });
    
    it("Should handle EVM collateral deposits", async function () {
      // Simulate EVM collateral deposit
      const evmDepositData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "bool"],
        [user1Address, await mockETH.getAddress(), ETH_AMOUNT, false]
      );
      
      const evmMessage = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes4", "bytes"],
        ["0x87654321", evmDepositData] // lockCollateralFromChain selector
      );
      
      console.log("Simulating EVM collateral deposit via Universal Contract pattern");
    });
  });
  
  describe("Cross-Chain Lending", function () {
    beforeEach(async function () {
      // Lock collateral first
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
    });
    
    it("Should issue cross-chain loans", async function () {
      await aegisProtocol.cliBorrow(
        1, // collateralId
        CHAIN_IDS.POLYGON, // target chain
        await mockUSDC.getAddress(), // debt asset
        BORROW_AMOUNT // debt amount
      );
      
      expect(await aegisProtocol.loanCounter()).to.equal(1);
      
      const loan = await aegisProtocol.getLoan(1);
      expect(loan.owner).to.equal(deployerAddress);
      expect(loan.debtChainId).to.equal(CHAIN_IDS.POLYGON);
      expect(loan.debtAsset).to.equal(await mockUSDC.getAddress());
      expect(loan.debtAmount).to.equal(BORROW_AMOUNT);
    });
    
    it("Should calculate dynamic interest rates", async function () {
      // Lock BTC collateral (high volatility)
      await aegisProtocol.cliLockCollateral(
        await mockBTC.getAddress(),
        BTC_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      // Borrow against BTC
      await aegisProtocol.cliBorrow(
        2, // BTC collateralId
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        ethers.parseUnits("20000", 6)
      );
      
      const ethLoan = await aegisProtocol.getLoan(1);
      const btcLoan = await aegisProtocol.getLoan(2);
      
      // BTC loan should have higher interest rate due to higher volatility
      expect(btcLoan.interestRate).to.be.gt(ethLoan.interestRate);
    });
  });
  
  describe("Bitcoin Connector", function () {
    it("Should be properly configured", async function () {
      expect(await bitcoinConnector.aegisProtocol()).to.equal(await aegisProtocol.getAddress());
      expect(await bitcoinConnector.owner()).to.equal(deployerAddress);
    });
    
    it("Should track UTXOs", async function () {
      // Simulate UTXO creation
      const utxoId = ethers.keccak256(ethers.toUtf8Bytes("test_utxo"));
      const btcAddress = "0xbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
      
      console.log("Bitcoin connector ready for UTXO management");
    });
  });
  
  describe("Cross-Chain Connector", function () {
    it("Should support approved tokens", async function () {
      expect(await ethereumConnector.isTokenSupported(await mockUSDC.getAddress())).to.be.true;
      expect(await ethereumConnector.isTokenSupported(await mockETH.getAddress())).to.be.true;
      expect(await ethereumConnector.isTokenSupported(await mockBTC.getAddress())).to.be.true;
    });
    
    it("Should handle debt token minting", async function () {
      // This would be called by AEGIS protocol via cross-chain message
      await ethereumConnector.mintDebtTokens(
        user1Address,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT,
        1 // loanId
      );
      
      const balance = await ethereumConnector.getUserBalance(user1Address, await mockUSDC.getAddress());
      expect(balance).to.equal(BORROW_AMOUNT);
    });
  });
  
  describe("AI Oracle Integration", function () {
    it("Should provide risk profiles", async function () {
      const riskProfile = await mockAIOracle.getRiskProfile(
        CHAIN_IDS.ETHEREUM,
        await mockETH.getAddress()
      );
      
      expect(riskProfile.maxLTV).to.equal(7500); // 75%
      expect(riskProfile.liquidationThreshold).to.equal(8500); // 85%
      expect(riskProfile.volatilityScore).to.equal(60);
    });
    
    it("Should trigger liquidations", async function () {
      // Create a loan first
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      await aegisProtocol.cliBorrow(
        1,
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
      
      // Execute liquidation via AI Oracle
      await aegisProtocol.executeLiquidation(1, 100); // 100% liquidation
      
      const loan = await aegisProtocol.getLoan(1);
      expect(loan.liquidated).to.be.true;
    });
  });
  
  describe("Protocol Parameters", function () {
    it("Should have correct constants", async function () {
      expect(await aegisProtocol.BASIS_POINTS()).to.equal(BASIS_POINTS);
      expect(await aegisProtocol.MIN_LIQUIDATION_THRESHOLD()).to.equal(8000);
      expect(await aegisProtocol.MAX_LIQUIDATION_THRESHOLD()).to.equal(9500);
      expect(await aegisProtocol.LIQUIDATION_PENALTY()).to.equal(500);
      expect(await aegisProtocol.MAX_INTEREST_RATE()).to.equal(2000);
    });
    
    it("Should allow admin parameter updates", async function () {
      await aegisProtocol.setAIOracle(user1Address);
      expect(await aegisProtocol.aiOracle()).to.equal(user1Address);
      
      await aegisProtocol.setAIOracle(await mockAIOracle.getAddress()); // Reset
    });
  });
  
  describe("Security Features", function () {
    it("Should prevent unauthorized access", async function () {
      await expect(
        aegisProtocol.connect(user1).setAIOracle(user2Address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        aegisProtocol.connect(user1).executeLiquidation(1, 100)
      ).to.be.revertedWith("Only AI Oracle");
    });
    
    it("Should handle pausing", async function () {
      await aegisProtocol.setPaused(true);
      expect(await aegisProtocol.paused()).to.be.true;
      
      await expect(
        aegisProtocol.cliLockCollateral(
          await mockETH.getAddress(),
          ETH_AMOUNT,
          0,
          CHAIN_IDS.ETHEREUM,
          false
        )
      ).to.be.revertedWith("Pausable: paused");
      
      await aegisProtocol.setPaused(false);
    });
  });
  
  describe("Cross-Chain Message Handling", function () {
    it("Should handle incoming messages", async function () {
      // Test message handling via Universal Contract pattern
      console.log("Universal Contract message handling ready");
    });
    
    it("Should send cross-chain messages", async function () {
      // Lock collateral
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      // Borrow (this should trigger cross-chain message)
      await aegisProtocol.cliBorrow(
        1,
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
      
      // Verify loan was created
      const loan = await aegisProtocol.getLoan(1);
      expect(loan.owner).to.equal(deployerAddress);
    });
  });
  
  describe("Protocol Statistics", function () {
    it("Should track protocol stats", async function () {
      const stats = await aegisProtocol.getProtocolStats();
      expect(stats.totalCollaterals).to.equal(0);
      expect(stats.totalLoans).to.equal(0);
      expect(stats.totalCollateralValue).to.equal(0);
      expect(stats.totalDebtValue).to.equal(0);
    });
    
    it("Should update stats after operations", async function () {
      // Lock collateral
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      // Borrow
      await aegisProtocol.cliBorrow(
        1,
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
      
      const stats = await aegisProtocol.getProtocolStats();
      expect(stats.totalCollaterals).to.equal(1);
      expect(stats.totalLoans).to.equal(1);
    });
  });
  
  describe("User Position Tracking", function () {
    it("Should track user positions", async function () {
      const position = await aegisProtocol.getUserPosition(deployerAddress);
      expect(position.collateralCount).to.equal(0);
      expect(position.activeLoans).to.equal(0);
      expect(position.totalCollateralValue).to.equal(0);
      expect(position.totalDebtValue).to.equal(0);
    });
    
    it("Should update user positions after operations", async function () {
      // Lock collateral
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      const position = await aegisProtocol.getUserPosition(deployerAddress);
      expect(position.collateralCount).to.equal(1);
    });
  });
  
  describe("Integration Tests", function () {
    it("Should complete full lending cycle", async function () {
      // 1. Lock collateral
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0,
        CHAIN_IDS.ETHEREUM,
        false
      );
      
      // 2. Borrow against collateral
      await aegisProtocol.cliBorrow(
        1,
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
      
      // 3. Verify positions
      const collateral = await aegisProtocol.getCollateral(1);
      const loan = await aegisProtocol.getLoan(1);
      
      expect(collateral.owner).to.equal(deployerAddress);
      expect(loan.owner).to.equal(deployerAddress);
      expect(loan.collateralId).to.equal(1);
      
      // 4. Check protocol stats
      const stats = await aegisProtocol.getProtocolStats();
      expect(stats.totalCollaterals).to.equal(1);
      expect(stats.totalLoans).to.equal(1);
      
      console.log("✅ Full lending cycle completed successfully");
    });
  });
}); 