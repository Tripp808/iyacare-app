const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');
const { addDays, subDays, addHours, subHours } = require('date-fns');

// Firebase Admin configuration
const serviceAccount = {
  "type": "service_account",
  "project_id": "iyacare-app",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample data generators
function generatePatients() {
  const riskLevels = ['low', 'medium', 'high'];
  const states = ['Lagos', 'Abuja', 'Rivers', 'Kano', 'Ogun', 'Kaduna'];
  const cities = ['Ikeja', 'Yaba', 'Victoria Island', 'Lekki', 'Surulere'];
  
  const patients = [];
  
  for (let i = 0; i < 50; i++) {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 90));
    
    patients.push({
      id: `patient_${i + 1}`,
      name: `Patient ${i + 1}`,
      email: `patient${i + 1}@example.com`,
      age: 25 + Math.floor(Math.random() * 50),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      address: {
        state: states[Math.floor(Math.random() * states.length)],
        city: cities[Math.floor(Math.random() * cities.length)]
      },
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }
  
  return patients;
}

function generateAlerts() {
  const priorities = ['low', 'medium', 'high'];
  const types = ['risk', 'appointment', 'medication', 'emergency', 'vital'];
  const messages = [
    'High blood pressure detected',
    'Irregular heart rate pattern',
    'Missed medication reminder',
    'Emergency consultation required',
    'Vital signs anomaly detected'
  ];
  
  const alerts = [];
  
  for (let i = 0; i < 30; i++) {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    alerts.push({
      id: `alert_${i + 1}`,
      patientId: `patient_${Math.floor(Math.random() * 50) + 1}`,
      priority,
      type,
      message: messages[Math.floor(Math.random() * messages.length)],
      resolved: Math.random() > 0.7,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }
  
  return alerts;
}

function generateVitalSigns() {
  const vitalSigns = [];
  const now = new Date();
  
  // Generate vital signs for the last 24 hours
  for (let i = 0; i < 100; i++) {
    const timestamp = subHours(now, Math.floor(Math.random() * 24));
    
    vitalSigns.push({
      id: `vital_${i + 1}`,
      patientId: `patient_${Math.floor(Math.random() * 50) + 1}`,
      systolic: 110 + Math.floor(Math.random() * 40), // 110-150
      diastolic: 70 + Math.floor(Math.random() * 20), // 70-90
      heartRate: 60 + Math.floor(Math.random() * 40), // 60-100
      temperature: 36.0 + Math.random() * 2, // 36.0-38.0
      oxygenSaturation: 95 + Math.floor(Math.random() * 5), // 95-100
      timestamp: Timestamp.fromDate(timestamp),
      createdAt: Timestamp.fromDate(timestamp)
    });
  }
  
  return vitalSigns;
}

async function populateAnalyticsData() {
  try {
    console.log('Starting analytics data population...');
    
    // Generate sample data
    const patients = generatePatients();
    const alerts = generateAlerts();
    const vitalSigns = generateVitalSigns();
    
    console.log(`Generated ${patients.length} patients`);
    console.log(`Generated ${alerts.length} alerts`);
    console.log(`Generated ${vitalSigns.length} vital signs`);
    
    // Populate patients
    console.log('Populating patients...');
    const patientsRef = db.collection('patients');
    for (const patient of patients) {
      await patientsRef.doc(patient.id).set(patient);
    }
    
    // Populate alerts
    console.log('Populating alerts...');
    const alertsRef = db.collection('alerts');
    for (const alert of alerts) {
      await alertsRef.doc(alert.id).set(alert);
    }
    
    // Populate vital signs
    console.log('Populating vital signs...');
    const vitalSignsRef = db.collection('vitalSigns');
    for (const vital of vitalSigns) {
      await vitalSignsRef.doc(vital.id).set(vital);
    }
    
    console.log('Analytics data population completed successfully!');
    console.log('Summary:');
    console.log(`- ${patients.length} patients added`);
    console.log(`- ${alerts.length} alerts added`);
    console.log(`- ${vitalSigns.length} vital signs added`);
    
    // Calculate and display analytics
    const riskDistribution = patients.reduce((acc, patient) => {
      acc[patient.riskLevel] = (acc[patient.riskLevel] || 0) + 1;
      return acc;
    }, {});
    
    const highRiskAlerts = alerts.filter(alert => alert.priority === 'high').length;
    const emergencyAlerts = alerts.filter(alert => alert.type === 'emergency').length;
    
    console.log('\nAnalytics Preview:');
    console.log(`- Risk Distribution: Low: ${riskDistribution.low || 0}, Medium: ${riskDistribution.medium || 0}, High: ${riskDistribution.high || 0}`);
    console.log(`- High Risk Alerts: ${highRiskAlerts}`);
    console.log(`- Emergency Alerts: ${emergencyAlerts}`);
    
  } catch (error) {
    console.error('Error populating analytics data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the population script
populateAnalyticsData(); 