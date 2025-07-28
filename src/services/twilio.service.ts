import { Patient } from '@/types';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  messagingServiceSid: string;
  phoneNumber?: string;
}

interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

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

export interface LivePatientData {
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

class TwilioService {
  private config: TwilioConfig | null = null;
  private messageTemplates: MessageTemplate[] = [];
  private livePatients: Map<string, LivePatientData> = new Map();
  private isConfigured: boolean = false;

  constructor() {
    this.initializeConfig();
    this.initializeMessageTemplates();
  }

  private initializeConfig() {
    try {
      // Use environment variables for Twilio credentials
      const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

      if (!accountSid || !authToken || !messagingServiceSid) {
        console.warn('Twilio credentials not found. SMS functionality will be disabled.');
        this.isConfigured = false;
        return;
      }

      this.config = {
        accountSid,
        authToken,
        messagingServiceSid
      };

      this.isConfigured = true;
      console.log('Twilio configuration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio configuration:', error);
      this.isConfigured = false;
    }
  }

  private initializeMessageTemplates() {
    this.messageTemplates = [
      {
        id: 'elevated_care_alert',
        name: 'Elevated Care Alert',
        category: 'risk_alert',
        content: {
          english: '🏥 IyàCare Health Alert\n\nDear {{patientName}},\n\nOur monitoring system indicates you may need elevated care. Please visit your healthcare facility for a checkup as soon as possible.\n\nYour wellbeing is our priority.\n\nIyàCare Team',
          kiswahili: '🏥 Tahadhari ya Afya - IyàCare\n\nMpendwa {{patientName}},\n\nMfumo wetu wa ufuatiliaji unaonyesha unaweza kuhitaji huduma ya kiwango cha juu. Tafadhali tembelea kituo chako cha afya kwa uchunguzi haraka iwezekanavyo.\n\nUstawi wako ni kipaumbele chetu.\n\nTimu ya IyàCare',
          kinyarwanda: '🏥 Itangazo ry\'Ubuzima - IyàCare\n\nNyakwigendera {{patientName}},\n\nSisitemu yacu yo gukurikirana yerekana ko ushobora gukenera ubuvuzi bukabije. Nyamuneka sura mu kigo cy\'ubuzima kugira ngo usuzumwe vuba bishoboka.\n\nUbuzima bwawe ni intego yacu nyamukuru.\n\nIkipe ya IyàCare'
        },
        variables: ['patientName']
      },
      {
        id: 'prenatal_nutrition_tip',
        name: 'Prenatal Nutrition Tip',
        category: 'health_tip',
        content: {
          english: '🍎 Daily Health Tip - IyàCare\n\nHello {{patientName}},\n\nEat plenty of fruits and vegetables during pregnancy. They provide essential vitamins and minerals for you and your baby\'s healthy development.\n\nRecommended: 5 servings of fruits/vegetables daily.\n\nStay healthy!\nIyàCare Team',
          kiswahili: '🍎 Kidokezo cha Afya cha Kila Siku - IyàCare\n\nHabari {{patientName}},\n\nKula matunda na mboga nyingi wakati wa ujauzito. Vinatoa vitamini na madini muhimu kwako na maendeleo mazuri ya mtoto wako.\n\nInapendekezwa: Vipande 5 vya matunda/mboga kila siku.\n\nEndelea kuwa na afya njema!\nTimu ya IyàCare',
          kinyarwanda: '🍎 Inama y\'Ubuzima ya Buri Munsi - IyàCare\n\nMuraho {{patientName}},\n\nRya imbuto n\'imboga nyinshi mu gihe cy\'inda. Bitanga vitamini n\'ibikoresho by\'ingenzi kuri wewe n\'iterambere ryiza ry\'uruhinja rwawe.\n\nBisabwa: Ibice 5 by\'imbuto/imboga buri munsi.\n\nKomeza ubuzima bwiza!\nIkipe ya IyàCare'
        },
        variables: ['patientName']
      },
      {
        id: 'hydration_reminder',
        name: 'Hydration Reminder',
        category: 'health_tip',
        content: {
          english: '💧 Hydration Reminder - IyàCare\n\nHi {{patientName}},\n\nRemember to drink at least 8-10 glasses of water daily during pregnancy. Proper hydration helps prevent complications and supports your baby\'s growth.\n\nTip: Keep a water bottle nearby!\n\nIyàCare Team',
          kiswahili: '💧 Ukumbusho wa Kunywa Maji - IyàCare\n\nHabari {{patientName}},\n\nKumbuka kunywa angalau miwani 8-10 ya maji kila siku wakati wa ujauzito. Kunywa maji vya kutosha kunasaidia kuzuia matatizo na kuunga mkono ukuaji wa mtoto wako.\n\nKidokezo: Weka chupa ya maji karibu nawe!\n\nTimu ya IyàCare',
          kinyarwanda: '💧 Ibyibutsa byo Kunywa Amazi - IyàCare\n\nMuraho {{patientName}},\n\nWibuke kunywa byibuze ibirahuri 8-10 by\'amazi buri munsi mu gihe cy\'inda. Kunywa amazi ahagije bifasha gukumira ibibazo no gushyigikira ukura kw\'uruhinja rwawe.\n\nInyigisho: Bika icupa cy\'amazi hafi yawe!\n\nIkipe ya IyàCare'
        },
        variables: ['patientName']
      },
      {
        id: 'exercise_tip',
        name: 'Safe Exercise Tip',
        category: 'health_tip',
        content: {
          english: '🚶‍♀️ Exercise Tip - IyàCare\n\nHello {{patientName}},\n\nGentle exercise like walking for 20-30 minutes daily is great during pregnancy. It improves circulation, reduces stress, and prepares your body for delivery.\n\nAlways consult your healthcare provider first!\n\nIyàCare Team',
          kiswahili: '🚶‍♀️ Kidokezo cha Mazoezi - IyàCare\n\nHabari {{patientName}},\n\nMazoezi laini kama kutembea kwa dakika 20-30 kila siku ni mazuri wakati wa ujauzito. Yanaboresha mzunguko wa damu, kupunguza msongo, na kuandaa mwili wako kwa kujifungua.\n\nDaima ongea na mtoa huduma za afya kwanza!\n\nTimu ya IyàCare',
          kinyarwanda: '🚶‍♀️ Inama z\'Imyitozo - IyàCare\n\nMuraho {{patientName}},\n\nImyitozo yoroshye nko kugenda iminota 20-30 buri munsi ni myiza mu gihe cy\'inda. Bitera imbere amaraso, bigabanya guhangayika, kandi bitegura umubiri wawe wo kubyara.\n\nBanza ubanze uganire n\'uwagutanga ubuvuzi!\n\nIkipe ya IyàCare'
        },
        variables: ['patientName']
      },
      {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        category: 'appointment',
        content: {
          english: '📅 Appointment Reminder - IyàCare\n\nDear {{patientName}},\n\nYou have an upcoming appointment on {{appointmentDate}} at {{clinicName}}.\n\nPlease bring:\n• Your IyàCare card\n• Previous test results\n• List of current medications\n\nIyàCare Team',
          kiswahili: '📅 Ukumbusho wa Miadi - IyàCare\n\nMpendwa {{patientName}},\n\nUna miadi inayokuja tarehe {{appointmentDate}} katika {{clinicName}}.\n\nTafadhali leta:\n• Kadi yako ya IyàCare\n• Matokeo ya vipimo vya awali\n• Orodha ya dawa za sasa\n\nTimu ya IyàCare',
          kinyarwanda: '📅 Ibyibutsa by\'Ubusabane - IyàCare\n\nNyakwigendera {{patientName}},\n\nUfite ubusabane buzaza ku wa {{appointmentDate}} muri {{clinicName}}.\n\nNyamuneka uzane:\n• Ikarita yawe ya IyàCare\n• Ibisubizo by\'ibizamini byashize\n• Urutonde rw\'imiti ukoresha\n\nIkipe ya IyàCare'
        },
        variables: ['patientName', 'appointmentDate', 'clinicName']
      },
      {
        id: 'medication_reminder',
        name: 'Medication Reminder',
        category: 'medication',
        content: {
          english: '💊 Medication Reminder - IyàCare\n\nHi {{patientName}},\n\nTime for your medication:\n{{medicationName}} - {{dosage}}\n\nTake as prescribed by your healthcare provider.\n\nFor questions, contact your clinic.\n\nIyàCare Team',
          kiswahili: '💊 Ukumbusho wa Dawa - IyàCare\n\nHabari {{patientName}},\n\nWakati wa dawa yako:\n{{medicationName}} - {{dosage}}\n\nTumia kama ilivyoandikwa na mtoa huduma za afya.\n\nKwa maswali, wasiliana na kliniki yako.\n\nTimu ya IyàCare',
          kinyarwanda: '💊 Ibyibutsa by\'Imiti - IyàCare\n\nMuraho {{patientName}},\n\nIgihe cy\'imiti yawe:\n{{medicationName}} - {{dosage}}\n\nYifashe nk\'uko byanditswe n\'uwagutanga ubuvuzi.\n\nKu bibazo, vugana n\'ivuriro ryawe.\n\nIkipe ya IyàCare'
        },
        variables: ['patientName', 'medicationName', 'dosage']
      }
    ];
  }

