import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type User = {
  id: string
  email: string
  full_name: string
}

export type Session = {
  user: User
  expires: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex-secret-key",
  cookieName: "session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")
  
  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value) as Session
    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      return null
    }
    return session
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  return user
}
