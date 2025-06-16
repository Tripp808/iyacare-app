'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Users,
  Clock,
  Target,
  MessageSquare
} from 'lucide-react';
import { SMSAnalytics, SMSMessage, SMSTemplate, SMSCampaign } from '@/types';
import { format, subDays, isAfter, isBefore } from 'date-fns';

interface SMSAnalyticsTabProps {
  analytics: SMSAnalytics;
  messages: SMSMessage[];
  templates: SMSTemplate[];
  campaigns: SMSCampaign[];
}

export default function SMSAnalyticsTab({ analytics, messages, templates, campaigns }: SMSAnalyticsTabProps) {
  
  const quickStats = useMemo(() => [
    {
      label: 'Messages Sent',
      value: analytics.totalSent.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600',
      trend: analytics.totalSent > 1000 ? 'up' : 'down' as 'up' | 'down'
    },
    {
      label: 'Delivery Rate',
      value: `${analytics.deliveryRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      trend: analytics.deliveryRate > 95 ? 'up' : 'down' as 'up' | 'down'
    },
    {
      label: 'Read Rate',
      value: `${analytics.readRate.toFixed(1)}%`,
      icon: Eye,
      color: 'text-purple-600',
      trend: analytics.readRate > 80 ? 'up' : 'down' as 'up' | 'down'
    },
    {
      label: 'Total Cost',
      value: `$${analytics.totalCost?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-orange-600',
      trend: (analytics.averageCostPerMessage || 0) < 0.05 ? 'up' : 'down' as 'up' | 'down'
    }
  ], [analytics]);

  const sevenDaysAgo = subDays(new Date(), 7);
  const recentMessages = useMemo(() => 
    messages
      .filter(message => message.sentAt && isAfter(new Date(message.sentAt), sevenDaysAgo))
      .sort((a, b) => {
        const aTime = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const bTime = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10)
  , [messages]);

  const templatePerformance = useMemo(() => 
    templates.map(template => {
      const templateMessages = messages.filter(msg => msg.templateId === template.id);
      const deliveredCount = templateMessages.filter(msg => msg.status === 'delivered').length;
      const readCount = templateMessages.filter(msg => msg.status === 'read').length;
      const deliveryRate = templateMessages.length > 0 ? (deliveredCount / templateMessages.length) * 100 : 0;
      const readRate = templateMessages.length > 0 ? (readCount / templateMessages.length) * 100 : 0;
      
      return {
        id: template.id,
        name: template.name,
        sent: templateMessages.length,
        delivered: deliveredCount,
        read: readCount,
        deliveryRate,
        readRate,
        lastUsed: templateMessages.length > 0 
          ? Math.max(...templateMessages.map(msg => msg.sentAt ? new Date(msg.sentAt).getTime() : 0))
          : 0
      };
    })
    .sort((a, b) => b.deliveryRate - a.deliveryRate)
    .slice(0, 5)
  , [templates, messages]);

  const campaignPerformance = useMemo(() => {
    return campaigns
      .sort((a, b) => (b.sentCount + b.deliveredCount) - (a.sentCount + a.deliveredCount))
      .slice(0, 5);
  }, [campaigns]);

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: 'outline' as const, color: 'text-blue-600' },
      delivered: { variant: 'default' as const, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, color: 'text-red-600' },
      read: { variant: 'secondary' as const, color: 'text-purple-600' },
      pending: { variant: 'outline' as const, color: 'text-yellow-600' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const getMessageTypeBadge = (type: string) => {
    const variants = {
      reminder: 'bg-blue-100 text-blue-800',
      appointment: 'bg-green-100 text-green-800',
      health_tip: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
      follow_up: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[type as keyof typeof variants] || variants.general}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend as 'up' | 'down');
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendIcon 
                    className={`h-4 w-4 mr-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} 
                  />
                  <span className={`text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? 'Good' : 'Needs attention'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Most recent SMS messages sent to patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No recent messages</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No messages have been sent in the last 7 days.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.patientName}</span>
                        {getMessageTypeBadge(message.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {message.content.length > 60 
                          ? `${message.content.substring(0, 60)}...` 
                          : message.content
                        }
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{message.sentAt ? format(new Date(message.sentAt), 'MMM d, HH:mm') : 'N/A'}</span>
                        {message.priority !== 'normal' && (
                          <Badge variant="outline" className="text-xs">
                            {message.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      {getStatusBadge(message.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Performing Templates
            </CardTitle>
            <CardDescription>
              Templates with the highest usage and delivery rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templatePerformance.length === 0 ? (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No template data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No templates have been used yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Read Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templatePerformance.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{stat.name}</div>
                            <Badge className="mt-1 text-xs">
                              {stat.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{stat.sent}</div>
                          <div className="text-xs text-muted-foreground">messages</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {stat.deliveryRate.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {stat.readRate.toFixed(1)}%
                          </div>
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

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
          <CardDescription>
            Overview of SMS campaign effectiveness and reach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignPerformance.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No campaign data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No campaigns have been created yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages Sent</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignPerformance.map((campaign) => {
                    const total = campaign.sentCount + campaign.deliveredCount + campaign.failedCount;
                    const successRate = total > 0 ? ((campaign.deliveredCount / total) * 100) : 0;
                    
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            {campaign.description && (
                              <div className="text-sm text-muted-foreground">
                                {campaign.description.length > 40 
                                  ? `${campaign.description.substring(0, 40)}...` 
                                  : campaign.description
                                }
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              campaign.status === 'active' ? 'default' :
                              campaign.status === 'completed' ? 'secondary' :
                              campaign.status === 'paused' ? 'outline' : 'destructive'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{campaign.sentCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-green-600">
                            {campaign.deliveredCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-red-600">
                            {campaign.failedCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm font-medium ${
                            successRate >= 90 ? 'text-green-600' :
                            successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {successRate.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {campaign.lastRunAt 
                            ? format(new Date(campaign.lastRunAt), 'MMM d, yyyy')
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Cost per Message</p>
                <p className="text-xl font-bold">${analytics.averageCostPerMessage?.toFixed(4) || '0.0000'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost per Patient Reached</p>
                <p className="text-xl font-bold">
                  ${(analytics.totalPatients || 0) > 0
                    ? ((analytics.totalCost || 0) / (analytics.totalPatients || 1)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Messages This Period</p>
                <p className="text-xl font-bold">{analytics.totalSent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.dateRange.start ? format(new Date(analytics.dateRange.start), 'MMM d, yyyy') : 'N/A'} - {analytics.dateRange.end ? format(new Date(analytics.dateRange.end), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 