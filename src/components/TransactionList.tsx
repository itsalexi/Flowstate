'use client'

import { AnimatePresence } from 'framer-motion'
import { 
  Utensils, 
  Car, 
  Gamepad2, 
  ShoppingBag, 
  Heart, 
  Zap, 
  MoreHorizontal
} from 'lucide-react'
import { Transaction, Category, useStore, currencySymbols } from '@/store/useStore'
import { formatDate } from '@/hooks/useBudget'
import { SwipeableTransaction } from './SwipeableTransaction'

const categoryIcons: Record<Category, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  utilities: <Zap className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
}

const categoryColors: Record<Category, string> = {
  food: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  transport: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  entertainment: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  shopping: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  health: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  utilities: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

interface TransactionListProps {
  transactions: Transaction[]
  showDate?: boolean
  compact?: boolean
}

export function TransactionList({ transactions, showDate = false, compact = false }: TransactionListProps) {
  const { deleteTransaction, currency } = useStore()
  const symbol = currencySymbols[currency]

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {transactions.map((tx) => (
          <SwipeableTransaction key={tx.id} onDelete={() => deleteTransaction(tx.id)}>
            <div className={`flex items-center gap-3 ${compact ? 'p-2.5' : 'p-3'} border border-border rounded-lg bg-card`}>
              <div className={`${compact ? 'p-1.5' : 'p-2'} rounded-md ${categoryColors[tx.category]}`}>
                {categoryIcons[tx.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium capitalize ${compact ? 'text-sm' : ''}`}>
                  {tx.note || tx.category}
                </div>
                {tx.note && (
                  <div className="text-xs text-muted-foreground">{tx.category}</div>
                )}
                {showDate && (
                  <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                )}
              </div>
              <div className="font-semibold tabular-nums text-sm">
                -{symbol}{tx.amount.toFixed(0)}
              </div>
            </div>
          </SwipeableTransaction>
        ))}
      </AnimatePresence>
    </div>
  )
}
