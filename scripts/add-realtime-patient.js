import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: "iyacare.firebaseapp.com",
  projectId: "iyacare",
  storageBucket: "iyacare.firebasestorage.app",
  messagingSenderId: "1093409071155",
  appId: "1:1093409071155:web:bb070eb164529e61b8c346",
  measurementId: "G-6YBNE3TQW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRealtimePatient() {
  try {
    // Create a real-time patient with Rwandan female name
    const realtimePatient = {
      firstName: "Immaculée",
      lastName: "Munezero",
      dateOfBirth: new Date('1995-03-15'),
      phone: "+250791848842",
      email: "immaculee.munezero@gmail.com",
      address: "Nyarugenge District, Kigali",
      bloodType: "O+",
      riskLevel: "medium",
      medicalHistory: "Previous cesarean section, hypertension monitoring",
      notes: "Real-time IoT monitoring patient - connected to live sensor devices",
      
      // Pregnancy related fields
      isPregnant: true,
      dueDate: new Date('2025-12-15'),
      pregnancyWeek: 28,
      
      // Special markers for real-time patient
      isRealtimePatient: true,
      iotDeviceId: "RWT-001-IMM",
      realtimeDatabasePath: "/patients/immaculee_munezero",
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'patients'), realtimePatient);
    
    console.log('✅ Real-time patient created successfully!');
    console.log('📝 Patient ID:', docRef.id);
    console.log('👩 Name: Immaculée Munezero');
    console.log('🔗 IoT Device ID: RWT-001-IMM');
    console.log('📡 Real-time Database Path: /patients/immaculee_munezero');
    console.log('🏥 This patient will receive live IoT data from your Firebase Realtime Database');
    
    return { success: true, patientId: docRef.id };
  } catch (error) {
    console.error('❌ Error creating real-time patient:', error);
    return { success: false, error: error.message };
  }
}

// Run the script
addRealtimePatient()
  .then(() => {
    console.log('\n🎉 Real-time patient setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
