'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Utensils, 
  Car, 
  Gamepad2, 
  ShoppingBag, 
  Heart, 
  Zap, 
  MoreHorizontal,
  Delete,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore, Category, currencySymbols } from '@/store/useStore'

const categories: { id: Category; icon: React.ReactNode; label: string }[] = [
  { id: 'food', icon: <Utensils className="w-4 h-4" />, label: 'Food' },
  { id: 'transport', icon: <Car className="w-4 h-4" />, label: 'Transport' },
  { id: 'entertainment', icon: <Gamepad2 className="w-4 h-4" />, label: 'Fun' },
  { id: 'shopping', icon: <ShoppingBag className="w-4 h-4" />, label: 'Shop' },
  { id: 'health', icon: <Heart className="w-4 h-4" />, label: 'Health' },
  { id: 'utilities', icon: <Zap className="w-4 h-4" />, label: 'Bills' },
  { id: 'other', icon: <MoreHorizontal className="w-4 h-4" />, label: 'Other' },
]

interface QuickAddDrawerProps {
  children: React.ReactNode
}

// Format date for display
function formatDateShort(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type TransactionType = 'expense' | 'income'

export function QuickAddDrawer({ children }: QuickAddDrawerProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('food')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [transactionType, setTransactionType] = useState<TransactionType>('expense')
  
  const { 
    addTransaction, 
    quickExpenses, 
    addQuickExpense, 
    incrementQuickExpenseUsage,
    currency 
  } = useStore()
  
  const symbol = currencySymbols[currency]

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return
    }

    // For income, we use negative amount (adds to budget instead of subtracting)
    // Or we could use a separate field - for now, income uses 'other' category with negative display
    const finalAmount = transactionType === 'income' ? -numAmount : numAmount

    addTransaction({
      amount: finalAmount,
      category: transactionType === 'income' ? 'other' : selectedCategory,
      note: transactionType === 'income' ? (note.trim() || 'Income') : note.trim(),
      date: selectedDate.toISOString(),
    })

    // Save as quick expense if it has a note (only for expenses)
    if (transactionType === 'expense' && note.trim()) {
      const existing = quickExpenses.find(
        (qe) => qe.note === note.trim() && qe.category === selectedCategory
      )
      if (existing) {
        incrementQuickExpenseUsage(existing.id)
      } else {
        addQuickExpense({
          amount: numAmount,
          category: selectedCategory,
          note: note.trim(),
          isFavorite: false,
        })
      }
    }

    setAmount('')
    setNote('')
    setSelectedCategory('food')
    setSelectedDate(new Date())
    setTransactionType('expense')
    setOpen(false)
  }

  const adjustDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    // Don't allow future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate)
    }
  }

  const handleKeypadPress = (value: string) => {
    if (value === 'backspace') {
      setAmount((prev) => prev.slice(0, -1))
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => (prev === '' ? '0.' : prev + '.'))
      }
    } else {
      const parts = amount.split('.')
      if (parts[1] && parts[1].length >= 2) return
      setAmount((prev) => prev + value)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="px-4 pb-6">
        <DrawerTitle className="sr-only">Add Transaction</DrawerTitle>
        <div className="mx-auto w-full max-w-sm">
          {/* Amount Display */}
          <div className="py-4 text-center">
            <motion.div 
              key={amount + transactionType}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`text-5xl font-bold tabular-nums tracking-tight ${
                transactionType === 'income' ? 'text-primary' : ''
              }`}
            >
              {symbol}{amount || '0'}
            </motion.div>
          </div>

          {/* Transaction Type Toggle - Full Width */}
          <div className="flex bg-muted/50 rounded-lg p-1 mb-4">
            <button
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'expense'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'income'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Selector (only for expenses) */}
          {transactionType === 'expense' && (
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {cat.icon}
                  <span className="text-[10px]">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Note Input */}
          <Input
            placeholder={transactionType === 'income' ? 'Source (e.g., Allowance, Gift)' : 'Add a note (saves for quick pick)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 h-10"
          />

          {/* Date Picker - Full Width */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => adjustDate(-1)}
              className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted/50">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatDateShort(selectedDate)}</span>
            </div>
            <button
              onClick={() => adjustDate(1)}
              disabled={selectedDate.toDateString() === new Date().toDateString()}
              className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeypadPress(key)}
                className="h-11 rounded-lg bg-muted/50 hover:bg-muted text-lg font-medium flex items-center justify-center transition-colors"
              >
                {key === 'backspace' ? <Delete className="w-5 h-5" /> : key}
              </motion.button>
            ))}
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className={`w-full h-11 ${transactionType === 'income' ? 'bg-primary hover:bg-primary/90' : ''}`}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {transactionType === 'income' ? 'Add Income' : 'Add Expense'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
