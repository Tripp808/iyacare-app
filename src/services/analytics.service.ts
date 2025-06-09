import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  startAfter,
  endBefore
} from 'firebase/firestore';
import { subDays, format, startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth, subQuarters, startOfQuarter, endOfQuarter, subHours } from 'date-fns';

export interface AnalyticsData {
  totalPatients: number;
  highRiskCases: number;
  emergencyAlerts: number;
  activeMonitoring: number;
  patientGrowth: number;
  riskTrends: Array<{
    month: string;
    high: number;
    medium: number;
    low: number;
  }>;
  vitalSignsData: Array<{
    time: string;
    systolic: number;
    diastolic: number;
    heartRate: number;
  }>;
  riskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  geographicData: Array<{
    region: string;
    patients: number;
    alerts: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    color: string;
  }>;
  dataStatus: {
    hasRealPatients: boolean;
    hasRealAlerts: boolean;
    hasRealVitalSigns: boolean;
    lastUpdated: Date;
  };
}

interface PatientData {
  id: string;
  createdAt: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  address?: string | {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  [key: string]: any;
}

interface AlertData {
  id: string;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
  type?: string;
  message?: string;
  patientId?: string;
  patient_id?: string; // Alternative field name
  [key: string]: any;
}

interface VitalSignData {
  timestamp: Date;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  [key: string]: any;
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics data
   */
  static async getAnalyticsData(timeRange: '7days' | '30days' | '90days' | '1year' = '30days'): Promise<AnalyticsData> {
    try {
      const [
        patientsData,
        alertsData,
        vitalSignsData,
        riskTrendsData
      ] = await Promise.all([
        this.getPatientsAnalytics(timeRange),
        this.getAlertsAnalytics(timeRange),
        this.getVitalSignsAnalytics(timeRange),
        this.getRiskTrendsAnalytics(timeRange)
      ]);

      return {
        ...patientsData,
        ...alertsData,
        ...vitalSignsData,
        ...riskTrendsData,
        dataStatus: {
          hasRealPatients: true,
          hasRealAlerts: true,
          hasRealVitalSigns: true,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Return fallback data
      return this.getFallbackData();
    }
  }

  /**
   * Get patients analytics
   */
  private static async getPatientsAnalytics(timeRange: string) {
    const patientsRef = collection(db, 'patients');
    const alertsRef = collection(db, 'alerts');
    
    const patientsSnapshot = await getDocs(patientsRef);
    const patients: PatientData[] = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as PatientData[];

    // Debug logging to see what patients and risk levels we actually have
    console.log('Analytics Debug - Total patients found:', patients.length);
    console.log('Analytics Debug - Patient risk levels:', patients.map(p => ({ 
      id: p.id, 
      name: `${p.firstName || 'Unknown'} ${p.lastName || 'Unknown'}`, 
      riskLevel: p.riskLevel,
      rawRiskLevel: p.riskLevel
    })));

    const totalPatients = patients.length;
    
    // Calculate patients created in the last period for growth rate
    const daysAgo = this.getDaysFromTimeRange(timeRange);
    const cutoffDate = subDays(new Date(), daysAgo);
    const recentPatients = patients.filter(p => p.createdAt > cutoffDate);
    const previousPeriodPatients = patients.filter(p => 
      p.createdAt <= cutoffDate && p.createdAt > subDays(cutoffDate, daysAgo)
    );

    const patientGrowth = previousPeriodPatients.length > 0 
      ? ((recentPatients.length - previousPeriodPatients.length) / previousPeriodPatients.length) * 100
      : recentPatients.length > 0 ? 100 : 0;

    // Calculate risk distribution - handle both string and object risk levels
    const riskLevels = patients.reduce((acc: any, patient) => {
      let riskLevel: string = patient.riskLevel || '';
      
      // Debug: Show each patient's original risk level
      console.log('Analytics Debug - Patient:', `${patient.firstName || 'Unknown'} ${patient.lastName || 'Unknown'}`, 'Original riskLevel:', patient.riskLevel, 'Type:', typeof patient.riskLevel);
      
      // Only count patients who actually have a valid risk level assigned
      if (riskLevel && ['high', 'medium', 'low'].includes(riskLevel.toLowerCase())) {
        // Normalize risk level to lowercase
        riskLevel = riskLevel.toLowerCase();
        acc[riskLevel] = (acc[riskLevel] || 0) + 1;
      } else {
        // Count patients without assigned risk levels separately (like dashboard does)
        acc['unassigned'] = (acc['unassigned'] || 0) + 1;
        console.log('Analytics Debug - Unassigned patient:', `${patient.firstName || 'Unknown'} ${patient.lastName || 'Unknown'}`, 'riskLevel:', patient.riskLevel);
      }
      
      return acc;
    }, { low: 0, medium: 0, high: 0, unassigned: 0 });

    // Debug the calculated risk distribution
    console.log('Analytics Debug - Calculated risk distribution:', riskLevels);
    console.log('Analytics Debug - Patients with unassigned risk:', riskLevels.unassigned || 0);

    const riskDistribution = [
      { name: 'Low Risk', value: riskLevels.low || 0, color: '#22c55e' },
      { name: 'Medium Risk', value: riskLevels.medium || 0, color: '#f59e0b' },
      { name: 'High Risk', value: riskLevels.high || 0, color: '#ef4444' }
    ];

    // Get alerts for geographic data
    const alertsSnapshot = await getDocs(alertsRef);
    const alerts: AlertData[] = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as AlertData[];

    // Group alerts by patient ID
    const alertsByPatient = alerts.reduce((acc: any, alert) => {
      const patientId = alert.patientId || alert.patient_id;
      if (patientId) {
        acc[patientId] = (acc[patientId] || 0) + 1;
      }
      return acc;
    }, {});

    // Geographic distribution - handle string addresses
    const regions = patients.reduce((acc: any, patient) => {
      let region = 'Unknown Region';
      
      // Handle different address formats
      if (patient.address) {
        if (typeof patient.address === 'string') {
          // Parse string address like "Kigali, Kigali Province, Rwanda"
          const addressParts = patient.address.split(',').map((part: string) => part.trim());
          if (addressParts.length >= 2) {
            // Use the last part (country) or second to last (state/province)
            region = addressParts[addressParts.length - 1] || addressParts[addressParts.length - 2] || 'Unknown Region';
          } else if (addressParts.length === 1) {
            region = addressParts[0];
          }
        } else if (typeof patient.address === 'object' && patient.address !== null) {
          // Handle object address
          const addr = patient.address as { country?: string; state?: string; city?: string };
          region = addr.country || addr.state || addr.city || 'Unknown Region';
        }
      }
      
      if (!acc[region]) {
        acc[region] = { patients: 0, alerts: 0 };
      }
      acc[region].patients += 1;
      acc[region].alerts += alertsByPatient[patient.id] || 0;
      return acc;
    }, {});

    const geographicData = Object.entries(regions)
      .map(([region, data]: [string, any]) => ({
        region,
        patients: data.patients,
        alerts: data.alerts
      }))
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 8); // Show top 8 regions

    // Calculate high risk cases from actual patient data
    const highRiskCases = riskLevels.high || 0;

    // Debug: Show final calculations
    console.log('Analytics Debug - Final calculations:');
    console.log('- Total patients:', totalPatients);
    console.log('- High risk cases:', highRiskCases);
    console.log('- Medium risk cases:', riskLevels.medium || 0);
    console.log('- Low risk cases:', riskLevels.low || 0);
    console.log('- Unassigned risk:', riskLevels.unassigned || 0);

    return {
      totalPatients,
      patientGrowth,
      riskDistribution,
      geographicData,
      highRiskCases, // Add this to return the actual high risk count
      activeMonitoring: Math.floor(totalPatients * 0.75) // Estimate 75% active
    };
  }

  /**
   * Get alerts analytics
   */
  private static async getAlertsAnalytics(timeRange: string) {
    const alertsRef = collection(db, 'alerts');
    const alertsSnapshot = await getDocs(alertsRef);
    
    const alerts: AlertData[] = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as AlertData[];

    const daysAgo = this.getDaysFromTimeRange(timeRange);
    const cutoffDate = subDays(new Date(), daysAgo);
    const recentAlerts = alerts.filter(alert => alert.createdAt > cutoffDate);

    const emergencyAlerts = recentAlerts.filter(alert => 
      alert.priority === 'high' && alert.type === 'emergency'
    ).length;

    // Recent activity from alerts
    const recentActivity = recentAlerts
      .slice(0, 4)
      .map(alert => ({
        id: alert.id,
        type: alert.type || 'alert',
        title: this.getActivityTitle(alert.type, alert.priority),
        description: alert.message || 'Alert detected',
        timestamp: alert.createdAt,
        color: this.getActivityColor(alert.priority)
      }));

    return {
      emergencyAlerts,
      recentActivity
    };
  }

  /**
   * Get vital signs analytics
   */
  private static async getVitalSignsAnalytics(timeRange: string) {
    try {
      const vitalSignsRef = collection(db, 'vitalSigns');
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const vitalSignsQuery = query(
        vitalSignsRef,
        where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
        where('timestamp', '<=', Timestamp.fromDate(endOfToday)),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const vitalSignsSnapshot = await getDocs(vitalSignsQuery);
      const vitalSigns: VitalSignData[] = vitalSignsSnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as VitalSignData[];

      // If no data today, get data from the last 7 days
      if (vitalSigns.length === 0) {
        const sevenDaysAgo = subDays(today, 7);
        const extendedQuery = query(
          vitalSignsRef,
          where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
          where('timestamp', '<=', Timestamp.fromDate(today)),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const extendedSnapshot = await getDocs(extendedQuery);
        const extendedVitalSigns: VitalSignData[] = extendedSnapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as VitalSignData[];
        
        if (extendedVitalSigns.length > 0) {
          // Group by day instead of hour for weekly data
          const dailyData: { [key: string]: { systolic: number[], diastolic: number[], heartRate: number[] } } = {};

          extendedVitalSigns.forEach(vital => {
            const day = format(vital.timestamp, 'MMM dd');
            if (!dailyData[day]) {
              dailyData[day] = { systolic: [], diastolic: [], heartRate: [] };
            }
            
            if (vital.systolic) dailyData[day].systolic.push(vital.systolic);
            if (vital.diastolic) dailyData[day].diastolic.push(vital.diastolic);
            if (vital.heartRate) dailyData[day].heartRate.push(vital.heartRate);
          });

          const vitalSignsData = Object.entries(dailyData)
            .map(([time, data]) => ({
              time,
              systolic: Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length) || 0,
              diastolic: Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length) || 0,
              heartRate: Math.round(data.heartRate.reduce((a, b) => a + b, 0) / data.heartRate.length) || 0
            }))
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(-7); // Last 7 days

          // If still no data, provide empty data instead of sample data
          if (vitalSignsData.length === 0) {
            return { vitalSignsData: [] };
          }

          return { vitalSignsData };
        }
      }

      // Group by hour and calculate averages (for today's data)
      const hourlyData: { [key: string]: { systolic: number[], diastolic: number[], heartRate: number[] } } = {};

      vitalSigns.forEach(vital => {
        const hour = format(vital.timestamp, 'HH:00');
        if (!hourlyData[hour]) {
          hourlyData[hour] = { systolic: [], diastolic: [], heartRate: [] };
        }
        
        if (vital.systolic) hourlyData[hour].systolic.push(vital.systolic);
        if (vital.diastolic) hourlyData[hour].diastolic.push(vital.diastolic);
        if (vital.heartRate) hourlyData[hour].heartRate.push(vital.heartRate);
      });

      const vitalSignsData = Object.entries(hourlyData)
        .map(([time, data]) => ({
          time,
          systolic: Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length) || 0,
          diastolic: Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length) || 0,
          heartRate: Math.round(data.heartRate.reduce((a, b) => a + b, 0) / data.heartRate.length) || 0
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 7); // Last 7 hours

      // If still no data, provide empty data instead of sample data
      if (vitalSignsData.length === 0) {
        return { vitalSignsData: [] };
      }

      return { vitalSignsData };
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      // Return empty data instead of fallback sample data
      return { vitalSignsData: [] };
    }
  }

  /**
   * Get risk trends analytics
   */
  private static async getRiskTrendsAnalytics(timeRange: string) {
    try {
      const patientsRef = collection(db, 'patients');
      const alertsRef = collection(db, 'alerts');
      
      const daysAgo = this.getDaysFromTimeRange(timeRange);
      const endDate = new Date();
      const startDate = subDays(endDate, daysAgo);
      
      // Get patients created in the time range
      const patientsQuery = query(
        patientsRef,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
      
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients: PatientData[] = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as PatientData[];

      // Group by month for longer periods, by week for shorter periods
      const periods = this.getPeriods(timeRange, startDate, endDate);
      
      const riskTrends = periods.map(period => {
        const periodPatients = patients.filter(patient => 
          patient.createdAt >= period.start && patient.createdAt <= period.end
        );
        
        const riskCounts = periodPatients.reduce((acc: any, patient) => {
          const riskLevel = patient.riskLevel || 'low';
          acc[riskLevel] = (acc[riskLevel] || 0) + 1;
          return acc;
        }, { high: 0, medium: 0, low: 0 });

        return {
          month: period.label,
          high: riskCounts.high,
          medium: riskCounts.medium,
          low: riskCounts.low
        };
      });

      return { riskTrends };
    } catch (error) {
      console.error('Error fetching risk trends:', error);
      // Return empty trends instead of random sample data
      return { riskTrends: [] };
    }
  }

  /**
   * Get time periods for trend analysis
   */
  private static getPeriods(timeRange: string, startDate: Date, endDate: Date) {
    const periods = [];
    
    switch (timeRange) {
      case '7days':
        // Show daily data for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = subDays(endDate, i);
          periods.push({
            label: format(date, 'MMM dd'),
            start: startOfDay(date),
            end: endOfDay(date)
          });
        }
        break;
        
      case '30days':
        // Show weekly data for last 30 days
        for (let i = 3; i >= 0; i--) {
          const weekEnd = subWeeks(endDate, i);
          const weekStart = startOfWeek(weekEnd);
          periods.push({
            label: `Week ${4 - i}`,
            start: weekStart,
            end: endOfWeek(weekEnd)
          });
        }
        break;
        
      case '90days':
        // Show monthly data for last 3 months
        for (let i = 2; i >= 0; i--) {
          const monthDate = subMonths(endDate, i);
          periods.push({
            label: format(monthDate, 'MMM'),
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate)
          });
        }
        break;
        
      case '1year':
        // Show quarterly data for last year
        for (let i = 3; i >= 0; i--) {
          const quarterDate = subQuarters(endDate, i);
          periods.push({
            label: `Q${4 - i}`,
            start: startOfQuarter(quarterDate),
            end: endOfQuarter(quarterDate)
          });
        }
        break;
        
      default:
        // Default to monthly data
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(endDate, i);
          periods.push({
            label: format(monthDate, 'MMM'),
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate)
          });
        }
    }
    
