import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { sessionOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions)
  session.destroy()

  return NextResponse.json({ success: true })
}
