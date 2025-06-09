const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
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

// Diverse Sub-Saharan African patients
const diversePatients = [
  // East Africa - Rwanda
  {
    firstName: "Immaculée",
    lastName: "Uwimana",
    dateOfBirth: "1990-03-15",
    phone: "+250788123456",
    email: "immaculee.uwimana@email.com",
    address: "Kigali, Kigali Province, Rwanda",
    bloodType: "O+",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-08-15",
    pregnancyWeek: 28,
    medicalHistory: "First pregnancy. Regular prenatal checkups.",
    notes: "Speaks Kinyarwanda and French. Cultural considerations for Rwandan healthcare practices."
  },
  
  // East Africa - Kenya
  {
    firstName: "Grace",
    lastName: "Wanjiku",
    dateOfBirth: "1985-07-20",
    phone: "+254712345678",
    email: "grace.wanjiku@email.com",
    address: "Nairobi, Nairobi County, Kenya",
    bloodType: "A+",
    riskLevel: "medium",
    isPregnant: false,
    medicalHistory: "History of hypertension. Regular monitoring required.",
    notes: "Speaks Kikuyu and Swahili. Lives in urban Nairobi."
  },
  
  // East Africa - Ethiopia
  {
    firstName: "Tigist",
    lastName: "Haile",
    dateOfBirth: "1992-11-08",
    phone: "+251911234567",
    email: "tigist.haile@email.com",
    address: "Addis Ababa, Addis Ababa, Ethiopia",
    bloodType: "B+",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-09-20",
    pregnancyWeek: 24,
    medicalHistory: "Second pregnancy. Previous normal delivery.",
    notes: "Speaks Amharic. Traditional Ethiopian cultural practices."
  },
  
  // East Africa - Tanzania
  {
    firstName: "Fatuma",
    lastName: "Hassan",
    dateOfBirth: "1988-04-12",
    phone: "+255756789012",
    email: "fatuma.hassan@email.com",
    address: "Dar es Salaam, Dar es Salaam, Tanzania",
    bloodType: "AB+",
    riskLevel: "high",
    isPregnant: false,
    medicalHistory: "Diabetes mellitus type 2. Requires close monitoring.",
    notes: "Speaks Swahili and Arabic. Coastal cultural background."
  },
  
  // West Africa - Ghana
  {
    firstName: "Akosua",
    lastName: "Osei",
    dateOfBirth: "1991-09-05",
    phone: "+233244567890",
    email: "akosua.osei@email.com",
    address: "Accra, Greater Accra, Ghana",
    bloodType: "O-",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-07-30",
    pregnancyWeek: 32,
    medicalHistory: "Third pregnancy. Previous cesarean delivery.",
    notes: "Speaks Twi and English. Akan cultural traditions."
  },
  
  // West Africa - Senegal
  {
    firstName: "Aminata",
    lastName: "Diop",
    dateOfBirth: "1987-01-25",
    phone: "+221771234567",
    email: "aminata.diop@email.com",
    address: "Dakar, Dakar Region, Senegal",
    bloodType: "A-",
    riskLevel: "medium",
    isPregnant: false,
    medicalHistory: "History of anemia. Iron supplementation required.",
    notes: "Speaks Wolof and French. Urban Dakar lifestyle."
  },
  
  // West Africa - Nigeria
  {
    firstName: "Amina",
    lastName: "Bello",
    dateOfBirth: "1989-06-18",
    phone: "+234802345678",
    email: "amina.bello@email.com",
    address: "Lagos, Lagos State, Nigeria",
    bloodType: "B-",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-10-12",
    pregnancyWeek: 20,
    medicalHistory: "First pregnancy. Normal progress so far.",
    notes: "Speaks Hausa and English. Northern Nigerian cultural background."
  },
  
  // Southern Africa - South Africa
  {
    firstName: "Nomsa",
    lastName: "Mthembu",
    dateOfBirth: "1986-12-03",
    phone: "+27821234567",
    email: "nomsa.mthembu@email.com",
    address: "Johannesburg, Gauteng, South Africa",
    bloodType: "O+",
    riskLevel: "medium",
    isPregnant: false,
    medicalHistory: "Previous gestational diabetes. Regular glucose monitoring.",
    notes: "Speaks Zulu and English. Urban South African setting."
  },
  
  // Southern Africa - Zimbabwe
  {
    firstName: "Chipo",
    lastName: "Mukamuri",
    dateOfBirth: "1993-02-14",
    phone: "+263712345678",
    email: "chipo.mukamuri@email.com",
    address: "Harare, Harare Province, Zimbabwe",
    bloodType: "A+",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-11-05",
    pregnancyWeek: 16,
    medicalHistory: "First pregnancy. Young and healthy.",
    notes: "Speaks Shona and English. Zimbabwean cultural practices."
  },
  
  // Southern Africa - Botswana
  {
    firstName: "Mpho",
    lastName: "Seretse",
    dateOfBirth: "1984-08-22",
    phone: "+26771234567",
    email: "mpho.seretse@email.com",
    address: "Gaborone, South-East District, Botswana",
    bloodType: "AB-",
    riskLevel: "high",
    isPregnant: false,
    medicalHistory: "Chronic hypertension and pre-eclampsia history.",
    notes: "Speaks Setswana and English. Semi-urban Botswana lifestyle."
  },
  
  // Central Africa - Cameroon
  {
    firstName: "Marie",
    lastName: "Ngounou",
    dateOfBirth: "1990-05-30",
    phone: "+237677123456",
    email: "marie.ngounou@email.com",
    address: "Yaoundé, Centre Region, Cameroon",
    bloodType: "B+",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-12-20",
    pregnancyWeek: 12,
    medicalHistory: "Second pregnancy. Previous normal delivery.",
    notes: "Speaks French and Ewondo. Central African cultural background."
  },
  
  // Central Africa - DRC
  {
    firstName: "Angèle",
    lastName: "Kabila",
    dateOfBirth: "1988-10-07",
    phone: "+243812345678",
    email: "angele.kabila@email.com",
    address: "Kinshasa, Kinshasa, DRC",
    bloodType: "O+",
    riskLevel: "medium",
    isPregnant: false,
    medicalHistory: "History of malaria. Regular preventive treatment.",
    notes: "Speaks French and Lingala. Urban Kinshasa environment."
  },
  
  // Additional diverse patients
  {
    firstName: "Khadija",
    lastName: "Mwalimu",
    dateOfBirth: "1991-04-16",
    phone: "+255754321098",
    email: "khadija.mwalimu@email.com",
    address: "Mwanza, Mwanza Region, Tanzania",
    bloodType: "A+",
    riskLevel: "low",
    isPregnant: true,
    dueDate: "2024-08-25",
    pregnancyWeek: 26,
    medicalHistory: "First pregnancy. Lives near Lake Victoria.",
    notes: "Speaks Swahili. Fishing community background."
  },
  
  {
    firstName: "Esperance",
    lastName: "Mukandayisenga",
    dateOfBirth: "1987-09-12",
    phone: "+250783456789",
    email: "esperance.mukandayisenga@email.com",
    address: "Butare, Southern Province, Rwanda",
    bloodType: "B-",
    riskLevel: "medium",
    isPregnant: false,
    medicalHistory: "Previous miscarriage. Needs careful monitoring.",
    notes: "Speaks Kinyarwanda. Rural southern Rwanda."
  },
  
  {
    firstName: "Tendai",
    lastName: "Chirenje",
    dateOfBirth: "1989-11-28",
    phone: "+263773456789",
    email: "tendai.chirenje@email.com",
    address: "Bulawayo, Bulawayo Province, Zimbabwe",
    bloodType: "O-",
    riskLevel: "high",
    isPregnant: true,
    dueDate: "2024-09-15",
    pregnancyWeek: 25,
    medicalHistory: "High-risk pregnancy due to age and previous complications.",
    notes: "Speaks Ndebele and English. Industrial city background."
  }
];

