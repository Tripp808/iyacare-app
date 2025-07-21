'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, sendVerificationEmail, firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpAlert, setShowSignUpAlert] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSignUpAlert(false);
    setShowVerificationAlert(false);
    
    try {
      await signIn(formData.email, formData.password);
      
      // Check if email is verified after successful login
      if (firebaseUser && !firebaseUser.emailVerified) {
        setShowVerificationAlert(true);
        toast.warning('Please verify your email address to continue.');
        setIsLoading(false);
        return;
      }
      
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please sign up first to create an account.';
        setShowSignUpAlert(true);
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.';
        setShowSignUpAlert(true);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
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
        {showSignUpAlert && (
          <Alert className="mb-6 border-[#F7913D] bg-[#F7913D]/10">
            <Info className="h-4 w-4 text-[#F7913D]" />
            <AlertDescription className="text-sm">
              <strong>Account not found!</strong> It looks like you don't have an account yet. 
              <Link href="/auth/register" className="ml-1 font-medium text-[#2D7D89] hover:underline">
                Click here to sign up
              </Link> and join IyàCare.
            </AlertDescription>
          </Alert>
        )}
        
        {showVerificationAlert && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50">
            <Mail className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <div className="space-y-3">
                <div>
                  <strong>Email verification required!</strong> Please verify your email address to access your account.
                </div>
                <div className="text-xs text-muted-foreground">
                  Check your email (including spam folder) for a verification link, or request a new one below.
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResendVerification}
                    className="text-yellow-700 border-yellow-500 hover:bg-yellow-100"
                  >
                    Resend Verification Email
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Sign in to </span>
              <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
              <span className="text-[#F7913D]">Care</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 border-gray-200 focus:border-[#2D7D89] focus:ring-[#2D7D89]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link 
                    href="/auth/forgot-password"
                    className="text-xs text-[#2D7D89] hover:underline dark:text-[#4AA0AD]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 border-gray-200 focus:border-[#2D7D89] focus:ring-[#2D7D89]/20"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-4">
              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-12 px-8 font-medium" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-[#2D7D89] hover:underline dark:text-[#4AA0AD] font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By signing in, you agree to our</p>
          <div className="flex justify-center space-x-2 mt-1">
            <Link href="/terms" className="text-[#2D7D89] hover:underline dark:text-[#4AA0AD]">
              Terms of Service
            </Link>
            <span>and</span>
            <Link href="/privacy" className="text-[#2D7D89] hover:underline dark:text-[#4AA0AD]">
              Privacy Policy
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 