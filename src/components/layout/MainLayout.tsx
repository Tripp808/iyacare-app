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
  const showCleanLayout = pathname === '/' || pathname?.includes('/auth');

  const checkAuth = () => {
    const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/contact', '/about', '/privacy', '/terms'];
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      window.location.href = '/auth/login';
    }
  };

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
    checkAuth();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, pathname]);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
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
                      <Button variant="ghost" size="icon" className="rounded-full border-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                      <div className="px-7 py-4">
                        <Link href="/" className="flex items-center">
                          <div>
                            <svg width="40" height="40" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Circle head */}
                              <circle cx="150" cy="90" r="40" fill="#2D7D89" />
                              
                              {/* Heart shape */}
                              <path 
                                d="M150 140C180 110 220 130 220 170C220 210 150 250 150 250C150 250 80 210 80 170C80 130 120 110 150 140Z" 
                                fill="#2D7D89" 
                              />
                              
                              {/* Child figure - circle */}
                              <circle cx="130" cy="180" r="20" fill="#F7913D" />
                              
                              {/* Parent/caregiver figure */}
                              <path 
                                d="M160 160C180 170 200 200 190 240C180 280 150 290 150 290C150 290 170 230 160 200C150 170 160 160 160 160Z" 
                                fill="#F7913D" 
                              />
                            </svg>
                          </div>
                          <span className="ml-2 text-2xl font-bold font-geist">
                            <span className="text-[#2D7D89]">Iyà</span>
                            <span className="text-[#F7913D]">Care</span>
                          </span>
                        </Link>
                      </div>
                      <SidebarNav className="px-2 py-6" />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              
              <Link href="/" className="flex items-center">
                <div>
                  <svg width="40" height="40" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Circle head */}
                    <circle cx="150" cy="90" r="40" fill="#2D7D89" />
                    
                    {/* Heart shape */}
                    <path 
                      d="M150 140C180 110 220 130 220 170C220 210 150 250 150 250C150 250 80 210 80 170C80 130 120 110 150 140Z" 
                      fill="#2D7D89" 
                    />
                    
                    {/* Child figure - circle */}
                    <circle cx="130" cy="180" r="20" fill="#F7913D" />
                    
                    {/* Parent/caregiver figure */}
                    <path 
                      d="M160 160C180 170 200 200 190 240C180 280 150 290 150 290C150 290 170 230 160 200C150 170 160 160 160 160Z" 
                      fill="#F7913D" 
                    />
                  </svg>
                </div>
                <span className="ml-2 text-2xl font-bold font-geist">
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
                          <Link href="/vitals" className="flex w-full">Vital Signs</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Link href="/alerts" className="flex w-full">Alerts System</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link 
                      href="/contact" 
                      className={`transition-colors hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] ${
                        pathname === '/contact' ? 'text-[#2D7D89] dark:text-[#4AA0AD]' : 'text-foreground'
                      }`}
                    >
                      Contact
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
                        <User className="h-5 w-5" />
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
          <aside className="hidden bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex-1 overflow-auto py-2">
                <SidebarNav className="px-2 py-2" />
              </div>
            </div>
          </aside>
        )}
        <main className={`flex-1 overflow-auto p-4 md:p-6 pt-2 bg-background ${isAuthenticated && !showCleanLayout ? '' : 'min-h-[calc(100vh-112px)]'}`}>
          <div className="container mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 