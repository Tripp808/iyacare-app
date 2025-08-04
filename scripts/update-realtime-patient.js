import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "iyacare.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iyacare",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "iyacare.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1093409071155",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1093409071155:web:bb070eb164529e61b8c346",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6YBNE3TQW6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateRealtimePatient() {
  try {
    console.log('🔍 Looking for real-time patient to update...');
    
    // Find the real-time patient
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where("isRealtimePatient", "==", true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No real-time patient found. Please create one first.');
      return { success: false, error: 'No real-time patient found' };
    }
    
    // Get the first (should be only) real-time patient
    const patientDoc = querySnapshot.docs[0];
    const patientData = patientDoc.data();
    
    console.log('👩 Found patient:', patientData.firstName, patientData.lastName);
    console.log('📞 Current phone:', patientData.phone);
    console.log('📧 Current email:', patientData.email);
    
    // Update the patient information
    const updates = {
      lastName: "Munezero",
      phone: "+250791848842",
      email: "immaculee.munezero@gmail.com",
      realtimeDatabasePath: "/patients/immaculee_munezero",
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, 'patients', patientDoc.id), updates);
    
    console.log('✅ Real-time patient updated successfully!');
    console.log('📝 Patient ID:', patientDoc.id);
    console.log('👩 New name: Immaculée Munezero');
    console.log('📞 New phone: +250791848842');
    console.log('📧 New email: immaculee.munezero@gmail.com');
    console.log('📡 New database path: /patients/immaculee_munezero');
    
    return { success: true, patientId: patientDoc.id };
  } catch (error) {
    console.error('❌ Error updating real-time patient:', error);
    return { success: false, error: error.message };
  }
}

// Run the script
updateRealtimePatient()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 Patient update complete!');
      console.log('🔴 Immaculée Munezero information has been updated');
    } else {
      console.log('\n❌ Update failed:', result.error);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });
