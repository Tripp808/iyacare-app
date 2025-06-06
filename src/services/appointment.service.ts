import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment } from '@/types';

export class AppointmentService {
  static async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }

  static async getAppointment(appointmentId: string): Promise<Appointment | null> {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      if (!appointmentDoc.exists()) return null;

      return { ...appointmentDoc.data(), id: appointmentDoc.id } as Appointment;
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  }

  static async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        orderBy('scheduledDate', 'desc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get patient appointments error:', error);
      throw error;
    }
  }

  static async getHealthcareWorkerAppointments(healthcareWorkerId: string): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('healthcareWorkerId', '==', healthcareWorkerId),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get healthcare worker appointments error:', error);
      throw error;
    }
  }

  static async getTodaysAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('scheduledDate', '>=', startOfDay),
        where('scheduledDate', '<', endOfDay),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get today\'s appointments error:', error);
      throw error;
    }
  }

  static async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('scheduledDate', '>=', tomorrow),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      throw error;
    }
  }

  static async updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: Appointment['status']) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }

  static async getAppointmentsByStatus(status: Appointment['status']): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('status', '==', status),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get appointments by status error:', error);
      throw error;
    }
  }

  static async getAppointmentsByType(type: Appointment['type']): Promise<Appointment[]> {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('type', '==', type),
        orderBy('scheduledDate', 'desc')
      );
      
      const querySnapshot = await getDocs(appointmentsQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Appointment));
    } catch (error) {
      console.error('Get appointments by type error:', error);
      throw error;
    }
  }
} 