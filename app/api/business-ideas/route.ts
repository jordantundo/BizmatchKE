import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query, createBusinessIdea } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Not authenticated", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    const result = await query("SELECT * FROM business_ideas WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching business ideas:", error)
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

    console.log("Received request to create business idea for user:", userId)

    const body = await request.json()
    console.log("Request body:", body)

    const {
      title,
      description,
      industry,
      investment_min,
      investment_max,
      location,
      skills_required,
      target_market,
      potential_challenges,
      success_factors,
      market_trends,
      success_rate_estimate,
      estimated_roi,
      economic_data
    } = body

    // Validate required fields
    if (!title || !description || !industry || investment_min === undefined || investment_max === undefined || !location) {
      console.error("Missing required fields:", { title, description, industry, investment_min, investment_max, location })
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Validate and convert numeric values
    const investmentMin = Number(investment_min)
    const investmentMax = Number(investment_max)
    
    if (isNaN(investmentMin) || isNaN(investmentMax)) {
      console.error("Invalid investment values:", { investment_min, investment_max })
      return new NextResponse("Invalid investment values", { status: 400 })
    }

    // Create business idea
    try {
      console.log("Creating business idea with values:", {
        userId,
        title,
        description,
        industry,
        investmentMin,
        investmentMax,
        location,
        skills_required,
        target_market,
        potential_challenges,
        success_factors,
        market_trends,
        success_rate_estimate,
        estimated_roi,
        economic_data
      })

      const idea = await createBusinessIdea(
        userId,
        title,
        description,
        industry,
        investmentMin,
        investmentMax,
        location,
        skills_required,
        target_market,
        potential_challenges,
        success_factors,
        market_trends,
        success_rate_estimate,
        estimated_roi,
        economic_data
      )

      console.log("Successfully created business idea:", idea)
      return NextResponse.json(idea)
    } catch (error: any) {
      console.error("Error in createBusinessIdea:", error)
      return new NextResponse(error.message || "Error creating business idea", { status: 400 })
    }
  } catch (error) {
    console.error("Error in POST /api/business-ideas:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 