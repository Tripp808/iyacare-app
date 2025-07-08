# IyàCare - Healthcare Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.8.1-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive healthcare management platform built with Next.js, Firebase, and modern web technologies. IyàCare provides real-time vital signs monitoring, patient management, and AI-powered health predictions.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ Features](#-features)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🚀 Deployment](#-deployment)
- [🔐 Security Features](#-security-features)
- [📊 Data Flow](#-data-flow)
- [🧪 Testing](#-testing)
- [🔄 Current Status](#-current-status)
- [🤝 Contributing](#-contributing)
- [📱 Screenshots](#-screenshots)
- [📄 License](#-license)
- [🆘 Support](#-support)
- [🏥 About IyàCare](#-about-iyàcare)

## 🚀 Quick Start

Get up and running with IyàCare in minutes:

```bash
# Clone the repository
git clone <repository-url>
cd iyacare_app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Run the development server
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

> **Prerequisites**: Node.js 18+, Firebase account, Git

## ✨ Features

### ✅ Fully Implemented Features

#### Authentication & User Management
- **Firebase Authentication** with email/password
- **Email verification** required for account activation
- **Password reset** functionality
- **Role-based access control** (Admin, Healthcare Provider, Healthcare Worker, Patient)
- **User profile management** with real-time data
- **Settings page** with profile editing capabilities

#### Vital Signs Management
- **Real-time vital signs recording** (Blood Pressure, Heart Rate, Temperature, Weight, Blood Sugar, Oxygen Saturation, Respiratory Rate)
- **AI-powered risk assessment** with automatic predictions
- **Historical data tracking** with timestamps
- **Interactive charts** and visualizations
- **Quick access** from dashboard
- **Data validation** and error handling

#### Patient Management
- **Patient registration** and profile management
- **Medical history** tracking
- **Risk level assessment** (Low, Medium, High)
- **Contact information** management
- **Healthcare provider assignment**

#### Dashboard & Analytics
- **Real-time statistics** (Total Patients, High Risk Patients, Appointments, Alerts)
- **Interactive vital signs charts** with multiple metrics
- **Quick access cards** for common actions
- **Alert notifications** system
- **Recent activity** tracking

#### Security & Data Protection
- **Firestore security rules** for data access control
- **Environment variable** configuration for sensitive data
- **Role-based permissions** for different user types
- **Data encryption** in transit and at rest
- **GDPR compliance** considerations

### 🔧 Technical Stack

- **Frontend**: Next.js 15.3.2, React 19.0.0, TypeScript 5.8.3
- **Backend**: Firebase 11.8.1 (Authentication, Firestore, Cloud Functions)
- **UI Components**: Tailwind CSS 4.0, Radix UI, Lucide Icons
- **Charts**: Recharts 2.15.3 for data visualization
- **Animations**: Framer Motion 12.12.1
- **Notifications**: Sonner 2.0.3 for toast notifications
- **Form Handling**: React Hook Form 7.56.4 with Zod validation
- **Blockchain**: Ethers.js 6.13.0 for Web3 integration
- **SMS**: Twilio 5.7.1 for SMS notifications

### 📱 Pages & Navigation

1. **Authentication Pages**
   - `/auth/login` - User login with email verification
   - `/auth/register` - User registration with role selection
   - `/auth/forgot-password` - Password reset functionality

2. **Main Application**
   - `/dashboard` - Main dashboard with statistics and quick access
   - `/vitals` - Vital signs recording and history
   - `/patients` - Patient management and profiles
   - `/alerts` - System alerts and notifications
   - `/appointments` - Appointment scheduling and management
   - `/analytics` - Data analytics and reporting
   - `/settings` - User profile and application settings

### 🗄️ Database Structure

#### Collections in Firestore:

1. **users** - User profiles and authentication data
2. **patients** - Patient information and medical records
3. **vitalsigns** - Vital signs readings with AI predictions
4. **alerts** - System alerts and notifications
5. **appointments** - Scheduled appointments
6. **referrals** - Patient referrals between providers
7. **analytics** - System analytics and usage data

### 🤖 AI Features

- **Vital Signs Risk Assessment**: Automatic risk calculation based on multiple vital signs
- **Predictive Analytics**: Early warning system for health deterioration
- **Pattern Recognition**: Identifies trends in patient data
- **Automated Alerts**: Generates alerts for abnormal readings

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Firebase account** - [Create free account](https://firebase.google.com/)
- **Git** - [Download here](https://git-scm.com/)

### Detailed Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iyacare_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase configuration values in `.env.local`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Configure environment variables in `.env.local`

For detailed Firebase setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Firebase setup and configuration
- Environment variables setup
- Deployment to Vercel, Netlify, or Firebase Hosting
- Security checklist
- Post-deployment testing

## 🔐 Security Features

- **Authentication required** for all protected routes
- **Role-based access control** with custom claims
- **Firestore security rules** prevent unauthorized access
- **Email verification** required for account activation
- **Environment variables** for sensitive configuration
- **HTTPS enforcement** in production

## 📊 Data Flow

1. **User Registration**: Creates user account with email verification
2. **Authentication**: Firebase handles login/logout with JWT tokens
3. **Data Access**: Firestore rules enforce role-based permissions
4. **Vital Signs**: Real-time recording with AI risk assessment
5. **Notifications**: Automatic alerts for high-risk readings
6. **Analytics**: Aggregated data for healthcare insights

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and email verification
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Vital signs recording and display
- [ ] Patient management operations
- [ ] Dashboard statistics accuracy
- [ ] Role-based access control
- [ ] Mobile responsiveness

### Automated Testing (Future Enhancement)

- Unit tests for components
- Integration tests for Firebase operations
- End-to-end testing with Cypress
- Performance testing

## 🔄 Current Status

### ✅ Completed
- Full authentication system with Firebase
- Vital signs management with AI predictions
- Patient management system
- Dashboard with real-time statistics
- Security rules and access control
- Responsive UI design
- Settings and profile management

### 🚧 In Progress
- Advanced analytics and reporting
- Appointment scheduling system
- IoT device integration
- Mobile app development

### 📋 Future Enhancements
- Multi-factor authentication
- Advanced AI models for health predictions
- Telemedicine integration
- Blockchain for data integrity
- Advanced reporting and analytics
- Mobile applications (iOS/Android)
- Integration with electronic health records (EHR)

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and ensure they follow the project's coding standards
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Submit a pull request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all tests pass before submitting a PR

## 📱 Screenshots

<!-- TODO: Add screenshots of the application -->
*Screenshots will be added here to showcase the application's interface and features.*

### Coming Soon:
- Dashboard overview
- Vital signs monitoring interface
- Patient management system
- Mobile responsive design
- Authentication flow

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Note**: This project is provided "as is" without warranty of any kind.

## 🆘 Support

Need help with IyàCare? Here are your options:

### 📖 Documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Complete setup and deployment instructions
- **[Blockchain Integration Guide](./BLOCKCHAIN_INTEGRATION_GUIDE.md)** - Blockchain features setup
- **[SMS Integration Guide](./SMS_INTEGRATION_GUIDE.md)** - SMS notifications setup

### 🐛 Issues & Questions
- **[Create an issue](../../issues)** - Report bugs or request features
- **[Browse existing issues](../../issues)** - Check if your question has been answered

### 🔧 Technical Support
- **Firebase Documentation** - [Firebase Docs](https://firebase.google.com/docs)
- **Next.js Documentation** - [Next.js Docs](https://nextjs.org/docs)
- **React Documentation** - [React Docs](https://react.dev/)

### 💬 Community
- Contact the development team through GitHub issues
- Join the discussion in pull requests and issues

## 🏥 About IyàCare

IyàCare is designed to revolutionize healthcare delivery by providing:
- Real-time patient monitoring
- AI-powered health predictions
- Streamlined healthcare workflows
- Secure data management
- Improved patient outcomes

The platform is built with scalability, security, and user experience in mind, making it suitable for healthcare facilities of all sizes.

---

**Note**: This application uses real Firebase authentication and database. All user data is properly secured and follows healthcare data protection standards.
