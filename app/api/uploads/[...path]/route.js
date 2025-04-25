import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, context) {
  try {
    // Get the file path from the URL
    const { path: filePath } = context.params;
    
    if (!filePath || filePath.length < 2) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    // The first segment is the type (originals or transformed)
    const type = filePath[0];
    // The rest of the segments form the filename
    const filename = filePath.slice(1).join('/');
    
    // Validate type
    if (type !== 'originals' && type !== 'transformed') {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Construct file path
    let fullPath;
    
    // Check if this is a uuid-prefixed file (our local storage format)
    if (filename.startsWith('uuid_')) {
      fullPath = path.join(process.cwd(), 'uploads', type, filename);
    } else {
      // If not uuid-prefixed, it could be a regular file
      fullPath = path.join(process.cwd(), 'uploads', type, filename);
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found', path: fullPath }, { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }
    
    // Return file with appropriate content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'An error occurred while serving the file', details: error.message },
      { status: 500 }
    );
  }
} 