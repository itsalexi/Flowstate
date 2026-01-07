'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, List, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TransactionList } from '@/components/TransactionList'
import { PullToRefresh } from '@/components/PullToRefresh'
import { useStore, Category, currencySymbols } from '@/store/useStore'
import { useBudget, groupTransactionsByWeek } from '@/hooks/useBudget'

const categoryLabels: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Fun',
  shopping: 'Shop',
  health: 'Health',
  utilities: 'Bills',
  other: 'Other',
}

type ViewMode = 'history' | 'ledger'

function InsightsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('history')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [ledgerView, setLedgerView] = useState<'months' | 'weeks' | 'week_detail'>('months')
  const [selectedWeekNum, setSelectedWeekNum] = useState<number | null>(null)

  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'history' || view === 'ledger') {
      setViewMode(view)
    }
  }, [searchParams])
  
  const { transactions, currency, monthlyRecords } = useStore()
  const symbol = currencySymbols[currency]
  const { 
    thisMonthSpent,
    budgetWeeks,
    savedSoFar,
  } = useBudget()

  // History calculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = 
        tx.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [transactions, searchQuery, selectedCategory])

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByWeek(filteredTransactions)
  }, [filteredTransactions])

  const sortedWeeks = useMemo(() => {
    return Array.from(groupedTransactions.entries()).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    )
  }, [groupedTransactions])

  const totalSpent = filteredTransactions.reduce((sum, tx) => sum + Math.max(0, tx.amount), 0)

  return (
    <PullToRefresh onRefresh={() => router.refresh()}>
      <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-lg font-semibold tracking-tight">Insights</h1>
        
        {/* View Toggle */}
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'history'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            History
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'ledger'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Ledger
          </motion.button>
        </div>
      </div>

      {viewMode === 'history' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              All
            </motion.button>
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                {categoryLabels[cat]}
              </motion.button>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length} transactions
            </span>
            <span className="text-lg font-semibold tabular-nums">{symbol}{totalSpent.toFixed(0)}</span>
          </div>

          {/* Grouped Transactions */}
          {sortedWeeks.length > 0 ? (
            <div className="space-y-4">
              {sortedWeeks.map(([weekStart, weekTransactions]) => {
                const weekTotal = weekTransactions.reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0)
                const weekDate = new Date(weekStart)
                
                return (
                  <div key={weekStart} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Week of {weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {symbol}{weekTotal.toFixed(0)}
                      </span>
                    </div>
                    <TransactionList transactions={weekTransactions} showDate compact />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No matching transactions' 
                : 'No transactions yet'}
            </div>
          )}
        </div>
      )}

      {viewMode === 'ledger' && (
        <div className="space-y-4">
          {ledgerView === 'months' && (
            <>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="text-sm font-medium mb-3">This Month (so far)</div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLedgerView('weeks')
                    setSelectedWeekNum(null)
                  }}
                  className="w-full text-left p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Net saved</span>
                    <span className={`font-bold tabular-nums ${savedSoFar >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {savedSoFar >= 0 ? '+' : ''}{symbol}{savedSoFar.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Spent: {symbol}{thisMonthSpent.toFixed(0)}</span>
                    <span>Tap to view weeks</span>
                  </div>
                </motion.button>
              </div>

              {monthlyRecords.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Past Months</h3>
                  {monthlyRecords.map((record) => (
                    <div key={record.id} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{record.month}</span>
                        <span className={`font-semibold tabular-nums ${record.savedAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {record.savedAmount >= 0 ? '+' : ''}{symbol}{record.savedAmount.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Income: {symbol}{record.income.toFixed(0)}</span>
                        <span>Spent: {symbol}{record.variableExpenses.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {monthlyRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Past months will appear here
                </div>
              )}
            </>
          )}

          {ledgerView === 'weeks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">This Month</div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLedgerView('months')
                    setSelectedWeekNum(null)
                  }}
                  className="text-xs text-primary font-medium"
                >
                  Back
                </motion.button>
              </div>

              {budgetWeeks.map((w) => (
                <motion.button
                  key={w.weekNum}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedWeekNum(w.weekNum)
                    setLedgerView('week_detail')
                  }}
                  className="w-full text-left p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Week {w.weekNum}</span>
                    {w.net == null ? (
                      <span className="text-muted-foreground tabular-nums">—</span>
                    ) : (
                      <span className={`font-bold tabular-nums ${w.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {w.net >= 0 ? '+' : ''}{symbol}{w.net.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Spent: {symbol}{w.spent.toFixed(0)}</span>
                    <span>{w.transactions.length} tx</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {ledgerView === 'week_detail' && selectedWeekNum != null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Week {selectedWeekNum}</div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLedgerView('weeks')}
                  className="text-xs text-primary font-medium"
                >
                  Back
                </motion.button>
              </div>
              <TransactionList
                transactions={(budgetWeeks.find((w) => w.weekNum === selectedWeekNum)?.transactions || []).slice().sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )}
                showDate
                compact
              />
            </div>
          )}
        </div>
      )}
      </div>
    </PullToRefresh>
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="p-4 pt-6"><div className="h-6 w-24 bg-muted rounded animate-pulse" /></div>}>
      <InsightsContent />
    </Suspense>
  )
}
