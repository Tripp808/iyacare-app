'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, AlertCircle, Calendar, CheckCheck, Eye } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'appointment': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'medication': return <Bell className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } else if (timestamp instanceof Date) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    }
    return 'Recently';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-[#2D7D89]/10 dark:hover:bg-[#4AA0AD]/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#F7913D] text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} notifications` : 'Notifications'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuLabel className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-[#F7913D] text-white">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCheck className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => handleMarkAsRead(notification.id!)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {notification.patientName}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAlertBadgeColor(notification.priority)}`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id!);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
            
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    href="/alerts" 
                    className="text-center text-sm text-[#2D7D89] hover:text-[#236570] cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    View all notifications ({notifications.length})
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem asChild>
          <Link 
            href="/alerts" 
            className="text-center text-sm cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] hover:bg-gray-50 dark:hover:bg-gray-800 py-2"
            onClick={() => setIsOpen(false)}
          >
            Go to Alert Center
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 