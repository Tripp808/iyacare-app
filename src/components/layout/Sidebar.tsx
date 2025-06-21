'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  GitMerge, 
  Settings, 
  Menu,
  X,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignOutForm } from '@/components/SignOutForm';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check if we're on the auth pages - moved after all hooks
  const isAuthPage = pathname?.includes('/auth') || pathname === '/';

  if (isAuthPage) {
    return null;
  }
  
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link href={href} onClick={() => setIsOpen(false)}>
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
          pathname === href ? 'bg-accent text-primary' : 'text-gray-600'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed left-4 top-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 mb-8 pt-4">
            <Link href="/dashboard" className="flex items-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main circle background with clean gradient */}
                <circle cx="20" cy="20" r="19" fill="url(#mainGradientSidebar)"/>
                
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="mainGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2D7D89"/>
                    <stop offset="100%" stopColor="#1F5F68"/>
                  </linearGradient>
                  <linearGradient id="heartGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  fill="url(#heartGradientSidebar)"
                />
              </svg>
              <span className="text-xl font-bold">
                <span className="text-[#2D7D89]">Iyà</span>
                <span className="text-[#F7913D]">Care</span>
              </span>
            </Link>
          </div>

          <nav className="space-y-1 mb-8">
            <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/patients" icon={Users} label="Patients" />
            <NavItem href="/appointments" icon={Calendar} label="Appointments" />
            <NavItem href="/analytics" icon={BarChart3} label="Analytics" />
            <NavItem href="/alerts" icon={Bell} label="Alerts" />
            <NavItem href="/referrals" icon={GitMerge} label="Referrals" />
            <NavItem href="/reports" icon={FileText} label="Reports" />
          </nav>

          <div className="mt-auto space-y-1">
            <NavItem href="/settings" icon={Settings} label="Settings" />
            <SignOutForm />
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 