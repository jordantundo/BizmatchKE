import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return new NextResponse("Not authenticated", { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.user.id

    // First delete associated financial projections
    await query(
      `DELETE FROM financial_projections 
       WHERE idea_id = $1 AND user_id = $2`,
      [params.id, userId]
    )

    // Then delete the business idea
    const result = await query(
      `DELETE FROM business_ideas 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [params.id, userId]
    )

    if (result.rowCount === 0) {
      return new NextResponse("Business idea not found", { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting business idea:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 