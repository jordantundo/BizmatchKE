import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"

export async function GET(
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
      `SELECT fp.*, bi.title, bi.description, bi.industry, bi.location 
       FROM financial_projections fp
       JOIN business_ideas bi ON fp.idea_id = bi.id
       WHERE fp.id = $1 AND fp.user_id = $2`,
      [params.id, userId]
    )

    if (result.rows.length === 0) {
      return new NextResponse("Financial projection not found", { status: 404 })
    }

    const projection = result.rows[0]
    const businessIdea = {
      title: projection.title,
      description: projection.description,
      industry: projection.industry,
      location: projection.location
    }

    // Remove business idea fields from projection
    delete projection.title
    delete projection.description
    delete projection.industry
    delete projection.location

    return NextResponse.json({
      ...projection,
      business_idea: businessIdea
    })
  } catch (error) {
    console.error("Error fetching financial projection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

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