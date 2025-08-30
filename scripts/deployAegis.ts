import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying AEGIS Smart Contracts...\n");

  // Deploy AegisInheritance
  console.log("📋 Deploying AegisInheritance...");
  const AegisInheritance = await ethers.getContractFactory("AegisInheritance");
  const aegisInheritance = await AegisInheritance.deploy(
    "0x0000000000000000000000000000000000000000" // Replace with actual SystemContract address
  );
  await aegisInheritance.deployed();
  console.log(`✅ AegisInheritance deployed to: ${aegisInheritance.address}`);

  // Deploy AegisDefiProtector
  console.log("\n🛡️ Deploying AegisDefiProtector...");
  const AegisDefiProtector = await ethers.getContractFactory("AegisDefiProtector");
  const aegisDefiProtector = await AegisDefiProtector.deploy(
    "0x0000000000000000000000000000000000000000" // Replace with actual SystemContract address
  );
  await aegisDefiProtector.deployed();
  console.log(`✅ AegisDefiProtector deployed to: ${aegisDefiProtector.address}`);

  // Deploy AegisWalletSecurity
  console.log("\n🔐 Deploying AegisWalletSecurity...");
  const AegisWalletSecurity = await ethers.getContractFactory("AegisWalletSecurity");
  const aegisWalletSecurity = await AegisWalletSecurity.deploy(
    "0x0000000000000000000000000000000000000000" // Replace with actual SystemContract address
  );
  await aegisWalletSecurity.deployed();
  console.log(`✅ AegisWalletSecurity deployed to: ${aegisWalletSecurity.address}`);

  console.log("\n🎉 All AEGIS contracts deployed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log(`   AegisInheritance: ${aegisInheritance.address}`);
  console.log(`   AegisDefiProtector: ${aegisDefiProtector.address}`);
  console.log(`   AegisWalletSecurity: ${aegisWalletSecurity.address}`);
  
  console.log("\n🔧 Next Steps:");
  console.log("   1. Update contract addresses in frontend");
  console.log("   2. Configure trusted oracles");
  console.log("   3. Set up cross-chain connections");
  console.log("   4. Test inheritance and protection features");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
}); 