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

    const result = await query(
      `DELETE FROM financial_projections 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [params.id, userId]
    )

    if (result.rowCount === 0) {
      return new NextResponse("Financial projection not found", { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting financial projection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 