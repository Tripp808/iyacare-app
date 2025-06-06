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