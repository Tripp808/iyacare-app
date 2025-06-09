// Test Firebase Storage connectivity
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: "iyacare.firebaseapp.com",
  projectId: "iyacare",
  storageBucket: "iyacare.firebasestorage.app",
  messagingSenderId: "1093409071155",
  appId: "1:1093409071155:web:bb070eb164529e61b8c346"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testStorage() {
  try {
    console.log('Testing Firebase Storage connectivity...');
    
    // Create a simple test file
    const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    const testRef = ref(storage, `test/test-${Date.now()}.txt`);
    
    console.log('Uploading test file...');
    await uploadBytes(testRef, testData);
    
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(testRef);
    
    console.log('✅ Storage test successful!');
    console.log('Download URL:', downloadURL);
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

testStorage(); 