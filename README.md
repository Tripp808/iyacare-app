# IyaCare - Maternal Health Platform

IyaCare is a digital maternal health platform focused on sub-Saharan Africa. The application is designed for healthcare professionals (doctors, midwives, nurses, clinic administrators) to monitor pregnant patients, access medical data, receive alerts, and manage referrals.

## Features

- **Patient Management**: Track and monitor pregnant patients
- **Risk Assessment**: Identify high-risk pregnancies with automated alerts
- **Visit Scheduling**: Manage patient appointments and follow-ups
- **Referral System**: Streamline patient referrals between health facilities
- **Alerts & Notifications**: Stay informed about critical patient updates
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- Next.js (React framework)
- TailwindCSS (styling)
- Shadcn/UI (component library)
- Firebase Authentication
- Firebase Firestore

### Backend
- Node.js with Express
- Firebase Admin SDK

## Project Structure

```
iyacare_app/
├── src/                  # Frontend code
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   └── lib/              # Utility functions and Firebase config
├── api/                  # Backend code
│   ├── routes/           # API endpoints
│   ├── server.js         # Express server
│   └── firebase-admin.js # Firebase admin configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/iyacare_app.git
   cd iyacare_app
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Install backend dependencies
   ```
   cd api
   npm install
   cd ..
   ```

4. Set up Firebase
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore
   - Create a web app and copy the config values
   - Create a service account key for the backend

5. Configure environment variables:
   - Copy `src/lib/firebase/config.ts` and add your Firebase web config
   - Add your Firebase service account key to `api/serviceAccountKey.json`

### Running the application

1. Start the frontend development server:
   ```
   npm run dev
   ```

2. Start the backend server:
   ```
   cd api
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Frontend
The Next.js application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

### Backend
The Express API can be deployed to platforms like Heroku, Render, Railway, or any other Node.js hosting service.

## License

[MIT](LICENSE)

## Acknowledgments

- This project aims to improve maternal healthcare outcomes in sub-Saharan Africa
- Inspired by the need for digital tools that address specific regional healthcare challenges
