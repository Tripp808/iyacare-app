export interface PredictionRequest {
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
}

export interface PredictionResponse {
  risk_level: string;
  confidence: number;
  details: {
    risk_score: number;
    risk_factors: string[];
    vital_signs: {
      age: number;
      systolic_bp: number;
      diastolic_bp: number;
      blood_sugar: number;
      body_temp: number;
      heart_rate: number;
    }
  };
}

export interface BatchPredictionResponse {
  predictions: (PredictionResponse | { error: string })[];
}

class AIPredictionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
    console.log('AI Prediction Service initialized with URL:', this.baseUrl);
    
    // Test the health endpoint on initialization
    this.testConnection();
  }

  private async testConnection() {
    try {
      console.log('Testing AI API connection...');
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        const health = await response.json();
        console.log('AI API health check:', health);
      } else {
        console.warn('AI API health check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('AI API connection test failed:', error);
    }
  }

  async predictRisk(data: PredictionRequest): Promise<PredictionResponse> {
    try {
      console.log('Making prediction request to:', `${this.baseUrl}/predict`);
      console.log('Request data:', data);
      
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Unknown error' };
        }
        
        const errorMessage = typeof errorData === 'object' 
          ? (errorData.detail || errorData.message || JSON.stringify(errorData))
          : errorData;
        throw new Error(`Prediction failed: ${errorMessage}`);
      }

      const result: PredictionResponse = await response.json();
      console.log('Prediction result:', result);
      return result;
    } catch (error) {
      console.error('Prediction error:', error);
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
      console.log('Extracting vital signs for patient:', patient);
      console.log('Latest vitals:', latestVitals);
      
      // Calculate age from date of birth with better error handling
      let age = 25; // Default age
      
      if (patient.dateOfBirth) {
        try {
          // Handle different date formats
          let birthDate;
          if (typeof patient.dateOfBirth === 'string') {
            birthDate = new Date(patient.dateOfBirth);
          } else if (patient.dateOfBirth.toDate) {
            // Firebase Timestamp
            birthDate = patient.dateOfBirth.toDate();
          } else {
            birthDate = new Date(patient.dateOfBirth);
          }
          
          // Validate the date
          if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            
            // Validate calculated age
            if (age < 0 || age > 120) {
              console.warn(`Invalid calculated age: ${age} for patient ${patient.firstName} ${patient.lastName}, using default`);
              age = 25;
            }
          } else {
            console.warn(`Invalid birth date for patient ${patient.firstName} ${patient.lastName}, using default age`);
            age = 25;
          }
        } catch (error) {
          console.warn(`Error parsing birth date for patient ${patient.firstName} ${patient.lastName}:`, error);
          age = 25;
        }
      } else if (patient.age && typeof patient.age === 'number' && !isNaN(patient.age)) {
        age = patient.age;
      }

      // Final validation for age
      if (!age || isNaN(age) || age < 1 || age > 120) {
        console.warn(`Final age validation failed for patient ${patient.firstName} ${patient.lastName}, using default age 25`);
        age = 25;
      }

      // Use latest vitals or default values
      const vitals = latestVitals || {};
      
      // Parse blood pressure if it's in "120/80" format
      let systolic_bp = 120;
      let diastolic_bp = 80;
      
      if (vitals.bloodPressure && typeof vitals.bloodPressure === 'string') {
        const bpParts = vitals.bloodPressure.split('/');
        if (bpParts.length === 2) {
          const systolicParsed = parseFloat(bpParts[0]);
          const diastolicParsed = parseFloat(bpParts[1]);
          if (!isNaN(systolicParsed) && !isNaN(diastolicParsed)) {
            systolic_bp = systolicParsed;
            diastolic_bp = diastolicParsed;
          }
        }
      } else {
        const systolicFromVitals = vitals.systolic_bp || vitals.systolicBP;
        const diastolicFromVitals = vitals.diastolic_bp || vitals.diastolicBP;
        
        if (systolicFromVitals && !isNaN(parseFloat(systolicFromVitals))) {
          systolic_bp = parseFloat(systolicFromVitals);
        }
        if (diastolicFromVitals && !isNaN(parseFloat(diastolicFromVitals))) {
          diastolic_bp = parseFloat(diastolicFromVitals);
        }
      }

      // Extract other vital signs with validation
      const bloodSugar = vitals.blood_sugar || vitals.bloodSugar || vitals.BS || 6.0;
      const temperature = vitals.body_temp || vitals.bodyTemp || vitals.temperature || 98.6;
      const heartRate = vitals.heart_rate || vitals.heartRate || 70;

      // Ensure all values are valid numbers with proper ranges
      const predictionData = {
        age: Math.max(1, Math.min(120, Number(age))),
        systolic_bp: Math.max(70, Math.min(250, Number(systolic_bp))),
        diastolic_bp: Math.max(40, Math.min(150, Number(diastolic_bp))),
        blood_sugar: Math.max(3.0, Math.min(30.0, Number(bloodSugar))),
        body_temp: Math.max(95.0, Math.min(110.0, Number(temperature))),
        heart_rate: Math.max(30, Math.min(200, Number(heartRate))),
      };

      console.log('Extracted prediction data:', predictionData);

      // Final validation - ensure all fields are valid numbers
      for (const [key, value] of Object.entries(predictionData)) {
        if (typeof value !== 'number' || isNaN(value)) {
          console.error(`Invalid ${key} value after processing:`, value);
          return null;
        }
      }

      return predictionData;
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