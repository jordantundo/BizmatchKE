"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface StatisticsDashboardProps {
  userId: string
}

export function StatisticsDashboard({ userId }: StatisticsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalIdeas: 0,
    savedIdeas: 0,
    financialProjections: 0,
    averageStartupCost: 0,
    averageBreakEven: 0,
    ideaByIndustry: {} as Record<string, number>,
    ideaByLocation: {} as Record<string, number>,
    recentIdeas: [] as any[],
    recentProjections: [] as any[],
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return

      try {
        setLoading(true)

        // Fetch all stats from the API
        const response = await fetch("/api/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const industryData = {
    labels: Object.keys(stats.ideaByIndustry),
    datasets: [
      {
        data: Object.values(stats.ideaByIndustry),
        backgroundColor: [
          "#f59e0b",
          "#d97706",
          "#b45309",
          "#92400e",
          "#78350f",
          "#65a30d",
          "#4d7c0f",
          "#365314",
        ],
      },
    ],
  }

  const locationData = {
    labels: Object.keys(stats.ideaByLocation),
    datasets: [
      {
        data: Object.values(stats.ideaByLocation),
        backgroundColor: [
          "#f59e0b",
          "#d97706",
          "#b45309",
          "#92400e",
          "#78350f",
          "#65a30d",
          "#4d7c0f",
          "#365314",
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Business Ideas
            </CardTitle>
            <CardDescription>Total ideas generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalIdeas}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Saved Ideas
            </CardTitle>
            <CardDescription>Ideas you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.savedIdeas}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Avg. Startup Cost
            </CardTitle>
            <CardDescription>Average investment needed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.averageStartupCost > 0 ? `KES ${stats.averageStartupCost.toLocaleString()}` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Avg. Break-even
            </CardTitle>
            <CardDescription>Average months to break-even</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.averageBreakEven > 0 ? `${stats.averageBreakEven} months` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="industry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="industry">By Industry</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
        </TabsList>

        <TabsContent value="industry">
          <Card className="bg-black/40 border-gray-800">
            <CardHeader>
              <CardTitle>Business Ideas by Industry</CardTitle>
              <CardDescription>Distribution of your business ideas across different industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Pie data={industryData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card className="bg-black/40 border-gray-800">
            <CardHeader>
              <CardTitle>Business Ideas by Location</CardTitle>
              <CardDescription>Distribution of your business ideas across different locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Pie data={locationData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Business Ideas</CardTitle>
            <CardDescription>Your latest business ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentIdeas.map((idea) => (
                <div key={idea.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{idea.title}</p>
                    <p className="text-sm text-gray-400">{idea.industry} • {idea.location}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Financial Projections</CardTitle>
            <CardDescription>Your latest financial projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentProjections.map((projection) => (
                <div key={projection.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{projection.business_idea.title}</p>
                    <p className="text-sm text-gray-400">
                      Break-even: {projection.break_even_months} months
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(projection.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
