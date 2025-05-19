'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut, signOutAndRedirect } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    
    try {
      // Use the direct sign-out function with redirect
      console.log("Using signOutAndRedirect...");
      signOutAndRedirect();
      // No need to do anything else as the redirect is handled in the function
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Fallback methods if the main approach fails
      try {
        await signOut();
        window.location.href = '/auth/login';
      } catch (e) {
        console.error('Fallback error:', e);
        // Last resort
        window.location.href = '/auth/login';
      }
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-600 transition-all hover:text-primary cursor-pointer ${isLoading ? 'opacity-70' : ''}`}
    >
      <LogOut className="h-5 w-5" />
      <span className="text-sm font-medium">
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </span>
    </button>
  );
} 