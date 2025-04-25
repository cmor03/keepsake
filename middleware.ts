import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
]);

// Only require authentication for non-public routes
export default clerkMiddleware((auth, req) => {
  // For debugging in development
  console.log(`Path: ${new URL(req.url).pathname}, Public: ${isPublicRoute(req)}`);
  
  if (!isPublicRoute(req)) {
    // Protect all non-public routes
    auth.protect();
  }
}, {
  authorizedParties: ['https://keepsake.app', 'https://*.keepsake.app'],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 