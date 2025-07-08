import { twilioService } from './twilio.service';
import { PatientService } from './patient.service';
import { SMSService } from './sms.service';
import { Patient } from '@/types';

interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  score: number;
  recommendations: string[];
}

interface AutomatedMessage {
  patientId: string;
  messageType: 'high_risk_alert' | 'critical_alert' | 'appointment_reminder' | 'medication_reminder' | 'health_tip';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor?: Date;
}

class AutomatedMessagingService {
  private static instance: AutomatedMessagingService;
  private alertThresholds = {
    bloodPressure: { systolic: 140, diastolic: 90 },
    heartRate: { min: 60, max: 100 },
    bloodSugar: { min: 70, max: 140 },
    temperature: { min: 36.1, max: 37.2 }
  };

  constructor() {
    if (AutomatedMessagingService.instance) {
      return AutomatedMessagingService.instance;
    }
    AutomatedMessagingService.instance = this;
  }

  static getInstance(): AutomatedMessagingService {
    if (!AutomatedMessagingService.instance) {
      AutomatedMessagingService.instance = new AutomatedMessagingService();
    }
    return AutomatedMessagingService.instance;
  }

  // Assess patient risk based on vitals and medical history
  assessPatientRisk(patient: Patient, vitals?: any): RiskAssessment {
    let score = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Calculate age from dateOfBirth if available
    let age = 0;
    if (patient.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Age risk factor
    if (age > 35) {
      score += 2;
      riskFactors.push('Advanced maternal age (>35 years)');
      recommendations.push('Regular monitoring recommended');
    }

    if (age < 18 && age > 0) {
      score += 3;
      riskFactors.push('Young maternal age (<18 years)');
      recommendations.push('Enhanced nutritional support needed');
    }

    // Medical history risk factors
    if (patient.medicalHistory?.conditions?.includes('hypertension')) {
      score += 3;
      riskFactors.push('History of hypertension');
      recommendations.push('Blood pressure monitoring required');
    }

    if (patient.medicalHistory?.conditions?.includes('diabetes')) {
      score += 3;
      riskFactors.push('History of diabetes');
      recommendations.push('Blood glucose monitoring required');
    }

    if (patient.medicalHistory?.conditions?.includes('previous_complications')) {
      score += 4;
      riskFactors.push('Previous pregnancy complications');
      recommendations.push('Specialist consultation recommended');
    }

    // Vital signs assessment
    if (vitals) {
      if (vitals.systolicBP > this.alertThresholds.bloodPressure.systolic) {
        score += 4;
        riskFactors.push(`High blood pressure (${vitals.systolicBP}/${vitals.diastolicBP})`);
        recommendations.push('Immediate medical attention required');
      }

      if (vitals.heartRate > this.alertThresholds.heartRate.max || vitals.heartRate < this.alertThresholds.heartRate.min) {
        score += 2;
        riskFactors.push(`Abnormal heart rate (${vitals.heartRate} bpm)`);
        recommendations.push('Cardiac monitoring recommended');
      }

      if (vitals.bloodSugar > this.alertThresholds.bloodSugar.max) {
        score += 3;
        riskFactors.push(`High blood sugar (${vitals.bloodSugar} mg/dL)`);
        recommendations.push('Diabetic management required');
      }
    }

    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel'];
    if (score >= 8) {
      riskLevel = 'critical';
    } else if (score >= 5) {
      riskLevel = 'high';
    } else if (score >= 3) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      riskLevel,
      riskFactors,
      score,
      recommendations
    };
  }

  // Send automated alert for high-risk patients
  async sendHighRiskAlert(patient: Patient, riskAssessment: RiskAssessment): Promise<{ success: boolean; error?: string }> {
    try {
      if (!patient.phone) {
        return { success: false, error: 'Patient phone number not available' };
      }

      // Create personalized alert message
      const alertMessage = twilioService.getHighRiskAlertMessage(
        patient.name,
        riskAssessment.riskFactors
      );

      // Send SMS via Twilio
      const smsResult = await twilioService.sendSMS({
        to: patient.phone,
        body: alertMessage
      });

      if (!smsResult.success) {
        return { success: false, error: smsResult.error };
      }

      // Log message in SMS system
      await SMSService.sendMessage({
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        phoneNumber: patient.phone,
        message: alertMessage,
        content: alertMessage,
        type: 'alert',
        status: 'sent',
        priority: riskAssessment.riskLevel === 'critical' ? 'critical' : 'high',
        isAutomated: true,
        sentBy: 'system',
        language: 'en',
        metadata: {
          source: 'automated_risk_alert',
          riskLevel: riskAssessment.riskLevel,
          riskScore: riskAssessment.score,
          messageId: smsResult.messageId
        }
      });

      // Send alert to healthcare providers
      await this.notifyHealthcareProviders(patient, riskAssessment);

      return { success: true };
    } catch (error: any) {
      console.error('Error sending high-risk alert:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify healthcare providers about high-risk patients
  private async notifyHealthcareProviders(patient: Patient, riskAssessment: RiskAssessment): Promise<void> {
    try {
      // Get assigned healthcare providers
      const providers = await this.getAssignedProviders(patient.id);
      
      const vitalsString = riskAssessment.riskFactors.join('\n');
      
      for (const provider of providers) {
        if (provider.phone) {
          const providerAlert = twilioService.getProviderEmergencyAlert(
            patient.name,
            riskAssessment.riskLevel.toUpperCase(),
            vitalsString
          );

          await twilioService.sendSMS({
            to: provider.phone,
            body: providerAlert
          });
        }
      }
    } catch (error) {
      console.error('Error notifying healthcare providers:', error);
    }
  }

  // Get assigned healthcare providers for a patient
  private async getAssignedProviders(patientId: string): Promise<Array<{ id: string; name: string; phone?: string }>> {
    // This would typically fetch from your healthcare provider database
    // For now, return a mock provider
    return [
      {
        id: 'provider1',
        name: 'Dr. Sarah Johnson',
        phone: '+2348123456789' // Replace with actual provider phone
      }
    ];
  }

  // Monitor patient vitals and trigger alerts
  async monitorPatientVitals(patientId: string, vitals: any): Promise<void> {
    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) {
        console.error('Failed to fetch patients');
        return;
      }

      const patient = result.patients.find((p: any) => p.id === patientId);
      if (!patient) {
        console.error('Patient not found:', patientId);
        return;
      }

      const riskAssessment = this.assessPatientRisk(patient as any, vitals);

      // Trigger alert for high-risk or critical patients
      if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
        await this.sendHighRiskAlert(patient as any, riskAssessment);
      }

      // Store risk assessment in patient record
      await this.updatePatientRiskLevel(patientId, riskAssessment);
    } catch (error) {
      console.error('Error monitoring patient vitals:', error);
    }
  }

