import { Pool } from "pg"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err)
  } else {
    console.log("Database connected:", res.rows[0].now)
  }
})

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

// User authentication functions
export async function createUser(email: string, password: string, fullName: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const userId = uuidv4()

  const result = await query(
    `INSERT INTO public.profiles (id, email, password_hash, full_name, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id, email, full_name`,
    [userId, email, hashedPassword, fullName]
  )

  return result.rows[0]
}

export async function verifyUser(email: string, password: string) {
  const result = await query(
    "SELECT id, email, password_hash, full_name FROM public.profiles WHERE email = $1",
    [email]
  )

  if (result.rows.length === 0) {
    return null
  }

  const user = result.rows[0]
  const passwordValid = await bcrypt.compare(password, user.password_hash)

  if (!passwordValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
  }
}

export async function getUserById(id: string) {
  const result = await query(
    "SELECT id, email, full_name FROM public.profiles WHERE id = $1",
    [id]
  )

  if (result.rows.length === 0) {
    return null
  }

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
  }
}

// Business ideas functions
export async function getBusinessIdeas(userId: string) {
  const result = await query("SELECT * FROM business_ideas WHERE user_id = $1 ORDER BY created_at DESC", [userId])
  return result.rows
}

export async function createBusinessIdea(
  userId: string,
  title: string,
  description: string,
  industry: string,
  investmentMin: number,
  investmentMax: number,
  location: string,
) {
  const result = await query(
    `INSERT INTO business_ideas 
     (id, user_id, title, description, industry, investment_min, investment_max, location, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
     RETURNING *`,
    [uuidv4(), userId, title, description, industry, investmentMin, investmentMax, location],
  )
  return result.rows[0]
}

export async function deleteBusinessIdea(id: string, userId: string) {
  // First delete any associated financial projections
  await query("DELETE FROM financial_projections WHERE idea_id = $1", [id])

  // Then delete the idea
  const result = await query("DELETE FROM business_ideas WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId])
  return result.rows[0]
}

// Financial projections functions
export async function getFinancialProjections(userId: string) {
  const result = await query(
    `SELECT fp.*, bi.title, bi.industry, bi.location 
     FROM financial_projections fp
     JOIN business_ideas bi ON fp.idea_id = bi.id
     WHERE fp.user_id = $1 
     ORDER BY fp.created_at DESC`,
    [userId],
  )
  return result.rows
}

export async function getFinancialProjectionById(id: string, userId: string) {
  const result = await query(
    `SELECT fp.*, bi.title, bi.industry, bi.location 
     FROM financial_projections fp
     JOIN business_ideas bi ON fp.idea_id = bi.id
     WHERE fp.id = $1 AND fp.user_id = $2`,
    [id, userId],
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

export async function createFinancialProjection(
  userId: string,
  ideaId: string,
  startupCosts: number,
  monthlyExpenses: number,
  projectedRevenue: number,
  breakEvenMonths: number,
) {
  const result = await query(
    `INSERT INTO financial_projections 
     (id, user_id, idea_id, startup_costs, monthly_expenses, projected_revenue, break_even_months, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
     RETURNING *`,
    [uuidv4(), userId, ideaId, startupCosts, monthlyExpenses, projectedRevenue, breakEvenMonths],
  )
  return result.rows[0]
}

export async function deleteFinancialProjection(id: string, userId: string) {
  const result = await query("DELETE FROM financial_projections WHERE id = $1 AND user_id = $2 RETURNING *", [
    id,
    userId,
  ])
  return result.rows[0]
}

// Dashboard statistics
export async function getDashboardStats(userId: string) {
  try {
    // Get total business ideas
    const ideasResult = await query(
      "SELECT COUNT(*) as count FROM business_ideas WHERE user_id = $1",
      [userId]
    )
    const totalIdeas = parseInt(ideasResult.rows[0].count)

    // Get financial projections count
    const projectionsResult = await query(
      "SELECT COUNT(*) as count FROM financial_projections WHERE user_id = $1",
      [userId]
    )
    const financialProjections = parseInt(projectionsResult.rows[0].count)

    return {
      generatedIdeas: totalIdeas,
      savedIdeas: totalIdeas, // Since we're not using a separate saved_ideas table
      financialProjections,
      resources: 0 // We don't have resources in our database yet
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      generatedIdeas: 0,
      savedIdeas: 0,
      financialProjections: 0,
      resources: 0
    }
  }
}
