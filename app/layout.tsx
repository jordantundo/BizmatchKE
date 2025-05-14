import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "./theme-script.tsx"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BizMatchKE - Launch Your Dream Business in Kenya",
  description:
    "Get AI-generated personalized business ideas tailored to your skills, interests, and Kenya's market opportunities.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  )
}
