'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Activity, TrendingUp, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { aiPredictionService, type PatientVitals, type PredictionResponse } from '@/services/ai-prediction.service';
import { toast } from 'react-hot-toast';

interface Patient {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  isPregnant?: boolean;
  [key: string]: any;
}

interface VitalSigns {
  id?: string;
  patientId: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  bloodSugar: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  createdAt: string;
  updatedAt?: string;
}

interface RiskAssessmentProps {
  patient: Patient;
  latestVitals?: VitalSigns;
  onRiskUpdate?: (riskLevel: string, confidence: number) => void;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ 
  patient, 
  latestVitals, 
  onRiskUpdate 
}) => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null);

  useEffect(() => {
    checkServiceHealth();
    if (patient && (latestVitals || patient.dateOfBirth)) {
      performRiskAssessment();
    }
  }, [patient, latestVitals]);

  const checkServiceHealth = async () => {
    try {
      const isHealthy = await aiPredictionService.checkServiceHealth();
      setServiceHealth(isHealthy);
    } catch (error) {
      setServiceHealth(false);
    }
  };

  const performRiskAssessment = async () => {
    if (!patient) return;

    setLoading(true);
    setError(null);

    try {
      // Extract vital signs from patient and latest vitals
      const vitals = aiPredictionService.extractVitalSigns(patient, {
        systolic_bp: latestVitals?.systolicBP,
        diastolic_bp: latestVitals?.diastolicBP,
        blood_sugar: latestVitals?.bloodSugar,
        body_temp: latestVitals?.temperature,
        heart_rate: latestVitals?.heartRate,
      });

      if (!vitals) {
        throw new Error('Unable to extract vital signs from patient data');
      }

      // Get detailed risk assessment
      const assessment = await aiPredictionService.getDetailedRiskAssessment(vitals);
      
      setPrediction(assessment.prediction);
      setRiskFactors(assessment.riskFactors);
      setRecommendations(assessment.recommendations);

      // Notify parent component
      if (onRiskUpdate) {
        onRiskUpdate(assessment.prediction.risk_level, assessment.prediction.confidence);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform risk assessment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'mid risk':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'high risk':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
        return 'default'; // Green
      case 'mid risk':
        return 'secondary'; // Yellow
      case 'high risk':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  const getRiskDescription = (riskLevel: string, confidence: number) => {
    const confidenceText = `AI confidence: ${aiPredictionService.formatConfidence(confidence)}`;
    
    switch (riskLevel.toLowerCase()) {
      case 'low risk':
        return `Patient shows normal vital signs and low risk indicators. Continue routine monitoring. ${confidenceText}`;
      case 'mid risk':
        return `Patient shows some concerning indicators. Increased monitoring recommended. ${confidenceText}`;
      case 'high risk':
        return `Patient shows high-risk indicators. Immediate medical attention may be required. ${confidenceText}`;
      default:
        return 'Risk assessment unavailable.';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2D7D89]" />
            AI Risk Assessment
          </div>
          <div className="flex items-center gap-2">
            {serviceHealth !== null && (
              <div className={`w-2 h-2 rounded-full ${serviceHealth ? 'bg-green-500' : 'bg-red-500'}`} />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={performRiskAssessment}
              disabled={loading}
              className="text-xs"
            >
              {loading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span className="ml-1">Refresh</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-[#2D7D89]" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Analyzing patient data...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Assessment Error
              </span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            {!serviceHealth && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                AI service appears to be offline. Please ensure the AI model service is running.
              </p>
            )}
          </div>
        )}

        {prediction && !loading && !error && (
          <>
            {/* Risk Level Display */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon(prediction.risk_level)}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Risk Level
                  </span>
                </div>
                <Badge variant={getRiskBadgeVariant(prediction.risk_level)}>
                  {prediction.risk_level.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {getRiskDescription(prediction.risk_level, prediction.confidence)}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {aiPredictionService.formatConfidence(prediction.confidence)}
                </span>
              </div>
            </div>

            {/* Probability Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Risk Probability Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(prediction.probabilities).map(([risk, probability]) => (
                  <div key={risk} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {risk}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            risk.includes('high') ? 'bg-red-500' :
                            risk.includes('mid') ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${probability * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Identified Risk Factors
                </h4>
                <div className="space-y-1">
                  {riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Recommendations
                </h4>
                <div className="space-y-1">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Metadata */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Assessment Score: {prediction.score}/100</span>
                <span>Generated: {new Date(prediction.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </>
        )}

        {!prediction && !loading && !error && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Risk Assessment Available
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Click refresh to generate an AI-powered risk assessment for this patient.
            </p>
            <Button onClick={performRiskAssessment} disabled={loading}>
              <Activity className="w-4 h-4 mr-2" />
              Generate Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAssessment; 