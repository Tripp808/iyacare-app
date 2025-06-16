'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Calendar,
  Phone,
  User,
  FileText
} from 'lucide-react';
import { SMSMessage, SMSTemplate } from '@/types';
import { SMSService } from '@/services/sms.service';
import { PatientService } from '@/services/patient.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SMSMessagesTabProps {
  messages: SMSMessage[];
  templates: SMSTemplate[];
  searchTerm: string;
  onRefresh: () => void;
  isConfigured?: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const SMSMessagesTab: React.FC<SMSMessagesTabProps> = ({ 
  messages, 
  templates = [], 
  searchTerm, 
  onRefresh,
  isConfigured = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // New message form state
  const [newMessage, setNewMessage] = useState({
    patientId: '',
    type: 'manual' as SMSMessage['type'],
    content: '',
    templateId: '',
    priority: 'normal' as SMSMessage['priority'],
    scheduledFor: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const result = await PatientService.searchPatients('');
      if (result.success && result.patients) {
        const patientData = result.patients.map((p: any) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone
        }));
        setPatients(patientData);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!isConfigured) {
      toast.error('Please configure Twilio first to send messages');
      return;
    }
    
    if (!newMessage.patientId || !newMessage.content) {
      toast.error('Please select a patient and enter message content.');
      return;
    }

    setLoading(true);
    try {
      const patient = patients.find(p => p.id === newMessage.patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const messageData: Omit<SMSMessage, 'id' | 'createdAt'> = {
        patientId: newMessage.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phone,
        phoneNumber: patient.phone,
        message: newMessage.content,
        content: newMessage.content,
        type: newMessage.type,
        status: newMessage.scheduledFor ? 'scheduled' : 'pending',
        priority: newMessage.priority,
        templateId: newMessage.templateId || undefined,
        scheduledFor: newMessage.scheduledFor ? new Date(newMessage.scheduledFor) : undefined,
        isAutomated: false,
        sentBy: 'current-user-id',
        language: 'en',
        metadata: {
          source: 'manual',
          userId: 'current-user-id'
        }
      };

      await SMSService.sendMessage(messageData);
      
      toast.success(newMessage.scheduledFor ? 'Message scheduled successfully!' : 'Message sent successfully!');
      setShowNewMessageDialog(false);
      setNewMessage({
        patientId: '',
        type: 'manual',
        content: '',
        templateId: '',
        priority: 'normal',
        scheduledFor: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewMessage(prev => ({
        ...prev,
        templateId: templateId,
        content: template.content,
        type: template.category as SMSMessage['type']
      }));
    }
  };

  const getStatusBadge = (status: SMSMessage['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      sent: { variant: 'default' as const, icon: Send, color: 'text-blue-600' },
      delivered: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      read: { variant: 'default' as const, icon: Eye, color: 'text-green-700' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      scheduled: { variant: 'outline' as const, icon: Calendar, color: 'text-purple-600' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: SMSMessage['priority']) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900 font-bold border border-red-300'
    };

    return (
      <Badge className={variants[priority] || variants.normal}>
        {priority}
      </Badge>
    );
  };

  // Filter messages based on search term and filters
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesType = typeFilter === 'all' || message.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Send New SMS</DialogTitle>
                <DialogDescription>
                  Send a message to a patient directly or schedule it for later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient" className="text-right">
                    Patient
                  </Label>
                  <Select value={newMessage.patientId} onValueChange={(value) => 
                    setNewMessage(prev => ({ ...prev, patientId: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {patient.firstName} {patient.lastName} - {patient.phone}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template" className="text-right">
                    Template
                  </Label>
                  <Select value={newMessage.templateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.isActive).map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {template.name} - {template.category}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select value={newMessage.type} onValueChange={(value: SMSMessage['type']) => 
                    setNewMessage(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="health_tip">Health Tip</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select value={newMessage.priority} onValueChange={(value: SMSMessage['priority']) => 
                    setNewMessage(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduled" className="text-right">
                    Schedule For
                  </Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={newMessage.scheduledFor}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Message
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your message here..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    className="col-span-3 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3">
                    <p className="text-sm text-muted-foreground">
                      Character count: {newMessage.content.length}/160
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={loading}>
                  {loading ? 'Sending...' : (newMessage.scheduledFor ? 'Schedule' : 'Send')}
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="health_tip">Health Tip</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Messages ({filteredMessages.length})
          </CardTitle>
          <CardDescription>
            View and manage all SMS messages sent to patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No messages found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by sending your first message.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.patientName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {message.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{message.content}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {message.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(message.priority)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {message.scheduledFor && message.status === 'scheduled' ? (
                          <div>
                            <div>Scheduled for:</div>
                            <div>{format(new Date(message.scheduledFor), 'MMM d, yyyy HH:mm')}</div>
                          </div>
                        ) : (
                          format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')
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

      {/* Message Details Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
              <DialogDescription>
                View complete information about this SMS message
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <div className="text-sm">{selectedMessage.patientName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="text-sm">{selectedMessage.phoneNumber}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedMessage.priority)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Message Content</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedMessage.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div>{format(new Date(selectedMessage.createdAt), 'MMM d, yyyy HH:mm:ss')}</div>
                </div>
                {selectedMessage.sentAt && (
                  <div>
                    <Label className="text-sm font-medium">Sent</Label>
                    <div>{format(new Date(selectedMessage.sentAt), 'MMM d, yyyy HH:mm:ss')}</div>
                  </div>
                )}
              </div>

              {selectedMessage.deliveredAt && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium">Delivered</Label>
                    <div>{format(new Date(selectedMessage.deliveredAt), 'MMM d, yyyy HH:mm:ss')}</div>
                  </div>
                  {selectedMessage.readAt && (
                    <div>
                      <Label className="text-sm font-medium">Read</Label>
                      <div>{format(new Date(selectedMessage.readAt), 'MMM d, yyyy HH:mm:ss')}</div>
                    </div>
                  )}
                </div>
              )}

              {selectedMessage.failureReason && (
                <div>
                  <Label className="text-sm font-medium">Failure Reason</Label>
                  <div className="text-sm text-red-600">{selectedMessage.failureReason}</div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SMSMessagesTab; 