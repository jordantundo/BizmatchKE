export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          industry: string
          investment_min: number
          investment_max: number
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          industry: string
          investment_min: number
          investment_max: number
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          industry?: string
          investment_min?: number
          investment_max?: number
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_ideas: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      financial_projections: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          startup_costs: number
          monthly_expenses: number
          projected_revenue: number
          break_even_months: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          startup_costs: number
          monthly_expenses: number
          projected_revenue: number
          break_even_months: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          startup_costs?: number
          monthly_expenses?: number
          projected_revenue?: number
          break_even_months?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
