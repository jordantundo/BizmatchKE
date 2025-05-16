"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Lightbulb, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { generateAIBusinessIdeas, type GeneratedIdea } from "@/lib/ai/business-idea-generator"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  interests: z.string().min(2, {
    message: "Please describe your interests in at least 2 characters.",
  }),
  skills: z.string().min(2, {
    message: "Please describe your skills in at least 2 characters.",
  }),
  industry: z.string({
    required_error: "Please select an industry.",
  }),
  budget: z.string({
    required_error: "Please select a budget range.",
  }),
  location: z.string({
    required_error: "Please select a location.",
  }),
})

const industries = [
  "Agriculture",
  "Technology",
  "Food & Beverage",
  "Retail",
  "Education",
  "Healthcare",
  "Tourism",
  "Transportation",
  "Manufacturing",
  "Energy",
  "Real Estate",
  "Financial Services",
]

const locations = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Nyeri",
  "Machakos",
  "Kitale",
  "Malindi",
  "Thika",
  "Nationwide",
  "Online/Remote",
]

const budgetRanges = [
  { value: "0-10000", label: "0 - 10,000 KES" },
  { value: "10000-50000", label: "10,000 - 50,000 KES" },
  { value: "50000-100000", label: "50,000 - 100,000 KES" },
  { value: "100000+", label: "100,000+ KES" },
]

