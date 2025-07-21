'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatients } from '@/lib/firebase/patients';
import { getAlerts } from '@/lib/firebase/alerts';
import { VitalSignsService } from '@/services/vitalsigns.service';
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
  RefreshCw
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
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
      const finalStats = {
        totalPatients: patients.length,
        highRiskPatients: patientRiskCounts.high || 0,
        mediumRiskPatients: patientRiskCounts.medium || 0,
        lowRiskPatients: patientRiskCounts.low || 0,
        totalVitalSigns: allVitalSigns.length,
        unreadAlerts: unreadAlerts.length
      };
      
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
        <div className="bg-gradient-to-r from-[#2D7D89]/10 to-[#F7913D]/10 rounded-lg border border-[#2D7D89]/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#2D7D89]/20 shadow-sm">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#2D7D89] flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
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
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-primary">Welcome to </span>
          <span className="text-[#2D7D89]">Iyà</span>
          <span className="text-[#F7913D]">Care</span>
        </h1>
        <Link href="/patients">
        <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-[#2D7D89] dark:border-l-[#4AA0AD]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-[#2D7D89] dark:text-[#4AA0AD]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients === 0 
                ? 'No patients registered yet'
                : `${stats.totalPatients} patient${stats.totalPatients === 1 ? '' : 's'} registered`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-red-500 dark:border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              High Risk Patients
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.highRiskPatients}</div>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Medium Risk Patients
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#F7913D] dark:text-[#FFA558]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.mediumRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mediumRiskPatients === 0 
                ? 'No medium-risk cases'
                : `${stats.mediumRiskPatients} under monitoring`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-green-500 dark:border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Low Risk Patients
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.lowRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowRiskPatients === 0 
                ? 'No patients assessed as low risk'
                : `${stats.lowRiskPatients} assessed as low risk`
              }
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-white dark:bg-gray-800 border-l-[6px] border-l-purple-500 dark:border-l-purple-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Unread Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.unreadAlerts}</div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/vitals">
          <Card className="cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-[#2D7D89]/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-[#e6f3f5] dark:bg-[#2D7D89]/20 rounded-full mr-3">
                <Activity className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />
              </div>
              <div>
                <p className="font-medium">Record Vital Signs</p>
                <p className="text-sm text-muted-foreground">Add new readings</p>
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Vital Signs */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Vital Signs</CardTitle>
            <CardDescription>
                {stats.totalVitalSigns > 0 
                  ? `${stats.totalVitalSigns} total readings recorded`
                  : 'No vital signs recorded yet'
                }
            </CardDescription>
            </div>
            <Link href="/vitals">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentVitalSigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No Vital Signs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by recording vital signs for your patients.
                </p>
                <Link href="/vitals">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Reading
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVitalSigns.slice(0, 5).map((vital, index) => (
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