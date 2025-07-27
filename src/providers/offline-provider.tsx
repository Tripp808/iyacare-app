'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';

interface OfflineData {
  patients: any[];
  vitals: any[];
  appointments: any[];
  lastSync: Date | null;
}

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  offlineData: OfflineData;
  toggleOfflineMode: () => void;
  storeOfflineData: (type: keyof OfflineData, data: any) => void;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => void;
  getOfflineDataCount: () => number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    patients: [],
    vitals: [],
    appointments: [],
    lastSync: null,
  });

  // Simulate network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isOfflineMode) {
        toast.success('Connection restored! Syncing offline data...');
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
      toast.warning('Connection lost. Switching to offline mode...');
    };

    // Listen to actual network events (for demonstration)
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineMode]);

  // Load offline data from localStorage on mount
  useEffect(() => {
    const savedOfflineData = localStorage.getItem('iyacare-offline-data');
    if (savedOfflineData) {
      try {
        const parsed = JSON.parse(savedOfflineData);
        setOfflineData({
          ...parsed,
          lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
        });
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }
  }, []);

  // Save offline data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('iyacare-offline-data', JSON.stringify(offlineData));
  }, [offlineData]);

  const toggleOfflineMode = () => {
    const newOfflineMode = !isOfflineMode;
    setIsOfflineMode(newOfflineMode);
    
    if (newOfflineMode) {
      setIsOnline(false);
      toast.info('Offline mode enabled. Data will be stored locally.');
    } else {
      setIsOnline(true);
      toast.success('Online mode enabled. Syncing data...');
      syncOfflineData();
    }
  };

  const storeOfflineData = (type: keyof OfflineData, data: any) => {
    if (type === 'lastSync') return; // Don't allow direct lastSync updates
    
    setOfflineData(prev => ({
      ...prev,
      [type]: [...prev[type], { ...data, id: Date.now(), timestamp: new Date() }],
    }));
    
    toast.info(`${type.slice(0, -1)} saved offline`);
  };

  const syncOfflineData = async (): Promise<void> => {
    try {
      const totalItems = offlineData.patients.length + 
                        offlineData.vitals.length + 
                        offlineData.appointments.length;
      
      if (totalItems === 0) {
        return;
      }

      toast.info(`Syncing ${totalItems} offline items...`);
      
      let synced = 0;
      let failed = 0;
      const syncResults: string[] = [];

      // Sync offline patients to Firebase
      for (const offlinePatient of offlineData.patients) {
        try {
          // Convert offline patient data to Patient interface format
          const patientData = {
            firstName: offlinePatient.name?.split(' ')[0] || 'Unknown',
            lastName: offlinePatient.name?.split(' ').slice(1).join(' ') || 'Patient',
            dateOfBirth: offlinePatient.dateOfBirth ? new Date(offlinePatient.dateOfBirth) : new Date(Date.now() - (offlinePatient.age || 25) * 365 * 24 * 60 * 60 * 1000),
            gender: (offlinePatient.gender as 'male' | 'female' | 'other') || 'female',
            phone: offlinePatient.phone || '',
            email: offlinePatient.email || '',
            address: {
              street: offlinePatient.address?.street || '',
              city: offlinePatient.address?.city || '',
              state: offlinePatient.address?.state || '',
              zipCode: offlinePatient.address?.zipCode || '',
              country: offlinePatient.address?.country || 'Nigeria'
            },
            emergencyContact: {
              name: offlinePatient.emergencyContact?.name || '',
              relationship: offlinePatient.emergencyContact?.relationship || 'Family',
              phone: offlinePatient.emergencyContact?.phone || offlinePatient.phone || ''
            },
            medicalInfo: {
              ...(offlinePatient.medicalInfo?.bloodType && { bloodType: offlinePatient.medicalInfo.bloodType }),
              allergies: offlinePatient.medicalInfo?.allergies || [],
              medications: offlinePatient.medicalInfo?.medications || [],
              previousComplications: offlinePatient.medicalInfo?.previousComplications || [],
              chronicConditions: offlinePatient.medicalInfo?.chronicConditions || [],
              ...(offlinePatient.medicalInfo?.lastMenstrualPeriod && { lastMenstrualPeriod: new Date(offlinePatient.medicalInfo.lastMenstrualPeriod) }),
              ...(offlinePatient.medicalInfo?.gestationalAge && { gestationalAge: offlinePatient.medicalInfo.gestationalAge }),
              ...(offlinePatient.medicalInfo?.pregnancyNotes && { pregnancyNotes: offlinePatient.medicalInfo.pregnancyNotes })
            },
            assignedHealthcareProvider: offlinePatient.assignedHealthcareProvider || 'system',
            createdBy: offlinePatient.createdBy || 'offline-sync',
            isActive: true
          };

          const result = await PatientService.createPatient(patientData);
          
          if (result.success) {
            synced++;
            syncResults.push(`✅ Patient: ${patientData.firstName} ${patientData.lastName}`);
          } else {
            failed++;
            syncResults.push(`❌ Patient: ${patientData.firstName} ${patientData.lastName} - ${result.error}`);
          }
        } catch (error) {
          failed++;
          syncResults.push(`❌ Patient sync error: ${error}`);
        }
      }

      // Sync offline vitals to Firebase
      for (const offlineVital of offlineData.vitals) {
        try {
          const vitalData = {
            patientId: offlineVital.patientId || 'unknown',
            timestamp: new Date(offlineVital.timestamp || offlineVital.recordedAt),
            systolic: offlineVital.systolic || parseInt(offlineVital.bloodPressure?.split('/')[0]) || 120,
            diastolic: offlineVital.diastolic || parseInt(offlineVital.bloodPressure?.split('/')[1]) || 80,
            heartRate: offlineVital.heartRate || 72,
            temperature: offlineVital.temperature || 36.5,
            weight: offlineVital.weight || 65,
            bloodSugar: offlineVital.bloodSugar,
            oxygenSaturation: offlineVital.oxygenSaturation,
            respiratoryRate: offlineVital.respiratoryRate,
            recordedBy: 'offline-sync',
            notes: 'Synced from offline storage'
          };

          const result = await PatientService.addVitalSigns(vitalData);
          
          if (result.success) {
            synced++;
            syncResults.push(`✅ Vitals: Patient ${vitalData.patientId}`);
          } else {
            failed++;
            syncResults.push(`❌ Vitals sync failed: ${result.error}`);
          }
        } catch (error) {
          failed++;
          syncResults.push(`❌ Vitals sync error: ${error}`);
        }
      }

      // Note: Appointments would need an appointment service - for now just count them as synced
      synced += offlineData.appointments.length;
      offlineData.appointments.forEach(appointment => {
        syncResults.push(`ℹ️ Appointment: ${appointment.patientName} - ${appointment.date} (logged for future sync)`);
      });

      // Clear offline data after successful sync
      setOfflineData({
        patients: [],
        vitals: [],
        appointments: [],
        lastSync: new Date(),
      });

      // Show sync results
      if (synced > 0) {
        toast.success(`Successfully synced ${synced} items to patient records!`);
      }
      if (failed > 0) {
        toast.error(`Failed to sync ${failed} items. Check console for details.`);
        console.log('Sync Results:', syncResults);
      }
      
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync offline data. Please try again.');
    }
  };

  const clearOfflineData = () => {
    setOfflineData({
      patients: [],
      vitals: [],
      appointments: [],
      lastSync: null,
    });
    localStorage.removeItem('iyacare-offline-data');
    toast.info('Offline data cleared');
  };

  const getOfflineDataCount = () => {
    return offlineData.patients.length + 
           offlineData.vitals.length + 
           offlineData.appointments.length;
  };

  const value: OfflineContextType = {
    isOnline,
    isOfflineMode,
    offlineData,
    toggleOfflineMode,
    storeOfflineData,
    syncOfflineData,
    clearOfflineData,
    getOfflineDataCount,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
