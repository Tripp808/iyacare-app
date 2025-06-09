'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg dark:shadow-[#2D7D89]/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {emailSent ? 'Check your email' : 'Reset your password'}
            </CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? `We sent a password reset link to ${email}`
                : 'Enter your email address and we\'ll send you a link to reset your password'
              }
            </CardDescription>
          </CardHeader>
          
          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-6 pt-4">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-12 px-8" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth="1" />
                    </>
                  )}
                </Button>
                
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" size="lg" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col space-y-6 pt-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              
              <div className="flex flex-col space-y-2 w-full">
                <Button 
                  onClick={() => setEmailSent(false)}
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  Try Again
                </Button>
                
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" size="lg" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#2D7D89] hover:underline dark:text-[#4AA0AD] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 