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
import { ArrowLeft, Calendar, Save, Loader2 } from 'lucide-react';
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

        setFormData({
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          dateOfBirth: formatDateForInput(patient.dateOfBirth),
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          pregnancyStage: patient.pregnancyStage || '',
          edd: formatDateForInput(patient.edd || patient.dueDate),
          medicalHistory: patient.medicalHistory || '',
          bloodType: patient.bloodType || '',
          notes: patient.notes || '',
          assignedDoctor: patient.assignedDoctor || '',
          assignedMidwife: patient.assignedMidwife || '',
          isPregnant: patient.isPregnant || false,
          gravida: patient.gravida || '',
          parity: patient.parity || '',
          previousComplications: patient.previousComplications || '',
          gestationalAgeWeeks: patient.gestationalAgeWeeks || '',
          ancVisits: patient.ancVisits || '',
          hemoglobin: patient.hemoglobin || '',
          bmi: patient.bmi || '',
          fetalMovementCount: patient.fetalMovementCount || '',
          systolicBP: patient.systolicBP || '',
          diastolicBP: patient.diastolicBP || '',
          heartRate: patient.heartRate || '',
          bloodSugar: patient.bloodSugar || '',
          temperature: patient.temperature || '',
          preferredLanguage: patient.preferredLanguage || '',
          emergencyContact: patient.emergencyContact || '',
          assignedCHW: patient.assignedCHW || '',
          consentToBlockchain: patient.consentToBlockchain || false,
          location: patient.location || ''
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D7D89]" />
          <span>Loading patient data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-[#2D7D89]">Edit</span>
          <span className="text-[#F7913D]"> Patient</span>
        </h1>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/patients/${resolvedParams?.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Patient Information</CardTitle>
          <CardDescription>
            Modify the patient's personal and medical information
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
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
                </div>
              )}
            </div>

            {/* Medical Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Medical History
                  </label>
                  <Textarea
                    name="medicalHistory"
                    placeholder="Enter medical history, chronic conditions, allergies, etc."
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <Textarea
                    name="notes"
                    placeholder="Additional notes about the patient"
                    value={formData.notes}
                    onChange={handleChange}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Healthcare Team Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Healthcare Team</h3>
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
                  <label className="block text-sm font-medium mb-1">
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
            </div>

            {/* Consent */}
            <div>
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
                <label htmlFor="consentToBlockchain" className="text-sm text-gray-700">
                  I consent to having my medical data securely stored on the blockchain for improved healthcare delivery
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/patients/${resolvedParams?.id}`)}
              className="w-full sm:w-auto order-2 sm:order-1"
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
      </Card>
    </div>
  );
} 