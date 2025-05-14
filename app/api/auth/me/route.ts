import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    // Get user profile from database
    const result = await query(
      `SELECT id, email, full_name, avatar_url, created_at 
       FROM profiles 
       WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 