'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare, ArrowRight, AlertTriangle, Settings, Bug, HelpCircle, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardContactPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    issueType: '',
    priority: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // For demo purposes, we'll just simulate a submission
    setTimeout(() => {
      alert('Your support request has been submitted! Our team will get back to you soon.');
      setFormData({ subject: '', issueType: '', priority: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Support</h1>
        <p className="text-muted-foreground">
          Need help with your dashboard? Get assistance from our technical support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Submit Support Request</CardTitle>
              <CardDescription>
                Describe your issue and we'll help you resolve it as quickly as possible.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueType">Issue Type</Label>
                    <Select value={formData.issueType} onValueChange={(value) => handleSelectChange('issueType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="data">Data & Records</SelectItem>
                        <SelectItem value="alerts">Alerts & Notifications</SelectItem>
                        <SelectItem value="performance">Performance Issues</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="medium">Medium - Non-urgent issue</SelectItem>
                        <SelectItem value="high">High - Affecting workflow</SelectItem>
                        <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Brief description of your issue"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Detailed Description</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please provide as much detail as possible about your issue, including steps to reproduce any problems..."
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="min-h-[150px]"
                  />
                </div>

                {user && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>User: {user.name || user.email}</div>
                      <div>Email: {user.email}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-[#2D7D89] hover:bg-[#236570] text-white rounded-full h-12 px-8 font-medium" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Quick Help Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Documentation</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Check our user guide for common questions</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Live Chat</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Available 9 AM - 5 PM EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">System Status</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Check current service status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Technical Support</p>
                  <p className="text-sm text-muted-foreground">support@iyacare.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Issues</p>
                  <p className="text-sm text-muted-foreground">accounts@iyacare.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Bug className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bug Reports</p>
                  <p className="text-sm text-muted-foreground">bugs@iyacare.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Feature Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Have an idea to improve IyàCare? We'd love to hear your suggestions!
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Submit Feature Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 