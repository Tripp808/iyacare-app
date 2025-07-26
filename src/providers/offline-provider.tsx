'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
    return new Promise((resolve) => {
      // Simulate sync delay
      setTimeout(() => {
        const totalItems = offlineData.patients.length + 
                          offlineData.vitals.length + 
                          offlineData.appointments.length;
        
        if (totalItems > 0) {
          setOfflineData(prev => ({
            patients: [],
            vitals: [],
            appointments: [],
            lastSync: new Date(),
          }));
          
          toast.success(`Synced ${totalItems} offline items successfully!`);
        }
        
        resolve();
      }, 2000);
    });
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
