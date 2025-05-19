import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Referral interface
export interface Referral {
  id?: string;
  patientId: string;
  patientName: string;
  referredFrom: string; // Facility/Doctor name
  referredTo: string; // Facility/Doctor name
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  notes?: string;
  medicalHistory?: string;
  createdAt?: any;
  updatedAt?: any;
  acceptedAt?: any;
  completedAt?: any;
}

// Add a new referral
export const addReferral = async (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  try {
    const docRef = await addDoc(collection(db, 'referrals'), {
      ...referralData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to add referral'
    };
  }
};

// Update a referral
export const updateReferral = async (id: string, referralData: Partial<Referral>) => {
  try {
    const referralRef = doc(db, 'referrals', id);
    await updateDoc(referralRef, {
      ...referralData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to update referral'
    };
  }
};

// Update referral status
export const updateReferralStatus = async (id: string, status: Referral['status']) => {
  try {
    const referralRef = doc(db, 'referrals', id);
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // Add timestamp for the status change
    if (status === 'accepted') {
      updateData.acceptedAt = serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }
    
    await updateDoc(referralRef, updateData);
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to update referral status'
    };
  }
};

// Get a referral by ID
export const getReferral = async (id: string) => {
  try {
    const referralRef = doc(db, 'referrals', id);
    const referralSnapshot = await getDoc(referralRef);
    
    if (!referralSnapshot.exists()) {
      return { 
        success: false, 
        error: 'Referral not found'
      };
    }
    
    const referralData = referralSnapshot.data();
    return { 
      success: true, 
      referral: { id: referralSnapshot.id, ...referralData } as Referral
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get referral'
    };
  }
};

// Get all referrals
export const getReferrals = async (status?: Referral['status']) => {
  try {
    let referralsQuery;
    
    if (status) {
      // Get referrals with specific status
      referralsQuery = query(
        collection(db, 'referrals'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all referrals
      referralsQuery = query(
        collection(db, 'referrals'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(referralsQuery);
    const referrals: Referral[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      referrals.push({ id: doc.id, ...doc.data() } as Referral);
    });
    
    return { success: true, referrals };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get referrals'
    };
  }
};

// Get referrals for a specific patient
export const getPatientReferrals = async (patientId: string) => {
  try {
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(referralsQuery);
    const referrals: Referral[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      referrals.push({ id: doc.id, ...doc.data() } as Referral);
    });
    
    return { success: true, referrals };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get patient referrals'
    };
  }
}; 