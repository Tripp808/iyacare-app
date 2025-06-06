"use client";

import React, { useState, useEffect } from 'react';
import { VitalSignsService, VitalSigns } from '@/services/vitalsigns.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, Thermometer, Weight, Droplets, Wind, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

export default function VitalSignsPage() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date | Timestamp | undefined): string => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  };

  // Load vital signs data
  useEffect(() => {
    loadVitalSigns();
  }, []);

  const loadVitalSigns = async () => {
    try {
      setLoading(true);
      const result = await VitalSignsService.getRecentVitalSigns(50);
      
      if (result.success && result.vitalSigns) {
        setVitalSigns(result.vitalSigns);
      } else {
        console.error('Failed to load vital signs:', result.error);
        toast.error('Failed to load vital signs');
      }
    } catch (error) {
      console.error('Error loading vital signs:', error);
      toast.error('Error loading vital signs');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getVitalStatus = (value: number, type: string) => {
    switch (type) {
      case 'systolic':
        if (value > 140) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 90) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'diastolic':
        if (value > 90) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 60) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'heartRate':
        if (value > 100) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 60) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      case 'temperature':
        if (value > 37.5) return { status: 'high', icon: TrendingUp, color: 'text-red-500' };
        if (value < 36) return { status: 'low', icon: TrendingDown, color: 'text-blue-500' };
        return { status: 'normal', icon: null, color: 'text-green-500' };
      default:
        return { status: 'normal', icon: null, color: 'text-green-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading vital signs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">Vital Signs</h1>
          <p className="text-gray-600">IoT device readings and patient vital signs monitoring</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Data from IoT devices</span>
        </div>
      </div>

      {vitalSigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Vital Signs Data</h3>
            <p className="text-gray-500 text-center max-w-md">
              Vital signs data will appear here automatically as IoT devices record patient measurements. 
              Make sure IoT devices are properly connected and configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vitalSigns.map((vital, index) => {
            const systolicStatus = getVitalStatus(vital.systolic, 'systolic');
            const diastolicStatus = getVitalStatus(vital.diastolic, 'diastolic');
            const heartRateStatus = getVitalStatus(vital.heartRate, 'heartRate');
            const temperatureStatus = getVitalStatus(vital.temperature, 'temperature');

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Patient ID: {vital.patientId}
                      </CardTitle>
                      <CardDescription>
                        Recorded: {formatTimestamp(vital.timestamp)}
                        {/* Device info would come from IoT integration */}
                      </CardDescription>
                    </div>
                    {vital.aiPrediction && (
                      <Badge variant={getRiskBadgeColor(vital.aiPrediction.riskLevel)}>
                        {vital.aiPrediction.riskLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Heart className={`h-5 w-5 ${systolicStatus.color}`} />
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="font-semibold flex items-center">
                          {vital.systolic}/{vital.diastolic} mmHg
                          {systolicStatus.icon && <systolicStatus.icon className="h-3 w-3 ml-1" />}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className={`h-5 w-5 ${heartRateStatus.color}`} />
                      <div>
                        <p className="text-sm text-gray-600">Heart Rate</p>
                        <p className="font-semibold flex items-center">
                          {vital.heartRate} bpm
                          {heartRateStatus.icon && <heartRateStatus.icon className="h-3 w-3 ml-1" />}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Thermometer className={`h-5 w-5 ${temperatureStatus.color}`} />
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="font-semibold flex items-center">
                          {vital.temperature}°C
                          {temperatureStatus.icon && <temperatureStatus.icon className="h-3 w-3 ml-1" />}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Weight className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-semibold">{vital.weight} kg</p>
                      </div>
                    </div>

                    {vital.oxygenSaturation && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Wind className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Oxygen Saturation</p>
                          <p className="font-semibold">{vital.oxygenSaturation}%</p>
                        </div>
                      </div>
                    )}

                    {vital.bloodSugar && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Droplets className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-600">Blood Sugar</p>
                          <p className="font-semibold">{vital.bloodSugar} mg/dL</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {vital.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {vital.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 