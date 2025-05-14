"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setIsOpen(false)

    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-amber-500 font-bold text-2xl z-10">
          BizMatchKE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-white hover:text-amber-500 transition-colors"
            onClick={(e) => handleNavClick(e, "features")}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-white hover:text-amber-500 transition-colors"
            onClick={(e) => handleNavClick(e, "how-it-works")}
          >
            How It Works
          </a>
          <a
            href="#team"
            className="text-white hover:text-amber-500 transition-colors"
            onClick={(e) => handleNavClick(e, "team")}
          >
            Team
          </a>
        </nav>

        <Link href="/auth/login">
          <Button className="hidden md:block bg-amber-500 hover:bg-amber-600 text-black font-medium z-10">Login</Button>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white z-10"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 bg-black/95 flex flex-col items-center justify-center transition-all duration-300 md:hidden",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible",
          )}
        >
          <nav className="flex flex-col items-center space-y-8 text-xl">
            <a
              href="#features"
              className="text-white hover:text-amber-500 transition-colors"
              onClick={(e) => handleNavClick(e, "features")}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white hover:text-amber-500 transition-colors"
              onClick={(e) => handleNavClick(e, "how-it-works")}
            >
              How It Works
            </a>
            <a
              href="#team"
              className="text-white hover:text-amber-500 transition-colors"
              onClick={(e) => handleNavClick(e, "team")}
            >
              Team
            </a>
            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium mt-4">Login</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
