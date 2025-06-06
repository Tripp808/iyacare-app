import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

export class AuthService {
  static async register(email: string, password: string, name: string, role: User['role'] = 'healthcare_worker') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      return {
        user: firebaseUser,
        userData: { ...userData, id: firebaseUser.uid }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = { ...userDoc.data(), id: firebaseUser.uid } as User;

      return {
        user: firebaseUser,
        userData
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<{ user: FirebaseUser; userData: User } | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;

      const userData = { ...userDoc.data(), id: firebaseUser.uid } as User;

      return {
        user: firebaseUser,
        userData
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
} 