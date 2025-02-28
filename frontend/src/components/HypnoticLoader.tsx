"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface HypnoticLoaderProps {
  size?: number
  color?: string
  secondaryColor?: string
  text?: string
  isLoading?: boolean
  ringCount?: number
}

export default function HypnoticLoader({
  size = 200,
  color = "#6366f1",
  secondaryColor = "#a5b4fc",
  text = "Loading",
  isLoading = true,
  ringCount = 5,
}: HypnoticLoaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Create an array of rings based on ringCount
  const rings = Array.from({ length: ringCount }, (_, i) => i)

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
        role="status"
        aria-label={`${text}${isLoading ? "" : " complete"}`}
      >
        {rings.map((ring, index) => {
          const ringSize = size * ((ringCount - index) / ringCount)
          const delay = index * -0.2

          return (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 rounded-full border-8 border-transparent"
              style={{
                width: ringSize,
                height: ringSize,
                borderTopColor: index % 2 === 0 ? color : secondaryColor,
                borderLeftColor: index % 2 === 0 ? color : secondaryColor,
                marginLeft: -ringSize / 2,
                marginTop: -ringSize / 2,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2 + index * 0.5,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
                delay,
              }}
            />
          )
        })}

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: size / 10,
            height: size / 10,
            backgroundColor: color,
            marginLeft: -size / 20,
            marginTop: -size / 20,
          }}
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </div>

      {text && (
        <motion.div
          className="text-center font-medium"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          {text}
        </motion.div>
      )}
    </div>
  )
}