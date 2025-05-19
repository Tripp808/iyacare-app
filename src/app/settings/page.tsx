'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, RefreshCw, ShieldAlert, UserCog } from 'lucide-react';
import { seedTestData } from '@/lib/seedData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  // Handle seeding test data
  const handleSeedData = async () => {
    try {
      setLoading(true);
      const result = await seedTestData();
      
      if (result.success) {
        toast.success('Sample data was added successfully');
      } else {
        toast.error('Failed to add sample data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-[#2D7D89]">Settings</span>
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-[#2D7D89]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="mr-2 h-5 w-5 text-[#2D7D89]" /> Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update your profile information, email notifications, and account security.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Manage Account</Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-[#2D7D89]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="mr-2 h-5 w-5 text-[#2D7D89]" /> Security
            </CardTitle>
            <CardDescription>
              Secure your account and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Change your password, enable two-factor authentication, and view login history.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Security Settings</Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-[#F7913D]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-[#F7913D]" /> Sample Data
            </CardTitle>
            <CardDescription>
              Add test data to the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seed the database with sample patients and alerts for testing and demonstration purposes.
            </p>
            <div className="flex items-center text-xs text-muted-foreground bg-amber-50 border border-amber-100 p-2 rounded-md">
              <ShieldAlert className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
              <span>This will add sample data to your database. Use only in development environments.</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="default" 
              onClick={handleSeedData}
              disabled={loading}
              className="bg-[#F7913D] hover:bg-[#e07e2d]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Data...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Add Sample Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 