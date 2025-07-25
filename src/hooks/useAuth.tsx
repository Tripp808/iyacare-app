"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user.service';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await UserService.getUser(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    try {
      // Step 1: Create user with email and password
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Step 2: Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });
      
      // Step 3: Create user document in Firestore first (before email verification)
      await UserService.createUser(firebaseUser.uid, {
        ...userData,
        email: firebaseUser.email!,
        verified: false
      });
      
      // Step 4: Send email verification (with production domain support)
      try {
        // Use environment-specific URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const verificationUrl = `${baseUrl}/auth/login`;
        
        await sendEmailVerification(firebaseUser, {
          url: verificationUrl,
          handleCodeInApp: false
        });
        
        console.log('Verification email sent successfully to:', userData.email);
      } catch (emailError: any) {
        // Log detailed error for debugging
        console.error('Email verification failed:', emailError);
        console.error('Error code:', emailError.code);
        console.error('Error message:', emailError.message);
        
        // Check for specific Firebase errors
        if (emailError.code === 'auth/unauthorized-domain') {
          console.error('Domain not authorized in Firebase Console. Please add your domain to authorized domains.');
        }
        
        // Don't fail the entire registration
        console.warn('Email verification failed to send, but user account was created successfully');
      }
      
      // Success - reset loading state
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      // Use environment-specific URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const verificationUrl = `${baseUrl}/auth/login`;
      
      await sendEmailVerification(firebaseUser, {
        url: verificationUrl,
        handleCodeInApp: false
      });
      
      console.log('Verification email resent successfully');
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      // Throw a more user-friendly error
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification emails sent. Please wait before requesting another.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Domain not authorized. Please contact support.');
      } else {
        throw new Error('Failed to send verification email. Please try again later.');
      }
    }
  };

  const refreshUserData = async () => {
    if (!firebaseUser) return;
    
    try {
      const userData = await UserService.getUser(firebaseUser.uid);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 