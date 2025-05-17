import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require',
  },
})

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()")
    console.log("Database connected successfully at:", res.rows[0].now)
    process.exit(0)
  } catch (err) {
    console.error("Database connection error:", err)
    process.exit(1)
  }
}

testConnection() 