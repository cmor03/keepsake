import { put as vercelPut } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Fallback storage using local files when Vercel Blob is not configured
const saveToLocalStorage = async (filename, file, options = {}) => {
  // Create uploads directory if it doesn't exist
  const dir = path.join(process.cwd(), 'uploads', 'originals');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Generate a unique filename
  const fileExt = path.extname(filename);
  const uniqueFilename = filename.includes('uuid_') 
    ? filename 
    : `uuid_${uuidv4()}${fileExt}`;
  
  const filePath = path.join(dir, uniqueFilename);
  
  // Convert file to buffer
  let buffer;
  if (file instanceof Buffer) {
    buffer = file;
  } else if (file.arrayBuffer) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    throw new Error('Unsupported file format');
  }
  
  // Write file
  fs.writeFileSync(filePath, buffer);
  
  // Generate a URL for local development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/uploads/originals/${uniqueFilename}`;
  
  return {
    url,
    pathname: `/uploads/originals/${uniqueFilename}`,
    contentType: options.contentType || 'application/octet-stream',
    contentDisposition: options.contentDisposition || null,
  };
};

// Universal storage function that tries Vercel Blob first, then falls back to local storage
export async function put(filename, file, options = {}) {
  try {
    // Check if Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob storage
      console.log('Using Vercel Blob storage for file upload');
      return await vercelPut(filename, file, options);
    } else {
      // Fall back to local storage
      console.log('BLOB_READ_WRITE_TOKEN not found, falling back to local storage');
      return await saveToLocalStorage(filename, file, options);
    }
  } catch (error) {
    console.error('Storage error:', error);
    
    // If Vercel Blob fails, try local storage as backup
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Vercel Blob storage failed, trying local storage as fallback');
      return await saveToLocalStorage(filename, file, options);
    }
    
    throw error;
  }
} 