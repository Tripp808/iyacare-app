'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity,
  Download,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnalyticsService, AnalyticsData } from '@/services/analytics.service';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalyticsData = async (selectedTimeRange?: '7days' | '30days' | '90days' | '1year') => {
    try {
      setIsLoading(true);
      const data = await AnalyticsService.getAnalyticsData(selectedTimeRange || timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalyticsData();
    setIsRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const handleTimeRangeChange = (newTimeRange: '7days' | '30days' | '90days' | '1year') => {
    setTimeRange(newTimeRange);
    loadAnalyticsData(newTimeRange);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500 mb-4">Unable to load analytics data</p>
              <Button onClick={() => loadAnalyticsData()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into patient health and system performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.totalPatients.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {analyticsData.patientGrowth >= 0 ? '+' : ''}{analyticsData.patientGrowth.toFixed(1)}% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Cases</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.highRiskCases}</p>
                <p className="text-sm text-gray-500 mt-2">Active monitoring required</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.emergencyAlerts}</p>
                <p className="text-sm text-gray-500 mt-2">Last {timeRange.replace('days', ' days')}</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitoring</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.activeMonitoring}</p>
                <p className="text-sm text-gray-500 mt-2">Currently being monitored</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Risk Level Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.riskTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.riskTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                  <Bar dataKey="high" stackId="a" fill="#ef4444" />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="low" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h3>
                  <p className="text-gray-500">Patient data will appear here as you add patients to the system</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.vitalSignsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.vitalSignsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                    stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Systolic BP"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                    stroke="#10b981" 
                  strokeWidth={2}
                  name="Diastolic BP"
                />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                    stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Heart Rate"
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vital Signs Data</h3>
                  <p className="text-gray-500">Vital signs monitoring data will appear here when patients' vitals are recorded</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.riskDistribution.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.riskDistribution.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.riskDistribution.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Risk Data</h3>
                  <p className="text-gray-500">Risk distribution will appear here as you add patients to the system</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.geographicData.length > 0 ? (
                analyticsData.geographicData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{region.region}</p>
                      <p className="text-sm text-gray-600">{region.patients} patients</p>
                    </div>
                    <Badge variant="secondary">
                      {region.alerts} alerts
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No geographic data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.length > 0 ? (
              analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`h-2 w-2 rounded-full bg-${activity.color}-500`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                  <div className="text-sm text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
            </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 