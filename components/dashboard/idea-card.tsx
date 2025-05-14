"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, BarChart3 } from "lucide-react"
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

interface IdeaCardProps {
  idea: BusinessIdea
  onDelete: (id: string) => void
}

export function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/business-ideas/${idea.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete idea")

      onDelete(idea.id)
      toast({
        title: "Idea deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting idea",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="bg-black/40 border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{idea.title}</CardTitle>
            <CardDescription className="mt-1">
              {idea.industry} • {idea.location}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/financial-projections/new?ideaId=${idea.id}`)}
              className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
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
  )
}
