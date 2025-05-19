'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPatients } from '@/lib/firebase/patients';
import { createAlert } from '@/lib/firebase/alerts';
import { AlertCircle } from 'lucide-react';
import { Patient } from '@/lib/firebase/patients';

// Form schema
const alertFormSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  type: z.enum(['risk', 'appointment', 'medication', 'system'], {
    required_error: "Please select an alert type",
  }),
  priority: z.enum(['high', 'medium', 'low'], {
    required_error: "Please select a priority level",
  }),
  message: z.string().min(5, {
    message: "Message must be at least 5 characters.",
  }),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

export default function CreateAlertPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup form
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      patientId: '',
      type: 'system',
      priority: 'medium',
      message: '',
    },
  });

  // Handle URL query parameters for patientId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patientId = params.get('patientId');
    
    if (patientId) {
      form.setValue('patientId', patientId);
    }
  }, [form]);

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const result = await getPatients();
        if (result.success) {
          setPatients(result.patients || []);
        } else {
          console.error('Failed to fetch patients:', result.error);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle form submission
  const onSubmit = async (data: AlertFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Find the selected patient to get their name
      const selectedPatient = patients.find(p => p.id === data.patientId);
      
      if (!selectedPatient) {
        form.setError("patientId", { 
          message: "Selected patient not found"
        });
        return;
      }

      // Format the patient name
      const patientName = `${selectedPatient.firstName} ${selectedPatient.lastName}`;

      // Create the alert
      const alertData = {
        patientId: data.patientId,
        patientName,
        message: data.message,
        type: data.type,
        priority: data.priority,
      };

      const result = await createAlert(alertData);

      if (result.success) {
        // Redirect back to alerts page on success
        router.push('/alerts');
      } else {
        // Handle error
        console.error('Failed to create alert:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get a human-readable label for alert types
  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'risk': return 'Patient Risk';
      case 'appointment': return 'Appointment';
      case 'medication': return 'Medication';
      case 'system': return 'System Alert';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-[#2D7D89]">Create</span>
          <span className="text-[#F7913D]"> Alert</span>
        </h1>
        <Button variant="outline" onClick={() => router.push('/alerts')}>
          Cancel
        </Button>
      </div>

      <Card className="border-t-4 border-t-[#2D7D89]">
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
          <CardDescription>
            Create a new alert for a patient or the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      disabled={loading || isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            Loading patients...
                          </SelectItem>
                        ) : patients.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No patients found
                          </SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id || ''}>
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the patient this alert is related to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alert Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="risk">Patient Risk</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="system">System Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of alert determines how it is displayed and categorized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the urgency level of this alert
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alert Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the alert message..."
                        className="min-h-[120px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear description of the alert
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-[#2D7D89] hover:bg-[#236570]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                    Creating Alert...
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Create Alert
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 