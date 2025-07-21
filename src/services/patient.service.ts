import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPatients } from '@/lib/firebase/patients';

export interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age?: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo: {
    bloodType?: string;
    allergies: string[];
    medications: string[];
    previousComplications: string[];
    chronicConditions: string[];
    lastMenstrualPeriod?: Date;
    gestationalAge?: number; // in weeks
    pregnancyNotes?: string;
  };
  assignedHealthcareProvider: string; // User ID
  createdBy: string; // User ID who created the patient record
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  isActive: boolean;
}

export interface VitalSigns {
  id?: string;
  patientId: string;
  timestamp: Timestamp | Date;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  deviceId?: string;
  recordedBy: string;
  notes?: string;
  aiPrediction?: {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    confidence: number;
    factors: string[];
    recommendation: string;
    predictedAt: Date;
    modelVersion: string;
  };
  createdAt?: Timestamp | Date;
}

export interface HealthRecord {
  id?: string;
  patientId: string;
  date: Date;
  type: 'checkup' | 'emergency' | 'consultation' | 'lab_results' | 'imaging';
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  notes?: string;
  healthcareProvider: string;
  createdAt?: Date;
}

type PatientResponse = {
  success: boolean;
  error?: string;
  patients?: Patient[];
  patient?: Patient;
};

