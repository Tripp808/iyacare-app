const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration (using the same config from your app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "iyacare.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iyacare",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "iyacare.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1093409071155",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1093409071155:web:bb070eb164529e61b8c346",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6YBNE3TQW6"
};

// Test user credentials
const TEST_USER = {
  email: 'testuser@iyacare.demo',
  password: 'IyaCare2024!',
  name: 'Test User',
  role: 'healthcare_provider'
};

async function createTestUser() {
  try {
    console.log('🚀 Creating test user for IyàCare platform...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('📧 Creating Firebase Auth user...');
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      TEST_USER.email, 
      TEST_USER.password
    );
    
    const firebaseUser = userCredential.user;
    console.log('✅ Firebase Auth user created:', firebaseUser.uid);
    
    // Update display name
    await updateProfile(firebaseUser, { 
      displayName: TEST_USER.name 
    });
    
    console.log('📝 Creating user document in Firestore...');
    
    // Create user document in Firestore
    const userData = {
      email: TEST_USER.email,
      name: TEST_USER.name,
      role: TEST_USER.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: true, // Pre-verify the test user
      profilePicture: '',
      phone: '+1234567890',
      address: 'Test Address for Demo',
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    console.log('✅ Test user created successfully!');
    console.log('\n🔐 TEST USER CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}`);
    console.log(`👤 Role: ${TEST_USER.role}`);
    console.log(`✅ Status: Pre-verified (no email verification needed)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 TESTING INSTRUCTIONS:');
    console.log('1. Go to: https://www.iyacare.site/auth/login');
    console.log('2. Use the credentials above to log in');
    console.log('3. Access will be granted immediately (no email verification)');
    console.log('4. Full access to all platform features');
    console.log('\n🎯 Perfect for demos, testing, and showcasing the platform!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Test user already exists!');
      console.log('\n🔐 EXISTING TEST USER CREDENTIALS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 Email: ${TEST_USER.email}`);
      console.log(`🔑 Password: ${TEST_USER.password}`);
      console.log(`👤 Role: ${TEST_USER.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📋 TESTING INSTRUCTIONS:');
      console.log('1. Go to: https://www.iyacare.site/auth/login');
      console.log('2. Use the credentials above to log in');
      console.log('3. Full access to all platform features');
    } else {
      console.error('❌ Error creating test user:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Make sure your Firebase project is properly configured');
      console.log('2. Check that Email/Password authentication is enabled');
      console.log('3. Verify your .env.local file has correct Firebase keys');
    }
  }
}

// Run the script
createTestUser(); 