import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { SMSMessage, SMSTemplate, SMSCampaign, SMSSettings, SMSAnalytics } from '@/types';

export class SMSService {
  // SMS Messages
  static async sendMessage(messageData: Omit<SMSMessage, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const messagesRef = collection(db, 'sms_messages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        createdAt: serverTimestamp(),
        sentAt: messageData.status === 'sent' ? serverTimestamp() : null
      });

      // Here you would integrate with actual SMS provider (Twilio, etc.)
      // For now, we'll simulate the SMS sending
      if (messageData.status === 'pending') {
        await this.simulateSMSSending(docRef.id, messageData);
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: 'Failed to send SMS message' };
    }
  }

  static async getMessages(patientId?: string): Promise<{ success: boolean; messages?: SMSMessage[]; error?: string }> {
    try {
      let messagesQuery;
      if (patientId) {
        messagesQuery = query(
          collection(db, 'sms_messages'),
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
      } else {
        messagesQuery = query(
          collection(db, 'sms_messages'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const querySnapshot = await getDocs(messagesQuery);
      const messages: SMSMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate(),
          readAt: data.readAt?.toDate(),
          scheduledFor: data.scheduledFor?.toDate()
        } as SMSMessage);
      });

      return { success: true, messages };
    } catch (error) {
      console.error('Error getting SMS messages:', error);
      return { success: false, error: 'Failed to retrieve SMS messages' };
    }
  }

  static async updateMessageStatus(
    messageId: string, 
    status: SMSMessage['status'], 
    additionalData?: Partial<SMSMessage>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const messageRef = doc(db, 'sms_messages', messageId);
      const updateData: any = { status };

      if (status === 'sent' && !additionalData?.sentAt) {
        updateData.sentAt = serverTimestamp();
      }
      if (status === 'delivered' && !additionalData?.deliveredAt) {
        updateData.deliveredAt = serverTimestamp();
      }
      if (status === 'read' && !additionalData?.readAt) {
        updateData.readAt = serverTimestamp();
      }

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      await updateDoc(messageRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating message status:', error);
      return { success: false, error: 'Failed to update message status' };
    }
  }

  // SMS Templates
  static async createTemplate(templateData: Omit<SMSTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const templatesRef = collection(db, 'sms_templates');
      const docRef = await addDoc(templatesRef, {
        ...templateData,
        usageCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating SMS template:', error);
      return { success: false, error: 'Failed to create SMS template' };
    }
  }

  static async getTemplates(category?: string): Promise<{ success: boolean; templates?: SMSTemplate[]; error?: string }> {
    try {
      let templatesQuery;
      if (category) {
        templatesQuery = query(
          collection(db, 'sms_templates'),
          where('category', '==', category),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        templatesQuery = query(
          collection(db, 'sms_templates'),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(templatesQuery);
      const templates: SMSTemplate[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastUsed: data.lastUsed?.toDate()
        } as SMSTemplate);
      });

      return { success: true, templates };
    } catch (error) {
      console.error('Error getting SMS templates:', error);
      return { success: false, error: 'Failed to retrieve SMS templates' };
    }
  }

  static async updateTemplate(templateId: string, updateData: Partial<SMSTemplate>): Promise<{ success: boolean; error?: string }> {
    try {
      const templateRef = doc(db, 'sms_templates', templateId);
      await updateDoc(templateRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating SMS template:', error);
      return { success: false, error: 'Failed to update SMS template' };
    }
  }

  static async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const templateRef = doc(db, 'sms_templates', templateId);
      await deleteDoc(templateRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting SMS template:', error);
      return { success: false, error: 'Failed to delete SMS template' };
    }
  }

  static async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'sms_templates', templateId);
      const templateDoc = await getDoc(templateRef);
      const currentUsage = templateDoc.data()?.usageCount || 0;
      
      await updateDoc(templateRef, {
        usageCount: currentUsage + 1,
        lastUsed: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing template usage:', error);
    }
  }

  // SMS Campaigns
  static async createCampaign(campaignData: Omit<SMSCampaign, 'id' | 'createdAt' | 'updatedAt' | 'sentCount' | 'deliveredCount' | 'failedCount' | 'readCount'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const campaignsRef = collection(db, 'sms_campaigns');
      const docRef = await addDoc(campaignsRef, {
        ...campaignData,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        readCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating SMS campaign:', error);
      return { success: false, error: 'Failed to create SMS campaign' };
    }
  }

  static async getCampaigns(): Promise<{ success: boolean; campaigns?: SMSCampaign[]; error?: string }> {
    try {
      const campaignsQuery = query(
        collection(db, 'sms_campaigns'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(campaignsQuery);
      const campaigns: SMSCampaign[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        campaigns.push({
          id: doc.id,
          name: data.name || 'Untitled Campaign',
          description: data.description || '',
          templateId: data.templateId || '',
          templateName: data.templateName,
          targetCriteria: data.targetCriteria || {},
          frequency: data.frequency || 'once',
          status: data.status || 'draft',
          scheduledDate: data.scheduledDate?.toDate(),
          sentCount: data.sentCount || 0,
          deliveredCount: data.deliveredCount || 0,
          readCount: data.readCount || 0,
          createdBy: data.createdBy || 'system',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Remove the problematic properties
          ...(data.endDate && { endDate: data.endDate?.toDate() }),
          ...(data.lastRunAt && { lastRunAt: data.lastRunAt?.toDate() }),
          ...(data.nextRunAt && { nextRunAt: data.nextRunAt?.toDate() })
        } as SMSCampaign);
      });

      return { success: true, campaigns };
    } catch (error) {
      console.error('Error getting SMS campaigns:', error);
      return { success: false, error: 'Failed to retrieve SMS campaigns' };
    }
  }

  static async updateCampaign(campaignId: string, updateData: Partial<SMSCampaign>): Promise<{ success: boolean; error?: string }> {
    try {
      const campaignRef = doc(db, 'sms_campaigns', campaignId);
      await updateDoc(campaignRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating SMS campaign:', error);
      return { success: false, error: 'Failed to update SMS campaign' };
    }
  }

  // SMS Settings
  static async getSMSSettings(): Promise<{ success: boolean; settings?: SMSSettings; error?: string }> {
    try {
      const settingsQuery = query(
        collection(db, 'sms_settings'),
        where('isActive', '==', true),
        limit(1)
      );

      const querySnapshot = await getDocs(settingsQuery);
      if (querySnapshot.empty) {
        return { success: true, settings: undefined };
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const settings: SMSSettings = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as SMSSettings;

      return { success: true, settings };
    } catch (error) {
      console.error('Error getting SMS settings:', error);
      return { success: false, error: 'Failed to retrieve SMS settings' };
    }
  }

  static async updateSMSSettings(settingsData: Omit<SMSSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      // First, get existing settings
      const existingResult = await this.getSMSSettings();
      
      if (existingResult.settings) {
        // Update existing settings
        const settingsRef = doc(db, 'sms_settings', existingResult.settings.id);
        await updateDoc(settingsRef, {
          ...settingsData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new settings
        const settingsRef = collection(db, 'sms_settings');
        await addDoc(settingsRef, {
          ...settingsData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating SMS settings:', error);
      return { success: false, error: 'Failed to update SMS settings' };
    }
  }

  // Analytics
  static async getSMSAnalytics(dateRange: { from: Date; to: Date }): Promise<{ success: boolean; analytics?: SMSAnalytics; error?: string }> {
    try {
      const messagesQuery = query(
        collection(db, 'sms_messages'),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.from)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.to))
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: SMSMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
          deliveredAt: data.deliveredAt?.toDate(),
          readAt: data.readAt?.toDate()
        } as SMSMessage);
      });

      // Calculate analytics
      const totalSent = messages.filter(m => m.status !== 'pending').length;
      const totalDelivered = messages.filter(m => m.status === 'delivered' || m.status === 'read').length;
      const totalFailed = messages.filter(m => m.status === 'failed').length;
      const totalRead = messages.filter(m => m.status === 'read').length;

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
      const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

      // Get templates for popular templates analysis
      const templatesResult = await this.getTemplates();
      const popularTemplates = (templatesResult.templates || [])
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(t => ({
          templateId: t.id,
          templateName: t.name,
          usageCount: t.usageCount
        }));

      // Category breakdown
      const categoryMap = new Map();
      messages.forEach(message => {
        const category = message.type;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { total: 0, delivered: 0 });
        }
        const stats = categoryMap.get(category);
        stats.total++;
        if (message.status === 'delivered' || message.status === 'read') {
          stats.delivered++;
        }
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.total,
        deliveryRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0
      }));

      // Time analysis (by hour)
      const timeMap = new Map();
      for (let hour = 0; hour < 24; hour++) {
        timeMap.set(hour, { sent: 0, delivered: 0, read: 0 });
      }

      messages.forEach(message => {
        const hour = message.createdAt.getHours();
        const stats = timeMap.get(hour);
        if (message.status !== 'pending') stats.sent++;
        if (message.status === 'delivered' || message.status === 'read') stats.delivered++;
        if (message.status === 'read') stats.read++;
      });

      const timeAnalysis = Array.from(timeMap.entries()).map(([hour, stats]) => ({
        hour,
        sent: stats.sent,
        delivered: stats.delivered,
        read: stats.read
      }));

      // Patient engagement
      const patientMap = new Map();
      messages.forEach(message => {
        if (!patientMap.has(message.patientId)) {
          patientMap.set(message.patientId, {
            patientId: message.patientId,
            patientName: message.patientName,
            messagesReceived: 0,
            messagesRead: 0,
            lastActivity: message.createdAt
          });
        }
        const patient = patientMap.get(message.patientId);
        patient.messagesReceived++;
        if (message.status === 'read') patient.messagesRead++;
        if (message.createdAt > patient.lastActivity) {
          patient.lastActivity = message.createdAt;
        }
      });

      const patientEngagement = Array.from(patientMap.values()).slice(0, 50);

      const analytics: SMSAnalytics = {
        totalSent,
        totalDelivered,
        totalFailed,
        totalRead,
        deliveryRate,
        readRate,
        failureRate,
        costAnalysis: {
          totalCost: totalSent * 0.05, // Assuming ₦0.05 per SMS
          costPerMessage: 0.05,
          monthlyCost: totalSent * 0.05
        },
        popularTemplates,
        patientEngagement,
        categoryBreakdown,
        timeAnalysis,
        dateRange
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting SMS analytics:', error);
      return { success: false, error: 'Failed to retrieve SMS analytics' };
    }
  }

  // Utility Methods
  static async sendBulkMessages(
    messages: Omit<SMSMessage, 'id' | 'createdAt'>[]
  ): Promise<{ success: boolean; results?: { success: boolean; id?: string; error?: string }[]; error?: string }> {
    try {
      const results = await Promise.all(
        messages.map(message => this.sendMessage(message))
      );

      const allSuccess = results.every(result => result.success);
      
      return { 
        success: allSuccess, 
        results,
        error: allSuccess ? undefined : 'Some messages failed to send'
      };
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      return { success: false, error: 'Failed to send bulk messages' };
    }
  }

  static processTemplate(template: string, variables: Record<string, any>): string {
    let processedTemplate = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedTemplate = processedTemplate.replace(regex, String(value));
    });

    return processedTemplate;
  }

  // Simulate SMS sending (replace with actual SMS provider integration)
  private static async simulateSMSSending(messageId: string, messageData: Omit<SMSMessage, 'id' | 'createdAt'>): Promise<void> {
    // Simulate network delay
    setTimeout(async () => {
      try {
        // Simulate 95% success rate
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
          await this.updateMessageStatus(messageId, 'sent');
          
          // Simulate delivery after 2-5 seconds
          setTimeout(async () => {
            await this.updateMessageStatus(messageId, 'delivered');
            
            // Simulate read status for 60% of messages after 10-30 seconds
            if (Math.random() > 0.4) {
              setTimeout(async () => {
                await this.updateMessageStatus(messageId, 'read');
              }, 10000 + Math.random() * 20000);
            }
          }, 2000 + Math.random() * 3000);
        } else {
          await this.updateMessageStatus(messageId, 'failed', {
            failureReason: 'Network error or invalid phone number'
          });
        }
      } catch (error) {
        console.error('Error in SMS simulation:', error);
      }
    }, 1000);
  }
} 