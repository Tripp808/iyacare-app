import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface VitalSigns {
  id?: string;
  patientId: string;
  patientName: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  aiRiskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
    recommendations: string[];
  };
  notes?: string;
  recordedBy: string;
  recordedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'vital_signs';

// Add new vital signs record
export async function addVitalSigns(vitals: Omit<VitalSigns, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now();
    const vitalSignsData = {
      ...vitals,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), vitalSignsData);
    
    // Generate AI risk assessment based on vital signs
    const aiAssessment = generateAIRiskAssessment(vitals);
    
    // Update the document with AI assessment
    await updateDoc(docRef, {
      aiRiskAssessment: aiAssessment,
      updatedAt: Timestamp.now()
    });

    return {
      success: true,
      id: docRef.id,
      data: { ...vitalSignsData, id: docRef.id, aiRiskAssessment: aiAssessment }
    };
  } catch (error) {
    console.error('Error adding vital signs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add vital signs'
    };
  }
}

// Get vital signs by patient ID
export async function getVitalSignsByPatientId(patientId: string, limitCount = 10) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('patientId', '==', patientId),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const vitals: VitalSigns[] = [];

    querySnapshot.forEach((doc) => {
      vitals.push({ id: doc.id, ...doc.data() } as VitalSigns);
    });

    // Sort by recordedAt in memory to avoid Firebase index requirement
    vitals.sort((a, b) => b.recordedAt.toMillis() - a.recordedAt.toMillis());

    return {
      success: true,
      vitals
    };
  } catch (error) {
    console.error('Error getting vital signs by patient ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get vital signs',
      vitals: []
    };
  }
}

// Get all vital signs (with optional filters)
export async function getAllVitalSigns(limitCount = 50) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('recordedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const vitals: VitalSigns[] = [];

    querySnapshot.forEach((doc) => {
      vitals.push({ id: doc.id, ...doc.data() } as VitalSigns);
    });

    return {
      success: true,
      vitals
    };
  } catch (error) {
    console.error('Error getting all vital signs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get vital signs',
      vitals: []
    };
  }
}

// Get vital signs by ID
export async function getVitalSignsById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        vitals: { id: docSnap.id, ...docSnap.data() } as VitalSigns
      };
    } else {
      return {
        success: false,
        error: 'Vital signs record not found'
      };
    }
  } catch (error) {
    console.error('Error getting vital signs by ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get vital signs'
    };
  }
}

// Update vital signs
export async function updateVitalSigns(id: string, updates: Partial<VitalSigns>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: 'Vital signs updated successfully'
    };
  } catch (error) {
    console.error('Error updating vital signs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vital signs'
    };
  }
}

// Delete vital signs
export async function deleteVitalSigns(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Vital signs deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting vital signs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete vital signs'
    };
  }
}

// AI Risk Assessment Algorithm
function generateAIRiskAssessment(vitals: Omit<VitalSigns, 'id' | 'createdAt' | 'updatedAt'>): VitalSigns['aiRiskAssessment'] {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Blood Pressure Assessment
  if (vitals.systolicBP >= 140 || vitals.diastolicBP >= 90) {
    score += 25;
    factors.push('Hypertension detected');
    recommendations.push('Monitor blood pressure closely, consider medication review');
  } else if (vitals.systolicBP >= 120 || vitals.diastolicBP >= 80) {
    score += 15;
    factors.push('Pre-hypertension detected');
    recommendations.push('Lifestyle modifications recommended');
  }

  // Heart Rate Assessment
  if (vitals.heartRate > 100) {
    score += 15;
    factors.push('Tachycardia detected');
    recommendations.push('Monitor heart rate, check for underlying causes');
  } else if (vitals.heartRate < 60) {
    score += 10;
    factors.push('Bradycardia detected');
    recommendations.push('Evaluate cardiac function');
  }

  // Temperature Assessment
  if (vitals.temperature >= 38.5) {
    score += 20;
    factors.push('High fever detected');
    recommendations.push('Immediate medical attention required');
  } else if (vitals.temperature >= 37.5) {
    score += 10;
    factors.push('Low-grade fever');
    recommendations.push('Monitor temperature, check for infection');
  } else if (vitals.temperature < 35) {
    score += 15;
    factors.push('Hypothermia detected');
    recommendations.push('Warming measures needed');
  }

  // Blood Sugar Assessment (assuming mmol/L)
  if (vitals.bloodSugar >= 11.1) {
    score += 25;
    factors.push('Severe hyperglycemia');
    recommendations.push('Immediate glucose management required');
  } else if (vitals.bloodSugar >= 7.8) {
    score += 15;
    factors.push('Hyperglycemia detected');
    recommendations.push('Diabetes management review needed');
  } else if (vitals.bloodSugar < 3.9) {
    score += 20;
    factors.push('Hypoglycemia detected');
    recommendations.push('Immediate glucose administration needed');
  }

  // Oxygen Saturation Assessment
  if (vitals.oxygenSaturation < 90) {
    score += 30;
    factors.push('Severe hypoxemia');
    recommendations.push('Immediate oxygen therapy required');
  } else if (vitals.oxygenSaturation < 95) {
    score += 15;
    factors.push('Mild hypoxemia');
    recommendations.push('Monitor respiratory status closely');
  }

  // Respiratory Rate Assessment
  if (vitals.respiratoryRate > 24) {
    score += 15;
    factors.push('Tachypnea detected');
    recommendations.push('Evaluate respiratory function');
  } else if (vitals.respiratoryRate < 12) {
    score += 10;
    factors.push('Bradypnea detected');
    recommendations.push('Monitor respiratory status');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 60) {
    riskLevel = 'critical';
    recommendations.push('URGENT: Immediate medical intervention required');
  } else if (score >= 40) {
    riskLevel = 'high';
    recommendations.push('High priority: Close monitoring and intervention needed');
  } else if (score >= 20) {
    riskLevel = 'medium';
    recommendations.push('Moderate concern: Regular monitoring recommended');
  } else {
    riskLevel = 'low';
    if (factors.length === 0) {
      factors.push('All vital signs within normal range');
      recommendations.push('Continue routine monitoring');
    }
  }

  return {
    riskLevel,
    score,
    factors,
    recommendations
  };
} 