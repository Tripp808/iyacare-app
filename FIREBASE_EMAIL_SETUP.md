# 📧 Firebase Email Verification Setup Guide

## 🚨 PRODUCTION EMAIL VERIFICATION FIX

**Issue**: Email verification works on localhost but NOT on production (www.iyacare.site)

### ✅ IMMEDIATE FIX REQUIRED

1. **Go to Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. **Select your project**: `iyacare`
3. **Navigate to Authentication** → **Settings** → **Authorized domains**
4. **Add these domains** (if not already present):
   ```
   localhost (for development)
   iyacare.site
   www.iyacare.site
   ```

### 🔧 Step-by-Step Fix:

#### 1. Firebase Console - Authorized Domains
1. In Firebase Console, go to **Authentication**
2. Click **Settings** tab
3. Scroll to **Authorized domains** section
4. Click **Add domain**
5. Add: `iyacare.site`
6. Click **Add domain** again
7. Add: `www.iyacare.site`
8. **Save changes**

#### 2. Email Template Configuration
1. Go to **Authentication** → **Templates**
2. Click **Email address verification**
3. Ensure the action URL uses your production domain
4. Set custom email template:
   ```
   Subject: Verify your email for IyàCare
   
   Hello,
   
   Please verify your email address for IyàCare by clicking the link below:
   %LINK%
   
   If you didn't create an account, you can safely ignore this email.
   
   Thanks,
   The IyàCare Team
   ```

#### 3. Environment Variables Check
Ensure your production environment has:
```env
NEXT_PUBLIC_SITE_URL=https://www.iyacare.site
```

## 🚨 Current Issue Resolution

If users are being created in Firebase Auth but not receiving verification emails, follow these steps:

## ✅ Firebase Console Configuration

### 1. Check Authentication Settings
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `iyacare`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Ensure these domains are added:
   - `localhost` (for development)
   - `iyacare.site` (your production domain)
   - `www.iyacare.site` (with www prefix)

### 2. Email Template Configuration
1. Go to **Authentication** → **Templates**
2. Click on **Email address verification**
3. Customize the email template:
   ```
   Subject: Verify your email for IyàCare
   
   Hello,
   
   Follow this link to verify your email address for IyàCare:
   %LINK%
   
   If you didn't ask to verify this address, you can ignore this email.
   
   Thanks,
   The IyàCare Team
   ```

### 3. Project Settings
1. Go to **Project Settings** → **General**
2. Ensure **Public-facing name** is set to: `IyàCare`
3. Ensure **Support email** is set to a valid email address

## 🔧 Code Fixes Applied

### Fixed Issues:
1. **Loading State**: Added proper `setLoading(false)` after successful registration
2. **Email Verification**: Moved email verification after user creation in Firestore
3. **Error Handling**: Improved error handling to not fail registration if email fails
4. **URL Configuration**: Changed verification URL to use environment-specific domains
5. **Production Support**: Added NEXT_PUBLIC_SITE_URL environment variable support

### Updated Functions:
- `signUp()` in `src/hooks/useAuth.tsx`
- `sendVerificationEmail()` in `src/hooks/useAuth.tsx` 
- Registration error handling in `src/app/auth/register/page.tsx`

## 🧪 Testing the Fix

### Test Registration:
1. Go to: [https://www.iyacare.site/auth/register](https://www.iyacare.site/auth/register)
2. Fill out the registration form
3. Submit the form
4. Should see: "Account created successfully!" message
5. Check your email for verification link (including spam folder)

### Debug Production Issues:
1. Open browser developer tools
2. Check console for error messages
3. Look for "auth/unauthorized-domain" errors
4. Verify the authorized domains in Firebase Console

### If Email Still Doesn't Arrive:
1. Check spam/junk folder
2. Wait up to 10 minutes for delivery
3. Try using the "Resend verification email" option
4. Check Firebase Console → Authentication → Users to confirm user exists

## 🔧 Manual Email Verification (Temporary Solution)

If needed, you can manually verify users in Firebase Console:
1. Go to **Authentication** → **Users**
2. Find the user account
3. Click the user
4. Toggle **Email verified** to **true**

## 📞 Support

If issues persist:
- Check Firebase billing (free tier has email limits)
- Verify your Firebase project quota
- Contact Firebase Support for email delivery issues

---

*This guide resolves the registration success/email verification issue in IyàCare platform.* 