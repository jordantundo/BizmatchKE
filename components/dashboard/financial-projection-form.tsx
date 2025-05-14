"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  startupCosts: z.string().min(1, "Startup costs are required"),
  monthlyExpenses: z.string().min(1, "Monthly expenses are required"),
  projectedRevenue: z.string().min(1, "Projected revenue is required"),
  breakEvenMonths: z.string().min(1, "Break-even months are required"),
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
      startupCosts: "",
      monthlyExpenses: "",
      projectedRevenue: "",
      breakEvenMonths: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/financial-projections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId,
          startupCosts: parseFloat(values.startupCosts),
          monthlyExpenses: parseFloat(values.monthlyExpenses),
          projectedRevenue: parseFloat(values.projectedRevenue),
          breakEvenMonths: parseInt(values.breakEvenMonths),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create financial projection")
      }

      toast({
        title: "Financial projection created successfully",
      })

      router.push("/dashboard/financial-projections")
    } catch (error: any) {
      toast({
        title: "Error creating financial projection",
        description: error.message || "Please try again later.",
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
        <CardDescription>Add financial details for: {ideaTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="startupCosts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startup Costs (KES)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter startup costs"
                      className="bg-black/40 border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Total initial investment required</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Expenses (KES)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter monthly expenses"
                      className="bg-black/40 border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Expected monthly operational costs</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectedRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projected Monthly Revenue (KES)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter projected revenue"
                      className="bg-black/40 border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Expected monthly revenue</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breakEvenMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break-even Months</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter break-even months"
                      className="bg-black/40 border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Expected months to reach break-even</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
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
