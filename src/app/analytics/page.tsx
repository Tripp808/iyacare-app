'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Heart,
  Calendar,
  Download,
  Filter,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Sample analytics data
const riskTrendsData = [
  { month: 'Jan', high: 12, medium: 25, low: 48 },
  { month: 'Feb', high: 8, medium: 30, low: 52 },
  { month: 'Mar', high: 15, medium: 28, low: 45 },
  { month: 'Apr', high: 10, medium: 32, low: 58 },
  { month: 'May', high: 6, medium: 35, low: 62 },
  { month: 'Jun', high: 9, medium: 33, low: 59 }
];

const vitalSignsData = [
  { time: '06:00', systolic: 120, diastolic: 80, heartRate: 72 },
  { time: '08:00', systolic: 125, diastolic: 82, heartRate: 75 },
  { time: '10:00', systolic: 130, diastolic: 85, heartRate: 78 },
  { time: '12:00', systolic: 128, diastolic: 84, heartRate: 76 },
  { time: '14:00', systolic: 135, diastolic: 88, heartRate: 80 },
  { time: '16:00', systolic: 132, diastolic: 86, heartRate: 77 },
  { time: '18:00', systolic: 128, diastolic: 83, heartRate: 74 }
];

const riskDistributionData = [
  { name: 'Low Risk', value: 65, color: '#22c55e' },
  { name: 'Medium Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' }
];

const geographicData = [
  { region: 'Lagos', patients: 145, alerts: 8 },
  { region: 'Abuja', patients: 98, alerts: 5 },
  { region: 'Kano', patients: 87, alerts: 12 },
  { region: 'Port Harcourt', patients: 76, alerts: 6 },
  { region: 'Ibadan', patients: 65, alerts: 4 },
  { region: 'Enugu', patients: 54, alerts: 7 }
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into maternal health trends and outcomes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="bg-[#2D7D89] hover:bg-[#236570] text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">89</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1 text-green-500" />
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1 text-green-500" />
              -15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">156</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Trends</CardTitle>
            <CardDescription>Monthly distribution of patient risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low Risk" />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current Risk Distribution</CardTitle>
            <CardDescription>Breakdown of current patient risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vital Signs Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle>Average Vital Signs Today</CardTitle>
            <CardDescription>Real-time monitoring of patient vital signs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vitalSignsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#2D7D89" 
                  strokeWidth={2}
                  name="Systolic BP"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#F7913D" 
                  strokeWidth={2}
                  name="Diastolic BP"
                />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Heart Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Patient distribution and alerts by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={geographicData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#2D7D89" name="Patients" />
                <Bar dataKey="alerts" fill="#F7913D" name="Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
          <CardDescription>Latest platform activities and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Successful Risk Prediction</p>
                  <p className="text-sm text-muted-foreground">AI model identified 3 high-risk cases early</p>
                </div>
              </div>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-medium">IoT Device Alert</p>
                  <p className="text-sm text-muted-foreground">Blood pressure spike detected in Lagos region</p>
                </div>
              </div>
              <Badge variant="secondary">4 hours ago</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Blockchain Sync Complete</p>
                  <p className="text-sm text-muted-foreground">127 patient records synchronized to consortium network</p>
                </div>
              </div>
              <Badge variant="secondary">6 hours ago</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Weekly Report Generated</p>
                  <p className="text-sm text-muted-foreground">Maternal health outcomes report for week ending Jan 21</p>
                </div>
              </div>
              <Badge variant="secondary">1 day ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 