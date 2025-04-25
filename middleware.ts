import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NextFetchEvent } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                   // Homepage
  '/sign-in(.*)',        // Sign-in pages
  '/sign-up(.*)',        // Sign-up pages
  '/api/webhook(.*)',    // Webhooks
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
  
  // Process all routes through Clerk middleware
  const handler = clerkMiddleware((auth, reqInner) => {
    const isPublic = isPublicRoute(reqInner);
    console.log(`Path: ${path}, Public: ${isPublic}`);
    
    if (!isPublic) {
      // Protect all non-public routes
      auth.protect();
    }
  }, {
    authorizedParties: [
      'https://keepsake.app', 
      'https://*.keepsake.app',
      'https://www.keepsake.ink',
      'https://*.keepsake.ink',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:*'
    ],
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