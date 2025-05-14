"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Database } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false)
  const router = useRouter()

  const seedSampleData = async () => {
    setIsSeeding(true)
    try {
      // Get current user
      const response = await fetch("/api/auth/me")
      if (!response.ok) throw new Error("You must be logged in to seed sample data")
      
      const userData = await response.json()
      const userId = userData.id

      // Create sample business ideas
      const businessIdeas = [
        {
          title: "Tech Startup Hub",
          description: "A co-working space for tech startups in Nairobi",
          industry: "Technology",
          investmentMin: 500000,
          investmentMax: 1000000,
          location: "Nairobi",
        },
        {
          title: "Organic Farm",
          description: "Sustainable organic farming and produce delivery",
          industry: "Agriculture",
          investmentMin: 200000,
          investmentMax: 500000,
          location: "Nakuru",
        },
        {
          title: "Digital Marketing Agency",
          description: "Full-service digital marketing for small businesses",
          industry: "Technology",
          investmentMin: 100000,
          investmentMax: 300000,
          location: "Mombasa",
        },
        {
          title: "Boutique Coffee Shop",
          description: "Specialty coffee shop with local art gallery",
          industry: "Food & Beverage",
          investmentMin: 300000,
          investmentMax: 600000,
          location: "Nairobi",
        },
        {
          title: "E-commerce Platform",
          description: "Online marketplace for local artisans",
          industry: "Technology",
          investmentMin: 400000,
          investmentMax: 800000,
          location: "Nationwide",
        },
      ]

      // Save business ideas
      const ideasData = []
      for (const idea of businessIdeas) {
        const response = await fetch("/api/business-ideas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(idea),
        })

        if (!response.ok) throw new Error("Failed to create business idea")
        const savedIdea = await response.json()
        ideasData.push(savedIdea)
      }

      // Create financial projections for each idea
      for (const idea of ideasData) {
        // Generate some random but realistic financial data
        const startupCosts = Math.floor(Math.random() * 80000) + 20000 // 20K to 100K KES
        const monthlyExpenses = Math.floor(startupCosts * 0.1) // 10% of startup costs
        const projectedRevenue = Math.floor(monthlyExpenses * (Math.random() * 0.5 + 1.3)) // 1.3x to 1.8x of monthly expenses
        const breakEvenMonths = Math.ceil(startupCosts / (projectedRevenue - monthlyExpenses))

        const response = await fetch("/api/financial-projections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ideaId: idea.id,
            startupCosts,
            monthlyExpenses,
            projectedRevenue,
            breakEvenMonths,
          }),
        })

        if (!response.ok) throw new Error("Failed to create financial projection")
      }

      toast({
        title: "Sample data created successfully!",
        description: `Created ${businessIdeas.length} business ideas with financial projections.`,
      })

      // Refresh the page to show the new data
      router.refresh()
    } catch (error: any) {
      console.error("Error seeding sample data:", error)
      toast({
        title: "Error creating sample data",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={seedSampleData} disabled={isSeeding} className="bg-amber-500 hover:bg-amber-600 text-black">
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Sample Data...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Create Sample Data
        </>
      )}
    </Button>
  )
}
