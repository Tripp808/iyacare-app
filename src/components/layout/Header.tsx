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
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="motherGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D7D89"/>
                  <stop offset="100%" stopColor="#4AA0AD"/>
                </linearGradient>
                <linearGradient id="childGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F7913D"/>
                  <stop offset="100%" stopColor="#E67C3B"/>
                </linearGradient>
              </defs>
              
              {/* Mother figure - larger, more detailed silhouette */}
              <g fill="url(#motherGradientHeader)">
                {/* Mother's head */}
                <circle cx="15" cy="10" r="3.5"/>
                {/* Mother's body - curved path for more realistic shape */}
                <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
                {/* Mother's arms - embracing gesture */}
                <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
                <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
              </g>
              
              {/* Child figure - smaller, positioned in front/side of mother */}
              <g fill="url(#childGradientHeader)">
                {/* Child's head */}
                <circle cx="25" cy="16" r="2.5"/>
                {/* Child's body */}
                <path d="M25 20c-2.5 0-4.5 2-4.5 6v8c0 0.5 0.3 1 1 1h7c0.7 0 1-0.5 1-1v-8c0-4-2-6-4.5-6z"/>
              </g>
              
              {/* Heart symbol connecting them */}
              <path 
                d="M18 12c-0.8-1.2-2.5-1.2-2.5 0.8c0 1.8 2.5 4 2.5 4s2.5-2.2 2.5-4c0-2-1.7-2-2.5-0.8z" 
                fill="#ffffff" 
                opacity="0.9"
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