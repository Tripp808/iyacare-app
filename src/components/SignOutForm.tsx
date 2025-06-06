'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export function SignOutForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signOut();
    } catch (error) {
      console.error('Error in SignOutForm:', error);
    }
    
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Firebase auth error in SignOutForm:', error);
    }
    
    // Use the form submission to navigate
    (document.getElementById('signout-form') as HTMLFormElement)?.submit();
  };

  return (
    <form 
      id="signout-form" 
      action="/auth/login" 
      method="get"
      onSubmit={handleSignOut}
    >
      <button
        type="submit"
        disabled={isLoading}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-600 transition-all hover:text-primary cursor-pointer ${isLoading ? 'opacity-70' : ''}`}
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </span>
      </button>
    </form>
  );
} 