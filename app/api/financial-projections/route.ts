import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, createFinancialProjections, getFinancialProjections } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Not authenticated", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    const projections = await getFinancialProjections(userId)
    return NextResponse.json(projections)
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

    const {
      idea_id,
      startup_costs,
      monthly_expenses,
      projected_revenue,
      break_even_months,
      working_capital,
      sensitivity_analysis,
      scenario_analysis,
      cost_breakdown,
      growth_rate
    } = await request.json()

    // Validate input data
    if (!idea_id || !startup_costs || !monthly_expenses || !projected_revenue || !break_even_months) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Validate numeric values
    if (isNaN(startup_costs) || isNaN(monthly_expenses) || isNaN(projected_revenue) || isNaN(break_even_months)) {
      return new NextResponse("Invalid numeric values", { status: 400 })
    }

    // Create financial projections with enhanced calculations
    try {
      const projection = await createFinancialProjections(
        userId,
        idea_id,
        startup_costs,
        monthly_expenses,
        projected_revenue,
        break_even_months,
        working_capital,
        sensitivity_analysis,
        scenario_analysis,
        cost_breakdown,
        growth_rate
      )

      // Fetch the complete projection data including business idea details
      const completeProjection = await getFinancialProjections(userId)
      const newProjection = completeProjection.find(p => p.id === projection.id)

      if (!newProjection) {
        throw new Error("Failed to fetch created projection")
      }

      return NextResponse.json(newProjection)
    } catch (error: any) {
      return new NextResponse(error.message || "Error creating financial projection", { status: 400 })
    }
  } catch (error) {
    console.error("Error creating financial projections:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 