import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function migrateDatabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  console.log('Starting database migration...');

  try {
    // This is where you would run your database migrations
    // For now, we'll just check if we can connect to the database
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
    
    if (error) {
      console.error('Error connecting to database:', error.message);
      process.exit(1);
    }

    console.log('Database connection successful');
    console.log('User count:', data);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
