# Blockchain Deployment Guide for IyaCare Healthcare App

This guide will walk you through deploying the smart contracts and setting up the blockchain features for your healthcare application.

## Prerequisites

1. **MetaMask Wallet**: Install MetaMask browser extension
2. **Sepolia ETH**: Get test ETH from Sepolia faucet
3. **Alchemy Account**: Create a free account at alchemy.com
4. **Etherscan Account**: Create a free account at etherscan.io (optional, for contract verification)

## Step 1: Get Sepolia Test ETH

1. Go to MetaMask and switch to Sepolia Test Network
2. Copy your wallet address
3. Visit a Sepolia faucet (e.g., https://sepoliafaucet.com/)
4. Request test ETH (you'll need at least 0.1 ETH for deployment)

## Step 2: Set up Alchemy

1. Create account at https://alchemy.com
2. Create a new app:
   - Name: IyaCare Healthcare
   - Chain: Ethereum
   - Network: Sepolia
3. Copy the HTTP URL (it looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)

## Step 3: Configure Environment Variables

1. Copy your MetaMask private key:
   - Open MetaMask
   - Click on account menu → Account Details → Export Private Key
   - **⚠️ NEVER share this key or commit it to version control**

2. Update your `.env.local` file:
```env
# Blockchain Configuration (Ethereum Sepolia Testnet)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_metamask_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=sepolia
```

## Step 4: Deploy the Smart Contract

1. **Compile the contracts**:
```bash
npx hardhat compile
```

2. **Deploy to Sepolia**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Copy the contract address** from the deployment output and add it to your `.env.local`:
```env
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## Step 5: Verify Deployment (Optional)

If you have an Etherscan API key, you can verify your contract:
```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Step 6: Test the Integration

1. Restart your development server:
```bash
npm run dev
```

2. Navigate to the Blockchain Dashboard in your app
3. Click "Test Firebase Connection" to verify everything is working
4. Try the "Sync All Patients" feature to test blockchain integration

## Troubleshooting

### Common Issues:

1. **"insufficient funds for intrinsic transaction cost"**
   - You need more Sepolia ETH. Visit a faucet to get more.

2. **"Contract address not configured"**
   - Make sure you've set `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS` in `.env.local`
   - Restart your development server after updating environment variables

3. **"RPC URL not configured"**
   - Double-check your Alchemy URL in `SEPOLIA_RPC_URL`
   - Make sure the URL includes your API key

4. **Deployment fails**
   - Check your private key is correct (without 0x prefix)
   - Ensure you have enough Sepolia ETH
   - Verify your Alchemy RPC URL is working

### Network Information:
- **Network Name**: Sepolia Test Network
- **RPC URL**: https://sepolia.infura.io/v3/ (or your Alchemy URL)
- **Chain ID**: 11155111
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.etherscan.io/

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS**:
- Never commit your private key to version control
- Use test networks only for development
- Consider using a separate wallet for development
- In production, use environment variables or secure key management services

## What the Smart Contract Does

The `PatientDataStorage` contract provides:
- **Secure Storage**: Patient data is encrypted before storing on-chain
- **Access Control**: Only authorized providers can access patient data
- **Audit Trail**: All access attempts are logged with timestamps
- **Data Integrity**: Hash verification ensures data hasn't been tampered with
- **Privacy**: Patient identities are protected with encrypted references

## Next Steps

Once deployed, you can:
1. Store patient data securely on the blockchain
2. Share data between authorized healthcare providers
3. Maintain a tamper-proof audit trail
4. Verify data integrity at any time
5. Access patient data from anywhere with proper authorization

Your healthcare application now has enterprise-grade blockchain security! 🚀 