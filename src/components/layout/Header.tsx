'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from 'lucide-react';
import { auth } from '@/lib/firebase';
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
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main circle background with clean gradient */}
              <circle cx="20" cy="20" r="19" fill="url(#mainGradientHeader)"/>
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="mainGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D7D89"/>
                  <stop offset="100%" stopColor="#1F5F68"/>
                </linearGradient>
                <linearGradient id="heartGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B7A"/>
                  <stop offset="100%" stopColor="#E74C3C"/>
                </linearGradient>
              </defs>
              
              {/* Mother figure - clean and simple */}
              <circle cx="14" cy="13" r="3.5" fill="#ffffff"/>
              <ellipse cx="14" cy="20" rx="4" ry="6" fill="#ffffff"/>
              
              {/* Child figure - clean and simple */}
              <circle cx="26" cy="15" r="2.5" fill="#F7913D"/>
              <ellipse cx="26" cy="21" rx="3" ry="4.5" fill="#F7913D"/>
              
              {/* Heart symbol - clean and centered */}
              <path 
                d="M20 18c-1.5-1.8-4-1.8-4 1.2c0 2.8 4 6 4 6s4-3.2 4-6c0-3-2.5-3-4-1.2z" 
                fill="url(#heartGradientHeader)"
              />
            </svg>
            <span className="text-xl font-bold">
              <span className="text-[#2D7D89]">Iyà</span>
              <span className="text-[#F7913D]">Care</span>
            </span>
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