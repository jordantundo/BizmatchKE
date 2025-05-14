"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface BusinessIdea {
  id: string
  title: string
  description: string
  industry: string
  location: string
  investment_min: number
  investment_max: number
  created_at: string
  updated_at: string
}

export default function SavedIdeasPage() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchIdeas()
  }, [])

  async function fetchIdeas() {
    try {
      const response = await fetch("/api/business-ideas")
      if (!response.ok) throw new Error("Failed to fetch ideas")
      
      const data = await response.json()
      setIdeas(data)
    } catch (error) {
      console.error("Error fetching ideas:", error)
      toast({
        title: "Error",
        description: "Failed to load business ideas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteIdea(id: string) {
    try {
      const response = await fetch(`/api/business-ideas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete idea")

      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
      toast({
        title: "Success",
        description: "Business idea deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting idea:", error)
      toast({
        title: "Error",
        description: "Failed to delete business idea",
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
        <h2 className="text-3xl font-bold">Saved Business Ideas</h2>
        <p className="text-gray-400 mt-2">
          View and manage your saved business ideas.
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No saved business ideas found.</p>
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
          {ideas.map((idea) => (
            <Card key={idea.id} className="bg-black/40 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {idea.industry} • {idea.location}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteIdea(idea.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-gray-300">{idea.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Investment Range</p>
                      <p className="text-lg font-semibold">
                        KES {idea.investment_min.toLocaleString()} - {idea.investment_max.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-lg font-semibold">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
