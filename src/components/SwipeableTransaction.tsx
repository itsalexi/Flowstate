'use client'

import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Trash2 } from 'lucide-react'

interface SwipeableTransactionProps {
  children: React.ReactNode
  onDelete: () => void
}

export function SwipeableTransaction({ children, onDelete }: SwipeableTransactionProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  
  const deleteOpacity = useTransform(x, [-100, -60], [1, 0])
  const deleteScale = useTransform(x, [-100, -60], [1, 0.8])
  const backgroundOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete()
      }, 200)
    }
  }

  if (isDeleting) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        className="overflow-hidden"
      />
    )
  }

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-lg">
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-destructive rounded-lg"
        style={{ opacity: backgroundOpacity }}
      >
        <motion.div style={{ opacity: deleteOpacity, scale: deleteScale }}>
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
        </motion.div>
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-card cursor-grab active:cursor-grabbing"
        transition={{ type: 'tween', duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}
