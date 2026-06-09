"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Set a timeout to hide the splash screen after the page loads
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1, delay: 0.1 } }} // 100ms delay fade off
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-background/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }} // Dynamic Pop up effect
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 0.8 
            }}
          >
            <div className="text-6xl font-bold tracking-tight text-white drop-shadow-xl">
              AeroHive
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
