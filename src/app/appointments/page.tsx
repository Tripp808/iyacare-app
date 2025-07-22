'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  Plus,
  Search,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  Edit,
  Trash2
} from 'lucide-react';
import { getPatients, Patient } from '@/lib/firebase/patients';
import { appointmentsService, Appointment as FirebaseAppointment } from '@/lib/firebase/appointments';
import { toast } from 'sonner';

// Local appointment type for component state
type AppointmentType = FirebaseAppointment;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: 'routine' as const,
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients and appointments
      const [patientsResult, appointmentsResult] = await Promise.all([
        getPatients(),
        appointmentsService.getAppointments()
      ]);
      
      if (patientsResult.success) {
        setPatients(patientsResult.patients || []);
      }
      
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.appointments || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      toast.error('Selected patient not found');
      return;
    }

    try {
      const appointmentData = {
        patientId: formData.patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'scheduled' as const,
        location: formData.location,
        notes: formData.notes
      };

      const result = await appointmentsService.addAppointment(appointmentData);
      
      if (result.success) {
        toast.success('Appointment created successfully!');
        setShowNewAppointment(false);
        setFormData({
          patientId: '',
          date: '',
          time: '',
          type: 'routine',
          location: '',
          notes: ''
        });
        fetchData(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string, appointmentDate: string) => {
    if (!appointmentId) {
      toast.error('Invalid appointment ID');
      return;
    }

    // Check if appointment is in the past
    const appointmentDateObj = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDateObj < today) {
      toast.error('Cannot cancel past appointments');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) return;

    setCancellingId(appointmentId);
    
    try {
      const result = await appointmentsService.cancelAppointment(appointmentId, 'Cancelled by user');
      
      if (result.success) {
        toast.success('Appointment cancelled successfully');
        fetchData(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayAppointments = filteredAppointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = filteredAppointments.filter(apt => apt.date > new Date().toISOString().split('T')[0]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD] truncate">Appointments</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage patient appointments and scheduling
          </p>
        </div>
        
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
          <DialogTrigger asChild>
            <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Appointment</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Create New Appointment</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id || ''}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Central Hospital Lagos"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewAppointment(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Create Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-[#2D7D89] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl md:text-2xl font-bold truncate">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-xl md:text-2xl font-bold truncate">{upcomingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-xl md:text-2xl font-bold truncate">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl md:text-2xl font-bold truncate">
                  {filteredAppointments.filter(apt => apt.status === 'completed').length}
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
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
            <p className="text-muted-foreground mb-4">
              {patients.length === 0 
                ? "You need to add patients first before creating appointments."
                : "Start by creating your first appointment with a registered patient."
              }
            </p>
            {patients.length === 0 ? (
              <Link href="/patients/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient First
                </Button>
              </Link>
            ) : (
              <Button onClick={() => setShowNewAppointment(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create First Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <User className="h-5 w-5 text-[#2D7D89] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{appointment.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Badge variant="outline">
                        {appointment.type}
                      </Badge>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelAppointment(appointment.id!, appointment.date)}
                            disabled={cancellingId === appointment.id}
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {cancellingId === appointment.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                          <Link href={`/patients/${appointment.patientId}`}>
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                              <User className="h-3 w-3" />
                            </Button>
                          </Link>
                        </>
                      )}
                      
                      {appointment.status === 'cancelled' && appointment.cancellationReason && (
                        <span className="text-xs text-red-600 italic truncate max-w-[200px]">
                          Cancelled: {appointment.cancellationReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{appointment.location}</span>
                  </div>
                  {appointment.notes && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground flex-shrink-0">Notes:</span>
                      <span className="break-words">{appointment.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 