'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onRefresh: () => void | Promise<void>
  children: React.ReactNode
  thresholdPx?: number
  maxPullPx?: number
}

export function PullToRefresh({
  onRefresh,
  children,
  thresholdPx = 150, // Increased threshold default
  maxPullPx = 120,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const startYRef = useRef<number | null>(null)
  const pullingRef = useRef(false)

  const [pullPx, setPullPx] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const isAtTop = () => el.scrollTop <= 0
    const shouldStart = (clientY: number) => clientY < 50

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return
      if (!isAtTop()) return
      if (e.touches.length !== 1) return
      const y = e.touches[0].clientY
      if (!shouldStart(y)) return
      startYRef.current = y
      pullingRef.current = true
      setPullPx(0)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return
      if (isRefreshing) return
      if (!isAtTop()) return
      if (startYRef.current == null) return

      const dy = e.touches[0].clientY - startYRef.current
      if (dy <= 12) {
        setPullPx(0)
        return
      }

      // prevent native overscroll while we're pulling
      e.preventDefault()

      const eased = Math.min(maxPullPx, dy * 0.6)
      setPullPx(eased)
    }

    const onTouchEnd = async () => {
      if (!pullingRef.current) return
      pullingRef.current = false

      const shouldRefresh = pullPx >= thresholdPx
      if (!shouldRefresh) {
        setPullPx(0)
        startYRef.current = null
        return
      }

      try {
        setIsRefreshing(true)
        setPullPx(thresholdPx)
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullPx(0)
        startYRef.current = null
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [isRefreshing, maxPullPx, onRefresh, pullPx, thresholdPx])

  const progress = Math.min(1, pullPx / thresholdPx)

  return (
    <div ref={containerRef} className="h-dvh overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div
        className="sticky top-0 z-10"
        style={{ height: pullPx }}
      >
        <div className="h-full flex items-end justify-center">
          <div
            className="mb-2 text-xs text-muted-foreground"
            style={{ opacity: pullPx > 4 ? 1 : 0, transform: `scale(${0.9 + progress * 0.1})` }}
          >
            {isRefreshing ? 'Refreshing…' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
