'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Megaphone, 
  Play,
  Pause,
  Users,
  Calendar,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Send,
  Zap
} from 'lucide-react';
import { SMSCampaign, SMSTemplate } from '@/types';
import { SMSService } from '@/services/sms.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SMSCampaignsTabProps {
  campaigns: SMSCampaign[];
  templates: SMSTemplate[];
  searchTerm: string;
  onRefresh: () => void;
  isConfigured?: boolean;
}

const SMSCampaignsTab: React.FC<SMSCampaignsTabProps> = ({ 
  campaigns, 
  templates, 
  searchTerm, 
  onRefresh,
  isConfigured = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    templateId: '',
    targetCriteria: {
      ageRange: { min: '', max: '' },
      conditions: [] as string[],
      lastVisit: '',
      tags: [] as string[]
    },
    scheduledDate: '',
    endDate: '',
    frequency: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    maxRecipients: ''
  });

  const resetForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      templateId: '',
      targetCriteria: {
        ageRange: { min: '', max: '' },
        conditions: [],
        lastVisit: '',
        tags: []
      },
      scheduledDate: '',
      endDate: '',
      frequency: 'once',
      maxRecipients: ''
    });
  };

  const handleCreateCampaign = async () => {
    if (!isConfigured) {
      toast.error('Please configure Twilio first to create campaigns');
      return;
    }
    
    if (!campaignForm.name.trim() || !campaignForm.templateId) {
      toast.error('Please enter campaign name and select a template.');
      return;
    }

    setLoading(true);
    try {
      const template = templates.find(t => t.id === campaignForm.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const campaignData = {
        name: campaignForm.name.trim(),
        description: campaignForm.description.trim(),
        templateId: campaignForm.templateId,
        templateName: template.name,
        targetCriteria: campaignForm.targetCriteria,
        scheduledDate: new Date(campaignForm.scheduledDate),
        endDate: campaignForm.endDate ? new Date(campaignForm.endDate) : undefined,
        frequency: campaignForm.frequency,
        maxRecipients: campaignForm.maxRecipients ? parseInt(campaignForm.maxRecipients) : undefined,
        status: 'draft' as const,
        isActive: true,
        createdBy: 'current-user-id',
        totalRecipients: 0
      };

      const result = await SMSService.createCampaign(campaignData);
      
      if (result.success) {
        toast.success('Campaign created successfully!');
        setShowCampaignDialog(false);
        resetForm();
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCampaignStatus = async (campaignId: string, status: SMSCampaign['status']) => {
    setLoading(true);
    try {
      const result = await SMSService.updateCampaign(campaignId, { status });
      
      if (result.success) {
        toast.success(`Campaign ${status === 'active' ? 'started' : status === 'paused' ? 'paused' : 'stopped'} successfully!`);
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SMSCampaign['status']) => {
    const variants = {
      draft: { variant: 'outline' as const, icon: Edit, color: 'text-gray-600' },
      active: { variant: 'default' as const, icon: Play, color: 'text-green-600' },
      paused: { variant: 'secondary' as const, icon: Pause, color: 'text-yellow-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
      stopped: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      scheduled: { variant: 'outline' as const, icon: Clock, color: 'text-blue-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getFrequencyBadge = (frequency: SMSCampaign['frequency']) => {
    const variants: Record<SMSCampaign['frequency'], string> = {
      once: 'bg-blue-100 text-blue-800',
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-yellow-100 text-yellow-800',
      monthly: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={variants[frequency]}>
        {frequency}
      </Badge>
    );
  };

  const calculateProgress = (campaign: SMSCampaign) => {
    const total = campaign.sentCount + campaign.deliveredCount + campaign.failedCount;
    if (total === 0) return 0;
    return Math.round((campaign.deliveredCount / total) * 100);
  };

  // Filter campaigns based on search term and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Dialog open={showCampaignDialog} onOpenChange={(open) => {
            setShowCampaignDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New SMS Campaign</DialogTitle>
                <DialogDescription>
                  Set up a bulk SMS campaign to reach multiple patients with targeted messaging.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Campaign Name *
                  </Label>
                  <Input
                    id="name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="e.g., Monthly Health Check Reminders"
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3 min-h-[60px]"
                    placeholder="Brief description of the campaign purpose"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template" className="text-right">
                    Template *
                  </Label>
                  <Select value={campaignForm.templateId} onValueChange={(value) => 
                    setCampaignForm(prev => ({ ...prev, templateId: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.isActive).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Target Criteria
                  </Label>
                  <div className="col-span-3 space-y-3 p-3 border rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Min Age</Label>
                        <Input
                          type="number"
                          value={campaignForm.targetCriteria.ageRange.min}
                          onChange={(e) => setCampaignForm(prev => ({
                            ...prev,
                            targetCriteria: {
                              ...prev.targetCriteria,
                              ageRange: { ...prev.targetCriteria.ageRange, min: e.target.value }
                            }
                          }))}
                          placeholder="18"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Age</Label>
                        <Input
                          type="number"
                          value={campaignForm.targetCriteria.ageRange.max}
                          onChange={(e) => setCampaignForm(prev => ({
                            ...prev,
                            targetCriteria: {
                              ...prev.targetCriteria,
                              ageRange: { ...prev.targetCriteria.ageRange, max: e.target.value }
                            }
                          }))}
                          placeholder="65"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Last Visit (within days)</Label>
                      <Input
                        type="number"
                        value={campaignForm.targetCriteria.lastVisit}
                        onChange={(e) => setCampaignForm(prev => ({
                          ...prev,
                          targetCriteria: { ...prev.targetCriteria, lastVisit: e.target.value }
                        }))}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduled" className="text-right">
                    Start Date *
                  </Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={campaignForm.scheduledDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">
                    Frequency
                  </Label>
                  <Select value={campaignForm.frequency} onValueChange={(value: any) => 
                    setCampaignForm(prev => ({ ...prev, frequency: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {campaignForm.frequency !== 'once' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={campaignForm.endDate}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxRecipients" className="text-right">
                    Max Recipients
                  </Label>
                  <Input
                    id="maxRecipients"
                    type="number"
                    value={campaignForm.maxRecipients}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, maxRecipients: e.target.value }))}
                    className="col-span-3"
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SMS Campaigns
              </CardTitle>
              <CardDescription>
                Create and manage bulk SMS campaigns
                {!isConfigured && (
                  <span className="text-amber-600 dark:text-amber-400 block">
                    (Twilio configuration required)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCampaignDialog(true)}
              disabled={!isConfigured}
              title={!isConfigured ? 'Configure Twilio to enable campaigns' : undefined}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No campaigns found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first campaign.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow 
                      key={campaign.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground">{campaign.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.templateName}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(campaign.status)}
                      </TableCell>
                      <TableCell>
                        {getFrequencyBadge(campaign.frequency)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Send className="h-3 w-3" />
                            <span>{campaign.sentCount} sent</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{campaign.deliveredCount} delivered</span>
                          </div>
                          {campaign.failedCount > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span>{campaign.failedCount} failed</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>
                          <div>Start: {format(new Date(campaign.scheduledDate), 'MMM d, yyyy HH:mm')}</div>
                          {campaign.endDate && (
                            <div>End: {format(new Date(campaign.endDate), 'MMM d, yyyy HH:mm')}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCampaignStatus(campaign.id, 'active');
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {campaign.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCampaignStatus(campaign.id, 'paused');
                              }}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCampaignStatus(campaign.id, 'active');
                              }}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(campaign);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
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

      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedCampaign.name}</DialogTitle>
              <DialogDescription>
                Campaign details and statistics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Frequency</Label>
                  <div className="mt-1">{getFrequencyBadge(selectedCampaign.frequency)}</div>
                </div>
              </div>

              {selectedCampaign.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.description}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Template</Label>
                <div className="mt-1">
                  <Badge variant="outline">{selectedCampaign.templateName}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Scheduled Start</Label>
                  <div className="text-sm">{format(new Date(selectedCampaign.scheduledDate), 'MMM d, yyyy HH:mm')}</div>
                </div>
                {selectedCampaign.endDate && (
                  <div>
                    <Label className="text-sm font-medium">Scheduled End</Label>
                    <div className="text-sm">{format(new Date(selectedCampaign.endDate), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Statistics</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-lg font-semibold">{selectedCampaign.sentCount}</div>
                          <div className="text-xs text-muted-foreground">Messages Sent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-lg font-semibold">{selectedCampaign.deliveredCount}</div>
                          <div className="text-xs text-muted-foreground">Delivered</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="text-lg font-semibold">{selectedCampaign.failedCount}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-lg font-semibold">{selectedCampaign.readCount}</div>
                          <div className="text-xs text-muted-foreground">Read</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {selectedCampaign.targetCriteria && (
                <div>
                  <Label className="text-sm font-medium">Target Criteria</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm space-y-1">
                    {selectedCampaign.targetCriteria.ageRange?.min && selectedCampaign.targetCriteria.ageRange?.max && (
                      <div>Age: {selectedCampaign.targetCriteria.ageRange.min} - {selectedCampaign.targetCriteria.ageRange.max} years</div>
                    )}
                    {selectedCampaign.targetCriteria.lastVisit && (
                      <div>Last visit within: {selectedCampaign.targetCriteria.lastVisit} days</div>
                    )}
                    {(!selectedCampaign.targetCriteria.ageRange?.min && !selectedCampaign.targetCriteria.lastVisit) && (
                      <div className="text-muted-foreground">All patients</div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div>{format(new Date(selectedCampaign.createdAt), 'MMM d, yyyy')}</div>
                </div>
                {selectedCampaign.lastRunAt && (
                  <div>
                    <Label className="text-sm font-medium">Last Run</Label>
                    <div>{format(new Date(selectedCampaign.lastRunAt), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                Close
              </Button>
              {selectedCampaign.status === 'draft' && (
                <Button onClick={() => {
                  handleUpdateCampaignStatus(selectedCampaign.id, 'active');
                  setSelectedCampaign(null);
                }}>
                  Start Campaign
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SMSCampaignsTab; 