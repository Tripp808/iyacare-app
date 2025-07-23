"use client";

import React, { useState, useEffect } from 'react';
import { RealtimeIoTService, IoTReading, AIPrediction } from '@/services/realtime-iot.service';
import { getPatients, Patient } from '@/lib/firebase/patients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  Wifi, 
  WifiOff,
  Zap,
  User,
  Clock,
  RefreshCw,
  CheckCircle,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';

export default function IoTLiveMonitoringPage() {
  const [realtimeReading, setRealtimeReading] = useState<IoTReading | null>(null);
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [realtimePatient, setRealtimePatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<'connected' | 'fallback' | 'error'>('connected');

  // Load real-time patient data
  useEffect(() => {
    loadRealtimePatient();
  }, []);

  // Subscribe to IoT data
  useEffect(() => {
    let readingsUnsubscribe: (() => void) | null = null;
    let statusUnsubscribe: (() => void) | null = null;

    if (realtimePatient) {
      // Subscribe to real-time readings
      readingsUnsubscribe = RealtimeIoTService.subscribeToIoTReadings(async (reading) => {
        if (reading) {
          setRealtimeReading(reading);
          setLastUpdate(new Date());
          setIsConnected(true);
          
          // Get AI prediction for the reading
          try {
            const prediction = await RealtimeIoTService.getAIPrediction(reading, realtimePatient?.pregnancyWeek || 28);
            setAiPrediction(prediction);
            setAiServiceStatus('connected');
          } catch (error) {
            console.warn('AI service unavailable, using fallback assessment:', error);
            setAiServiceStatus('fallback');
            // Use fallback assessment
            const fallback = RealtimeIoTService.getFallbackRiskAssessment(reading);
            setAiPrediction(fallback);
          }
        } else {
          setIsConnected(false);
        }
      });

      // Subscribe to connection status
      statusUnsubscribe = RealtimeIoTService.subscribeToConnectionStatus((status) => {
        setConnectionStatus(status);
        setIsConnected(status === "ESP32 Connected");
      });
    }

    return () => {
      if (readingsUnsubscribe) readingsUnsubscribe();
      if (statusUnsubscribe) statusUnsubscribe();
      RealtimeIoTService.cleanup();
    };
  }, [realtimePatient]);

  const loadRealtimePatient = async () => {
    try {
      setLoading(true);
      const result = await getPatients();
      
      if (result.success && result.patients) {
        // Find the real-time patient (Immaculée Munezero)
        const rtPatient = result.patients.find((p: any) => p.isRealtimePatient === true);
        if (rtPatient) {
          setRealtimePatient(rtPatient);
          toast.success(`Connected to real-time patient: ${rtPatient.firstName} ${rtPatient.lastName}`);
        } else {
          toast.error('No real-time patient found. Please ensure Immaculée Munezero is added.');
        }
      }
    } catch (error) {
      console.error('Error loading real-time patient:', error);
      toast.error('Failed to load real-time patient');
    } finally {
      setLoading(false);
    }
  };

  const formatTemperature = (tempF: number): { celsius: number; fahrenheit: number } => {
    const celsius = (tempF - 32) * 5/9;
    return {
      celsius: parseFloat(celsius.toFixed(1)),
      fahrenheit: parseFloat(tempF.toFixed(1))
    };
  };

  const getVitalStatus = (value: number, type: string) => {
    switch (type) {
      case 'systolic':
        if (value > 140) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 90) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'diastolic':
        if (value > 90) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 60) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'heartRate':
        if (value > 100) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 60) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'temperature':
        if (value > 37.5) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 36) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      default:
        return { status: 'normal', icon: null, color: 'text-green-500' };
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'destructive';
      case 'high':
      case 'high risk':
        return 'destructive';
      case 'medium':
      case 'mid risk':
        return 'secondary';
      case 'low':
      case 'low risk':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Connecting to IoT monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">
            🔴 IoT Live Monitoring
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Real-time vital signs from ESP32 IoT devices
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs md:text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          <Button
            onClick={loadRealtimePatient}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </Button>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Device Connection Status
            </CardTitle>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {connectionStatus || "Unknown"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                ESP32 Device: <span className="font-medium">ESP32-001-IMM</span>
              </p>
              <p className="text-sm text-gray-600">
                Database: <span className="font-medium">iyacare-default-rtdb.firebaseio.com</span>
              </p>
            </div>
            {lastUpdate && (
              <div className="text-right text-xs text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Patient Card */}
      {realtimePatient && (
        <Card className="mb-6 bg-gradient-to-r from-[#2D7D89]/5 to-[#F7913D]/5 border-l-4 border-l-[#2D7D89]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-[#2D7D89]" />
                <span className="text-[#2D7D89] font-bold">
                  {realtimePatient.firstName} {realtimePatient.lastName}
                </span>
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  🔴 LIVE PATIENT
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{realtimePatient.phone}</p>
              </div>
              <div>
                <span className="text-gray-600">Blood Type:</span>
                <p className="font-medium">{realtimePatient.bloodType}</p>
              </div>
              <div>
                <span className="text-gray-600">Pregnancy Week:</span>
                <p className="font-medium">{realtimePatient.pregnancyWeek} weeks</p>
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span>
                <Badge variant={getRiskBadgeColor(realtimePatient.riskLevel || 'medium')}>
                  {realtimePatient.riskLevel?.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                📡 {realtimePatient.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Vital Signs */}
      {realtimeReading ? (
        <div className="space-y-4">
          {(() => {
            const temp = formatTemperature(realtimeReading.BodyTemperature);
            const systolicStatus = getVitalStatus(realtimeReading.SystolicBP, 'systolic');
            const heartRateStatus = getVitalStatus(realtimeReading.HeartRate, 'heartRate');
            const temperatureStatus = getVitalStatus(temp.celsius, 'temperature');

            return (
              <>
                {/* AI Risk Assessment Alert */}
                {aiPrediction && aiPrediction.risk_level !== 'low risk' && (
                  <Card className={`border-l-4 ${
                    aiPrediction.risk_level === 'high risk' ? 'border-l-red-500 bg-red-50' :
                    'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className={`h-5 w-5 ${
                          aiPrediction.risk_level === 'high risk' ? 'text-red-500' : 'text-yellow-600'
                        }`} />
                        🤖 AI Risk Assessment: {aiPrediction.risk_level.toUpperCase()}
                        <Badge variant={getRiskBadgeColor(aiPrediction.risk_level)}>
                          {Math.round(aiPrediction.confidence * 100)}% confidence
                        </Badge>
                        {aiServiceStatus === 'fallback' && (
                          <Badge variant="outline" className="text-xs">
                            Fallback Mode
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-sm text-gray-600">Low Risk</div>
                          <div className="text-lg font-bold text-green-600">
                            {Math.round(aiPrediction.probabilities['low risk'] * 100)}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-sm text-gray-600">Medium Risk</div>
                          <div className="text-lg font-bold text-yellow-600">
                            {Math.round(aiPrediction.probabilities['mid risk'] * 100)}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-sm text-gray-600">High Risk</div>
                          <div className="text-lg font-bold text-red-600">
                            {Math.round(aiPrediction.probabilities['high risk'] * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {RealtimeIoTService.getFactorsFromReading(realtimeReading).map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{factor}</span>
                          </div>
                        ))}
                        {aiServiceStatus === 'connected' && (
                          <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                            <p className="text-xs text-blue-800 flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              Prediction generated by trained XGBoost AI model
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Live Vital Signs Card */}
                <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          Live Vital Signs
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Real-time ESP32 Data
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Timestamp: {realtimeReading.timestamp} | Device: ESP32-001-IMM
                        </CardDescription>
                      </div>
                      {aiPrediction && (
                        <Badge variant={getRiskBadgeColor(aiPrediction.risk_level)}>
                          {aiPrediction.risk_level.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border">
                        <Heart className={`h-5 w-5 ${systolicStatus.color}`} />
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Blood Pressure</p>
                          <p className="text-sm md:text-base font-semibold flex items-center">
                            {realtimeReading.SystolicBP.toFixed(0)}/{realtimeReading.DiastolicBP.toFixed(0)} mmHg
                            {systolicStatus.icon && <systolicStatus.icon className="h-3 w-3 ml-1" />}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                        <Activity className={`h-5 w-5 ${heartRateStatus.color}`} />
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Heart Rate</p>
                          <p className="text-sm md:text-base font-semibold flex items-center">
                            {realtimeReading.HeartRate.toFixed(0)} bpm
                            {heartRateStatus.icon && <heartRateStatus.icon className="h-3 w-3 ml-1" />}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                        <Thermometer className={`h-5 w-5 ${temperatureStatus.color}`} />
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Temperature</p>
                          <p className="text-sm md:text-base font-semibold flex items-center">
                            {temp.celsius}°C ({temp.fahrenheit}°F)
                            {temperatureStatus.icon && <temperatureStatus.icon className="h-3 w-3 ml-1" />}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Data Quality</p>
                          <p className="text-sm md:text-base font-semibold text-green-600">
                            Live & Accurate
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WifiOff className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Live Data</h3>
            <p className="text-gray-500 text-center max-w-md">
              {realtimePatient 
                ? "Waiting for ESP32 device to send data. Please ensure the IoT device is powered on and connected."
                : "No real-time patient found. Please ensure Immaculée Munezero is added to the system."
              }
            </p>
            {connectionStatus && (
              <p className="text-sm text-blue-600 mt-2">
                Status: {connectionStatus}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
