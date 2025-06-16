import twilio from 'twilio';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
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

class TwilioService {
  private client: twilio.Twilio | null = null;
  private config: TwilioConfig | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !phoneNumber) {
        console.warn('Twilio credentials not found. SMS functionality will be disabled.');
        return;
      }

      this.config = {
        accountSid,
        authToken,
        phoneNumber
      };

      this.client = twilio(accountSid, authToken);
      console.log('Twilio client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.client || !this.config) {
      return {
        success: false,
        error: 'Twilio client not initialized. Please check your credentials.'
      };
    }

    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(message.to.replace(/\s+/g, ''))) {
        return {
          success: false,
          error: 'Invalid phone number format. Please use international format (+234xxxxxxxxx)'
        };
      }

      const response = await this.client.messages.create({
        body: message.body,
        from: message.from || this.config.phoneNumber,
        to: message.to
      });

      return {
        success: true,
        messageId: response.sid,
        status: response.status
      };
    } catch (error: any) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    if (!this.client || !this.config) {
      return messages.map(() => ({
        success: false,
        error: 'Twilio client not initialized'
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
    if (!this.client) {
      return {
        isValid: false,
        error: 'Twilio client not initialized'
      };
    }

    try {
      const lookup = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return {
        isValid: true,
        formattedNumber: lookup.phoneNumber
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Invalid phone number'
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

  isConfigured(): boolean {
    return !!(this.client && this.config);
  }

  getConfig(): TwilioConfig | null {
    return this.config;
  }

  async initialize(config: TwilioConfig): Promise<{ success: boolean; error?: string }> {
    try {
      this.config = config;
      this.client = twilio(config.accountSid, config.authToken);
      
      // Test the connection
      const testResult = await this.client.api.account.fetch();
      if (testResult.sid === config.accountSid) {
        console.log('Twilio client initialized and verified successfully');
        return { success: true };
      } else {
        return { success: false, error: 'Failed to verify Twilio credentials' };
      }
    } catch (error: any) {
      console.error('Failed to initialize Twilio client:', error);
      this.client = null;
      this.config = null;
      return { success: false, error: error.message || 'Failed to initialize Twilio' };
    }
  }
}

export const twilioService = new TwilioService();
export default TwilioService; 