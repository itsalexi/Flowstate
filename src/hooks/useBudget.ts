import { useMemo } from 'react'
import { useStore, Transaction, Frequency, SpendDays, DayOfWeek } from '@/store/useStore'

// Get the start of the current week (Sunday)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get the start of the current month
export function getMonthStart(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get days remaining in the month
export function getDaysRemainingInMonth(date: Date = new Date()): number {
  const d = new Date(date)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return lastDay - d.getDate()
}

// Get days elapsed in the current week (1-7, starting Sunday)
export function getDaysElapsed(date: Date = new Date()): number {
  const day = date.getDay() // 0 = Sunday
  return day + 1 // 1-7 range (Sunday = 1, Saturday = 7)
}

// Count total spend days in a week
export function countSpendDays(spendDays: SpendDays): number {
  return Object.values(spendDays).filter(Boolean).length
}

// Count remaining spend days in the current week (including today if it's a spend day)
export function getRemainingSpendDays(spendDays: SpendDays, date: Date = new Date()): number {
  const currentDay = date.getDay() as DayOfWeek
  let count = 0
  for (let day = currentDay; day <= 6; day++) {
    if (spendDays[day as DayOfWeek]) count++
  }
  return count
}

// Check if today is a spend day
export function isTodaySpendDay(spendDays: SpendDays, date: Date = new Date()): boolean {
  const currentDay = date.getDay() as DayOfWeek
  return spendDays[currentDay]
}

// Convert any frequency to monthly amount
export function toMonthlyAmount(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case 'daily': return amount * 30
    case 'weekly': return amount * 4
    case 'monthly': return amount
  }
}

// Check if a date is in the current week
export function isInCurrentWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  return date >= weekStart && date < weekEnd
}

// Check if a date is today
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Format a date for display
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Group transactions by week
export function groupTransactionsByWeek(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>()
  
  transactions.forEach((tx) => {
    const weekStart = getWeekStart(new Date(tx.date))
    const key = weekStart.toISOString()
    
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(tx)
  })
  
  return groups
}

// Check if a date is in the current month
export function isInCurrentMonth(dateStr: string): boolean {
  const date = new Date(dateStr)
  const monthStart = getMonthStart()
  const monthEnd = new Date(monthStart)
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  return date >= monthStart && date < monthEnd
}

export function useBudget() {
  const { transactions, recurringIncome, recurringExpenses, spendDays } = useStore()

  return useMemo(() => {
    // Calculate Fixed Net (Monthly Income - Monthly Expenses)
    const totalMonthlyIncome = recurringIncome.reduce(
      (sum, item) => sum + toMonthlyAmount(item.amount, item.frequency || 'monthly'), 0
    )
    const totalMonthlyExpenses = recurringExpenses.reduce(
      (sum, item) => sum + toMonthlyAmount(item.amount, item.frequency || 'monthly'), 0
    )
    const fixedNet = totalMonthlyIncome - totalMonthlyExpenses

    // Count spend days per week
    const totalSpendDaysPerWeek = countSpendDays(spendDays)

    // Get transactions for the current month
    const thisMonthTransactions = transactions.filter((tx) => isInCurrentMonth(tx.date))
    
    // Separate expenses (positive) and income (negative) for the month
    const thisMonthExpenses = thisMonthTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
    const thisMonthIncome = thisMonthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    
    // Effective monthly budget = fixedNet + any extra income added this month
    const effectiveMonthlyBudget = fixedNet + thisMonthIncome
    
    // Monthly remaining = effective budget - expenses
    const monthlyRemaining = effectiveMonthlyBudget - thisMonthExpenses

    // Calculate remaining weeks in month (including this week)
    const daysLeftInMonth = getDaysRemainingInMonth() + 1 // +1 to include today
    const weeksLeftInMonth = Math.max(1, Math.ceil(daysLeftInMonth / 7))
    
    // Weekly budget = monthly remaining / weeks left
    // This automatically carries over any over/under spending
    const weeklyBucket = monthlyRemaining / weeksLeftInMonth

    // Base daily target based on spend days remaining in month
    const spendDaysLeftInMonth = Math.max(1, Math.ceil(daysLeftInMonth / 7) * totalSpendDaysPerWeek)
    const baseDailyTarget = monthlyRemaining > 0 ? monthlyRemaining / spendDaysLeftInMonth : 0

    // Get transactions for the current week
    const thisWeekTransactions = transactions.filter((tx) => isInCurrentWeek(tx.date))
    const thisWeekExpenses = thisWeekTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    // Weekly remaining = this week's budget - this week's expenses
    const weeklyRemaining = weeklyBucket - thisWeekExpenses

    // Remaining spend days this week (including today if it's a spend day)
    const remainingSpendDays = getRemainingSpendDays(spendDays)

    // Is today a spend day?
    const isSpendDay = isTodaySpendDay(spendDays)

    // Today's transactions (expenses only for display)
    const todayTransactions = transactions.filter((tx) => isToday(tx.date))
    const todayExpenses = todayTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)

    // ADJUSTED DAILY TARGET: If we're over/under for the week, recalculate
    // This spreads the remaining budget across remaining spend days
    const adjustedDailyTarget = remainingSpendDays > 0
      ? Math.max(0, (weeklyRemaining + todayExpenses) / remainingSpendDays)
      : baseDailyTarget

    // Days info
    const daysElapsed = getDaysElapsed()
    const daysLeftInWeek = 7 - daysElapsed + 1
    const daysRemainingInMonth = getDaysRemainingInMonth()

    // Calculate how many spend days have passed (not including today)
    const currentDay = new Date().getDay() as DayOfWeek
    let spendDaysPassed = 0
    for (let day = 0; day < currentDay; day++) {
      if (spendDays[day as DayOfWeek]) spendDaysPassed++
    }

    // Buffer calculation: how much have we saved vs expected?
    // Positive = saved, negative = overspent
    const expectedSpentByNow = baseDailyTarget * spendDaysPassed
    const actualSpentBeforeToday = thisWeekExpenses - todayExpenses
    const weeklyBuffer = expectedSpentByNow - actualSpentBeforeToday

    // Weekly progress (percentage of weekly budget spent)
    const weeklyProgress = weeklyBucket > 0 ? (thisWeekExpenses / weeklyBucket) * 100 : 0

    // Category breakdown for the current week
    const categoryBreakdown = thisWeekTransactions.reduce(
      (acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      },
      {} as Record<string, number>
    )

    // Category breakdown for the month
    const monthlyCategoryBreakdown = thisMonthTransactions.reduce(
      (acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      },
      {} as Record<string, number>
    )

    return {
      // Core numbers
      fixedNet,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      effectiveMonthlyBudget,
      weeklyBucket,
      baseDailyTarget,
      adjustedDailyTarget,
      
      // Dynamic budget info
      isSpendDay,
      remainingSpendDays,
      totalSpendDaysPerWeek,
      weeklyBuffer,
      
      // Week stats
      thisWeekSpent: thisWeekExpenses,
      thisWeekTransactions,
      weeklyProgress,
      weeklyRemaining,
      daysElapsed,
      daysLeftInWeek,
      
      // Month stats
      thisMonthSpent: thisMonthExpenses,
      thisMonthTransactions,
      monthlyRemaining,
      daysLeftInMonth: daysRemainingInMonth,
      
      // Today stats
      todayTransactions,
      todaySpent: todayExpenses,
      
      // Category breakdown
      categoryBreakdown,
      monthlyCategoryBreakdown,
      
      // Utility
      hasSetup: recurringIncome.length > 0,
    }
  }, [transactions, recurringIncome, recurringExpenses, spendDays])
}
