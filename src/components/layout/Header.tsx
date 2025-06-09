'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Header() {
  const { firebaseUser, user, signOut, loading } = useAuth();
  const [unreadNotifications] = useState(3); // This would come from your notifications service
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to log out');
    }
  };

  const handleClearStorage = () => {
    // For debugging purposes - clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    toast.success('Browser storage cleared. Please refresh the page.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Check if we're on the auth pages - moved after all hooks
  const isAuthPage = pathname?.includes('/auth') || pathname === '/';

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
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
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            href="/vitals"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/vitals' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Vital Signs
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
            href="/analytics"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/analytics' ? 'text-primary' : 'text-gray-600'
            }`}
          >
            Analytics
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
            {firebaseUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={firebaseUser.photoURL || ""} alt={user?.name || firebaseUser.displayName || "User"} />
                      <AvatarFallback className="bg-primary text-white">
                        {(user?.name || firebaseUser.displayName || firebaseUser.email)?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || firebaseUser.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {firebaseUser.email}
                    </p>
                    {!firebaseUser.emailVerified && (
                      <p className="text-xs text-yellow-600">Email not verified</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {process.env.NODE_ENV === 'development' && (
                    <DropdownMenuItem onClick={handleClearStorage} className="cursor-pointer text-yellow-600">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Clear Storage (Debug)</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" disabled={loading}>
                  {loading ? 'Loading...' : 'Sign in'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 