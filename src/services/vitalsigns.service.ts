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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface VitalSigns {
  id?: string;
  patientId: string;
  timestamp: Date | Timestamp;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  recordedBy: string;
  notes?: string;
  createdAt?: Date | Timestamp;
  aiPrediction?: AIPrediction;
}

export interface AIPrediction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: string[];
  timestamp: Date | Timestamp;
  modelVersion?: string;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface VitalSignsListResponse {
  success: boolean;
  vitalSigns?: VitalSigns[];
  error?: string;
}

// External AI Model Configuration
const AI_MODEL_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_AI_MODEL_URL || 'http://localhost:8000', // Your FastAPI URL
  endpoint: '/predict',
  apiKey: process.env.NEXT_PUBLIC_AI_MODEL_API_KEY || '',
  timeout: 10000, // 10 seconds
};

export class VitalSignsService {
  private static collection = 'vitalsigns';

  /**
   * Call external AI model for risk prediction
   */
  private static async callAIModel(vitalSigns: Omit<VitalSigns, 'id' | 'createdAt' | 'aiPrediction'>): Promise<AIPrediction | null> {
    try {
      const requestData = {
        systolic: vitalSigns.systolic,
        diastolic: vitalSigns.diastolic,
        heart_rate: vitalSigns.heartRate,
        temperature: vitalSigns.temperature,
        weight: vitalSigns.weight,
        blood_sugar: vitalSigns.bloodSugar || null,
        oxygen_saturation: vitalSigns.oxygenSaturation || null,
        respiratory_rate: vitalSigns.respiratoryRate || null,
        patient_id: vitalSigns.patientId,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_MODEL_CONFIG.timeout);

      const response = await fetch(`${AI_MODEL_CONFIG.baseUrl}${AI_MODEL_CONFIG.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AI_MODEL_CONFIG.apiKey && { 'Authorization': `Bearer ${AI_MODEL_CONFIG.apiKey}` }),
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('AI Model API error:', response.status, response.statusText);
        return null;
      }

      const result = await response.json();

      return {
        riskLevel: result.risk_level || 'low',
        confidence: result.confidence || 0,
        factors: result.factors || ['AI prediction completed'],
        timestamp: new Date(),
        modelVersion: result.model_version || '1.0.0',
      };
    } catch (error) {
      console.error('Error calling AI model:', error);
      // Return null instead of fallback prediction - let the system handle missing predictions
      return null;
    }
  }

  /**
   * Add new vital signs with optional AI prediction
   */
  static async addVitalSigns(
    vitalSigns: Omit<VitalSigns, 'id' | 'createdAt' | 'aiPrediction'>, 
    generatePrediction: boolean = true
  ): Promise<ServiceResponse<VitalSigns>> {
    try {
      let aiPrediction: AIPrediction | null = null;

      // Call AI model if requested and configuration is available
      if (generatePrediction && AI_MODEL_CONFIG.baseUrl !== 'http://localhost:8000') {
        aiPrediction = await this.callAIModel(vitalSigns);
      }

      const dataToSave = {
        ...vitalSigns,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...(aiPrediction && { aiPrediction }),
      };

      const docRef = await addDoc(collection(db, this.collection), dataToSave);
      
      const savedVitalSigns: VitalSigns = {
        ...vitalSigns,
        id: docRef.id,
        timestamp: new Date(),
        createdAt: new Date(),
        ...(aiPrediction && { aiPrediction }),
      };

      return {
        success: true,
        data: savedVitalSigns,
      };
    } catch (error) {
      console.error('Error adding vital signs:', error);
      return {
        success: false,
        error: 'Failed to save vital signs',
      };
    }
  }

  /**
   * Get all vital signs
   */
  static async getAllVitalSigns(): Promise<VitalSignsListResponse> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const vitalSigns: VitalSigns[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vitalSigns.push({
          id: doc.id,
          ...data,
        } as VitalSigns);
      });

      return {
        success: true,
        vitalSigns,
      };
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return {
        success: false,
        error: 'Failed to fetch vital signs',
      };
    }
  }

  /**
   * Get vital signs for a specific patient
   */
  static async getPatientVitalSigns(patientId: string): Promise<VitalSignsListResponse> {
    try {
      const q = query(
        collection(db, this.collection),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const vitalSigns: VitalSigns[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vitalSigns.push({
          id: doc.id,
          ...data,
        } as VitalSigns);
      });

      return {
        success: true,
        vitalSigns,
      };
    } catch (error) {
      console.error('Error fetching patient vital signs:', error);
      return {
        success: false,
        error: 'Failed to fetch patient vital signs',
      };
    }
  }

  /**
   * Get recent vital signs (last N records)
   */
  static async getRecentVitalSigns(limitCount: number = 10): Promise<VitalSignsListResponse> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const vitalSigns: VitalSigns[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vitalSigns.push({
          id: doc.id,
          ...data,
        } as VitalSigns);
      });

      return {
        success: true,
        vitalSigns,
      };
    } catch (error) {
      console.error('Error fetching recent vital signs:', error);
      return {
        success: false,
        error: 'Failed to fetch recent vital signs',
      };
    }
  }

  /**
   * Update vital signs
   */
  static async updateVitalSigns(id: string, updates: Partial<VitalSigns>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, this.collection, id);
      await updateDoc(docRef, updates);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error updating vital signs:', error);
      return {
        success: false,
        error: 'Failed to update vital signs',
      };
    }
  }

  /**
   * Delete vital signs
   */
  static async deleteVitalSigns(id: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, this.collection, id);
      await deleteDoc(docRef);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting vital signs:', error);
      return {
        success: false,
        error: 'Failed to delete vital signs',
      };
    }
  }

  /**
   * Manually trigger AI prediction for existing vital signs
   */
  static async updateWithAIPrediction(id: string): Promise<ServiceResponse<AIPrediction>> {
    try {
      // First get the vital signs data
      const vitalSignsResult = await this.getAllVitalSigns();
      if (!vitalSignsResult.success || !vitalSignsResult.vitalSigns) {
        return {
          success: false,
          error: 'Failed to fetch vital signs for prediction',
        };
      }

      const vitalSign = vitalSignsResult.vitalSigns.find(vs => vs.id === id);
      if (!vitalSign) {
        return {
          success: false,
          error: 'Vital signs record not found',
        };
      }

      // Call AI model
      const aiPrediction = await this.callAIModel(vitalSign);
      if (!aiPrediction) {
        return {
          success: false,
          error: 'AI prediction failed',
        };
      }

      // Update the record
      await this.updateVitalSigns(id, { aiPrediction });

      return {
        success: true,
        data: aiPrediction,
      };
    } catch (error) {
      console.error('Error updating with AI prediction:', error);
      return {
        success: false,
        error: 'Failed to update with AI prediction',
      };
    }
  }
} 