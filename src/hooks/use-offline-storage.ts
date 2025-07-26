'use client';

import { useOffline } from '@/providers/offline-provider';
import { toast } from 'sonner';

export const useOfflineStorage = () => {
  const { isOfflineMode, storeOfflineData, isOnline } = useOffline();

  const savePatientOffline = (patientData: any) => {
    if (isOfflineMode || !isOnline) {
      storeOfflineData('patients', {
        ...patientData,
        action: 'create',
        offlineId: `patient_${Date.now()}`,
      });
      return true;
    }
    return false;
  };

  const saveVitalsOffline = (vitalsData: any) => {
    if (isOfflineMode || !isOnline) {
      storeOfflineData('vitals', {
        ...vitalsData,
        action: 'create',
        offlineId: `vitals_${Date.now()}`,
      });
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
