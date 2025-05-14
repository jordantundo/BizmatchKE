"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SeedDataButton } from "@/components/dashboard/seed-data-button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SeedDataPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Seed Sample Data</h2>
        <p className="text-gray-400 mt-2">
          Populate your database with sample business ideas and financial projections for testing.
        </p>
      </div>

      <Card className="bg-black/40 border-gray-800">
        <CardHeader>
          <CardTitle>Create Sample Data</CardTitle>
          <CardDescription>
            This will create sample business ideas, financial projections, and saved ideas in your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is for testing purposes only. The sample data will be associated with your user account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="font-medium">Sample data includes:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>5 business ideas across different industries and locations</li>
              <li>Financial projections for each business idea</li>
              <li>3 saved business ideas</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <SeedDataButton />
        </CardFooter>
      </Card>
    </div>
  )
}
