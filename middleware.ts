import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NextFetchEvent } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                   // Homepage
  '/upload',             // Upload page and its direct path
  '/upload/((?!checkout|confirmation|transform).*)', // Upload subpaths except protected ones 
  '/sign-in(.*)',        // Sign-in pages
  '/sign-up(.*)',        // Sign-up pages
  '/api/uploads(.*)',    // API routes for uploads
  '/api/orders(.*)',     // API routes for orders
  '/api/images(.*)',     // API routes for images
  '/api/webhook(.*)',    // Webhooks
  '/api/upload(.*)',     // Any upload-related API route
  '/terms(.*)',          // Legal pages
  '/privacy(.*)',        // Legal pages
  '/faq(.*)',            // FAQ
  '/pricing(.*)',        // Pricing
  '/how-it-works(.*)',   // Marketing pages
  '/contact(.*)',        // Contact page
  '/(.*)\\.png',         // Allow PNG files
  '/(.*)\\.jpg',         // Allow JPG files
  '/(.*)\\.jpeg',        // Allow JPEG files
  '/(.*)\\.webp',        // Allow WEBP files
  '/(.*)\\.gif',         // Allow GIF files
]);

// Middleware handler
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // For debugging in development
  console.log(`Path: ${path}, Processing in middleware`);
  
  // Completely bypass Clerk for upload-related paths and static files
  if (
    path.startsWith('/api/uploads') || 
    path.startsWith('/api/upload') || 
    path.startsWith('/api/images') ||
    path.includes('/_next/') || 
    path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    console.log(`Bypassing Clerk for: ${path}`);
    return NextResponse.next();
  }
  
  // For all other paths, use Clerk middleware
  const handler = clerkMiddleware((auth, reqInner) => {
    const isPublic = isPublicRoute(reqInner);
    console.log(`Path: ${path}, Public: ${isPublic}`);
    
    if (!isPublic) {
      // Protect all non-public routes
      auth.protect();
    }
  }, {
    authorizedParties: ['https://keepsake.app', 'https://*.keepsake.app'],
  });
  
  return handler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Include API routes
    '/(api|trpc)(.*)',
  ],
}; 