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

function isWithinRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr)
  return d >= start && d < end
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

export function getBudgetPeriodStart(date: Date = new Date()): Date {
  const monthStart = getMonthStart(date)
  return getWeekStart(monthStart)
}

export function getBudgetPeriodEnd(date: Date = new Date()): Date {
  const start = getBudgetPeriodStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 28)
  return end
}

export function isInBudgetPeriod(dateStr: string, now: Date = new Date()): boolean {
  const date = new Date(dateStr)
  const start = getBudgetPeriodStart(now)
  const end = getBudgetPeriodEnd(now)
  return date >= start && date < end
}

// Get which week number we're in for this month (1-4)
// Week 1 starts on the Sunday of the week that contains the 1st of the month.
// This matches common calendar week groupings like "Dec 28–Jan 3".
// We clamp to 4 weeks to preserve the "monthly income ÷ 4" invariant.
export function getWeekNumberInMonth(date: Date = new Date()): number {
  const monthStart = getMonthStart(date)
  const week1Start = getWeekStart(monthStart)
  const msPerDay = 24 * 60 * 60 * 1000
  const daysSinceWeek1 = Math.floor((date.getTime() - week1Start.getTime()) / msPerDay)
  const weekNum = Math.floor(daysSinceWeek1 / 7) + 1
  return Math.max(1, Math.min(4, weekNum))
}

