interface PredictionRequest {
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
}

interface PredictionResponse {
  risk_level: 'low risk' | 'mid risk' | 'high risk';
  confidence: number;
  score: number;
  probabilities: {
    'low risk': number;
    'mid risk': number;
    'high risk': number;
  };
  timestamp: string;
}

// Legacy response format for backward compatibility
interface LegacyPredictionResponse {
  predicted_risk: 'low risk' | 'mid risk' | 'high risk';
  confidence: number;
  probability_distribution: {
    'low risk': number;
    'mid risk': number;
    'high risk': number;
  };
}

interface PatientVitals {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  bodyTemp: number;
  heartRate: number;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidValues: string[];
  recommendations: string[];
}

// Patient interface for extractVitalSigns method
interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | string;
  isPregnant?: boolean;
  [key: string]: any;
}

// Vital signs interface for extractVitalSigns method
interface VitalSignsData {
  systolic_bp?: number;
  diastolic_bp?: number;
  blood_sugar?: number;
  body_temp?: number;
  heart_rate?: number;
}

class AIPredictionService {
  private readonly baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Validate patient data for AI prediction
   */
  validatePatientData(patient: Patient, vitals?: VitalSignsData): ValidationResult {
    const missingFields: string[] = [];
    const invalidValues: string[] = [];
    const recommendations: string[] = [];

    // Calculate age
    let age = 0;
    if (!patient.dateOfBirth) {
      missingFields.push('Date of Birth');
      recommendations.push('📅 Add patient date of birth to calculate accurate age-based risk factors');
    } else {
        const birthDate = new Date(patient.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        invalidValues.push('Date of Birth (invalid format)');
        recommendations.push('📅 Correct the date of birth format');
      } else {
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 12 || age > 60) {
          invalidValues.push('Age (outside reasonable range: 12-60 years)');
          recommendations.push('🔍 Verify patient age - seems outside typical reproductive range');
        }
      }
    }

    // Validate vital signs
    const vitalsChecks = [
      {
        field: 'systolic_bp',
        value: vitals?.systolic_bp,
        min: 70,
        max: 250,
        name: 'Systolic Blood Pressure',
        unit: 'mmHg',
        typical: '90-140'
      },
      {
        field: 'diastolic_bp',
        value: vitals?.diastolic_bp,
        min: 40,
        max: 150,
        name: 'Diastolic Blood Pressure',
        unit: 'mmHg',
        typical: '60-90'
      },
      {
        field: 'blood_sugar',
        value: vitals?.blood_sugar,
        min: 50,
        max: 500,
        name: 'Blood Sugar',
        unit: 'mg/dL',
        typical: '70-140'
      },
      {
        field: 'body_temp',
        value: vitals?.body_temp,
        min: 32,
        max: 45,
        name: 'Body Temperature',
        unit: '°C',
        typical: '36-37.5'
      },
      {
        field: 'heart_rate',
        value: vitals?.heart_rate,
        min: 30,
        max: 200,
        name: 'Heart Rate',
        unit: 'bpm',
        typical: '60-100'
      }
    ];

    for (const check of vitalsChecks) {
      if (check.value === undefined || check.value === null) {
        missingFields.push(check.name);
        recommendations.push(`💓 Record ${check.name} (typical range: ${check.typical} ${check.unit})`);
      } else if (check.value < check.min || check.value > check.max) {
        invalidValues.push(`${check.name} (${check.value} ${check.unit} - outside valid range: ${check.min}-${check.max})`);
        recommendations.push(`⚠️ Verify ${check.name} reading - ${check.value} ${check.unit} seems unusual`);
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidValues.length === 0,
      missingFields,
      invalidValues,
      recommendations
    };
  }

  /**
   * Extract vital signs from patient data (for backward compatibility)
   */
  extractVitalSigns(patient: Patient, vitals?: VitalSignsData): PatientVitals | null {
    try {
      // Calculate age from date of birth with proper validation
      let age = 25; // Default age
      if (patient.dateOfBirth) {
        try {
          const birthDate = new Date(patient.dateOfBirth);
          // Check if the date is valid
          if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            const calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age = calculatedAge - 1;
            } else {
              age = calculatedAge;
            }
            
            // Ensure age is within reasonable bounds (avoid negative or extreme ages)
            if (age < 12 || age > 80 || isNaN(age)) {
              console.warn(`Invalid age calculated (${age}) for patient ${patient.firstName} ${patient.lastName}, using default age 25`);
              age = 25;
            }
          } else {
            console.warn(`Invalid date of birth for patient ${patient.firstName} ${patient.lastName}, using default age 25`);
          }
        } catch (dateError) {
          console.warn(`Error parsing date of birth for patient ${patient.firstName} ${patient.lastName}:`, dateError, 'using default age 25');
        }
      }

