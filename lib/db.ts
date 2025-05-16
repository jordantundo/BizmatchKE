import { Pool } from "pg"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  }
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
  skillsRequired: string[] = [],
  targetMarket: string = "",
  potentialChallenges: string[] = [],
  successFactors: string[] = [],
  marketTrends: string[] = [],
  successRateEstimate: string = "",
  estimatedRoi: string = "",
  economicData: any = {}
) {
  try {
    const result = await query(
      `INSERT INTO business_ideas 
       (id, user_id, title, description, industry, investment_min, investment_max, location, 
        skills_required, target_market, potential_challenges, success_factors, market_trends,
        success_rate_estimate, estimated_roi, economic_data, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()) 
       RETURNING *`,
      [
        uuidv4(),
        userId,
        title,
        description,
        industry,
        investmentMin,
        investmentMax,
        location,
        JSON.stringify(skillsRequired || []),
        targetMarket || "",
        JSON.stringify(potentialChallenges || []),
        JSON.stringify(successFactors || []),
        JSON.stringify(marketTrends || []),
        successRateEstimate || "",
        estimatedRoi || "",
        JSON.stringify(economicData || {})
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error in createBusinessIdea:", error)
    throw error
  }
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
    `SELECT fp.*, bi.title, bi.description, bi.industry, bi.location 
     FROM financial_projections fp
     JOIN business_ideas bi ON fp.idea_id = bi.id
     WHERE fp.user_id = $1 
     ORDER BY fp.created_at DESC`,
    [userId],
  )

  // Transform the result to match the expected format and calculate metrics
  return result.rows.map(row => {
    const monthlyProfit = row.projected_revenue - row.monthly_expenses
    const annualProfit = monthlyProfit * 12
    const profitMargin = ((monthlyProfit / row.projected_revenue) * 100)
    const annualRoi = ((annualProfit / row.startup_costs) * 100)

    const businessIdea = {
      title: row.title,
      description: row.description,
      industry: row.industry,
      location: row.location
    }

    // Remove business idea fields from the main object
    delete row.title
    delete row.description
    delete row.industry
    delete row.location

    return {
      ...row,
      business_idea: businessIdea,
      monthly_profit: monthlyProfit,
      annual_profit: annualProfit,
      profit_margin: profitMargin,
      annual_roi: annualRoi
    }
  })
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

export async function createFinancialProjections(
  userId: string,
  ideaId: string,
  startupCosts: number,
  monthlyExpenses: number,
  projectedRevenue: number,
  breakEvenMonths: number,
  workingCapital: number,
  sensitivityAnalysis: any,
  scenarioAnalysis: any,
  costBreakdown: any,
  growthRate: number
) {
  try {
    // Validate inputs
    if (startupCosts <= 0) throw new Error("Startup costs must be positive")
    if (monthlyExpenses <= 0) throw new Error("Monthly expenses must be positive")
    if (projectedRevenue <= 0) throw new Error("Projected revenue must be positive")
    if (breakEvenMonths <= 0) throw new Error("Break-even months must be positive")
    if (monthlyExpenses >= projectedRevenue) throw new Error("Monthly expenses cannot be greater than projected revenue")

    // Calculate additional financial metrics
    const monthlyProfit = projectedRevenue - monthlyExpenses
    const annualProfit = monthlyProfit * 12
    const roi = ((annualProfit / startupCosts) * 100).toFixed(2)
    const paybackPeriod = Math.ceil(startupCosts / monthlyProfit)
    
    // Calculate cash flow projections for first year
    const monthlyCashFlows = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const cumulativeProfit = monthlyProfit * month
      return {
        month,
        revenue: projectedRevenue,
        expenses: monthlyExpenses,
        profit: monthlyProfit,
        cumulative_profit: cumulativeProfit
      }
    })

    console.log("Creating financial projection with values:", {
      userId,
      ideaId,
      startupCosts,
      monthlyExpenses,
      projectedRevenue,
      breakEvenMonths,
      monthlyProfit,
      annualProfit,
      roi,
      paybackPeriod,
      workingCapital,
      sensitivityAnalysis,
      scenarioAnalysis,
      costBreakdown,
      growthRate
    })

    const result = await query(
      `INSERT INTO financial_projections 
       (id, user_id, idea_id, startup_costs, monthly_expenses, projected_revenue, 
        break_even_months, roi, payback_period, monthly_cash_flows, working_capital,
        sensitivity_analysis, scenario_analysis, cost_breakdown, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) 
       RETURNING *`,
      [
        uuidv4(),
        userId,
        ideaId,
        startupCosts,
        monthlyExpenses,
        projectedRevenue,
        breakEvenMonths,
        roi,
        paybackPeriod,
        JSON.stringify(monthlyCashFlows),
        workingCapital,
        JSON.stringify(sensitivityAnalysis),
        JSON.stringify(scenarioAnalysis),
        JSON.stringify(costBreakdown)
      ]
    )

    if (!result.rows[0]) {
      throw new Error("Failed to create financial projection")
    }

    console.log("Financial projection created:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error("Error in createFinancialProjections:", error)
    throw error
  }
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
