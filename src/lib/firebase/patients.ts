import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Patient interface
export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: any;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  riskLevel?: string;
  medicalHistory?: string;
  notes?: string;
  // Pregnancy related fields
  isPregnant?: boolean;
  dueDate?: any;
  pregnancyWeek?: number;
  // Calculated fields
  age?: number;
  lastVisit?: any;
  nextVisit?: any;
}

// Add a new patient
export const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // If patient is classified as high-risk, create an alert
    if (patientData.riskLevel === 'high') {
      try {
        const patientName = `${patientData.firstName} ${patientData.lastName}`;
        
        // Import the alert function dynamically to avoid circular imports
        const { createHighRiskAlert } = await import('./alerts');
        
        // Determine risk factors
        const riskFactors: string[] = [];
        if (patientData.isPregnant) riskFactors.push('pregnancy complications');
        if (patientData.medicalHistory?.toLowerCase().includes('hypertension')) riskFactors.push('hypertension');
        if (patientData.medicalHistory?.toLowerCase().includes('diabetes')) riskFactors.push('diabetes');
        if (patientData.medicalHistory?.toLowerCase().includes('heart')) riskFactors.push('cardiac history');
        
        await createHighRiskAlert(docRef.id, patientName, riskFactors);
        console.log(`Auto-created high-risk alert for new patient: ${patientName}`);
      } catch (alertError) {
        console.error('Failed to create high-risk alert for new patient:', alertError);
        // Don't fail the patient creation if alert creation fails
      }
    }
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to add patient'
    };
  }
};

// Update a patient
export const updatePatient = async (id: string, patientData: Partial<Patient>) => {
  try {
    // Check if risk level is being updated to 'high'
    const isNewHighRisk = patientData.riskLevel === 'high';
    
    // Get current patient data to check previous risk level
    let previousRiskLevel = null;
    if (isNewHighRisk) {
      const currentPatientResult = await getPatient(id);
      if (currentPatientResult.success && currentPatientResult.patient) {
        previousRiskLevel = currentPatientResult.patient.riskLevel;
      }
    }
    
    const patientRef = doc(db, 'patients', id);
    await updateDoc(patientRef, {
      ...patientData,
      updatedAt: serverTimestamp()
    });
    
    // If patient is newly classified as high-risk, create an alert
    if (isNewHighRisk && previousRiskLevel !== 'high') {
      try {
        // Get updated patient data to get the name
        const updatedPatientResult = await getPatient(id);
        if (updatedPatientResult.success && updatedPatientResult.patient) {
          const patient = updatedPatientResult.patient;
          const patientName = `${patient.firstName} ${patient.lastName}`;
          
          // Import the alert function dynamically to avoid circular imports
          const { createHighRiskAlert } = await import('./alerts');
          
          // Determine risk factors
          const riskFactors: string[] = [];
          if (patient.isPregnant) riskFactors.push('pregnancy complications');
          if (patient.medicalHistory?.toLowerCase().includes('hypertension')) riskFactors.push('hypertension');
          if (patient.medicalHistory?.toLowerCase().includes('diabetes')) riskFactors.push('diabetes');
          if (patient.medicalHistory?.toLowerCase().includes('heart')) riskFactors.push('cardiac history');
          
          await createHighRiskAlert(id, patientName, riskFactors);
          console.log(`Auto-created high-risk alert for patient: ${patientName}`);
        }
      } catch (alertError) {
        console.error('Failed to create high-risk alert:', alertError);
        // Don't fail the patient update if alert creation fails
      }
    }
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to update patient'
    };
  }
};

// Get a patient by ID
export const getPatient = async (id: string) => {
  try {
    const patientRef = doc(db, 'patients', id);
    const patientSnapshot = await getDoc(patientRef);
    
    if (!patientSnapshot.exists()) {
      return { 
        success: false, 
        error: 'Patient not found'
      };
    }
    
    const patientData = patientSnapshot.data();
    return { 
      success: true, 
      patient: { id: patientSnapshot.id, ...patientData } as Patient
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get patient'
    };
  }
};

// Get all patients
export const getPatients = async () => {
  try {
    const patientsQuery = query(
      collection(db, 'patients'),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      patients.push({ id: doc.id, ...doc.data() } as Patient);
    });
    
    return { success: true, patients };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get patients'
    };
  }
};

// Get high-risk patients
export const getHighRiskPatients = async () => {
  try {
    const patientsQuery = query(
      collection(db, 'patients'),
      where('riskLevel', '==', 'high'),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      patients.push({ id: doc.id, ...doc.data() } as Patient);
    });
    
    return { success: true, patients };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get high-risk patients'
    };
  }
};

// Get patients due for checkup
export const getPatientsWithUpcomingVisits = async (days: number = 7) => {
  try {
    // Get current date
    const now = new Date();
    // Get date 7 days from now
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    // Format dates to string for comparison
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];
    
    const patientsQuery = query(
      collection(db, 'patients'),
      where('nextVisit', '>=', todayStr),
      where('nextVisit', '<=', futureDateStr),
      orderBy('nextVisit', 'asc')
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      patients.push({ id: doc.id, ...doc.data() } as Patient);
    });
    
    return { success: true, patients };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get patients with upcoming visits'
    };
  }
};

// Delete a patient permanently
export const deletePatient = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'patients', id));
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to delete patient'
    };
  }
}; 