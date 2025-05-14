"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-amber-500">Something went wrong!</h1>
        <p className="text-gray-300 max-w-md mx-auto">
          We apologize for the inconvenience. Please try again or return to the home page.
        </p>
        <div className="space-x-4">
          <Button
            onClick={reset}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black">
              Return home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 