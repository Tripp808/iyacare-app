'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ArrowLeft, Calendar, Save, UserPlus, Loader2 } from 'lucide-react';
import { addPatient } from '@/lib/firebase/patients';
import { getRiskStatus } from '@/lib/utils';
import { toast } from 'sonner';

export default function AddPatientPage() {
  const router = useRouter();
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
    riskLevel: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes a selection
    if (error) setError('');
  };

  const calculatePatientRisk = () => {
    // Calculate age from date of birth
    let age = 0;
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // Calculate pregnancy week from EDD
    let pregnancyWeek = 0;
    if (formData.edd) {
      const dueDate = new Date(formData.edd);
      const now = new Date();
      const fullTermDays = 280;
      const daysLeft = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      pregnancyWeek = Math.floor((fullTermDays - daysLeft) / 7);
      pregnancyWeek = pregnancyWeek > 0 ? (pregnancyWeek <= 42 ? pregnancyWeek : 42) : 0;
    }

    // Get risk assessment
    return getRiskStatus(age, formData.medicalHistory, pregnancyWeek);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (submitting) return;
    
    setSubmitting(true);
    setError('');

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      // If risk level wasn't manually set, calculate it
      const patientData = { ...formData };
      if (!patientData.riskLevel) {
        patientData.riskLevel = calculatePatientRisk();
      }

      // Submit patient data
      const result = await addPatient(patientData);
      
      if (result.success) {
        toast.success("Patient added successfully");
        router.push(`/patients/${result.id}`);
      } else {
        setError(result.error || 'Failed to add patient');
        toast.error(result.error || 'Failed to add patient');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-[#2D7D89]">Add</span>
          <span className="text-[#F7913D]"> Patient</span>
        </h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/patients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>
      </div>

      <Card className="border-t-4 border-t-[#2D7D89]">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Enter the patient's personal and medical information
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Blood Type
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, 'bloodType')}
                    value={formData.bloodType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <Input
                    name="address"
                    placeholder="Physical address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location/Region
                  </label>
                  <Input
                    name="location"
                    placeholder="e.g., Enugu, Nigeria"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Pregnancy Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Pregnancy Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                    <label htmlFor="isPregnant" className="text-sm text-gray-700">
                      Currently pregnant
                    </label>
                  </div>
                </div>
                {formData.isPregnant && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                      <label className="block text-sm font-medium mb-1">
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
                    <label className="block text-sm font-medium mb-1">
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
                    <label className="block text-sm font-medium mb-1">
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
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Gestational Age (Weeks)
                    </label>
                    <Input
                      name="gestationalAgeWeeks"
                      type="number"
                      min="0"
                      max="42"
                      placeholder="Current week of pregnancy"
                      value={formData.gestationalAgeWeeks}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ANC Visits (so far)
                    </label>
                    <Input
                      name="ancVisits"
                      type="number"
                      min="0"
                      placeholder="Number of antenatal care visits"
                      value={formData.ancVisits}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hemoglobin Level (g/dL)
                    </label>
                    <Input
                      name="hemoglobin"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g., 11.5"
                      value={formData.hemoglobin}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      BMI
                    </label>
                    <Input
                      name="bmi"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g., 24.5"
                      value={formData.bmi}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fetal Movement Count
                    </label>
                    <Input
                      name="fetalMovementCount"
                      placeholder="e.g., 10 per hour"
                      value={formData.fetalMovementCount}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Previous Complications
                    </label>
                    <Input
                      name="previousComplications"
                      placeholder="e.g., None, Preeclampsia, etc."
                      value={formData.previousComplications}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Vitals Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Current Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <Input
                    name="systolicBP"
                    type="number"
                    min="0"
                    max="300"
                    placeholder="e.g., 120"
                    value={formData.systolicBP}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <Input
                    name="diastolicBP"
                    type="number"
                    min="0"
                    max="200"
                    placeholder="e.g., 80"
                    value={formData.diastolicBP}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Heart Rate (BPM)
                  </label>
                  <Input
                    name="heartRate"
                    type="number"
                    min="0"
                    max="250"
                    placeholder="e.g., 75"
                    value={formData.heartRate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Blood Sugar (mmol/L)
                  </label>
                  <Input
                    name="bloodSugar"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 5.5"
                    value={formData.bloodSugar}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Temperature (°C)
                  </label>
                  <Input
                    name="temperature"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    placeholder="e.g., 36.8"
                    value={formData.temperature}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
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
                  <label className="block text-sm font-medium mb-1">
                    Assigned Midwife
                  </label>
                  <Input
                    name="assignedMidwife"
                    placeholder="Midwife's name"
                    value={formData.assignedMidwife}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Community Health Worker
                  </label>
                  <Input
                    name="assignedCHW"
                    placeholder="CHW name"
                    value={formData.assignedCHW}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact
                  </label>
                  <Input
                    name="emergencyContact"
                    placeholder="Phone number"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Medical History
                </label>
                <Textarea
                  name="medicalHistory"
                  placeholder="Previous pregnancies, existing conditions, medications, surgeries, etc."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Additional Notes
                </label>
                <Textarea
                  name="notes"
                  placeholder="Any other relevant information about the patient"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Communication & Blockchain Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Communication & Blockchain Consent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preferred Language
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, 'preferredLanguage')}
                    value={formData.preferredLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Igbo">Igbo</SelectItem>
                      <SelectItem value="Yoruba">Yoruba</SelectItem>
                      <SelectItem value="Hausa">Hausa</SelectItem>
                      <SelectItem value="Pidgin">Pidgin</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Risk Level
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, 'riskLevel')}
                    value={formData.riskLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 mt-2">
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
                  <label htmlFor="consentToBlockchain" className="text-sm text-gray-700">
                    Patient consents to storing their health records securely on blockchain for improved care coordination
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  By checking this box, the patient agrees to have their health information securely stored on a private blockchain network, 
                  accessible only to authorized healthcare providers. This improves continuity of care even when visiting different facilities.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push('/patients')}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full sm:w-auto bg-[#2D7D89] hover:bg-[#236570] order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Patient...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Patient
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 