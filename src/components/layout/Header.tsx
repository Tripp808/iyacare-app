'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Simulate having unread notifications
    setUnreadNotifications(3);

    return () => unsubscribe();
  }, []);

  // Check if we're on the auth pages
  const isAuthPage = pathname?.includes('/auth') || pathname === '/';

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
            >
              {/* Use a placeholder svg for now - we'll replace with the actual logo */}
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold text-primary">IyaCare</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/dashboard' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/patients"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/patients' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Patients
          </Link>
          <Link
            href="/alerts"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/alerts' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Alerts
          </Link>
          <Link
            href="/referrals"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/referrals' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Referrals
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/alerts" className="relative">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-primary text-white">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 