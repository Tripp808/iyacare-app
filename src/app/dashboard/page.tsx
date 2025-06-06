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
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/firebase/alerts';

async function getUnreadAlerts() {
  // Only show unread alerts on dashboard (includeRead = false)
  const result = await getAlerts(false);
  return result.success ? result.alerts || [] : [];
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRiskPatients: 0,
    mediumRiskPatients: 0,
    lowRiskPatients: 0,
    totalVitalSigns: 0,
    unreadAlerts: 0
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentVitalSigns, setRecentVitalSigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch unread alerts
        const alertsResult = await getAlerts(false);
        const unreadAlerts = alertsResult.success ? alertsResult.alerts || [] : [];
        
        // Fetch patients to count stats
        const patientsResult = await getPatients();
        const patients = patientsResult.success ? patientsResult.patients || [] : [];
        
      // Fetch recent vital signs for analytics
      const vitalSignsResult = await VitalSignsService.getAllVitalSigns();
      const allVitalSigns = vitalSignsResult.success ? vitalSignsResult.vitalSigns || [] : [];
      
      // Calculate risk distribution from existing AI predictions
      const riskCounts = allVitalSigns.reduce((acc, vital) => {
        const riskLevel = vital.aiPrediction?.riskLevel || 'unknown';
        acc[riskLevel] = (acc[riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
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
        
        // Set statistics
        setStats({
          totalPatients: patients.length,
        highRiskPatients: riskCounts.high || 0,
        mediumRiskPatients: riskCounts.medium || 0,
        lowRiskPatients: riskCounts.low || 0,
        totalVitalSigns: allVitalSigns.length,
          unreadAlerts: unreadAlerts.length
        });
        
        setAlerts(unreadAlerts);
      setRecentVitalSigns(recentVitals);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
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
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-primary">Welcome to </span>
          <span className="text-[#2D7D89]">Iyà</span>
          <span className="text-[#F7913D]">Care</span>
        </h1>
        <Link href="/patients">
        <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients === 0 ? 'No patients registered yet' : 'Registered in the system'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Patients
            </CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highRiskPatients === 0 ? 'No high-risk patients' : 'Require immediate attention'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medium Risk Patients
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mediumRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mediumRiskPatients === 0 ? 'No medium-risk patients' : 'Need monitoring'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Alerts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAlerts}</div>
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
          <Card className="cursor-pointer transition-colors hover:bg-muted/50 border-[#2D7D89]/20 hover:border-[#2D7D89]/40">
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
          <Card className="cursor-pointer transition-colors hover:bg-muted/50 border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-primary/10 rounded-full mr-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Manage Patients</p>
                <p className="text-sm text-muted-foreground">View patient records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/analytics">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50 border-blue-500/20 hover:border-blue-500/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/20 rounded-full mr-3">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-muted-foreground">Patient insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/alerts">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50 border-orange-500/20 hover:border-orange-500/40">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-500/20 rounded-full mr-3">
                <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
        <Card>
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
        <Card>
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