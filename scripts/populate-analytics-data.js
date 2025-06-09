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
  
  // Diverse Sub-Saharan African names by region
  const names = {
    // West Africa (Nigeria, Ghana, Senegal, Mali, Burkina Faso)
    west: {
      female: ['Amina', 'Fatima', 'Khadija', 'Aisha', 'Zainab', 'Hauwa', 'Maryam', 'Safiya', 'Halima', 'Habiba',
               'Akosua', 'Ama', 'Efua', 'Abena', 'Adjoa', 'Adwoa', 'Yaa', 'Esi', 'Akua', 'Araba',
               'Aminata', 'Mariama', 'Fatoumata', 'Awa', 'Khady', 'Bineta', 'Astou', 'Ndèye', 'Mame', 'Rokhaya'],
      male: ['Abdullahi', 'Ibrahim', 'Musa', 'Yusuf', 'Umar', 'Ahmad', 'Hassan', 'Hussaini', 'Aliyu', 'Sani',
             'Kwame', 'Kofi', 'Kwaku', 'Yaw', 'Fiifi', 'Kwabena', 'Kwadwo', 'Akwasi', 'Atta', 'Nana',
             'Mamadou', 'Ousmane', 'Ibrahima', 'Amadou', 'Moussa', 'Abdou', 'Cheikh', 'Omar', 'Seydou', 'Lamine']
    },
    // East Africa (Kenya, Tanzania, Uganda, Rwanda, Ethiopia)
    east: {
      female: ['Grace', 'Mary', 'Jane', 'Faith', 'Joyce', 'Catherine', 'Elizabeth', 'Margaret', 'Susan', 'Rose',
               'Aisha', 'Fatuma', 'Halima', 'Zuhura', 'Amina', 'Mwanaidi', 'Rehema', 'Mariam', 'Khadija', 'Salma',
               'Immaculée', 'Esperance', 'Chantal', 'Vestine', 'Claudine', 'Jeannette', 'Alphonsine', 'Béatrice', 'Goretti', 'Consolée',
               'Tigist', 'Hiwot', 'Meron', 'Selamawit', 'Almaz', 'Bethelehem', 'Rahel', 'Ruth', 'Sara', 'Tsehay'],
      male: ['David', 'John', 'Peter', 'Paul', 'James', 'Michael', 'Daniel', 'Samuel', 'Joseph', 'Robert',
             'Mohamed', 'Hassan', 'Hussein', 'Ali', 'Omar', 'Abdallah', 'Rashid', 'Salim', 'Hamisi', 'Juma',
             'Jean-Baptiste', 'Emmanuel', 'Jean-Claude', 'Innocent', 'Félicien', 'Eric', 'Augustin', 'Théogène', 'Damascène', 'Philibert',
             'Dawit', 'Yohannes', 'Mehari', 'Tekle', 'Berhe', 'Ghebrehiwet', 'Tesfaye', 'Girma', 'Tadesse', 'Haile']
    },
    // Central Africa (Cameroon, DRC, Chad, CAR)
    central: {
      female: ['Marie', 'Angèle', 'Françoise', 'Christine', 'Marguerite', 'Thérèse', 'Cécile', 'Bernadette', 'Pauline', 'Sylvie',
               'Fatima', 'Aïcha', 'Mariam', 'Khadija', 'Aminata', 'Hadja', 'Salamatou', 'Fadimatou', 'Maimouna', 'Ramatou'],
      male: ['Pierre', 'Jean', 'Paul', 'François', 'André', 'Michel', 'Bernard', 'Philippe', 'Claude', 'Antoine',
             'Mahamat', 'Hassan', 'Adam', 'Ali', 'Omar', 'Abdoulaye', 'Idriss', 'Ahmat', 'Moussa', 'Ibrahim']
    },
    // Southern Africa (South Africa, Zimbabwe, Botswana, Zambia, Malawi)
    southern: {
      female: ['Nomsa', 'Thandi', 'Sibongile', 'Nokuthula', 'Thandiwe', 'Busisiwe', 'Nomthandazo', 'Sindisiwe', 'Nompumelelo', 'Ntombifuthi',
               'Chipo', 'Tendai', 'Privilege', 'Rumbidzai', 'Nyasha', 'Tsitsi', 'Memory', 'Ratidzo', 'Fungai', 'Vimbai',
               'Mpho', 'Kgomotso', 'Tebogo', 'Boitumelo', 'Neo', 'Refilwe', 'Lerato', 'Naledi', 'Keabetswe', 'Goitseone'],
      male: ['Sipho', 'Thabo', 'Mandla', 'Bongani', 'Siphiwe', 'Mthunzi', 'Nkosinathi', 'Sandile', 'Sizani', 'Vusi',
             'Tinashe', 'Tapiwa', 'Farai', 'Wellington', 'Takudzwa', 'Tatenda', 'Blessing', 'Victor', 'Given', 'Trust',
             'Thabo', 'Teboho', 'Tshepo', 'Karabo', 'Lesego', 'Katlego', 'Kopano', 'Boikanyo', 'Tumelo', 'Phenyo']
    }
  };

  // Countries and regions across Sub-Saharan Africa
  const locations = [
    // West Africa
    { country: 'Nigeria', state: 'Lagos State', city: 'Lagos' },
    { country: 'Nigeria', state: 'Kano State', city: 'Kano' },
    { country: 'Nigeria', state: 'Rivers State', city: 'Port Harcourt' },
    { country: 'Nigeria', state: 'Ogun State', city: 'Abeokuta' },
    { country: 'Nigeria', state: 'FCT', city: 'Abuja' },
    { country: 'Ghana', state: 'Greater Accra', city: 'Accra' },
    { country: 'Ghana', state: 'Ashanti Region', city: 'Kumasi' },
    { country: 'Senegal', state: 'Dakar Region', city: 'Dakar' },
    { country: 'Mali', state: 'Bamako Region', city: 'Bamako' },
    { country: 'Burkina Faso', state: 'Centre Region', city: 'Ouagadougou' },
    
    // East Africa
    { country: 'Kenya', state: 'Nairobi County', city: 'Nairobi' },
    { country: 'Kenya', state: 'Mombasa County', city: 'Mombasa' },
    { country: 'Kenya', state: 'Kisumu County', city: 'Kisumu' },
    { country: 'Tanzania', state: 'Dar es Salaam', city: 'Dar es Salaam' },
    { country: 'Tanzania', state: 'Mwanza Region', city: 'Mwanza' },
    { country: 'Uganda', state: 'Central Region', city: 'Kampala' },
    { country: 'Uganda', state: 'Western Region', city: 'Mbarara' },
    { country: 'Rwanda', state: 'Kigali Province', city: 'Kigali' },
    { country: 'Rwanda', state: 'Southern Province', city: 'Butare' },
    { country: 'Ethiopia', state: 'Addis Ababa', city: 'Addis Ababa' },
    { country: 'Ethiopia', state: 'Oromia Region', city: 'Adama' },
    
    // Central Africa
    { country: 'Cameroon', state: 'Littoral Region', city: 'Douala' },
    { country: 'Cameroon', state: 'Centre Region', city: 'Yaoundé' },
    { country: 'DRC', state: 'Kinshasa', city: 'Kinshasa' },
    { country: 'DRC', state: 'Katanga', city: 'Lubumbashi' },
    { country: 'Chad', state: "N'Djamena Region", city: "N'Djamena" },
    
    // Southern Africa
    { country: 'South Africa', state: 'Gauteng', city: 'Johannesburg' },
    { country: 'South Africa', state: 'Western Cape', city: 'Cape Town' },
    { country: 'South Africa', state: 'KwaZulu-Natal', city: 'Durban' },
    { country: 'Zimbabwe', state: 'Harare Province', city: 'Harare' },
    { country: 'Zimbabwe', state: 'Bulawayo Province', city: 'Bulawayo' },
    { country: 'Botswana', state: 'South-East District', city: 'Gaborone' },
    { country: 'Zambia', state: 'Lusaka Province', city: 'Lusaka' },
    { country: 'Malawi', state: 'Lilongwe District', city: 'Lilongwe' },
    { country: 'Malawi', state: 'Blantyre District', city: 'Blantyre' }
  ];

  const regions = ['west', 'east', 'central', 'southern'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const patients = [];
  
  for (let i = 0; i < 80; i++) {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 180)); // Last 6 months
    const region = regions[Math.floor(Math.random() * regions.length)];
    const gender = Math.random() > 0.5 ? 'female' : 'male';
    const location = locations[Math.floor(Math.random() * locations.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    // Get appropriate name for region and gender
    const firstName = names[region][gender][Math.floor(Math.random() * names[region][gender].length)];
    const lastName = names[region][gender === 'female' ? 'male' : 'female'][Math.floor(Math.random() * names[region][gender === 'female' ? 'male' : 'female'].length)];
    
    // Generate realistic age and phone number
    const age = 18 + Math.floor(Math.random() * 42); // 18-60 years
    const birthYear = new Date().getFullYear() - age;
    const dateOfBirth = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    // Generate country-appropriate phone numbers
    const getPhoneNumber = (country) => {
      const phonePrefixes = {
        'Nigeria': '+234',
        'Kenya': '+254',
        'Ghana': '+233',
        'Tanzania': '+255',
        'Uganda': '+256',
        'Rwanda': '+250',
        'Ethiopia': '+251',
        'South Africa': '+27',
        'Zimbabwe': '+263',
        'Botswana': '+267',
        'Zambia': '+260',
        'Malawi': '+265',
        'Cameroon': '+237',
        'DRC': '+243',
        'Chad': '+235',
        'Senegal': '+221',
        'Mali': '+223',
        'Burkina Faso': '+226'
      };
      const prefix = phonePrefixes[country] || '+234';
      const number = Math.floor(Math.random() * 900000000) + 100000000;
      return `${prefix}${number}`;
    };
    
    const isPregnant = gender === 'female' && Math.random() > 0.7; // 30% of women are pregnant
    
    patients.push({
      firstName,
      lastName,
      dateOfBirth,
      phone: getPhoneNumber(location.country),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${location.city}, ${location.state}, ${location.country}`,
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      riskLevel,
      isPregnant,
      dueDate: isPregnant ? addDays(new Date(), Math.floor(Math.random() * 280)).toISOString().split('T')[0] : null,
      pregnancyWeek: isPregnant ? Math.floor(Math.random() * 40) + 1 : null,
      medicalHistory: `Patient from ${location.country}. Regular checkups recommended.`,
      notes: `Speaks local language. Cultural considerations for ${location.country} healthcare practices.`,
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