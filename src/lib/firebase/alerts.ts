import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

// Alert interface
export interface Alert {
  id?: string;
  patientId: string;
  patientName: string;
  message: string;
  type: 'risk' | 'appointment' | 'medication' | 'system';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: Timestamp | Date;
  createdBy?: string;
}

// Response type for alert operations
type AlertResponse = {
  success: boolean;
  error?: string;
  alertId?: string;
  alerts?: Alert[];
};

/**
 * Create a new alert
 */
export async function createAlert(alertData: Omit<Alert, 'id' | 'read' | 'createdAt'>): Promise<AlertResponse> {
  try {
    const alertWithDefaults = {
      ...alertData,
      read: false,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'alerts'), alertWithDefaults);
    return { 
      success: true,
      alertId: docRef.id
    };
  } catch (error) {
    console.error('Error creating alert:', error);
    return {
      success: false,
      error: 'Failed to create alert'
    };
  }
}

/**
 * Get alerts from Firestore
 * @param includeRead Whether to include read alerts
 */
export async function getAlerts(includeRead: boolean = false): Promise<AlertResponse> {
  try {
    // Use a simple query to avoid index requirements
    const alertsQuery = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(alertsQuery);
    const alerts: Alert[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const alert = {
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        message: data.message,
        type: data.type,
        priority: data.priority,
        read: data.read,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      };
      
      // Filter in JavaScript if we don't want read alerts
      if (includeRead || !data.read) {
        alerts.push(alert);
      }
    });
    
    return {
      success: true,
      alerts
    };
  } catch (error) {
    console.error('Error getting alerts:', error);
    return {
      success: false,
      error: 'Failed to retrieve alerts'
    };
  }
}

/**
 * Mark an alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<AlertResponse> {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      read: true
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return {
      success: false,
      error: 'Failed to mark alert as read'
    };
  }
}

/**
 * Get alerts for a specific patient
 */
export async function getPatientAlerts(patientId: string): Promise<AlertResponse> {
  try {
    // Get all alerts and filter by patientId in JavaScript to avoid index requirements
    const alertsQuery = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(alertsQuery);
    const alerts: Alert[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filter by patientId in JavaScript
      if (data.patientId === patientId) {
        alerts.push({
          id: doc.id,
          patientId: data.patientId,
          patientName: data.patientName,
          message: data.message,
          type: data.type,
          priority: data.priority,
          read: data.read,
          createdAt: data.createdAt,
          createdBy: data.createdBy
        });
      }
    });
    
    return {
      success: true,
      alerts
    };
  } catch (error) {
    console.error('Error getting patient alerts:', error);
    return {
      success: false,
      error: 'Failed to retrieve patient alerts'
    };
  }
} 