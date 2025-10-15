const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // List all schemas
    console.log('\n🔍 Listing all schemas:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
    `);
    
    if (schemas.rows.length === 0) {
      console.log('No schemas found. The database might be empty.');
    } else {
      console.log('Available schemas:', schemas.rows.map(r => r.schema_name));
    }
    
    // For each schema, list tables
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n📂 Schema: ${schemaName}`);
      
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
      `, [schemaName]);
      
      console.log(`   Tables: ${tables.rows.length > 0 ? tables.rows.map(t => t.table_name).join(', ') : 'None'}`);
    }
    
    // Check if auth.users exists (Supabase Auth)
    try {
      const authUsers = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'auth' 
          AND table_name = 'users'
        )
      `);
      console.log('\n🔐 Auth users table exists:', authUsers.rows[0].exists);
      
      if (!authUsers.rows[0].exists) {
        console.log('\n⚠️  The auth.users table does not exist. You need to enable Authentication in your Supabase dashboard.');
      }
    } catch (e) {
      console.log('\n⚠️  Could not check auth.users:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Authentication failed. Please check your database credentials in the .env file.');
      console.log('Make sure your DATABASE_URL is in the format: postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres');
    }
  } finally {
    if (pool) await pool.end();
    console.log('\nConnection closed');
  }
}

checkDatabase();
