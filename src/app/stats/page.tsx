'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PiggyBank, TrendingUp, TrendingDown, Target, Flame, Calendar } from 'lucide-react'
import { DonutChart, BarChart } from '@tremor/react'
import { useStore, Category, currencySymbols } from '@/store/useStore'
import { useBudget, getWeekStart } from '@/hooks/useBudget'

const categoryLabels: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Fun',
  shopping: 'Shop',
  health: 'Health',
  utilities: 'Bills',
  other: 'Other',
}

export default function StatsPage() {
  const { transactions, savings, currency } = useStore()
  const symbol = currencySymbols[currency]
  const { 
    monthlyCategoryBreakdown,
    thisWeekSpent, 
    thisMonthSpent,
    weeklyBucket,
    fixedNet,
    baseDailyTarget,
    todaySpent,
  } = useBudget()

  // Use monthly breakdown for more data
  const donutData = useMemo(() => {
    return Object.entries(monthlyCategoryBreakdown)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: categoryLabels[category as Category],
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
  }, [monthlyCategoryBreakdown])

  // Top spending category
  const topCategory = donutData[0]

  const weeklyTrendData = useMemo(() => {
    const weeks: { week: string; spent: number; budget: number }[] = []
    const now = new Date()
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000))
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const weekTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date)
        return txDate >= weekStart && txDate < weekEnd
      })
      
      const spent = weekTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      
      weeks.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spent,
        budget: weeklyBucket,
      })
    }
    
    return weeks
  }, [transactions, weeklyBucket])

  // Calculate averages and insights
  const avgDailySpend = thisMonthSpent / new Date().getDate()
  const isOverDailyAvg = todaySpent > avgDailySpend
  const weeklyEfficiency = weeklyBucket > 0 
    ? Math.max(0, ((weeklyBucket - thisWeekSpent) / weeklyBucket) * 100)
    : 0
  const monthlyEfficiency = fixedNet > 0
    ? Math.max(0, ((fixedNet - thisMonthSpent) / fixedNet) * 100)
    : 0

  // Streak calculation (days under budget)
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const daySpent = transactions
        .filter(tx => tx.date.startsWith(dateStr))
        .reduce((sum, tx) => sum + tx.amount, 0)
      if (daySpent <= baseDailyTarget) {
        count++
      } else {
        break
      }
    }
    return count
  }, [transactions, baseDailyTarget])

  const totalSavings = savings.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-lg font-semibold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm">
          Your spending patterns & trends
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Week efficiency</span>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${weeklyEfficiency < 30 ? 'text-destructive' : weeklyEfficiency > 70 ? 'text-primary' : ''}`}>
            {weeklyEfficiency.toFixed(0)}%
          </span>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Month efficiency</span>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${monthlyEfficiency < 30 ? 'text-destructive' : monthlyEfficiency > 70 ? 'text-primary' : ''}`}>
            {monthlyEfficiency.toFixed(0)}%
          </span>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</span>
          </div>
          <span className="text-2xl font-bold tabular-nums">{streak}</span>
          <span className="text-xs text-muted-foreground ml-1">days</span>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-1">
            {isOverDailyAvg ? (
              <TrendingUp className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Daily avg</span>
          </div>
          <span className="text-2xl font-bold tabular-nums">{symbol}{avgDailySpend.toFixed(0)}</span>
        </motion.div>
      </div>

      {/* Top Category Insight */}
      {topCategory && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <p className="text-sm">
            <span className="text-muted-foreground">Most spent on: </span>
            <span className="font-semibold">{topCategory.name}</span>
            <span className="text-muted-foreground"> at </span>
            <span className="font-semibold tabular-nums">{symbol}{topCategory.value.toFixed(0)}</span>
            <span className="text-muted-foreground"> this month</span>
          </p>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">This Month by Category</h2>
        <div className="p-4 rounded-lg border border-border bg-card">
          {donutData.length > 0 ? (
            <DonutChart
              data={donutData}
              category="value"
              index="name"
              valueFormatter={(value) => `${symbol}${value.toFixed(0)}`}
              colors={['emerald', 'sky', 'violet', 'rose', 'amber', 'slate']}
              className="h-40"
              showAnimation
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              No spending data this month
            </div>
          )}
        </div>
      </section>

      {/* Weekly Trend */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Last 4 Weeks</h2>
        <div className="p-4 rounded-lg border border-border bg-card">
          <BarChart
            data={weeklyTrendData}
            index="week"
            categories={['spent']}
            colors={['emerald']}
            valueFormatter={(value) => `${symbol}${value.toFixed(0)}`}
            className="h-36"
            showAnimation
          />
        </div>
      </section>

      {/* Savings */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-medium text-muted-foreground">Banked Savings</h2>
        </div>
        
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-lg border border-primary/20 bg-primary/5"
        >
          <p className="text-xs text-muted-foreground">Total Saved</p>
          <p className="text-3xl font-bold tabular-nums text-primary">{symbol}{totalSavings.toFixed(0)}</p>
        </motion.div>
        
        {savings.length > 0 ? (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {savings.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-md border border-border text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(entry.weekStart).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="font-medium text-primary tabular-nums">+{symbol}{entry.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-3 text-muted-foreground text-xs">
            Leftover budget gets banked here weekly
          </p>
        )}
      </section>
    </div>
  )
}
