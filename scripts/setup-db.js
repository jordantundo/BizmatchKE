const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")
require('dotenv').config()

// Load environment variables from .env.local if it exists
try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  const envVars = envFile.split("\n").filter(Boolean)

  for (const line of envVars) {
    const [key, value] = line.split("=")
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  }
} catch (error) {
  console.log("No .env.local file found, using existing environment variables")
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// SQL schema
const schema = `
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (replacing Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create business_ideas table
CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  investment_min INTEGER NOT NULL DEFAULT 0,
  investment_max INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create financial_projections table
CREATE TABLE IF NOT EXISTS financial_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES business_ideas(id) ON DELETE CASCADE,
  startup_costs INTEGER NOT NULL,
  monthly_expenses INTEGER NOT NULL,
  projected_revenue INTEGER NOT NULL,
  break_even_months INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS business_ideas_user_id_idx ON business_ideas(user_id);
CREATE INDEX IF NOT EXISTS financial_projections_user_id_idx ON financial_projections(user_id);
CREATE INDEX IF NOT EXISTS financial_projections_idea_id_idx ON financial_projections(idea_id);
`

async function setupDatabase() {
  try {
    console.log("Setting up database...")

    // Drop existing tables
    console.log("\nDropping existing tables...")
    await pool.query(`
      DROP TABLE IF EXISTS public.financial_projections CASCADE;
      DROP TABLE IF EXISTS public.business_ideas CASCADE;
      DROP TABLE IF EXISTS public.profiles CASCADE;
    `)

    // Create profiles table
    console.log("\nCreating profiles table...")
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
    `)

    // Create business_ideas table
    console.log("\nCreating business_ideas table...")
    await pool.query(`
      CREATE TABLE public.business_ideas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        industry VARCHAR(100),
        investment_min DECIMAL(12,2),
        investment_max DECIMAL(12,2),
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX business_ideas_user_id_idx ON public.business_ideas(user_id);
    `)

    // Create financial_projections table
    console.log("\nCreating financial_projections table...")
    await pool.query(`
      CREATE TABLE public.financial_projections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        idea_id UUID NOT NULL REFERENCES public.business_ideas(id) ON DELETE CASCADE,
        startup_costs DECIMAL(12,2) NOT NULL,
        monthly_expenses DECIMAL(12,2) NOT NULL,
        projected_revenue DECIMAL(12,2) NOT NULL,
        break_even_months INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX financial_projections_user_id_idx ON public.financial_projections(user_id);
      CREATE INDEX financial_projections_idea_id_idx ON public.financial_projections(idea_id);
    `)

    // Create updated_at trigger function
    console.log("\nCreating updated_at trigger function...")
    await pool.query(`
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    // Create triggers for all tables
    console.log("\nCreating triggers...")
    await pool.query(`
      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

      CREATE TRIGGER update_business_ideas_updated_at
        BEFORE UPDATE ON public.business_ideas
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

      CREATE TRIGGER update_financial_projections_updated_at
        BEFORE UPDATE ON public.financial_projections
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    `)

    // Verify the structure
    console.log("\nVerifying table structure...")
    const tablesResult = await pool.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)
    
    console.log("\nTables created:")
    tablesResult.rows.forEach(table => {
      console.log(`- ${table.table_schema}.${table.table_name}`)
    })

    // Test insert
    console.log("\nTesting insert...")
    const testResult = await pool.query(`
      INSERT INTO public.profiles (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, full_name
    `, ['test@example.com', 'test_hash', 'Test User'])
    console.log('Test insert successful:', testResult.rows[0])

    // Clean up test data
    await pool.query('DELETE FROM public.profiles WHERE email = $1', ['test@example.com'])
    console.log('Test data cleaned up')

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await pool.end()
  }
}

setupDatabase()
