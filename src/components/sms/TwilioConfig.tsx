'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Check, X, Settings, Phone } from 'lucide-react';
import { twilioService } from '@/services/twilio.service';
import { toast } from 'sonner';

interface TwilioConfigProps {
  onConfigUpdate?: (isConfigured: boolean) => void;
}

const TwilioConfig: React.FC<TwilioConfigProps> = ({ onConfigUpdate }) => {
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Check if Twilio is already configured
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = twilioService.isConfigured();
    setIsConfigured(configured);
    if (configured) {
      const currentConfig = twilioService.getConfig();
      if (currentConfig) {
        setConfig({
          accountSid: currentConfig.accountSid || '',
          authToken: currentConfig.authToken ? '••••••••••••••••' : '',
          phoneNumber: currentConfig.phoneNumber || ''
        });
      }
    }
    onConfigUpdate?.(configured);
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null);
  };

  const validateConfig = () => {
    if (!config.accountSid.trim()) {
      toast.error('Account SID is required');
      return false;
    }
    if (!config.authToken.trim() || config.authToken === '••••••••••••••••') {
      toast.error('Auth Token is required');
      return false;
    }
    if (!config.phoneNumber.trim()) {
      toast.error('Phone Number is required');
      return false;
    }
    return true;
  };

  const handleSaveConfig = async () => {
    if (!validateConfig()) return;

    setIsLoading(true);
    try {
      // Initialize Twilio with the provided configuration
      const result = await twilioService.initialize({
        accountSid: config.accountSid,
        authToken: config.authToken,
        phoneNumber: config.phoneNumber
      });

      if (result.success) {
        setIsConfigured(true);
        toast.success('Twilio configuration saved successfully');
        onConfigUpdate?.(true);
        
        // Hide the auth token after saving
        setConfig(prev => ({
          ...prev,
          authToken: '••••••••••••••••'
        }));
      } else {
        toast.error(result.error || 'Failed to configure Twilio');
      }
    } catch (error: any) {
      toast.error('Error saving configuration: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!isConfigured) {
      toast.error('Please save configuration first');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Test by sending a test message to the configured phone number
      const testMessage = "Test message from IyàCare - Twilio configuration is working correctly!";
      const result = await twilioService.sendSMS({
        to: config.phoneNumber,
        body: testMessage
      });

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Test message sent successfully! Check your phone.'
        });
        toast.success('Test message sent successfully');
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to send test message'
        });
        toast.error('Test failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to test connection';
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast.error('Test failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfig = () => {
    setConfig({
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    });
    setIsConfigured(false);
    setTestResult(null);
    // Note: In a real implementation, you'd also clear the stored configuration
    toast.info('Configuration cleared');
    onConfigUpdate?.(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Twilio Configuration</CardTitle>
          </div>
          <Badge variant={isConfigured ? "default" : "secondary"}>
            {isConfigured ? "Configured" : "Not Configured"}
          </Badge>
        </div>
        <CardDescription>
          Configure your Twilio credentials to enable SMS functionality for patient communication and alerts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Account SID */}
        <div className="space-y-2">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input
            id="accountSid"
            type="text"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={config.accountSid}
            onChange={(e) => handleInputChange('accountSid', e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Your Twilio Account SID from the Twilio Console
          </p>
        </div>

        {/* Auth Token */}
        <div className="space-y-2">
          <Label htmlFor="authToken">Auth Token</Label>
          <div className="relative">
            <Input
              id="authToken"
              type={showAuthToken ? "text" : "password"}
              placeholder="Your Twilio Auth Token"
              value={config.authToken}
              onChange={(e) => handleInputChange('authToken', e.target.value)}
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowAuthToken(!showAuthToken)}
              disabled={isLoading}
            >
              {showAuthToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your Twilio Auth Token (keep this secure)
          </p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1234567890"
            value={config.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Your Twilio phone number (must include country code)
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveConfig}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
          
          {isConfigured && (
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          )}
          
          {isConfigured && (
            <Button
              variant="destructive"
              onClick={handleClearConfig}
              disabled={isLoading}
            >
              Clear Config
            </Button>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to get your Twilio credentials:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Sign up for a Twilio account at <span className="font-mono">twilio.com</span></li>
            <li>Go to the Twilio Console Dashboard</li>
            <li>Find your Account SID and Auth Token</li>
            <li>Purchase a phone number from Twilio</li>
            <li>Enter the credentials above and save</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwilioConfig; 