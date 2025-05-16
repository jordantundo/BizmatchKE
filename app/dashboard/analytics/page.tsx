"use client"

import { useEffect, useState } from "react"
import { StatisticsDashboard } from "@/components/dashboard/statistics-dashboard"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const user = await response.json()
        if (user) {
          setUserId(user.id)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-gray-400">Please log in to view your analytics dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Business Analytics</h2>
        <p className="text-gray-400 mt-2">
          Visualize your business ideas and financial projections with detailed analytics.
        </p>
      </div>

      <StatisticsDashboard userId={userId} />
    </div>
  )
}
