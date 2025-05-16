"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { FinancialProjectionForm } from "@/components/dashboard/financial-projection-form"
import { toast } from "@/components/ui/use-toast"

interface BusinessIdea {
  id: string
  title: string
  description: string
  industry: string
  location: string
}

interface FinancialProjection {
  id: string
  business_idea: BusinessIdea
  startup_costs: number
  monthly_expenses: number
  projected_revenue: number
  break_even_months: number
  monthly_profit: number
  annual_profit: number
  profit_margin: number
  annual_roi: number
  created_at: string
}

export default function FinancialProjectionsPage() {
  const [loading, setLoading] = useState(true)
  const [projections, setProjections] = useState<FinancialProjection[]>([])
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch both projections and ideas in parallel
        const [projectionsRes, ideasRes] = await Promise.all([
          fetch("/api/financial-projections"),
          fetch("/api/business-ideas")
        ])

        if (!projectionsRes.ok || !ideasRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [projectionsData, ideasData] = await Promise.all([
          projectionsRes.json(),
          ideasRes.json()
        ])

        setProjections(projectionsData)
        setIdeas(ideasData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this runs once on mount

  const handleIdeaChange = (value: string) => {
    setSelectedIdea(value)
    router.push(`/dashboard/financial-projections/new?idea=${value}`)
  }

  const handleDelete = async (id: string) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Financial Projections</h2>
        <p className="text-gray-400 mt-2">
          Analyze the financial viability of your business ideas with detailed projections.
        </p>
      </div>

      {ideas.length === 0 ? (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>No Saved Business Ideas</CardTitle>
            <CardDescription>
              You need to save a business idea before you can create a financial projection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/idea-generator">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Generate Business Ideas
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : selectedIdea ? (
        <FinancialProjectionForm ideaId={selectedIdea} />
      ) : (
        <div className="grid gap-6">
          {projections.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projections.map((projection) => (
                <Card key={projection.id} className="bg-black/40 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{projection.business_idea.title}</CardTitle>
                        <CardDescription>
                          {projection.business_idea.industry} • {projection.business_idea.location}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(projection.id)}
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
                            ${projection.startup_costs.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Monthly Expenses</p>
                          <p className="text-lg font-semibold">
                            ${projection.monthly_expenses.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Projected Revenue</p>
                          <p className="text-lg font-semibold">
                            ${projection.projected_revenue.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Break-even Period</p>
                          <p className="text-lg font-semibold">{projection.break_even_months} months</p>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">Monthly Profit</p>
                          <p className="text-lg font-semibold text-green-500">
                            ${projection.monthly_profit.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Annual Profit</p>
                          <p className="text-lg font-semibold text-green-500">
                            ${projection.annual_profit.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Profit Margin</p>
                          <p className="text-lg font-semibold text-blue-500">
                            {projection.profit_margin.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Annual ROI</p>
                          <p className="text-lg font-semibold text-amber-500">
                            {projection.annual_roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-black/40 border-gray-800">
            <CardHeader>
              <CardTitle>Create New Financial Projection</CardTitle>
              <CardDescription>Choose a saved business idea to create a financial projection for.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleIdeaChange}>
                <SelectTrigger className="bg-black/60 border-gray-700 focus-visible:ring-amber-500">
                  <SelectValue placeholder="Select a business idea" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-gray-700">
                  {ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
