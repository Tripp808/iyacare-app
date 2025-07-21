'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getPatient } from '@/lib/firebase/patients';
import { getPatientAlerts, markAlertAsRead } from '@/lib/firebase/alerts';
import { formatDate } from '@/lib/utils';
import { 
  CalendarIcon, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  ChevronLeft,
  Calendar,
  Bell,
  Check,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Ruler,
  Droplets,
  Clock,
  FileText,
  Stethoscope,
  Pill,
  UserCheck,
  TrendingUp,
  Download,
  Share,
  Edit,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Alert } from '@/lib/firebase/alerts';
import { Patient } from '@/lib/firebase/patients';
import RiskAssessment from '@/components/ai/RiskAssessment';

// Mock data for enhanced features - in real app, this would come from Firebase
const mockVitalSigns = [
  { date: '2024-01-15', bloodPressure: '120/80', heartRate: 72, temperature: 98.6, weight: 65, height: 165 },
  { date: '2024-01-10', bloodPressure: '118/78', heartRate: 75, temperature: 98.4, weight: 64.8, height: 165 },
  { date: '2024-01-05', bloodPressure: '122/82', heartRate: 70, temperature: 98.7, weight: 65.2, height: 165 },
];

const mockAppointments = [
  { id: '1', date: '2024-01-20', time: '10:00 AM', type: 'Prenatal Checkup', status: 'scheduled', doctor: 'Dr. Sarah Johnson' },
  { id: '2', date: '2024-01-15', time: '2:00 PM', type: 'Blood Test', status: 'completed', doctor: 'Dr. Michael Chen' },
  { id: '3', date: '2024-01-10', time: '11:30 AM', type: 'Ultrasound', status: 'completed', doctor: 'Dr. Emily Davis' },
];

const mockMedications = [
  { name: 'Prenatal Vitamins', dosage: '1 tablet daily', frequency: 'Daily', startDate: '2024-01-01', status: 'active' },
  { name: 'Iron Supplement', dosage: '65mg', frequency: 'Twice daily', startDate: '2024-01-05', status: 'active' },
  { name: 'Folic Acid', dosage: '400mcg', frequency: 'Daily', startDate: '2024-01-01', status: 'active' },
];

