import { OfflineDemo } from '@/components/offline-demo';

export default function OfflineDemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Offline Functionality Demo</h1>
        <p className="text-muted-foreground">
          Experience IyàCare's simulated offline capabilities. Toggle offline mode using the status indicator 
          in the header to test data storage and synchronization.
        </p>
      </div>
      
      <OfflineDemo />
    </div>
  );
}
