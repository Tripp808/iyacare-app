'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Calendar, Save, Loader2, Activity, Stethoscope, AlertTriangle } from 'lucide-react';
import { getPatient, updatePatient } from '@/lib/firebase/patients';
import { toast } from 'sonner';

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    pregnancyStage: '',
    edd: '', // Estimated Due Date
    medicalHistory: '',
    bloodType: '',
    notes: '',
    assignedDoctor: '',
    assignedMidwife: '',
    isPregnant: false,
    // New fields for maternal health monitoring
    gravida: '',
    parity: '',
    previousComplications: '',
    gestationalAgeWeeks: '',
    ancVisits: '',
    hemoglobin: '',
    bmi: '',
    fetalMovementCount: '',
    // Current vitals
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    bloodSugar: '',
    temperature: '',
    // Blockchain and communication preferences
    preferredLanguage: '',
    emergencyContact: '',
    assignedCHW: '',
    consentToBlockchain: false,
    location: ''
  });

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
    }
  }, [resolvedParams]);

  const fetchPatientData = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      setLoading(true);
      const result = await getPatient(resolvedParams.id);
      
      if (result.success && result.patient) {
        const patient = result.patient;
        
        // Convert Firebase Timestamps to date strings for inputs
        const formatDateForInput = (timestamp: any) => {
          if (!timestamp) return '';
          let date;
          if (timestamp.toDate) {
            date = timestamp.toDate();
          } else if (timestamp instanceof Date) {
            date = timestamp;
          } else {
            date = new Date(timestamp);
          }
          return date.toISOString().split('T')[0];
        };

        const patientData = patient as any;
        setFormData({
          firstName: patientData.firstName || patientData.name?.split(' ')[0] || '',
          lastName: patientData.lastName || patientData.name?.split(' ').slice(1).join(' ') || '',
          dateOfBirth: formatDateForInput(patientData.dateOfBirth),
          phone: patientData.phone || '',
          email: patientData.email || '',
          address: patientData.address || '',
          pregnancyStage: patientData.pregnancyStage || patientData.pregnancy?.gestationalWeek?.toString() || '',
          edd: formatDateForInput(patientData.edd || patientData.dueDate || patientData.pregnancy?.dueDate),
          medicalHistory: patientData.medicalHistory || '',
          bloodType: patientData.bloodType || '',
          notes: patientData.notes || '',
          assignedDoctor: patientData.assignedDoctor || '',
          assignedMidwife: patientData.assignedMidwife || '',
          isPregnant: patientData.isPregnant || false,
          gravida: patientData.gravida || '',
          parity: patientData.parity || '',
          previousComplications: patientData.previousComplications || '',
          gestationalAgeWeeks: patientData.gestationalAgeWeeks || '',
          ancVisits: patientData.ancVisits || '',
          hemoglobin: patientData.hemoglobin || '',
          bmi: patientData.bmi || '',
          fetalMovementCount: patientData.fetalMovementCount || '',
          systolicBP: patientData.systolicBP || '',
          diastolicBP: patientData.diastolicBP || '',
          heartRate: patientData.heartRate || '',
          bloodSugar: patientData.bloodSugar || '',
          temperature: patientData.temperature || '',
          preferredLanguage: patientData.preferredLanguage || '',
          emergencyContact: patientData.emergencyContact || '',
          assignedCHW: patientData.assignedCHW || '',
          consentToBlockchain: patientData.consentToBlockchain || false,
          location: patientData.location || ''
        });
      } else {
        setError(result.error || 'Failed to load patient data');
        toast.error(result.error || 'Failed to load patient data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading patient data');
      toast.error(err.message || 'An error occurred while loading patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting || !resolvedParams?.id) return;
    
    setSubmitting(true);
    setError('');

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const result = await updatePatient(resolvedParams.id, formData);
      
      if (result.success) {
        toast.success("Patient updated successfully");
        router.push(`/patients/${resolvedParams.id}`);
      } else {
        setError(result.error || 'Failed to update patient');
        toast.error(result.error || 'Failed to update patient');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D7D89]" />
          <span className="text-lg text-gray-900 dark:text-white">Loading patient data...</span>
        </div>
      </div>
    );
  }

  if (error && !resolvedParams?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Patient</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/patients')}
            className="bg-[#2D7D89] hover:bg-[#245A62] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/patients/${resolvedParams?.id}`)}
          className="mr-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patient
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Patient</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update the patient's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth *
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Blood Type
                </label>
                <Select 
                  value={formData.bloodType} 
                  onValueChange={(value) => handleSelectChange(value, 'bloodType')}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="A+" className="text-gray-900 dark:text-white">A+</SelectItem>
                    <SelectItem value="A-" className="text-gray-900 dark:text-white">A-</SelectItem>
                    <SelectItem value="B+" className="text-gray-900 dark:text-white">B+</SelectItem>
                    <SelectItem value="B-" className="text-gray-900 dark:text-white">B-</SelectItem>
                    <SelectItem value="AB+" className="text-gray-900 dark:text-white">AB+</SelectItem>
                    <SelectItem value="AB-" className="text-gray-900 dark:text-white">AB-</SelectItem>
                    <SelectItem value="O+" className="text-gray-900 dark:text-white">O+</SelectItem>
                    <SelectItem value="O-" className="text-gray-900 dark:text-white">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location/Region
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Enter location or region"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Information Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Pregnancy Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update the patient's pregnancy information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Is Pregnant
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="isPregnant"
                    name="isPregnant"
                    checked={formData.isPregnant}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isPregnant: e.target.checked
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPregnant" className="text-sm text-gray-700 dark:text-gray-300">
                    Currently pregnant
                  </label>
                </div>
              </div>
              {formData.isPregnant && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pregnancy Stage
                    </label>
                    <Input
                      name="pregnancyStage"
                      placeholder="e.g., '2nd Trimester' or '24 weeks'"
                      value={formData.pregnancyStage}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="edd"
                        type="date"
                        value={formData.edd}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {formData.isPregnant && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gravida (Total Pregnancies)
                  </label>
                  <Input
                    name="gravida"
                    type="number"
                    min="1"
                    placeholder="Number of pregnancies"
                    value={formData.gravida}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parity (Previous Births)
                  </label>
                  <Input
                    name="parity"
                    type="number"
                    min="0"
                    placeholder="Number of births"
                    value={formData.parity}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Features Section - Vital Signs for Risk Assessment */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity className="w-5 h-5 text-blue-600" />
              AI Risk Assessment Features
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              These vital signs are used by our AI model to calculate maternal health risk levels. Accurate data enables better risk predictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Current Vital Signs
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Systolic Blood Pressure *
                  </label>
                  <div className="relative">
                    <Input
                      name="systolicBP"
                      type="number"
                      min="60"
                      max="250"
                      placeholder="120"
                      value={formData.systolicBP}
                      onChange={handleChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">mmHg</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Normal: 90-140 mmHg</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diastolic Blood Pressure *
                  </label>
                  <div className="relative">
                    <Input
                      name="diastolicBP"
                      type="number"
                      min="40"
                      max="150"
                      placeholder="80"
                      value={formData.diastolicBP}
                      onChange={handleChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">mmHg</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Normal: 60-90 mmHg</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heart Rate *
                  </label>
                  <div className="relative">
                    <Input
                      name="heartRate"
                      type="number"
                      min="30"
                      max="200"
                      placeholder="70"
                      value={formData.heartRate}
                      onChange={handleChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">bpm</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Blood Sugar Level *
                  </label>
                  <div className="relative">
                    <Input
                      name="bloodSugar"
                      type="number"
                      min="50"
                      max="500"
                      step="0.1"
                      placeholder="90"
                      value={formData.bloodSugar}
                      onChange={handleChange}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">mg/dL</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Normal: 70-140 mg/dL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Body Temperature *
                  </label>
                  <div className="relative">
                    <Input
                      name="temperature"
                      type="number"
                      min="32"
                      max="45"
                      step="0.1"
                      placeholder="36.5"
                      value={formData.temperature}
                      onChange={handleChange}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">°C</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Normal: 36-37.5°C</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">AI Assessment</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Data enables risk prediction</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-1">AI Model Information</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    These 5 vital signs plus the patient's age are the core features our AI model uses to predict maternal health risks. 
                    Complete and accurate data leads to more reliable risk assessments.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                    * Required for AI risk prediction
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Medical Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update the patient's medical history and notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical History
              </label>
              <Textarea
                name="medicalHistory"
                placeholder="Enter medical history, chronic conditions, allergies, etc."
                value={formData.medicalHistory}
                onChange={handleChange}
                className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <Textarea
                name="notes"
                placeholder="Additional notes about the patient"
                value={formData.notes}
                onChange={handleChange}
                className="min-h-[80px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Team Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Healthcare Team</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update the patient's assigned healthcare team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Doctor
                </label>
                <Input
                  name="assignedDoctor"
                  placeholder="Doctor's name"
                  value={formData.assignedDoctor}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Midwife
                </label>
                <Input
                  name="assignedMidwife"
                  placeholder="Midwife's name"
                  value={formData.assignedMidwife}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Community Health Worker (CHW)
                </label>
                <Input
                  name="assignedCHW"
                  placeholder="CHW's name"
                  value={formData.assignedCHW}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Contact
                </label>
                <Input
                  name="emergencyContact"
                  placeholder="Emergency contact number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Consent</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update the patient's consent to having their medical data securely stored on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="consentToBlockchain"
                name="consentToBlockchain"
                checked={formData.consentToBlockchain}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    consentToBlockchain: e.target.checked
                  });
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="consentToBlockchain" className="text-sm text-gray-700 dark:text-gray-300">
                I consent to having my medical data securely stored on the blockchain for improved healthcare delivery
              </label>
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/patients/${resolvedParams?.id}`)}
            className="w-full sm:w-auto order-2 sm:order-1 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting} 
            className="w-full sm:w-auto bg-[#2D7D89] hover:bg-[#236570] text-white order-1 sm:order-2"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Patient...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Patient
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
} 