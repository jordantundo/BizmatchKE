import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Not authenticated", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    // Fetch total business ideas
    const ideasResult = await query(
      `SELECT COUNT(*) as count FROM business_ideas WHERE user_id = $1`,
      [userId]
    )
    const totalIdeas = parseInt(ideasResult.rows[0].count)

    // Fetch financial projections
    const projectionsResult = await query(
      `SELECT COUNT(*) as count FROM financial_projections WHERE user_id = $1`,
      [userId]
    )
    const financialProjections = parseInt(projectionsResult.rows[0].count)

    // Fetch average startup cost and break-even months
    const financialDataResult = await query(
      `SELECT startup_costs, break_even_months 
       FROM financial_projections 
       WHERE user_id = $1`,
      [userId]
    )

    let averageStartupCost = 0
    let averageBreakEven = 0

    if (financialDataResult.rows.length > 0) {
      averageStartupCost = Math.round(
        financialDataResult.rows.reduce((sum, item) => sum + item.startup_costs, 0) / 
        financialDataResult.rows.length
      )
      averageBreakEven = Math.round(
        financialDataResult.rows.reduce((sum, item) => sum + item.break_even_months, 0) / 
        financialDataResult.rows.length
      )
    }

    // Fetch ideas by industry
    const industryResult = await query(
      `SELECT industry, COUNT(*) as count 
       FROM business_ideas 
       WHERE user_id = $1 
       GROUP BY industry`,
      [userId]
    )

    const ideaByIndustry: Record<string, number> = {}
    industryResult.rows.forEach((row) => {
      ideaByIndustry[row.industry] = parseInt(row.count)
    })

    // Fetch ideas by location
    const locationResult = await query(
      `SELECT location, COUNT(*) as count 
       FROM business_ideas 
       WHERE user_id = $1 
       GROUP BY location`,
      [userId]
    )

    const ideaByLocation: Record<string, number> = {}
    locationResult.rows.forEach((row) => {
      ideaByLocation[row.location] = parseInt(row.count)
    })

    // Fetch recent ideas
    const recentIdeasResult = await query(
      `SELECT * FROM business_ideas 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    )

    // Fetch recent projections
    const recentProjectionsResult = await query(
      `SELECT fp.*, bi.title as business_idea_title 
       FROM financial_projections fp
       JOIN business_ideas bi ON fp.idea_id = bi.id
       WHERE fp.user_id = $1
       ORDER BY fp.created_at DESC 
       LIMIT 5`,
      [userId]
    )

    return NextResponse.json({
      totalIdeas,
      savedIdeas: totalIdeas, // Since we're not using a separate saved_ideas table
      financialProjections,
      averageStartupCost,
      averageBreakEven,
      ideaByIndustry,
      ideaByLocation,
      recentIdeas: recentIdeasResult.rows,
      recentProjections: recentProjectionsResult.rows.map(row => ({
        ...row,
        business_idea: {
          title: row.business_idea_title
        }
      }))
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
