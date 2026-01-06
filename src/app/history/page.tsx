'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TransactionList } from '@/components/TransactionList'
import { useStore, Category, currencySymbols } from '@/store/useStore'
import { groupTransactionsByWeek } from '@/hooks/useBudget'

const categoryLabels: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Fun',
  shopping: 'Shop',
  health: 'Health',
  utilities: 'Bills',
  other: 'Other',
}

export default function HistoryPage() {
  const { transactions, currency } = useStore()
  const symbol = currencySymbols[currency]
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')

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

  const totalSpent = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-lg font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground text-sm">
          All transactions, grouped by week
        </p>
      </div>

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

      {/* Stats */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
      >
        <span className="text-sm text-muted-foreground">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </span>
        <span className="text-lg font-semibold tabular-nums">{symbol}{totalSpent.toFixed(0)}</span>
      </motion.div>

      {/* Grouped Transactions */}
      {sortedWeeks.length > 0 ? (
        <div className="space-y-4">
          {sortedWeeks.map(([weekStart, weekTransactions]) => {
            const weekTotal = weekTransactions.reduce((sum, tx) => sum + tx.amount, 0)
            const weekDate = new Date(weekStart)
            
            return (
              <section key={weekStart} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Week of {weekDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {symbol}{weekTotal.toFixed(0)}
                  </span>
                </div>
                <TransactionList 
                  transactions={weekTransactions} 
                  showDate
                  compact
                />
              </section>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {searchQuery || selectedCategory !== 'all' 
            ? 'No transactions match your search'
            : 'No transactions yet'}
        </div>
      )}
    </div>
  )
}
