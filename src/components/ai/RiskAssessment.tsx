'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  Activity,
  Lightbulb
} from 'lucide-react';
import { aiPredictionService, PredictionResponse } from '@/services/ai-prediction.service';

interface RiskAssessmentProps {
  patient: any;
  latestVitals?: any;
  onRiskUpdate?: (risk: string, confidence: number) => void;
}

export default function RiskAssessment({ patient, latestVitals, onRiskUpdate }: RiskAssessmentProps) {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const performRiskAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Extract vital signs from patient data
      const vitalSigns = aiPredictionService.extractVitalSigns(patient, latestVitals);
      
      if (!vitalSigns) {
        throw new Error('Unable to extract vital signs from patient data');
      }

      // Get AI prediction
      const result = await aiPredictionService.predictRisk(vitalSigns);
      setPrediction(result);
      setLastUpdated(new Date());

      // Notify parent component of risk update
      if (onRiskUpdate) {
        onRiskUpdate(result.risk_level, result.confidence);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Risk assessment failed';
      setError(errorMessage);
      console.error('Risk Assessment Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-assess on component mount if vital signs are available
  useEffect(() => {
    if (patient && (latestVitals || patient.age || patient.dateOfBirth)) {
      performRiskAssessment();
    }
  }, [patient, latestVitals]);

  const getRiskStyling = (risk: string) => {
    return aiPredictionService.getRiskStyling(risk);
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const getRiskIcon = (risk: string) => {
    const riskLevel = risk.toLowerCase();
    if (riskLevel.includes('high')) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (riskLevel.includes('mid') || riskLevel.includes('medium')) {
      return <Activity className="w-5 h-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Brain className="w-5 h-5 text-[#2D7D89]" />
          AI Risk Assessment
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={performRiskAssessment}
          disabled={loading}
          className="text-gray-900 dark:text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {loading && !prediction && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D7D89] mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyzing patient data with AI...
              </p>
            </div>
          </div>
        )}

        {prediction && (
          <div className="space-y-4">
            {/* Risk Level Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRiskIcon(prediction.risk_level)}
                <div>
                  <Badge className={`${getRiskStyling(prediction.risk_level).bgColor} ${getRiskStyling(prediction.risk_level).textColor}`}>
                    {prediction.risk_level.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Confidence: {formatConfidence(prediction.confidence)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <TrendingUp className="w-5 h-5 text-[#2D7D89] mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Powered
                </p>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prediction Confidence
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatConfidence(prediction.confidence)}
                </span>
              </div>
              <Progress value={prediction.confidence * 100} className="h-2" />
            </div>

            {/* Risk Score */}
            {prediction.details?.risk_score !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risk Score
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.details.risk_score}/100
                  </span>
                </div>
                <Progress value={prediction.details.risk_score} className="h-2" />
              </div>
            )}

            {/* Risk Factors */}
            {prediction.details?.risk_factors && prediction.details.risk_factors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Risk Factors Identified
                </h4>
                <ul className="space-y-1">
                  {prediction.details.risk_factors.map((factor, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vital Signs Used */}
            {prediction.details?.vital_signs && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  Vital Signs Analysis
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500">Age:</span> {prediction.details.vital_signs.age} years
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500">BP:</span> {prediction.details.vital_signs.systolic_bp}/{prediction.details.vital_signs.diastolic_bp}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500">Blood Sugar:</span> {prediction.details.vital_signs.blood_sugar} mmol/L
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500">Heart Rate:</span> {prediction.details.vital_signs.heart_rate} bpm
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500">Temperature:</span> {prediction.details.vital_signs.body_temp}°F
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 