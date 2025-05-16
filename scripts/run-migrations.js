const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Add validation for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set')
  process.exit(1)
}

// Log the connection string (without credentials) for debugging
const sanitizedUrl = process.env.DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
console.log('Connecting to database:', sanitizedUrl)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render
  }
})

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    // Start transaction
    await client.query('BEGIN')

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    // Get list of executed migrations
    const { rows: executedMigrations } = await client.query(
      'SELECT name FROM migrations'
    )
    const executedMigrationNames = executedMigrations.map(m => m.name)

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}`)
        
        const migrationPath = path.join(migrationsDir, file)
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
        
        await client.query(migrationSQL)
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        )
        
        console.log(`Completed migration: ${file}`)
      }
    }

    // Commit transaction
    await client.query('COMMIT')
    console.log('All migrations completed successfully')
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
