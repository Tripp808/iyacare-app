'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireEmailVerification = false,
  redirectTo = '/auth/login',
  loadingComponent 
}: ProtectedRouteProps) {
  const { firebaseUser, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasRedirected) {
      // Check if authentication is required and user is not authenticated
      if (requireAuth && !firebaseUser) {
        console.log('Redirecting unauthenticated user to login');
        setHasRedirected(true);
        router.push(redirectTo);
        return;
      }

      // Check if email verification is required
      if (requireAuth && firebaseUser && requireEmailVerification && !firebaseUser.emailVerified) {
        console.log('Redirecting unverified user to login');
        setHasRedirected(true);
        router.push('/auth/login?message=verify-email');
        return;
      }

      // All checks passed
      setIsChecking(false);
    }
  }, [authLoading, firebaseUser, user, requireAuth, requireEmailVerification, redirectTo, router, hasRedirected]);

  // Show loading while checking authentication
  if (authLoading || isChecking) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto"></div>
          <span className="mt-3 block">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Don't render if auth check failed
  if (requireAuth && !firebaseUser) {
    return null;
  }

  // Don't render if email verification is required but user is not verified
  if (requireAuth && firebaseUser && requireEmailVerification && !firebaseUser.emailVerified) {
    return null;
  }

  return <>{children}</>;
} 