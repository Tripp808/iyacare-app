import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export class UserService {
  static async createUser(userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const userDocData = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false
      };

      await setDoc(doc(db, 'users', userId), userDocData);
      return { ...userDocData, id: userId } as User;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      return { ...userDoc.data(), id: userDoc.id } as User;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const docs = querySnapshot.docs;
      
      if (docs.length === 0) return null;
      
      return { ...docs[0].data(), id: docs[0].id } as User;
    } catch (error) {
      console.error('Get user by email error:', error);
      throw error;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as User));
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  static async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as User));
    } catch (error) {
      console.error('Get users by role error:', error);
      throw error;
    }
  }
} 