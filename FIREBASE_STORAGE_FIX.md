# 🚨 URGENT: Fix Firebase Storage Upload Issue

## Issue
Profile picture uploads are getting stuck on "uploading" and never complete.

## 🔧 IMMEDIATE FIXES REQUIRED

### 1. Enable Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `iyacare`
3. Go to **Storage** in the left sidebar
4. Click **Get started**
5. Choose **Start in test mode** for now
6. Select a storage location (choose one close to your users)
7. Click **Done**

### 2. Configure Storage Rules
After enabling Storage, set up proper rules:

1. In Firebase Console → **Storage** → **Rules**
2. Replace the rules with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile pictures
    match /profiles/{fileName} {
      allow read, write: if request.auth != null
        && resource.size < 5 * 1024 * 1024  // 5MB limit
        && request.resource.contentType.matches('image/.*');
    }
    
    // Allow public read access to profile pictures
    match /profiles/{fileName} {
      allow read;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Check Storage Bucket Configuration
Verify your storage bucket name in `src/lib/firebase.ts`:

```typescript
// Should be: your-project.appspot.com
storageBucket: "iyacare.firebasestorage.app"
```

### 4. Test Storage Connection
Create and run this test script to verify storage works:

```javascript
// test-storage.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  // Your config here
};

async function testStorage() {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  
  try {
    const testData = new Blob(['test'], { type: 'text/plain' });
    const testRef = ref(storage, 'test/test.txt');
    
    console.log('Testing upload...');
    await uploadBytes(testRef, testData);
    console.log('✅ Upload successful!');
    
    const url = await getDownloadURL(testRef);
    console.log('✅ Download URL:', url);
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorage();
```

## 🐛 Enhanced Error Handling

Update your profile upload function with better error handling:

```typescript
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) return;
  const file = event.target.files[0];
  
  // Enhanced validation
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file (JPG, PNG, GIF)');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image too large. Please select an image under 5MB.');
    return;
  }
  
  setUploadingImage(true);
  
  try {
    console.log('🚀 Starting upload...', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });
    
    // Check if user is authenticated
    if (!user || !firebaseUser) {
      throw new Error('User not authenticated');
    }
    
    // Check if storage is available
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    const timestamp = Date.now();
    const fileName = `profile_${user.id}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `profiles/${fileName}`);
    
    console.log('📤 Uploading to:', `profiles/${fileName}`);
    
    // Upload with timeout
    const uploadTask = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );
    
    await Promise.race([uploadTask, timeoutPromise]);
    console.log('✅ Upload completed');
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Download URL obtained:', downloadURL);
    
    // Update profile immediately
    await UserService.updateUser(user.id, { profilePicture: downloadURL });
    await refreshUserData();
    
    setProfileData(prev => ({ ...prev, profilePicture: downloadURL }));
    toast.success('Profile picture updated successfully!');
    
  } catch (error: any) {
    console.error('❌ Upload failed:', error);
    
    // Specific error handling
    if (error.code === 'storage/unauthorized') {
      toast.error('Upload failed: Not authorized. Please check Firebase Storage rules.');
    } else if (error.code === 'storage/canceled') {
      toast.error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      toast.error('Upload failed: Unknown error. Please try again.');
    } else if (error.message.includes('timeout')) {
      toast.error('Upload timed out. Please check your internet connection.');
    } else if (error.message.includes('not authenticated')) {
      toast.error('Please log in again and try uploading.');
    } else {
      toast.error(`Upload failed: ${error.message}`);
    }
    
    // Fallback to base64 storage
    try {
      console.log('🔄 Trying fallback base64 storage...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await UserService.updateUser(user.id, { profilePicture: base64 });
        await refreshUserData();
        setProfileData(prev => ({ ...prev, profilePicture: base64 }));
        toast.success('Profile picture saved (offline mode)');
      };
      reader.readAsDataURL(file);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      toast.error('Failed to save profile picture. Please try again.');
    }
    
  } finally {
    setUploadingImage(false);
  }
};
```

## 🔍 Debug Steps

1. **Check Browser Console**: Look for specific error messages
2. **Network Tab**: Check if upload requests are being made
3. **Firebase Console**: Check Storage usage and errors
4. **Authentication**: Verify user is properly logged in

## 🚀 Alternative: Use Cloudinary or Supabase

If Firebase Storage continues to have issues, consider switching to:

### Cloudinary (Recommended)
```bash
npm install cloudinary
```

### Supabase Storage
```bash
npm install @supabase/supabase-js
```

## ✅ Verification Checklist

- [ ] Firebase Storage enabled in console
- [ ] Storage rules configured properly
- [ ] Storage bucket name correct in config
- [ ] User authentication working
- [ ] Error handling improved
- [ ] Fallback mechanism in place

## 📞 If Still Failing

1. Check Firebase billing/quotas
2. Try uploading a very small image (< 100KB)
3. Test with different file formats (JPG vs PNG)
4. Clear browser cache and cookies
5. Try from incognito mode

---

**Priority**: HIGH - Blocking profile picture functionality
**Time to fix**: 5-10 minutes 