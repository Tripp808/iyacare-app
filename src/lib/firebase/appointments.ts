import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'routine' | 'emergency' | 'follow-up' | 'consultation';
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const APPOINTMENTS_COLLECTION = 'appointments';

export const appointmentsService = {
  // Add new appointment
  async addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
        ...appointmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding appointment:', error);
      return { success: false, error: 'Failed to create appointment' };
    }
  },

  // Get all appointments
  async getAppointments() {
    try {
      const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        orderBy('date', 'desc'),
        orderBy('time', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data() as Omit<Appointment, 'id'>
        });
      });
      
      return { success: true, appointments };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, error: 'Failed to fetch appointments', appointments: [] };
    }
  },

  // Get appointments for a specific patient
  async getPatientAppointments(patientId: string) {
    try {
      const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data() as Omit<Appointment, 'id'>
        });
      });
      
      return { success: true, appointments };
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return { success: false, error: 'Failed to fetch patient appointments', appointments: [] };
    }
  },

  // Update appointment
  async updateAppointment(id: string, updates: Partial<Appointment>) {
    try {
      const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, id);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, error: 'Failed to update appointment' };
    }
  },

  // Delete appointment
  async deleteAppointment(id: string) {
    try {
      await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: 'Failed to delete appointment' };
    }
  },

  // Get next appointment for a patient
  async getNextAppointment(patientId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where('patientId', '==', patientId),
        where('date', '>=', today),
        where('status', 'in', ['scheduled', 'confirmed']),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const appointment: Appointment = {
          id: doc.id,
          ...doc.data() as Omit<Appointment, 'id'>
        };
        return { success: true, appointment };
      }
      
      return { success: true, appointment: null };
    } catch (error) {
      console.error('Error fetching next appointment:', error);
      return { success: false, error: 'Failed to fetch next appointment', appointment: null };
    }
  }
};

export default appointmentsService;