import { getPatients } from '@/lib/firebase/patients';
import { createAlert, getAlerts } from '@/lib/firebase/alerts';
import { Timestamp } from 'firebase/firestore';

export interface HighRiskPatient {
  id: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
  confidence?: number;
  age?: number;
  isPregnant?: boolean;
}

export class HighRiskNotificationService {
  
  /**
   * Get all patients currently assessed as high risk
   */
  static async getHighRiskPatients(): Promise<HighRiskPatient[]> {
    try {
      const patientsResult = await getPatients();
      if (!patientsResult.success || !patientsResult.patients) {
        return [];
      }

      // Filter patients with high risk level
      const highRiskPatients = patientsResult.patients
        .filter(patient => {
          const riskLevel = patient.riskLevel?.toLowerCase();
          return riskLevel === 'high' || riskLevel === 'critical';
        })
        .map(patient => ({
          id: patient.id!,
          firstName: patient.firstName,
          lastName: patient.lastName,
          riskLevel: patient.riskLevel || 'unknown',
          age: patient.age,
          isPregnant: patient.isPregnant
        }));

      return highRiskPatients;
    } catch (error) {
      console.error('Error fetching high-risk patients:', error);
      return [];
    }
  }

  /**
   * Create notification for a specific high-risk patient
   * Only creates if no existing unread alert exists for this patient
   */
  static async createHighRiskNotification(patient: HighRiskPatient): Promise<boolean> {
    try {
      // Check if there's already an unread alert for this patient
      const existingAlertsResult = await getAlerts(false); // Get unread alerts only
      
      if (existingAlertsResult.success && existingAlertsResult.alerts) {
        const existingAlert = existingAlertsResult.alerts.find(alert => 
          alert.patientId === patient.id && 
          alert.type === 'risk' && 
          alert.priority === 'high'
        );
        
        if (existingAlert) {
          console.log(`High-risk alert already exists for patient ${patient.firstName} ${patient.lastName}`);
          return false; // Don't create duplicate
        }
      }

      const patientName = `${patient.firstName} ${patient.lastName}`;
      
      // Generate appropriate message based on patient details
      let message = `High-risk patient alert: ${patientName} requires immediate attention.`;
      
      // Add context based on patient details
      const riskFactors = [];
      if (patient.age && patient.age > 35) {
        riskFactors.push('advanced maternal age');
      }
      if (patient.isPregnant) {
        riskFactors.push('pregnancy complications');
      }
      
      if (riskFactors.length > 0) {
        message += ` Risk factors include: ${riskFactors.join(', ')}.`;
      }
      
      message += ' Please prioritize for immediate medical evaluation.';

      const alertData = {
        patientId: patient.id,
        patientName: patientName,
        message: message,
        type: 'risk' as const,
        priority: 'high' as const,
        createdBy: 'AI_SYSTEM'
      };

      const result = await createAlert(alertData);
      return result.success;
    } catch (error) {
      console.error('Error creating high-risk notification:', error);
      return false;
    }
  }

  /**
   * Check for new high-risk patients and create notifications
   * This should be called after AI risk assessments are updated
   */
  static async checkAndCreateHighRiskNotifications(): Promise<{
    processed: number;
    created: number;
    errors: number;
  }> {
    try {
      console.log('Checking for high-risk patients to notify...');
      
      const highRiskPatients = await this.getHighRiskPatients();
      let created = 0;
      let errors = 0;

      if (highRiskPatients.length === 0) {
        console.log('No high-risk patients found');
        return { processed: 0, created: 0, errors: 0 };
      }

      console.log(`Found ${highRiskPatients.length} high-risk patients`);

      // Create notifications for each high-risk patient
      for (const patient of highRiskPatients) {
        const success = await this.createHighRiskNotification(patient);
        if (success) {
          created++;
          console.log(`Created notification for ${patient.firstName} ${patient.lastName}`);
        } else {
          errors++;
          console.error(`Failed to create notification for ${patient.firstName} ${patient.lastName}`);
        }
      }

      console.log(`Notification check complete: ${created} created, ${errors} errors`);
      
      return {
        processed: highRiskPatients.length,
        created,
        errors
      };
    } catch (error) {
      console.error('Error in checkAndCreateHighRiskNotifications:', error);
      return { processed: 0, created: 0, errors: 1 };
    }
  }

  /**
   * Get count of high-risk patients for badge display
   * This represents patients who need immediate attention but don't have system alerts yet
   */
  static async getHighRiskPatientCount(): Promise<number> {
    try {
      const highRiskPatients = await this.getHighRiskPatients();
      
      // If no high-risk patients, return 0
      if (highRiskPatients.length === 0) {
        return 0;
      }

      // Get existing unread alerts to see which patients already have system notifications
      const existingAlertsResult = await getAlerts(false); // Get unread alerts only
      const existingSystemAlertPatientIds = new Set<string>();
      
      if (existingAlertsResult.success && existingAlertsResult.alerts) {
        // Only count system-generated alerts, not patient-based notifications
        existingAlertsResult.alerts
          .filter(alert => 
            alert.type === 'risk' && 
            alert.priority === 'high' &&
            alert.createdBy === 'AI_SYSTEM'
          )
          .forEach(alert => existingSystemAlertPatientIds.add(alert.patientId));
      }
      
      // Count high-risk patients without existing system alerts
      const patientsNeedingAttention = highRiskPatients.filter(patient => 
        !existingSystemAlertPatientIds.has(patient.id)
      );
      
      console.log(`High-risk patient count: ${patientsNeedingAttention.length}/${highRiskPatients.length} patients need notifications`);
      
      return patientsNeedingAttention.length;
    } catch (error) {
      console.error('Error getting high-risk patient count:', error);
      return 0;
    }
  }

  /**
   * Get formatted list of high-risk patients for dropdown display
   * This shows patients who need immediate attention
   */
  static async getHighRiskPatientsForDisplay(): Promise<Array<{
    id: string;
    name: string;
    riskLevel: string;
    description: string;
  }>> {
    try {
      const highRiskPatients = await this.getHighRiskPatients();
      
      // If no high-risk patients, return empty array
      if (highRiskPatients.length === 0) {
        return [];
      }

      // Get existing unread alerts to see which patients already have system notifications
      const existingAlertsResult = await getAlerts(false); // Get unread alerts only
      const existingSystemAlertPatientIds = new Set<string>();
      
      if (existingAlertsResult.success && existingAlertsResult.alerts) {
        // Only count system-generated alerts, not patient-based notifications
        existingAlertsResult.alerts
          .filter(alert => 
            alert.type === 'risk' && 
            alert.priority === 'high' &&
            alert.createdBy === 'AI_SYSTEM'
          )
          .forEach(alert => existingSystemAlertPatientIds.add(alert.patientId));
      }
      
      // Show high-risk patients without existing system alerts
      const patientsNeedingAttention = highRiskPatients.filter(patient => 
        !existingSystemAlertPatientIds.has(patient.id)
      );
      
      return patientsNeedingAttention.map(patient => {
        const riskFactors = [];
        if (patient.age && patient.age > 35) riskFactors.push('advanced age');
        if (patient.isPregnant) riskFactors.push('pregnancy');
        
        const description = riskFactors.length > 0 
          ? `High risk - ${riskFactors.join(', ')}`
          : 'High risk patient - requires attention';

        return {
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
          riskLevel: patient.riskLevel,
          description
        };
      });
    } catch (error) {
      console.error('Error getting high-risk patients for display:', error);
      return [];
    }
  }
} 