'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Users, Database, Activity, Wallet, ExternalLink, Eye, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PatientService, Patient } from '@/services/patient.service';
import Web3BlockchainService from '@/services/web3-blockchain.service';

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
  const [contractAddress, setContractAddress] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [decryptedPatients, setDecryptedPatients] = useState<Patient[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const blockchainService = Web3BlockchainService.getInstance();

  useEffect(() => {
    loadBlockchainData();
    // Set contract address from environment
    const envContractAddress = process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS;
    if (envContractAddress) {
      setContractAddress(envContractAddress);
    }
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

      // Get patients from Firebase - fetch all active patients directly
      console.log('🔍 Fetching patients from Firebase...');
      
      // Import Firebase functions directly for better control
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      let patientsResponse;
      try {
        console.log('🔗 Testing Firebase connection...');
        console.log('📊 Database instance:', db);
        
        // First, try to get the collection without any filters
        console.log('📋 Attempting to access patients collection...');
        const patientsCollection = collection(db, 'patients');
        console.log('✅ Patients collection created:', patientsCollection);
        
        // Try getting all documents first (without filters)
        console.log('🔍 Fetching ALL documents from patients collection...');
        const allDocsSnapshot = await getDocs(patientsCollection);
        console.log(`📊 Total documents in patients collection: ${allDocsSnapshot.size}`);
        
        // Log some basic info about each document
        const allDocs: any[] = [];
        allDocsSnapshot.forEach((doc) => {
          const data = doc.data();
          allDocs.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive
          });
        });
        console.log('📋 All documents:', allDocs);
        
        // Skip isActive filter for now - sync all patients
        console.log('🔍 Getting all patients (skipping isActive filter)...');
        const patientsQuery = query(
          collection(db, 'patients'),
          orderBy('firstName')
        );
        
        const querySnapshot = await getDocs(patientsQuery);
        const patients: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth?.toDate ? data.dateOfBirth.toDate() : data.dateOfBirth,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            address: data.address,
            emergencyContact: data.emergencyContact,
            medicalInfo: {
              ...data.medicalInfo,
              lastMenstrualPeriod: data.medicalInfo?.lastMenstrualPeriod?.toDate ? data.medicalInfo.lastMenstrualPeriod.toDate() : data.medicalInfo?.lastMenstrualPeriod,
            },
            assignedHealthcareProvider: data.assignedHealthcareProvider,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
          });
        });
        
        patientsResponse = {
          success: true,
          patients
        };
        
        console.log('📊 Direct Firebase fetch result:', patientsResponse);
        
      } catch (error) {
        console.error('❌ Direct Firebase fetch error:', error);
        patientsResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          patients: []
        };
      }
      
      if (!patientsResponse.success) {
        console.error('❌ Failed to fetch patients:', patientsResponse.error);
        toast.error(`Failed to fetch patients: ${patientsResponse.error || 'Unknown error'}`);
        return;
      }

      if (!patientsResponse.patients) {
        console.error('❌ No patients array in response');
        toast.error('No patients data received from database');
        return;
      }

      const patients = patientsResponse.patients;
      console.log(`📋 Found ${patients.length} patients to sync`);
      console.log('👥 Patient names:', patients.map(p => `${p.firstName} ${p.lastName}`));

      if (patients.length === 0) {
        toast.info('No patients found to sync. Please check if you have active patients in your database.');
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

  const viewOnEtherscan = () => {
    if (contractAddress) {
      const etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
      window.open(etherscanUrl, '_blank');
      toast.success('Opening contract on Etherscan');
    } else {
      toast.error('Contract address not configured');
    }
  };

  const viewContractFunctions = () => {
    if (contractAddress) {
      const etherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}#readContract`;
      window.open(etherscanUrl, '_blank');
      toast.success('Opening contract functions on Etherscan');
    } else {
      toast.error('Contract address not configured');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const authorizeWallet = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting wallet authorization...');
      toast.info('Checking wallet permissions...');
      
      // Ensure wallet is connected first
      if (!walletAddress) {
        console.log('🔗 No wallet connected, attempting to connect...');
        const connectResult = await connectWallet();
        if (!connectResult) {
          toast.error('Please connect your wallet first');
          return;
        }
      }
      
      // Ensure blockchain service is initialized
      console.log('🔍 Ensuring blockchain service is initialized...');
      const initResult = await blockchainService.initialize();
      if (!initResult.success) {
        toast.error(`Failed to initialize blockchain service: ${initResult.error}`);
        return;
      }
      
      // Check if already authorized
      console.log('🔍 Checking current authorization status...');
      const authCheck = await blockchainService.isAuthorizedProvider();
      if (authCheck.success && authCheck.authorized) {
        toast.success('Wallet is already authorized as healthcare provider!');
        return;
      }
      
      // Check if current wallet is admin
      console.log('🔍 Checking if current wallet is admin...');
      const adminCheck = await blockchainService.isAdmin();
      
      if (adminCheck.success && adminCheck.isAdmin) {
        // Current wallet is admin, authorize itself
        console.log('✅ Current wallet is admin, authorizing as healthcare provider...');
        toast.info('Admin wallet detected, authorizing as healthcare provider...');
        
        const authResult = await blockchainService.authorizeProviderAsAdmin(walletAddress);
        if (authResult.success) {
          toast.success(`Wallet authorized successfully! Transaction: ${authResult.txHash?.substring(0, 10)}...`);
          await loadBlockchainData();
        } else {
          toast.error(`Authorization failed: ${authResult.error}`);
        }
      } else {
        // Current wallet is not admin
        console.log('❌ Current wallet is not admin');
        toast.error(
          'Current wallet is not the contract admin. Please switch to the admin wallet (contract deployer) to authorize healthcare providers.'
        );
        
        // Show helpful information
        toast.info(
          `Admin wallet starts with: 0xE29561A8... Your wallet: ${walletAddress.substring(0, 10)}...`,
          { duration: 8000 }
        );
      }
      
    } catch (error) {
      console.error('❌ Authorization error:', error);
      toast.error('Failed to authorize wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const syncExistingPatients = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Syncing existing blockchain patients to local storage...');
      toast.info('Syncing existing patients from blockchain...');
      
      const result = await blockchainService.syncExistingPatientsToLocalStorage();
      
      if (result.success) {
        toast.success(`Successfully synced ${result.synced} patient IDs to local storage`);
        console.log(`✅ Synced ${result.synced} patients to local storage`);
        
        // Refresh blockchain data
        await loadBlockchainData();
      } else {
        toast.error(`Failed to sync patients: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync existing patients');
    } finally {
      setIsLoading(false);
    }
  };

  const decryptBlockchainPatients = async () => {
    setIsDecrypting(true);
    try {
      console.log('🔓 Starting blockchain patient decryption...');
      const result = await blockchainService.getAllDecryptedPatients();
      
      if (result.success && result.patients) {
        setDecryptedPatients(result.patients);
        console.log('🎉 Decrypted patients:', result.patients);
        toast.success(`Successfully decrypted ${result.patients.length} patients from blockchain`);
      } else {
        toast.error(`Failed to decrypt patients: ${result.error}`);
      }
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error('Failed to decrypt blockchain patients');
    } finally {
      setIsDecrypting(false);
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

      {/* Smart Contract Information */}
      {contractAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Smart Contract Details
            </CardTitle>
            <CardDescription>
              Your deployed PatientDataStorage contract on Sepolia testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Contract Address</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm font-mono flex-1 truncate">{contractAddress}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(contractAddress, 'Contract address')}
                    className="h-8 w-8 p-0"
                  >
                    {copied === 'Contract address' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Network</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Sepolia Testnet</Badge>
                  <Badge variant="secondary">Chain ID: 11155111</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">RPC Endpoint</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm font-mono flex-1 truncate">
                    {stats.networkInfo.rpcUrl || 'https://eth-sepolia.g.alchemy.com/v2/...'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(stats.networkInfo.rpcUrl || 'https://eth-sepolia.g.alchemy.com/v2/Rfc83NSvrlxYW1onyB0qr2z1hpor5rOl', 'RPC URL')}
                    className="h-8 w-8 p-0"
                  >
                    {copied === 'RPC URL' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={viewOnEtherscan} variant="outline" className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Contract
              </Button>
              <Button onClick={viewContractFunctions} variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Read Functions
              </Button>
            </div>
            
            <div className="pt-3 border-t">
              {!walletAddress ? (
                <div className="space-y-2">
                  <Button onClick={connectWallet} disabled={isLoading} className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Connect MetaMask to interact with the blockchain
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                    <p className="text-xs text-green-600 font-mono">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                    </p>
                  </div>
                  <Button onClick={authorizeWallet} disabled={isLoading} className="w-full" variant="secondary">
                    <Shield className="mr-2 h-4 w-4" />
                    Authorize Wallet as Healthcare Provider
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Required before syncing patients to blockchain
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Decrypted Blockchain Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Decrypted Blockchain Patients
          </CardTitle>
          <CardDescription>
            View patient details decrypted from blockchain storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sync Existing Patients Button */}
            <Button 
              onClick={syncExistingPatients} 
              disabled={isLoading || !walletAddress}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Existing Patients to Local Storage
                </>
              )}
            </Button>
            
            {/* Decrypt Patients Button */}
            <Button 
              onClick={decryptBlockchainPatients} 
              disabled={isDecrypting || !walletAddress}
              className="w-full"
            >
              {isDecrypting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Decrypt & View Patients
                </>
              )}
            </Button>
            
            {!walletAddress && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to decrypt blockchain patients
              </p>
            )}
            
            {decryptedPatients.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">
                      Successfully Decrypted {decryptedPatients.length} Patients
                    </h4>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {decryptedPatients.length} found
                  </Badge>
                </div>
                
                <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {decryptedPatients.map((patient, index) => (
                    <div key={patient.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Patient Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-lg text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </h5>
                            <p className="text-sm text-gray-500 font-mono">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-sm">
                            Age {patient.age}
                          </Badge>
                          <Badge variant="secondary" className="text-sm">
                            ✅ Verified
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Patient Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Contact Information</p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                              <p className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {patient.phone || 'No phone'}
                              </p>
                              <p className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {patient.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Medical Information</p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                              <p className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                DOB: {patient.dateOfBirth || 'Not provided'}
                              </p>
                              <p className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                {patient.address || 'No address provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Blockchain Metadata */}
                      {(patient as any).blockchainInfo && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-gray-700">
                              Blockchain Verification
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">
                                  <span className="font-medium">Stored:</span> {new Date((patient as any).blockchainInfo.storedAt).toLocaleString()}
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Patient ID:</span> {(patient as any).blockchainInfo.patientId}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">
                                  <span className="font-medium">Updated by:</span> 
                                  <code className="ml-1 text-xs bg-gray-200 px-1 rounded">
                                    {(patient as any).blockchainInfo.updatedBy.substring(0, 10)}...
                                  </code>
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Data Hash:</span> 
                                  <code className="ml-1 text-xs bg-gray-200 px-1 rounded">
                                    {(patient as any).blockchainInfo.dataHash.substring(0, 10)}...
                                  </code>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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