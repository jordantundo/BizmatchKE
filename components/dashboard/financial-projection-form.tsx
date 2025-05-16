"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Info, TrendingUp, DollarSign, Calendar, Percent } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formSchema = z.object({
  startup_costs: z.string()
    .min(1, "Startup costs are required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Startup costs must be a positive number"
    }),
  monthly_expenses: z.string()
    .min(1, "Monthly expenses are required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Monthly expenses must be a positive number"
    }),
  projected_revenue: z.string()
    .min(1, "Projected revenue is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Projected revenue must be a positive number"
    }),
  break_even_months: z.string()
    .min(1, "Break-even period is required")
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "Break-even period must be a positive number"
    }),
  fixed_costs_percentage: z.string()
    .min(1, "Fixed costs percentage is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: "Fixed costs percentage must be between 0 and 100"
    }),
  variable_costs_percentage: z.string()
    .min(1, "Variable costs percentage is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: "Variable costs percentage must be between 0 and 100"
    }),
  growth_rate: z.string()
    .min(1, "Growth rate is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -100 && num <= 100;
    }, {
      message: "Growth rate must be between -100 and 100"
    })
}).refine((data) => {
  const fixed = parseFloat(data.fixed_costs_percentage);
  const variable = parseFloat(data.variable_costs_percentage);
  return Math.abs(fixed + variable - 100) < 0.01; // Allow for small floating point differences
}, {
  message: "Fixed and variable costs percentages must sum to 100%",
  path: ["variable_costs_percentage"] // Show error on the variable costs field
});

interface FinancialProjectionFormProps {
  ideaId: string
  ideaTitle: string
  onSuccess?: () => void
}

