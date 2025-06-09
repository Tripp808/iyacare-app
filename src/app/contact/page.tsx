'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // For demo purposes, we'll just simulate a submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Contact </span>
            <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
            <span className="text-[#F7913D]">Care</span>
          </h1>
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
        
        <Card className="shadow-lg dark:shadow-[#2D7D89]/10">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Fill out the form below and our team will get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="pl-10 min-h-[150px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-12 px-8 font-medium" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
            <Mail className="h-8 w-8 text-[#2D7D89] dark:text-[#4AA0AD] mb-2" />
            <h3 className="font-medium mb-1">Email Us</h3>
            <p className="text-sm text-muted-foreground">support@iyacare.com</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
            <MessageSquare className="h-8 w-8 text-[#2D7D89] dark:text-[#4AA0AD] mb-2" />
            <h3 className="font-medium mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Available 24/7</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
            <User className="h-8 w-8 text-[#2D7D89] dark:text-[#4AA0AD] mb-2" />
            <h3 className="font-medium mb-1">Support</h3>
            <p className="text-sm text-muted-foreground">FAQs & Help Center</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 