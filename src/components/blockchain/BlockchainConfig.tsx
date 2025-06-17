'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Key, 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff,
  RefreshCw,
  Zap,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { blockchainService } from '@/services/blockchain.service';

interface BlockchainConfigProps {
  onConfigurationChange?: () => void;
}

const BlockchainConfig: React.FC<BlockchainConfigProps> = ({ onConfigurationChange }) => {
  const [config, setConfig] = useState({
    rpcUrl: 'https://sepolia.infura.io/v3/demo-key', // Default to Sepolia testnet
    contractAddress: '',
    privateKey: '',
    encryptionKey: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAccesses: 0,
    lastActivity: null as number | null,
    isConnected: false,
    networkInfo: { name: 'Not configured', isTestnet: false }
  });
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    checkConfiguration();
    loadStats();
    loadDefaultTestnetConfig();
  }, []);

  const loadDefaultTestnetConfig = () => {
    const defaultConfig = blockchainService.getDefaultTestnetConfig();
    if (defaultConfig.rpcUrl) {
      setConfig(prev => ({ ...prev, rpcUrl: defaultConfig.rpcUrl || prev.rpcUrl }));
    }
  };

  const tryAlternativeEndpoint = () => {
    const alternatives = blockchainService.getAlternativeTestnetEndpoints();
    const currentIndex = alternatives.indexOf(config.rpcUrl);
    const nextIndex = (currentIndex + 1) % alternatives.length;
    const nextEndpoint = alternatives[nextIndex];
    
    setConfig(prev => ({ ...prev, rpcUrl: nextEndpoint }));
    toast.info(`Switched to alternative endpoint: ${nextEndpoint}`);
  };

  const checkConfiguration = () => {
    const configured = blockchainService.isConfigured();
    setIsConfigured(configured);
    setConnectionStatus(configured ? 'connected' : 'disconnected');
    if (onConfigurationChange) {
      onConfigurationChange();
    }
  };

  const loadStats = () => {
    const blockchainStats = blockchainService.getBlockchainStats();
    setStats(blockchainStats);
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const generateEncryptionKey = () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setConfig(prev => ({ ...prev, encryptionKey: key }));
    toast.success('Encryption key generated successfully');
  };

  const testConnection = async () => {
    if (!config.rpcUrl || !config.encryptionKey) {
      toast.error('Please provide RPC URL and encryption key');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    setConnectionError('');

    try {
      const isTestnet = config.rpcUrl.includes('sepolia') || config.rpcUrl.includes('goerli') || config.rpcUrl.includes('testnet');
      
      const result = await blockchainService.initialize({
        rpcUrl: config.rpcUrl,
        contractAddress: config.contractAddress || undefined,
        privateKey: config.privateKey || undefined,
        encryptionKey: config.encryptionKey,
        isTestnet
      });

      if (result.success) {
        setConnectionStatus('connected');
        setIsConfigured(true);
        setConnectionError('');
        toast.success(`Blockchain connection established successfully on ${isTestnet ? 'testnet' : 'mainnet'}!`);
        loadStats();
        
        if (onConfigurationChange) {
          onConfigurationChange();
        }
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Connection failed');
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionError(error.message);
      toast.error(`Connection error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const isTestnetUrl = (url: string) => {
    return url.includes('sepolia') || url.includes('goerli') || url.includes('testnet');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blockchain Configuration</h2>
          <p className="text-muted-foreground">
            Configure blockchain settings for secure patient data storage
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTestnetUrl(config.rpcUrl) && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <TestTube className="h-4 w-4 mr-2" />
              Testnet
            </Badge>
          )}
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2 capitalize">{connectionStatus}</span>
          </Badge>
        </div>
      </div>

      {/* Connection Status Alert */}
      {connectionStatus === 'error' && connectionError && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Failed:</strong> {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {isConfigured && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Blockchain is configured and ready!</strong> Patient data will be securely stored with encryption on {stats.networkInfo.name}.
          </AlertDescription>
        </Alert>
      )}

      {isTestnetUrl(config.rpcUrl) && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <TestTube className="h-4 w-4" />
          <AlertDescription>
            <strong>Testnet Mode:</strong> You're using a test network. This is perfect for development and testing without real costs.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="security">Security Info</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Blockchain Connection
              </CardTitle>
              <CardDescription>
                Configure your blockchain network connection settings. Using testnet is recommended for development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rpcUrl">RPC URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="rpcUrl"
                    type="url"
                    placeholder="https://rpc.sepolia.org"
                    value={config.rpcUrl}
                    onChange={(e) => handleConfigChange('rpcUrl', e.target.value)}
                    className="flex-1"
                  />
                  {isTestnetUrl(config.rpcUrl) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={tryAlternativeEndpoint}
                      title="Try alternative testnet endpoint"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isTestnetUrl(config.rpcUrl) ? (
                    <span className="text-blue-600">✓ Using testnet (recommended for development)</span>
                  ) : (
                    <span>Ethereum RPC endpoint (e.g., Infura, Alchemy, or local node)</span>
                  )}
                </p>
                {connectionStatus === 'error' && connectionError.includes('401') && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>RPC Connection Issue:</strong> Try clicking the refresh button to use an alternative free endpoint, or get your own free Infura key at <a href="https://infura.io" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">infura.io</a>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractAddress">Smart Contract Address (Optional)</Label>
                <Input
                  id="contractAddress"
                  placeholder="0x742d35Cc6634C0532925a3b8D4b9b4e8d2f7c9a2"
                  value={config.contractAddress}
                  onChange={(e) => handleConfigChange('contractAddress', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use local storage as fallback
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (Optional)</Label>
                <div className="relative">
                  <Input
                    id="privateKey"
                    type={showPrivateKey ? 'text' : 'password'}
                    placeholder="0x1234567890abcdef..."
                    value={config.privateKey}
                    onChange={(e) => handleConfigChange('privateKey', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Required only for writing to blockchain. Keep this secure! For testnet, you can use test keys.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Data Encryption
              </CardTitle>
              <CardDescription>
                Configure encryption settings for patient data security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encryptionKey">Encryption Key *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="encryptionKey"
                      type={showEncryptionKey ? 'text' : 'password'}
                      placeholder="Your secure encryption key"
                      value={config.encryptionKey}
                      onChange={(e) => handleConfigChange('encryptionKey', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                    >
                      {showEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateEncryptionKey}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  256-bit encryption key for securing patient data. Store this safely!
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={testConnection}
                  disabled={isConnecting || !config.rpcUrl || !config.encryptionKey}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Test & Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stored Patients</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">On blockchain</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accesses</CardTitle>
                <Key className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalAccesses}</div>
                <p className="text-xs text-muted-foreground">Read/Write operations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                {stats.networkInfo.isTestnet ? (
                  <TestTube className="h-4 w-4 text-blue-500" />
                ) : (
                  <Link className="h-4 w-4 text-purple-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.networkInfo.isTestnet ? 'text-blue-600' : 'text-purple-600'}`}>
                  {stats.networkInfo.isTestnet ? 'Testnet' : 'Mainnet'}
                </div>
                <p className="text-xs text-muted-foreground">{stats.networkInfo.name}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connection</CardTitle>
                <CheckCircle className={`h-4 w-4 ${stats.isConnected ? 'text-green-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isConnected ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">Blockchain status</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Security Features
              </CardTitle>
              <CardDescription>
                Learn about the security measures protecting your patient data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">AES-256 Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      All patient data is encrypted using military-grade AES-256 encryption before storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TestTube className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Testnet Development</h4>
                    <p className="text-sm text-muted-foreground">
                      Test networks allow safe development and testing without real cryptocurrency costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Data Hashing</h4>
                    <p className="text-sm text-muted-foreground">
                      SHA-256 hashing ensures data integrity and detects any unauthorized modifications.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Link className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Blockchain Immutability</h4>
                    <p className="text-sm text-muted-foreground">
                      Data stored on blockchain cannot be altered, providing permanent audit trails.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Three-tier access levels: Public, Restricted, and Confidential data access.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Testnet Benefits:</strong> Using testnet allows you to test all blockchain features safely without spending real cryptocurrency. 
              Perfect for development, testing, and learning how the system works.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainConfig; 