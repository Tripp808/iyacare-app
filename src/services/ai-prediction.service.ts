export interface PredictionRequest {
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
}

export interface PredictionResponse {
  predicted_risk: string;
  confidence: number;
  probability_distribution: {
    'low risk': number;
    'mid risk': number;
    'high risk': number;
  };
  risk_factors: string[];
  recommendations: string[];
}

export interface BatchPredictionResponse {
  predictions: (PredictionResponse | { error: string })[];
}

class AIPredictionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
  }

  async predictRisk(data: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Prediction failed: ${errorData.detail || response.statusText}`);
      }

      const result: PredictionResponse = await response.json();
      return result;
    } catch (error) {
      console.error('AI Prediction Error:', error);
      throw error;
    }
  }

  async batchPredict(requests: PredictionRequest[]): Promise<BatchPredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/batch-predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requests),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Batch prediction failed: ${errorData.detail || response.statusText}`);
      }

      const result: BatchPredictionResponse = await response.json();
      return result;
    } catch (error) {
      console.error('AI Batch Prediction Error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service Health Check Error:', error);
      throw error;
    }
  }

  // Helper method to extract vital signs from patient data
  extractVitalSigns(patient: any, latestVitals?: any): PredictionRequest | null {
    try {
      // Calculate age from date of birth
      const age = patient.dateOfBirth ? 
        new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 
        patient.age || 25; // Default age if not available

      // Use latest vitals or default values
      const vitals = latestVitals || {};
      
      // Parse blood pressure if it's in "120/80" format
      let systolic_bp = 120;
      let diastolic_bp = 80;
      
      if (vitals.bloodPressure && typeof vitals.bloodPressure === 'string') {
        const bpParts = vitals.bloodPressure.split('/');
        if (bpParts.length === 2) {
          systolic_bp = parseFloat(bpParts[0]) || 120;
          diastolic_bp = parseFloat(bpParts[1]) || 80;
        }
      } else {
        systolic_bp = vitals.systolic_bp || vitals.systolicBP || 120;
        diastolic_bp = vitals.diastolic_bp || vitals.diastolicBP || 80;
      }

      return {
        age: age,
        systolic_bp: systolic_bp,
        diastolic_bp: diastolic_bp,
        blood_sugar: vitals.blood_sugar || vitals.bloodSugar || vitals.BS || 6.0,
        body_temp: vitals.body_temp || vitals.bodyTemp || vitals.temperature || 98.6,
        heart_rate: vitals.heart_rate || vitals.heartRate || 70,
      };
    } catch (error) {
      console.error('Error extracting vital signs:', error);
      return null;
    }
  }

  // Helper method to map risk level to color/styling
  getRiskStyling(riskLevel: string) {
    const risk = riskLevel.toLowerCase();
    
    switch (risk) {
      case 'low risk':
        return {
          color: 'green',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'mid risk':
      case 'medium risk':
        return {
          color: 'yellow',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
        };
      case 'high risk':
        return {
          color: 'red',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      default:
        return {
          color: 'gray',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
        };
    }
  }
}

export const aiPredictionService = new AIPredictionService(); 