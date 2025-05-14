import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export const createClient = () => {
  console.log("Creating Supabase client")
  const client = createClientComponentClient<Database>()
  return client
}
