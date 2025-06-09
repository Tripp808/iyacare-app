import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  userData: {
    name: string;
    role: string;
    facility?: string;
    specialization?: string;
  }
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      role: userData.role,
      facility: userData.facility || '',
      specialization: userData.specialization || '',
      profilePicture: '',
      phone: '',
      address: '',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to register user'
    };
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to sign in'
    };
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    console.log('Attempting to sign out user...');
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error during sign out:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out'
    };
  }
};

// Direct sign out with hard redirect - more reliable
export const signOutAndRedirect = async () => {
  try {
    console.log('Attempting to sign out and redirect...');
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    window.location.href = '/auth/login';
    return { success: true };
  } catch (error: any) {
    console.error('Error during sign out and redirect:', error);
    // Even if there's an error, try to redirect
    window.location.href = '/auth/login';
    return { 
      success: false, 
      error: error.message || 'Failed to sign out'
    };
  }
};

// Get the current auth state
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}; 