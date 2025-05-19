'use client';

import { useState, useEffect } from 'react';

export default function ImageDebugPage() {
  const [timestamp, setTimestamp] = useState<string>('');
  
  useEffect(() => {
    setTimestamp(new Date().toISOString());
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Debug Page</h1>
      <p className="mb-4">Timestamp: {timestamp}</p>
      
      <div className="space-y-8">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Root Path Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">doctor-with-child.jpg</h3>
              <img 
                src="/doctor-with-child.jpg" 
                alt="Doctor with child" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">maternal-care.jpg</h3>
              <img 
                src="/maternal-care.jpg" 
                alt="Maternal care" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Images Folder Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">images/doctor-with-child.jpg</h3>
              <img 
                src="/images/doctor-with-child.jpg" 
                alt="Doctor with child" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">images/maternal-care.jpg</h3>
              <img 
                src="/images/maternal-care.jpg" 
                alt="Maternal care" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">With Query Parameters (cache busting)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">doctor-with-child.jpg?t={timestamp}</h3>
              <img 
                src={`/doctor-with-child.jpg?t=${timestamp}`}
                alt="Doctor with child" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">images/doctor-with-child.jpg?t={timestamp}</h3>
              <img 
                src={`/images/doctor-with-child.jpg?t=${timestamp}`}
                alt="Doctor with child" 
                className="w-full h-auto border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 