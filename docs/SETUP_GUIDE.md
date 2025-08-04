# IyàCare Complete Setup Guide

This guide provides step-by-step instructions for setting up the complete IyàCare healthcare management system, including web application, AI service, IoT hardware, and blockchain components.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** version control ([Download](https://git-scm.com/))
- **Python** 3.11+ for AI service ([Download](https://www.python.org/))
- **Arduino IDE** for IoT components ([Download](https://www.arduino.cc/))

### Required Accounts
- **Firebase** account ([Create account](https://firebase.google.com/))
- **Vercel** account for deployment ([Create account](https://vercel.com/))
- **GitHub** account for version control ([Create account](https://github.com/))

## Step 1: Project Setup

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/iyacare-app.git
cd iyacare-app

# Install dependencies
npm install
```

### Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file
# Replace placeholder values with your actual credentials
```

## Step 2: Firebase Configuration

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "iyacare-prod")
4. Enable Google Analytics (optional)
5. Wait for project creation

### Configure Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Configure authorized domains if needed

### Setup Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" (we'll update rules later)
4. Choose a location close to your users

### Setup Realtime Database

1. Go to "Realtime Database"
2. Click "Create Database"
3. Start in "test mode"
4. Choose same location as Firestore

### Configure Storage

1. Go to "Storage"
2. Click "Get started"
3. Start in "test mode"
4. Choose same location

### Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app
4. Register app with nickname
5. Copy the configuration object
6. Update `.env.local` with these values

### Security Rules

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Update Realtime Database rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Step 3: AI Service Setup

### Navigate to AI Directory

```bash
cd ai-model-service
```

### Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt
```

### Start AI Service

```bash
# Start the FastAPI service
python main.py

# Service will be available at http://localhost:8000
```

### Test AI Service

```bash
# Test the API endpoint
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "blood_sugar": 90,
    "body_temp": 36.7,
    "heart_rate": 75
  }'
```

## Step 4: IoT Hardware Setup

### Hardware Assembly

Refer to `iot-hardware/README.md` for detailed wiring instructions.

### Software Setup

1. Install Arduino IDE
2. Install ESP32 board package:
   - Go to File → Preferences
   - Add URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Go to Tools → Board → Boards Manager
   - Search "ESP32" and install

3. Install required libraries:
   - Firebase ESP32 Client by Mobizt
   - MAX30100lib by OXullo Intersecans
   - DHT sensor library by Adafruit

### Configure IoT Code

1. Open `iot-hardware/health_monitor.ino`
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

3. Update Firebase configuration:
   ```cpp
   #define API_KEY "YOUR_FIREBASE_API_KEY"
   #define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"
   ```

### Upload to ESP32

1. Connect ESP32 to computer
2. Select "ESP32 Dev Module" in Arduino IDE
3. Select correct COM port
4. Upload the code
5. Open Serial Monitor (115200 baud)

## Step 5: Blockchain Setup (Optional)

### Install Hardhat

```bash
# Install Hardhat globally
npm install -g hardhat

# Install project dependencies
npm install
```

### Compile Smart Contracts

```bash
# Compile contracts
npx hardhat compile
```

### Deploy to Local Network

```bash
# Start local blockchain
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Testnet

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## Step 6: Run the Application

### Start Development Server

```bash
# Make sure you're in the main project directory
cd iyacare-app

# Start the Next.js development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Verify All Components

1. **Web App**: Visit `http://localhost:3000`
2. **AI Service**: Check `http://localhost:8000/docs`
3. **IoT Device**: Monitor Serial output for sensor readings
4. **Firebase**: Check data in Firebase Console

## Step 7: Production Deployment

### Deploy Web Application

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Deploy AI Service

For Render deployment:

```bash
cd ai-model-service
# Follow the render-deploy.sh script
```

For Heroku deployment:

```bash
# Create Heroku app
heroku create your-ai-service-name

# Deploy using git subtree
git subtree push --prefix ai-model-service heroku main
```

### Update Environment Variables

Update production environment variables in:
- Vercel dashboard for web app
- Render/Heroku dashboard for AI service
- Update IoT device if using production Firebase

## Step 8: Testing & Verification

### Test User Account

Create a test account or use provided credentials:
```
Email: testiyacare@gmail.com
Password: IyaCare2024!
```

### Feature Testing Checklist

- [ ] User registration and authentication
- [ ] Patient management (CRUD operations)
- [ ] Vital signs recording and display
- [ ] Real-time IoT data streaming
- [ ] AI risk assessment predictions
- [ ] Alert system functionality
- [ ] Responsive design on mobile/tablet
- [ ] Blockchain data integrity (if enabled)

### Performance Testing

- [ ] Page load times under 3 seconds
- [ ] IoT data updates in real-time
- [ ] AI predictions respond within 2 seconds
- [ ] Database operations complete successfully
- [ ] No console errors in browser

## Troubleshooting

### Common Issues

**Build Errors**
- Check Node.js version (18+ required)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Firebase Connection Issues**
- Verify API keys in .env.local
- Check Firebase project settings
- Ensure Firestore/Realtime Database are enabled
- Verify security rules allow authenticated access

**AI Service Issues**
- Check Python version (3.11+ required)
- Verify virtual environment is activated
- Install missing dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

**IoT Connectivity Issues**
- Verify WiFi credentials in Arduino code
- Check sensor wiring connections
- Monitor Serial output for error messages
- Ensure Firebase API key is correct

**Deployment Issues**
- Check environment variables in deployment platform
- Verify build logs for specific errors
- Ensure all dependencies are properly specified
- Check domain configuration and DNS settings

### Getting Help

1. Check component-specific README files
2. Review error logs and console output
3. Search existing GitHub issues
4. Create new issue with detailed reproduction steps
5. Join community discussions for support

## Security Considerations

### Environment Variables
- Never commit .env.local to version control
- Use different credentials for development/production
- Regularly rotate API keys and secrets
- Enable 2FA on all service accounts

### Database Security
- Implement proper Firestore security rules
- Use least-privilege access principles
- Enable audit logging for production
- Regular backup strategies

### API Security
- Implement rate limiting
- Use HTTPS in production
- Validate all input data
- Monitor for unusual access patterns

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error logs weekly
- Backup database regularly
- Review security configurations quarterly
- Update documentation as needed

### Performance Monitoring
- Monitor response times
- Track user engagement metrics
- Analyze error rates
- Review resource usage patterns

## Support

For additional help and support:

- **Documentation**: Check component README files
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Community**: Join project community channels

---

*This setup guide is maintained as part of the IyàCare project documentation. Please keep it updated with any changes to the setup process.*
