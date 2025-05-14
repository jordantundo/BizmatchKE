import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Registration request body:", body)
    
    const { email, password, fullName, full_name } = body

    // Handle both fullName and full_name
    const fullNameValue = fullName || full_name
    console.log("Processed values:", { email, fullNameValue })

    if (!email || !password || !fullNameValue) {
      console.log("Missing required fields:", { email: !!email, password: !!password, fullNameValue: !!fullNameValue })
      return new NextResponse("Email, password, and full name are required", { status: 400 })
    }

    // Check if user already exists
    console.log("Checking for existing user...")
    const existingUser = await query(
      `SELECT id FROM profiles WHERE email = $1`,
      [email]
    )

    if (existingUser.rows.length > 0) {
      console.log("User already exists with email:", email)
      return new NextResponse("Email already registered", { status: 400 })
    }

    // Hash password
    console.log("Hashing password...")
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    console.log("Creating new user...")
    const result = await query(
      `INSERT INTO profiles (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name`,
      [email, password_hash, fullNameValue]
    )

    const user = result.rows[0]
    console.log("User created successfully:", { id: user.id, email: user.email })

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
    console.error("Registration error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
