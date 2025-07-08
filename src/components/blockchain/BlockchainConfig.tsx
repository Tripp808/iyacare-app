'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  TestTube,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { blockchainService } from '@/services/blockchain.service';

interface BlockchainConfigProps {
  onConfigurationChange?: () => void;
}

const BlockchainConfig: React.FC<BlockchainConfigProps> = ({ onConfigurationChange }) => {
  const [config, setConfig] = useState({
    rpcUrl: 'https://rpc.sepolia.org', // Default free Sepolia endpoint
    contractAddress: '',
    encryptionKey: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = blockchainService.isConfigured();
    setIsConfigured(configured);
    setConnectionStatus(configured ? 'connected' : 'disconnected');
    if (onConfigurationChange) {
      onConfigurationChange();
    }
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

  const tryAlternativeEndpoint = () => {
    const alternatives = [
      'https://rpc.sepolia.org',
      'https://sepolia.gateway.tenderly.co',
      'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
      'https://sepolia.drpc.org'
    ];
    const currentIndex = alternatives.indexOf(config.rpcUrl);
    const nextIndex = (currentIndex + 1) % alternatives.length;
    const nextEndpoint = alternatives[nextIndex];
    
    setConfig(prev => ({ ...prev, rpcUrl: nextEndpoint }));
    toast.info(`Switched to: ${nextEndpoint.split('//')[1]}`);
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
      const result = await blockchainService.initialize({
        rpcUrl: config.rpcUrl,
        contractAddress: config.contractAddress || undefined,
        encryptionKey: config.encryptionKey,
        isTestnet: true // Always use testnet for now
      });

      if (result.success) {
        setConnectionStatus('connected');
        setIsConfigured(true);
        setConnectionError('');
        setIsEditing(false);
        toast.success('Blockchain configured successfully!');
        
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
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <TestTube className="h-4 w-4 mr-2" />
            Sepolia Testnet
            </Badge>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2 capitalize">{connectionStatus}</span>
          </Badge>
          {isConfigured && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {connectionStatus === 'error' && connectionError && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Failed:</strong> {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {isConfigured && !isEditing && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Blockchain is configured and ready!</strong> Patient data will be securely stored with encryption on Sepolia Testnet.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Form */}
      {(!isConfigured || isEditing) && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Network Connection
              </CardTitle>
              <CardDescription>
                Configure your Sepolia testnet connection (free for development)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rpcUrl">RPC Endpoint *</Label>
                <div className="flex gap-2">
                  <Input
                    id="rpcUrl"
                    type="url"
                    placeholder="https://rpc.sepolia.org"
                    value={config.rpcUrl}
                    onChange={(e) => handleConfigChange('rpcUrl', e.target.value)}
                    className="flex-1"
                  />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={tryAlternativeEndpoint}
                    title="Try different free endpoint"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Free Sepolia testnet endpoint (no API key required)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractAddress">Smart Contract Address (Optional)</Label>
                <Input
                  id="contractAddress"
                  placeholder="0x... (will be set after deployment)"
                  value={config.contractAddress}
                  onChange={(e) => handleConfigChange('contractAddress', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use local storage until contract is deployed
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
                Secure encryption key for protecting patient data
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
                      Save & Test Configuration
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simple Info Card when configured */}
      {isConfigured && !isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
              Current Configuration
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="secondary">Sepolia Testnet</Badge>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">RPC Endpoint:</span>
              <span className="text-sm text-muted-foreground">{config.rpcUrl.split('//')[1]}</span>
                </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Contract:</span>
              <span className="text-sm text-muted-foreground">
                {config.contractAddress ? `${config.contractAddress.slice(0, 8)}...` : 'Not deployed yet'}
              </span>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Encryption:</span>
              <Badge variant="secondary">
                <Key className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default BlockchainConfig; 