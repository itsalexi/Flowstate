'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { ProgressRing } from '@/components/ProgressRing'
import { QuickAddDrawer } from '@/components/QuickAddDrawer'
import { TransactionList } from '@/components/TransactionList'
import { Onboarding } from '@/components/Onboarding'
import { useBudget } from '@/hooks/useBudget'
import { useStore, currencySymbols } from '@/store/useStore'

export default function Home() {
  const [showCalc, setShowCalc] = useState(false)
  const { currency, hasCompletedOnboarding } = useStore()
  const symbol = currencySymbols[currency]
  const { 
    fixedNet,
    spendableMonthlyBudget,
    baseWeeklyBucket,
    weeklyBucket,
    adjustedDailyTarget,
    weeklyRemaining,
    monthlyRemaining,
    todayTransactions,
    thisWeekTransactions,
    lastWeekTransactions,
    todaySpent,
    daysLeftInWeek,
    daysLeftInMonth,
    isSpendDay,
    remainingSpendDays,
    savingsRate,
    targetMonthlySavings,
    totalDebtFromPastWeeks,
    debtPerWeek,
    currentWeekNum,
  } = useBudget()

  if (!hasCompletedOnboarding) {
    return <Onboarding />
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-lg font-semibold tracking-tight">
            {(() => {
              const hour = new Date().getHours()
              if (hour < 12) return 'Good morning ☀️'
              if (hour < 17) return 'Good afternoon'
              return 'Good evening 🌙'
            })()}
          </h1>
        </div>
        <Link href="/settings">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.div>
        </Link>
      </div>

      {/* Hero Section - Available to spend today */}
      <div className="flex flex-col items-center py-2">
        <motion.div 
          className="relative cursor-pointer"
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCalc(true)}
        >
          <ProgressRing 
            progress={adjustedDailyTarget > 0 ? (todaySpent / adjustedDailyTarget) * 100 : 0} 
            size={180} 
            strokeWidth={10} 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isSpendDay ? (
              // Spend day - show daily target
              (() => {
                const todayRemaining = adjustedDailyTarget - todaySpent
                const isOverBudget = todayRemaining < 0
                const percentUsed = adjustedDailyTarget > 0 ? (todaySpent / adjustedDailyTarget) * 100 : 0
                
                return (
                  <>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      {isOverBudget ? 'Went a bit over' : 'You can spend'}
                    </span>
                    <motion.span 
                      key={todayRemaining}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`text-3xl font-bold tabular-nums tracking-tight ${
                        isOverBudget ? 'text-destructive' : ''
                      }`}
                    >
                      {symbol}{Math.abs(todayRemaining).toFixed(0)}
                    </motion.span>
                    <span className="text-[10px] text-muted-foreground">
                      {isOverBudget 
                        ? 'no worries, adjust tomorrow'
                        : percentUsed === 0 
                          ? 'fresh start today!'
                          : percentUsed < 50 
                            ? 'looking good 👍' 
                            : 'almost there'}
                    </span>
                  </>
                )
              })()
            ) : (
              // Rest day - no daily target, show week context
              <>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Enjoy your day
                </span>
                <span className="text-3xl font-bold tabular-nums tracking-tight text-primary">
                  ✨
                </span>
                <span className="text-[10px] text-muted-foreground">
                  no spending planned
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Calculation Dialog */}
      <AnimatePresence>
        {showCalc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCalc(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-5 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">How it&apos;s calculated</h3>
                <button onClick={() => setShowCalc(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-xs text-muted-foreground">Your monthly budget</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">After fixed expenses</span>
                  <span className="font-medium tabular-nums">{symbol}{fixedNet.toFixed(0)}</span>
                </div>
                {savingsRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">− {savingsRate}% savings target</span>
                    <span className="font-medium tabular-nums text-primary">−{symbol}{targetMonthlySavings.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Spendable</span>
                  <span className="font-medium tabular-nums">{symbol}{spendableMonthlyBudget.toFixed(0)}</span>
                </div>
                
                <p className="text-xs text-muted-foreground pt-2">Divided into 4 weeks</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">÷ 4 weeks</span>
                  <span className="font-medium tabular-nums">{symbol}{baseWeeklyBucket.toFixed(0)}/wk</span>
                </div>
                
                {totalDebtFromPastWeeks > 0 && (
                  <>
                    <div className="flex justify-between text-destructive">
                      <span>− Overspent (past weeks)</span>
                      <span className="font-medium tabular-nums">−{symbol}{totalDebtFromPastWeeks.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>− Debt split across remaining weeks</span>
                      <span className="font-medium tabular-nums">−{symbol}{debtPerWeek.toFixed(0)}/wk</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Week {currentWeekNum} budget</span>
                  <span className="font-medium tabular-nums">{symbol}{weeklyBucket.toFixed(0)}</span>
                </div>
                
                <p className="text-xs text-muted-foreground pt-2">Today&apos;s budget</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Week remaining</span>
                  <span className="font-medium tabular-nums">{symbol}{weeklyRemaining.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">÷ {remainingSpendDays} spend days left</span>
                  <span className="font-medium tabular-nums">{symbol}{adjustedDailyTarget.toFixed(0)}/day</span>
                </div>
                
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="text-muted-foreground">Spent today</span>
                  <span className="font-medium tabular-nums">{symbol}{todaySpent.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-medium">You can spend</span>
                  <span className={`font-bold tabular-nums ${adjustedDailyTarget - todaySpent < 0 ? 'text-destructive' : 'text-primary'}`}>
                    {symbol}{(adjustedDailyTarget - todaySpent).toFixed(0)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week & Month - Compact row */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Week</span>
            <span className="text-[10px] text-muted-foreground">{daysLeftInWeek}d</span>
          </div>
          <span className={`text-xl font-bold tabular-nums ${weeklyRemaining < 0 ? 'text-destructive' : ''}`}>
            {symbol}{weeklyRemaining.toFixed(0)}
          </span>
        </motion.div>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Month</span>
            <span className="text-[10px] text-muted-foreground">{daysLeftInMonth}d</span>
          </div>
          <span className={`text-xl font-bold tabular-nums ${monthlyRemaining < 0 ? 'text-destructive' : ''}`}>
            {symbol}{monthlyRemaining.toFixed(0)}
          </span>
        </motion.div>
      </div>

      {/* Quick Add Button */}
      <QuickAddDrawer>
        <motion.button 
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </motion.button>
      </QuickAddDrawer>

      {/* Today's Transactions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</h2>
          <Link href="/insights?view=history">
            <span className="text-xs text-primary font-medium">View All</span>
          </Link>
        </div>
        <TransactionList transactions={todayTransactions} compact />
      </div>

      {/* Recent Transactions */}
      {thisWeekTransactions.filter(tx => !todayTransactions.includes(tx)).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Week</h2>
          <TransactionList 
            transactions={thisWeekTransactions.filter(tx => !todayTransactions.includes(tx)).slice(0, 3)} 
            showDate 
            compact 
          />
        </div>
      )}

      {/* Last Week Transactions */}
      {lastWeekTransactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Week</h2>
          <TransactionList transactions={lastWeekTransactions.slice(0, 5)} showDate compact />
        </div>
      )}
    </div>
  )
}
