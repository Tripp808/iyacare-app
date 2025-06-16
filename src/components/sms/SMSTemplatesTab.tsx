'use client';

import React, { useState, useCallback } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  FileText, 
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Hash,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SMSTemplate } from '@/types';
import { SMSService } from '@/services/sms.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SMSTemplatesTabProps {
  templates: SMSTemplate[];
  searchTerm: string;
  onRefresh: () => void;
  isConfigured?: boolean;
}

export default function SMSTemplatesTab({ 
  templates = [], 
  searchTerm = "", 
  onRefresh, 
  isConfigured = false 
}: SMSTemplatesTabProps) {
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New/Edit template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    category: 'reminder',
    variables: [] as string[],
    isActive: true,
    description: ''
  });

  const resetForm = () => {
    setTemplateForm({
      name: '',
      content: '',
      category: 'reminder',
      variables: [],
      isActive: true,
      description: ''
    });
    setEditingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const templateData = {
        name: templateForm.name,
        content: templateForm.content,
        category: templateForm.category as SMSTemplate['category'],
        language: 'en' as const,
        variables: extractVariables(templateForm.content),
        isActive: templateForm.isActive,
        usage: 'manual' as const,
        createdBy: 'current-user-id',
        description: templateForm.description,
        tags: []
      };

      const result = await SMSService.createTemplate(templateData);
      
      if (result.success) {
        toast.success('Template created successfully!');
        resetForm();
        setShowTemplateDialog(false);
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !templateForm.name || !templateForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: templateForm.name,
        content: templateForm.content,
        category: templateForm.category as SMSTemplate['category'],
        variables: extractVariables(templateForm.content),
        isActive: templateForm.isActive,
        description: templateForm.description
      };

      const result = await SMSService.updateTemplate(editingTemplate.id, updateData);
      
      if (result.success) {
        toast.success('Template updated successfully!');
        resetForm();
        setEditingTemplate(null);
        setShowTemplateDialog(false);
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const result = await SMSService.deleteTemplate(templateId);
      
      if (result.success) {
        toast.success('Template deleted successfully!');
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = (template: SMSTemplate) => {
    setTemplateForm({
      name: `${template.name} (Copy)`,
      content: template.content,
      category: template.category,
      variables: template.variables,
      isActive: true,
      description: template.description || ''
    });
    setEditingTemplate(null);
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: SMSTemplate) => {
    setTemplateForm({
      name: template.name,
      content: template.content,
      category: template.category,
      variables: template.variables,
      isActive: template.isActive,
      description: template.description || ''
    });
    setEditingTemplate(template);
    setShowTemplateDialog(true);
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      reminder: 'bg-blue-100 text-blue-800',
      appointment: 'bg-green-100 text-green-800',
      health_tip: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
      follow_up: 'bg-orange-100 text-orange-800',
      manual: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[category] || variants.manual}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  // Filter templates based on search term and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const activeTemplates = filteredTemplates.filter(t => t.isActive);
  const inactiveTemplates = filteredTemplates.filter(t => !t.isActive);

  const handleSendTemplate = async (template: SMSTemplate) => {
    if (!isConfigured) {
      toast.error('Please configure Twilio first to send messages');
      return;
    }
    
    // Implementation for sending template
    toast.success(`Template "${template.name}" ready to send`);
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={(open) => {
            setShowTemplateDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New SMS Template'}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Update the template details below.'
                    : 'Create a reusable SMS template for different communication scenarios.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="e.g., Appointment Reminder"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={templateForm.category} onValueChange={(value) => 
                    setTemplateForm(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="health_tip">Health Tip</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3 min-h-[60px]"
                    placeholder="Brief description of when to use this template"
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Content *
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Textarea
                      id="content"
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[120px]"
                      placeholder="Hi {{patientName}}, your appointment is on {{date}} at {{time}}. Please confirm by replying YES."
                    />
                    <div className="text-xs text-muted-foreground">
                      Use {`{variableName}`} for dynamic content. Character count: {templateForm.content.length}/160
                    </div>
                  </div>
                </div>

                {templateForm.content && extractVariables(templateForm.content).length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      Variables
                    </Label>
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-1">
                        {extractVariables(templateForm.content).map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active" className="text-right">
                    Active
                  </Label>
                  <div className="col-span-3">
                    <Switch
                      id="active"
                      checked={templateForm.isActive}
                      onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="health_tip">Health Tip</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-6">
        {/* Active Templates */}
        {activeTemplates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Active Templates ({activeTemplates.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(template.category)}
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {template.usageCount} uses
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendTemplate(template)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.content}
                      </p>
                      
                      {template.variables.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Variables:</div>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 3).map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                            {template.variables.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.variables.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {template.lastUsed 
                            ? `Used ${format(new Date(template.lastUsed), 'MMM d')}`
                            : 'Never used'
                          }
                        </span>
                        <span>{template.content.length}/160</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Templates */}
        {inactiveTemplates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              Inactive Templates ({inactiveTemplates.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveTemplates.map((template) => (
                <Card key={template.id} className="opacity-60 hover:opacity-80 transition-opacity">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(template.category)}
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first template.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setShowTemplateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Template details and preview
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedTemplate.category)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedTemplate.isActive ? 'default' : 'secondary'}>
                      {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedTemplate.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedTemplate.content}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Character count: {selectedTemplate.content.length}/160
                </p>
              </div>

              {selectedTemplate.variables.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Usage Count</Label>
                  <div>{selectedTemplate.usageCount} times</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Used</Label>
                  <div>
                    {selectedTemplate.lastUsed 
                      ? format(new Date(selectedTemplate.lastUsed), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div>{format(new Date(selectedTemplate.createdAt), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <div>{format(new Date(selectedTemplate.updatedAt), 'MMM d, yyyy')}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                handleEditTemplate(selectedTemplate);
                setSelectedTemplate(null);
              }}>
                Edit Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 