      // Ensure all vital signs are valid numbers
      const extractedVitals: PatientVitals = {
        age: age,
        systolicBP: vitals?.systolic_bp && !isNaN(vitals.systolic_bp) ? vitals.systolic_bp : 120,
        diastolicBP: vitals?.diastolic_bp && !isNaN(vitals.diastolic_bp) ? vitals.diastolic_bp : 80,
        bloodSugar: vitals?.blood_sugar && !isNaN(vitals.blood_sugar) ? vitals.blood_sugar : 90,
        bodyTemp: vitals?.body_temp && !isNaN(vitals.body_temp) ? vitals.body_temp : 36.5,
        heartRate: vitals?.heart_rate && !isNaN(vitals.heart_rate) ? vitals.heart_rate : 70,
      };

      console.log(`✅ Extracted vitals for ${patient.firstName} ${patient.lastName}:`, extractedVitals);
      return extractedVitals;
    } catch (error) {
      console.error('Error extracting vital signs:', error);
      return null;
    }
  }

  /**
   * Clamp value to safe range, use default if undefined
   */
  private clampValue(value: number | undefined, min: number, max: number, defaultValue: number): number {
    if (value === undefined || value === null || isNaN(value)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Get patient data completeness score
   */
  getDataCompletenessScore(patient: Patient, vitals?: VitalSignsData): {
    score: number;
    maxScore: number;
    percentage: number;
    details: string[];
  } {
    const details: string[] = [];
    let score = 0;
    const maxScore = 6; // Age + 5 vital signs

    // Check age/DOB
    if (patient.dateOfBirth) {
      score += 1;
      details.push('✅ Date of Birth recorded');
    } else {
      details.push('❌ Date of Birth missing');
    }

    // Check vitals
    const vitalChecks = [
      { name: 'Systolic BP', value: vitals?.systolic_bp },
      { name: 'Diastolic BP', value: vitals?.diastolic_bp },
      { name: 'Blood Sugar', value: vitals?.blood_sugar },
      { name: 'Body Temperature', value: vitals?.body_temp },
      { name: 'Heart Rate', value: vitals?.heart_rate }
    ];

    for (const check of vitalChecks) {
      if (check.value !== undefined && check.value !== null && !isNaN(check.value)) {
        score += 1;
        details.push(`✅ ${check.name} recorded`);
      } else {
        details.push(`❌ ${check.name} missing`);
      }
    }

    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      details
    };
  }

  /**
   * Legacy predictRisk method for backward compatibility
   */
  async predictRisk(vitals: PatientVitals): Promise<LegacyPredictionResponse> {
    try {
      const prediction = await this.predictMaternalRisk(vitals);
      
      // Convert to legacy format
      return {
        predicted_risk: prediction.risk_level,
        confidence: prediction.confidence,
        probability_distribution: prediction.probabilities,
      };
    } catch (error) {
      console.error('Legacy predict risk error:', error);
      throw error;
    }
  }

  /**
   * Get maternal health risk prediction for a patient
   */
  async predictMaternalRisk(vitals: PatientVitals): Promise<PredictionResponse> {
    try {
      const requestData: PredictionRequest = {
        age: vitals.age,
        systolic_bp: vitals.systolicBP,
        diastolic_bp: vitals.diastolicBP,
        blood_sugar: vitals.bloodSugar,
        body_temp: vitals.bodyTemp,
        heart_rate: vitals.heartRate,
      };

      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert legacy response format to new format if needed
      if (data.predicted_risk && !data.risk_level) {
        return {
          risk_level: data.predicted_risk,
          confidence: data.confidence,
          score: this.getRiskScore(data.predicted_risk),
          probabilities: data.probability_distribution,
          timestamp: new Date().toISOString(),
        };
      }
      
      return data;
    } catch (error) {
      console.error('AI Prediction Service Error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to get AI prediction: ${error.message}`
          : 'Failed to get AI prediction: Unknown error'
      );
    }
  }

  /**
   * Convert risk level to numeric score
   */
  private getRiskScore(riskLevel: string): number {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
        return 0;
      case 'mid risk':
        return 50;
      case 'high risk':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Get risk assessment with detailed analysis
   */
  async getDetailedRiskAssessment(vitals: PatientVitals): Promise<{
    prediction: PredictionResponse;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const prediction = await this.predictMaternalRisk(vitals);
      
      const riskFactors = this.analyzeRiskFactors(vitals);
      const recommendations = this.generateRecommendations(prediction.risk_level, vitals);

      return {
        prediction,
        riskFactors,
        recommendations,
      };
    } catch (error) {
      console.error('Detailed Risk Assessment Error:', error);
      throw error;
    }
  }

  /**
   * Analyze specific risk factors based on vitals
   */
  private analyzeRiskFactors(vitals: PatientVitals): string[] {
    const factors: string[] = [];

    // Age-related risks
    if (vitals.age < 18) {
      factors.push('Young maternal age (under 18)');
    } else if (vitals.age > 35) {
      factors.push('Advanced maternal age (over 35)');
    }

    // Blood pressure risks
    if (vitals.systolicBP >= 140 || vitals.diastolicBP >= 90) {
      factors.push('High blood pressure (Hypertension)');
    } else if (vitals.systolicBP < 90 || vitals.diastolicBP < 60) {
      factors.push('Low blood pressure (Hypotension)');
    }

    // Blood sugar risks
    if (vitals.bloodSugar >= 126) {
      factors.push('High blood glucose (Diabetes risk)');
    } else if (vitals.bloodSugar < 70) {
      factors.push('Low blood glucose (Hypoglycemia)');
    }

    // Temperature risks
    if (vitals.bodyTemp >= 38.0) {
      factors.push('Elevated body temperature (Fever)');
    } else if (vitals.bodyTemp < 36.0) {
      factors.push('Low body temperature (Hypothermia)');
    }

    // Heart rate risks
    if (vitals.heartRate > 100) {
      factors.push('Elevated heart rate (Tachycardia)');
    } else if (vitals.heartRate < 60) {
      factors.push('Low heart rate (Bradycardia)');
    }

    return factors;
  }

  /**
   * Generate recommendations based on risk level and vitals
   */
  private generateRecommendations(riskLevel: string, vitals: PatientVitals): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'high risk':
        recommendations.push('Immediate medical attention required');
        recommendations.push('Contact healthcare provider immediately');
        recommendations.push('Consider hospital evaluation');
        recommendations.push('Frequent monitoring of vital signs');
        break;

      case 'mid risk':
        recommendations.push('Schedule medical consultation within 24-48 hours');
        recommendations.push('Monitor vital signs regularly');
        recommendations.push('Review current medications with doctor');
        recommendations.push('Follow up with healthcare provider');
        break;

      case 'low risk':
        recommendations.push('Continue routine prenatal care');
        recommendations.push('Maintain regular check-up schedule');
        recommendations.push('Continue healthy lifestyle practices');
        recommendations.push('Monitor symptoms and report changes');
        break;
    }

    // Specific recommendations based on vitals
    if (vitals.systolicBP >= 140 || vitals.diastolicBP >= 90) {
      recommendations.push('Reduce sodium intake');
      recommendations.push('Practice stress management techniques');
    }

    if (vitals.bloodSugar >= 126) {
      recommendations.push('Follow diabetic diet guidelines');
      recommendations.push('Maintain regular physical activity');
    }

    if (vitals.bodyTemp >= 38.0) {
      recommendations.push('Stay well hydrated');
      recommendations.push('Monitor temperature regularly');
    }

    return recommendations;
  }

  /**
   * Check if AI service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('AI Service Health Check Failed:', error);
      return false;
    }
  }

  /**
   * Get risk color for UI display
   */
  getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low risk':
        return '#10B981'; // Green
      case 'mid risk':
        return '#F59E0B'; // Yellow
      case 'high risk':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }

  /**
   * Format confidence percentage
   */
  formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(1)}%`;
  }
}

// Export singleton instance
export const aiPredictionService = new AIPredictionService();

// Export types for use in components
export type { PredictionRequest, PredictionResponse, PatientVitals, Patient, VitalSignsData, LegacyPredictionResponse }; 