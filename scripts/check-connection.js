const { Pool } = require('pg');
require('dotenv').config();

async function checkConnection() {
  // Log the connection string (without password)
  const connectionString = process.env.DATABASE_URL;
  const sanitizedConnection = connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  console.log('Connection string:', sanitizedConnection);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check connection details
    console.log('\nChecking database connection...');
    const connectionResult = await pool.query(`
      SELECT current_database() as db,
             current_user as user,
             version() as version,
             current_schema() as schema
    `);
    console.log('Connected to:', connectionResult.rows[0]);

    // Check if we're connected to Supabase
    const isSupabase = connectionResult.rows[0].db.includes('supabase');
    console.log('\nIs Supabase database:', isSupabase);

    // List all tables in the public schema
    console.log('\nListing all tables in public schema:');
    const tablesResult = await pool.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nTables:');
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.table_schema}.${table.table_name}`);
    });

    // Check if auth schema exists
    console.log('\nChecking for auth schema...');
    const authSchemaResult = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'auth'
      );
    `);
    console.log('Auth schema exists:', authSchemaResult.rows[0].exists);

    if (authSchemaResult.rows[0].exists) {
      console.log('\nListing auth schema tables:');
      const authTablesResult = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'auth'
        ORDER BY table_name;
      `);
      authTablesResult.rows.forEach(table => {
        console.log(`- auth.${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkConnection(); 