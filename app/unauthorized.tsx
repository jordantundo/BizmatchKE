import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Authentication Required</h1>
          <p className="text-gray-400 mt-2">You need to be logged in to access this page</p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Please log in or create an account to access the BizMatchKE dashboard.</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Log In</Button>
          </Link>

          <Link href="/auth/register">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