const mockLabResults = [
  { test: 'Complete Blood Count', date: '2024-01-15', result: 'Normal', status: 'completed' },
  { test: 'Glucose Screening', date: '2024-01-10', result: 'Normal', status: 'completed' },
  { test: 'Urine Analysis', date: '2024-01-05', result: 'Normal', status: 'completed' },
];

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestVitals, setLatestVitals] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchPatientData();
      fetchLatestVitals();
    }
  }, [resolvedParams]);

  const fetchLatestVitals = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      // Import dynamically to avoid potential import issues
      const { getVitalSignsByPatientId } = await import('@/lib/firebase/vitals');
      const vitalsResult = await getVitalSignsByPatientId(resolvedParams.id, 1);
      
      if (vitalsResult.success && vitalsResult.vitals.length > 0) {
        const vitals = vitalsResult.vitals[0];
        setLatestVitals({
          systolicBP: vitals.systolicBP,
          diastolicBP: vitals.diastolicBP,
          bloodSugar: vitals.bloodSugar,
          temperature: vitals.temperature,
          heartRate: vitals.heartRate
        });
      }
    } catch (error) {
      console.error('Error fetching latest vitals:', error);
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      if (!resolvedParams?.id) return;

      // Fetch patient data
      const patientResult = await getPatient(resolvedParams.id);
      if (patientResult.success) {
        setPatient(patientResult.patient || null);
      } else {
        console.error('Failed to fetch patient:', patientResult.error);
      }

      // Fetch patient alerts
      const alertsResult = await getPatientAlerts(resolvedParams.id);
      if (alertsResult.success) {
        setAlerts(alertsResult.alerts || []);
      } else {
        console.error('Failed to fetch alerts:', alertsResult.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark an alert as read
  const handleMarkAsRead = async (alertId: string) => {
    try {
      const result = await markAlertAsRead(alertId);
      
      if (result.success) {
        // Update the alerts state to reflect the change
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        ));
      } else {
        console.error('Failed to mark alert as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D7D89] border-r-transparent"></div>
        <span className="ml-3 text-gray-900 dark:text-white">Loading patient data...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Patient Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested patient could not be found.</p>
        <Button onClick={() => router.push('/patients')} className="bg-[#2D7D89] hover:bg-[#245A62] text-white">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
      </div>
    );
  }

  // Functions to get risk level badge color
  const getRiskBadgeColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800';
    }
  };

  // Get badge color for alert priority
  const getAlertBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800';
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'medication': return <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'system': 
      default: return <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getAppointmentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculatePregnancyWeeks = (dueDate: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    const currentWeek = 40 - diffWeeks;
    return currentWeek > 0 ? currentWeek : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-4">
          <Button 
            variant="ghost" 
              className="pl-0 -ml-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" 
            onClick={() => router.push('/patients')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D7D89] to-[#4AA0AD] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {patient.firstName} {patient.lastName}
          </h1>
                <div className="flex items-center gap-2 mt-1">
            <Badge className={getRiskBadgeColor(patient.riskLevel)}>
              {patient.riskLevel || 'Unknown'} Risk
            </Badge>
            {patient.isPregnant && (
                    <Badge className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800">
                      {patient.dueDate ? calculatePregnancyWeeks(patient.dueDate) || 0 : 0} weeks pregnant
              </Badge>
            )}
          </div>
        </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-gray-900 dark:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="text-gray-900 dark:text-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          <Button 
            className="bg-[#2D7D89] hover:bg-[#245A62] text-white"
            onClick={() => router.push(`/patients/${resolvedParams?.id}/edit`)}
            disabled={!resolvedParams?.id}
          >
              <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAge(patient.dateOfBirth)} years
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-[#2D7D89]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Blood Type</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {patient.bloodType || 'Unknown'}
                  </p>
                </div>
                <Droplets className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Visit</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {patient.lastVisit ? formatDate(patient.lastVisit, { month: 'short', day: 'numeric' }) : 'None'}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alerts.filter(a => !a.read).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#2D7D89] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="medical" className="data-[state=active]:bg-[#2D7D89] data-[state=active]:text-white">
              Medical
            </TabsTrigger>
            <TabsTrigger value="vitals" className="data-[state=active]:bg-[#2D7D89] data-[state=active]:text-white">
              Vitals
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-[#2D7D89] data-[state=active]:text-white">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#2D7D89] data-[state=active]:text-white">
            Alerts
            {alerts.filter(a => !a.read).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                {alerts.filter(a => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Personal Information */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <UserCheck className="w-5 h-5 text-[#2D7D89]" />
                    Personal Information
                  </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">
                      {patient.dateOfBirth ? formatDate(patient.dateOfBirth, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not provided'}
                        </p>
                      </div>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
                      <div className="space-y-1">
                      {patient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900 dark:text-white">{patient.phone}</p>
                        </div>
                      )}
                      {patient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900 dark:text-white">{patient.email}</p>
                        </div>
                      )}
                      </div>
                  </div>
                  {patient.address && (
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-gray-900 dark:text-white">{patient.address}</p>
                        </div>
                    </div>
                  )}
                  </div>
              </CardContent>
            </Card>

              {/* Medical Summary */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Stethoscope className="w-5 h-5 text-[#2D7D89]" />
                    Medical Summary
                  </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</p>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-red-500" />
                        <p className="text-gray-900 dark:text-white">{patient.bloodType || 'Not recorded'}</p>
                      </div>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Level</p>
                      <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                        {patient.riskLevel || 'Unknown'} Risk
                      </Badge>
                  </div>
                  {patient.isPregnant && (
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pregnancy Status</p>
                        <div className="space-y-2">
                          <Badge className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300">
                          Pregnant
                        </Badge>
                        {patient.dueDate && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Due Date:</p>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-gray-900 dark:text-white">
                            {formatDate(patient.dueDate, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                                </p>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Progress:</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress 
                                    value={patient.dueDate ? (calculatePregnancyWeeks(patient.dueDate) || 0) / 40 * 100 : 0} 
                                    className="flex-1"
                                  />
                                  <span className="text-sm font-medium">
                                    {patient.dueDate ? calculatePregnancyWeeks(patient.dueDate) || 0 : 0}/40 weeks
                                  </span>
                                </div>
                              </div>
                          </div>
                        )}
                        </div>
                    </div>
                  )}
                  </div>
              </CardContent>
            </Card>

              {/* AI Risk Assessment */}
              <RiskAssessment 
                patient={patient} 
                latestVitals={latestVitals} 
                onRiskUpdate={(risk, confidence) => {
                  console.log('AI Risk Update:', risk, confidence);
                  // You can update patient risk level here if needed
                }}
              />
            </div>

            {/* Medical History and Notes */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="w-5 h-5 text-[#2D7D89]" />
                    Medical History
                  </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory ? (
                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                    {patient.medicalHistory}
                  </div>
                ) : (
                    <div className="text-center py-4">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No medical history recorded
                      </p>
                  </div>
                )}
              </CardContent>
            </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="w-5 h-5 text-[#2D7D89]" />
                    Notes
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  {patient.notes ? (
                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                  {patient.notes}
                </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No notes recorded
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
            </div>
        </TabsContent>
        
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Detailed medical information for this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Medical records tab content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
          
          <TabsContent value="vitals">
            <div className="space-y-6">
              {/* AI Features Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity className="w-5 h-5 text-blue-600" />
                    AI Risk Assessment Features
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Current vital signs and patient data used by our AI model to calculate maternal health risk levels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Age */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Patient Demographics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age *
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {calculateAge(patient.dateOfBirth)} years
                            </span>
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Based on Date of Birth: {patient.dateOfBirth ? formatDate(patient.dateOfBirth, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Core AI Feature</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Age is critical for risk assessment</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Vital Signs */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Current Vital Signs
                    </h4>
                    
                    {latestVitals ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Blood Pressure *
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {latestVitals.systolicBP || '---'}/{latestVitals.diastolicBP || '---'}
                              </span>
                              <span className="text-xs text-gray-500">mmHg</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Normal: 90-140 / 60-90 mmHg</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Heart Rate *
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {latestVitals.heartRate || '---'}
                              </span>
                              <span className="text-xs text-gray-500">bpm</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Blood Sugar *
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {latestVitals.bloodSugar || '---'}
                              </span>
                              <span className="text-xs text-gray-500">mg/dL</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Normal: 70-140 mg/dL</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Body Temperature *
                          </label>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {latestVitals.temperature || '---'}
                              </span>
                              <span className="text-xs text-gray-500">°C</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Normal: 36-37.5°C</p>
                          </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-2">
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h5 className="font-medium text-green-900 dark:text-green-300">Data Complete</h5>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-400">
                              All vital signs are available for AI risk assessment. The AI model can provide accurate risk predictions based on this data.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h5 className="font-medium text-amber-900 dark:text-amber-300">No Vital Signs Recorded</h5>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                          No vital signs have been recorded for this patient. AI risk assessment requires the following data:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-amber-700 dark:text-amber-500">
                          <div>• Blood Pressure</div>
                          <div>• Heart Rate</div>
                          <div>• Blood Sugar</div>
                          <div>• Body Temperature</div>
                          <div>• Patient Age</div>
                        </div>
                        <div className="mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => router.push(`/patients/${resolvedParams?.id}/edit`)}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Add Vital Signs
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Model Information */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">AI Risk Assessment Model</h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-400 mb-3">
                          Our AI model analyzes <strong>6 key features</strong> to predict maternal health risks:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-indigo-700 dark:text-indigo-500">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Patient Age
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Systolic Blood Pressure
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Diastolic Blood Pressure
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Blood Sugar Level
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Body Temperature
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            Heart Rate
                          </div>
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3">
                          Complete and accurate data for all features ensures the most reliable risk predictions.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs History */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-[#2D7D89]" />
                    Vital Signs History
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Historical vital signs data and trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Vital Signs History
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Historical vital signs tracking will be displayed here.
                    </p>
                    <Button 
                      onClick={() => router.push(`/patients/${resolvedParams?.id}/edit`)}
                      className="bg-[#2D7D89] hover:bg-[#245A62] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record New Vitals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                Appointment history and upcoming appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Appointments tab content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Patient Alerts</CardTitle>
                <CardDescription>
                  View all alerts related to this patient
                </CardDescription>
              </div>
              <Button onClick={() => router.push(`/alerts/create?patientId=${resolvedParams?.id}`)} disabled={!resolvedParams?.id}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Alerts Found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    There are no alerts for this patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={alert.read ? 'bg-gray-50' : 'bg-white'}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            {getAlertIcon(alert.type)}
                            <span className="ml-2 text-xs uppercase font-semibold">
                              {alert.type}
                            </span>
                            <Badge className={`ml-2 ${getAlertBadgeColor(alert.priority)}`}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(alert.createdAt)}
                          </div>
                        </div>
                        <div className="mt-2">
                          {alert.message}
                        </div>
                        {!alert.read && (
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => alert.id && handleMarkAsRead(alert.id)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="ml-1">Mark Read</span>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
} 