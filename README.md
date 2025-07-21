# IyàCare - Maternal Healthcare Management System

> **Student:** Oche David Ankeli  
> **Supervisor:** Marvin Ogore  
> **Submission Date:** 7/8/2025

---

## 🔗 Quick Access Links

- **🌐 Live Deployed Application:** [https://iyacare-app.vercel.app](https://iyacare-app.vercel.app)
- **💻 Source Code Repository:** [https://github.com/Tripp808/iyacare-app](https://github.com/Tripp808/iyacare-app)

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn package manager
- Git
- Firebase account (free tier sufficient)

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Tripp808/iyacare-app.git
cd iyacare-app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### 4. Run the Application
```bash
npm run dev
```
Application available at `http://localhost:3000`

---

## 📋 Project Overview

IyàCare is a comprehensive maternal healthcare management system built with Next.js 15 and Firebase. The system manages patient data, vital signs, alerts, and provides analytics for healthcare providers.

### 🏗️ **Technical Stack**
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore Database, Hosting)
- **UI Components:** shadcn/ui component library
- **Deployment:** Vercel

---

## ✅ **Implemented Features**

### 🔐 **Authentication System**
- User registration and login with Firebase Auth
- Email verification required for account access
- Secure session management with protected routes
- Password reset functionality

### 👥 **Patient Management System**
- **Current Database:** 28 registered patients
- **Pregnancy Tracking:** 21 patients currently pregnant (75% of patient base)
- **Complete Patient Profiles:** Full medical records, contact information, pregnancy status
- Patient search and filtering capabilities
- Individual patient detail pages with comprehensive information
- Patient registration with medical history and risk factors

### 📊 **Dashboard & Analytics**
- Real-time dashboard with patient statistics
- Patient risk distribution visualization
- Quick access to key features (vital signs, patient management, analytics)
- Overview of total patients, high-risk cases, and pregnancy monitoring

### 🚨 **Alerts & Notifications System**
- Real-time alert system for patient monitoring
- Alert creation and management
- Notification center with unread alerts tracking
- High-risk patient automatic flagging

### 📱 **Vital Signs Management**
- Vital signs recording and tracking system
- Historical vital signs data for each patient
- Integration with patient profiles
- Real-time vital signs monitoring capabilities

### 📈 **Analytics & Reporting**
- Patient analytics dashboard
- Risk assessment analytics
- Population health insights
- Customizable reporting features

### 💬 **SMS Integration (Twilio)**
- SMS messaging system for patient communication
- Automated messaging for high-risk patients
- Campaign management for bulk messaging
- SMS analytics and delivery tracking
- Template management for common messages

### 🔗 **Blockchain Integration**
- Secure patient data storage on blockchain
- Data encryption and immutable record keeping
- Blockchain dashboard for data integrity verification
- Smart contract integration for patient data management

### 📅 **Appointment Management**
- Appointment scheduling system
- Calendar integration
- Appointment status tracking
- Patient-appointment relationship management

---

## 📊 **Current Database Statistics**

### **Real Patient Data:**
- **Total Patients:** 28 registered patients
- **Pregnant Patients:** 21 currently pregnant (75% of patient base)
- **High-Risk Cases:** 11 patients identified as high-risk (39% of total)
- **Complete Profiles:** 100% of patients have comprehensive medical records

### **System Performance:**
- **Database Response Time:** <100ms for patient queries
- **User Authentication:** Email verification required
- **Data Integrity:** 100% complete patient profiles
- **Real-time Updates:** Live data synchronization across all features

---

## 🏥 **Healthcare Impact**

### **Clinical Benefits:**
- **Digital Patient Records:** Elimination of paper-based record keeping
- **Risk Assessment:** Early identification of high-risk pregnancies
- **Real-time Monitoring:** Continuous patient health tracking
- **Care Coordination:** Centralized system for healthcare providers

### **Operational Improvements:**
- **Efficiency:** Automated patient data management
- **Accessibility:** Web-based platform accessible from any device
- **Scalability:** Cloud infrastructure supports growing patient base
- **Security:** Firebase security rules and authentication

---

## 🛠️ **Technical Implementation**

### **Database Architecture:**
- **Firebase Firestore:** NoSQL database for patient records
- **Real-time Synchronization:** Live updates across all connected devices
- **Security Rules:** Comprehensive Firebase security implementation
- **Data Validation:** Client and server-side data validation

### **Frontend Architecture:**
- **Next.js 15:** React framework with App Router
- **TypeScript:** Type-safe development throughout
- **Tailwind CSS:** Utility-first CSS framework
- **shadcn/ui:** Modern UI component library

### **Authentication & Security:**
- **Firebase Auth:** Secure user authentication
- **Protected Routes:** Route-level access control
- **Email Verification:** Required for account activation
- **Session Management:** Secure user sessions

---

## 🚀 **Future Development**

### **Short-term Goals:**
1. **AI Risk Prediction:** Machine learning model for pregnancy risk assessment
2. **IoT Integration:** Real-time vital signs monitoring with hardware sensors
3. **Mobile App:** React Native application for field healthcare workers
4. **Advanced Analytics:** Population health insights and trends

### **Long-term Vision:**
1. **Multi-clinic Support:** Network of healthcare facilities
2. **Telemedicine:** Video consultation integration
3. **Regional Expansion:** Multi-language support for different countries
4. **Research Platform:** Anonymous data contribution to medical research

---

## 📞 Contact Information

- **Student:** Oche David Ankeli
- **Email:** [o.ankeli@alustudent.com]
- **GitHub:** [https://github.com/Tripp808](https://github.com/Tripp808)

---

*This project demonstrates a functional maternal healthcare management system built with modern web technologies, currently managing 28 real patients including 21 pregnant patients and 11 high-risk cases, with comprehensive features for patient management, vital signs tracking, and healthcare analytics.*