"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface StepCardProps {
  number: number
  title: string
  description: string
  icon: ReactNode
}

export function StepCard({ number, title, description, icon }: StepCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-black/40 border-gray-800 hover:border-amber-500/50 transition-all duration-300 h-full">
        <CardHeader className="pb-2 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl mb-4">
            {number}
          </div>
          <div className="mb-2">{icon}</div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
