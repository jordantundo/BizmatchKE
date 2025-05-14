const { Pool } = require('pg');
require('dotenv').config();

async function debugDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Debugging database...');
    
    // First, let's see what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\nExisting tables:', tablesResult.rows.map(r => r.table_name));

    // Drop everything related to profiles
    console.log('\nDropping existing profiles table and related objects...');
    await pool.query(`
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);

    // Create the table with explicit schema
    console.log('\nCreating new profiles table...');
    await pool.query(`
      CREATE TABLE public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX profiles_email_idx ON public.profiles(email);

      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    `);

    // Verify the structure
    console.log('\nVerifying table structure...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTable structure:');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });

    // Try inserting a test row
    console.log('\nTesting insert...');
    const testResult = await pool.query(`
      INSERT INTO public.profiles (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, full_name
    `, ['test@example.com', 'test_hash', 'Test User']);
    console.log('Test insert successful:', testResult.rows[0]);

    // Clean up test data
    await pool.query('DELETE FROM public.profiles WHERE email = $1', ['test@example.com']);
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugDatabase(); 