'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Heart, 
  Calendar, 
  Pill, 
  Globe, 
  Eye,
  Send,
  Users
} from 'lucide-react';
import { twilioService } from '@/services/twilio.service';
import { toast } from 'sonner';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'risk_alert' | 'health_tip' | 'appointment' | 'medication';
  content: {
    english: string;
    kiswahili: string;
    kinyarwanda: string;
  };
  variables?: string[];
}

const MessageTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'kiswahili' | 'kinyarwanda'>('english');
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load templates from Twilio service
    const loadedTemplates = twilioService.getMessageTemplates();
    setTemplates(loadedTemplates);
    
    // Set default preview variables
    setPreviewVariables({
      patientName: 'Amina Hassan',
      appointmentDate: '2024-01-15',
      clinicName: 'IyàCare Health Center',
      medicationName: 'Prenatal Vitamins',
      dosage: '1 tablet daily'
    });
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'risk_alert': return <Heart className="h-4 w-4" />;
      case 'health_tip': return <MessageSquare className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'risk_alert': return 'destructive';
      case 'health_tip': return 'secondary';
      case 'appointment': return 'default';
      case 'medication': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'risk_alert': return 'Risk Alert';
      case 'health_tip': return 'Health Tip';
      case 'appointment': return 'Appointment';
      case 'medication': return 'Medication';
      default: return category;
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

  const processTemplatePreview = (template: MessageTemplate, language: string) => {
    let content = template.content[language as keyof typeof template.content];
    
    if (template.variables) {
      template.variables.forEach(variable => {
        const value = previewVariables[variable] || `{{${variable}}}`;
        const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
        content = content.replace(regex, value);
      });
    }
    
    return content;
  };

  const handleSendBulkHealthTip = async (templateId: string) => {
    setIsLoading(true);
    try {
      const results = await twilioService.sendBulkHealthTips(templateId, selectedLanguage);
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        toast.success(`Health tip sent to all ${totalCount} monitored patients in ${selectedLanguage}`);
      } else {
        toast.warning(`Health tip sent to ${successCount}/${totalCount} patients. Some messages failed.`);
      }
    } catch (error) {
      toast.error('Error sending bulk health tips');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Message Templates</h2>
        <p className="text-muted-foreground">
          Multilingual message templates for patient communication
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Risk Alerts</p>
                <p className="text-2xl font-bold">{filterTemplatesByCategory('risk_alert').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Health Tips</p>
                <p className="text-2xl font-bold">{filterTemplatesByCategory('health_tip').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Appointments</p>
                <p className="text-2xl font-bold">{filterTemplatesByCategory('appointment').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pill className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Medications</p>
                <p className="text-2xl font-bold">{filterTemplatesByCategory('medication').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Category */}
      <Tabs defaultValue="risk_alert" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk_alert" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Risk Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="health_tip" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Health Tips</span>
          </TabsTrigger>
          <TabsTrigger value="appointment" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="medication" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span>Medications</span>
          </TabsTrigger>
        </TabsList>

        {(['risk_alert', 'health_tip', 'appointment', 'medication'] as const).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filterTemplatesByCategory(category).map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <span>{template.name}</span>
                      </CardTitle>
                      <Badge variant={getCategoryColor(template.category)}>
                        {getCategoryName(template.category)}
                      </Badge>
                    </div>
                    {template.variables && (
                      <CardDescription>
                        Variables: {template.variables.join(', ')}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Language Preview */}
                    <div className="space-y-3">
                      {(['english', 'kiswahili', 'kinyarwanda'] as const).map((lang) => (
                        <div key={lang} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {getLanguageFlag(lang)} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {processTemplatePreview(template, lang)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {/* Preview Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Template
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>
                              Preview template in all supported languages
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="english" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
                              <TabsTrigger value="kiswahili">🇰🇪 Kiswahili</TabsTrigger>
                              <TabsTrigger value="kinyarwanda">🇷🇼 Kinyarwanda</TabsTrigger>
                            </TabsList>
                            
                            {(['english', 'kiswahili', 'kinyarwanda'] as const).map((lang) => (
                              <TabsContent key={lang} value={lang}>
                                <Card>
                                  <CardContent className="p-4">
                                    <ScrollArea className="h-40">
                                      <p className="whitespace-pre-wrap">
                                        {processTemplatePreview(template, lang)}
                                      </p>
                                    </ScrollArea>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </DialogContent>
                      </Dialog>

                      {/* Bulk Send for Health Tips */}
                      {template.category === 'health_tip' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="w-full">
                              <Users className="h-4 w-4 mr-2" />
                              Send to All Patients
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Health Tip to All Monitored Patients</DialogTitle>
                              <DialogDescription>
                                This will send "{template.name}" to all patients currently being monitored live.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Language Selection */}
                              <div>
                                <label className="text-sm font-medium">Select Language</label>
                                <Tabs value={selectedLanguage} onValueChange={(value: any) => setSelectedLanguage(value)}>
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
                                    <TabsTrigger value="kiswahili">🇰🇪 Kiswahili</TabsTrigger>
                                    <TabsTrigger value="kinyarwanda">🇷🇼 Kinyarwanda</TabsTrigger>
                                  </TabsList>
                                </Tabs>
                              </div>

                              {/* Preview */}
                              <div>
                                <label className="text-sm font-medium">Message Preview</label>
                                <Card>
                                  <CardContent className="p-3">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {processTemplatePreview(template, selectedLanguage)}
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Send Button */}
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSendBulkHealthTip(template.id)}
                                  disabled={isLoading}
                                  className="flex-1"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  {isLoading ? 'Sending...' : 'Send to All Patients'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MessageTemplatesManager;