// Get the start/end dates for a specific week number in the current month
function getWeekBoundsInMonth(weekNum: number): { start: Date; end: Date } {
  const monthStart = getMonthStart()
  const week1Start = getWeekStart(monthStart)
  const start = new Date(week1Start)
  start.setDate(start.getDate() + (weekNum - 1) * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

// Check if a date is in a specific week of the month
function isInWeekOfMonth(dateStr: string, weekNum: number): boolean {
  const date = new Date(dateStr)
  const { start, end } = getWeekBoundsInMonth(weekNum)
  return date >= start && date < end
}

// Get expenses for a specific week in the current month
function getExpensesForWeek(transactions: Transaction[], weekNum: number): number {
  const { start, end } = getWeekBoundsInMonth(weekNum)
  
  return transactions
    .filter((tx) => {
      const txDate = new Date(tx.date)
      return txDate >= start && txDate < end && tx.amount > 0
    })
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function useBudget() {
  const { transactions, recurringIncome, recurringExpenses, spendDays, savings, savingsRate } = useStore()

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

    // Get transactions for the current 4-week budget period
    const thisMonthTransactions = transactions.filter((tx) => isInBudgetPeriod(tx.date))

    // Current budget week number (1-4)
    const currentWeekNum = getWeekNumberInMonth()

    // Get transactions for the current budget week
    const thisWeekTransactions = transactions.filter((tx) => isInWeekOfMonth(tx.date, currentWeekNum))
    const thisWeekExpenses = thisWeekTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Calendar weeks (Sun–Sat) for showing "last week" on Home (regardless of budget period)
    const calendarThisWeekStart = getWeekStart(new Date())
    const calendarLastWeekStart = new Date(calendarThisWeekStart)
    calendarLastWeekStart.setDate(calendarLastWeekStart.getDate() - 7)
    const lastWeekTransactions = transactions.filter((tx) =>
      isWithinRange(tx.date, calendarLastWeekStart, calendarThisWeekStart)
    )
    const lastWeekSpent = lastWeekTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Separate expenses (positive) and income (negative) for the 4-week budget period
    const thisMonthExpenses = thisMonthTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
    const thisMonthIncome = thisMonthTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    // Effective monthly budget = fixedNet + any extra income added this period
    const effectiveMonthlyBudget = fixedNet + thisMonthIncome

    // Apply savings rate to get spendable budget
    const savingsMultiplier = 1 - (savingsRate / 100)
    const spendableMonthlyBudget = effectiveMonthlyBudget * savingsMultiplier
    const targetMonthlySavings = effectiveMonthlyBudget * (savingsRate / 100)

    // FIXED weekly bucket = monthly spendable / 4
    const baseWeeklyBucket = spendableMonthlyBudget / 4

    // Total overspend from prior weeks (week 1..currentWeekNum-1)
    let totalDebtFromPastWeeks = 0
    for (let week = 1; week < currentWeekNum; week++) {
      const weekExpenses = getExpensesForWeek(thisMonthTransactions, week)
      const weekDiff = baseWeeklyBucket - weekExpenses
      if (weekDiff < 0) totalDebtFromPastWeeks += Math.abs(weekDiff)
    }

    // Spread (amortize) debt across remaining weeks INCLUDING current
    const weeksRemaining = Math.max(1, 5 - currentWeekNum) // 4 total weeks
    const debtPerWeek = totalDebtFromPastWeeks / weeksRemaining

    const weeklyBucket = Math.max(0, baseWeeklyBucket - debtPerWeek)
    const weeklyRemaining = weeklyBucket - thisWeekExpenses

    // Monthly remaining (for display) = effective budget - period expenses
    const monthlyRemaining = effectiveMonthlyBudget - thisMonthExpenses

    // Base daily target = weekly bucket / spend days
    const baseDailyTarget = totalSpendDaysPerWeek > 0 ? weeklyBucket / totalSpendDaysPerWeek : 0

    // Remaining spend days this week (including today if it's a spend day)
    const remainingSpendDays = getRemainingSpendDays(spendDays)

    // Is today a spend day?
    const isSpendDay = isTodaySpendDay(spendDays)

    // Today's transactions (expenses only for display)
    const todayTransactions = transactions.filter((tx) => isToday(tx.date))
    const todayExpenses = todayTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Adjusted daily target spreads remaining weekly budget across remaining spend days
    const adjustedDailyTarget = remainingSpendDays > 0
      ? Math.max(0, (weeklyRemaining + todayExpenses) / remainingSpendDays)
      : baseDailyTarget

    // Days info (calendar-week)
    const daysElapsed = getDaysElapsed()
    const daysLeftInWeek = 7 - daysElapsed + 1
    const daysRemainingInMonth = getDaysRemainingInMonth()

    // Weekly progress
    const weeklyProgress = weeklyBucket > 0 ? (thisWeekExpenses / weeklyBucket) * 100 : 0

    // Category breakdown for the current week
    const categoryBreakdown = thisWeekTransactions.reduce(
      (acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      },
      {} as Record<string, number>
    )

    // Category breakdown for the period
    const monthlyCategoryBreakdown = thisMonthTransactions.reduce(
      (acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      },
      {} as Record<string, number>
    )

    const budgetWeeks = Array.from({ length: 4 }, (_, i) => {
      const weekNum = i + 1
      const { start, end } = getWeekBoundsInMonth(weekNum)
      const weekTransactions = thisMonthTransactions.filter((tx) => isWithinRange(tx.date, start, end))
      const spent = weekTransactions
        .filter((tx) => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0)

      const status: 'past' | 'current' | 'future' =
        weekNum < currentWeekNum ? 'past' : weekNum === currentWeekNum ? 'current' : 'future'

      // Only show net for elapsed weeks.
      // Past weeks: baseWeeklyBucket - spent
      // Current week: weeklyBucket - spent (== weeklyRemaining)
      // Future weeks: null (not started yet)
      const net =
        status === 'past'
          ? baseWeeklyBucket - spent
          : status === 'current'
            ? weeklyBucket - spent
            : null

      const budgetForWeek = status === 'current' ? weeklyBucket : baseWeeklyBucket

      return { weekNum, start, end, transactions: weekTransactions, spent, net, status, budgetForWeek }
    })

    const spendableSoFar = baseWeeklyBucket * (currentWeekNum - 1) + weeklyBucket
    const savedSoFar = spendableSoFar - thisMonthExpenses

    // Banked savings
    const totalSavings = savings.reduce((sum, entry) => sum + entry.amount, 0)

    // Actual savings (simple) = what we haven't spent from effective budget
    const actualMonthlySavings = Math.max(0, effectiveMonthlyBudget - thisMonthExpenses)

    return {
      // Core numbers
      fixedNet,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      effectiveMonthlyBudget,
      spendableMonthlyBudget,
      baseWeeklyBucket,
      weeklyBucket,
      baseDailyTarget,
      adjustedDailyTarget,
      totalDebtFromPastWeeks,
      debtPerWeek,
      currentWeekNum,

      // Dynamic budget info
      isSpendDay,
      remainingSpendDays,
      totalSpendDaysPerWeek,

      // Week stats
      thisWeekSpent: thisWeekExpenses,
      thisWeekTransactions,
      lastWeekSpent,
      lastWeekTransactions,
      weeklyProgress,
      weeklyRemaining,
      daysElapsed,
      daysLeftInWeek,

      // Month stats
      thisMonthSpent: thisMonthExpenses,
      thisMonthTransactions,
      budgetWeeks,
      spendableSoFar,
      savedSoFar,
      monthlyRemaining,
      daysLeftInMonth: daysRemainingInMonth,

      // Today stats
      todayTransactions,
      todaySpent: todayExpenses,

      // Category breakdown
      categoryBreakdown,
      monthlyCategoryBreakdown,

      // Savings
      totalSavings,
      savingsRate,
      targetMonthlySavings,
      actualMonthlySavings,

      // Utility
      hasSetup: true,
    }
  }, [transactions, recurringIncome, recurringExpenses, spendDays, savings, savingsRate])
}
