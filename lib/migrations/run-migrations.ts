import { Pool } from "pg"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

async function runMigrations() {
  try {
    console.log("Starting database migrations...")

    // Read and execute each migration file
    const migrationsDir = path.join(process.cwd(), "lib", "migrations")
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort() // Ensure migrations run in order

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, "utf8")
      
      await query(sql)
      console.log(`Completed migration: ${file}`)
    }

    console.log("All migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  }
}

// Run migrations
runMigrations() 