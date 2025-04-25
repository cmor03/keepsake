# Environment Variables Setup Guide

To fix the upload error, ensure you have properly configured the following environment variables:

## Required Environment Variables

Create a `.env.local` file in the root of your project with these variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/keepsake?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Vercel Blob Storage (required for file uploads) - CRITICAL FOR UPLOADS
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Sending (optional)
EMAIL_FROM=info@keepsake.ink
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=username
EMAIL_SMTP_PASSWORD=password
```

## Getting a Vercel Blob Storage Token

The error you're experiencing is likely due to a missing or invalid `BLOB_READ_WRITE_TOKEN`. 

To get a Vercel Blob Storage token:

1. If using Vercel for deployments:
   ```bash
   npx vercel env pull .env.local
   ```

2. Or create a new token in the Vercel dashboard:
   - Go to your project in the Vercel dashboard
   - Navigate to Storage → Blob
   - Create a new token with read/write permissions
   - Add the token to your `.env.local` file

## MongoDB Connection

Ensure your MongoDB connection string is correct and the user has the right permissions. 
Each new Clerk user should be automatically synced to MongoDB when they sign in, but this requires the database connection to work properly.

## Testing Changes

After making these changes:
1. Stop your development server
2. Run `npm run dev` to restart with the new environment variables
3. Try uploading again 