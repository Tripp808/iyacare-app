const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Sepolia testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Get Sepolia ETH from faucet if deployment fails.");
  }
  
  // Deploy PatientDataStorage contract
  console.log("📄 Deploying PatientDataStorage contract...");
  const PatientDataStorage = await ethers.getContractFactory("PatientDataStorage");
  
  // Estimate gas
  const estimatedGas = await PatientDataStorage.getDeployTransaction().estimateGas();
  console.log("⛽ Estimated gas:", estimatedGas.toString());
  
  // Deploy with explicit gas settings
  const patientDataStorage = await PatientDataStorage.deploy({
    gasLimit: estimatedGas + 100000n, // Add buffer
  });
  
  console.log("⏳ Waiting for deployment confirmation...");
  await patientDataStorage.waitForDeployment();
  
  const contractAddress = await patientDataStorage.getAddress();
  console.log("✅ PatientDataStorage deployed to:", contractAddress);
  
  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const totalPatients = await patientDataStorage.getTotalPatients();
  console.log("📊 Initial patient count:", totalPatients.toString());
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    gasUsed: estimatedGas.toString(),
  };
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Deployment Summary:");
  console.log("   - Network: Sepolia Testnet");
  console.log("   - Contract Address:", contractAddress);
  console.log("   - Deployer:", deployer.address);
  console.log("   - Block Number:", deploymentInfo.blockNumber);
  
  console.log("\n🔗 Next steps:");
  console.log("   1. Add contract address to your .env.local file:");
  console.log(`      NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("   2. Update your blockchain service to use this contract");
  console.log("   3. Test the integration in your dashboard");
  
  console.log("\n🌐 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  
  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 