'use client';

import { useState, useEffect } from "react";
import { SidebarNav } from "../sidebar-nav";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, ChevronDown, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../mode-toggle";
import { Footer } from "./Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { NotificationDropdown } from '../NotificationDropdown';
import { toast } from 'sonner';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, firebaseUser, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  // Calculate derived state from hooks
  const isAuthPage = pathname?.includes('/auth') || pathname === '/';
  const isAuthenticated = !!firebaseUser;
  const showCleanLayout = pathname === '/' || pathname?.includes('/auth') || pathname === '/contact';

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/patients',
    '/iot-monitoring',
    '/alerts',
    '/analytics',
    '/settings',
    '/appointments',
    '/referrals'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname?.startsWith(route)
  );

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setIsScrolled(scrollPosition > 10);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      // Force redirect even if there's an error
      window.location.href = '/auth/login';
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Authentication check for protected routes
  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      console.log('Unauthorized access attempt to:', pathname);
      window.location.href = '/auth/login';
      return;
    }

    if (isProtectedRoute && firebaseUser && !firebaseUser.emailVerified) {
      console.log('Email not verified, redirecting to login');
      toast.error('Please verify your email address to continue');
      window.location.href = '/auth/login';
      return;
    }
  }, [isProtectedRoute, isAuthenticated, firebaseUser, pathname]);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header 
        className={`sticky top-0 z-50 w-full border-b border-gray-300 dark:border-gray-600 transition-all duration-200 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm' 
            : 'bg-background'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center">
              {isAuthenticated && !showCleanLayout && (
                <div className="md:hidden mr-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-muted"
                      >
                        <Menu className="h-5 w-5 text-foreground" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-md border-r shadow-lg">
                      <div className="px-6 py-4 border-b border-border/50">
                        <Link href="/" className="flex items-center">
                          <div>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Gradient definitions */}
                              <defs>
                                <linearGradient id="motherGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#2D7D89"/>
                                  <stop offset="100%" stopColor="#4AA0AD"/>
                                </linearGradient>
                                <linearGradient id="childGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#F7913D"/>
                                  <stop offset="100%" stopColor="#E67C3B"/>
                                </linearGradient>
                              </defs>
                              
                              {/* Mother figure - larger, more detailed silhouette */}
                              <g fill="url(#motherGradientMobile)">
                                {/* Mother's head */}
                                <circle cx="15" cy="10" r="3.5"/>
                                {/* Mother's body - curved path for more realistic shape */}
                                <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
                                {/* Mother's arms - embracing gesture */}
                                <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
                                <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
                              </g>
                              
                              {/* Child figure - smaller, positioned in front/side of mother */}
                              <g fill="url(#childGradientMobile)">
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
                          </div>
                          <span className="ml-2 text-xl font-bold">
                            <span className="text-[#2D7D89]">Iyà</span>
                            <span className="text-[#F7913D]">Care</span>
                          </span>
                        </Link>
                      </div>
                      <div className="py-6 px-2">
                        <SidebarNav className="px-2" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              
              <Link href="/" className="flex items-center">
                <div>
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
                </div>
                <span className="text-xl font-bold">
                  <span className="text-[#2D7D89]">Iyà</span>
                  <span className="text-[#F7913D]">Care</span>
                </span>
              </Link>
            </div>

            {/* Center - Navigation */}
            <div className="hidden md:flex items-center">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                {isAuthenticated && !showCleanLayout ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] text-foreground outline-none border-0">
                        Features <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href="/dashboard" className="flex w-full">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href="/patients" className="flex w-full">Patient Management</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href="/iot-monitoring" className="flex w-full">🔴 IoT Live Monitoring</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href="/alerts" className="flex w-full">Alerts System</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link 
                      href="/dashboard/contact" 
                      className={`transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] ${
                        pathname === '/dashboard/contact' ? 'text-[#2D7D89] dark:text-[#4AA0AD]' : 'text-foreground'
                      }`}
                    >
                      Contact Support
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/#features" 
                      className="transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] text-foreground"
                    >
                      Features
                    </Link>
                    <Link 
                      href="/#pricing" 
                      className="transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] text-foreground"
                    >
                      Pricing
                    </Link>
                    <Link 
                      href="/contact" 
                      className={`transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] ${
                        pathname === '/contact' ? 'text-[#2D7D89] dark:text-[#4AA0AD]' : 'text-foreground'
                      }`}
                    >
                      Contact
                    </Link>
                  </>
                )}
              </nav>
            </div>
            
            {/* Right side - Theme toggle, notifications, user menu */}
            <div className="flex items-center space-x-3">
              <ModeToggle />
              {isAuthenticated && !showCleanLayout ? (
                <>
                  <NotificationDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full border-0">
                        {user?.profilePicture ? (
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            <img 
                              src={user.profilePicture} 
                              alt={user.name || "User"} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#2D7D89] flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Link href="/settings" className="flex w-full">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Link href="/settings" className="flex w-full">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-500 focus:text-red-500" 
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        {signingOut ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></div>
                            Signing out...
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-[#2D7D89] dark:text-[#4AA0AD] hover:bg-[#2D7D89]/10 dark:hover:bg-[#4AA0AD]/10 border-0">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-10 px-6 font-medium border-0">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className={`flex-1 bg-background ${isAuthenticated && !showCleanLayout ? 'md:grid md:grid-cols-[220px_1fr]' : ''}`}>
        {isAuthenticated && !showCleanLayout && (
          <aside className="hidden bg-gray-50 dark:bg-gray-900 md:block border-r border-gray-300 dark:border-gray-600">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex-1 overflow-auto py-2">
                <SidebarNav className="px-2 py-2" />
              </div>
            </div>
          </aside>
        )}
        <main className={`flex-1 overflow-auto p-4 md:p-6 pt-2 bg-white dark:bg-gray-800 ${isAuthenticated && !showCleanLayout ? '' : 'min-h-[calc(100vh-112px)]'}`}>
          <div className="container mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 