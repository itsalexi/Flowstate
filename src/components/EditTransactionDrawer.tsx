'use client'

import { useState, useEffect } from 'react'
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
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Transaction, Category, useStore, currencySymbols } from '@/store/useStore'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

const categories: { id: Category; icon: React.ReactNode; label: string }[] = [
  { id: 'food', icon: <Utensils className="w-4 h-4" />, label: 'Food' },
  { id: 'transport', icon: <Car className="w-4 h-4" />, label: 'Transport' },
  { id: 'entertainment', icon: <Gamepad2 className="w-4 h-4" />, label: 'Fun' },
  { id: 'shopping', icon: <ShoppingBag className="w-4 h-4" />, label: 'Shop' },
  { id: 'health', icon: <Heart className="w-4 h-4" />, label: 'Health' },
  { id: 'utilities', icon: <Zap className="w-4 h-4" />, label: 'Bills' },
  { id: 'other', icon: <MoreHorizontal className="w-4 h-4" />, label: 'Other' },
]

function formatDateShort(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

interface EditTransactionDrawerProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionDrawer({ transaction, open, onOpenChange }: EditTransactionDrawerProps) {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('food')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  
  const { updateTransaction, deleteTransaction, restoreTransaction, currency } = useStore()
  const symbol = currencySymbols[currency]

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString())
      setSelectedCategory(transaction.category)
      setNote(transaction.note)
      setSelectedDate(new Date(transaction.date))
      setTransactionType(transaction.amount < 0 ? 'income' : 'expense')
    }
  }, [transaction])

  const handleSubmit = () => {
    if (!transaction) return
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const finalAmount = transactionType === 'income' ? -numAmount : numAmount

    updateTransaction(transaction.id, {
      amount: finalAmount,
      category: transactionType === 'income' ? 'other' : selectedCategory,
      note: note.trim(),
      date: selectedDate.toISOString(),
    })

    onOpenChange(false)
  }

  const adjustDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4 pb-6">
        <DrawerTitle className="sr-only">Edit Transaction</DrawerTitle>
        <div className="mx-auto w-full max-w-sm">
          <div className="py-4 text-center">
            <motion.div 
              key={amount + transactionType}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`text-5xl font-bold tabular-nums tracking-tight ${transactionType === 'income' ? 'text-primary' : ''}`}
            >
              {symbol}{amount || '0'}
            </motion.div>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-muted/50 rounded-lg p-1 mb-3">
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

          <Input
            placeholder={transactionType === 'income' ? 'Source (e.g., Allowance, Gift)' : 'Add a note'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mb-3 h-10"
          />

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

          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={() => {
                if (!transaction) return
                deleteTransaction(transaction.id)
                onOpenChange(false)
                toast({
                  title: 'Transaction deleted',
                  description: `${transaction.note || transaction.category}`,
                  action: (
                    <ToastAction altText="Undo" onClick={() => restoreTransaction(transaction)}>
                      Undo
                    </ToastAction>
                  ),
                })
              }}
              className="h-11 px-4"
            >
              Delete
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 h-11"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
