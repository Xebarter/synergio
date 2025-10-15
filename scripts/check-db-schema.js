const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

async function checkDatabaseSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check products table structure
    const productsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `;
    
    const productsResult = await client.query(productsQuery);
    console.log('\nProducts table structure:');
    console.log('Column Name\t\tData Type\t\tNullable');
    console.log('--------------------------------------------------------');
    productsResult.rows.forEach(row => {
      console.log(`${row.column_name}\t\t${row.data_type}\t\t${row.is_nullable}`);
    });

    // Check categories table structure
    const categoriesQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `;
    
    const categoriesResult = await client.query(categoriesQuery);
    console.log('\n\nCategories table structure:');
    console.log('Column Name\t\tData Type\t\tNullable');
    console.log('--------------------------------------------------------');
    categoriesResult.rows.forEach(row => {
      console.log(`${row.column_name}\t\t${row.data_type}\t\t${row.is_nullable}`);
    });

    // Check if categories exist
    const categoriesDataQuery = `
      SELECT id, name FROM categories LIMIT 10;
    `;
    
    const categoriesDataResult = await client.query(categoriesDataQuery);
    console.log('\n\nCategories data:');
    console.log('ID\t\t\t\tName');
    console.log('--------------------------------------------------------');
    categoriesDataResult.rows.forEach(row => {
      console.log(`${row.id}\t${row.name}`);
    });

  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabaseSchema();