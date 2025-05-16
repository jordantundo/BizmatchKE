const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a connection pool using the same configuration as the app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_enhance_business_ideas.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration(); 