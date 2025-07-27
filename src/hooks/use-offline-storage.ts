'use client';

import { useOffline } from '@/providers/offline-provider';
import { toast } from 'sonner';

export const useOfflineStorage = () => {
  const { isOfflineMode, storeOfflineData, isOnline } = useOffline();

  const savePatientOffline = (patientData: any) => {
    if (isOfflineMode || !isOnline) {
      // Enhance patient data structure to match Firebase schema
      const enhancedPatientData = {
        ...patientData,
        action: 'create',
        offlineId: `patient_${Date.now()}`,
        // Ensure required fields have defaults
        address: patientData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Nigeria'
        },
        emergencyContact: patientData.emergencyContact || {
          name: '',
          relationship: 'Family',
          phone: patientData.phone || ''
        },
        medicalInfo: {
          allergies: patientData.medicalInfo?.allergies || [],
          medications: patientData.medicalInfo?.medications || [],
          previousComplications: patientData.medicalInfo?.previousComplications || [],
          chronicConditions: patientData.medicalInfo?.chronicConditions || [],
          ...(patientData.medicalInfo?.bloodType && { bloodType: patientData.medicalInfo.bloodType }),
          ...(patientData.medicalInfo?.lastMenstrualPeriod && { lastMenstrualPeriod: patientData.medicalInfo.lastMenstrualPeriod }),
          ...(patientData.medicalInfo?.gestationalAge && { gestationalAge: patientData.medicalInfo.gestationalAge }),
          ...(patientData.medicalInfo?.pregnancyNotes && { pregnancyNotes: patientData.medicalInfo.pregnancyNotes })
        },
        assignedHealthcareProvider: patientData.assignedHealthcareProvider || 'system',
        createdBy: patientData.createdBy || 'offline-user',
        isActive: true,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };
      
      storeOfflineData('patients', enhancedPatientData);
      return true;
    }
    return false;
  };

  const saveVitalsOffline = (vitalsData: any) => {
    if (isOfflineMode || !isOnline) {
      // Enhance vitals data structure to match Firebase schema
      const enhancedVitalsData = {
        ...vitalsData,
        action: 'create',
        offlineId: `vitals_${Date.now()}`,
        // Ensure required fields
        patientId: vitalsData.patientId || 'unknown',
        timestamp: vitalsData.timestamp || new Date().toISOString(),
        recordedAt: vitalsData.recordedAt || new Date().toISOString(),
        recordedBy: vitalsData.recordedBy || 'offline-user',
        notes: vitalsData.notes || 'Recorded offline',
        // Parse blood pressure if provided as string
        systolic: vitalsData.systolic || (vitalsData.bloodPressure ? parseInt(vitalsData.bloodPressure.split('/')[0]) : undefined),
        diastolic: vitalsData.diastolic || (vitalsData.bloodPressure ? parseInt(vitalsData.bloodPressure.split('/')[1]) : undefined),
        weight: vitalsData.weight || 65 // Default weight
      };
      
      storeOfflineData('vitals', enhancedVitalsData);
      return true;
    }
    return false;
  };

  const saveAppointmentOffline = (appointmentData: any) => {
    if (isOfflineMode || !isOnline) {
      storeOfflineData('appointments', {
        ...appointmentData,
        action: 'create',
        offlineId: `appointment_${Date.now()}`,
      });
      return true;
    }
    return false;
  };

  const handleOfflineOperation = async (
    operation: () => Promise<any>,
    fallbackData: any,
    dataType: 'patients' | 'vitals' | 'appointments'
  ) => {
    try {
      if (isOfflineMode || !isOnline) {
        // Store data offline
        storeOfflineData(dataType, {
          ...fallbackData,
          action: 'create',
          offlineId: `${dataType}_${Date.now()}`,
        });
        toast.success(`Data saved offline. Will sync when connection is restored.`);
        return { success: true, offline: true };
      } else {
        // Perform online operation
        const result = await operation();
        return { success: true, offline: false, data: result };
      }
    } catch (error) {
      // If online operation fails, fall back to offline storage
      if (!isOfflineMode && isOnline) {
        storeOfflineData(dataType, {
          ...fallbackData,
          action: 'create',
          offlineId: `${dataType}_${Date.now()}`,
        });
        toast.warning(`Operation failed. Data saved offline for later sync.`);
        return { success: true, offline: true, error };
      }
      throw error;
    }
  };

  return {
    savePatientOffline,
    saveVitalsOffline,
    saveAppointmentOffline,
    handleOfflineOperation,
    isOfflineMode,
    isOnline,
  };
};
