'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Activity } from 'lucide-react';

export default function VitalsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after a short delay to show the message
    const timer = setTimeout(() => {
      router.push('/iot-monitoring');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-blue-500 mb-4 animate-pulse" />
          <h1 className="text-xl font-semibold mb-2">Redirecting to IoT Monitoring</h1>
          <p className="text-gray-600 mb-4">
            Vital signs are now part of our enhanced IoT monitoring system.
          </p>
          <div className="flex items-center gap-2 text-blue-600">
            <span>Taking you to IoT Live Monitoring</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}