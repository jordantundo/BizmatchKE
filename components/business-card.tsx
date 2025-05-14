"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface BusinessCardProps {
  title: string
  image: string
  description: string
}

export function BusinessCard({ title, image, description }: BusinessCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-black/40 border-gray-800 overflow-hidden h-full">
        <div className="relative h-48 overflow-hidden group">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
