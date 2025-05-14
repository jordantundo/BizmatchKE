"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type Stats = {
  generatedIdeas: number
  savedIdeas: number
  financialProjections: number
  resources: number
}

export function RealTimeStats({
  initialStats,
  userId,
}: {
  initialStats: Stats
  userId: string
}) {
  const [stats, setStats] = useState<Stats>(initialStats)
  const [loading, setLoading] = useState(false)

  // Function to fetch stats
  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await response.json()
      setStats({
        generatedIdeas: data.totalIdeas,
        savedIdeas: data.savedIdeas,
        financialProjections: data.financialProjections,
        resources: 0, // We don't have resources in our database yet
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set up a refresh interval to update stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500">Generated Ideas</CardTitle>
          <CardDescription>Total business ideas created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.generatedIdeas}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500">Saved Ideas</CardTitle>
          <CardDescription>Ideas you've saved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.savedIdeas}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500">Financial Projections</CardTitle>
          <CardDescription>Total financial analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.financialProjections}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500">Resources</CardTitle>
          <CardDescription>Available business resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.resources}</div>
        </CardContent>
      </Card>
    </div>
  )
}