async function addDiversePatients() {
  console.log('🌍 Starting to add diverse Sub-Saharan African patients...');
  
  try {
    const patientsRef = collection(db, 'patients');
    
    for (let i = 0; i < diversePatients.length; i++) {
      const patient = diversePatients[i];
      
      // Add timestamps
      const patientWithTimestamps = {
        ...patient,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(patientsRef, patientWithTimestamps);
      console.log(`✅ Added patient ${i + 1}/${diversePatients.length}: ${patient.firstName} ${patient.lastName} from ${patient.address.split(',').pop().trim()} (ID: ${docRef.id})`);
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Successfully added ${diversePatients.length} diverse patients from across Sub-Saharan Africa!`);
    console.log('📊 Coverage includes:');
    console.log('   - East Africa: Rwanda, Kenya, Ethiopia, Tanzania');
    console.log('   - West Africa: Ghana, Senegal, Nigeria');
    console.log('   - Southern Africa: South Africa, Zimbabwe, Botswana');
    console.log('   - Central Africa: Cameroon, DRC');
    console.log('\n🏥 Risk levels distributed: Low, Medium, and High risk patients');
    console.log('🤰 Pregnancy status: Mix of pregnant and non-pregnant patients');
    console.log('🩸 Blood types: Various blood types represented');
    console.log('\n🌐 Visit your app at http://localhost:3001/patients to see the diverse patient list!');
    
  } catch (error) {
    console.error('❌ Error adding patients:', error);
  }
}

// Run the script
addDiversePatients().then(() => {
  console.log('\n✨ Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 