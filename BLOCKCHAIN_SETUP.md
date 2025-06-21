# Blockchain Integration Setup Guide

This guide will help you set up the blockchain features in your healthcare application to securely store patient data on the Ethereum Sepolia testnet.

## Prerequisites

1. **MetaMask Wallet**: Install MetaMask browser extension
2. **Sepolia ETH**: Get free testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Alchemy Account**: Sign up at [Alchemy](https://www.alchemy.com/) for RPC access
4. **Etherscan Account**: Sign up at [Etherscan](https://etherscan.io/) for contract verification

## Step 1: Environment Configuration

1. Copy the blockchain variables from `.env.example` to your `.env.local` file:

```bash
# Blockchain Configuration (Ethereum Sepolia Testnet)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_metamask_private_key_for_deployment
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=sepolia
```

2. Replace the placeholder values:
   - `SEPOLIA_RPC_URL`: Get from your Alchemy dashboard
   - `PRIVATE_KEY`: Export from MetaMask (Account Details > Export Private Key)
   - `ETHERSCAN_API_KEY`: Get from your Etherscan account
   - `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS`: Will be set after deployment

## Step 2: Deploy Smart Contract

1. Compile the contract:
```bash
npx hardhat compile
```

2. Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Copy the deployed contract address and update your `.env.local` file:
```bash
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x...
```

## Step 3: Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Step 4: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the Blockchain Dashboard at `/blockchain`

3. Connect your MetaMask wallet

4. Test the blockchain connection

5. Sync patient data to the blockchain

## Features

### 🔐 Security Features
- **AES-256 Encryption**: All patient data is encrypted before storing on blockchain
- **Immutable Storage**: Data cannot be altered once stored
- **Access Logging**: All interactions are logged on-chain
- **Data Integrity**: Cryptographic verification of data integrity

### 📊 Dashboard Features
- **Real-time Statistics**: View total patients, encrypted records, and activity
- **Wallet Integration**: Connect MetaMask for transactions
- **Batch Synchronization**: Sync all patients from Firebase to blockchain
- **Access Logs**: View recent blockchain interactions
- **Etherscan Integration**: View contracts and transactions on Etherscan

### 🌐 Network Support
- **Sepolia Testnet**: Configured for Ethereum Sepolia testnet
- **Extensible**: Can be configured for other networks
- **Gas Optimization**: Efficient contract design for lower gas costs

## Smart Contract Details

The `PatientDataStorage` contract includes:
- Patient data storage with encryption
- Access control and authorization
- Event logging for all operations
- Data integrity verification
- Patient data retrieval and management

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error**:
   - Get more Sepolia ETH from the faucet
   - Check your wallet balance

2. **"Network not supported" error**:
   - Make sure MetaMask is connected to Sepolia testnet
   - Verify NEXT_PUBLIC_NETWORK_ID is set to 11155111

3. **"Contract not deployed" error**:
   - Run the deployment script
   - Update NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS

4. **Transaction failures**:
   - Check gas limits in hardhat.config.js
   - Verify contract address is correct

### Gas Estimation
- Patient data storage: ~100,000 gas
- Data retrieval: ~30,000 gas
- Access logging: ~50,000 gas

### Network Information
- **Sepolia Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

## Security Considerations

1. **Private Key Safety**: Never commit private keys to version control
2. **Environment Variables**: Use `.env.local` for sensitive data
3. **Testnet Only**: This setup is for Sepolia testnet only
4. **Access Control**: Implement proper access controls in production
5. **Data Encryption**: All patient data is encrypted before blockchain storage

## Support

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MetaMask is properly configured
4. Test the Firebase connection first before blockchain integration

---

**Note**: This is a testnet implementation. For production use, additional security measures, mainnet configuration, and comprehensive testing are required. 