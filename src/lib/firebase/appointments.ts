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
  cancellationReason?: string;
  cancelledAt?: Timestamp;
  rescheduleReason?: string;
  rescheduledAt?: Timestamp;
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
      let appointments: Appointment[] = [];
      
      try {
        // Try the simplified query first
        const q = query(
          collection(db, APPOINTMENTS_COLLECTION),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          appointments.push({
            id: doc.id,
            ...doc.data() as Omit<Appointment, 'id'>
          });
        });
      } catch (queryError) {
        // Fallback to simple collection query without ordering
        console.log('OrderBy query failed, using simple collection query:', queryError);
        
        const querySnapshot = await getDocs(collection(db, APPOINTMENTS_COLLECTION));
        
        querySnapshot.forEach((doc) => {
          appointments.push({
            id: doc.id,
            ...doc.data() as Omit<Appointment, 'id'>
          });
        });
      }

      // Sort by time in JavaScript after fetching
      appointments.sort((a, b) => {
        // First sort by date (desc), then by time (asc)
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
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

  // Cancel appointment (updates status instead of deleting)
  async cancelAppointment(id: string, reason?: string) {
    try {
      const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, id);
      const updateData: any = {
        status: 'cancelled' as const,
        updatedAt: serverTimestamp()
      };

      if (reason) {
        updateData.cancellationReason = reason;
        updateData.cancelledAt = serverTimestamp();
      }

      await updateDoc(appointmentRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return { success: false, error: 'Failed to cancel appointment' };
    }
  },

  // Reschedule appointment
  async rescheduleAppointment(id: string, newDate: string, newTime: string, reason?: string) {
    try {
      const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, id);
      const updateData: any = {
        date: newDate,
        time: newTime,
        status: 'scheduled' as const,
        updatedAt: serverTimestamp()
      };

      if (reason) {
        updateData.rescheduleReason = reason;
        updateData.rescheduledAt = serverTimestamp();
      }

      await updateDoc(appointmentRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return { success: false, error: 'Failed to reschedule appointment' };
    }
  },

  // Get next appointment for a patient
  async getNextAppointment(patientId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      let appointments: Appointment[] = [];
      
      try {
        // Try the simplified query first
        const q = query(
          collection(db, APPOINTMENTS_COLLECTION),
          where('patientId', '==', patientId),
          where('date', '>=', today),
          where('status', 'in', ['scheduled', 'confirmed'])
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          appointments.push({
            id: doc.id,
            ...doc.data() as Omit<Appointment, 'id'>
          });
        });
      } catch (queryError) {
        // Fallback to simple collection query and filter in JavaScript
        console.log('Complex query failed, using simple collection query:', queryError);
        
        const querySnapshot = await getDocs(collection(db, APPOINTMENTS_COLLECTION));
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Appointment, 'id'>;
          // Filter in JavaScript
          if (
            data.patientId === patientId &&
            data.date >= today &&
            (data.status === 'scheduled' || data.status === 'confirmed')
          ) {
            appointments.push({
              id: doc.id,
              ...data
            });
          }
        });
      }

      // Sort in JavaScript to find the next appointment
      appointments.sort((a, b) => {
        // Sort by date (asc), then by time (asc)
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });
      
      // Return the first (earliest) appointment
      const nextAppointment = appointments.length > 0 ? appointments[0] : null;
      
      return { success: true, appointment: nextAppointment };
    } catch (error) {
      console.error('Error fetching next appointment:', error);
      return { success: false, error: 'Failed to fetch next appointment', appointment: null };
    }
  }
};

export default appointmentsService;