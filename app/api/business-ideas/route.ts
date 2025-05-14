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
      `SELECT * FROM business_ideas 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

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

    const { title, description, industry, investmentMin, investmentMax, location } = await request.json()

    const result = await query(
      `INSERT INTO business_ideas 
       (user_id, title, description, industry, investment_min, investment_max, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, title, description, industry, investmentMin, investmentMax, location]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating business idea:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 