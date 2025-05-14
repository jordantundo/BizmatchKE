const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function testDatabase() {
  const client = await pool.connect()
  try {
    console.log("Testing database connection...")

    // Test 1: Basic Connection
    const result = await client.query("SELECT NOW()")
    console.log("✅ Database connection successful:", result.rows[0].now)

    // Test 2: Create Test User
    const testUser = {
      id: uuidv4(),
      email: "test@example.com",
      password: "testpassword123",
      fullName: "Test User"
    }

    const hashedPassword = await bcrypt.hash(testUser.password, 10)

    await client.query("BEGIN")

    // Insert user
    await client.query(
      "INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)",
      [testUser.id, testUser.email, hashedPassword, testUser.fullName]
    )

    // Insert profile
    await client.query(
      "INSERT INTO profiles (id, full_name, email) VALUES ($1, $2, $3)",
      [testUser.id, testUser.fullName, testUser.email]
    )

    await client.query("COMMIT")
    console.log("✅ Test user created successfully")

    // Test 3: Verify User
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [testUser.email]
    )
    console.log("✅ User verification successful:", userResult.rows[0].email)

    // Test 4: Create Business Idea
    const businessIdea = {
      id: uuidv4(),
      title: "Test Business",
      description: "A test business idea",
      industry: "Technology",
      investmentMin: 1000,
      investmentMax: 5000,
      location: "Nairobi"
    }

    await client.query(
      "INSERT INTO business_ideas (id, user_id, title, description, industry, investment_min, investment_max, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [businessIdea.id, testUser.id, businessIdea.title, businessIdea.description, businessIdea.industry, businessIdea.investmentMin, businessIdea.investmentMax, businessIdea.location]
    )
    console.log("✅ Business idea created successfully")

    // Test 5: Create Financial Projection
    const financialProjection = {
      id: uuidv4(),
      startupCosts: 5000,
      monthlyExpenses: 1000,
      projectedRevenue: 2000,
      breakEvenMonths: 6
    }

    await client.query(
      "INSERT INTO financial_projections (id, user_id, idea_id, startup_costs, monthly_expenses, projected_revenue, break_even_months) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [financialProjection.id, testUser.id, businessIdea.id, financialProjection.startupCosts, financialProjection.monthlyExpenses, financialProjection.projectedRevenue, financialProjection.breakEvenMonths]
    )
    console.log("✅ Financial projection created successfully")

    // Test 6: Clean up test data
    await client.query("DELETE FROM financial_projections WHERE user_id = $1", [testUser.id])
    await client.query("DELETE FROM business_ideas WHERE user_id = $1", [testUser.id])
    await client.query("DELETE FROM profiles WHERE id = $1", [testUser.id])
    await client.query("DELETE FROM users WHERE id = $1", [testUser.id])
    console.log("✅ Test data cleaned up successfully")

    console.log("\n🎉 All database tests completed successfully!")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("❌ Database test failed:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the tests
testDatabase().catch(console.error) 