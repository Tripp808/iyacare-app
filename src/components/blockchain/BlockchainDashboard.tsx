'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Users, Database, Activity, Wallet, ExternalLink } from 'lucide-react';
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

      // Get patients from Firebase
      const patientsResponse = await PatientService.searchPatients('');
      
      if (!patientsResponse.success || !patientsResponse.patients) {
        toast.error('Failed to fetch patients from database');
        return;
      }

      const patients = patientsResponse.patients;
      console.log(`📋 Found ${patients.length} patients to sync`);

      if (patients.length === 0) {
        toast.info('No patients found to sync');
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