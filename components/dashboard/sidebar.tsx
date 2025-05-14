"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Lightbulb, BarChart3, Bookmark, LogOut, Settings, Wallet, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// Define routes outside components to avoid duplication
const routes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/dashboard/idea-generator",
    label: "Idea Generator",
    icon: Lightbulb,
  },
  {
    href: "/dashboard/saved-ideas",
    label: "Saved Ideas",
    icon: Wallet,
  },
  {
    href: "/dashboard/financial-projections",
    label: "Financial Projections",
    icon: Wallet,
  },
  {
    href: "/dashboard/resources",
    label: "Resources",
    icon: FileText,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-black/40 border-r border-gray-800 w-64">
          <SidebarContent className="w-full" />
        </SheetContent>
      </Sheet>
      <div className={cn("hidden md:block w-64 fixed inset-y-0 left-0 z-50 bg-black/40 border-r border-gray-800", className)}>
        <SidebarContent />
      </div>
    </>
  )
}

function SidebarContent({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })
      
      if (response.ok) {
        toast({
          title: "Signed out successfully",
        })
        router.push("/")
      } else {
        throw new Error("Failed to sign out")
      }
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
