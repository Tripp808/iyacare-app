'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  Activity, 
  Database,
  UserCheck,
  Loader2,
  Archive,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Patient, getPatients } from '@/lib/firebase/patients';
import { toast } from 'react-hot-toast';
import { getVitalSignsByPatientId, VitalSigns } from '@/lib/firebase/vitals';
import { aiPredictionService } from '@/services/ai-prediction.service';
import { PatientService } from '@/services/patient.service';
import { HighRiskNotificationService } from '@/services/high-risk-notification.service';

function PatientsPageContent() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [pregnancyFilter, setPregnancyFilter] = useState<'all' | 'pregnant' | 'not-pregnant'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'risk-high' | 'risk-low'>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  const itemsPerPage = 12;
  const [riskPredictions, setRiskPredictions] = useState<Record<string, { loading: boolean; prediction?: any; error?: string }>>({});
  const [highRiskPatients, setHighRiskPatients] = useState<Array<{
    id: string;
    name: string;
    riskLevel: string;
    description: string;
  }>>([]);
  const [showHighRiskDropdown, setShowHighRiskDropdown] = useState(false);
  const [deletingPatients, setDeletingPatients] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ patientId: string; patientName: string; type: 'archive' | 'delete' } | null>(null);

  // Check for risk filter from URL parameters (from notifications)
  useEffect(() => {
    const riskParam = searchParams.get('risk');
    if (riskParam === 'high') {
      setRiskFilter('high');
    }
  }, [searchParams]);

  // Fetch high-risk patients for urgent appointments
  const fetchHighRiskPatients = async () => {
    try {
      const patients = await HighRiskNotificationService.getHighRiskPatientsForDisplay();
      setHighRiskPatients(patients);
    } catch (error) {
      console.error('Error fetching high-risk patients:', error);
    }
  };

  useEffect(() => {
    fetchHighRiskPatients();
    // Refresh high-risk patients every 2 minutes
    const interval = setInterval(fetchHighRiskPatients, 120000);
    return () => clearInterval(interval);
  }, []);

  // Define the getRiskLevelFromPrediction function early
  const getRiskLevelFromPrediction = (patientId?: string): string => {
    if (!patientId || !riskPredictions[patientId]) {
      return 'Unknown';
    }
    
    const predictionState = riskPredictions[patientId];
    if (predictionState.loading) {
      return 'Loading...';
    }
    
    if (predictionState.error) {
      return 'Error';
    }
    
    return predictionState.prediction?.predicted_risk || 'Unknown';
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatients();
      if (result.success && result.patients) {
        setPatients(result.patients);
        // Start fetching risk predictions for all patients
        fetchRiskPredictionsForPatients(result.patients);
      } else {
        toast.error(result.error || 'Failed to load patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskPredictionsForPatients = async (patientList: Patient[]) => {
    // Set loading state for all patients
    const loadingStates = patientList.reduce((acc, patient) => {
      if (patient.id) {
        acc[patient.id] = { loading: true };
      }
      return acc;
    }, {} as Record<string, { loading: boolean; prediction?: any; error?: string }>);
    
    setRiskPredictions(loadingStates);

    // Collect predictions to update in database
    const predictionsToUpdate: Array<{ patientId: string; riskLevel: string; confidence?: number }> = [];

    // Fetch predictions for each patient
    for (const patient of patientList) {
      if (!patient.id) continue;
      
      try {
        // Get latest vital signs for the patient
        const vitalsResult = await getVitalSignsByPatientId(patient.id, 1);
        
        if (vitalsResult.success && vitalsResult.vitals.length > 0) {
          const latestVitals = vitalsResult.vitals[0];
          
          // Extract prediction request data
          const predictionData = aiPredictionService.extractVitalSigns(patient, {
            systolic_bp: latestVitals.systolicBP,
            diastolic_bp: latestVitals.diastolicBP,
            blood_sugar: latestVitals.bloodSugar,
            body_temp: latestVitals.temperature,
            heart_rate: latestVitals.heartRate,
          });

          console.log(`Prediction data for patient ${patient.firstName} ${patient.lastName}:`, predictionData);

          if (predictionData) {
            // Make AI prediction
            const prediction = await aiPredictionService.predictRisk(predictionData);
            console.log(`Prediction result for patient ${patient.firstName} ${patient.lastName}:`, prediction);
            
            setRiskPredictions(prev => ({
              ...prev,
              [patient.id!]: { loading: false, prediction }
            }));

            // Add to bulk update list
            if (prediction.predicted_risk) {
              predictionsToUpdate.push({
                patientId: patient.id,
                riskLevel: prediction.predicted_risk,
                confidence: prediction.confidence
              });
            }
          } else {
            console.warn(`Failed to extract vital signs for patient ${patient.id}`);
            setRiskPredictions(prev => ({
              ...prev,
              [patient.id!]: { loading: false, error: 'Unable to extract vital signs' }
            }));
          }
        } else {
          // No vital signs available, use patient data with defaults
          console.log(`No vital signs found for patient ${patient.id}, using defaults`);
          const defaultPredictionData = aiPredictionService.extractVitalSigns(patient);
          console.log(`Default prediction data for patient ${patient.firstName} ${patient.lastName}:`, defaultPredictionData);
          
          if (defaultPredictionData) {
            const prediction = await aiPredictionService.predictRisk(defaultPredictionData);
            console.log(`Default prediction result for patient ${patient.firstName} ${patient.lastName}:`, prediction);
            
            setRiskPredictions(prev => ({
              ...prev,
              [patient.id!]: { loading: false, prediction }
            }));

            // Add to bulk update list
            if (prediction.predicted_risk) {
              predictionsToUpdate.push({
                patientId: patient.id,
                riskLevel: prediction.predicted_risk,
                confidence: prediction.confidence
              });
            }
          } else {
            console.warn(`Failed to extract default vital signs for patient ${patient.id}`);
            setRiskPredictions(prev => ({
              ...prev,
              [patient.id!]: { loading: false, error: 'Unable to process patient data' }
            }));
          }
        }
      } catch (error: any) {
        console.error(`Error fetching prediction for patient ${patient.id}:`, error);
        setRiskPredictions(prev => ({
          ...prev,
          [patient.id!]: { loading: false, error: 'Prediction failed' }
        }));
      }
    }

    // Bulk update patient risk levels in database
    if (predictionsToUpdate.length > 0) {
      console.log(`Updating risk levels for ${predictionsToUpdate.length} patients in database...`);
      try {
        const result = await PatientService.bulkUpdatePatientRiskLevels(predictionsToUpdate);
        console.log(`Database update completed: ${result.updated} updated, ${result.errors} errors`);
        
        // Show success message
        toast.success(`Updated risk levels for ${result.updated} patients. Dashboard will reflect changes on refresh.`);
        
        // Create notifications for high-risk patients
        if (result.updated > 0) {
          console.log('Creating notifications for high-risk patients...');
          try {
            const notificationResult = await HighRiskNotificationService.checkAndCreateHighRiskNotifications();
            if (notificationResult.created > 0) {
              toast.success(`Created ${notificationResult.created} high-risk patient alerts.`);
            }
            console.log(`Notification creation completed: ${notificationResult.created} created, ${notificationResult.errors} errors`);
          } catch (notificationError) {
            console.error('Error creating high-risk notifications:', notificationError);
          }
        }
      } catch (error) {
        console.error('Failed to update patient risk levels in database:', error);
        toast.error('Failed to save risk assessments to database');
      }
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedPatients = useMemo(() => {
    return patients
    .filter(patient => {
      const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (patient.phone || '').includes(searchTerm) ||
                             (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = riskFilter === 'all' || 
          (riskFilter === 'high' && getRiskLevelFromPrediction(patient.id).toLowerCase().includes('high')) ||
          (riskFilter === 'medium' && getRiskLevelFromPrediction(patient.id).toLowerCase().includes('mid')) ||
          (riskFilter === 'low' && getRiskLevelFromPrediction(patient.id).toLowerCase().includes('low'));
        const matchesPregnancy = pregnancyFilter === 'all' || 
                               (pregnancyFilter === 'pregnant' && patient.isPregnant) ||
                               (pregnancyFilter === 'not-pregnant' && !patient.isPregnant);
        return matchesSearch && matchesRisk && matchesPregnancy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'date-asc':
          return new Date(a.dateOfBirth || 0).getTime() - new Date(b.dateOfBirth || 0).getTime();
        case 'date-desc':
          return new Date(b.dateOfBirth || 0).getTime() - new Date(a.dateOfBirth || 0).getTime();
        case 'risk-high':
          const getRiskPriorityHigh = (patientId?: string) => {
            const risk = getRiskLevelFromPrediction(patientId).toLowerCase();
            if (risk.includes('high')) return 3;
            if (risk.includes('mid') || risk.includes('medium')) return 2;
            if (risk.includes('low')) return 1;
            return 0;
          };
          return getRiskPriorityHigh(b.id) - getRiskPriorityHigh(a.id);
        case 'risk-low':
          const getRiskPriorityLow = (patientId?: string) => {
            const risk = getRiskLevelFromPrediction(patientId).toLowerCase();
            if (risk.includes('high')) return 3;
            if (risk.includes('mid') || risk.includes('medium')) return 2;
            if (risk.includes('low')) return 1;
            return 0;
          };
          return getRiskPriorityLow(a.id) - getRiskPriorityLow(b.id);
        default:
          return 0;
      }
  });
  }, [patients, searchTerm, riskFilter, pregnancyFilter, sortBy, riskPredictions]);

  // Calculate statistics with enhanced metrics
  const stats = useMemo(() => {
    const totalPatients = patients.length;
    const pregnantPatients = patients.filter(p => p.isPregnant).length;
    const highRiskPatients = patients.filter(p => {
      const riskLevel = getRiskLevelFromPrediction(p.id);
      return riskLevel.toLowerCase().includes('high');
    }).length;

    return {
      total: totalPatients,
      pregnant: pregnantPatients,
      highRisk: highRiskPatients
    };
  }, [patients, riskPredictions]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const paginatedPatients = filteredAndSortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskBadgeColor = (patientId?: string) => {
    if (!patientId) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }

    const predictionState = riskPredictions[patientId];
    if (!predictionState) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }

    if (predictionState.loading) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }

    if (predictionState.error) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }

    const riskLevel = predictionState.prediction?.predicted_risk?.toLowerCase() || '';
    
    if (riskLevel.includes('high')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
    } else if (riskLevel.includes('mid') || riskLevel.includes('medium')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    } else if (riskLevel.includes('low')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const getRiskLevelDisplay = (patientId?: string) => {
    if (!patientId) return 'Unknown';
    
    const predictionState = riskPredictions[patientId];
    if (!predictionState) return 'Unknown';
    
    if (predictionState.loading) return 'Loading...';
    if (predictionState.error) return 'Error';
    
    return predictionState.prediction?.predicted_risk || 'Unknown';
  };

  const getRiskTooltip = (patientId?: string): string => {
    if (!patientId) return 'No patient ID available';
    
    const predictionState = riskPredictions[patientId];
    if (!predictionState) return 'No prediction data available';
    
    if (predictionState.loading) return 'Calculating risk assessment...';
    
    if (predictionState.error) {
      return `⚠️ ${predictionState.error}\n\nTo enable AI risk assessment:\n• Record vital signs (BP, heart rate, temperature, blood sugar)\n• Verify patient date of birth\n• Ensure all values are within normal ranges`;
    }
    
    if (predictionState.prediction) {
      const confidence = Math.round((predictionState.prediction.confidence || 0) * 100);
      return `Risk Level: ${predictionState.prediction.predicted_risk}\nConfidence: ${confidence}%\n\nBased on AI analysis of patient vital signs and demographics.`;
    }
    
    return 'Risk assessment pending';
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    
    try {
      const birth = new Date(birthDate);
      // Check if the date is valid
      if (isNaN(birth.getTime())) {
        return 'Invalid Date';
      }
      
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Check for reasonable age range
      if (age < 0 || age > 120) {
        return 'Invalid Age';
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error, 'for birthDate:', birthDate);
      return 'Error';
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === paginatedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(paginatedPatients.map(p => p.id!));
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Age', 'Phone', 'Email', 'Risk Level', 'Status'].join(','),
      ...selectedPatients.map(patientId => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return '';
        return [
          `"${patient.firstName} ${patient.lastName}"`,
          getAgeFromBirthDate(patient.dateOfBirth),
          patient.phone || '',
          patient.email || '',
          getRiskLevelFromPrediction(patient.id),
          patient.isPregnant ? 'Pregnant' : 'Not Pregnant'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleArchivePatient = async (patientId: string) => {
    setDeletingPatients(prev => new Set(prev).add(patientId));
    
    try {
      const result = await PatientService.deactivatePatient(patientId);
      
      if (result.success) {
        toast.success('Patient archived successfully');
        // Remove the patient from the local state
        setPatients(prev => prev.filter(p => p.id !== patientId));
        // Remove from selected patients if it was selected
        setSelectedPatients(prev => prev.filter(id => id !== patientId));
      } else {
        toast.error(result.error || 'Failed to archive patient');
      }
    } catch (error) {
      console.error('Error archiving patient:', error);
      toast.error('Failed to archive patient');
    } finally {
      setDeletingPatients(prev => {
        const newSet = new Set(prev);
        newSet.delete(patientId);
        return newSet;
      });
      setShowDeleteDialog(null);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    setDeletingPatients(prev => new Set(prev).add(patientId));
    
    try {
      const result = await PatientService.deletePatient(patientId);
      
      if (result.success) {
        toast.success('Patient deleted permanently');
        // Remove the patient from the local state
        setPatients(prev => prev.filter(p => p.id !== patientId));
        // Remove from selected patients if it was selected
        setSelectedPatients(prev => prev.filter(id => id !== patientId));
      } else {
        toast.error(result.error || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setDeletingPatients(prev => {
        const newSet = new Set(prev);
        newSet.delete(patientId);
        return newSet;
      });
      setShowDeleteDialog(null);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedPatients.length === 0) return;
    
    const archivePromises = selectedPatients.map(patientId => 
      PatientService.deactivatePatient(patientId)
    );
    
    try {
      const results = await Promise.all(archivePromises);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      if (successCount > 0) {
        toast.success(`${successCount} patient(s) archived successfully`);
        // Remove archived patients from local state
        setPatients(prev => prev.filter(p => !selectedPatients.includes(p.id!)));
        setSelectedPatients([]);
      }
      
      if (failureCount > 0) {
        toast.error(`Failed to archive ${failureCount} patient(s)`);
      }
    } catch (error) {
      console.error('Error in bulk archive:', error);
      toast.error('Failed to archive selected patients');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        {/* ... (rest of the code remains the same) */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7D89] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage all patient records with advanced filtering and insights
            </p>
          </div>
          
          {/* Primary Action Button - Always visible */}
          <Link href="/patients/add" className="w-full sm:w-auto">
            <Button className="bg-[#2D7D89] hover:bg-[#245A62] text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>
        
        {/* Secondary Action Buttons - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <Button 
            variant="outline" 
            onClick={fetchPatients}
            disabled={loading}
            className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 w-full"
          >
            <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          
          <Link href="/admin/populate-vitals" className="w-full">
            <Button 
              variant="outline" 
              className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Populate Vitals</span>
              <span className="sm:hidden">Vitals</span>
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                toast.loading('Creating high-risk notifications...');
                const result = await HighRiskNotificationService.checkAndCreateHighRiskNotifications();
                toast.dismiss();
                if (result.created > 0) {
                  toast.success(`Created ${result.created} high-risk patient notifications`);
                } else if (result.processed === 0) {
                  toast.success('No high-risk patients found');
                } else {
                  toast.success('All high-risk patients already have notifications');
                }
                if (result.errors > 0) {
                  toast.error(`${result.errors} errors occurred during notification creation`);
                }
              } catch (error) {
                toast.dismiss();
                toast.error('Failed to create high-risk notifications');
                console.error('Notification creation error:', error);
              }
            }}
            className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 w-full"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Create Risk Alerts</span>
            <span className="lg:hidden">Risk Alerts</span>
          </Button>
          
          {/* Duplicate Add Patient button for mobile - hidden on larger screens */}
          <Link href="/patients/add" className="lg:hidden w-full">
            <Button className="bg-[#2D7D89] hover:bg-[#245A62] text-white w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium">Total Patients</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 dark:text-pink-400 text-xs md:text-sm font-medium">Pregnant Patients</p>
                <p className="text-2xl md:text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.pregnant}</p>
              </div>
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-xs md:text-sm font-medium">High Risk</p>
                <p className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Patients Alert Section */}
      {highRiskPatients.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  High-Risk Patients Requiring Urgent Attention
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {highRiskPatients.length} patient{highRiskPatients.length !== 1 ? 's' : ''} need immediate care and urgent appointments
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighRiskDropdown(!showHighRiskDropdown)}
              className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              {showHighRiskDropdown ? 'Hide' : 'View'} Details
            </Button>
          </div>
          
          {showHighRiskDropdown && (
            <div className="mt-4 space-y-2">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {highRiskPatients.map((patient) => (
                  <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {patient.name}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {patient.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 ml-2">
                        <Link href={`/patients/${patient.id}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs w-full sm:w-auto">
                            <Eye className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Link href={`/appointments?patient=${patient.id}&priority=urgent`} className="w-full sm:w-auto">
                          <Button size="sm" className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                            <Calendar className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Book</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-red-200 dark:border-red-800">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={() => setRiskFilter('high')}
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Filter High-Risk Only
                  </Button>
                  <Link href="/appointments?type=urgent" className="w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="text-red-700 dark:text-red-300 border-red-300 w-full">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Schedule All Urgent Appointments</span>
                      <span className="sm:hidden">Schedule All</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Search and Filter Bar */}
      <Card className="mb-4 md:mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Risk Levels</SelectItem>
                <SelectItem value="low" className="text-gray-900 dark:text-white">Low Risk</SelectItem>
                <SelectItem value="medium" className="text-gray-900 dark:text-white">Medium Risk</SelectItem>
                <SelectItem value="high" className="text-gray-900 dark:text-white">High Risk</SelectItem>
              </SelectContent>
            </Select>

              <Select value={pregnancyFilter} onValueChange={(value: any) => setPregnancyFilter(value)}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Pregnancy Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="text-gray-900 dark:text-white">All Patients</SelectItem>
                  <SelectItem value="pregnant" className="text-gray-900 dark:text-white">Pregnant</SelectItem>
                  <SelectItem value="not-pregnant" className="text-gray-900 dark:text-white">Not Pregnant</SelectItem>
                </SelectContent>
              </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="name-asc" className="text-gray-900 dark:text-white">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc" className="text-gray-900 dark:text-white">Name (Z-A)</SelectItem>
                  <SelectItem value="date-asc" className="text-gray-900 dark:text-white">Age (Youngest)</SelectItem>
                  <SelectItem value="date-desc" className="text-gray-900 dark:text-white">Age (Oldest)</SelectItem>
                  <SelectItem value="risk-high" className="text-gray-900 dark:text-white">Risk (High to Low)</SelectItem>
                  <SelectItem value="risk-low" className="text-gray-900 dark:text-white">Risk (Low to High)</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* Responsive Bulk Actions */}
          {selectedPatients.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedPatients.length} patient{selectedPatients.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-100 w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle className="text-gray-900 dark:text-white">
            Patient Records ({filteredAndSortedPatients.length})
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
                Comprehensive patient management with advanced filtering
          </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedPatients.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPatients.length === paginatedPatients.length}
                          onCheckedChange={handleSelectAll}
                          className="border-gray-300 dark:border-gray-600"
                        />
                      </TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Patient</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Age</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Location</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Risk Level</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatients.map((patient) => (
                      <TableRow key={patient.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedPatients.includes(patient.id!)}
                            onCheckedChange={() => handleSelectPatient(patient.id!)}
                            className="border-gray-300 dark:border-gray-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D7D89] to-[#4AA0AD] flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {patient.id?.slice(0, 8) || 'Unknown'}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {getAgeFromBirthDate(patient.dateOfBirth)} years
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              {patient.phone || 'No phone'}
                            </div>
                            {patient.email && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {typeof patient.address === 'object' && patient.address 
                              ? `${(patient.address as any)?.city || ''}${(patient.address as any)?.city && (patient.address as any)?.state ? ', ' : ''}${(patient.address as any)?.state || ''}`.trim() || 'Not specified'
                              : patient.address || 'Not specified'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(patient.id)}>
                            {getRiskLevelFromPrediction(patient.id).toLowerCase().includes('high') && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {riskPredictions[patient.id!]?.loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {getRiskLevelDisplay(patient.id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                          <Badge className={patient.isPregnant 
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300 border-pink-200 dark:border-pink-800'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                          }>
                            {patient.isPregnant ? 'Pregnant' : 'Not Pregnant'}
                          </Badge>
                            {patient.bloodType && (
                              <Badge variant="outline" className="text-xs">
                                {patient.bloodType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/patients/${patient.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#2D7D89] hover:text-[#245A62] hover:bg-[#e6f3f5] dark:text-[#4AA0AD] dark:hover:bg-[#2D7D89]/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/patients/${patient.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <DropdownMenuLabel className="text-gray-900 dark:text-white">Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Schedule Visit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Record
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem 
                                  className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  onClick={() => setShowDeleteDialog({
                                    patientId: patient.id!,
                                    patientName: `${patient.firstName} ${patient.lastName}`,
                                    type: 'archive'
                                  })}
                                  disabled={deletingPatients.has(patient.id!)}
                                >
                                  {deletingPatients.has(patient.id!) ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Archive className="w-4 h-4 mr-2" />
                                  )}
                                  Archive Patient
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => setShowDeleteDialog({
                                    patientId: patient.id!,
                                    patientName: `${patient.firstName} ${patient.lastName}`,
                                    type: 'delete'
                                  })}
                                  disabled={deletingPatients.has(patient.id!)}
                                >
                                  {deletingPatients.has(patient.id!) ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                  )}
                                  Delete Permanently
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Responsive Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-4 mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPatients.length)} of {filteredAndSortedPatients.length} patients
                  </p>
                  
                  {/* Mobile-first pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
                    {/* Previous/Next for mobile */}
                    <div className="flex items-center gap-2 sm:hidden w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 flex-1"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 px-3 whitespace-nowrap">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 flex-1"
                      >
                        Next
                      </Button>
                    </div>
                    
                    {/* Full pagination for larger screens */}
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 px-4 whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No patients found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || riskFilter !== 'all' || pregnancyFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first patient.'
                }
              </p>
              <Link href="/patients/add">
                <Button className="bg-[#2D7D89] hover:bg-[#245A62] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {showDeleteDialog?.type === 'archive' ? 'Archive Patient' : 'Delete Patient Permanently'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {showDeleteDialog?.type === 'archive' 
                ? `Are you sure you want to archive ${showDeleteDialog?.patientName}? This will mark the patient as inactive but preserve their data.`
                : `Are you sure you want to permanently delete ${showDeleteDialog?.patientName}? This action cannot be undone and will remove all patient data including vital signs.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
              disabled={showDeleteDialog ? deletingPatients.has(showDeleteDialog.patientId) : false}
              className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant={showDeleteDialog?.type === 'archive' ? 'default' : 'destructive'}
              onClick={() => {
                if (showDeleteDialog) {
                  if (showDeleteDialog.type === 'archive') {
                    handleArchivePatient(showDeleteDialog.patientId);
                  } else {
                    handleDeletePatient(showDeleteDialog.patientId);
                  }
                }
              }}
              disabled={showDeleteDialog ? deletingPatients.has(showDeleteDialog.patientId) : false}
              className={showDeleteDialog?.type === 'archive' 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {showDeleteDialog && deletingPatients.has(showDeleteDialog.patientId) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {showDeleteDialog.type === 'archive' ? 'Archiving...' : 'Deleting...'}
                </>
              ) : (
                <>
                  {showDeleteDialog?.type === 'archive' ? (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Patient
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7D89] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
          </div>
        </div>
      </div>
    }>
      <PatientsPageContent />
    </Suspense>
  );
} 