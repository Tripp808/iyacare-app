import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const exists = promisify(fs.exists);

export async function GET() {
  const imagesStatus = {
    rootImages: {
      'doctor-with-child.jpg': false,
      'maternal-care.jpg': false,
    },
    imagesFolderImages: {
      'doctor-with-child.jpg': false,
      'maternal-care.jpg': false,
    }
  };

  // Check for images in the root public folder
  const publicDir = path.join(process.cwd(), 'public');
  
  imagesStatus.rootImages['doctor-with-child.jpg'] = await exists(path.join(publicDir, 'doctor-with-child.jpg'));
  imagesStatus.rootImages['maternal-care.jpg'] = await exists(path.join(publicDir, 'maternal-care.jpg'));

  // Check for images in the images folder
  const imagesDir = path.join(publicDir, 'images');
  
  imagesStatus.imagesFolderImages['doctor-with-child.jpg'] = await exists(path.join(imagesDir, 'doctor-with-child.jpg'));
  imagesStatus.imagesFolderImages['maternal-care.jpg'] = await exists(path.join(imagesDir, 'maternal-care.jpg'));

  return NextResponse.json(imagesStatus);
} 