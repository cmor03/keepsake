import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, context) {
  try {
    // Properly await the params before destructuring
    const { type, filename } = await context.params;
    
    // Validate type
    if (type !== 'originals' && type !== 'transformed') {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }
    
    // Return file with appropriate content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'An error occurred while serving the file' },
      { status: 500 }
    );
  }
} 