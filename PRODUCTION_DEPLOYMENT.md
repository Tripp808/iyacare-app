# 🚀 IyàCare Production Deployment Guide

## 🔒 Security-First Blockchain Integration

This guide covers deploying IyàCare with blockchain integration to production (Vercel) with proper security practices.

## 📋 Pre-Deployment Checklist

### ✅ **Security Verification**
- [ ] No real credentials in code or git history
- [ ] All sensitive data in environment variables only
- [ ] `.env.local` is gitignored (never committed)
- [ ] Production RPC endpoint configured
- [ ] Smart contract deployed and verified

### ✅ **Environment Variables Required**

#### **Vercel Dashboard → Project Settings → Environment Variables**

```bash
# Blockchain Configuration (REQUIRED)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0xE4537A9592C0a25c393B75aff8DEfE3e9190C6b7
NEXT_PUBLIC_NETWORK_ID=11155111
PRIVATE_KEY=your_admin_wallet_private_key

# Twilio Configuration (REQUIRED)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=[your_twilio_auth_token]
TWILIO_MESSAGING_SERVICE_SID=[your_messaging_service_sid]

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## 🌐 Production RPC Setup

### **Option 1: Alchemy (Recommended)**
1. Go to [alchemy.com](https://alchemy.com)
2. Create free account
3. Create new app: **Ethereum → Sepolia Testnet**
4. Copy HTTPS URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
5. Add to Vercel environment variables

### **Option 2: Infura**
1. Go to [infura.io](https://infura.io)
2. Create project for Ethereum
3. Use Sepolia endpoint
4. Add to Vercel environment variables

### **Option 3: Free Public RPC (Limited)**
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```
⚠️ **Note**: Public RPCs have rate limits and may be unreliable for production.

## 🔐 Security Best Practices

### **✅ Safe to Expose (NEXT_PUBLIC_)**
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - Client-side blockchain access
- `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS` - Contract is public on blockchain
- `NEXT_PUBLIC_NETWORK_ID` - Network ID is public information

### **🔒 Must Keep Secret (Server-only)**
- `PRIVATE_KEY` - Admin wallet private key (server-side only)
- `TWILIO_AUTH_TOKEN` - Twilio authentication
- Firebase private keys

### **🚨 NEVER Commit to Git**
- Real private keys
- Real API keys
- Real authentication tokens
- `.env.local` file (already gitignored)

## 📱 Smart Contract Information

### **Deployed Contract Details**
- **Network**: Sepolia Testnet
- **Contract Address**: `0xE4537A9592C0a25c393B75aff8DEfE3e9190C6b7`
- **Chain ID**: `11155111`
- **Block Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xE4537A9592C0a25c393B75aff8DEfE3e9190C6b7)

### **Contract Functions**
- `storePatientData()` - Store encrypted patient data
- `getPatientData()` - Retrieve patient data
- `authorizeProvider()` - Authorize healthcare providers
- `getTotalPatients()` - Get total patients count
- `getAllPatientIds()` - Get all patient IDs

## 🚀 Deployment Steps

### **1. Prepare Environment Variables**
```bash
# Create production environment file (DO NOT COMMIT)
cp .env.local.example .env.production.local

# Edit with real production values
# Then copy each variable to Vercel dashboard
```

### **2. Deploy to Vercel**
```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch if auto-deploy is enabled
git push origin main
```

### **3. Verify Deployment**
1. **Test blockchain connection** in production dashboard
2. **Connect MetaMask** to Sepolia testnet
3. **Authorize wallet** as healthcare provider
4. **Sync test patient** to verify blockchain integration
5. **Test SMS functionality** with Twilio
6. **Verify decryption** of blockchain patient data

## 🔍 Production Testing Checklist

### **Blockchain Integration**
- [ ] Wallet connection works
- [ ] Network detection (Sepolia)
- [ ] Provider authorization
- [ ] Patient data sync to blockchain
- [ ] Patient data decryption from blockchain
- [ ] Contract interaction logging

### **SMS Integration**
- [ ] Twilio service initialization
- [ ] Message sending to +250791848842
- [ ] Template system (English/Kiswahili/Kinyarwanda)
- [ ] Risk alerts ("elevated care needed")
- [ ] Health tips messaging

### **Security Verification**
- [ ] No credentials in browser dev tools
- [ ] HTTPS encryption enabled
- [ ] Environment variables properly loaded
- [ ] Error handling for missing credentials

## 🐛 Troubleshooting

### **Common Issues**

#### **"RPC URL not configured"**
- Ensure `NEXT_PUBLIC_SEPOLIA_RPC_URL` is set in Vercel
- Check environment variable name (must include `NEXT_PUBLIC_`)

#### **"Contract not found"**
- Verify contract address in environment variables
- Check network (should be Sepolia testnet)

#### **"Not authorized healthcare provider"**
- Connect admin wallet first
- Authorize provider wallet using admin
- Switch back to provider wallet

#### **Twilio SMS not working**
- Check Twilio credentials in Vercel environment
- Verify Messaging Service SID (not phone number)
- Check Twilio account balance

## 📊 Monitoring & Analytics

### **Production Monitoring**
- Vercel function logs for API routes
- Browser console for client-side errors
- Blockchain transaction history on Etherscan
- Twilio SMS delivery logs

### **Performance Metrics**
- RPC response times
- Contract interaction success rates
- SMS delivery rates
- User wallet connection rates

## 🔄 Maintenance

### **Regular Tasks**
- Monitor RPC endpoint usage/limits
- Check Twilio account balance
- Verify contract functionality
- Update dependencies
- Security audits

### **Backup Strategy**
- Patient data: Firebase (primary) + Blockchain (immutable backup)
- Configuration: Environment variables documented
- Code: Git repository with proper branching

---

## 🆘 Emergency Contacts

- **Blockchain Issues**: Check Sepolia network status
- **Twilio Issues**: Twilio support dashboard
- **Vercel Issues**: Vercel support
- **Firebase Issues**: Firebase console

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Environment**: Production Ready ✅
