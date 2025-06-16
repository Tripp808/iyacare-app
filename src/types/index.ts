export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'healthcare_worker' | 'patient';
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  phone?: string;
  address?: string;
  verified: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  patientId: string;
  name: string;
  dateOfBirth: Date;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    surgeries: string[];
  };
  pregnancy: {
    gestationalWeek: number;
    dueDate: Date;
    riskLevel: 'low' | 'medium' | 'high';
    complications: string[];
  };
  vitalSigns: VitalSigns[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  timestamp: Date;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar?: number;
  oxygenSaturation?: number;
  deviceId?: string;
  alertGenerated?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  healthcareWorkerId: string;
  scheduledDate: Date;
  duration: number; // in minutes
  type: 'routine' | 'emergency' | 'follow-up' | 'consultation';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';
  location: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string[];
  nextAppointment?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  patientId: string;
  type: 'vital_signs' | 'medication' | 'appointment' | 'emergency' | 'iot_device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  deviceId?: string;
  vitalSignsId?: string;
  actionTaken?: string;
}

export interface IoTDevice {
  id: string;
  patientId: string;
  deviceType: 'blood_pressure' | 'heart_rate' | 'glucose' | 'weight' | 'temperature';
  deviceModel: string;
  serialNumber: string;
  isActive: boolean;
  lastReading?: Date;
  batteryLevel?: number;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  calibrationDate?: Date;
  assignedAt: Date;
}

export interface Referral {
  id: string;
  patientId: string;
  fromHealthcareWorkerId: string;
  toHealthcareWorkerId?: string;
  department: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  reason: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'patient_analytics' | 'risk_analysis' | 'device_analytics' | 'geographic_analysis' | 'emergency_analytics';
  generatedBy: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    patientIds?: string[];
    riskLevels?: string[];
    locations?: string[];
    deviceTypes?: string[];
  };
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  fileUrl?: string;
  fileFormat: 'pdf' | 'excel' | 'csv';
  fileSize?: number;
  scheduledFor?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface Analytics {
  totalPatients: number;
  highRiskPatients: number;
  emergencyAlerts: number;
  activeMonitoring: number;
  appointmentsToday: number;
  deviceConnectivity: number;
  riskTrends: {
    month: string;
    high: number;
    medium: number;
    low: number;
  }[];
  vitalSignsTrends: {
    time: string;
    systolic: number;
    diastolic: number;
    heartRate: number;
  }[];
  geographicDistribution: {
    region: string;
    patients: number;
    alerts: number;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'alert' | 'appointment' | 'report' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  date: Date;
  recordType: 'prenatal_checkup' | 'vaccination' | 'lab_results' | 'diagnosis' | 'treatment' | 'medication';
  title: string;
  description: string;
  healthcareWorkerId: string;
  vitalSigns?: VitalSigns;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
  }[];
  labResults?: {
    testName: string;
    result: string;
    normalRange: string;
    unit: string;
  }[];
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
}

// SMS and Communication Types
export interface SMSMessage {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  phoneNumber: string;
  message: string;
  content: string;
  type: 'reminder' | 'appointment' | 'health_tip' | 'alert' | 'medication' | 'follow_up' | 'survey' | 'emergency' | 'manual';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read' | 'scheduled';
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent' | 'critical';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  scheduledFor?: Date;
  isAutomated: boolean;
  templateId?: string;
  sentBy?: string;
  language: string;
  metadata?: {
    appointmentId?: string;
    alertId?: string;
    campaignId?: string;
    source?: string;
    userId?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface SMSTemplate {
  id: string;
  name: string;
  category: 'reminder' | 'appointment' | 'health_tip' | 'alert' | 'medication' | 'follow_up' | 'survey' | 'emergency';
  language: string;
  subject?: string;
  content: string;
  description?: string;
  variables: string[]; // e.g., ['patientName', 'appointmentDate', 'clinicName']
  isActive: boolean;
  usage: 'manual' | 'automated' | 'both';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once';
  triggerConditions?: {
    riskLevel?: string[];
    appointmentType?: string[];
    gestationalWeek?: { min?: number; max?: number };
    daysBeforeAppointment?: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface SMSCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  templateName?: string;
  targetCriteria: {
    patientType?: string[];
    ageRange?: {
      min: number;
      max: number;
    };
    lastVisit?: {
      after: Date;
      before: Date;
    };
    conditions?: string[];
  };
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'active' | 'paused' | 'completed';
  scheduledDate?: Date;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SMSSettings {
  id: string;
  providerId: string;
  providerName: 'twilio' | 'nexmo' | 'africas_talking' | 'termii' | 'custom';
  apiKey: string;
  secretKey: string;
  senderId: string;
  isActive: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
  costPerSMS?: number;
  supportedCountries: string[];
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  totalCost?: number;
  averageCostPerMessage?: number;
  totalPatients?: number;
  costAnalysis: {
    totalCost: number;
    costPerMessage: number;
    monthlyCost: number;
  };
  popularTemplates: {
    templateId: string;
    templateName: string;
    usageCount: number;
  }[];
  patientEngagement: {
    patientId: string;
    patientName: string;
    messagesReceived: number;
    messagesRead: number;
    lastActivity: Date;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    deliveryRate: number;
  }[];
  timeAnalysis: {
    hour: number;
    sent: number;
    delivered: number;
    read: number;
  }[];
  dateRange: {
    from: Date;
    to: Date;
    start?: Date;
    end?: Date;
  };
} 