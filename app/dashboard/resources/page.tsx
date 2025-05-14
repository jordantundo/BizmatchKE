"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, ExternalLink } from "lucide-react"

// Sample resources data
const resources = {
  guides: [
    {
      id: 1,
      title: "Business Registration Guide",
      description: "Step-by-step guide to registering your business in Kenya.",
      category: "Legal",
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Tax Compliance for Small Businesses",
      description: "Understanding KRA requirements and tax obligations for small businesses.",
      category: "Finance",
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "Marketing on a Budget",
      description: "Effective marketing strategies for Kenyan startups with limited resources.",
      category: "Marketing",
      downloadUrl: "#",
    },
  ],
  templates: [
    {
      id: 1,
      title: "Business Plan Template",
      description: "Comprehensive business plan template with financial projections.",
      category: "Planning",
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Cash Flow Spreadsheet",
      description: "Track your business cash flow with this easy-to-use template.",
      category: "Finance",
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "Marketing Calendar",
      description: "Plan your marketing activities with this 12-month calendar template.",
      category: "Marketing",
      downloadUrl: "#",
    },
  ],
  links: [
    {
      id: 1,
      title: "Kenya Business Registration Portal",
      description: "Official government portal for business registration.",
      category: "Government",
      url: "https://brs.ecitizen.go.ke/",
    },
    {
      id: 2,
      title: "Kenya Revenue Authority",
      description: "Tax information and online services for businesses.",
      category: "Government",
      url: "https://www.kra.go.ke/",
    },
    {
      id: 3,
      title: "Kenya Association of Manufacturers",
      description: "Resources and support for manufacturing businesses.",
      category: "Industry",
      url: "https://kam.co.ke/",
    },
  ],
}

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Business Resources</h2>
        <p className="text-gray-400 mt-2">
          Access guides, templates, and resources to help you start and grow your business in Kenya.
        </p>
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-gray-800">
          <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="links">Useful Links</TabsTrigger>
        </TabsList>
        <TabsContent value="guides" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.guides.map((resource) => (
              <Card key={resource.id} className="bg-black/40 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-amber-500/10 p-2 rounded-md">
                      <FileText className="h-6 w-6 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      {resource.category}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Guide
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.templates.map((template) => (
              <Card key={template.id} className="bg-black/40 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-amber-500/10 p-2 rounded-md">
                      <FileText className="h-6 w-6 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      {template.category}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="links" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.links.map((link) => (
              <Card key={link.id} className="bg-black/40 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-amber-500/10 p-2 rounded-md">
                      <ExternalLink className="h-6 w-6 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      {link.category}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
