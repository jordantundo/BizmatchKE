"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-black/40 border-gray-800 hover:border-amber-500/50 transition-all duration-300 h-full">
        <CardHeader className="pb-2">
          <div className="mb-4">{icon}</div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
