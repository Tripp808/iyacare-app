const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI for reading data
const contractABI = [
  "function getTotalPatients() external view returns (uint256)",
  "function getAllPatientIds() external view returns (string[])",
  "function getPatientData(string patientId) external view returns (string, bytes32, uint256, address)",
  "function verifyDataIntegrity(string patientId, bytes32 originalHash) external view returns (bool)"
];

async function verifyBlockchainData() {
  console.log('🔍 Verifying patient data on Sepolia blockchain...\n');
  
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
  const contractAddress = process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || '0xE4537A9592C0a25c393B75aff8DEfE3e9190C6b7';
  
  if (!contractAddress) {
    console.log('❌ Contract address not set. Please deploy contract first.');
    return;
  }
  
  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    console.log('🏠 Contract Address:', contractAddress);
    console.log('🌐 Network: Sepolia Testnet');
    console.log('🔗 Etherscan: https://sepolia.etherscan.io/address/' + contractAddress);
    console.log('📋 Contract Functions: https://sepolia.etherscan.io/address/' + contractAddress + '#readContract');
    console.log('');
    
    // Get total patients
    const totalPatients = await contract.getTotalPatients();
    console.log('👥 Total Patients on Blockchain:', totalPatients.toString());
    
    if (totalPatients > 0) {
      // Get all patient IDs
      const patientIds = await contract.getAllPatientIds();
      console.log('📋 Patient IDs stored on-chain:');
      
      for (let i = 0; i < patientIds.length; i++) {
        const patientId = patientIds[i];
        console.log(`   ${i + 1}. ${patientId}`);
        
        try {
          // Get patient data
          const [encryptedData, dataHash, timestamp, updatedBy] = await contract.getPatientData(patientId);
          const date = new Date(Number(timestamp) * 1000);
          
          console.log(`      📊 Data Hash: ${dataHash.slice(0, 10)}...`);
          console.log(`      📅 Stored: ${date.toLocaleString()}`);
          console.log(`      👤 Updated By: ${updatedBy.slice(0, 10)}...`);
          console.log(`      🔒 Encrypted Data: ${encryptedData.length} characters`);
          console.log('');
        } catch (error) {
          console.log(`      ❌ Error reading data: ${error.message}`);
        }
      }
    } else {
      console.log('📝 No patient data found on blockchain yet.');
      console.log('💡 Add a patient through your IyàCare app to see blockchain storage!');
    }
    
    console.log('✅ Blockchain verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyBlockchainData();
