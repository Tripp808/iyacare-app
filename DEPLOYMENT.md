# IyàCare Deployment Guide

This guide will help you deploy the IyàCare application to production with a fully functional database and authentication system.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase Account** (free tier available)
3. **Vercel Account** (for deployment) or any other hosting platform
4. **Domain name** (optional, for custom domain)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `iyacare-production` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Configure authorized domains (add your production domain)

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select a location close to your users
5. Create database

### 4. Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`
   - Select **Firestore** and **Hosting**
   - Choose your Firebase project
   - Use the existing `firestore.rules` file
4. Deploy rules: `firebase deploy --only firestore:rules`

### 5. Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll down to "Your apps"
3. Click "Web app" icon to create a web app
4. Register app with name "IyàCare"
5. Copy the configuration object

## Environment Variables Setup

### 1. Create Production Environment File

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Configure Custom Claims (Optional)

For role-based access control, you may want to set up custom claims:

1. Go to **Authentication** > **Users**
2. For each user, you can set custom claims via Firebase Admin SDK
3. Example roles: `admin`, `healthcare_provider`, `healthcare_worker`, `patient`

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**: `npm install -g vercel`
2. **Login**: `vercel login`
3. **Deploy**: `vercel --prod`
4. **Set Environment Variables**:
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all the environment variables from your `.env.local` file
5. **Custom Domain** (optional):
   - Go to Domains section in Vercel Dashboard
   - Add your custom domain

### Option 2: Netlify

1. **Build the project**: `npm run build`
2. **Deploy to Netlify**:
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository
3. **Set Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add all the environment variables

### Option 3: Firebase Hosting

1. **Build the project**: `npm run build`
2. **Configure Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
3. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

## Post-Deployment Setup

### 1. Test Authentication

1. Visit your deployed application
2. Try registering a new account
3. Check email verification
4. Test login/logout functionality
5. Test password reset

### 2. Create Admin User

1. Register the first user through the application
2. Go to Firebase Console > Authentication > Users
3. Find your user and note the UID
4. Use Firebase Admin SDK to set custom claims:

```javascript
// Set admin role
admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

### 3. Test Vital Signs Functionality

1. Login as a healthcare provider
2. Navigate to Vital Signs page
3. Add sample vital signs data
4. Verify AI predictions are working
5. Check data persistence in Firestore

### 4. Configure Email Templates (Optional)

1. Go to Firebase Console > Authentication > Templates
2. Customize email verification template
3. Customize password reset template
4. Add your branding and custom domain

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Authentication enabled with email verification
- [ ] Environment variables configured (not hardcoded)
- [ ] HTTPS enabled on production domain
- [ ] Custom claims configured for role-based access
- [ ] Email templates customized
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured

## Monitoring and Maintenance

### 1. Firebase Analytics

1. Enable Google Analytics in Firebase
2. Monitor user engagement
3. Track authentication events
4. Monitor database usage

### 2. Error Monitoring

Consider integrating error monitoring services like:
- Sentry
- LogRocket
- Bugsnag

### 3. Performance Monitoring

1. Enable Firebase Performance Monitoring
2. Monitor page load times
3. Track API response times
4. Monitor database query performance

## Backup Strategy

### 1. Firestore Backup

1. Enable automatic backups in Firebase Console
2. Set up scheduled exports to Cloud Storage
3. Test restore procedures

### 2. User Data Export

Implement user data export functionality for GDPR compliance:
- Allow users to download their data
- Implement data deletion requests
- Maintain audit logs

## Scaling Considerations

### 1. Database Optimization

- Use composite indexes for complex queries
- Implement pagination for large datasets
- Consider data archiving for old records

### 2. Authentication Scaling

- Monitor authentication quotas
- Implement rate limiting
- Consider multi-factor authentication

### 3. Performance Optimization

- Implement caching strategies
- Use CDN for static assets
- Optimize bundle size
- Implement lazy loading

## Support and Maintenance

### 1. User Support

- Set up help desk system
- Create user documentation
- Implement in-app support chat

### 2. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Regular security audits
- Performance optimization

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check Firebase configuration
   - Verify authorized domains
   - Check environment variables

2. **Database permission denied**:
   - Verify Firestore rules
   - Check user authentication status
   - Verify custom claims

3. **Email verification not sending**:
   - Check Firebase email settings
   - Verify domain configuration
   - Check spam folders

### Getting Help

- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Community Support: Stack Overflow, Discord, GitHub Issues

---

**Note**: This deployment guide assumes you're using the current codebase with Firebase authentication and Firestore database. Make sure to test thoroughly in a staging environment before deploying to production. 