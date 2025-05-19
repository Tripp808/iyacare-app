import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Home as HomeIcon, Users, AlertCircle, Calendar, BarChart3, Settings } from "lucide-react";

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
    title: "Alerts",
    href: "/alerts",
    icon: AlertCircle,
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
    <nav className={cn("flex flex-col space-y-1", className)}>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        
        return (
          <Link
            href={link.href}
            key={link.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isActive
                ? "bg-muted hover:bg-muted text-primary"
                : "hover:bg-transparent hover:text-primary",
              "justify-start h-10"
            )}
          >
            <LinkIcon className={cn("mr-2 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
} 