  // Update patient risk level in database
  private async updatePatientRiskLevel(patientId: string, riskAssessment: RiskAssessment): Promise<void> {
    try {
      // Note: These fields may not exist in the Patient interface yet
      // This is a placeholder for future implementation
      console.log(`Patient ${patientId} risk level updated to ${riskAssessment.riskLevel}`);
    } catch (error) {
      console.error('Error updating patient risk level:', error);
    }
  }

  // Send appointment reminders
  async sendAppointmentReminder(patientId: string, appointmentDate: string, clinicName: string): Promise<void> {
    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) return;

      const patient = result.patients.find((p: any) => p.id === patientId) as any;
      if (!patient || !patient.phone) return;

      const reminderMessage = twilioService.getAppointmentReminderMessage(
        patient.name || 'Patient',
        appointmentDate,
        clinicName
      );

      const smsResult = await twilioService.sendSMS({
        to: patient.phone,
        body: reminderMessage
      });

      if (smsResult.success) {
        await SMSService.sendMessage({
          patientId: patient.id || '',
          patientName: patient.name || 'Patient',
          patientPhone: patient.phone || '',
          phoneNumber: patient.phone,
          message: reminderMessage,
          content: reminderMessage,
          type: 'reminder',
          status: 'sent',
          priority: 'medium',
          isAutomated: true,
          sentBy: 'system',
          language: 'en',
          metadata: {
            source: 'appointment_reminder',
            appointmentDate,
            messageId: smsResult.messageId
          }
        });
      }
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
    }
  }

  // Send medication reminders
  async sendMedicationReminder(patientId: string, medicationName: string, dosage: string): Promise<void> {
    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) return;

      const patient = result.patients.find((p: any) => p.id === patientId) as any;
      if (!patient || !patient.phone) return;

      const reminderMessage = twilioService.getMedicationReminderMessage(
        patient.name || 'Patient',
        medicationName,
        dosage
      );

      const smsResult = await twilioService.sendSMS({
        to: patient.phone,
        body: reminderMessage
      });

      if (smsResult.success) {
        await SMSService.sendMessage({
          patientId: patient.id || '',
          patientName: patient.name || 'Patient',
          patientPhone: patient.phone || '',
          phoneNumber: patient.phone,
          message: reminderMessage,
          content: reminderMessage,
          type: 'medication',
          status: 'sent',
          priority: 'medium',
          isAutomated: true,
          sentBy: 'system',
          language: 'en',
          metadata: {
            source: 'medication_reminder',
            medication: medicationName,
            messageId: smsResult.messageId
          }
        });
      }
    } catch (error) {
      console.error('Error sending medication reminder:', error);
    }
  }

  // Send health tips
  async sendHealthTip(patientId: string, tip: string): Promise<void> {
    try {
      const result = await PatientService.searchPatients('');
      if (!result.success || !result.patients) return;

      const patient = result.patients.find((p: any) => p.id === patientId) as any;
      if (!patient || !patient.phone) return;

      const tipMessage = twilioService.getHealthTipMessage(patient.name || 'Patient', tip);

      const smsResult = await twilioService.sendSMS({
        to: patient.phone,
        body: tipMessage
      });

      if (smsResult.success) {
        await SMSService.sendMessage({
          patientId: patient.id || '',
          patientName: patient.name || 'Patient',
          patientPhone: patient.phone || '',
          phoneNumber: patient.phone,
          message: tipMessage,
          content: tipMessage,
          type: 'health_tip',
          status: 'sent',
          priority: 'low',
          isAutomated: true,
          sentBy: 'system',
          language: 'en',
          metadata: {
            source: 'health_tip',
            messageId: smsResult.messageId
          }
        });
      }
    } catch (error) {
      console.error('Error sending health tip:', error);
    }
  }

  // Check Twilio service status
  isServiceAvailable(): boolean {
    return twilioService.isConfigured();
  }
}

export const automatedMessagingService = AutomatedMessagingService.getInstance();
export default AutomatedMessagingService; 