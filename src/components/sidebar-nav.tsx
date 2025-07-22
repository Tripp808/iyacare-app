'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home as HomeIcon, Users, AlertCircle, Calendar, BarChart3, Settings, Activity, AlertTriangle, MessageSquare, Shield, Mail } from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Vital Signs",
    href: "/vitals",
    icon: Activity,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
  },
  {
    title: "SMS",
    href: "/sms",
    icon: MessageSquare,
  },
  {
    title: "Blockchain",
    href: "/blockchain",
    icon: Shield,
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Contact Support",
    href: "/dashboard/contact",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        
        return (
          <Link
            href={link.href}
            key={link.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-3 transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20 font-semibold shadow-sm"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary font-medium border border-transparent",
              "min-h-[44px] w-full"
            )}
          >
            <LinkIcon className={cn("mr-3 h-5 w-5 flex-shrink-0", 
              isActive ? "text-primary" : "text-gray-600 dark:text-gray-300"
            )} />
            <span className={cn("text-sm", 
              isActive ? "text-primary font-semibold" : "text-gray-700 dark:text-gray-200"
            )}>
              {link.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
} 