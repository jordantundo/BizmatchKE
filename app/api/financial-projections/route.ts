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

    const result = await query(
      `SELECT 
        fp.id,
        fp.idea_id,
        fp.startup_costs,
        fp.monthly_expenses,
        fp.projected_revenue,
        fp.break_even_months,
        fp.created_at,
        fp.updated_at,
        json_build_object(
          'title', bi.title,
          'description', bi.description,
          'industry', bi.industry,
          'location', bi.location
        ) as business_idea
       FROM financial_projections fp
       JOIN business_ideas bi ON fp.idea_id = bi.id
       WHERE fp.user_id = $1
       ORDER BY fp.created_at DESC`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching financial projections:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Not authenticated", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    const { ideaId, startupCosts, monthlyExpenses, projectedRevenue, breakEvenMonths } = await request.json()

    const result = await query(
      `INSERT INTO financial_projections 
       (user_id, idea_id, startup_costs, monthly_expenses, projected_revenue, break_even_months)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, ideaId, startupCosts, monthlyExpenses, projectedRevenue, breakEvenMonths]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating financial projection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 