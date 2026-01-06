'use client'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ progress, size = 200, strokeWidth = 12 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  // Color based on progress - using CSS variables for theme support
  const getColor = () => {
    if (clampedProgress <= 50) return 'hsl(var(--primary))' // Green (primary)
    if (clampedProgress <= 75) return 'hsl(var(--warning))' // Yellow/Amber
    return 'hsl(var(--destructive))' // Red
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
    </div>
  )
}
