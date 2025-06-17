import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Activity, Users, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import BlockchainService from '@/services/blockchain.service';

interface BlockchainDashboardProps {
  isConfigured: boolean;
  onConfigureClick: () => void;
}

interface AccessLog {
  timestamp: number;
  action: string;
  patientId: string;
  success: boolean;
}

interface Stats {
  totalPatients: number;
  encryptedRecords: number;
  lastActivity: number | null;
  isConnected: boolean;
  networkInfo: { 
    name: string; 
    isTestnet: boolean; 
    rpcUrl: string | undefined;
  };
  syncedPatients: number;
}

const BlockchainDashboard: React.FC<BlockchainDashboardProps> = ({ isConfigured, onConfigureClick }) => {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    encryptedRecords: 0,
    lastActivity: null,
    isConnected: false,
    networkInfo: { name: 'Not configured', isTestnet: false, rpcUrl: undefined },
    syncedPatients: 0
  });
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isConfigured) {
      loadData();
    }
  }, [isConfigured]);

  const loadData = async () => {
    try {
      const blockchainService = BlockchainService.getInstance();
      const blockchainStats = blockchainService.getBlockchainStats();
      
      setStats({
        totalPatients: blockchainStats.totalPatients,
        encryptedRecords: blockchainStats.totalPatients,
        lastActivity: blockchainStats.lastActivity,
        isConnected: blockchainStats.isConnected,
        networkInfo: {
          ...blockchainStats.networkInfo,
          rpcUrl: blockchainStats.networkInfo.rpcUrl || undefined
        },
        syncedPatients: blockchainStats.totalPatients
      });
      
      const allPatientIds = blockchainService.getStoredPatientIds();
      const allLogs: AccessLog[] = [];
      allPatientIds.forEach(patientId => {
        const logs = blockchainService.getAccessLogs(patientId);
        logs.forEach(log => {
          allLogs.push({
            timestamp: log.timestamp,
            action: `${log.accessType} access`,
            patientId: log.patientId,
            success: log.authorized
          });
        });
      });
      setAccessLogs(allLogs.slice(-10));
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      console.log('Firebase config check:', { 
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 
      });

      // Use a simple query without filters since the patient structure is different
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, limit } = await import('firebase/firestore');
      
      const patientsQuery = query(
        collection(db, 'patients'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(patientsQuery);
      const patients: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address,
          emergencyContact: data.emergencyContact,
          medicalInfo: data.medicalInfo,
          assignedHealthcareProvider: data.assignedHealthcareProvider || 'unassigned',
          createdBy: data.createdBy || 'unknown',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isActive: data.isActive !== false, // Default to true if not specified
        });
      });

      console.log(`✅ Firebase connected successfully! Found ${patients.length} patients`);
      toast.success(`Firebase connected! Found ${patients.length} patients`);
      
      // Log first few patients for debugging
      if (patients.length > 0) {
        console.log('Sample patients:', patients.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          provider: p.assignedHealthcareProvider,
          isActive: p.isActive
        })));
      }

      // Update the stats
      setStats(prev => ({
        ...prev,
        totalPatients: patients.length,
        syncedPatients: 0 // Will be updated when sync happens
      }));

    } catch (error) {
      console.error('Error testing Firebase:', error);
      toast.error('Firebase connection test failed. Check console for details.');
    }
  };

  const syncAllPatients = async () => {
    setIsSyncing(true);
    try {
      console.log('Starting patient sync...');
      
      // Get patients directly from Firestore with the correct structure
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, limit } = await import('firebase/firestore');
      
      const patientsQuery = query(
        collection(db, 'patients'),
        limit(50) // Sync first 50 patients
      );
      
      const querySnapshot = await getDocs(patientsQuery);
      const patients: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert to the format expected by blockchain service
        const blockchainPatient = {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth?.toDate ? data.dateOfBirth.toDate() : new Date(data.dateOfBirth),
          gender: data.gender,
          phone: data.phone,
          email: data.email || '',
          address: data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          emergencyContact: data.emergencyContact || {
            name: '',
            relationship: '',
            phone: ''
          },
          medicalInfo: data.medicalInfo || {
            bloodType: '',
            allergies: [],
            medications: [],
            previousComplications: [],
            chronicConditions: [],
            gestationalAge: 0,
            pregnancyNotes: ''
          },
          assignedHealthcareProvider: data.assignedHealthcareProvider || 'unassigned',
          createdBy: data.createdBy || 'system',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isActive: data.isActive !== false, // Default to true if not specified
        };
        patients.push(blockchainPatient);
      });

      if (patients.length === 0) {
        toast.info('No patients found to sync');
        return;
      }

      console.log(`Found ${patients.length} patients to sync`);
      
      // Store each patient in blockchain
      const blockchainService = BlockchainService.getInstance();
      let successCount = 0;
      let errorCount = 0;

      for (const patient of patients) {
        try {
          const result = await blockchainService.storePatientData(patient, 'confidential');
          if (result.success) {
            successCount++;
            console.log(`✓ Synced patient: ${patient.firstName} ${patient.lastName}`);
          } else {
            errorCount++;
            console.error(`✗ Failed to sync patient: ${patient.firstName} ${patient.lastName}`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to sync patient: ${patient.firstName} ${patient.lastName}`, error);
        }
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        totalPatients: patients.length,
        syncedPatients: successCount,
        lastActivity: Date.now()
      }));

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} patients to blockchain`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to sync ${errorCount} patients`);
      }

      console.log(`Sync completed: ${successCount} successful, ${errorCount} failed`);

    } catch (error) {
      console.error('Error syncing patients:', error);
      toast.error('Failed to sync patients. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Blockchain security is not configured. Please configure your blockchain settings to enable secure patient data storage.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Blockchain Security Setup
            </CardTitle>
            <CardDescription>
              Configure blockchain security to encrypt and securely store patient data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onConfigureClick} className="w-full">
              Configure Blockchain Security
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Synced to Blockchain</p>
                <p className="text-2xl font-bold">{stats.syncedPatients}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encrypted Records</p>
                <p className="text-2xl font-bold">{stats.encryptedRecords}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection Status</p>
                <div className="flex items-center gap-2">
                  {stats.isConnected ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Information</CardTitle>
                <CardDescription>Current blockchain network details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Network:</span>
                  <Badge variant={stats.networkInfo.isTestnet ? "secondary" : "default"}>
                    {stats.networkInfo.name}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Environment:</span>
                  <Badge variant={stats.networkInfo.isTestnet ? "outline" : "default"}>
                    {stats.networkInfo.isTestnet ? "Testnet" : "Mainnet"}
                  </Badge>
                </div>
                {stats.networkInfo.rpcUrl && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">RPC URL:</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {stats.networkInfo.rpcUrl}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Encryption and security information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Encryption:</span>
                  <Badge variant="default" className="bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    AES-256
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Storage:</span>
                  <Badge variant="default">
                    Immutable
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Activity:</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Data Synchronization</CardTitle>
              <CardDescription>
                Sync patient data from Firebase to blockchain for secure storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={testFirebaseConnection}
                  variant="outline"
                  disabled={isLoading}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test Firebase Connection
                </Button>
                
                <Button 
                  onClick={syncAllPatients}
                  disabled={isSyncing}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isSyncing ? 'Syncing...' : 'Sync All Patients'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
                  <div className="text-sm text-muted-foreground">Total Patients</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.syncedPatients}</div>
                  <div className="text-sm text-muted-foreground">Synced to Blockchain</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.encryptedRecords}</div>
                  <div className="text-sm text-muted-foreground">Encrypted Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>Recent blockchain access and operations</CardDescription>
            </CardHeader>
            <CardContent>
              {accessLogs.length > 0 ? (
                <div className="space-y-2">
                  {accessLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-muted-foreground">Patient ID: {log.patientId}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No access logs available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainDashboard; 