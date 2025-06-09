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
  Check
} from 'lucide-react';
import { Alert } from '@/lib/firebase/alerts';
import { Patient } from '@/lib/firebase/patients';

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        setLoading(true);
        if (!resolvedParams.id) return;

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
    }

    fetchPatientData();
  }, [resolvedParams.id]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <span className="ml-3">Loading patient data...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Patient Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested patient could not be found.</p>
        <Button onClick={() => router.push('/patients')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
      </div>
    );
  }

  // Functions to get risk level badge color
  const getRiskBadgeColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get badge color for alert priority
  const getAlertBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'medication': return <Bell className="h-5 w-5 text-purple-500" />;
      case 'system': 
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="pl-0 -ml-4 mb-2" 
            onClick={() => router.push('/patients')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#2D7D89]">{patient.firstName}</span>
            <span className="text-[#F7913D]"> {patient.lastName}</span>
          </h1>
          <div className="flex items-center space-x-2">
            <Badge className={getRiskBadgeColor(patient.riskLevel)}>
              {patient.riskLevel || 'Unknown'} Risk
            </Badge>
            {patient.isPregnant && (
              <Badge variant="outline" className="border-[#2D7D89] text-[#2D7D89]">
                Pregnant
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button className="bg-[#2D7D89] hover:bg-[#236570]">
            Edit Patient
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#2D7D89]/10 data-[state=active]:text-[#2D7D89]">Overview</TabsTrigger>
          <TabsTrigger value="medical" className="data-[state=active]:bg-[#2D7D89]/10 data-[state=active]:text-[#2D7D89]">Medical</TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-[#2D7D89]/10 data-[state=active]:text-[#2D7D89]">Appointments</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-[#2D7D89]/10 data-[state=active]:text-[#2D7D89]">
            Alerts
            {alerts.filter(a => !a.read).length > 0 && (
              <Badge variant="destructive" className="ml-2 bg-[#F7913D] hover:bg-[#F7913D]">
                {alerts.filter(a => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm">
                      {patient.firstName} {patient.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4 text-gray-400" />
                      {patient.dateOfBirth ? formatDate(patient.dateOfBirth, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not provided'}
                      {patient.age && <span className="ml-2 text-gray-500">({patient.age} years)</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                    <dd className="mt-1 text-sm">
                      {patient.phone && (
                        <div className="flex items-center mb-1">
                          <Phone className="mr-1 h-4 w-4 text-gray-400" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center">
                          <Mail className="mr-1 h-4 w-4 text-gray-400" />
                          {patient.email}
                        </div>
                      )}
                    </dd>
                  </div>
                  {patient.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm flex">
                        <MapPin className="mr-1 h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{patient.address}</span>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                    <dd className="mt-1 text-sm">
                      {patient.bloodType || 'Not recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
                    <dd className="mt-1 text-sm">
                      <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                        {patient.riskLevel || 'Unknown'}
                      </Badge>
                    </dd>
                  </div>
                  {patient.isPregnant && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pregnancy</dt>
                      <dd className="mt-1 text-sm">
                        <Badge variant="outline" className="border-[#2D7D89] text-[#2D7D89]">
                          Pregnant
                        </Badge>
                        {patient.dueDate && (
                          <div className="mt-1 flex items-center">
                            <span className="text-gray-500 mr-1">Due date:</span>
                            <CalendarIcon className="mr-1 h-4 w-4 text-gray-400" />
                            {formatDate(patient.dueDate, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory ? (
                  <div className="text-sm">
                    {patient.medicalHistory}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No medical history recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes section */}
          {patient.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-line">
                  {patient.notes}
                </div>
              </CardContent>
            </Card>
          )}
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
              <Button onClick={() => router.push(`/alerts/create?patientId=${resolvedParams.id}`)}>
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
  );
} 