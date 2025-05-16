"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Trash2, FileBarChart, DollarSign, Calendar, TrendingUp, PieChart } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function FinancialProjectionDetailsPage() {
  const [loading, setLoading] = useState(true)
  const [projection, setProjection] = useState<any>(null)
  const [businessIdea, setBusinessIdea] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const params = useParams()
  const router = useRouter()
  const projectionId = params.id as string

  useEffect(() => {
    const fetchProjection = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/financial-projections/${projectionId}`)
        if (!response.ok) throw new Error("Failed to fetch projection")
        
        const data = await response.json()
        setProjection(data)
        setBusinessIdea(data.business_idea)
      } catch (error) {
        console.error("Error fetching financial projection:", error)
        toast({
          title: "Error loading projection",
          description: "Could not load the financial projection. Please try again later.",
          variant: "destructive",
        })
        router.push("/dashboard/financial-projections")
      } finally {
        setLoading(false)
      }
    }

    fetchProjection()
  }, [projectionId, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/financial-projections/${projectionId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete projection")

      toast({
        title: "Projection deleted successfully",
      })
      router.push("/dashboard/financial-projections")
    } catch (error: any) {
      toast({
        title: "Error deleting projection",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate additional financial metrics
  const calculateMetrics = () => {
    if (!projection) return null

    const monthlyProfit = projection.projected_revenue - projection.monthly_expenses
    const annualProfit = monthlyProfit * 12
    const profitMargin = ((monthlyProfit / projection.projected_revenue) * 100).toFixed(2)
    const annualRoi = ((annualProfit / projection.startup_costs) * 100).toFixed(2)
    const paybackPeriod = (projection.startup_costs / monthlyProfit).toFixed(1)

    return {
      monthlyProfit,
      annualProfit,
      profitMargin,
      annualRoi,
      paybackPeriod,
    }
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!projection) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold mb-2">Projection Not Found</h2>
        <p className="text-gray-400 mb-6">
          The financial projection you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/dashboard/financial-projections">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">Back to Financial Projections</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/financial-projections"
          className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Financial Projections
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{businessIdea?.title || "Business Idea"}</h2>
            <p className="text-gray-400 mt-2">Financial Projection Analysis</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black/90 border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this financial projection. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {businessIdea && (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileBarChart className="mr-2 h-5 w-5 text-amber-500" />
              Business Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Description</h3>
                <p className="mt-1">{businessIdea.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Industry</h3>
                  <p className="mt-1">{businessIdea.industry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Location</h3>
                  <p className="mt-1">{businessIdea.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Startup Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">KES {projection.startup_costs.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">KES {projection.monthly_expenses.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">KES {projection.projected_revenue.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Break-even Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">{projection.break_even_months} months</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-amber-500" />
              Profitability Analysis
            </CardTitle>
            <CardDescription>Key financial metrics for your business idea</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Monthly Profit</h3>
                  <p className="mt-1 text-xl font-medium">KES {metrics?.monthlyProfit.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Annual Profit</h3>
                  <p className="mt-1 text-xl font-medium">KES {metrics?.annualProfit.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Profit Margin</h3>
                  <p className="mt-1 text-xl font-medium">{metrics?.profitMargin}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Annual ROI</h3>
                  <p className="mt-1 text-xl font-medium">{metrics?.annualRoi}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-amber-500" />
              Financial Health Indicators
            </CardTitle>
            <CardDescription>Assessment of your business's financial viability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Payback Period</h3>
                <p className="mt-1">{metrics?.paybackPeriod} months to recover initial investment</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Profitability Assessment</h3>
                <p className="mt-1">
                  {Number(metrics?.profitMargin) < 15
                    ? "Low profit margin. Consider ways to increase revenue or reduce expenses."
                    : Number(metrics?.profitMargin) < 30
                      ? "Moderate profit margin. Business shows potential but could be optimized further."
                      : "Excellent profit margin. Business shows strong profit potential."}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">Investment Quality</h3>
                <p className="mt-1">
                  {Number(metrics?.annualRoi) < 20
                    ? "Low ROI. Consider alternative business models or cost reduction strategies."
                    : Number(metrics?.annualRoi) < 50
                      ? "Moderate ROI. Investment shows reasonable returns."
                      : "Excellent ROI. Investment shows strong potential returns."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
