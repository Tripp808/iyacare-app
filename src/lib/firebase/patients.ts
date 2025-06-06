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
    const patientRef = doc(db, 'patients', id);
    await updateDoc(patientRef, {
      ...patientData,
      updatedAt: serverTimestamp()
    });
    
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