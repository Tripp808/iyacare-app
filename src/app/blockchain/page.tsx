'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Settings, Database, Lock } from 'lucide-react';
import { BlockchainConfig, BlockchainDashboard } from '@/components/blockchain';
import { blockchainService } from '@/services/blockchain.service';
import { useAuth } from '@/hooks/useAuth';

const BlockchainPage: React.FC = () => {
  const { user } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = blockchainService.isConfigured();
    setIsConfigured(configured);
  };

  const handleConfigurationChange = () => {
    checkConfiguration();
    // Switch to dashboard after configuration
    if (blockchainService.isConfigured()) {
      setActiveTab('dashboard');
    }
  };

  const handleConfigureClick = () => {
    setActiveTab('config');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Blockchain Security
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure patient data with blockchain encryption and immutable storage
          </p>
        </div>
        <Badge 
          className={`${
            isConfigured 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}
        >
          {isConfigured ? (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Active
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Setup Required
            </>
          )}
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BlockchainDashboard />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Blockchain Configuration
              </CardTitle>
              <CardDescription>
                Configure blockchain settings for secure patient data storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlockchainConfig onConfigurationChange={handleConfigurationChange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-blue-500" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Patient data is encrypted using AES-256 encryption before being stored on the blockchain, 
              ensuring maximum security and privacy protection.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-green-500" />
              Immutable Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Data stored on blockchain cannot be altered or deleted, providing an immutable 
              audit trail for all patient information and medical records.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-purple-500" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every access to patient data is logged and tracked, ensuring complete transparency 
              and accountability in data access patterns.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This blockchain implementation uses industry-standard 
          encryption and security practices. All patient data is encrypted locally before 
          transmission and storage. Private keys are generated securely and should be stored safely.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BlockchainPage; 