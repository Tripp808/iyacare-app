'use client';

import { useState, useEffect } from 'react';

type ImagesStatus = {
  rootImages: {
    'doctor-with-child.jpg': boolean;
    'maternal-care.jpg': boolean;
  };
  imagesFolderImages: {
    'doctor-with-child.jpg': boolean;
    'maternal-care.jpg': boolean;
  };
};

export default function TestImagesPage() {
  const [timestamp, setTimestamp] = useState<string>('');
  const [imagesStatus, setImagesStatus] = useState<ImagesStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimestamp(new Date().toISOString());
    
    // Fetch image status from API
    fetch('/api/image-test')
      .then(response => response.json())
      .then(data => {
        setImagesStatus(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching image status:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      <p className="mb-4">Timestamp: {timestamp}</p>
      
      {loading ? (
        <p>Loading image status...</p>
      ) : imagesStatus ? (
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Image File Status:</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Root public folder:</h3>
              <ul className="list-disc pl-5">
                <li className={imagesStatus.rootImages['doctor-with-child.jpg'] ? 'text-green-600' : 'text-red-600'}>
                  doctor-with-child.jpg: {imagesStatus.rootImages['doctor-with-child.jpg'] ? 'Exists' : 'Missing'}
                </li>
                <li className={imagesStatus.rootImages['maternal-care.jpg'] ? 'text-green-600' : 'text-red-600'}>
                  maternal-care.jpg: {imagesStatus.rootImages['maternal-care.jpg'] ? 'Exists' : 'Missing'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Public/images folder:</h3>
              <ul className="list-disc pl-5">
                <li className={imagesStatus.imagesFolderImages['doctor-with-child.jpg'] ? 'text-green-600' : 'text-red-600'}>
                  doctor-with-child.jpg: {imagesStatus.imagesFolderImages['doctor-with-child.jpg'] ? 'Exists' : 'Missing'}
                </li>
                <li className={imagesStatus.imagesFolderImages['maternal-care.jpg'] ? 'text-green-600' : 'text-red-600'}>
                  maternal-care.jpg: {imagesStatus.imagesFolderImages['maternal-care.jpg'] ? 'Exists' : 'Missing'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-600">Failed to load image status</p>
      )}
      
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">maternal-care.jpg</h3>
              <img 
                src="/maternal-care.jpg" 
                alt="Maternal care" 
                className="w-full h-auto border border-gray-300 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
        />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
      </div>
            <div>
              <h3 className="font-medium mb-2">images/maternal-care.jpg</h3>
        <img 
          src="/images/maternal-care.jpg" 
          alt="Maternal care" 
                className="w-full h-auto border border-gray-300 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
        />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">images/doctor-with-child.jpg?t={timestamp}</h3>
              <img 
                src={`/images/doctor-with-child.jpg?t=${timestamp}`}
                alt="Doctor with child" 
                className="w-full h-auto border border-gray-300 rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C0%2C0%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
        />
              <p className="text-red-500 mt-1 hidden">Failed to load image</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 