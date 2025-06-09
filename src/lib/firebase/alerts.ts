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
export interface AlertResponse {
  success: boolean;
  error?: string;
  alertId?: string;
  id?: string;
  alerts?: Alert[];
  message?: string;
}

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

/**
 * Create an alert for a high-risk patient automatically
 */
export async function createHighRiskAlert(
  patientId: string,
  patientName: string,
  riskFactors?: string[]
): Promise<AlertResponse> {
  try {
    // Check if a high-risk alert already exists for this patient in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const existingAlertsQuery = query(
      collection(db, 'alerts'),
      where('patientId', '==', patientId),
      where('type', '==', 'risk'),
      where('priority', '==', 'high'),
      where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
      orderBy('createdAt', 'desc')
    );
    
    const existingAlertsSnapshot = await getDocs(existingAlertsQuery);
    
    // If an alert already exists in the last 24 hours, don't create another one
    if (!existingAlertsSnapshot.empty) {
      return {
        success: true,
        message: 'High-risk alert already exists for this patient'
      };
    }

    // Generate alert message based on risk factors
    let message = `HIGH RISK PATIENT ALERT: ${patientName} has been classified as high-risk and requires immediate attention.`;
    
    if (riskFactors && riskFactors.length > 0) {
      message += ` Risk factors: ${riskFactors.join(', ')}.`;
    }
    
    message += ' Please prioritize this patient for monitoring and care.';

    const alertData = {
      patientId,
      patientName,
      message,
      type: 'risk' as const,
      priority: 'high' as const,
      read: false,
      createdAt: serverTimestamp(),
      createdBy: 'system'
    };

    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, alertData);
    
    console.log(`High-risk alert created for patient ${patientName} (ID: ${patientId})`);
    
    return {
      success: true,
      id: docRef.id,
      message: 'High-risk alert created successfully'
    };
  } catch (error) {
    console.error('Error creating high-risk alert:', error);
    return {
      success: false,
      error: 'Failed to create high-risk alert'
    };
  }
}

/**
 * Check all patients and create alerts for high-risk patients who don't have recent alerts
 */
export async function checkAndCreateHighRiskAlerts(): Promise<void> {
  try {
    // Import getPatients function here to avoid circular imports
    const { getPatients } = await import('./patients');
    
    const patientsResult = await getPatients();
    if (!patientsResult.success || !patientsResult.patients) {
      console.error('Failed to fetch patients for high-risk alert check');
      return;
    }

    const highRiskPatients = patientsResult.patients.filter(
      patient => patient.riskLevel === 'high'
    );

    console.log(`Found ${highRiskPatients.length} high-risk patients`);

    // Create alerts for each high-risk patient
    for (const patient of highRiskPatients) {
      if (patient.id) {
        const patientName = `${patient.firstName} ${patient.lastName}`;
        
        // Determine risk factors based on patient data
        const riskFactors: string[] = [];
        if (patient.isPregnant) riskFactors.push('pregnancy complications');
        if (patient.medicalHistory?.includes('hypertension')) riskFactors.push('hypertension');
        if (patient.medicalHistory?.includes('diabetes')) riskFactors.push('diabetes');
        
        await createHighRiskAlert(patient.id, patientName, riskFactors);
      }
    }
  } catch (error) {
    console.error('Error in checkAndCreateHighRiskAlerts:', error);
  }
} 