import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // 60 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(ip)

  if (!userLimit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return true
  }

  userLimit.count++
  return false
}

export function middleware(request: NextRequest) {
  try {
    console.log("Middleware executing for path:", request.nextUrl.pathname)

    // Rate limiting
    const ip = request.ip ?? 'anonymous'
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get("session")
    let session = null

    if (sessionCookie?.value) {
      try {
        session = JSON.parse(sessionCookie.value)
        console.log("Session found:", session)
      } catch (error) {
        console.error("Invalid session cookie:", error)
        // Clear invalid session cookie
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("session")
        return response
      }
    }

    // Check if the route is protected
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!session?.user?.id) {
        console.log("No valid session found, redirecting to login")
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      console.log("Valid session found, allowing access to dashboard")
    }

    // If session exists and trying to access auth pages, redirect to dashboard
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
      if (session?.user?.id) {
        console.log("Session exists, redirecting from auth page to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      console.log("No session, allowing access to auth page")
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/error", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
