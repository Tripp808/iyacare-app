'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Bell, AlertCircle, Calendar, CheckCheck, Eye, AlertTriangle, User } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { HighRiskNotificationService } from '@/services/high-risk-notification.service';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [highRiskPatients, setHighRiskPatients] = useState<Array<{
    id: string;
    name: string;
    riskLevel: string;
    description: string;
  }>>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger

  // Use useMemo to calculate total notification count to ensure consistency
  const totalNotificationCount = useMemo(() => {
    const total = highRiskCount + unreadCount;
    console.log('NotificationDropdown: Total count calculated:', {
      highRiskCount,
      unreadCount,
      total,
      refreshKey
    });
    return total;
  }, [highRiskCount, unreadCount, refreshKey]);

  // Fetch high-risk patients
  useEffect(() => {
    const fetchHighRiskPatients = async () => {
      try {
        const patients = await HighRiskNotificationService.getHighRiskPatientsForDisplay();
        const count = await HighRiskNotificationService.getHighRiskPatientCount();
        
        console.log('NotificationDropdown: Fetched high-risk data:', {
          patients: patients.length,
          count,
          unreadCount,
          refreshKey
        });
        
        setHighRiskPatients(patients);
        setHighRiskCount(count);
      } catch (error) {
        console.error('Error fetching high-risk patients:', error);
      }
    };

    fetchHighRiskPatients();
    
    // Refresh high-risk patients every 30 seconds
    const interval = setInterval(fetchHighRiskPatients, 30000);
    return () => clearInterval(interval);
  }, [unreadCount, refreshKey]); // Add refreshKey dependency to force refresh

  // Refresh high-risk patients when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const fetchLatestData = async () => {
        try {
          // Refresh regular notifications
          await refreshNotifications();
          
          // Refresh high-risk patients
          const patients = await HighRiskNotificationService.getHighRiskPatientsForDisplay();
          const count = await HighRiskNotificationService.getHighRiskPatientCount();
          setHighRiskPatients(patients);
          setHighRiskCount(count);
          
          // Force a refresh key update to ensure consistency
          setRefreshKey(prev => prev + 1);
        } catch (error) {
          console.error('Error refreshing notification data:', error);
        }
      };
      fetchLatestData();
    }
  }, [isOpen, refreshNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      console.log('NotificationDropdown: Marking notification as read:', notificationId);
      
      await markAsRead(notificationId);
      
      // Increment refresh key to force refresh of all notification data
      setRefreshKey(prev => prev + 1);
      
      // Force refresh both regular notifications and high-risk patients
      await refreshNotifications();
      
      // Refresh high-risk patients after marking as read to update counts
      const patients = await HighRiskNotificationService.getHighRiskPatientsForDisplay();
      const count = await HighRiskNotificationService.getHighRiskPatientCount();
      
      console.log('NotificationDropdown: After marking as read:', {
        patients: patients.length,
        count,
        unreadCount,
        refreshKey
      });
      
      setHighRiskPatients(patients);
      setHighRiskCount(count);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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

  // Total notification count includes high-risk patients and regular notifications
  // const totalNotificationCount = highRiskCount + unreadCount; // This line is now redundant due to useMemo

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-[#2D7D89]/10 dark:hover:bg-[#4AA0AD]/10"
        >
          <Bell className="h-5 w-5" />
          {totalNotificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#F7913D] text-white text-xs">
              {totalNotificationCount > 99 ? '99+' : totalNotificationCount}
            </Badge>
          )}
          <span className="sr-only">
            {totalNotificationCount > 0 ? `${totalNotificationCount} notifications` : 'Notifications'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <DropdownMenuLabel className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          {totalNotificationCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-[#F7913D] text-white">
              {totalNotificationCount} total
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* High-Risk Patients Section */}
        {highRiskCount > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High Risk Patients ({highRiskCount})
              </div>
            </DropdownMenuLabel>
            
            {highRiskPatients.slice(0, 3).map((patient) => (
              <DropdownMenuItem 
                key={patient.id} 
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 border-b border-red-100 dark:border-red-800/50"
                asChild
              >
                <Link href={`/patients/${patient.id}`} onClick={() => setIsOpen(false)}>
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                        {patient.name}
                      </p>
                      <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                        HIGH RISK
                      </Badge>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">
                      {patient.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Click to view patient details
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}

            {highRiskCount > 3 && (
              <DropdownMenuItem asChild>
                <Link 
                  href="/patients?risk=high" 
                  className="text-center text-sm text-red-600 hover:text-red-700 cursor-pointer py-2"
                  onClick={() => setIsOpen(false)}
                >
                  View all {highRiskCount} high-risk patients
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
          </>
        )}

        {/* Regular Notifications Section */}
        {notifications.length === 0 && highRiskCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCheck className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">All patients are monitored</p>
          </div>
        ) : (
          <>
            {notifications.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs font-medium text-gray-600 dark:text-gray-400 py-2">
                  System Notifications ({unreadCount})
                </DropdownMenuLabel>
                
                {notifications.slice(0, 4).map((notification) => (
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
                
                {notifications.length > 4 && (
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