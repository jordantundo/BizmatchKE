import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return new NextResponse("Email and password are required", { status: 400 })
    }

    // Get user from database
    const result = await query(
      `SELECT id, email, password_hash, full_name 
       FROM profiles 
       WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return new NextResponse("Invalid email or password", { status: 401 })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return new NextResponse("Invalid email or password", { status: 401 })
    }

    // Create session
    const session = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    }

    // Set session cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({
      user: session.user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
