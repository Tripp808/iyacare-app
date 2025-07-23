// Test file to verify Firebase Realtime Database connection
// Run this with: node test-iot-connection.mjs

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: "iyacare.firebaseapp.com",
  projectId: "iyacare",
  storageBucket: "iyacare.firebasestorage.app",
  messagingSenderId: "1093409071155",
  appId: "1:1093409071155:web:bb070eb164529e61b8c346",
  measurementId: "G-6YBNE3TQW6",
  databaseURL: "https://iyacare-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('🔗 Connecting to Firebase Realtime Database...');
console.log('📡 Database URL: https://iyacare-default-rtdb.firebaseio.com/');

// Test reading from /readings path
const readingsRef = ref(database, '/readings');
onValue(readingsRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    console.log('\n✅ Successfully connected to IoT data!');
    console.log('📊 Live readings from ESP32:');
    console.log(`   🌡️  Body Temperature: ${data.BodyTemperature}°F (${((data.BodyTemperature - 32) * 5/9).toFixed(1)}°C)`);
    console.log(`   💓 Heart Rate: ${data.HeartRate} bpm`);
    console.log(`   🩸 Blood Pressure: ${data.SystolicBP}/${data.DiastolicBP} mmHg`);
    console.log(`   ⏰ Timestamp: ${data.timestamp}`);
  } else {
    console.log('❌ No data found at /readings path');
  }
}, (error) => {
  console.error('❌ Error connecting to database:', error);
});

// Test connection status
const statusRef = ref(database, '/test/connection');
onValue(statusRef, (snapshot) => {
  const status = snapshot.val();
  console.log(`🔌 Device Status: ${status || 'Unknown'}`);
});

console.log('\n⚡ Listening for real-time updates...');
console.log('   (This will keep running until you stop it with Ctrl+C)');
console.log('\n👩 Patient: Immaculée Munezero (Real-time IoT Patient)');
console.log('🏥 Ready to monitor live vital signs!');
