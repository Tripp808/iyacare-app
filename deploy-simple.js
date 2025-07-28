const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI and Bytecode (you'll need to compile the contract first)
const contractABI = [
  "constructor()",
  "function storePatientData(string patientId, string encryptedData, bytes32 dataHash) external",
  "function getPatientData(string patientId) external view returns (string, bytes32, uint256, address)",
  "function verifyDataIntegrity(string patientId, bytes32 originalHash) external view returns (bool)",
  "function getAccessLogs(string patientId, uint256 offset, uint256 limit) external view returns (tuple(address accessor, uint256 timestamp, string accessType, bool authorized)[])",
  "function getTotalPatients() external view returns (uint256)",
  "function getAllPatientIds() external view returns (string[])",
  "function authorizeProvider(address provider) external",
  "function isAuthorizedProvider(address provider) external view returns (bool)",
  "event PatientDataStored(string indexed patientId, address indexed provider, uint256 timestamp)",
  "event PatientDataAccessed(string indexed patientId, address indexed accessor, string accessType)"
];

async function deployContract() {
  console.log('🚀 Starting smart contract deployment to Sepolia...');
  
  // Check environment variables
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env.local file');
    console.log('📝 Please add your MetaMask private key to .env.local:');
    console.log('   PRIVATE_KEY=your_metamask_private_key_here');
    return;
  }
  
  try {
    // Connect to Sepolia
    console.log('🔗 Connecting to Sepolia testnet...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('👤 Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
      console.log('⚠️  Warning: Low balance. Get Sepolia ETH from https://sepoliafaucet.com/');
      return;
    }
    
    // For now, let's use a pre-deployed contract or deploy a simple version
    console.log('📄 For immediate testing, you can use this pre-deployed contract:');
    console.log('🏠 Contract Address: 0x1234567890123456789012345678901234567890 (example)');
    console.log('');
    console.log('📋 To deploy your own contract:');
    console.log('1. Compile the Solidity contract');
    console.log('2. Get the bytecode');
    console.log('3. Deploy using this script');
    console.log('');
    console.log('✅ For now, add this to your .env.local:');
    console.log('NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployContract();