    return periods;
  }

  /**
   * Helper methods
   */
  private static getDaysFromTimeRange(timeRange: string): number {
    switch (timeRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '1year': return 365;
      default: return 30;
    }
  }

  private static getActivityTitle(type?: string, priority?: string): string {
    if (priority === 'high') return 'High Priority Alert';
    switch (type) {
      case 'risk': return 'Risk Assessment Alert';
      case 'appointment': return 'Appointment Reminder';
      case 'medication': return 'Medication Alert';
      default: return 'System Alert';
    }
  }

  private static getActivityColor(priority?: string): string {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  }

  /**
   * Fallback data when database queries fail
   */
  private static getFallbackData(): AnalyticsData {
    return {
      totalPatients: 0,
      highRiskCases: 0,
      emergencyAlerts: 0,
      activeMonitoring: 0,
      patientGrowth: 0,
      riskTrends: [],
      vitalSignsData: [],
      riskDistribution: [
        { name: 'Low Risk', value: 0, color: '#22c55e' },
        { name: 'Medium Risk', value: 0, color: '#f59e0b' },
        { name: 'High Risk', value: 0, color: '#ef4444' }
      ],
      geographicData: [],
      recentActivity: [],
      dataStatus: {
        hasRealPatients: false,
        hasRealAlerts: false,
        hasRealVitalSigns: false,
        lastUpdated: new Date()
      }
    };
  }
} 