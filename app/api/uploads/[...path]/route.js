import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET(req, { params }) {
  try {
    // Get file path from request params
    const filePath = params.path;
    
    if (!filePath || filePath.length < 2) {
      return new NextResponse("Invalid file path", { status: 400 });
    }
    
    // First segment should be the directory (originals or transformed)
    const directory = filePath[0];
    // Second segment is the filename
    const filename = filePath[1];
    
    // For compatibility with existing URLs, redirect to the blob URL
    // First, list blobs to find the matching one
    const { blobs } = await list({
      prefix: `${directory}/${filename}`,
    });
    
    if (blobs.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }
    
    // Redirect to the first matching blob's URL
    return NextResponse.redirect(blobs[0].url);
    
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Error serving file", { status: 500 });
  }
} 