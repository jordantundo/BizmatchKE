import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear the session cookie
    cookies().delete("session")

    return new NextResponse(null, {
      status: 204,
    })
  } catch (error) {
    console.error("Error signing out:", error)
    return new NextResponse("Internal Server Error", {
      status: 500,
    })
  }
} 