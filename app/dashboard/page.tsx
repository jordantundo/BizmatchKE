import { Suspense } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { getDashboardStats } from "@/lib/db"
import { RealTimeStats } from "@/components/dashboard/real-time-stats"

async function DashboardContent() {
  const user = await requireAuth()
  const stats = await getDashboardStats(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Welcome back, {user.full_name.split(" ")[0]}</h2>
        <p className="text-gray-400 mt-2">
          Explore your dashboard to generate business ideas, save your favorites, and analyze financial projections.
        </p>
      </div>

      <RealTimeStats initialStats={stats} userId={user.id} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              href="/dashboard/idea-generator"
              className="flex items-center p-3 bg-black/60 hover:bg-black/80 rounded-md border border-gray-800 transition-colors"
            >
              <div className="bg-amber-500/20 p-2 rounded-md mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Generate Business Ideas</h4>
                <p className="text-sm text-gray-400">Use AI to create personalized business ideas</p>
              </div>
            </Link>
            <Link
              href="/dashboard/saved-ideas"
              className="flex items-center p-3 bg-black/60 hover:bg-black/80 rounded-md border border-gray-800 transition-colors"
            >
              <div className="bg-amber-500/20 p-2 rounded-md mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-500"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Saved Ideas</h4>
                <p className="text-sm text-gray-400">View and manage your saved business ideas</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-black/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <ol className="space-y-4 list-decimal list-inside text-gray-300">
            <li className="p-3 bg-black/60 rounded-md border border-gray-800">
              <span className="font-medium text-white">Generate Business Ideas</span>
              <p className="text-sm text-gray-400 mt-1 ml-5">
                Use our AI-powered idea generator to create personalized business ideas based on your interests and
                budget.
              </p>
            </li>
            <li className="p-3 bg-black/60 rounded-md border border-gray-800">
              <span className="font-medium text-white">Save Your Favorites</span>
              <p className="text-sm text-gray-400 mt-1 ml-5">
                Save the ideas you like to your dashboard for future reference and analysis.
              </p>
            </li>
            <li className="p-3 bg-black/60 rounded-md border border-gray-800">
              <span className="font-medium text-white">Analyze Financials</span>
              <p className="text-sm text-gray-400 mt-1 ml-5">
                Get detailed financial projections and analysis for your saved business ideas.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  )
}
