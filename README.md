# IyàCare - Healthcare Management Platform

A comprehensive healthcare management platform built with Next.js, Firebase, and modern web technologies. IyàCare provides real-time vital signs monitoring, patient management, and AI-powered health predictions.

## 🚀 Features

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

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **UI Components**: Tailwind CSS, Radix UI, Lucide Icons
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Notifications**: Sonner for toast notifications
- **Form Handling**: React Hook Form with validation

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
- Node.js 18+ 
- Firebase account
- Git

### Local Development Setup

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
   Fill in your Firebase configuration values.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Firebase Configuration

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Configure environment variables

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

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Firebase documentation
- Create an issue in the repository
- Contact the development team

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
