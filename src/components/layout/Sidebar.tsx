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
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="motherGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2D7D89"/>
                    <stop offset="100%" stopColor="#4AA0AD"/>
                  </linearGradient>
                  <linearGradient id="childGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F7913D"/>
                    <stop offset="100%" stopColor="#E67C3B"/>
                  </linearGradient>
                </defs>
                
                {/* Mother figure - larger, more detailed silhouette */}
                <g fill="url(#motherGradientSidebar)">
                  {/* Mother's head */}
                  <circle cx="15" cy="10" r="3.5"/>
                  {/* Mother's body - curved path for more realistic shape */}
                  <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
                  {/* Mother's arms - embracing gesture */}
                  <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
                  <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
                </g>
                
                {/* Child figure - smaller, positioned in front/side of mother */}
                <g fill="url(#childGradientSidebar)">
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