  // Getter methods
  getIsConfigured(): boolean {
    return this.isConfigured;
  }

  getConfig(): TwilioConfig | null {
    return this.config;
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.getIsConfigured()) {
      return {
        success: false,
        error: 'Twilio service not configured. Please check your credentials.'
      };
    }

    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(message.to.replace(/\s+/g, ''))) {
        return {
          success: false,
          error: 'Invalid phone number format. Please use international format (+250xxxxxxxxx)'
        };
      }

      // Use API route to send SMS
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          message: message.body,
          messagingServiceSid: this.config?.messagingServiceSid
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to send SMS'
        };
      }

      return {
        success: true,
        messageId: result.messageId,
        status: result.status
      };
    } catch (error: any) {
      console.error('SMS API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    if (!this.isConfigured) {
      return messages.map(() => ({
        success: false,
        error: 'Twilio service not configured'
      }));
    }

    const results: SMSResponse[] = [];
    const batchSize = 5; // Process in batches to avoid rate limits

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => this.sendSMS(message));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              success: false,
              error: result.reason?.message || 'Failed to send SMS'
            });
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < messages.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        // If batch fails, add error for each message in batch
        batch.forEach(() => {
          results.push({
            success: false,
            error: error.message || 'Batch processing failed'
          });
        });
      }
    }

    return results;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<{ isValid: boolean; formattedNumber?: string; error?: string }> {
    // Basic client-side validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
    
    if (isValid) {
      return {
        isValid: true,
        formattedNumber: phoneNumber
      };
    } else {
      return {
        isValid: false,
        error: 'Invalid phone number format. Please use international format (+250xxxxxxxxx)'
      };
    }
  }

  // High-risk patient alert messages
  getHighRiskAlertMessage(patientName: string, riskFactors: string[]): string {
    return `🚨 URGENT ALERT - IyàCare\n\nDear ${patientName},\n\nOur AI system has identified you as HIGH RISK based on:\n${riskFactors.map(factor => `• ${factor}`).join('\n')}\n\nPlease contact your healthcare provider immediately or visit the nearest clinic.\n\nEmergency: Call your assigned midwife\n\nIyàCare Team`;
  }

  // Appointment reminder messages
  getAppointmentReminderMessage(patientName: string, appointmentDate: string, clinicName: string): string {
    return `📅 Appointment Reminder - IyàCare\n\nHello ${patientName},\n\nReminder: You have an appointment on ${appointmentDate} at ${clinicName}.\n\nPlease bring:\n• Your IyàCare card\n• Previous test results\n• Any medications\n\nTo reschedule, contact your clinic.\n\nIyàCare Team`;
  }

  // Medication reminder messages
  getMedicationReminderMessage(patientName: string, medicationName: string, dosage: string): string {
    return `💊 Medication Reminder - IyàCare\n\nHello ${patientName},\n\nTime for your medication:\n${medicationName} - ${dosage}\n\nTake as prescribed by your healthcare provider.\n\nFor questions, contact your clinic.\n\nIyàCare Team`;
  }

  // Health tip messages
  getHealthTipMessage(patientName: string, tip: string): string {
    return `💡 Health Tip - IyàCare\n\nHello ${patientName},\n\n${tip}\n\nStay healthy and take care!\n\nFor more tips, visit your IyàCare dashboard.\n\nIyàCare Team`;
  }

  // Emergency alert for healthcare providers
  getProviderEmergencyAlert(patientName: string, riskLevel: string, vitals: string): string {
    return `🚨 EMERGENCY ALERT - IyàCare\n\nPatient: ${patientName}\nRisk Level: ${riskLevel}\n\nCurrent Vitals:\n${vitals}\n\nImmediate attention required.\n\nLogin to IyàCare dashboard for full details.\n\nIyàCare System`;
  }

  // Live Patient Monitoring Methods
  addLivePatient(patientData: LivePatientData): void {
    this.livePatients.set(patientData.id, patientData);
  }

  updateLivePatient(patientId: string, updates: Partial<LivePatientData>): void {
    const patient = this.livePatients.get(patientId);
    if (patient) {
      this.livePatients.set(patientId, { ...patient, ...updates, lastUpdate: new Date() });
    }
  }

  getLivePatients(): LivePatientData[] {
    return Array.from(this.livePatients.values());
  }

  getHighRiskPatients(): LivePatientData[] {
    return this.getLivePatients().filter(patient => patient.riskLevel === 'high');
  }

  removeLivePatient(patientId: string): void {
    this.livePatients.delete(patientId);
  }

  // Message Template Methods
  getMessageTemplates(category?: MessageTemplate['category']): MessageTemplate[] {
    if (category) {
      return this.messageTemplates.filter(template => template.category === category);
    }
    return this.messageTemplates;
  }

  getTemplate(templateId: string): MessageTemplate | undefined {
    return this.messageTemplates.find(template => template.id === templateId);
  }

  processTemplate(templateId: string, language: 'english' | 'kiswahili' | 'kinyarwanda', variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    let content = template.content[language];
    
    // Replace variables in the template
    if (template.variables) {
      template.variables.forEach(variable => {
        const value = variables[variable] || `{{${variable}}}`;
        const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
        content = content.replace(regex, value);
      });
    }

    return content;
  }

  // Enhanced messaging methods
  async sendElevatedCareAlert(patientId: string, language: 'english' | 'kiswahili' | 'kinyarwanda' = 'english'): Promise<SMSResponse> {
    const patient = this.livePatients.get(patientId);
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found in live monitoring'
      };
    }

    const message = this.processTemplate('elevated_care_alert', language, {
      patientName: patient.name
    });

    return this.sendSMS({
      to: patient.phone,
      body: message
    });
  }

  async sendHealthTip(patientId: string, templateId: string, language: 'english' | 'kiswahili' | 'kinyarwanda' = 'english'): Promise<SMSResponse> {
    const patient = this.livePatients.get(patientId);
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found in live monitoring'
      };
    }

    const message = this.processTemplate(templateId, language, {
      patientName: patient.name
    });

    return this.sendSMS({
      to: patient.phone,
      body: message
    });
  }

  async sendCustomMessage(patientId: string, message: string): Promise<SMSResponse> {
    const patient = this.livePatients.get(patientId);
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found in live monitoring'
      };
    }

    return this.sendSMS({
      to: patient.phone,
      body: message
    });
  }

  // Bulk messaging for health tips
  async sendBulkHealthTips(templateId: string, language: 'english' | 'kiswahili' | 'kinyarwanda' = 'english'): Promise<SMSResponse[]> {
    const patients = this.getLivePatients();
    const messages: SMSMessage[] = patients.map(patient => {
      const message = this.processTemplate(templateId, language, {
        patientName: patient.name
      });
      
      return {
        to: patient.phone,
        body: message
      };
    });

    return this.sendBulkSMS(messages);
  }

  async initialize(config: TwilioConfig): Promise<{ success: boolean; error?: string }> {
    try {
      this.config = config;
      this.isConfigured = true;
      
      // Test the connection by sending a test API request
      const testResponse = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '+250791848842', // Send test to patient number
          message: 'Test message from IyàCare - Configuration successful!'
        })
      });
      
      if (testResponse.ok) {
        console.log('Twilio service initialized and verified successfully');
        return { success: true };
      } else {
        const error = await testResponse.json();
        return { success: false, error: error.error || 'Failed to verify Twilio configuration' };
      }
    } catch (error: any) {
      console.error('Failed to initialize Twilio service:', error);
      this.isConfigured = false;
      this.config = null;
      return { success: false, error: error.message || 'Failed to initialize Twilio' };
    }
  }
}

export const twilioService = new TwilioService();
export default TwilioService; 