import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCvlfGLVtfvAWIONgalq1Nv7rNbAvP_TDE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "iyacare.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iyacare",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "iyacare.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1093409071155",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1093409071155:web:bb070eb164529e61b8c346",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6YBNE3TQW6",
  databaseURL: "https://iyacare-default-rtdb.firebaseio.com/"
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database
export const realtimeDb = getDatabase(app);

// Real-time IoT data interface matching your Firebase structure
export interface IoTReading {
  BodyTemperature: number;
  DiastolicBP: number;
  HeartRate: number;
  SystolicBP: number;
  timestamp: number;
}

export interface ConnectionStatus {
  connection: string;
}

export interface RealtimeData {
  readings: IoTReading;
  test: ConnectionStatus;
}

// AI Prediction interface matching the AI service
export interface AIPrediction {
  risk_level: 'low risk' | 'mid risk' | 'high risk';
  confidence: number;
  probabilities: {
    'low risk': number;
    'mid risk': number;
    'high risk': number;
  };
  score: number;
  timestamp: string;
}

// Service for managing real-time IoT data
export class RealtimeIoTService {
  private static listeners: Map<string, () => void> = new Map();

  // Subscribe to real-time readings from your ESP32 device
  static subscribeToIoTReadings(
    callback: (data: IoTReading | null) => void
  ): () => void {
    const readingsRef = ref(realtimeDb, '/readings');
    
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transform the data to match our interface
        const reading: IoTReading = {
          BodyTemperature: data.BodyTemperature || 0,
          DiastolicBP: data.DiastolicBP || 0,
          HeartRate: data.HeartRate || 0,
          SystolicBP: data.SystolicBP || 0,
          timestamp: data.timestamp || Date.now()
        };
        callback(reading);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to IoT readings:', error);
      callback(null);
    });

    // Store the listener for cleanup
    this.listeners.set('iot_readings', unsubscribe);

    // Return unsubscribe function
    return () => {
      off(readingsRef);
      this.listeners.delete('iot_readings');
    };
  }

  // Subscribe to connection status
  static subscribeToConnectionStatus(
    callback: (status: string | null) => void
  ): () => void {
    const statusRef = ref(realtimeDb, '/test/connection');
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      callback(status);
    }, (error) => {
      console.error('Error subscribing to connection status:', error);
      callback(null);
    });

    this.listeners.set('connection_status', unsubscribe);

    return () => {
      off(statusRef);
      this.listeners.delete('connection_status');
    };
  }

  // Get AI-powered risk assessment based on vitals
  static async getAIPrediction(reading: IoTReading, patientAge: number = 28): Promise<AIPrediction> {
    try {
      // Convert temperature from Fahrenheit to Celsius
      const tempCelsius = (reading.BodyTemperature - 32) * 5/9;
      
      // Prepare data for AI model
      const requestData = {
        age: patientAge,
        systolic_bp: reading.SystolicBP,
        diastolic_bp: reading.DiastolicBP,
        blood_sugar: 90, // Default value since ESP32 doesn't measure this
        body_temp: tempCelsius,
        heart_rate: reading.HeartRate,
      };

      // Call the AI service
      const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${aiServiceUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const prediction = await response.json();
      
      // Ensure we return the correct format
      return {
        risk_level: prediction.risk_level || prediction.predicted_risk || 'mid risk',
        confidence: prediction.confidence || 0.8,
        probabilities: prediction.probabilities || prediction.probability_distribution || {
          'low risk': 0.3,
          'mid risk': 0.5,
          'high risk': 0.2
        },
        score: prediction.score || 50,
        timestamp: prediction.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI Prediction Error:', error);
      
      // Fallback to rule-based assessment if AI service is unavailable
      return this.getFallbackRiskAssessment(reading);
    }
  }

  // Fallback rule-based assessment (when AI service is unavailable)
  static getFallbackRiskAssessment(reading: IoTReading): AIPrediction {
    let riskScore = 0;

    // Temperature assessment (normal: 36-37.5°C, converted from Fahrenheit)
    const tempCelsius = (reading.BodyTemperature - 32) * 5/9;
    if (tempCelsius > 38.5) {
      riskScore += 3;
    } else if (tempCelsius > 37.5) {
      riskScore += 1;
    } else if (tempCelsius < 35) {
      riskScore += 2;
    }

    // Blood pressure assessment
    if (reading.SystolicBP > 140 || reading.DiastolicBP > 90) {
      riskScore += 2;
    } else if (reading.SystolicBP > 130 || reading.DiastolicBP > 80) {
      riskScore += 1;
    } else if (reading.SystolicBP < 90 || reading.DiastolicBP < 60) {
      riskScore += 2;
    }

    // Heart rate assessment (normal: 60-100 bpm)
    if (reading.HeartRate > 100) {
      riskScore += 1;
    } else if (reading.HeartRate < 60) {
      riskScore += 1;
    }

    // Determine risk level
    let risk_level: 'low risk' | 'mid risk' | 'high risk';
    if (riskScore >= 5) {
      risk_level = 'high risk';
    } else if (riskScore >= 3) {
      risk_level = 'high risk';
    } else if (riskScore >= 1) {
      risk_level = 'mid risk';
    } else {
      risk_level = 'low risk';
    }

    const confidence = Math.min(95, 60 + (riskScore * 10)) / 100;

    return {
      risk_level,
      confidence,
      probabilities: {
        'low risk': risk_level === 'low risk' ? 0.8 : 0.1,
        'mid risk': risk_level === 'mid risk' ? 0.8 : 0.3,
        'high risk': risk_level === 'high risk' ? 0.8 : 0.1,
      },
      score: riskScore * 20,
      timestamp: new Date().toISOString(),
    };
  }

  // Legacy method for backward compatibility (now uses AI)
  static assessRisk(reading: IoTReading): {
    level: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    factors: string[];
  } {
    // This is now just a synchronous wrapper - for real AI, use getAIPrediction
    const fallback = this.getFallbackRiskAssessment(reading);
    
    // Convert AI format to legacy format
    let level: 'low' | 'medium' | 'high' | 'critical';
    switch (fallback.risk_level) {
      case 'low risk':
        level = 'low';
        break;
      case 'mid risk':
        level = 'medium';
        break;
      case 'high risk':
        level = 'high';
        break;
      default:
        level = 'medium';
    }

    return {
      level,
      confidence: fallback.confidence * 100,
      factors: this.getFactorsFromReading(reading),
    };
  }

  // Helper method to get readable factors
  static getFactorsFromReading(reading: IoTReading): string[] {
    const factors: string[] = [];
    const tempCelsius = (reading.BodyTemperature - 32) * 5/9;

    if (tempCelsius > 38.5) {
      factors.push('High fever detected');
    } else if (tempCelsius > 37.5) {
      factors.push('Elevated temperature');
    } else if (tempCelsius < 35) {
      factors.push('Low body temperature');
    }

    if (reading.SystolicBP > 140 || reading.DiastolicBP > 90) {
      factors.push('High blood pressure (Hypertension)');
    } else if (reading.SystolicBP > 130 || reading.DiastolicBP > 80) {
      factors.push('Elevated blood pressure');
    } else if (reading.SystolicBP < 90 || reading.DiastolicBP < 60) {
      factors.push('Low blood pressure (Hypotension)');
    }

    if (reading.HeartRate > 100) {
      factors.push('Elevated heart rate (Tachycardia)');
    } else if (reading.HeartRate < 60) {
      factors.push('Low heart rate (Bradycardia)');
    }

    return factors;
  }

  // Clean up all listeners
  static cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  // Get connection status
  static checkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const connectedRef = ref(realtimeDb, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        resolve(snapshot.val() === true);
      });
    });
  }
}

export default RealtimeIoTService;
