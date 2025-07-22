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
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AnalyticsService, type AnalyticsData } from '@/services/analytics.service';

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
      console.log('Analytics data loaded:', data);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'emergency': return <XCircle className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'medication': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-600 bg-red-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'blue': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading || !analyticsData) {
  return (
    <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2">
                Comprehensive insights into patient health and system performance
              </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {formatDate(analyticsData.dataStatus.lastUpdated)}
            </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-800">
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
              className="bg-white dark:bg-gray-800 w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            <Button variant="outline" className="bg-white dark:bg-gray-800 w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-blue-500">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Total Patients</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">{analyticsData.totalPatients.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                      <TrendingUp className={`h-3 w-3 ${analyticsData.patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs font-medium ${analyticsData.patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData.patientGrowth >= 0 ? '+' : ''}{analyticsData.patientGrowth.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
                    </div>
                  </div>
                <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">High Risk Cases</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{analyticsData.highRiskCases}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                      {analyticsData.totalPatients > 0 ? 
                        `${((analyticsData.highRiskCases / analyticsData.totalPatients) * 100).toFixed(1)}% of total patients` :
                        'No patients yet'
                      }
                    </p>
                  </div>
                <div className="h-10 w-10 bg-red-50 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Emergency Alerts</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{analyticsData.emergencyAlerts}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                      In the last {timeRange === '7days' ? '7 days' : 
                                   timeRange === '30days' ? '30 days' :
                                   timeRange === '90days' ? '90 days' : 'year'}
                    </p>
                  </div>
                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Active Monitoring</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{analyticsData.activeMonitoring}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                      {analyticsData.totalPatients > 0 ? 
                        `${((analyticsData.activeMonitoring / analyticsData.totalPatients) * 100).toFixed(0)}% of total patients` :
                        'Ready for monitoring'
                      }
                    </p>
                  </div>
                <div className="h-10 w-10 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Risk Level Trends */}
          <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base md:text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Risk Level Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {analyticsData.riskTrends && analyticsData.riskTrends.length > 0 ? (
                <div className="h-[200px] md:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.riskTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="month" 
                        className="text-gray-600 dark:text-gray-300"
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis className="text-gray-600 dark:text-gray-300" fontSize={10} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="high" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="High Risk"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="medium" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Medium Risk"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="low" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="Low Risk"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Building Trend Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risk trends will appear as more patient data is collected over time</p>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Vital Signs Monitoring */}
          <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                  <Activity className="h-4 w-4" />
                  Vital Signs Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {analyticsData.vitalSignsData && analyticsData.vitalSignsData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.vitalSignsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="time" 
                        className="text-gray-600 dark:text-gray-300"
                        fontSize={12}
                      />
                      <YAxis className="text-gray-600 dark:text-gray-300" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="systolic" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Systolic BP"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="diastolic" 
                        stroke="#06b6d4" 
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
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No Vital Signs Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vital signs monitoring data will appear here when patients' vitals are recorded</p>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Risk Distribution */}
          <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {analyticsData.riskDistribution && analyticsData.riskDistribution.some(item => item.value > 0) ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.riskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false}
                        label={false}
                      >
                        {analyticsData.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={() => ''}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {analyticsData.riskDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900 dark:text-white">{item.value}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({analyticsData.totalPatients > 0 ? ((item.value / analyticsData.totalPatients) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No Risk Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient risk distribution will appear here as you add patients to the system</p>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
          <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                  <MapPin className="h-4 w-4" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
              {analyticsData.geographicData && analyticsData.geographicData.length > 0 ? (
                <div className="space-y-3">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.geographicData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="region" 
                          className="text-gray-600 dark:text-gray-300"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                          fontSize={10}
                        />
                        <YAxis className="text-gray-600 dark:text-gray-300" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="patients" fill="#3b82f6" name="Patients" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="alerts" fill="#f59e0b" name="Alerts" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Location</span>
                      <div className="flex gap-4">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Patients</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Alerts</span>
                      </div>
                    </div>
                    {analyticsData.geographicData.slice(0, 4).map((location, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{location.region}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {((location.patients / analyticsData.totalPatients) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{location.patients}</span>
                          <Badge 
                            variant={location.alerts > 5 ? "destructive" : location.alerts > 0 ? "default" : "secondary"}
                            className="w-8 justify-center text-xs"
                          >
                            {location.alerts}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {analyticsData.geographicData.length > 4 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{analyticsData.geographicData.length - 4} more locations
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No Geographic Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Geographic distribution will show patient locations across Sub-Saharan Africa</p>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
            {analyticsData.recentActivity && analyticsData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.color)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Patient alerts and system activities will appear here</p>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
} 