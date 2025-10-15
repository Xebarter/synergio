import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  // Add other environment variables here as needed
});

type EnvVars = z.infer<typeof envSchema>;

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(env.error.format(), null, 2));
  throw new Error('Invalid environment variables');
}

export const config = env.data as EnvVars;

// Export commonly used config values
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';

// Database configuration
export const dbConfig = {
  url: config.DATABASE_URL,
  // Add other database-specific configurations here
};

// Auth configuration
export const authConfig = {
  secret: config.NEXTAUTH_SECRET,
  url: config.NEXTAUTH_URL,
  // Add other auth-specific configurations here
};
