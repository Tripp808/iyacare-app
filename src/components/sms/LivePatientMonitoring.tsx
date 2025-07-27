'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Phone, 
  Send, 
  AlertTriangle, 
  Clock, 
  User,
  MessageSquare,
  Lightbulb,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { twilioService } from '@/services/twilio.service';
import { RealtimeIoTService, IoTReading, AIPrediction } from '@/services/realtime-iot.service';
import { getPatients, Patient } from '@/lib/firebase/patients';
import { toast } from 'sonner';

interface LivePatientData {
  id: string;
  name: string;
  phone: string;
  riskLevel: 'low' | 'medium' | 'high';
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation?: number;
  };
  lastUpdate: Date;
  isConnected: boolean;
  connectionStatus?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: 'risk_alert' | 'health_tip' | 'appointment' | 'medication';
}

const LivePatientMonitoring: React.FC = () => {
  const [livePatients, setLivePatients] = useState<LivePatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<LivePatientData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'kiswahili' | 'kinyarwanda'>('english');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  // IoT-specific state
  const [realtimePatient, setRealtimePatient] = useState<Patient | null>(null);
  const [realtimeReading, setRealtimeReading] = useState<IoTReading | null>(null);
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load the real IoT patient from the database
  useEffect(() => {
    loadRealtimePatient();
  }, []);

  // Subscribe to real-time IoT data
  useEffect(() => {
    let readingsUnsubscribe: (() => void) | null = null;
    let statusUnsubscribe: (() => void) | null = null;

    if (realtimePatient) {
      // Subscribe to real-time readings
      readingsUnsubscribe = RealtimeIoTService.subscribeToIoTReadings(async (reading) => {
        if (reading) {
          setRealtimeReading(reading);
          setIsConnected(true);
          
          // Get AI prediction for the reading
          try {
            const prediction = await RealtimeIoTService.getAIPrediction(reading, realtimePatient?.pregnancyWeek || 28);
            setAiPrediction(prediction);
            
            // Convert IoT reading to LivePatientData format
            const tempCelsius = (reading.BodyTemperature - 32) * 5/9;
            let riskLevel: 'low' | 'medium' | 'high' = 'low';
            
            // Map AI risk levels to our format
            switch (prediction.risk_level) {
              case 'high risk':
                riskLevel = 'high';
                break;
              case 'mid risk':
                riskLevel = 'medium';
                break;
              default:
                riskLevel = 'low';
            }
            
            const patientData: LivePatientData = {
              id: realtimePatient.id || 'realtime-patient-1',
              name: `${realtimePatient.firstName} ${realtimePatient.lastName}`,
              phone: '+250791848842', // SMS phone number
              riskLevel,
              vitals: {
                heartRate: reading.HeartRate,
                bloodPressure: `${Math.round(reading.SystolicBP)}/${Math.round(reading.DiastolicBP)}`,
                temperature: parseFloat(tempCelsius.toFixed(1)),
                oxygenSaturation: reading.OxygenSaturation || 98
              },
              lastUpdate: new Date()
            };
            
            setLivePatients([patientData]);
            
            // Add to Twilio service for SMS functionality
            twilioService.addLivePatient(patientData);
            
          } catch (error) {
            console.warn('AI service unavailable, using fallback assessment:', error);
            // Use fallback assessment
            const fallback = RealtimeIoTService.getFallbackRiskAssessment(reading);
            setAiPrediction(fallback);
          }
        } else {
          setIsConnected(false);
          // Update patient as disconnected
          if (realtimePatient) {
            const disconnectedPatient: LivePatientData = {
              id: realtimePatient.id,
              name: `${realtimePatient.firstName} ${realtimePatient.lastName}`,
              phone: '+250791848842',
              riskLevel: 'low',
              vitals: {
                heartRate: 0,
                bloodPressure: '--/--',
                temperature: 0
              },
              lastUpdate: new Date(),
              isConnected: false,
              connectionStatus: 'Disconnected'
            };
            setLivePatients([disconnectedPatient]);
          }
        }
      });

      // Subscribe to connection status
      statusUnsubscribe = RealtimeIoTService.subscribeToConnectionStatus((status) => {
        setConnectionStatus(status);
        setIsConnected(status === "ESP32 Connected");
      });
    }

    return () => {
      if (readingsUnsubscribe) readingsUnsubscribe();
      if (statusUnsubscribe) statusUnsubscribe();
      RealtimeIoTService.cleanup();
    };
  }, [realtimePatient, connectionStatus]);

  const loadRealtimePatient = async () => {
    try {
      const result = await getPatients();
      
      if (result.success && result.patients) {
        // Find the real-time patient (Immaculée Munezero)
        const rtPatient = result.patients.find((p: any) => p.isRealtimePatient === true);
        if (rtPatient) {
          setRealtimePatient(rtPatient);
          toast.success(`Connected to IoT patient: ${rtPatient.firstName} ${rtPatient.lastName}`);
        } else {
          toast.error('No real-time patient found. Please ensure Immaculée Munezero is added.');
        }
      }
    } catch (error) {
      console.error('Error loading real-time patient:', error);
      toast.error('Failed to load real-time patient');
    }
  };

  const getRiskBadgeColor = (riskLevel: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'english': return '🇬🇧';
      case 'kiswahili': return '🇰🇪';
      case 'kinyarwanda': return '🇷🇼';
      default: return '🌐';
    }
  };

  const handleSendElevatedCareAlert = async (patient: LivePatientData) => {
    setIsLoading(true);
    try {
      const result = await twilioService.sendElevatedCareAlert(patient.id, selectedLanguage);
      
      if (result.success) {
        toast.success(`Elevated care alert sent to ${patient.name} in ${selectedLanguage}`);
      } else {
        toast.error(`Failed to send alert: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error sending elevated care alert');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendHealthTip = async () => {
    if (!selectedPatient || !selectedTemplate) {
      toast.error('Please select a patient and template');
      return;
    }

    setIsLoading(true);
    try {
      const result = await twilioService.sendHealthTip(selectedPatient.id, selectedTemplate, selectedLanguage);
      
      if (result.success) {
        toast.success(`Health tip sent to ${selectedPatient.name} in ${selectedLanguage}`);
        setShowTemplateDialog(false);
        setSelectedTemplate('');
      } else {
        toast.error(`Failed to send health tip: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error sending health tip');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!selectedPatient || !customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure patient is in Twilio service
      twilioService.addLivePatient(selectedPatient);
      
      const result = await twilioService.sendCustomMessage(selectedPatient.id, customMessage);
      
      if (result.success) {
        toast.success(`Custom message sent to ${selectedPatient.name}`);
        setShowCustomDialog(false);
        setCustomMessage('');
      } else {
        toast.error(`Failed to send message: ${result.error}`);
        console.error('Custom message send failed:', result.error);
      }
    } catch (error) {
      toast.error('Error sending custom message');
      console.error('Custom message send error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const messageTemplates = {
    elevatedCare: {
      id: 'elevated_care_alert',
      name: 'Elevated Care Alert',
      category: 'risk_alert',
      description: 'Send when patient shows concerning vital signs'
    },
    healthTips: [
      { id: 'prenatal_nutrition_tip', name: 'Prenatal Nutrition Tip', category: 'health_tip' },
      { id: 'hydration_reminder', name: 'Hydration Reminder', category: 'health_tip' },
      { id: 'exercise_tip', name: 'Safe Exercise Tip', category: 'health_tip' }
    ]
  };

  const handleSendTemplate = async (templateId: string) => {
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure patient is in Twilio service
      twilioService.addLivePatient(selectedPatient);
      
      let result;
      if (templateId === 'elevated_care_alert') {
        result = await twilioService.sendElevatedCareAlert(selectedPatient.id, selectedLanguage);
      } else {
        result = await twilioService.sendHealthTip(selectedPatient.id, templateId, selectedLanguage);
      }
      
      if (result.success) {
        const templateName = templateId === 'elevated_care_alert' 
          ? 'Elevated Care Alert' 
          : messageTemplates.healthTips.find(t => t.id === templateId)?.name || 'Template';
        toast.success(`${templateName} sent to ${selectedPatient.name}`);
        // Close the dialog after successful send
        setShowCustomDialog(false);
        setShowTemplateDialog(false);
      } else {
        toast.error(`Failed to send template: ${result.error}`);
        console.error('Template send failed:', result.error);
      }
    } catch (error) {
      toast.error('Error sending template message');
      console.error('Template send error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live IoT Patient Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor {realtimePatient ? `${realtimePatient.firstName} ${realtimePatient.lastName}` : 'the patient'} connected to IoT device and send SMS alerts to +250791848842
          </p>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <Select value={selectedLanguage} onValueChange={(value: any) => setSelectedLanguage(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">🇬🇧 English</SelectItem>
              <SelectItem value="kiswahili">🇰🇪 Kiswahili</SelectItem>
              <SelectItem value="kinyarwanda">🇷🇼 Kinyarwanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">IoT Connected</p>
                <p className="text-2xl font-bold">{livePatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">High Risk</p>
                <p className="text-2xl font-bold">{livePatients.filter(p => p.riskLevel === 'high').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Medium Risk</p>
                <p className="text-2xl font-bold">{livePatients.filter(p => p.riskLevel === 'medium').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Low Risk</p>
                <p className="text-2xl font-bold">{livePatients.filter(p => p.riskLevel === 'low').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {livePatients.map((patient) => (
          <Card key={patient.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{patient.name}</CardTitle>
                <Badge variant={getRiskBadgeColor(patient.riskLevel)}>
                  {patient.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>{patient.phone}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 mb-3">
                {patient.isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">IoT Device Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">IoT Device Disconnected</span>
                  </>
                )}
              </div>
              
              {/* Vitals */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{patient.isConnected ? `${Math.round(patient.vitals.heartRate)} BPM` : '--'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span>{patient.vitals.bloodPressure}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span>{patient.isConnected ? `${patient.vitals.temperature.toFixed(1)}°C` : '--'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span>{patient.vitals.oxygenSaturation ? `${Math.round(patient.vitals.oxygenSaturation)}% SpO2` : 'N/A'}</span>
                </div>
              </div>

              {/* Last Update */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {patient.isConnected 
                    ? `Live data - Updated ${Math.round((Date.now() - patient.lastUpdate.getTime()) / 1000)} sec ago`
                    : `Last seen ${Math.round((Date.now() - patient.lastUpdate.getTime()) / 1000 / 60)} min ago`
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                {/* Elevated Care Alert - Only show for high risk patients and when connected */}
                {patient.riskLevel === 'high' && patient.isConnected && (
                  <Button
                    onClick={() => handleSendElevatedCareAlert(patient)}
                    disabled={isLoading}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Elevated Care Alert {getLanguageFlag(selectedLanguage)}
                  </Button>
                )}

                {/* Health Tips */}
                <Dialog open={showTemplateDialog && selectedPatient?.id === patient.id} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedPatient(patient)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Send Health Tip {getLanguageFlag(selectedLanguage)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Health Tip to {patient.name}</DialogTitle>
                      <DialogDescription>
                        Choose a health tip template to send in {selectedLanguage}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template">Health Tip Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a health tip template" />
                          </SelectTrigger>
                          <SelectContent>
                            {messageTemplates.healthTips.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSendTemplate(selectedTemplate)}
                          disabled={isLoading || !selectedTemplate}
                          className="flex-1"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? 'Sending...' : 'Send Health Tip'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowTemplateDialog(false);
                            setSelectedTemplate('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Custom Message */}
                <Dialog open={showCustomDialog && selectedPatient?.id === patient.id} onOpenChange={setShowCustomDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedPatient(patient)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Custom Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Custom Message to {patient.name}</DialogTitle>
                      <DialogDescription>
                        Write a custom message to send via SMS
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Quick Template Options */}
                      <div>
                        <Label>Quick Templates</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {/* Elevated Care Alert */}
                          <Button
                            onClick={() => handleSendTemplate(messageTemplates.elevatedCare.id)}
                            disabled={isLoading}
                            variant="destructive"
                            size="sm"
                            className="justify-start"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {messageTemplates.elevatedCare.name} {getLanguageFlag(selectedLanguage)}
                          </Button>
                          
                          {/* Health Tips */}
                          {messageTemplates.healthTips.map((tip) => (
                            <Button
                              key={tip.id}
                              onClick={() => handleSendTemplate(tip.id)}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className="justify-start"
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              {tip.name} {getLanguageFlag(selectedLanguage)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or write custom message</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Custom Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Enter your custom message..."
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {customMessage.length}/160 characters
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSendCustomMessage}
                          disabled={isLoading || !customMessage.trim()}
                          className="flex-1"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? 'Sending...' : 'Send Message'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCustomDialog(false);
                            setCustomMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Patients Message */}
      {livePatients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No IoT Patient Connected</h3>
            <p className="text-muted-foreground">
              The patient will appear here when connected to the IoT monitoring device.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Information Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>IoT Patient Monitoring:</strong> This system monitors {realtimePatient ? `${realtimePatient.firstName} ${realtimePatient.lastName}` : 'the patient'} connected to ESP32 IoT devices. 
          All SMS messages will be sent to +250791848842. High-risk alerts use "elevated care needed" terminology 
          for ethical communication. Messages are available in English, Kiswahili, and Kinyarwanda.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LivePatientMonitoring;