export default function IdeaGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: "",
      skills: "",
      industry: "",
      budget: "",
      location: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    try {
      const interests = data.interests.split(",").map((i) => i.trim())
      const skills = data.skills.split(",").map((s) => s.trim())

      const ideas = await generateAIBusinessIdeas(skills, interests, data.budget, data.location)
      setGeneratedIdeas(ideas)
      setSelectedIdeaIndex(0)
    } catch (error) {
      console.error("Error generating ideas:", error)
      toast({
        title: "Error",
        description: "Failed to generate business ideas. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedIdea = generatedIdeas[selectedIdeaIndex]

  const isIdeaSaved = (idea: GeneratedIdea) => savedIdeas.includes(idea.title)

  async function saveIdea(idea: GeneratedIdea) {
    if (!idea) return

    setIsSaving(true)
    try {
      // Get user session
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Authentication failed: ${error}`)
      }
      
      const userData = await response.json()
      console.log("User data:", userData)

      // Calculate investment range based on budget
      const budgetRange = form.getValues().budget.split("-")
      const investmentMin = parseInt(budgetRange[0])
      const investmentMax = budgetRange[1] === "+" ? investmentMin * 2 : parseInt(budgetRange[1])

      console.log("Saving idea with data:", {
        title: idea.title,
        description: idea.description,
        industry: form.getValues().industry,
        investment_min: investmentMin,
        investment_max: investmentMax,
        location: form.getValues().location,
      })

      // Save the idea
      const saveResponse = await fetch("/api/business-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          industry: form.getValues().industry,
          investment_min: investmentMin,
          investment_max: investmentMax,
          location: form.getValues().location,
          skills_required: idea.skills_required || [],
          target_market: idea.target_market || "",
          potential_challenges: idea.potential_challenges || [],
          success_factors: idea.success_factors || [],
          market_trends: idea.market_trends || [],
          success_rate_estimate: idea.success_rate_estimate || "",
          estimated_roi: idea.estimated_roi || "",
          economic_data: idea.economic_data || {}
        }),
      })

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error("Save response error:", {
          status: saveResponse.status,
          statusText: saveResponse.statusText,
          error: errorText
        })
        throw new Error(`Failed to save idea: ${errorText}`)
      }

      const savedIdea = await saveResponse.json()
      console.log("Saved idea response:", savedIdea)

      // Update the saved ideas list
      setSavedIdeas((prev) => [...prev, idea.title])

      // Create a basic financial projection
      const startupCosts = investmentMin
      const monthlyExpenses = Math.round(startupCosts * 0.1) // 10% of startup costs
      const projectedRevenue = Math.round(monthlyExpenses * 1.5) // 50% more than expenses
      const breakEvenMonths = Math.ceil(startupCosts / (projectedRevenue - monthlyExpenses))

      console.log("Creating financial projection with data:", {
        idea_id: savedIdea.id,
        startup_costs: startupCosts,
        monthly_expenses: monthlyExpenses,
        projected_revenue: projectedRevenue,
        break_even_months: breakEvenMonths,
      })

      const projectionResponse = await fetch("/api/financial-projections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea_id: savedIdea.id,
          startup_costs: startupCosts,
          monthly_expenses: monthlyExpenses,
          projected_revenue: projectedRevenue,
          break_even_months: breakEvenMonths,
          working_capital: monthlyExpenses * 3,
          sensitivity_analysis: {
            revenue_variation: [
              { scenario: "10% decrease", impact: (projectedRevenue * 0.9 - monthlyExpenses) * 12 },
              { scenario: "10% increase", impact: (projectedRevenue * 1.1 - monthlyExpenses) * 12 }
            ],
            expense_variation: [
              { scenario: "10% increase", impact: (projectedRevenue - monthlyExpenses * 1.1) * 12 },
              { scenario: "10% decrease", impact: (projectedRevenue - monthlyExpenses * 0.9) * 12 }
            ]
          },
          scenario_analysis: {
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
          },
          cost_breakdown: {
            fixed_costs: monthlyExpenses * 0.6,
            variable_costs: monthlyExpenses * 0.4,
            one_time_costs: startupCosts * 0.7,
            operating_expenses: startupCosts * 0.3
          },
          growth_rate: 10 // Default 10% annual growth rate
        }),
      })

      if (!projectionResponse.ok) {
        const errorText = await projectionResponse.text()
        console.error("Projection response error:", {
          status: projectionResponse.status,
          statusText: projectionResponse.statusText,
          error: errorText
        })
        throw new Error(`Failed to create financial projection: ${errorText}`)
      }

      const projectionData = await projectionResponse.json()
      console.log("Created financial projection:", projectionData)

      toast({
        title: "Success",
        description: "Business idea saved successfully",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error saving idea:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save business idea",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Business Idea Generator</h2>
        <p className="text-gray-400 mt-2">
          Tell us about yourself and we'll generate personalized business ideas for you using AI.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Card className="bg-black/40 border-gray-800">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                The more details you provide, the more tailored your business ideas will be.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are you passionate about? E.g., technology, food, education... (separate with commas)"
                            className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your interests will help us suggest businesses you'll enjoy running.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are you good at? E.g., marketing, management, technical skills... (separate with commas)"
                            className="bg-black/60 border-gray-700 focus-visible:ring-amber-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your skills will help us suggest businesses you're capable of running.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/60 border-gray-700 focus-visible:ring-amber-500">
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-gray-700">
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Which industry interests you the most?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Budget</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/60 border-gray-700 focus-visible:ring-amber-500">
                              <SelectValue placeholder="Select a budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-gray-700">
                            {budgetRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>How much are you willing to invest?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/60 border-gray-700 focus-visible:ring-amber-500">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-gray-700">
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Where would you like to operate your business?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate Business Ideas
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          {generatedIdeas.length > 0 ? (
            <Card className="bg-black/40 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Generated Ideas</CardTitle>
                  <div className="flex space-x-2">
                    {generatedIdeas.map((_, index) => (
                      <Button
                        key={index}
                        variant={selectedIdeaIndex === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedIdeaIndex(index)}
                        className={selectedIdeaIndex === index ? "bg-amber-500 text-black" : ""}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{selectedIdea.title}</h3>
                      <p className="text-gray-400">{selectedIdea.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Industry</h4>
                        <p>{form.getValues().industry}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
                        <p>{form.getValues().location}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Investment Range</h4>
                        <p>{form.getValues().budget}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Success Rate</h4>
                        <p>{selectedIdea.success_rate_estimate}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIdea.skills_required.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Target Market</h4>
                      <p>{selectedIdea.target_market}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Potential Challenges</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedIdea.potential_challenges.map((challenge, index) => (
                          <li key={index}>{challenge}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Success Factors</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedIdea.success_factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Startup Costs</h4>
                      <p>{selectedIdea.startup_costs}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Estimated ROI</h4>
                      <p>{selectedIdea.estimated_roi}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Market Trends</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedIdea.market_trends.map((trend, index) => (
                          <li key={index}>{trend}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Economic Data</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm">Growth Potential</p>
                          <p>{selectedIdea.economic_data.growth_potential}</p>
                        </div>
                        <div>
                          <p className="text-sm">Market Saturation</p>
                          <p>{selectedIdea.economic_data.market_saturation}</p>
                        </div>
                        <div>
                          <p className="text-sm">Competition Level</p>
                          <p>{selectedIdea.economic_data.competition_level}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => saveIdea(selectedIdea)}
                  disabled={isSaving || isIdeaSaved(selectedIdea)}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isIdeaSaved(selectedIdea) ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Already Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save This Idea
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg bg-black/20 w-full">
                <Lightbulb className="h-12 w-12 text-amber-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Your Ideas Will Appear Here</h3>
                <p className="text-gray-400">
                  Fill out the form and click "Generate Business Ideas" to get your personalized business
                  recommendations powered by AI.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
