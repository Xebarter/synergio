const { Client } = require('pg');
require('dotenv').config();

async function testPostgresConnection() {
  console.log('Testing direct PostgreSQL connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Try a simple query
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    console.error('Error stack:', err.stack);
    process.exit(1);
  }
}

testPostgresConnection();