export class PatientService {
  /**
   * Create a new patient
   */
  static async createPatient(
    patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'>
  ): Promise<PatientResponse> {
    try {
      // Calculate age from date of birth
      const age = this.calculateAge(patientData.dateOfBirth);
      
      const patientWithDefaults = {
        ...patientData,
        age,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'patients'), patientWithDefaults);

      return {
        success: true,
        patient: {
          ...patientWithDefaults,
          id: docRef.id,
        } as Patient
      };
    } catch (error: any) {
      console.error('Error creating patient:', error);
      return {
        success: false,
        error: 'Failed to create patient'
      };
    }
  }

  /**
   * Get patient by ID
   */
  static async getPatientById(patientId: string): Promise<PatientResponse> {
    try {
      const docRef = doc(db, 'patients', patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const patient: Patient = {
          id: docSnap.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth.toDate(),
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address,
          emergencyContact: data.emergencyContact,
          medicalInfo: {
            ...data.medicalInfo,
            lastMenstrualPeriod: data.medicalInfo.lastMenstrualPeriod?.toDate(),
          },
          assignedHealthcareProvider: data.assignedHealthcareProvider,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isActive: data.isActive,
        };

        return {
          success: true,
          patient
        };
      } else {
        return {
          success: false,
          error: 'Patient not found'
        };
      }
    } catch (error: any) {
      console.error('Error getting patient:', error);
      return {
        success: false,
        error: 'Failed to retrieve patient'
      };
    }
  }

  /**
   * Get all patients for a healthcare provider
   */
  static async getPatientsByProvider(
    providerId: string, 
    limitCount: number = 50
  ): Promise<PatientResponse> {
    try {
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedHealthcareProvider', '==', providerId),
        where('isActive', '==', true),
        orderBy('firstName', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(patientsQuery);
      const patients: Patient[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth.toDate(),
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address,
          emergencyContact: data.emergencyContact,
          medicalInfo: {
            ...data.medicalInfo,
            lastMenstrualPeriod: data.medicalInfo.lastMenstrualPeriod?.toDate(),
          },
          assignedHealthcareProvider: data.assignedHealthcareProvider,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isActive: data.isActive,
        });
      });

      return {
        success: true,
        patients
      };
    } catch (error: any) {
      console.error('Error getting patients by provider:', error);
      return {
        success: false,
        error: 'Failed to retrieve patients'
      };
    }
  }

  /**
   * Update patient information
   */
  static async updatePatient(
    patientId: string,
    updates: Partial<Omit<Patient, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<PatientResponse> {
    try {
      // If date of birth is being updated, recalculate age
      if (updates.dateOfBirth) {
        updates.age = this.calculateAge(updates.dateOfBirth);
      }

      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'patients', patientId), updatesWithTimestamp);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error updating patient:', error);
      return {
        success: false,
        error: 'Failed to update patient'
      };
    }
  }

  /**
   * Update patient risk level from AI prediction
   */
  static async updatePatientRiskLevel(
    patientId: string,
    riskLevel: string,
    confidence?: number,
    source = 'AI_PREDICTION'
  ): Promise<PatientResponse> {
    try {
      console.log(`🔄 Updating patient ${patientId} risk level to: ${riskLevel} (confidence: ${confidence || 'N/A'})`);
      
      // Normalize risk level to match dashboard expectations
      let normalizedRiskLevel = riskLevel.toLowerCase();
      if (normalizedRiskLevel.includes('mid') || normalizedRiskLevel.includes('medium')) {
        normalizedRiskLevel = 'medium';
      } else if (normalizedRiskLevel.includes('high')) {
        normalizedRiskLevel = 'high';
      } else if (normalizedRiskLevel.includes('low')) {
        normalizedRiskLevel = 'low';
      }

      const updateData = {
        riskLevel: normalizedRiskLevel,
        riskAssessment: {
          level: normalizedRiskLevel,
          confidence: confidence || 0,
          source,
          lastUpdated: new Date(),
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'patients', patientId), updateData);

      console.log(`✅ Successfully updated patient ${patientId} risk level to: ${normalizedRiskLevel}`);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Error updating patient risk level:', error);
      return {
        success: false,
        error: 'Failed to update patient risk level'
      };
    }
  }

  /**
   * Bulk update patient risk levels from AI predictions
   */
  static async bulkUpdatePatientRiskLevels(
    predictions: Array<{ patientId: string; riskLevel: string; confidence?: number }>
  ): Promise<{ success: boolean; updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    console.log(`🔄 Starting bulk update of ${predictions.length} patient risk levels...`);

    for (const prediction of predictions) {
      const result = await this.updatePatientRiskLevel(
        prediction.patientId,
        prediction.riskLevel,
        prediction.confidence
      );
      
      if (result.success) {
        updated++;
      } else {
        errors++;
      }
    }

    console.log(`✅ Bulk update completed: ${updated} updated, ${errors} errors`);

    return {
      success: true,
      updated,
      errors
    };
  }

  /**
   * Soft delete a patient (mark as inactive)
   */
  static async deactivatePatient(patientId: string): Promise<PatientResponse> {
    try {
      await updateDoc(doc(db, 'patients', patientId), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error deactivating patient:', error);
      return {
        success: false,
        error: 'Failed to deactivate patient'
      };
    }
  }

  /**
   * Search patients by name
   */
  static async searchPatients(
    searchTerm: string,
    providerId?: string
  ): Promise<PatientResponse> {
    try {
      // Note: This is a simple search. For more advanced search functionality,
      // consider using Algolia or similar search service
      let patientsQuery = query(
        collection(db, 'patients'),
        where('isActive', '==', true),
        orderBy('firstName'),
        limit(20)
      );

      if (providerId) {
        patientsQuery = query(
          collection(db, 'patients'),
          where('assignedHealthcareProvider', '==', providerId),
          where('isActive', '==', true),
          orderBy('firstName'),
          limit(20)
        );
      }
      
      const querySnapshot = await getDocs(patientsQuery);
      const patients: Patient[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fullName = `${data.firstName} ${data.lastName}`.toLowerCase();
        
        if (fullName.includes(searchTerm.toLowerCase())) {
          patients.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth.toDate(),
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalInfo: {
              ...data.medicalInfo,
              lastMenstrualPeriod: data.medicalInfo.lastMenstrualPeriod?.toDate(),
            },
            assignedHealthcareProvider: data.assignedHealthcareProvider,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
          });
        }
      });

      return {
        success: true,
        patients
      };
    } catch (error: any) {
      console.error('Error searching patients:', error);
      return {
        success: false,
        error: 'Failed to search patients'
      };
    }
  }

  /**
   * Get patient's gestational age in weeks
   */
  static getGestationalAge(patient: Patient): number | null {
    if (!patient.medicalInfo.lastMenstrualPeriod) {
      return patient.medicalInfo.gestationalAge || null;
    }

    const lmpDate = new Date(patient.medicalInfo.lastMenstrualPeriod);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lmpDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return diffWeeks;
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Add vital signs for a patient
   */
  static async addVitalSigns(vitalSigns: Omit<VitalSigns, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, 'vitalSigns'), {
        ...vitalSigns,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Check if vital signs trigger an alert
      await this.checkVitalSignsAlerts(vitalSigns);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Add vital signs error:', error);
      return { success: false, error: 'Failed to add vital signs' };
    }
  }

  /**
   * Get vital signs for a patient
   */
  static async getPatientVitalSigns(patientId: string, limitCount: number = 50): Promise<VitalSigns[]> {
    try {
      const vitalSignsQuery = query(
        collection(db, 'vitalSigns'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(vitalSignsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      } as VitalSigns));
    } catch (error: any) {
      console.error('Get patient vital signs error:', error);
      throw error;
    }
  }

  /**
   * Check if vital signs trigger alerts
   */
  private static async checkVitalSignsAlerts(vitalSigns: Omit<VitalSigns, 'id'>) {
    // Simple alert logic - in production this would be more sophisticated
    const alerts = [];

    if (vitalSigns.systolic > 140 || vitalSigns.diastolic > 90) {
      alerts.push({
        patientId: vitalSigns.patientId,
        type: 'vital_signs',
        severity: vitalSigns.systolic > 160 || vitalSigns.diastolic > 100 ? 'high' : 'medium',
        title: 'High Blood Pressure Alert',
        description: `Blood pressure reading: ${vitalSigns.systolic}/${vitalSigns.diastolic} mmHg`,
        timestamp: serverTimestamp(),
        resolved: false
      });
    }

    if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60) {
      alerts.push({
        patientId: vitalSigns.patientId,
        type: 'vital_signs',
        severity: vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50 ? 'high' : 'medium',
        title: 'Abnormal Heart Rate',
        description: `Heart rate: ${vitalSigns.heartRate} bpm`,
        timestamp: serverTimestamp(),
        resolved: false
      });
    }

    // Save alerts to database
    for (const alert of alerts) {
      await addDoc(collection(db, 'alerts'), alert);
    }
  }

  /**
   * Add health record
   */
  static async addHealthRecord(patientId: string, healthRecord: Omit<HealthRecord, 'id' | 'patientId' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, 'healthRecords'), {
        ...healthRecord,
        patientId,
        createdAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Add health record error:', error);
      return { success: false, error: 'Failed to add health record' };
    }
  }

  /**
   * Get health records for a patient
   */
  static async getPatientHealthRecords(patientId: string): Promise<HealthRecord[]> {
    try {
      const recordsQuery = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(recordsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      } as HealthRecord));
    } catch (error: any) {
      console.error('Get patient health records error:', error);
      throw error;
    }
  }

  /**
   * Fix patients with invalid ages by updating their records
   */
  static async fixPatientAges(): Promise<{ fixed: number; errors: number; details: string[] }> {
    try {
      console.log('🔧 Starting patient age fix process...');
      const result = await getPatients();
      
      if (!result.success || !result.patients) {
        return { fixed: 0, errors: 1, details: ['Failed to fetch patients'] };
      }

      const patients = result.patients;
      const details: string[] = [];
      let fixed = 0;
      let errors = 0;

      for (const patient of patients) {
        try {
          let needsUpdate = false;
          const updates: any = {};

          // Check if dateOfBirth is valid
          if (patient.dateOfBirth) {
            const birthDate = new Date(patient.dateOfBirth);
            
            if (isNaN(birthDate.getTime())) {
              // Invalid date - set to null and use default age
              updates.dateOfBirth = null;
              updates.age = 25; // Default age
              needsUpdate = true;
              details.push(`❌ ${patient.firstName} ${patient.lastName}: Invalid date of birth, set to default age 25`);
            } else {
              // Valid date - recalculate age
              const today = new Date();
              let calculatedAge = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
              }

              // Check if age is reasonable
              if (calculatedAge < 12 || calculatedAge > 80 || isNaN(calculatedAge)) {
                updates.age = 25; // Default age
                needsUpdate = true;
                details.push(`⚠️ ${patient.firstName} ${patient.lastName}: Unreasonable age (${calculatedAge}), set to default age 25`);
              } else if (patient.age !== calculatedAge) {
                updates.age = calculatedAge;
                needsUpdate = true;
                details.push(`✅ ${patient.firstName} ${patient.lastName}: Updated age from ${patient.age} to ${calculatedAge}`);
              }
            }
          } else {
            // No date of birth - ensure we have a default age
            if (!patient.age || isNaN(patient.age) || patient.age < 12 || patient.age > 80) {
              updates.age = 25;
              needsUpdate = true;
              details.push(`📅 ${patient.firstName} ${patient.lastName}: No valid date of birth, set default age 25`);
            }
          }

          // Update the patient if needed
          if (needsUpdate && patient.id) {
            const updateResult = await PatientService.updatePatient(patient.id, updates);
            if (updateResult.success) {
              fixed++;
            } else {
              errors++;
              details.push(`❌ Failed to update ${patient.firstName} ${patient.lastName}: ${updateResult.error}`);
            }
          }
        } catch (error) {
          errors++;
          details.push(`❌ Error processing ${patient.firstName} ${patient.lastName}: ${error}`);
        }
      }

      console.log(`🔧 Age fix completed: ${fixed} fixed, ${errors} errors`);
      return { fixed, errors, details };
    } catch (error: any) {
      console.error('❌ Error in fixPatientAges:', error);
      return { fixed: 0, errors: 1, details: [`Error: ${error.message}`] };
    }
  }
} 