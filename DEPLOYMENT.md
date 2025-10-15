# Deployment Guide: Vercel + Supabase

This guide explains how to deploy your Next.js e-commerce application to Vercel with Supabase for database, authentication, and storage.

## Prerequisites

1. Supabase account and project
2. Vercel account
3. GitHub repository with your application code

## Step 1: Set up Supabase

1. Create a new project in Supabase
2. Get your project credentials:
   - Project URL
   - Anonymous key
   - Service role key

## Step 2: Configure Environment Variables in Vercel

Add the following environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
```

## Step 3: Database Setup

1. Connect to your Supabase database using the connection string
2. Run the Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 4: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Add the environment variables from Step 2
4. Deploy!

## Supabase Integration Details

### Authentication

The application uses NextAuth.js with Supabase for authentication. The integration includes:

- Credentials provider for email/password authentication
- Google provider for social login
- Prisma adapter for user persistence

### Database

Prisma ORM is used to interact with the Supabase PostgreSQL database. All database operations go through Prisma for type safety and ease of use.

### Storage

For file storage (e.g., product images), the application uses Supabase Storage. The storage utilities can be found in [lib/utils/storage.ts](file:///D:/PROJECTS/Synergio/project/lib/utils/storage.ts).

## Troubleshooting

1. If you encounter issues with environment variables, make sure they are correctly set in Vercel
2. For database connection issues, verify your connection string and ensure the database is accessible
3. For authentication issues, check that NEXTAUTH_URL matches your deployed URL