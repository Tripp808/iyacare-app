// Script to add diverse vital signs to existing patients
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, Timestamp } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  // You can find this in your Firebase console
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Diverse vital signs data for different risk levels
const vitalSignsTemplates = [
  // Low risk profiles
  {
    age: 23, systolicBP: 110, diastolicBP: 70, bloodSugar: 6.5, temperature: 98.2, heartRate: 72,
    riskLevel: 'low', weight: 65, oxygenSaturation: 98, respiratoryRate: 16
  },
  {
    age: 25, systolicBP: 115, diastolicBP: 75, bloodSugar: 6.8, temperature: 98.4, heartRate: 68,
    riskLevel: 'low', weight: 60, oxygenSaturation: 99, respiratoryRate: 14
  },
  {
    age: 19, systolicBP: 105, diastolicBP: 65, bloodSugar: 6.2, temperature: 98.1, heartRate: 75,
    riskLevel: 'low', weight: 55, oxygenSaturation: 98, respiratoryRate: 15
  },
  {
    age: 27, systolicBP: 108, diastolicBP: 68, bloodSugar: 6.9, temperature: 98.3, heartRate: 70,
    riskLevel: 'low', weight: 58, oxygenSaturation: 99, respiratoryRate: 16
  },

  // Mid risk profiles
  {
    age: 32, systolicBP: 125, diastolicBP: 85, bloodSugar: 8.5, temperature: 99.1, heartRate: 85,
    riskLevel: 'mid', weight: 75, oxygenSaturation: 96, respiratoryRate: 18
  },
  {
    age: 28, systolicBP: 130, diastolicBP: 80, bloodSugar: 9.2, temperature: 99.0, heartRate: 82,
    riskLevel: 'mid', weight: 70, oxygenSaturation: 97, respiratoryRate: 17
  },
  {
    age: 35, systolicBP: 128, diastolicBP: 88, bloodSugar: 8.8, temperature: 98.8, heartRate: 88,
    riskLevel: 'mid', weight: 72, oxygenSaturation: 96, respiratoryRate: 19
  },
  {
    age: 30, systolicBP: 122, diastolicBP: 82, bloodSugar: 9.0, temperature: 98.9, heartRate: 80,
    riskLevel: 'mid', weight: 68, oxygenSaturation: 97, respiratoryRate: 18
  },

  // High risk profiles  
  {
    age: 42, systolicBP: 145, diastolicBP: 95, bloodSugar: 12.5, temperature: 100.2, heartRate: 95,
    riskLevel: 'high', weight: 85, oxygenSaturation: 94, respiratoryRate: 22
  },
  {
    age: 38, systolicBP: 150, diastolicBP: 98, bloodSugar: 13.8, temperature: 100.5, heartRate: 100,
    riskLevel: 'high', weight: 90, oxygenSaturation: 93, respiratoryRate: 24
  },
  {
    age: 45, systolicBP: 155, diastolicBP: 100, bloodSugar: 15.2, temperature: 101.0, heartRate: 105,
    riskLevel: 'high', weight: 95, oxygenSaturation: 92, respiratoryRate: 25
  },
  {
    age: 40, systolicBP: 140, diastolicBP: 92, bloodSugar: 11.8, temperature: 99.8, heartRate: 92,
    riskLevel: 'high', weight: 82, oxygenSaturation: 94, respiratoryRate: 21
  }
];

async function addDiverseVitals() {
  try {
    console.log('Fetching existing patients...');
    
    // Get all patients
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    const patients = [];
    
    patientsSnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Found ${patients.length} patients`);

    if (patients.length === 0) {
      console.log('No patients found in database');
      return;
    }

    // Add diverse vital signs to each patient
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      // Select a random vital signs template
      const template = vitalSignsTemplates[i % vitalSignsTemplates.length];
      
      // Add some randomness to make each record unique
      const variance = {
        systolicBP: Math.floor(Math.random() * 10) - 5, // ±5
        diastolicBP: Math.floor(Math.random() * 6) - 3, // ±3
        bloodSugar: (Math.random() * 1) - 0.5, // ±0.5
        temperature: (Math.random() * 0.8) - 0.4, // ±0.4
        heartRate: Math.floor(Math.random() * 10) - 5, // ±5
        weight: Math.floor(Math.random() * 10) - 5, // ±5
      };

      const vitalSigns = {
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        systolicBP: Math.max(80, template.systolicBP + variance.systolicBP),
        diastolicBP: Math.max(50, template.diastolicBP + variance.diastolicBP),
        heartRate: Math.max(50, template.heartRate + variance.heartRate),
        temperature: Math.max(97, template.temperature + variance.temperature),
        weight: Math.max(40, template.weight + variance.weight),
        bloodSugar: Math.max(4, template.bloodSugar + variance.bloodSugar),
        oxygenSaturation: template.oxygenSaturation,
        respiratoryRate: template.respiratoryRate,
        notes: `Automated vital signs - ${template.riskLevel} risk profile`,
        recordedBy: 'System',
        recordedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log(`Adding vitals for ${patient.firstName} ${patient.lastName} (${template.riskLevel} risk):`);
      console.log(`  Age: ${template.age}, BP: ${vitalSigns.systolicBP}/${vitalSigns.diastolicBP}, Sugar: ${vitalSigns.bloodSugar.toFixed(1)}, Temp: ${vitalSigns.temperature.toFixed(1)}, HR: ${vitalSigns.heartRate}`);

      const docRef = await addDoc(collection(db, 'vital_signs'), vitalSigns);
      console.log(`  ✓ Added vital signs with ID: ${docRef.id}`);
    }

    console.log('\n✅ Successfully added diverse vital signs to all patients!');
    console.log('\nBreakdown:');
    console.log(`- Low risk profiles: ${vitalSignsTemplates.filter(t => t.riskLevel === 'low').length}`);
    console.log(`- Mid risk profiles: ${vitalSignsTemplates.filter(t => t.riskLevel === 'mid').length}`);
    console.log(`- High risk profiles: ${vitalSignsTemplates.filter(t => t.riskLevel === 'high').length}`);

  } catch (error) {
    console.error('Error adding vital signs:', error);
  }
}

// Run the script
addDiverseVitals(); 