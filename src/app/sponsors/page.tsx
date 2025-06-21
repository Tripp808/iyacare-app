'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  HandHeart, 
  Globe, 
  Shield, 
  Banknote,
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Award
} from "lucide-react";

export default function SponsorsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-br from-[#e6f3f5]/50 to-[#fef3e8]/50 dark:from-background dark:to-muted/10">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-[#e6f3f5]/70 backdrop-blur-md border border-[#b8e0e6]/30 shadow-sm text-[#2D7D89] dark:bg-[#e6f3f5]/20 dark:text-[#4AA0AD] w-fit">
              Partnership Opportunities
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Sponsor</span> Life-Saving 
                <span className="block text-[#F7913D] mt-2">Maternal Healthcare</span>
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl mx-auto">
                Partner with IyàCare to provide free access to AI-powered maternal health monitoring 
                for mothers in low-resource settings. Your sponsorship directly saves lives.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-[#F7913D] hover:bg-[#e67c3b] text-white rounded-full h-12 px-8 font-medium">
                  Become a Sponsor
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#impact">
                <Button variant="outline" size="lg" className="rounded-full h-12 px-8 font-medium border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10 dark:border-[#4AA0AD] dark:text-[#4AA0AD] dark:hover:bg-[#4AA0AD]/10">
                  See Our Impact
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="w-full py-8 md:py-12 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                The <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Challenge</span> We Face
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed">
                In low-resource settings, lack of access to technology and healthcare funding creates barriers to maternal care
              </p>
            </div>
          </motion.div>

          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Limited Access to Technology</h3>
              <p className="text-muted-foreground">
                Many rural health centers lack IoT devices and digital monitoring equipment essential for early risk detection.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <Banknote className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Financial Barriers</h3>
              <p className="text-muted-foreground">
                Expectant mothers often cannot afford monthly subscription fees for advanced healthcare monitoring services.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted md:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold">High Maternal Mortality</h3>
              <p className="text-muted-foreground">
                Without early detection and monitoring, preventable complications lead to increased maternal and infant mortality rates.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How Sponsorship Works */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-background dark:to-muted/10">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How Your <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Sponsorship</span> Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed">
                Your donation directly funds devices, platform access, and ongoing support for mothers in need
              </p>
            </div>
          </motion.div>

          <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f3f5] dark:bg-[#2D7D89]/20">
                <Heart className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />
              </div>
              <h3 className="text-xl font-bold">Device Donation</h3>
              <p className="text-muted-foreground mb-4">
                Fund IoT monitoring devices (blood pressure monitors, pulse oximeters, glucometers) for community health centers.
              </p>
              <div className="text-sm text-[#2D7D89] dark:text-[#4AA0AD] font-medium">
                Cost: $200-500 per device set
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f3f5] dark:bg-[#2D7D89]/20">
                <HandHeart className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />
              </div>
              <h3 className="text-xl font-bold">Platform Access</h3>
              <p className="text-muted-foreground mb-4">
                Sponsor monthly platform subscriptions providing AI risk prediction, alerts, and blockchain record keeping.
              </p>
              <div className="text-sm text-[#2D7D89] dark:text-[#4AA0AD] font-medium">
                Cost: $10-25 per mother per month
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col space-y-4 rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted md:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f3f5] dark:bg-[#2D7D89]/20">
                <Users className="h-6 w-6 text-[#2D7D89] dark:text-[#4AA0AD]" />
              </div>
              <h3 className="text-xl font-bold">Training & Support</h3>
              <p className="text-muted-foreground mb-4">
                Fund training programs for community health workers and ongoing technical support for health centers.
              </p>
              <div className="text-sm text-[#2D7D89] dark:text-[#4AA0AD] font-medium">
                Cost: $100-300 per training session
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section id="impact" className="w-full py-8 md:py-12 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Our <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Impact</span> So Far
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed">
                See the real difference your sponsorship can make in maternal healthcare outcomes
              </p>
            </div>
          </motion.div>

          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD] mb-2">1,500+</div>
              <div className="text-sm text-muted-foreground">Mothers Served</div>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-[#F7913D] mb-2">35%</div>
              <div className="text-sm text-muted-foreground">Reduction in Complications</div>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD] mb-2">85</div>
              <div className="text-sm text-muted-foreground">Health Centers Equipped</div>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-[#F7913D] mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring Coverage</div>
            </motion.div>
          </div>

          <motion.div 
            className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-[#e6f3f5]/50 to-[#fef3e8]/50 dark:from-background dark:to-muted/10 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TrendingUp className="h-12 w-12 text-[#2D7D89] dark:text-[#4AA0AD] mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Every Dollar Makes a Difference
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              With an average cost of just $25 per month per mother, your sponsorship provides comprehensive 
              maternal health monitoring, early risk detection, and emergency alerts that save lives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#2D7D89]" />
                <span>Real-time vital monitoring</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#2D7D89]" />
                <span>AI risk prediction</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#2D7D89]" />
                <span>Emergency alert system</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-background dark:to-muted/10">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Sponsorship</span> Tiers
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-lg/relaxed">
                Choose the level of impact that aligns with your organization's mission and budget
              </p>
            </div>
          </motion.div>

          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Community Partner */}
            <motion.div 
              className="flex flex-col rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold">Community Partner</h3>
                <p className="text-muted-foreground mt-1">Support 5-10 mothers</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">$150</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Covers platform access for 5-10 mothers</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Monthly progress reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Impact testimonials</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Annual impact summary</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Recognition on website</span>
                </li>
              </ul>

              <Link href="/contact" className="mt-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89]/10">
                  Become a Partner
                </Button>
              </Link>
            </motion.div>

            {/* Health Advocate */}
            <motion.div 
              className="flex flex-col rounded-xl border-2 border-[#2D7D89] p-6 shadow-md bg-white dark:bg-background relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2D7D89] text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST IMPACT
              </div>
              
              <div className="mb-5">
                <h3 className="text-xl font-bold">Health Advocate</h3>
                <p className="text-muted-foreground mt-1">Support 25-50 mothers + devices</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">$750</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Includes device funding + platform access</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Quarterly device deployment</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Monthly video updates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Direct mother testimonials</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Featured partner status</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Annual site visit opportunity</span>
                </li>
              </ul>

              <Link href="/contact" className="mt-auto">
                <Button size="lg" className="w-full rounded-full bg-[#2D7D89] hover:bg-[#236570] text-white">
                  Become an Advocate
                </Button>
              </Link>
            </motion.div>

            {/* Life Saver */}
            <motion.div 
              className="flex flex-col rounded-xl border p-6 shadow-sm bg-white dark:bg-background dark:border-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-5">
                <h3 className="text-xl font-bold">Life Saver</h3>
                <p className="text-muted-foreground mt-1">Sponsor entire health centers</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">$2,500+</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Custom sponsorship packages available</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Complete health center setup</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Staff training programs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Custom branding opportunities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#2D7D89] mr-2" />
                  <span>Executive partnership meetings</span>
                </li>
              </ul>

              <Link href="/contact" className="mt-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full border-[#F7913D] text-[#F7913D] hover:bg-[#F7913D]/10">
                  Custom Partnership
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-8 md:py-12 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-[#2D7D89] to-[#236570] dark:from-[#4AA0AD] dark:to-[#2D7D89] p-8 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-3xl font-bold mb-4">
              Ready to Save Lives?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join our mission to make maternal healthcare accessible to every mother, 
              regardless of economic circumstances. Your partnership creates lasting change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-[#F7913D] hover:bg-[#e67c3b] text-white rounded-full h-12 px-8 font-medium">
                  Start Your Partnership
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="rounded-full h-12 px-8 font-medium border-white text-white hover:bg-white/10">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 