'use client';

import React from 'react';
import { useOffline } from '@/providers/offline-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  Trash2,
  RotateCcw 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const OfflineStatus: React.FC = () => {
  const {
    isOnline,
    isOfflineMode,
    offlineData,
    toggleOfflineMode,
    syncOfflineData,
    clearOfflineData,
    getOfflineDataCount,
  } = useOffline();

  const offlineCount = getOfflineDataCount();
  const lastSyncTime = offlineData.lastSync;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative flex items-center gap-2 h-8"
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          
          <span className="text-xs font-medium">
            {isOfflineMode ? 'Offline' : 'Online'}
          </span>
          
          {offlineCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 text-xs bg-orange-100 text-orange-800 border-orange-200"
            >
              {offlineCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Connection Status</h4>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isOfflineMode ? 'Offline Mode' : 'Online'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Offline Patients:</span>
              <Badge variant="outline">{offlineData.patients.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Offline Vitals:</span>
              <Badge variant="outline">{offlineData.vitals.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Offline Appointments:</span>
              <Badge variant="outline">{offlineData.appointments.length}</Badge>
            </div>
          </div>

          {lastSyncTime && (
            <div className="text-xs text-muted-foreground">
              Last sync: {lastSyncTime.toLocaleString()}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleOfflineMode}
              variant={isOfflineMode ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {isOfflineMode ? (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Go Online
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Simulate Offline
                </>
              )}
            </Button>

            {offlineCount > 0 && (
              <Button
                onClick={syncOfflineData}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isOfflineMode}
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync Data ({offlineCount})
              </Button>
            )}

            {offlineCount > 0 && (
              <Button
                onClick={clearOfflineData}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Offline Data
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Demo Mode:</strong> This simulates offline functionality. 
            Toggle offline mode to test data storage and sync capabilities.
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
