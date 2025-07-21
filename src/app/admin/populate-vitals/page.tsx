'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { populateVitalSigns } from '@/scripts/populate-vitals';
import { Activity, AlertCircle, CheckCircle, Database, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PopulateVitalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePopulateVitals = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const populationResult = await populateVitalSigns();
      setResult(populationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to populate vital signs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/patients')}
          className="pl-0 -ml-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient Management
        </Button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Populate Patient Vital Signs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate realistic, randomized vital signs for all patients to improve AI model accuracy
          </p>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <Database className="w-5 h-5" />
              What This Does
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-400">
            <div className="space-y-3">
              <p>
                This tool generates realistic, randomized vital signs for each patient in your database. 
                This ensures the AI model receives diverse data instead of identical values.
              </p>
              
              <div className="bg-white dark:bg-blue-950/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Generated Data Includes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>• Blood Pressure (Systolic/Diastolic)</div>
                  <div>• Heart Rate (BPM)</div>
                  <div>• Blood Sugar Level (mg/dL)</div>
                  <div>• Body Temperature (°C)</div>
                  <div>• Weight (kg)</div>
                  <div>• Oxygen Saturation (%)</div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-amber-800 dark:text-amber-400 text-sm">
                    <strong>Smart Generation:</strong> Values are adjusted based on patient age, pregnancy status, 
                    and includes 20% risk factors (hypertension, diabetes, tachycardia) for realistic variety.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2D7D89]" />
              Generate Vital Signs
            </CardTitle>
            <CardDescription>
              Click the button below to populate realistic vital signs for all patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handlePopulateVitals}
              disabled={loading}
              className="w-full bg-[#2D7D89] hover:bg-[#245A62] text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Vital Signs...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Populate All Patient Vital Signs
                </>
              )}
            </Button>

            {loading && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                This may take a few moments depending on the number of patients...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-400">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Card className={result.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${result.success ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
                {result.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {result.success ? 'Success!' : 'Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white dark:bg-green-950/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {result.processed}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">
                        Patients Processed
                      </div>
                    </div>
                    <div className="bg-white dark:bg-green-950/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {result.successful}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">
                        Successful
                      </div>
                    </div>
                    <div className="bg-white dark:bg-green-950/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {result.errors}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-500">
                        Errors
                      </div>
                    </div>
                  </div>

                  {result.results && result.results.length > 0 && (
                    <div className="bg-white dark:bg-green-950/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">
                        Generated Vital Signs Sample:
                      </h4>
                      <div className="text-sm text-green-800 dark:text-green-400 space-y-1 max-h-60 overflow-y-auto">
                        {result.results.slice(0, 10).map((r: string, index: number) => (
                          <div key={index} className="font-mono text-xs">
                            {r}
                          </div>
                        ))}
                        {result.results.length > 10 && (
                          <div className="text-xs text-green-600 dark:text-green-500 italic">
                            ... and {result.results.length - 10} more patients
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                      AI Model Impact:
                    </h4>
                    <div className="text-sm text-indigo-800 dark:text-indigo-400 space-y-1">
                      <div>• Each patient now has unique vital signs</div>
                      <div>• Realistic ranges based on age and pregnancy status</div>
                      <div>• 20% of patients have risk factors for diverse predictions</div>
                      <div>• AI model will now provide accurate, varied risk assessments</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-800 dark:text-red-400">
                  {result.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 