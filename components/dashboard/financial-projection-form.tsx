"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

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
})

interface FinancialProjectionFormProps {
  ideaId: string
  ideaTitle: string
}

export function FinancialProjectionForm({ ideaId, ideaTitle }: FinancialProjectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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

      // First refresh the router to update the data
      router.refresh()
      
      // Then navigate back to the projections page
      router.push("/dashboard/financial-projections")
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
                  <FormLabel>Startup Costs</FormLabel>
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
                  <FormLabel>Monthly Expenses</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter monthly expenses"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
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
                  <FormLabel>Projected Monthly Revenue</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter projected revenue"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
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
                  <FormLabel>Break-even Period (months)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter break-even period"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
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
                  <FormLabel>Fixed Costs Percentage</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter fixed costs percentage"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
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
                  <FormLabel>Variable Costs Percentage</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter variable costs percentage"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
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
                  <FormLabel>Expected Annual Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter expected growth rate"
                      className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                    />
                  </FormControl>
                  <FormDescription>
                    Expected annual growth rate for revenue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
