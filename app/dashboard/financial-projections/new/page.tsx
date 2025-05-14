"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FinancialProjectionForm } from "@/components/dashboard/financial-projection-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewFinancialProjectionPage() {
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<any[]>([])
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<any>(null)
  const searchParams = useSearchParams()
  const ideaId = searchParams.get("ideaId")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true)
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        // Fetch all business ideas for the user
        const { data: ideasData, error: ideasError } = await supabase
          .from("business_ideas")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (ideasError) throw ideasError

        setIdeas(ideasData || [])

        // If ideaId is provided in URL, select that idea
        if (ideaId) {
          setSelectedIdeaId(ideaId)
          const idea = ideasData?.find((idea) => idea.id === ideaId)
          if (idea) {
            setSelectedIdea(idea)
          }
        }
      } catch (error) {
        console.error("Error fetching business ideas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [supabase, ideaId])

  const handleIdeaChange = (value: string) => {
    setSelectedIdeaId(value)
    const idea = ideas.find((idea) => idea.id === value)
    setSelectedIdea(idea)
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
          Analyze the financial viability of your business idea with detailed projections.
        </p>
      </div>

      {ideas.length === 0 ? (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>No Business Ideas Found</CardTitle>
            <CardDescription>
              You need to create or save a business idea before you can create a financial projection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/idea-generator">
              <button className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-md">
                Generate Business Ideas
              </button>
            </Link>
          </CardContent>
        </Card>
      ) : selectedIdea ? (
        <FinancialProjectionForm ideaId={selectedIdea.id} ideaTitle={selectedIdea.title} />
      ) : (
        <Card className="bg-black/40 border-gray-800">
          <CardHeader>
            <CardTitle>Select a Business Idea</CardTitle>
            <CardDescription>Choose a business idea to create a financial projection for.</CardDescription>
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
