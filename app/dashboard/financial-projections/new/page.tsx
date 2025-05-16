"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { FinancialProjectionForm } from "@/components/dashboard/financial-projection-form"

interface BusinessIdea {
  id: string
  title: string
  description: string
  industry: string
  location: string
}

export default function NewFinancialProjectionPage() {
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("")
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSavedIdeas = async () => {
      try {
        const response = await fetch("/api/business-ideas")
        if (!response.ok) throw new Error("Failed to fetch business ideas")
        
        const data = await response.json()
        setIdeas(data)
      } catch (error) {
        console.error("Error fetching business ideas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedIdeas()
  }, [])

  const handleIdeaChange = (value: string) => {
    setSelectedIdeaId(value)
    const idea = ideas.find((idea) => idea.id === value)
    setSelectedIdea(idea || null)
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
        <Link
          href="/dashboard/financial-projections"
          className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Financial Projections
        </Link>
        <h2 className="text-3xl font-bold">Create Financial Projection</h2>
        <p className="text-gray-400 mt-2">
          Analyze the financial viability of your saved business idea with detailed projections.
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
        <FinancialProjectionForm ideaId={selectedIdea.id} ideaTitle={selectedIdea.title} />
      ) : (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>Select a Business Idea</CardTitle>
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
      )}
    </div>
  )
}
