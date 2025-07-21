# 🚨 URGENT: Fix Production Email Verification

## Issue
✅ **Email verification works on localhost**  
❌ **Email verification NOT working on production (www.iyacare.site)**

## 🔧 IMMEDIATE ACTION REQUIRED

### Step 1: Firebase Console Fix (2 minutes)
1. Go to: https://console.firebase.google.com/
2. Select project: **iyacare**
3. Go to: **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add: `iyacare.site`
6. Click **"Add domain"** again
7. Add: `www.iyacare.site`
8. **SAVE**

### Step 2: Environment Variable (Production)
Make sure your production environment (Vercel/hosting) has:
```
NEXT_PUBLIC_SITE_URL=https://www.iyacare.site
```

### Step 3: Test Immediately
1. Go to: https://www.iyacare.site/auth/register
2. Register with a test email
3. Check email (including spam folder)
4. Should receive verification email

## 🔍 Debug Production Issues

Open browser console and look for these errors:
- `auth/unauthorized-domain` - Need to add domain to Firebase
- `Network error` - Check Firebase quotas
- `Invalid action code` - Email template issues

## ✅ Verification Checklist

- [ ] Added `iyacare.site` to Firebase authorized domains
- [ ] Added `www.iyacare.site` to Firebase authorized domains
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://www.iyacare.site` in production
- [ ] Tested registration on production
- [ ] Received verification email
- [ ] Email verification link works

## 🚀 Once Fixed

Test with these credentials:
```
📧 Test Email: your-test-email@gmail.com
🔑 Password: TestPassword123!
```

## 📞 Still Having Issues?

1. Check Firebase Console → Authentication → Users (account should be created)
2. Check Firebase billing/quotas
3. Manually verify user in Firebase Console as temporary fix
4. Contact Firebase Support if domain authorization fails

---

**Priority**: HIGH - Affects all new user registrations on production
**ETA**: 2-5 minutes to fix 