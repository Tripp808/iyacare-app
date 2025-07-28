'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Users, Database, Activity, Wallet, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { PatientService, Patient } from '@/services/patient.service';
import Web3BlockchainService from '@/services/web3-blockchain.service';
import { collection, query, where, orderBy, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BlockchainStats {
  totalPatients: number;
  encryptedRecords: number;
  lastActivity: number | null;
  isConnected: boolean;
  networkInfo: {
    name: string;
    isTestnet: boolean;
    rpcUrl: string;
    chainId: number;
  };
}

interface AccessLog {
  accessor: string;
  timestamp: number;
  accessType: string;
  authorized: boolean;
}

const BlockchainDashboard: React.FC = () => {
  const [stats, setStats] = useState<BlockchainStats>({
    totalPatients: 0,
    encryptedRecords: 0,
    lastActivity: null,
    isConnected: false,
    networkInfo: {
      name: 'Disconnected',
      isTestnet: false,
      rpcUrl: '',
      chainId: 0
    }
  });
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [decryptedPatients, setDecryptedPatients] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSyncingToLocal, setIsSyncingToLocal] = useState(false);

  const blockchainService = Web3BlockchainService.getInstance();

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      // Initialize blockchain service
      const initResult = await blockchainService.initialize();
      
      if (initResult.success) {
        // Load blockchain stats
        const blockchainStats = await blockchainService.getBlockchainStats();
        setStats(blockchainStats);
        
        // Load access logs (for demo, we'll load for first patient if any exist)
        const patientIds = blockchainService.getStoredPatientIds();
        if (patientIds.length > 0) {
          const logs = await blockchainService.getAccessLogs(patientIds[0]);
          setAccessLogs(logs);
        }
      } else {
        toast.error(`Blockchain initialization failed: ${initResult.error}`);
      }
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
      toast.error('Failed to load blockchain data');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const result = await blockchainService.connectWallet();
      
      if (result.success && result.address) {
        setWalletAddress(result.address);
        toast.success(`Wallet connected: ${result.address.substring(0, 8)}...`);
        await loadBlockchainData(); // Refresh data after connecting wallet
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const testBlockchainConnection = async () => {
    setIsLoading(true);
    try {
      console.log('🔗 Testing blockchain connection...');
      toast.info('Testing blockchain connection...');
      
      const initResult = await blockchainService.initialize();
      
      if (initResult.success) {
        const networkInfo = blockchainService.getNetworkInfo();
        console.log('✅ Blockchain connection successful:', networkInfo);
        toast.success(`Connected to ${networkInfo.name}`);
        
        await loadBlockchainData();
      } else {
        console.error('❌ Blockchain connection failed:', initResult.error);
        toast.error(`Connection failed: ${initResult.error}`);
      }
    } catch (error) {
      console.error('❌ Blockchain test error:', error);
      toast.error('Blockchain connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const syncPatientToBlockchain = async (patient: Patient) => {
    try {
      const result = await blockchainService.storePatientData(patient);
      
      if (result.success) {
        toast.success(`Patient ${patient.firstName} ${patient.lastName} synced to blockchain`);
        console.log('Transaction hash:', result.txHash);
        return true;
      } else {
        toast.error(`Failed to sync patient: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync patient to blockchain');
      return false;
    }
  };

  const getAllPatientsForSync = async () => {
    try {
      console.log('🔍 Debug: Starting getAllPatientsForSync...');
      
      // First, try to get ALL patients without any filtering to see if there are any
      console.log('🔍 Debug: Getting all patients without filters...');
      const allPatientsQuery = query(collection(db, 'patients'));
      const allSnapshot = await getDocs(allPatientsQuery);
      console.log(`🔍 Debug: Total patients in database: ${allSnapshot.size}`);
      
      if (allSnapshot.size === 0) {
        console.log('❌ Debug: No patients found in database at all!');
        return { success: true, patients: [] };
      }
      
      // Log some sample data
      allSnapshot.forEach((doc, index) => {
        if (index < 3) { // Only log first 3 for debugging
          const data = doc.data();
          console.log(`🔍 Debug: Patient ${index + 1}:`, {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive,
            hasFirstName: !!data.firstName
          });
        }
      });
      
      // Now try with isActive filter
      console.log('🔍 Debug: Filtering for active patients...');
      const activePatientsQuery = query(
        collection(db, 'patients'),
        where('isActive', '==', true)
      );
      
      const activeSnapshot = await getDocs(activePatientsQuery);
      console.log(`🔍 Debug: Active patients found: ${activeSnapshot.size}`);
      
      if (activeSnapshot.size === 0) {
        console.log('❌ Debug: No active patients found! All patients might be inactive.');
        // Let's get all patients regardless of isActive status
        console.log('🔍 Debug: Getting all patients regardless of active status...');
        const patients: any[] = [];
        
        allSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth?.toDate?.() || data.dateOfBirth,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalHistory: data.medicalInfo?.chronicConditions?.join(', ') || '',
            currentMedications: data.medicalInfo?.medications?.join(', ') || '',
            isPregnant: data.medicalInfo?.lastMenstrualPeriod ? true : false,
            dueDate: data.medicalInfo?.lastMenstrualPeriod ? 
              new Date(data.medicalInfo.lastMenstrualPeriod.toDate().getTime() + (40 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '',
            assignedHealthcareProvider: data.assignedHealthcareProvider,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
          });
        });
        
        console.log(`🔍 Debug: Returning ${patients.length} patients (including inactive)`);
        return { success: true, patients };
      }
      
      // Try with firstName ordering
      console.log('🔍 Debug: Adding firstName ordering...');
      try {
        const orderedQuery = query(
          collection(db, 'patients'),
          where('isActive', '==', true),
          orderBy('firstName')
        );
        
        const orderedSnapshot = await getDocs(orderedQuery);
        console.log(`🔍 Debug: Ordered query returned: ${orderedSnapshot.size} patients`);
        
        const patients: any[] = [];
        orderedSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth?.toDate?.() || data.dateOfBirth,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalHistory: data.medicalInfo?.chronicConditions?.join(', ') || '',
            currentMedications: data.medicalInfo?.medications?.join(', ') || '',
            isPregnant: data.medicalInfo?.lastMenstrualPeriod ? true : false,
            dueDate: data.medicalInfo?.lastMenstrualPeriod ? 
              new Date(data.medicalInfo.lastMenstrualPeriod.toDate().getTime() + (40 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '',
            assignedHealthcareProvider: data.assignedHealthcareProvider,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
          });
        });
        
        console.log(`🔍 Debug: Successfully processed ${patients.length} patients`);
        return { success: true, patients };
        
      } catch (orderError) {
        console.log('⚠️ Debug: OrderBy failed, trying without ordering...', orderError);
        
        // Fallback: just get active patients without ordering
        const patients: any[] = [];
        activeSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth?.toDate?.() || data.dateOfBirth,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalHistory: data.medicalInfo?.chronicConditions?.join(', ') || '',
            currentMedications: data.medicalInfo?.medications?.join(', ') || '',
            isPregnant: data.medicalInfo?.lastMenstrualPeriod ? true : false,
            dueDate: data.medicalInfo?.lastMenstrualPeriod ? 
              new Date(data.medicalInfo.lastMenstrualPeriod.toDate().getTime() + (40 * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '',
            assignedHealthcareProvider: data.assignedHealthcareProvider,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
          });
        });
        
        console.log(`🔍 Debug: Fallback processed ${patients.length} patients`);
        return { success: true, patients };
      }
      
    } catch (error: any) {
      console.error('❌ Debug: Error in getAllPatientsForSync:', error);
      return { success: false, error: error.message };
    }
  };

  const syncAllPatients = async () => {
    setIsSyncing(true);
    try {
      console.log('🔄 Starting patient sync to blockchain...');
      toast.info('Syncing patients to blockchain...');

      // First check if wallet is connected for write operations
      if (!walletAddress) {
        toast.error('Please connect your wallet first to sync patients');
        return;
      }

      // Get all patients from Firebase
      const patientsResponse = await getAllPatientsForSync();
      
      if (!patientsResponse.success || !patientsResponse.patients) {
        toast.error(`Failed to fetch patients from database: ${patientsResponse.error || 'Unknown error'}`);
        return;
      }

      const patients = patientsResponse.patients;
      console.log(`📋 Found ${patients.length} patients to sync`);

      if (patients.length === 0) {
        toast.info('No active patients found to sync. Please add some patients first.');
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      // Sync each patient to blockchain
      for (const patient of patients) {
        try {
          console.log(`⏳ Syncing patient: ${patient.firstName} ${patient.lastName}`);
          
          const syncResult = await syncPatientToBlockchain(patient);
          
          if (syncResult) {
            successCount++;
          } else {
            failureCount++;
          }

          // Add small delay between transactions to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to sync patient ${patient.id}:`, error);
          failureCount++;
        }
      }

      // Show final results
      if (successCount > 0) {
        toast.success(`✅ Successfully synced ${successCount} patients to blockchain`);
      }
      
      if (failureCount > 0) {
        toast.error(`❌ Failed to sync ${failureCount} patients`);
      }

      console.log(`🏁 Sync complete: ${successCount} success, ${failureCount} failed`);

      // Refresh blockchain data
      await loadBlockchainData();

    } catch (error) {
      console.error('❌ Bulk sync error:', error);
      toast.error('Failed to sync patients to blockchain');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncPatientsToLocalStorage = async () => {
    setIsSyncingToLocal(true);
    try {
      console.log('🔄 Syncing patient IDs to local storage...');
      toast.info('Syncing patient IDs to local storage...');
      
      const result = await blockchainService.syncExistingPatientsToLocalStorage();
      
      if (result.success) {
        toast.success(`✅ Synced ${result.synced} patient IDs to local storage`);
        console.log(`📋 Successfully synced ${result.synced} patient IDs`);
        
        // Refresh blockchain data to show updated counts
        await loadBlockchainData();
      } else {
        toast.error(`Failed to sync patient IDs: ${result.error}`);
        console.error('❌ Sync to local storage failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Sync to local storage error:', error);
      toast.error('Failed to sync patient IDs to local storage');
    } finally {
      setIsSyncingToLocal(false);
    }
  };

  const decryptAllPatients = async () => {
    setIsDecrypting(true);
    try {
      console.log('🔓 Decrypting patients from blockchain...');
      toast.info('Decrypting patients from blockchain...');
      
      const result = await blockchainService.getAllDecryptedPatients();
      
      if (result.success && result.patients) {
        setDecryptedPatients(result.patients);
        toast.success(`✅ Successfully decrypted ${result.patients.length} patients`);
        console.log(`🔓 Decrypted ${result.patients.length} patients:`, result.patients);
      } else {
        toast.error(`Failed to decrypt patients: ${result.error || 'Unknown error'}`);
        console.error('❌ Decryption failed:', result.error);
        setDecryptedPatients([]);
      }
    } catch (error) {
      console.error('❌ Decryption error:', error);
      toast.error('Failed to decrypt patients from blockchain');
      setDecryptedPatients([]);
    } finally {
      setIsDecrypting(false);
    }
  };

  const viewOnEtherscan = () => {
    if (stats.networkInfo.chainId === 11155111) {
      // Sepolia testnet
      const contractAddress = process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS;
      if (contractAddress) {
        window.open(`https://sepolia.etherscan.io/address/${contractAddress}`, '_blank');
      } else {
        toast.error('Contract address not configured');
      }
    } else {
      toast.error('Etherscan not available for this network');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Blockchain Security Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Secure patient data storage on Ethereum blockchain
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {!walletAddress ? (
            <Button onClick={connectWallet} disabled={isLoading} className="w-full sm:w-auto">
              <Wallet className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          ) : (
            <Badge variant="outline" className="px-3 py-1 justify-center sm:justify-start">
              <Wallet className="mr-2 h-3 w-3" />
              <span className="truncate max-w-[120px]">{walletAddress.substring(0, 8)}...</span>
            </Badge>
          )}
          <Button onClick={testBlockchainConnection} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
            <span className="hidden sm:inline">Test Connection</span>
            <span className="sm:hidden">Test</span>
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stats.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium truncate">
                {stats.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="font-medium truncate">{stats.networkInfo.name}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Chain ID</p>
              <p className="font-medium">{stats.networkInfo.chainId || 'N/A'}</p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Button onClick={viewOnEtherscan} variant="outline" size="sm" className="w-full sm:w-auto">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View on Etherscan</span>
                <span className="sm:hidden">Etherscan</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Stored on blockchain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encryptedRecords}</div>
            <p className="text-xs text-muted-foreground">
              AES-256 encrypted
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest blockchain interaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Data Synchronization</CardTitle>
            <CardDescription className="text-sm">
              Sync patient data from Firebase to blockchain for enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={syncAllPatients} 
              disabled={isSyncing || isLoading || !walletAddress}
              className="w-full"
            >
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : 'Sync All Patients to Blockchain'}
              </span>
              <span className="sm:hidden">
                {isSyncing ? 'Syncing...' : 'Sync Patients'}
              </span>
            </Button>
            {!walletAddress && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to enable patient synchronization
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Data Decryption</CardTitle>
            <CardDescription className="text-sm">
              Sync patient IDs to local storage and decrypt blockchain data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={syncPatientsToLocalStorage} 
              disabled={isSyncingToLocal || isLoading}
              className="w-full"
              variant="outline"
            >
              <Database className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">
                {isSyncingToLocal ? 'Syncing...' : 'Sync Patient IDs to Local Storage'}
              </span>
              <span className="sm:hidden">
                {isSyncingToLocal ? 'Syncing...' : 'Sync to Local'}
              </span>
            </Button>
            
            <Button 
              onClick={decryptAllPatients} 
              disabled={isDecrypting || isLoading}
              className="w-full"
            >
              <Shield className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">
                {isDecrypting ? 'Decrypting...' : 'Decrypt & View Patients'}
              </span>
              <span className="sm:hidden">
                {isDecrypting ? 'Decrypting...' : 'Decrypt Patients'}
              </span>
            </Button>
            
            {decryptedPatients.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✅ {decryptedPatients.length} patients decrypted from blockchain
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Decrypted Patients Display */}
      {decryptedPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Decrypted Patient Data</CardTitle>
            <CardDescription>
              Patient data decrypted from blockchain with metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decryptedPatients.map((patient, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <Badge variant="outline" className="w-fit">
                      On-Chain Data
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Email:</strong> {patient.email}</p>
                      <p><strong>Phone:</strong> {patient.phone}</p>
                      <p><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
                      {patient.isPregnant && (
                        <p><strong>Due Date:</strong> {patient.dueDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <p><strong>Medical History:</strong> {patient.medicalHistory || 'None'}</p>
                      <p><strong>Current Medications:</strong> {patient.currentMedications || 'None'}</p>
                      <p><strong>Emergency Contact:</strong> {patient.emergencyContact}</p>
                    </div>
                  </div>
                  
                  {patient.blockchain && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-medium text-blue-800 mb-2">Blockchain Metadata</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
                        <p><strong>Data Hash:</strong> {patient.blockchain.dataHash?.substring(0, 16)}...</p>
                        <p><strong>Timestamp:</strong> {new Date(patient.blockchain.timestamp).toLocaleString()}</p>
                        <p><strong>Version:</strong> {patient.blockchain.version}</p>
                        <p><strong>Status:</strong> {patient.blockchain.onChain ? 'On-Chain' : 'Off-Chain'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Features</CardTitle>
            <CardDescription className="text-sm">
              Active blockchain security measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-sm">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-sm">Immutable Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-sm">Access Logging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-sm">Data Integrity Verification</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Logs */}
      {accessLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Access Logs</CardTitle>
            <CardDescription>
              Blockchain access history for patient data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accessLogs.slice(0, 5).map((log, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.authorized ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{log.accessType}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.accessor.substring(0, 10)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col sm:text-right gap-2 sm:gap-1 items-center sm:items-end">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp * 1000).toLocaleString()}
                    </p>
                    <Badge variant={log.authorized ? 'default' : 'destructive'} className="text-xs">
                      {log.authorized ? 'Authorized' : 'Unauthorized'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for testnet */}
      {stats.networkInfo.isTestnet && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Testnet Environment</p>
              <p className="text-sm text-yellow-700">
                This is running on {stats.networkInfo.name}. No real ETH is required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlockchainDashboard; 