import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract, Signer } from "ethers";

describe("AEGIS Universal Lending Protocol", function () {
  let hre: HardhatRuntimeEnvironment;
  let aegisProtocol: Contract;
  let mockAIOracle: Contract;
  let mockUSDC: Contract;
  let mockETH: Contract;
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
    LOCALNET: 1337
  };
  
  const BASIS_POINTS = 10000;
  const ETH_AMOUNT = ethers.parseUnits("10", 18);
  const USDC_AMOUNT = ethers.parseUnits("10000", 6);
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
    
    // Deploy AEGIS protocol
    const AegisUniversalLending = await ethers.getContractFactory("AegisUniversalLending");
    aegisProtocol = await AegisUniversalLending.deploy(
      ethers.ZeroAddress, // Mock connector
      await mockAIOracle.getAddress(),
      ethers.ZeroAddress  // Mock localnet connector
    );
    
    // Configure protocol
    await aegisProtocol.approveToken(await mockUSDC.getAddress(), CHAIN_IDS.ETHEREUM);
    await aegisProtocol.approveToken(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM);
    await aegisProtocol.approveToken(await mockUSDC.getAddress(), CHAIN_IDS.POLYGON);
    await aegisProtocol.approveToken(await mockETH.getAddress(), CHAIN_IDS.POLYGON);
    
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
    
    // Set mock prices
    await mockAIOracle.setMockPrice(await mockUSDC.getAddress(), CHAIN_IDS.ETHEREUM, 100000000); // $1.00
    await mockAIOracle.setMockPrice(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM, 2000000000); // $2000
  });
  
  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await aegisProtocol.owner()).to.equal(deployerAddress);
      expect(await aegisProtocol.aiOracle()).to.equal(await mockAIOracle.getAddress());
      expect(await aegisProtocol.collateralCounter()).to.equal(0);
      expect(await aegisProtocol.loanCounter()).to.equal(0);
      expect(await aegisProtocol.nftCounter()).to.equal(0);
    });
    
    it("Should have correct protocol parameters", async function () {
      expect(await aegisProtocol.BASIS_POINTS()).to.equal(BASIS_POINTS);
      expect(await aegisProtocol.MIN_LIQUIDATION_THRESHOLD()).to.equal(8000);
      expect(await aegisProtocol.MAX_LIQUIDATION_THRESHOLD()).to.equal(9500);
      expect(await aegisProtocol.LIQUIDATION_PENALTY()).to.equal(500);
      expect(await aegisProtocol.MAX_INTEREST_RATE()).to.equal(2000);
    });
  });
  
  describe("Token Approval", function () {
    it("Should allow owner to approve tokens", async function () {
      const newToken = ethers.Wallet.createRandom().address;
      await aegisProtocol.approveToken(newToken, CHAIN_IDS.ETHEREUM);
      expect(await aegisProtocol.approvedTokens(newToken, CHAIN_IDS.ETHEREUM)).to.be.true;
    });
    
    it("Should not allow non-owner to approve tokens", async function () {
      const newToken = ethers.Wallet.createRandom().address;
      await expect(
        aegisProtocol.connect(user1).approveToken(newToken, CHAIN_IDS.ETHEREUM)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Collateral Management", function () {
    it("Should lock fungible collateral", async function () {
      await aegisProtocol.connect(user1).lockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      expect(await aegisProtocol.collateralCounter()).to.equal(1);
      
      const collateral = await aegisProtocol.getCollateral(1);
      expect(collateral.owner).to.equal(user1Address);
      expect(collateral.asset).to.equal(await mockETH.getAddress());
      expect(collateral.amount).to.equal(ETH_AMOUNT);
      expect(collateral.chainId).to.equal(CHAIN_IDS.ETHEREUM);
      expect(collateral.isNFT).to.be.false;
    });
    
    it("Should not lock unapproved tokens", async function () {
      const unapprovedToken = ethers.Wallet.createRandom().address;
      await expect(
        aegisProtocol.connect(user1).lockCollateral(
          unapprovedToken,
          ETH_AMOUNT,
          CHAIN_IDS.ETHEREUM
        )
      ).to.be.revertedWith("Token not approved");
    });
    
    it("Should not lock zero amount", async function () {
      await expect(
        aegisProtocol.connect(user1).lockCollateral(
          await mockETH.getAddress(),
          0,
          CHAIN_IDS.ETHEREUM
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });
  
  describe("NFT Collateral", function () {
    it("Should lock NFT collateral", async function () {
      const mockNFT = ethers.Wallet.createRandom().address;
      const tokenId = 123;
      
      await aegisProtocol.connect(user1).lockNFT(
        mockNFT,
        tokenId,
        CHAIN_IDS.ETHEREUM
      );
      
      expect(await aegisProtocol.collateralCounter()).to.equal(1);
      expect(await aegisProtocol.nftCounter()).to.equal(1);
      
      const collateral = await aegisProtocol.getCollateral(1);
      expect(collateral.owner).to.equal(user1Address);
      expect(collateral.asset).to.equal(mockNFT);
      expect(collateral.tokenId).to.equal(tokenId);
      expect(collateral.isNFT).to.be.true;
      
      const nft = await aegisProtocol.getUniversalNFT(1);
      expect(nft.contractAddress).to.equal(mockNFT);
      expect(nft.tokenId).to.equal(tokenId);
      expect(nft.originalChainId).to.equal(CHAIN_IDS.ETHEREUM);
      expect(nft.isLocked).to.be.true;
    });
  });
  
  describe("Borrowing", function () {
    beforeEach(async function () {
      // Lock collateral first
      await aegisProtocol.connect(user1).lockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      // Update collateral value for risk calculation
      const collateralValue = ETH_AMOUNT * 2000000000n / ethers.parseUnits("1", 18); // $2000 per ETH
      await mockAIOracle.setMockPrice(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM, collateralValue);
    });
    
    it("Should allow borrowing against collateral", async function () {
      await aegisProtocol.connect(user1).borrowAgainstCollateral(
        1, // collateralId
        CHAIN_IDS.POLYGON, // target chain
        await mockUSDC.getAddress(), // debt asset
        BORROW_AMOUNT // debt amount
      );
      
      expect(await aegisProtocol.loanCounter()).to.equal(1);
      
      const loan = await aegisProtocol.getLoan(1);
      expect(loan.owner).to.equal(user1Address);
      expect(loan.collateralId).to.equal(1);
      expect(loan.debtChainId).to.equal(CHAIN_IDS.POLYGON);
      expect(loan.debtAsset).to.equal(await mockUSDC.getAddress());
      expect(loan.debtAmount).to.equal(BORROW_AMOUNT);
      expect(loan.liquidated).to.be.false;
    });
    
    it("Should not allow borrowing more than LTV allows", async function () {
      const excessiveBorrow = ethers.parseUnits("20000", 6); // $20,000 (exceeds 75% LTV)
      
      await expect(
        aegisProtocol.connect(user1).borrowAgainstCollateral(
          1, // collateralId
          CHAIN_IDS.POLYGON, // target chain
          await mockUSDC.getAddress(), // debt asset
          excessiveBorrow // debt amount
        )
      ).to.be.revertedWith("Exceeds borrowing limit");
    });
    
    it("Should not allow non-owner to borrow", async function () {
      await expect(
        aegisProtocol.connect(user2).borrowAgainstCollateral(
          1, // collateralId
          CHAIN_IDS.POLYGON, // target chain
          await mockUSDC.getAddress(), // debt asset
          BORROW_AMOUNT // debt amount
        )
      ).to.be.revertedWith("Not collateral owner");
    });
  });
  
  describe("Risk Management", function () {
    it("Should calculate correct interest rates based on volatility", async function () {
      // Low volatility asset (USDC)
      await mockAIOracle.setMockRiskProfile(
        await mockUSDC.getAddress(),
        CHAIN_IDS.ETHEREUM,
        8500, // 85% max LTV
        9000, // 90% liquidation threshold
        20    // Low volatility
      );
      
      // High volatility asset (ETH)
      await mockAIOracle.setMockRiskProfile(
        await mockETH.getAddress(),
        CHAIN_IDS.ETHEREUM,
        7500, // 75% max LTV
        8500, // 85% liquidation threshold
        80    // High volatility
      );
      
      // Lock both types of collateral
      await aegisProtocol.connect(user1).lockCollateral(
        await mockUSDC.getAddress(),
        USDC_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      await aegisProtocol.connect(user1).lockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      // Update prices
      await mockAIOracle.setMockPrice(await mockUSDC.getAddress(), CHAIN_IDS.ETHEREUM, 100000000);
      await mockAIOracle.setMockPrice(await mockETH.getAddress(), CHAIN_IDS.ETHEREUM, 2000000000);
      
      // Borrow against USDC (low volatility)
      await aegisProtocol.connect(user1).borrowAgainstCollateral(
        1, // USDC collateral
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        ethers.parseUnits("5000", 6)
      );
      
      // Borrow against ETH (high volatility)
      await aegisProtocol.connect(user1).borrowAgainstCollateral(
        2, // ETH collateral
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        ethers.parseUnits("5000", 6)
      );
      
      const usdcLoan = await aegisProtocol.getLoan(1);
      const ethLoan = await aegisProtocol.getLoan(2);
      
      // USDC loan should have lower interest rate (5% + 20% volatility = 7%)
      expect(usdcLoan.interestRate).to.equal(700);
      
      // ETH loan should have higher interest rate (5% + 80% volatility = 13%)
      expect(ethLoan.interestRate).to.equal(1300);
    });
  });
  
  describe("Liquidation", function () {
    beforeEach(async function () {
      // Set up a loan position
      await aegisProtocol.connect(user1).lockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      await aegisProtocol.connect(user1).borrowAgainstCollateral(
        1, // collateralId
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
    });
    
    it("Should allow AI Oracle to liquidate positions", async function () {
      const loanId = 1;
      const loan = await aegisProtocol.getLoan(loanId);
      expect(loan.liquidated).to.be.false;
      
      await aegisProtocol.connect(mockAIOracle).executeLiquidation(loanId);
      
      const updatedLoan = await aegisProtocol.getLoan(loanId);
      expect(updatedLoan.liquidated).to.be.true;
    });
    
    it("Should not allow non-AI Oracle to liquidate", async function () {
      await expect(
        aegisProtocol.connect(user2).executeLiquidation(1)
      ).to.be.revertedWith("Only AI Oracle");
    });
    
    it("Should not liquidate already liquidated positions", async function () {
      await aegisProtocol.connect(mockAIOracle).executeLiquidation(1);
      
      await expect(
        aegisProtocol.connect(mockAIOracle).executeLiquidation(1)
      ).to.be.revertedWith("Already liquidated");
    });
  });
  
  describe("CLI Functions", function () {
    it("Should allow CLI operations", async function () {
      // CLI lock collateral
      await aegisProtocol.cliLockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        0, // No token ID
        CHAIN_IDS.ETHEREUM,
        false // Not NFT
      );
      
      expect(await aegisProtocol.collateralCounter()).to.equal(1);
      
      // CLI borrow
      await aegisProtocol.cliBorrow(
        1, // collateralId
        CHAIN_IDS.POLYGON,
        await mockUSDC.getAddress(),
        BORROW_AMOUNT
      );
      
      expect(await aegisProtocol.loanCounter()).to.equal(1);
    });
    
    it("Should not allow non-CLI operations", async function () {
      await expect(
        aegisProtocol.connect(user1).cliLockCollateral(
          await mockETH.getAddress(),
          ETH_AMOUNT,
          0,
          CHAIN_IDS.ETHEREUM,
          false
        )
      ).to.be.revertedWith("CLI only");
    });
  });
  
  describe("User Position Tracking", function () {
    it("Should track user positions correctly", async function () {
      // User 1 locks collateral
      await aegisProtocol.connect(user1).lockCollateral(
        await mockETH.getAddress(),
        ETH_AMOUNT,
        CHAIN_IDS.ETHEREUM
      );
      
      // User 2 locks collateral
      await aegisProtocol.connect(user2).lockCollateral(
        await mockUSDC.getAddress(),
        USDC_AMOUNT,
        CHAIN_IDS.POLYGON
      );
      
      const user1Position = await aegisProtocol.getUserPosition(user1Address);
      const user2Position = await aegisProtocol.getUserPosition(user2Address);
      
      expect(user1Position.collateralCount).to.equal(1);
      expect(user2Position.collateralCount).to.equal(1);
      expect(user1Position.activeLoans).to.equal(0);
      expect(user2Position.activeLoans).to.equal(0);
    });
  });
  
  describe("Emergency Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      await aegisProtocol.pause();
      expect(await aegisProtocol.paused()).to.be.true;
      
      await aegisProtocol.unpause();
      expect(await aegisProtocol.paused()).to.be.false;
    });
    
    it("Should not allow non-owner to pause", async function () {
      await expect(
        aegisProtocol.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should not allow operations when paused", async function () {
      await aegisProtocol.pause();
      
      await expect(
        aegisProtocol.connect(user1).lockCollateral(
          await mockETH.getAddress(),
          ETH_AMOUNT,
          CHAIN_IDS.ETHEREUM
        )
      ).to.be.revertedWith("Pausable: paused");
    });
    
    it("Should allow emergency withdrawals", async function () {
      // Transfer some tokens to the contract
      await mockUSDC.transfer(await aegisProtocol.getAddress(), ethers.parseUnits("1000", 6));
      
      const balanceBefore = await mockUSDC.balanceOf(deployerAddress);
      await aegisProtocol.emergencyWithdraw(await mockUSDC.getAddress(), ethers.parseUnits("1000", 6));
      const balanceAfter = await mockUSDC.balanceOf(deployerAddress);
      
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseUnits("1000", 6));
    });
  });
  
  describe("Cross-Chain Integration", function () {
    it("Should handle cross-chain messages", async function () {
      // This test would require a more complex setup with actual ZetaChain integration
      // For now, we'll test the basic structure
      expect(await aegisProtocol.zetaConnector()).to.equal(ethers.ZeroAddress);
    });
  });
}); 