'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Settings, Users, BarChart3, Zap, AlertTriangle, Phone } from 'lucide-react';
import { toast } from 'sonner';

// SMS Components
import SMSMessagesTab from '@/components/sms/SMSMessagesTab';
import SMSTemplatesTab from '@/components/sms/SMSTemplatesTab';
import SMSCampaignsTab from '@/components/sms/SMSCampaignsTab';
import SMSAnalyticsTab from '@/components/sms/SMSAnalyticsTab';
import TwilioConfig from '@/components/sms/TwilioConfig';

// Services
import { SMSService } from '@/services/sms.service';
import { twilioService } from '@/services/twilio.service';
import { automatedMessagingService } from '@/services/automated-messaging.service';
import { PatientService } from '@/services/patient.service';

// Types
import { SMSMessage, SMSTemplate, SMSCampaign, SMSAnalytics } from '@/types';

const SMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // SMS Data
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
  const [analytics, setAnalytics] = useState<SMSAnalytics | null>(null);

  // High-risk monitoring
  const [highRiskPatients, setHighRiskPatients] = useState<number>(0);
  const [automatedAlertsCount, setAutomatedAlertsCount] = useState<number>(0);

  useEffect(() => {
    loadSMSData();
    checkTwilioConfiguration();
    loadHighRiskData();
  }, []);

  const checkTwilioConfiguration = () => {
    const configured = twilioService.isConfigured();
    setIsConfigured(configured);
    if (!configured) {
      setShowConfig(true);
    }
  };

  const loadSMSData = async () => {
    setIsLoading(true);
    try {
      // Set up date range for analytics (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [messagesResult, templatesResult, campaignsResult, analyticsResult] = await Promise.all([
        SMSService.getMessages(),
        SMSService.getTemplates(),
        SMSService.getCampaigns(),
        SMSService.getSMSAnalytics({
          from: startDate,
          to: endDate
        })
      ]);

      // Handle the response objects correctly
      setMessages(messagesResult.success && messagesResult.messages ? messagesResult.messages : []);
      setTemplates(templatesResult.success && templatesResult.templates ? templatesResult.templates : []);
      setCampaigns(campaignsResult.success && campaignsResult.campaigns ? campaignsResult.campaigns : []);
      setAnalytics(analyticsResult.success && analyticsResult.analytics ? analyticsResult.analytics : null);

      // Log any errors
      if (!messagesResult.success) {
        console.error('Failed to load messages:', messagesResult.error);
      }
      if (!templatesResult.success) {
        console.error('Failed to load templates:', templatesResult.error);
      }
      if (!campaignsResult.success) {
        console.error('Failed to load campaigns:', campaignsResult.error);
      }
      if (!analyticsResult.success) {
        console.error('Failed to load analytics:', analyticsResult.error);
      }
    } catch (error: any) {
      console.error('Error loading SMS data:', error);
      toast.error('Failed to load SMS data');
      // Set empty defaults on error
      setMessages([]);
      setTemplates([]);
      setCampaigns([]);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHighRiskData = async () => {
    try {
      // Get all patients and assess risk levels
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) {
        console.error('Failed to fetch patients');
        return;
      }

      let highRiskCount = 0;
      let alertsCount = 0;

      for (const patient of result.patients) {
        const riskAssessment = automatedMessagingService.assessPatientRisk(patient);
        if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
          highRiskCount++;
        }
      }

      // Count automated alerts from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysAlerts = messages.filter(msg => 
        msg.isAutomated && 
        msg.type === 'alert' && 
        new Date(msg.createdAt) >= today
      );

      setHighRiskPatients(highRiskCount);
      setAutomatedAlertsCount(todaysAlerts.length);
    } catch (error) {
      console.error('Error loading high-risk data:', error);
    }
  };

  const refreshData = async () => {
    await loadSMSData();
    await loadHighRiskData();
  };

  const handleConfigUpdate = (configured: boolean) => {
    setIsConfigured(configured);
    if (configured) {
      setShowConfig(false);
      toast.success('Twilio configured successfully! SMS features are now available.');
    }
  };

  const triggerHighRiskMonitoring = async () => {
    if (!isConfigured) {
      toast.error('Please configure Twilio first');
      return;
    }

    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) {
        toast.error('Failed to fetch patients');
        return;
      }

      let alertsSent = 0;

      for (const patient of result.patients) {
        // Simulate vitals check (in real app, this would come from monitoring devices)
        const mockVitals = {
          systolicBP: Math.random() > 0.8 ? 160 : 120, // 20% chance of high BP
          diastolicBP: Math.random() > 0.8 ? 100 : 80,
          heartRate: 70 + Math.random() * 30,
          bloodSugar: Math.random() > 0.9 ? 180 : 110 // 10% chance of high sugar
        };

        const riskAssessment = automatedMessagingService.assessPatientRisk(patient, mockVitals);
        
        if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
          await automatedMessagingService.sendHighRiskAlert(patient, riskAssessment);
          alertsSent++;
        }
      }

      toast.success(`Monitoring complete. ${alertsSent} high-risk alerts sent.`);
      await refreshData();
    } catch (error: any) {
      toast.error('Error during monitoring: ' + error.message);
    }
  };

  const sendBulkHealthTips = async () => {
    if (!isConfigured) {
      toast.error('Please configure Twilio first');
      return;
    }

    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) {
        toast.error('Failed to fetch patients');
        return;
      }

      const healthTips = [
        "Remember to take your prenatal vitamins daily for optimal baby development.",
        "Stay hydrated by drinking at least 8-10 glasses of water daily.",
        "Gentle exercise like walking helps maintain healthy circulation during pregnancy.",
        "Get adequate rest - aim for 7-9 hours of sleep each night.",
        "Don't skip your regular prenatal checkups. They're crucial for monitoring your health."
      ];

      let tipsSent = 0;
      for (const patient of result.patients) {
        if (patient.id) {
          const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
          await automatedMessagingService.sendHealthTip(patient.id, randomTip);
          tipsSent++;
        }
      }

      toast.success(`${tipsSent} health tips sent to patients.`);
      await refreshData();
    } catch (error: any) {
      toast.error('Error sending health tips: ' + error.message);
    }
  };

  if (showConfig) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowConfig(false)}
            className="mb-4"
          >
            ← Back to SMS Dashboard
          </Button>
        </div>
        <TwilioConfig onConfigUpdate={handleConfigUpdate} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Communication</h1>
          <p className="text-muted-foreground">
            Manage patient communication, automated alerts, and messaging campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isConfigured ? "default" : "destructive"} className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {isConfigured ? "Twilio Connected" : "Not Configured"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Configuration Alert */}
      {!isConfigured && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Twilio is not configured. Please set up your Twilio credentials to enable SMS functionality.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-amber-700 dark:text-amber-300"
              onClick={() => setShowConfig(true)}
            >
              Configure now →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats & Actions */}
      {isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Patients</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{highRiskPatients}</div>
              <p className="text-xs text-muted-foreground">Requiring monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts Today</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{automatedAlertsCount}</div>
              <p className="text-xs text-muted-foreground">Automated alerts sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{templates.length}</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automated Actions
            </CardTitle>
            <CardDescription>
              Quick actions for automated patient monitoring and communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={triggerHighRiskMonitoring} className="flex-1">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Monitor High-Risk Patients
              </Button>
              <Button variant="outline" onClick={sendBulkHealthTips} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Health Tips
              </Button>
              <Button variant="outline" onClick={refreshData} className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main SMS Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <SMSMessagesTab 
            messages={messages} 
            templates={templates}
            searchTerm=""
            onRefresh={refreshData}
            isConfigured={isConfigured}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <SMSTemplatesTab 
            templates={templates} 
            searchTerm=""
            onRefresh={refreshData}
            isConfigured={isConfigured}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <SMSCampaignsTab 
            campaigns={campaigns} 
            templates={templates}
            searchTerm=""
            onRefresh={refreshData}
            isConfigured={isConfigured}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {analytics ? (
            <SMSAnalyticsTab 
              analytics={analytics}
              messages={messages}
              templates={templates}
              campaigns={campaigns}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading analytics data...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMSPage; 