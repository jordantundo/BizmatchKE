"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface FinancialProjection {
  id: string
  idea_id: string
  startup_costs: number
  monthly_expenses: number
  projected_revenue: number
  break_even_months: number
  created_at: string
  updated_at: string
  business_idea?: {
    title: string
    description: string
    industry: string
    location: string
  }
}

export default function FinancialProjectionsPage() {
  const [projections, setProjections] = useState<FinancialProjection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProjections()
  }, [])

  async function fetchProjections() {
    try {
      const response = await fetch("/api/financial-projections")
      if (!response.ok) throw new Error("Failed to fetch projections")
      
      const data = await response.json()
      setProjections(data)
    } catch (error) {
      console.error("Error fetching projections:", error)
      toast({
        title: "Error",
        description: "Failed to load financial projections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteProjection(id: string) {
    try {
      const response = await fetch(`/api/financial-projections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete projection")

      setProjections((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Success",
        description: "Financial projection deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting projection:", error)
      toast({
        title: "Error",
        description: "Failed to delete financial projection",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Financial Projections</h2>
        <p className="text-gray-400 mt-2">
          View and manage financial projections for your business ideas.
        </p>
      </div>

      {projections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No financial projections found.</p>
          <Button
            onClick={() => router.push("/dashboard/idea-generator")}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate New Idea
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projections.map((projection) => (
            <Card key={projection.id} className="bg-black/40 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {projection.business_idea?.title || "Untitled Business Idea"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {projection.business_idea ? 
                        `${projection.business_idea.industry} • ${projection.business_idea.location}` :
                        "Industry and location not available"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProjection(projection.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Startup Costs</p>
                      <p className="text-lg font-semibold">
                        KES {projection.startup_costs.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Monthly Expenses</p>
                      <p className="text-lg font-semibold">
                        KES {projection.monthly_expenses.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Projected Revenue</p>
                      <p className="text-lg font-semibold">
                        KES {projection.projected_revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Break-even Period</p>
                      <p className="text-lg font-semibold">{projection.break_even_months} months</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-400">Monthly Profit</p>
                    <p className="text-lg font-semibold text-green-500">
                      KES {(projection.projected_revenue - projection.monthly_expenses).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
