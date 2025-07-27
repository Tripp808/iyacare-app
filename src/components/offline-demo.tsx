'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOfflineStorage } from '@/hooks/use-offline-storage';
import { useOffline } from '@/providers/offline-provider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Heart, 
  Calendar, 
  Wifi, 
  WifiOff,
  Save,
  Database 
} from 'lucide-react';

export const OfflineDemo: React.FC = () => {
  const { savePatientOffline, saveVitalsOffline, saveAppointmentOffline, isOfflineMode, isOnline } = useOfflineStorage();
  const { offlineData, getOfflineDataCount } = useOffline();
  
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    gender: 'female' as 'male' | 'female' | 'other',
    dateOfBirth: '',
  });
  
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    date: '',
    time: '',
  });

  const handleSavePatient = () => {
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.age) return;
    
    const success = savePatientOffline({
      firstName: patientForm.firstName,
      lastName: patientForm.lastName,
      name: `${patientForm.firstName} ${patientForm.lastName}`, // For backward compatibility
      age: parseInt(patientForm.age),
      phone: patientForm.phone,
      email: patientForm.email,
      gender: patientForm.gender,
      dateOfBirth: patientForm.dateOfBirth ? new Date(patientForm.dateOfBirth) : new Date(Date.now() - parseInt(patientForm.age) * 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date().toISOString(),
    });
    
    if (success) {
      setPatientForm({ 
        firstName: '', 
        lastName: '', 
        age: '', 
        phone: '', 
        email: '', 
        gender: 'female' as 'male' | 'female' | 'other',
        dateOfBirth: ''
      });
    }
  };

  const handleSaveVitals = () => {
    if (!vitalsForm.heartRate || !vitalsForm.bloodPressure) return;
    
    const success = saveVitalsOffline({
      heartRate: parseInt(vitalsForm.heartRate),
      bloodPressure: vitalsForm.bloodPressure,
      temperature: vitalsForm.temperature ? parseFloat(vitalsForm.temperature) : null,
      recordedAt: new Date().toISOString(),
    });
    
    if (success) {
      setVitalsForm({ heartRate: '', bloodPressure: '', temperature: '' });
    }
  };

  const handleSaveAppointment = () => {
    if (!appointmentForm.patientName || !appointmentForm.date) return;
    
    const success = saveAppointmentOffline({
      patientName: appointmentForm.patientName,
      date: appointmentForm.date,
      time: appointmentForm.time,
      createdAt: new Date().toISOString(),
    });
    
    if (success) {
      setAppointmentForm({ patientName: '', date: '', time: '' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Functionality Demo
          </CardTitle>
          <CardDescription>
            Test the offline data storage simulation. When offline mode is enabled, 
            data will be stored locally and synced when you go back online.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                Status: {isOfflineMode ? 'Offline Mode' : 'Online'}
              </span>
            </div>
            <Badge variant="outline">
              {getOfflineDataCount()} items stored offline
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4" />
              Add Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="patient-first-name">First Name</Label>
                <Input
                  id="patient-first-name"
                  value={patientForm.firstName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="patient-last-name">Last Name</Label>
                <Input
                  id="patient-last-name"
                  value={patientForm.lastName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="patient-age">Age</Label>
                <Input
                  id="patient-age"
                  type="number"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="patient-gender">Gender</Label>
                <select
                  id="patient-gender"
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="patient-phone">Phone</Label>
              <Input
                id="patient-phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="patient-email">Email (Optional)</Label>
              <Input
                id="patient-email"
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="patient-dob">Date of Birth (Optional)</Label>
              <Input
                id="patient-dob"
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleSavePatient}
              className="w-full"
              disabled={!patientForm.firstName || !patientForm.lastName || !patientForm.age}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Patient
            </Button>
          </CardContent>
        </Card>

        {/* Vitals Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-4 w-4" />
              Record Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
              <Input
                id="heart-rate"
                type="number"
                value={vitalsForm.heartRate}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, heartRate: e.target.value }))}
                placeholder="72"
              />
            </div>
            <div>
              <Label htmlFor="blood-pressure">Blood Pressure</Label>
              <Input
                id="blood-pressure"
                value={vitalsForm.bloodPressure}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                placeholder="120/80"
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={vitalsForm.temperature}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="36.5"
              />
            </div>
            <Button 
              onClick={handleSaveVitals}
              className="w-full"
              disabled={!vitalsForm.heartRate || !vitalsForm.bloodPressure}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Vitals
            </Button>
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appointment-patient">Patient Name</Label>
              <Input
                id="appointment-patient"
                value={appointmentForm.patientName}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Patient name"
              />
            </div>
            <div>
              <Label htmlFor="appointment-date">Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="appointment-time">Time</Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleSaveAppointment}
              className="w-full"
              disabled={!appointmentForm.patientName || !appointmentForm.date}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Appointment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Offline Data Display */}
      {getOfflineDataCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Offline Data Summary</CardTitle>
            <CardDescription>
              Data stored locally while offline. This will be synced when you go back online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{offlineData.patients.length}</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{offlineData.vitals.length}</div>
                <div className="text-sm text-muted-foreground">Vital Records</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{offlineData.appointments.length}</div>
                <div className="text-sm text-muted-foreground">Appointments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
