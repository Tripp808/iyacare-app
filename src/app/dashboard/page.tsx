'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatients } from '@/lib/firebase/patients';
import { getAlerts, createAlert } from '@/lib/firebase/alerts';
import { VitalSignsService } from '@/services/vitalsigns.service';
import { RealtimeIoTService, IoTReading, AIPrediction } from '@/services/realtime-iot.service';
import { formatDate } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { 
  Users,
  AlertCircle,
  Calendar,
  Plus,
  Activity,
  CheckCheck,
  Bell,
  TrendingUp,
  FileText,
  User,
  RefreshCw,
  Wifi,
  Radio,
  Brain
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/firebase/alerts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

async function getUnreadAlerts() {
  // Only show unread alerts on dashboard (includeRead = false)
  const result = await getAlerts(false);
  return result.success ? result.alerts || [] : [];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 11,
    highRiskPatients: 0,
    mediumRiskPatients: 0,
    lowRiskPatients: 11,
    totalVitalSigns: 0,
    unreadAlerts: 0
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentVitalSigns, setRecentVitalSigns] = useState<any[]>([]);
  const [realtimeReading, setRealtimeReading] = useState<IoTReading | null>(null);
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [realtimePatient, setRealtimePatient] = useState<any>(null);
  const [iotConnected, setIotConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastAiAlertTime, setLastAiAlertTime] = useState<number>(0);

  // Function to create AI-based alerts
  const createAIAlert = async (prediction: AIPrediction, patient: any, reading: IoTReading) => {
    if (!prediction || !patient) return;
    
    // Only create alerts for high risk and avoid spam (max 1 alert per 5 minutes)
    const now = Date.now();
    if (prediction.risk_level === 'high risk' && now - lastAiAlertTime > 5 * 60 * 1000) {
      try {
        const factors = RealtimeIoTService.getFactorsFromReading(reading);
        const alertMessage = `🤖 AI detected HIGH RISK for ${patient.firstName} ${patient.lastName}. Factors: ${factors.slice(0, 2).join(', ')}. Confidence: ${Math.round(prediction.confidence * 100)}%`;
        
        await createAlert({
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          message: alertMessage,
          type: 'risk',
          priority: 'high',
          createdBy: 'AI System'
        });
        
        setLastAiAlertTime(now);
        console.log('AI alert created for high-risk prediction');
      } catch (error) {
        console.error('Error creating AI alert:', error);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Set up real-time IoT monitoring
  useEffect(() => {
    let iotUnsubscribe: (() => void) | null = null;
    let statusUnsubscribe: (() => void) | null = null;

    const setupRealtimeMonitoring = async () => {
      // Find real-time patient
      const result = await getPatients();
      if (result.success && result.patients) {
        const rtPatient = result.patients.find(p => p.isRealtimePatient === true);
        if (rtPatient) {
          setRealtimePatient(rtPatient);
          
          // Subscribe to IoT readings
          iotUnsubscribe = RealtimeIoTService.subscribeToIoTReadings(async (reading) => {
            if (reading) {
              setRealtimeReading(reading);
              setIotConnected(true);
              
              // Get AI prediction for the reading
              try {
                const prediction = await RealtimeIoTService.getAIPrediction(reading, 28);
                setAiPrediction(prediction);
                
                // Create alert if high risk detected
                if (rtPatient) {
                  await createAIAlert(prediction, rtPatient, reading);
                }
              } catch (error) {
                console.error('Error getting AI prediction:', error);
                setAiPrediction(null);
              }
            } else {
              setIotConnected(false);
              setAiPrediction(null);
            }
          });

          // Subscribe to connection status
          statusUnsubscribe = RealtimeIoTService.subscribeToConnectionStatus((status) => {
            setIotConnected(status === "ESP32 Connected");
          });
        }
      }
    };

    setupRealtimeMonitoring();

    return () => {
      if (iotUnsubscribe) iotUnsubscribe();
      if (statusUnsubscribe) statusUnsubscribe();
    };
  }, []);

  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed successfully!');
  };

  async function fetchDashboardData(silentRefresh = false) {
    try {
      if (!silentRefresh) {
        setLoading(true);
      }
      
      // Fetch unread alerts
      const alertsResult = await getAlerts(false);
      const unreadAlerts = alertsResult.success ? alertsResult.alerts || [] : [];
      
      // Fetch patients to count stats
      const patientsResult = await getPatients();
      const patients = patientsResult.success ? patientsResult.patients || [] : [];
      
      // Debug logging to verify patient data
      console.log('Dashboard - Total patients found:', patients.length);
      console.log('Dashboard - Patient risk levels:', patients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, riskLevel: p.riskLevel })));
      
      // Fetch recent vital signs for analytics
      const vitalSignsResult = await VitalSignsService.getAllVitalSigns();
      const allVitalSigns = vitalSignsResult.success ? vitalSignsResult.vitalSigns || [] : [];
      
      // Calculate risk distribution from actual patient data
      const patientRiskCounts = patients.reduce((acc, patient) => {
        const riskLevel = patient.riskLevel;
        // Only count patients who actually have a risk level assigned
        if (riskLevel && ['high', 'medium', 'low'].includes(riskLevel)) {
          acc[riskLevel] = (acc[riskLevel] || 0) + 1;
        } else {
          // Count patients without assigned risk levels separately
          acc['unassigned'] = (acc['unassigned'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Debug logging for risk distribution
      console.log('Dashboard - Risk distribution:', patientRiskCounts);
      console.log('Dashboard - Patients with unassigned risk:', patientRiskCounts.unassigned || 0);
      
      // Get recent vital signs (last 10) - fix timestamp sorting
      const recentVitals = allVitalSigns
        .sort((a, b) => {
          // Handle both Date and Timestamp types
          let aTime = 0;
          let bTime = 0;
          
          if (a.timestamp) {
            if (a.timestamp instanceof Timestamp) {
              aTime = a.timestamp.seconds;
            } else if (a.timestamp instanceof Date) {
              aTime = a.timestamp.getTime() / 1000;
            }
          }
          
          if (b.timestamp) {
            if (b.timestamp instanceof Timestamp) {
              bTime = b.timestamp.seconds;
            } else if (b.timestamp instanceof Date) {
              bTime = b.timestamp.getTime() / 1000;
            }
          }
          
          return bTime - aTime;
        })
        .slice(0, 10);
        
      // Use real patient data for statistics
      let finalStats = {
        totalPatients: patients.length,
        highRiskPatients: patientRiskCounts.high || 0,
        mediumRiskPatients: patientRiskCounts.medium || 0,
        lowRiskPatients: patientRiskCounts.low || 0,
        totalVitalSigns: allVitalSigns.length,
        unreadAlerts: unreadAlerts.length
      };
      
      // Include AI-based risk assessment for real-time patient if available
      if (aiPrediction && realtimePatient) {
        // Find if the real-time patient already has a manual risk assignment
        const rtPatient = patients.find(p => p.id === realtimePatient.id);
        const hasManualRisk = rtPatient && rtPatient.riskLevel && ['high', 'medium', 'low'].includes(rtPatient.riskLevel);
        
        if (!hasManualRisk) {
          // Add AI prediction to stats if patient doesn't have manual risk level
          if (aiPrediction.risk_level === 'high risk') {
            finalStats.highRiskPatients += 1;
          } else if (aiPrediction.risk_level === 'mid risk') {
            finalStats.mediumRiskPatients += 1;
          } else {
            finalStats.lowRiskPatients += 1;
          }
        }
      }
      
      console.log('Dashboard - Final stats:', finalStats);
      
      // Check for significant changes in high-risk patients (only for non-silent refreshes)
      if (!silentRefresh && stats.highRiskPatients !== finalStats.highRiskPatients) {
        const difference = finalStats.highRiskPatients - stats.highRiskPatients;
        if (difference > 0) {
          toast.error(`⚠️ ${difference} new high-risk patient${difference > 1 ? 's' : ''} detected! Please review immediately.`);
        } else if (difference < 0) {
          toast.success(`✅ ${Math.abs(difference)} patient${Math.abs(difference) > 1 ? 's' : ''} moved from high-risk status.`);
        }
      }
      
      setStats(finalStats);
      
      setAlerts(unreadAlerts);
      setRecentVitalSigns(recentVitals);
      setLastUpdated(new Date());

      // Show summary info for manual refreshes
      if (!silentRefresh && finalStats.totalPatients > 0) {
        const totalAssignedRisk = finalStats.highRiskPatients + finalStats.mediumRiskPatients + finalStats.lowRiskPatients;
        const unassignedPatients = finalStats.totalPatients - totalAssignedRisk;
        
        if (unassignedPatients > 0) {
          console.log(`📊 Dashboard: ${unassignedPatients} patients need risk assessment. Visit Patient Management to update.`);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty stats if there's an error
      setStats({
        totalPatients: 0,
        highRiskPatients: 0,
        mediumRiskPatients: 0,
        lowRiskPatients: 0,
        totalVitalSigns: 0,
        unreadAlerts: 0
      });
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <span className="ml-3">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      {user?.name && (
        <div className="bg-gradient-to-r from-[#2D7D89]/10 to-[#F7913D]/10 rounded-lg border border-[#2D7D89]/20 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-[#2D7D89]/20 shadow-sm flex-shrink-0">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#2D7D89] flex items-center justify-center">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-[#2D7D89] dark:text-[#4AA0AD] truncate">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Here's your dashboard overview for today
                </p>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={refreshDashboard}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sm:inline">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-primary">Welcome to </span>
          <span className="text-[#2D7D89]">Iyà</span>
          <span className="text-[#F7913D]">Care</span>
        </h1>
        <Link href="/patients">
        <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-[#2D7D89] dark:border-l-[#4AA0AD]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-[#2D7D89] dark:text-[#4AA0AD]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients === 0 
                ? 'No patients registered yet'
                : `${stats.totalPatients} patient${stats.totalPatients === 1 ? '' : 's'} registered`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-red-500 dark:border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              High Risk Patients
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.highRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highRiskPatients === 0 
                ? 'No high-risk cases'
                : `${stats.highRiskPatients} require immediate attention`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-75">
              From saved AI risk assessments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-[#F7913D] dark:border-l-[#FFA558]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              Medium Risk Patients
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#F7913D] dark:text-[#FFA558]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.mediumRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mediumRiskPatients === 0 
                ? 'No medium-risk cases'
                : `${stats.mediumRiskPatients} under monitoring`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-green-500 dark:border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              Low Risk Patients
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.lowRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowRiskPatients === 0 
                ? 'No patients assessed as low risk'
                : `${stats.lowRiskPatients} assessed as low risk`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-purple-500 dark:border-l-purple-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              Unread Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.unreadAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadAlerts === 0 
                ? 'All clear!'
                : `${alerts.filter(a => a.priority === 'high').length} high priority`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/iot-monitoring">
          <Card className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-[#2D7D89]/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-[#e6f3f5] dark:bg-[#2D7D89]/20 rounded-full mr-3">
                <Activity className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />
              </div>
              <div>
                <p className="font-medium">🔴 IoT Live Monitoring</p>
                <p className="text-sm text-muted-foreground">Real-time ESP32 data</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/patients">
          <Card className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-[#2D7D89]/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-[#e6f3f5] dark:bg-[#2D7D89]/20 rounded-full mr-3">
                <Users className="h-6 w-6 text-[#2D7D89]" />
              </div>
              <div>
                <p className="font-medium">Manage Patients</p>
                <p className="text-sm text-muted-foreground">View patient records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/analytics">
          <Card className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-[#2D7D89]/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-[#e6f3f5] dark:bg-[#2D7D89]/20 rounded-full mr-3">
                <FileText className="h-6 w-6 text-[#2D7D89]" />
              </div>
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-muted-foreground">Patient insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/alerts">
          <Card className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-[#2D7D89]/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-[#e6f3f5] dark:bg-[#2D7D89]/20 rounded-full mr-3">
                <Bell className="h-6 w-6 text-[#2D7D89]" />
              </div>
              <div>
                <p className="font-medium">View Alerts</p>
                <p className="text-sm text-muted-foreground">System notifications</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Vital Signs */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Recent Vital Signs
                {iotConnected && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                    <Radio className="h-3 w-3 mr-1" />
                    Live IoT
                  </Badge>
                )}
              </CardTitle>
            <CardDescription>
                {realtimeReading 
                  ? `Live ESP32 data from ${realtimePatient?.firstName} ${realtimePatient?.lastName}`
                  : stats.totalVitalSigns > 0 
                    ? `${stats.totalVitalSigns} total readings recorded`
                    : 'No vital signs recorded yet'
                }
            </CardDescription>
            </div>
            <Link href="/iot-monitoring">
              <Button variant="outline" size="sm">
                View Live Data
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Real-time IoT Data (Priority Display) */}
            {realtimeReading && realtimePatient && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-green-800">
                      🔴 {realtimePatient.firstName} {realtimePatient.lastName} - Live IoT Data
                    </h4>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ESP32 Live
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {realtimeReading.SystolicBP.toFixed(0)}/{realtimeReading.DiastolicBP.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">Blood Pressure</div>
                  </div>
                  
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {realtimeReading.HeartRate.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">Heart Rate (bpm)</div>
                  </div>
                  
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {((realtimeReading.BodyTemperature - 32) * 5/9).toFixed(1)}°C
                    </div>
                    <div className="text-xs text-gray-600">Temperature</div>
                  </div>
                  
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className={`text-lg font-bold ${
                      aiPrediction?.risk_level === 'high risk' ? 'text-red-600' :
                      aiPrediction?.risk_level === 'mid risk' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {aiPrediction ? aiPrediction.risk_level.toUpperCase() : 'ANALYZING...'}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <Brain className="h-3 w-3" />
                      AI Risk Level
                      {aiPrediction && (
                        <span className="ml-1">({Math.round(aiPrediction.confidence * 100)}%)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Traditional Vital Signs */}
            {recentVitalSigns.length === 0 && !realtimeReading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No Vital Signs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by connecting IoT devices or recording vital signs for your patients.
                </p>
                <Link href="/iot-monitoring">
                  <Button size="sm">
                    <Radio className="h-4 w-4 mr-2" />
                    View IoT Monitoring
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVitalSigns.slice(0, 3).map((vital, index) => (
                  <div key={vital.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">
                          BP: {vital.systolic}/{vital.diastolic} | HR: {vital.heartRate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vital.timestamp?.toDate ? 
                            vital.timestamp.toDate().toLocaleDateString() : 
                            'Recent'
                          }
                        </p>
                </div>
              </div>
                    {vital.aiPrediction?.riskLevel && (
                      <Badge 
                        variant={vital.aiPrediction.riskLevel === 'high' ? 'destructive' : 
                                vital.aiPrediction.riskLevel === 'medium' ? 'outline' : 'default'}
                      >
                        {vital.aiPrediction.riskLevel}
                      </Badge>
                    )}
                </div>
                ))}
                
                {/* Connection Status */}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {iotConnected ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-green-700">ESP32 Device Connected</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Traditional monitoring mode</span>
                      </>
                    )}
                  </div>
                  <Link href="/iot-monitoring">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Live →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                {alerts.length === 0 
                  ? 'No unread alerts'
                  : `You have ${alerts.length} unread alerts`
                }
              </CardDescription>
            </div>
            <Link href="/alerts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCheck className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">All Clear!</h3>
                <p className="text-sm text-muted-foreground">
                  You have no unread alerts at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className={`h-4 w-4 ${
                        alert.priority === 'high' ? 'text-red-500' :
                        alert.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.createdAt instanceof Timestamp ? 
                            alert.createdAt.toDate().toLocaleDateString() : 
                            alert.createdAt instanceof Date ?
                            alert.createdAt.toLocaleDateString() :
                            'Recent'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={alert.priority === 'high' ? 'destructive' : 
                              alert.priority === 'medium' ? 'outline' : 'default'}
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 