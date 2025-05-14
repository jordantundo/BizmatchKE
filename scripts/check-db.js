const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check connection and show database info
    console.log('Checking database connection...');
    const connectionResult = await pool.query('SELECT current_database(), current_user, version()');
    console.log('Connected to database:', connectionResult.rows[0].current_database);
    console.log('Connected as user:', connectionResult.rows[0].current_user);
    console.log('PostgreSQL version:', connectionResult.rows[0].version);

    // Check if profiles table exists
    console.log('\nChecking profiles table...');
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'profiles'
      );
    `);
    console.log('Profiles table exists:', tableResult.rows[0].exists);

    if (!tableResult.rows[0].exists) {
      console.log('\nCreating profiles table...');
      await pool.query(`
        CREATE TABLE profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX profiles_email_idx ON profiles(email);

        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log('Profiles table created successfully');
    }

    // Get table structure
    console.log('\nProfiles table structure:');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nColumns:');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });

    // Check if there are any rows
    const countResult = await pool.query('SELECT COUNT(*) FROM profiles');
    console.log('\nNumber of rows in profiles table:', countResult.rows[0].count);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 