"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Twitter, Linkedin, Mail } from "lucide-react"

interface TeamCardProps {
  name: string
  role: string
  image: string
  description: string
}

export function TeamCard({ name, role, image, description }: TeamCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-black/40 border-gray-800 hover:border-amber-500/50 transition-all duration-300 h-full">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 group">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          <div className="flex space-x-3">
            <a
              href="#"
              className="text-gray-400 hover:text-amber-500 transition-colors"
              aria-label={`${name}'s Twitter`}
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-amber-500 transition-colors"
              aria-label={`${name}'s LinkedIn`}
            >
              <Linkedin size={18} />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors" aria-label={`Email ${name}`}>
              <Mail size={18} />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
