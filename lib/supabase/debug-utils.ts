// This file contains utilities to help debug Supabase authentication issues

export function logSupabaseConfig() {
  console.log("Checking Supabase environment variables:")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY length:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing required Supabase environment variables!")
  }
}

export function logAuthState(supabase: any) {
  return async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log("Current auth state:", {
        hasSession: !!data?.session,
        sessionExpiry: data?.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        user: data?.session?.user?.id || null,
        error: error?.message || null,
      })

      if (error) {
        console.error("Error getting session:", error)
      }

      return data
    } catch (err) {
      console.error("Error checking auth state:", err)
      return null
    }
  }
}
