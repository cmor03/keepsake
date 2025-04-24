import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // Get file path from request params
    const filePath = params.path;
    
    // Construct the full path to the file
    const uploadsDir = path.join(process.cwd(), "uploads");
    const fullPath = path.join(uploadsDir, ...filePath);
    
    // Ensure the file exists
    try {
      await fs.access(fullPath);
    } catch {
      console.error(`File not found: ${fullPath}`, error);
      return new NextResponse("File not found", { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    };
    
    const contentType = contentTypeMap[ext] || "application/octet-stream";
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    console.error("Error serving file:", error);
    return new NextResponse("Error serving file", { status: 500 });
  }
} 