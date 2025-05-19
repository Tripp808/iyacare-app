'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatients, getHighRiskPatients, getPatientsWithUpcomingVisits } from '@/lib/firebase/patients';
import { getAlerts } from '@/lib/firebase/alerts';
import { getReferrals } from '@/lib/firebase/referrals';
import { formatDate } from '@/lib/utils';
import { 
  Users,
  AlertCircle,
  Calendar,
  GitMerge,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCheck,
  Clock,
  Bell,
  Heart,
  Droplet,
  Thermometer,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/firebase/alerts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data for vitals chart (this would come from IoT devices in production)
const vitalsData = [
  { time: '09:00', systolic: 120, diastolic: 80, heartRate: 75, bloodSugar: 5.5 },
  { time: '10:00', systolic: 122, diastolic: 78, heartRate: 78, bloodSugar: 5.6 },
  { time: '11:00', systolic: 125, diastolic: 82, heartRate: 80, bloodSugar: 5.8 },
  { time: '12:00', systolic: 130, diastolic: 85, heartRate: 82, bloodSugar: 6.1 },
  { time: '13:00', systolic: 128, diastolic: 83, heartRate: 79, bloodSugar: 6.0 },
  { time: '14:00', systolic: 126, diastolic: 80, heartRate: 76, bloodSugar: 5.7 },
];

// Sample blockchain data
const blockchainTxs = [
  { id: '0x72f1...3e4a', type: 'Record Update', timestamp: '2 hours ago', status: 'Confirmed' },
  { id: '0x93b2...1c5d', type: 'New Patient Record', timestamp: '1 day ago', status: 'Confirmed' },
  { id: '0x45e8...9f7b', type: 'Risk Assessment', timestamp: '3 days ago', status: 'Confirmed' },
];

async function getUnreadAlerts() {
  // Only show unread alerts on dashboard (includeRead = false)
  const result = await getAlerts(false);
  return result.success ? result.alerts || [] : [];
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRiskPatients: 0,
    todayAppointments: 0,
    unreadAlerts: 0
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVitalTab, setActiveVitalTab] = useState('bp');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch unread alerts
        const alertsResult = await getAlerts(false);
        const unreadAlerts = alertsResult.success ? alertsResult.alerts || [] : [];
        
        // Fetch patients to count stats
        const patientsResult = await getPatients();
        const patients = patientsResult.success ? patientsResult.patients || [] : [];
        
        // Calculate high risk patients
        const highRiskPatients = patients.filter(p => p.riskLevel === 'high');
        
        // Set statistics
        setStats({
          totalPatients: patients.length,
          highRiskPatients: highRiskPatients.length,
          todayAppointments: 8, // Sample data, would come from appointments API
          unreadAlerts: unreadAlerts.length
        });
        
        setAlerts(unreadAlerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
        <Button>
          <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
        </Button>
      </div>

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
              +6 new patients this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Patients
            </CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskPatients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highRiskPatients > 0 ? `${Math.min(stats.highRiskPatients, 8)} require attention` : 'All patients stable'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Next: Maria Johnson (10:30 AM)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread Alerts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadAlerts > 0 
                ? `${alerts.filter(a => a.priority === 'high').length} high priority`
                : 'All clear!'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Real-time Vital Monitoring</CardTitle>
            <CardDescription>
              Live IoT data from monitored patients
            </CardDescription>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant={activeVitalTab === 'bp' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveVitalTab('bp')}
              >
                Blood Pressure
              </Button>
              <Button 
                variant={activeVitalTab === 'hr' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveVitalTab('hr')}
              >
                Heart Rate
              </Button>
              <Button 
                variant={activeVitalTab === 'bs' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveVitalTab('bs')}
              >
                Blood Sugar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {activeVitalTab === 'bp' && (
                    <>
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic BP" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic BP" />
                    </>
                  )}
                  {activeVitalTab === 'hr' && (
                    <Line type="monotone" dataKey="heartRate" stroke="#10b981" name="Heart Rate" />
                  )}
                  {activeVitalTab === 'bs' && (
                    <Line type="monotone" dataKey="bloodSugar" stroke="#f59e0b" name="Blood Sugar" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center p-2 bg-red-50 rounded-md">
                <div className="flex items-center text-red-600">
                  <Activity className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Blood Pressure</span>
                </div>
                <span className="text-lg font-bold">128/83 mmHg</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-green-50 rounded-md">
                <div className="flex items-center text-green-600">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Heart Rate</span>
                </div>
                <span className="text-lg font-bold">76 BPM</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-yellow-50 rounded-md">
                <div className="flex items-center text-yellow-600">
                  <Droplet className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Blood Sugar</span>
                </div>
                <span className="text-lg font-bold">5.7 mmol/L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Unread Alerts</CardTitle>
              <CardDescription>
                {alerts.length > 0 
                  ? `You have ${alerts.length} unread alerts`
                  : 'No unread alerts'
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
              <div className="space-y-4">
                {alerts.slice(0, 5).map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex items-start pb-3 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="mr-2 mt-0.5">
                      {alert.priority === 'high' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : alert.type === 'appointment' ? (
                        <Calendar className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Bell className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {alert.patientName}
                        </p>
                        <Badge 
                          className={
                            alert.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : alert.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(alert.createdAt, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {alerts.length > 5 && (
                  <Link href="/alerts" className="block text-center">
                    <Button variant="link" size="sm">
                      View all {alerts.length} alerts
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Risk Prediction</CardTitle>
            <CardDescription>
              Latest risk assessment for high-priority patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Grace Eze</p>
                    <p className="text-sm text-muted-foreground">Age: 29, Gestational Week: 28</p>
                    <div className="mt-1 flex items-center">
                      <Badge className="bg-red-100 text-red-800">High Risk</Badge>
                      <span className="text-xs text-muted-foreground ml-2">Trigger: High BP, Mild Anemia</span>
                    </div>
                  </div>
                </div>
                <Link href="/patients/1">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Folake Adeyemi</p>
                    <p className="text-sm text-muted-foreground">Age: 35, Gestational Week: 32</p>
                    <div className="mt-1 flex items-center">
                      <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                      <span className="text-xs text-muted-foreground ml-2">Trigger: Elevated Blood Sugar</span>
                    </div>
                  </div>
                </div>
                <Link href="/patients/2">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Amina Okafor</p>
                    <p className="text-sm text-muted-foreground">Age: 27, Gestational Week: 24</p>
                    <div className="mt-1 flex items-center">
                      <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                      <span className="text-xs text-muted-foreground ml-2">All vitals normal</span>
                    </div>
                  </div>
                </div>
                <Link href="/patients/3">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blockchain Records</CardTitle>
            <CardDescription>
              Recent health records stored on blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blockchainTxs.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <GitMerge className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">Transaction ID: {tx.id}</p>
                      <div className="mt-1 flex items-center">
                        <Badge className="bg-blue-100 text-blue-800">{tx.status}</Badge>
                        <span className="text-xs text-muted-foreground ml-2">{tx.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Link href="/blockchain-records" className="block text-center mt-2">
                <Button variant="outline" size="sm">
                  View All Blockchain Records
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 