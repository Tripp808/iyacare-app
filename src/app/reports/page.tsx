'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Users,
  AlertTriangle,
  Heart,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Share,
  Printer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample reports data
const reports = [
  {
    id: 1,
    title: 'Monthly Patient Summary',
    description: 'Comprehensive overview of patient statistics for January 2025',
    type: 'Patient Analytics',
    dateGenerated: '2025-01-25',
    status: 'completed',
    format: 'PDF',
    size: '2.4 MB',
    patients: 145,
    keyMetrics: {
      highRisk: 23,
      emergencies: 8,
      appointments: 89
    }
  },
  {
    id: 2,
    title: 'Risk Assessment Report',
    description: 'Analysis of maternal health risk factors and trends',
    type: 'Risk Analysis',
    dateGenerated: '2025-01-24',
    status: 'completed',
    format: 'Excel',
    size: '1.8 MB',
    patients: 145,
    keyMetrics: {
      highRisk: 23,
      mediumRisk: 67,
      lowRisk: 55
    }
  },
  {
    id: 3,
    title: 'IoT Device Performance',
    description: 'Weekly performance and alert summary from connected devices',
    type: 'Device Analytics',
    dateGenerated: '2025-01-23',
    status: 'completed',
    format: 'PDF',
    size: '3.1 MB',
    patients: 98,
    keyMetrics: {
      activeDevices: 98,
      alerts: 24,
      dataPoints: 15420
    }
  },
  {
    id: 4,
    title: 'Regional Health Overview',
    description: 'Geographic distribution and health outcomes by region',
    type: 'Geographic Analysis',
    dateGenerated: '2025-01-22',
    status: 'processing',
    format: 'PDF',
    size: '4.2 MB',
    patients: 245,
    keyMetrics: {
      regions: 12,
      facilities: 28,
      coverage: 85
    }
  },
  {
    id: 5,
    title: 'Emergency Response Analytics',
    description: 'Response times and outcomes for emergency situations',
    type: 'Emergency Analytics',
    dateGenerated: '2025-01-20',
    status: 'scheduled',
    format: 'Excel',
    size: '1.5 MB',
    patients: 67,
    keyMetrics: {
      emergencies: 34,
      avgResponse: 12,
      outcomes: 94
    }
  }
];

const reportTemplates = [
  {
    id: 'patient-summary',
    name: 'Patient Summary Report',
    description: 'Comprehensive patient statistics and outcomes',
    icon: Users,
    category: 'Patient Analytics'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Report',
    description: 'Maternal health risk analysis and trends',
    icon: AlertTriangle,
    category: 'Risk Analysis'
  },
  {
    id: 'vital-signs',
    name: 'Vital Signs Report',
    description: 'Detailed analysis of patient vital signs data',
    icon: Heart,
    category: 'Clinical Data'
  },
  {
    id: 'device-performance',
    name: 'IoT Device Performance',
    description: 'Device connectivity and performance metrics',
    icon: Activity,
    category: 'Device Analytics'
  },
  {
    id: 'geographic',
    name: 'Geographic Analysis',
    description: 'Regional health outcomes and coverage',
    icon: BarChart3,
    category: 'Geographic Analysis'
  },
  {
    id: 'emergency',
    name: 'Emergency Response',
    description: 'Emergency situations and response analytics',
    icon: TrendingUp,
    category: 'Emergency Analytics'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ReportsPage() {
  const [showNewReport, setShowNewReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage healthcare analytics reports
          </p>
        </div>
        <Button 
          onClick={() => setShowNewReport(true)}
          className="bg-[#2D7D89] hover:bg-[#236570] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#2D7D89]" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Patient Analytics">Patient Analytics</SelectItem>
                <SelectItem value="Risk Analysis">Risk Analysis</SelectItem>
                <SelectItem value="Device Analytics">Device Analytics</SelectItem>
                <SelectItem value="Geographic Analysis">Geographic Analysis</SelectItem>
                <SelectItem value="Emergency Analytics">Emergency Analytics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            View and download your healthcare analytics reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Generated: {new Date(report.dateGenerated).toLocaleDateString()}</span>
                      <span>{report.format} • {report.size}</span>
                      <span>{report.patients} patients</span>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="flex items-center gap-4 mt-3">
                      {Object.entries(report.keyMetrics).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="font-medium">{value}</span>
                          {key.includes('Response') && <span className="text-muted-foreground"> min</span>}
                          {key.includes('coverage') && <span className="text-muted-foreground">%</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {report.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Quick access to common report types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-[#2D7D89]" />
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Report Modal */}
      {showNewReport && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generate New Report</CardTitle>
              <Button 
                variant="ghost" 
                onClick={() => setShowNewReport(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <CardDescription>
              Create a custom healthcare analytics report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">Report Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patients">Patient Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="high-risk">High Risk Only</SelectItem>
                    <SelectItem value="active">Active Monitoring</SelectItem>
                    <SelectItem value="region">By Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Generate now" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Generate Now</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input placeholder="Enter custom report title..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                placeholder="Brief description of the report purpose..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewReport(false)}
              >
                Cancel
              </Button>
              <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 