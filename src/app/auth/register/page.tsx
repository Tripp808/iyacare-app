'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, Check, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, sendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'ocheankeli99@gmail.com',
    password: '',
    confirmPassword: '',
    role: 'healthcare_provider',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowLoginAlert(false);
    setShowVerificationInfo(false);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role as 'admin' | 'healthcare_worker' | 'patient',
        verified: false
      });
      
      setUserEmail(formData.email);
      setShowVerificationInfo(true);
      toast.success('Account created successfully! Please check your email for verification.');
      
      // Don't redirect immediately - let user verify email first
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setShowLoginAlert(true);
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message && error.message.includes('verification')) {
        // Handle email verification issues gracefully
        setUserEmail(formData.email);
        setShowVerificationInfo(true);
        toast.warning('Account created but email verification failed to send. You can try resending it.');
        setIsLoading(false);
        return;
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {showLoginAlert && (
          <Alert className="mb-6 border-[#F7913D] bg-[#F7913D]/10">
            <Info className="h-4 w-4 text-[#F7913D]" />
            <AlertDescription className="text-sm">
              <strong>Account already exists!</strong> An account with this email address already exists. 
              <Link href="/auth/login" className="ml-1 font-medium text-[#2D7D89] hover:underline">
                Click here to sign in
              </Link> instead.
            </AlertDescription>
          </Alert>
        )}
        
        {showVerificationInfo && (
          <Alert className="mb-6 border-[#2D7D89] bg-[#2D7D89]/10">
            <Mail className="h-4 w-4 text-[#2D7D89]" />
            <AlertDescription className="text-sm">
              <div className="space-y-3">
                <div>
                  <strong>Account created successfully!</strong> We've sent a verification email to{' '}
                  <span className="font-medium">{userEmail}</span>.
                </div>
                <div className="text-xs text-muted-foreground">
                  Please check your email (including spam folder) and click the verification link to activate your account.
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResendVerification}
                    className="text-[#2D7D89] border-[#2D7D89] hover:bg-[#2D7D89] hover:text-white"
                  >
                    Resend Email
                  </Button>
                  <Link href="/auth/login">
                    <Button 
                      size="sm" 
                      className="bg-[#2D7D89] hover:bg-[#236570] text-white"
                    >
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Create an account with </span>
              <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
              <span className="text-[#F7913D]">Care</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 border-gray-200 focus:border-[#2D7D89] focus:ring-[#2D7D89]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10 border-gray-200 focus:border-[#2D7D89] focus:ring-[#2D7D89]/20"
                    />
                  </div>
                </div>
              </div>
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
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="pl-10 border-gray-200 focus:border-[#2D7D89] focus:ring-[#2D7D89]/20">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                      <SelectItem value="midwife">Midwife</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Check className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••••"
                    required
                    value={formData.confirmPassword}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#2D7D89] hover:underline dark:text-[#4AA0AD] font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By creating an account, you agree to our</p>
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