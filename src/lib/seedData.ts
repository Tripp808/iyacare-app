import { db } from './firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from './firebase/alerts';
import { Patient } from './firebase/patients';

// Seed test data for development purposes
export async function seedTestData() {
  try {
    // Add sample patients if they don't exist
    const patients = await seedSamplePatients();
    
    // Add sample alerts using the first patient
    if (patients.length > 0) {
      await seedSampleAlerts(patients[0]);
    }
    
    console.log('Sample data seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error };
  }
}

// Seed sample patients
async function seedSamplePatients(): Promise<Patient[]> {
  const samplePatients: Omit<Patient, 'id'>[] = [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-05-15'),
      phone: '555-123-4567',
      email: 'sarah.johnson@example.com',
      address: '123 Main St, Anytown, CA 12345',
      bloodType: 'O+',
      riskLevel: 'medium',
      isPregnant: true,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      medicalHistory: 'Previous C-section in 2018.',
      notes: 'Patient prefers afternoon appointments due to morning sickness.'
    },
    {
      firstName: 'Emily',
      lastName: 'Williams',
      dateOfBirth: new Date('1988-08-23'),
      phone: '555-987-6543',
      email: 'emily.williams@example.com',
      address: '456 Oak Dr, Springfield, CA 54321',
      bloodType: 'A-',
      riskLevel: 'high',
      isPregnant: true,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      medicalHistory: 'History of gestational diabetes, hypertension.',
      notes: 'Weekly monitoring recommended.'
    }
  ];
  
  const addedPatients: Patient[] = [];
  
  for (const patientData of samplePatients) {
    try {
      const patientRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: serverTimestamp()
      });
      
      addedPatients.push({
        id: patientRef.id,
        ...patientData
      });
      
      console.log(`Added patient: ${patientData.firstName} ${patientData.lastName}`);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  }
  
  return addedPatients;
}

// Seed sample alerts
async function seedSampleAlerts(patient: Patient): Promise<void> {
  if (!patient || !patient.id) {
    console.error('Cannot seed alerts: Invalid patient');
    return;
  }
  
  const sampleAlerts: Omit<Alert, 'id' | 'read' | 'createdAt'>[] = [
    {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      message: 'Patient blood pressure reading is elevated. Schedule follow-up appointment.',
      type: 'risk',
      priority: 'high',
    },
    {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      message: 'Reminder: Patient is due for glucose screening test.',
      type: 'appointment',
      priority: 'medium',
    },
    {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      message: 'Prenatal vitamin prescription needs renewal.',
      type: 'medication',
      priority: 'low',
    }
  ];
  
  for (const alertData of sampleAlerts) {
    try {
      await addDoc(collection(db, 'alerts'), {
        ...alertData,
        read: false,
        createdAt: serverTimestamp()
      });
      
      console.log(`Added alert for ${alertData.patientName}: ${alertData.type} (${alertData.priority})`);
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  }
} 