export function FinancialProjectionForm({ ideaId, ideaTitle, onSuccess }: FinancialProjectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMetrics, setPreviewMetrics] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startup_costs: "",
      monthly_expenses: "",
      projected_revenue: "",
      break_even_months: "",
      fixed_costs_percentage: "",
      variable_costs_percentage: "",
      growth_rate: "",
    },
  })

  // Function to calculate suggested values based on industry averages
  const calculateSuggestedValues = () => {
    const startupCosts = form.getValues("startup_costs")
    if (startupCosts) {
      const costs = parseFloat(startupCosts)
      // Suggested monthly expenses as 20% of startup costs
      const suggestedExpenses = (costs * 0.2).toString()
      // Suggested revenue as 40% of startup costs
      const suggestedRevenue = (costs * 0.4).toString()
      // Suggested break-even period as 6 months
      const suggestedBreakEven = "6"

      form.setValue("monthly_expenses", suggestedExpenses)
      form.setValue("projected_revenue", suggestedRevenue)
      form.setValue("break_even_months", suggestedBreakEven)
    }
  }

  // Function to calculate preview metrics
  const calculatePreviewMetrics = () => {
    const values = form.getValues()
    if (!values.startup_costs || !values.monthly_expenses || !values.projected_revenue) {
      setPreviewMetrics(null)
      return
    }

    const startupCosts = Number(values.startup_costs)
    const monthlyExpenses = Number(values.monthly_expenses)
    const projectedRevenue = Number(values.projected_revenue)
    const breakEvenMonths = Number(values.break_even_months) || 0
    const growthRate = Number(values.growth_rate) || 0

    const monthlyProfit = projectedRevenue - monthlyExpenses
    const annualProfit = monthlyProfit * 12
    const profitMargin = ((monthlyProfit / projectedRevenue) * 100).toFixed(1)
    const annualRoi = ((annualProfit / startupCosts) * 100).toFixed(1)
    
    // Calculate additional metrics
    const paybackPeriod = (startupCosts / monthlyProfit).toFixed(1)
    const projectedAnnualRevenue = projectedRevenue * 12
    const projectedGrowthRevenue = projectedAnnualRevenue * (1 + (growthRate / 100))

    setPreviewMetrics({
      monthlyProfit,
      annualProfit,
      profitMargin,
      annualRoi,
      paybackPeriod,
      projectedAnnualRevenue,
      projectedGrowthRevenue,
      breakEvenMonths
    })
  }

  // Update preview when relevant fields change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (['startup_costs', 'monthly_expenses', 'projected_revenue'].includes(name || '')) {
        calculatePreviewMetrics()
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Calculate enhanced metrics
      const startupCosts = Number(values.startup_costs)
      const monthlyExpenses = Number(values.monthly_expenses)
      const projectedRevenue = Number(values.projected_revenue)
      const breakEvenMonths = Number(values.break_even_months)
      const fixedCostsPercentage = Number(values.fixed_costs_percentage)
      const variableCostsPercentage = Number(values.variable_costs_percentage)
      const growthRate = Number(values.growth_rate)

      // Calculate working capital (3 months of expenses)
      const workingCapital = monthlyExpenses * 3

      // Calculate sensitivity analysis
      const sensitivityAnalysis = {
        revenue_variation: [
          {
            scenario: "10% decrease",
            impact: (projectedRevenue * 0.9 - monthlyExpenses) * 12
          },
          {
            scenario: "10% increase",
            impact: (projectedRevenue * 1.1 - monthlyExpenses) * 12
          }
        ],
        expense_variation: [
          {
            scenario: "10% increase",
            impact: (projectedRevenue - monthlyExpenses * 1.1) * 12
          },
          {
            scenario: "10% decrease",
            impact: (projectedRevenue - monthlyExpenses * 0.9) * 12
          }
        ]
      }

      // Calculate scenario analysis
      const scenarioAnalysis = {
        best_case: {
          revenue: projectedRevenue * 1.2,
          expenses: monthlyExpenses * 0.9,
          profit: (projectedRevenue * 1.2 - monthlyExpenses * 0.9) * 12
        },
        worst_case: {
          revenue: projectedRevenue * 0.8,
          expenses: monthlyExpenses * 1.1,
          profit: (projectedRevenue * 0.8 - monthlyExpenses * 1.1) * 12
        }
      }

      // Calculate cost breakdown
      const costBreakdown = {
        fixed_costs: monthlyExpenses * (fixedCostsPercentage / 100),
        variable_costs: monthlyExpenses * (variableCostsPercentage / 100),
        one_time_costs: startupCosts * 0.7,
        operating_expenses: startupCosts * 0.3
      }

      const response = await fetch("/api/financial-projections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea_id: ideaId,
          startup_costs: startupCosts,
          monthly_expenses: monthlyExpenses,
          projected_revenue: projectedRevenue,
          break_even_months: breakEvenMonths,
          working_capital: workingCapital,
          sensitivity_analysis: sensitivityAnalysis,
          scenario_analysis: scenarioAnalysis,
          cost_breakdown: costBreakdown,
          growth_rate: growthRate
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create financial projection")
      }

      const data = await response.json()
      console.log("Financial projection created:", data)

      toast({
        title: "Success",
        description: "Financial projection created successfully",
      })

      // Reset form after successful submission
      form.reset()

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error creating financial projection:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create financial projection",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-black/40 border-gray-800">
      <CardHeader>
        <CardTitle>Create Financial Projection</CardTitle>
        <CardDescription>
          Enter financial details for your business idea: {ideaTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="startup_costs"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Startup Costs</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total initial investment required to start the business, including equipment, licenses, and initial inventory.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter startup costs"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      onChange={(e) => {
                        field.onChange(e)
                        calculateSuggestedValues()
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Total initial investment required to start the business
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthly_expenses"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Monthly Expenses</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated monthly operating costs</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter monthly expenses"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Estimated monthly operating costs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projected_revenue"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Projected Monthly Revenue</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expected monthly revenue after break-even</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter projected revenue"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Expected monthly revenue after break-even
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="break_even_months"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Break-even Period (months)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated time to reach break-even point</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter break-even period"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Estimated time to reach break-even point
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fixed_costs_percentage"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Fixed Costs Percentage</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of monthly expenses that are fixed costs</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter fixed costs percentage"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of monthly expenses that are fixed costs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variable_costs_percentage"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Variable Costs Percentage</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of monthly expenses that are variable costs</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter variable costs percentage"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of monthly expenses that are variable costs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="growth_rate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Expected Annual Growth Rate (%)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expected annual growth rate for revenue</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter expected growth rate"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Expected annual growth rate for revenue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {previewMetrics && (
              <div className="mt-6 p-4 bg-black/60 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Preview Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Monthly Profit</p>
                    <p className="text-lg font-semibold text-green-500">
                      ${previewMetrics.monthlyProfit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Annual Profit</p>
                    <p className="text-lg font-semibold text-green-500">
                      ${previewMetrics.annualProfit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Profit Margin</p>
                    <p className="text-lg font-semibold text-blue-500">
                      {previewMetrics.profitMargin}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Annual ROI</p>
                    <p className="text-lg font-semibold text-amber-500">
                      {previewMetrics.annualRoi}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Payback Period</p>
                    <p className="text-lg font-semibold text-purple-500">
                      {previewMetrics.paybackPeriod} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Projected Annual Revenue</p>
                    <p className="text-lg font-semibold text-cyan-500">
                      ${previewMetrics.projectedAnnualRevenue.toLocaleString()}
                    </p>
                  </div>
                  {previewMetrics.growthRate > 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Revenue with Growth</p>
                      <p className="text-lg font-semibold text-emerald-500">
                        ${previewMetrics.projectedGrowthRevenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Projection...
                </>
              ) : (
                "Create Financial Projection"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
