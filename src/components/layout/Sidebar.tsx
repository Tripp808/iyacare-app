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

  // Check if we're on the auth pages
  const isAuthPage = pathname?.includes('/auth') || pathname === '/';

  if (isAuthPage) {
    return null;
  }
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 mb-8 pt-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
            >
              {/* Use a placeholder svg for now - we'll replace with the actual logo */}
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold text-primary">IyaCare</span>
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