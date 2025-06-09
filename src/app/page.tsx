'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { iyàCareColors } from "@/components/theme-provider";
import { 
  CheckCircle, 
  Calendar, 
  Bell, 
  Shield, 
  BarChart3, 
  Smartphone,
  ChevronRight,
  ArrowRight,
  Activity,
  GitMerge
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  
  // Don't automatically redirect authenticated users - let them see the homepage
  // Only redirect if they explicitly try to sign up or log in when already authenticated
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleImageError = (imagePath: string) => {
    console.error(`Failed to load image: ${imagePath}`);
    setImageError(prev => ({...prev, [imagePath]: true}));
  };

  const handleGetStarted = () => {
    if (firebaseUser) {
      router.push('/dashboard');
    } else {
      router.push('/auth/register');
    }
  };

  const handleSignIn = () => {
    if (firebaseUser) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  // Allow both authenticated and unauthenticated users to see the homepage
  // Show different button text based on authentication status

  return (
    <div className="flex flex-col font-inter">
      {/* Hero Section */}
      <section className="w-full py-6 md:py-8 lg:py-12 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-background dark:to-muted/10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
            <motion.div 
              className="flex flex-col justify-center space-y-4 order-2 lg:order-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-[#e6f3f5]/70 backdrop-blur-md border border-[#b8e0e6]/30 shadow-sm text-[#2D7D89] dark:bg-[#e6f3f5]/20 dark:text-[#4AA0AD] w-fit font-inter">
                Transforming maternal healthcare in low-resource settings
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-inter">
                  <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
                  <span className="text-[#F7913D]">Care</span>
                  <span className="block text-foreground mt-2 text-3xl sm:text-4xl xl:text-5xl">AI-Powered Maternal Health Monitoring</span>
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl font-inter">
                  An integrated digital platform using AI and IoT devices to predict pregnancy risks, monitor vital signs, and securely share health records via blockchain technology.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  size="lg" 
                  className="bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-12 px-8 font-medium border-0 font-inter"
                  onClick={handleGetStarted}
                >
                  {firebaseUser ? 'Go to Dashboard' : 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full h-12 px-8 font-medium border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10 dark:border-[#4AA0AD] dark:text-[#4AA0AD] dark:hover:bg-[#4AA0AD]/10 font-inter"
                  onClick={handleSignIn}
                >
                  {firebaseUser ? 'Dashboard' : 'Sign In'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-2 font-inter">
                Trusted by healthcare providers across multiple regions
              </p>
            </motion.div>
            <motion.div 
              className="w-full h-[400px] order-1 lg:order-2 mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D7D89]/20 to-[#F7913D]/20 rounded-3xl blur-xl" />
                <div className="relative w-full h-full p-4">
                  <div className="relative h-full w-full rounded-2xl overflow-hidden">
                    {/* Image of healthcare provider with child */}
                    <div 
                      className="absolute inset-0 transition-opacity duration-1000"
                      style={{ opacity: activeImage === 0 ? 1 : 0 }}
                    >
                      <Image
                        src="/images/doctor-with-child.jpg"
                        alt="Doctor with child"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        priority
                        className="object-cover object-center rounded-2xl"
                        onError={() => handleImageError("/images/doctor-with-child.jpg")}
                        style={{display: imageError["/images/doctor-with-child.jpg"] ? "none" : "block"}}
                      />
                      {imageError["/images/doctor-with-child.jpg"] && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                          <p className="text-gray-500 font-inter">Image not available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Image of maternal healthcare */}
                    <div 
                      className="absolute inset-0 transition-opacity duration-1000"
                      style={{ opacity: activeImage === 1 ? 1 : 0 }}
                    >
                      <Image
                        src="/images/maternal-care.jpg"
                        alt="Maternal care"
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        priority
                        className="object-cover object-center rounded-2xl"
                        onError={() => handleImageError("/images/maternal-care.jpg")}
                        style={{display: imageError["/images/maternal-care.jpg"] ? "none" : "block"}}
                      />
                      {imageError["/images/maternal-care.jpg"] && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                          <p className="text-gray-500 font-inter">Image not available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-8 md:py-12 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#e9f2f3] text-[#2D7D89] dark:bg-muted dark:text-[#4AA0AD] font-inter">
              Our Platform
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-inter">
                <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Features</span> designed for maternal care
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed font-inter">
                Our platform offers comprehensive tools to support mothers and healthcare providers
              </p>
            </div>
          </motion.div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col h-full space-y-4 rounded-xl p-6 shadow-sm transition-all hover:shadow-md bg-white dark:bg-background"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f3f5] dark:bg-[#2D7D89]/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-inter">{feature.name}</h3>
                <p className="text-muted-foreground flex-grow font-inter">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-8 md:py-12 bg-transparent dark:bg-transparent">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="mx-auto max-w-6xl rounded-2xl shadow-sm p-8 md:p-12 bg-white dark:bg-background/80 border border-gray-100 dark:border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <svg className="h-12 w-12 text-[#2D7D89] dark:text-[#4AA0AD] mb-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
                <p className="text-xl md:text-2xl font-medium mb-6 text-foreground">
                  IyàCare has revolutionized maternal healthcare in our region. The AI risk prediction tool has helped us identify high-risk pregnancies early, reducing maternal complications by over 30%. The real-time monitoring features are life-saving in our rural communities.
                </p>
                <div>
                  <p className="font-semibold">Dr. Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Maternal Health Director, Central Hospital</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full md:w-1/3">
                <div className="aspect-video bg-white rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-[#e6f3f5] dark:bg-[#2D7D89]/30 flex items-center justify-center">
                    <svg className="h-12 w-12 text-[#2D7D89] dark:text-[#4AA0AD]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-8 md:py-12 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-[#e9f2f3] text-[#2D7D89] dark:bg-muted dark:text-[#4AA0AD] font-inter">
              Pricing
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-inter">
                <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Affordable</span> solutions for healthcare facilities
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed font-inter">
                Our subscription plans are designed for clinics and hospitals of all sizes
              </p>
            </div>
          </motion.div>

          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {/* Essential Plan */}
            <motion.div 
              className="flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md bg-white dark:bg-background/80 dark:border-muted font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold">Essential</h3>
                <p className="text-muted-foreground mt-1">For small clinics</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">₦5,000</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per facility, billed annually</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Basic AI risk prediction</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Patient record management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Emergency alert system</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Up to 100 patients</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Email support</span>
                </li>
              </ul>

              <Link href="/auth/register" className="mt-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div 
              className="flex flex-col rounded-xl border-2 border-[#2D7D89] p-6 shadow-md transition-all hover:shadow-lg bg-white dark:bg-background/80 relative font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2D7D89] text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              
              <div className="mb-5">
                <h3 className="text-xl font-bold">Premium</h3>
                <p className="text-muted-foreground mt-1">For medium hospitals</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">₦7,500</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per facility, billed annually</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Advanced AI risk prediction</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Real-time IoT vital monitoring</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Blockchain record keeping</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Up to 500 patients</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Priority email & phone support</span>
                </li>
              </ul>

              <Link href="/auth/register" className="mt-auto">
                <Button size="lg" className="w-full rounded-full bg-[#2D7D89] hover:bg-[#236570] text-white">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              className="flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md bg-white dark:bg-background/80 dark:border-muted font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground mt-1">For large healthcare networks</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">₦10,000</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per facility, custom billing available</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Enterprise AI model customization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Unlimited patient records</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Private blockchain deployment</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Custom integration APIs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>24/7 dedicated support</span>
                </li>
              </ul>

              <Link href="/contact" className="mt-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-background dark:to-muted/10">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-inter">
                Ready to transform maternal healthcare in your community?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed font-inter">
                Join the growing network of healthcare facilities using IyàCare to reduce maternal mortality rates
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#2D7D89] hover:bg-[#236570] dark:bg-[#4AA0AD] dark:hover:bg-[#2D7D89] text-white rounded-full h-12 px-8 font-medium">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="rounded-full h-12 px-8 font-medium border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10 dark:border-[#4AA0AD] dark:text-[#4AA0AD] dark:hover:bg-[#4AA0AD]/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required for 14-day trial
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    name: "AI Risk Prediction",
    description: "Predict pregnancy risk levels using our AI model that analyzes age, blood pressure, glucose levels, heart rate, and other vital health metrics.",
    icon: <Shield className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
  {
    name: "Real-time Monitoring",
    description: "Track vital signs in real-time using IoT devices, displaying live data for systolic/diastolic BP, heart rate, and blood sugar levels.",
    icon: <Activity className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
  {
    name: "Emergency Alert System",
    description: "Receive real-time alerts for critical conditions, automatically notifying nearby clinics and midwives in case of danger signs.",
    icon: <Bell className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
  {
    name: "Blockchain Record Keeping",
    description: "Store patient information securely on blockchain technology, enabling safe and reliable sharing of records with authorized healthcare providers.",
    icon: <GitMerge className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
  {
    name: "Comprehensive Analytics",
    description: "Gain insights into maternal health trends with customizable dashboards showing vital statistics, risk assessments, and treatment outcomes.",
    icon: <BarChart3 className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
  {
    name: "Rural Healthcare Access",
    description: "Designed specifically for low-resource settings with offline capabilities and simple interfaces for community health workers.",
    icon: <Smartphone className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />,
  },
];
