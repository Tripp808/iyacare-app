'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  Search, 
  Bell, 
  Calendar,
  Check,
  X,
  Filter,
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react';
import { getAlerts } from '@/lib/firebase/alerts';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Alert } from '@/lib/firebase/alerts';
import { toast } from 'sonner';

export default function AlertsPage() {
  const { refreshNotifications, markAsRead } = useNotifications();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  // Fetch alerts function
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const includeRead = filter === 'all';
      const result = await getAlerts(includeRead);
      
      if (result.success) {
        setAlerts(result.alerts || []);
      } else {
        console.error('Failed to fetch alerts:', result.error);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts on component mount and filter change
  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Filter alerts by search term
  const filteredAlerts = alerts.filter(alert => {
    const searchFields = `${alert.patientName} ${alert.message} ${alert.type}`.toLowerCase();
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Mark an alert as read
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId);
      
      // Update local state to reflect the change
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
      
      // Refresh notifications in the header
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Get badge color for alert priority
  const getAlertBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get icon color for alert type
  const getAlertIconColor = (type: string) => {
    switch (type) {
      case 'risk': return 'text-red-500';
      case 'appointment': return 'text-blue-500';
      case 'medication': return 'text-purple-500';
      case 'system': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertCircle className={`h-5 w-5 ${getAlertIconColor(type)}`} />;
      case 'appointment': return <Calendar className={`h-5 w-5 ${getAlertIconColor(type)}`} />;
      case 'medication': return <Bell className={`h-5 w-5 ${getAlertIconColor(type)}`} />;
      case 'system': 
      default: return <Bell className={`h-5 w-5 ${getAlertIconColor(type)}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage patient alerts in real-time
          </p>
        </div>
        <Button 
          onClick={() => {
            /* Create new alert functionality would go here */
            toast.info('Alert creation feature coming soon!');
          }}
          className="bg-[#2D7D89] hover:bg-[#236570] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' 
              ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' 
              : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'
            }
          >
            All Alerts
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className={filter === 'unread' 
              ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' 
              : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'
            }
          >
            Unread Only
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2"></div>
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-t-4 border-t-[#2D7D89]">
        <CardHeader className="pb-3">
          <CardTitle>Alert Management</CardTitle>
          <CardDescription>View and manage all alerts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">No Alerts Found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {filter === 'unread' 
                  ? 'There are no unread alerts in the system.'
                  : searchTerm 
                      ? 'No alerts match your search criteria.' 
                      : 'There are no alerts in the system.'}
              </p>
              {filter === 'unread' && (
                <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                  View All Alerts
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.read ? 'bg-gray-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getAlertIcon(alert.type)}
                          <span className="ml-2 text-xs uppercase">
                            {alert.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/patients/${alert.patientId}`} 
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {alert.patientName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate">
                          {alert.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAlertBadgeColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(alert.createdAt)}
                      </TableCell>
                      <TableCell>
                        {!alert.read ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id!)}
                            disabled={alert.read}
                            className="border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">Read</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 