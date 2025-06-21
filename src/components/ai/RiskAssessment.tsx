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
        onRiskUpdate(result.predicted_risk, result.confidence);
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
                {getRiskIcon(prediction.predicted_risk)}
                <div>
                  <Badge className={`${getRiskStyling(prediction.predicted_risk).bgColor} ${getRiskStyling(prediction.predicted_risk).textColor}`}>
                    {prediction.predicted_risk.toUpperCase()}
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

            {/* Probability Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Probability Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(prediction.probability_distribution).map(([risk, probability]) => (
                  <div key={risk} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {risk}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRiskStyling(risk).bgColor.replace('bg-', 'bg-').replace('/20', '')}`}
                          style={{ width: `${probability * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            {prediction.risk_factors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Risk Factors
                </h4>
                <div className="space-y-1">
                  {prediction.risk_factors.map((factor, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Recommendations
                </h4>
                <div className="space-y-1">
                  {prediction.recommendations.map((recommendation, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 