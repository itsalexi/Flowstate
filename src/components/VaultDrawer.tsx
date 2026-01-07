'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RecurringItem, Frequency, useStore, currencySymbols } from '@/store/useStore'

interface VaultDrawerProps {
  initialType?: 'income' | 'expense'
  item?: RecurringItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VaultDrawer({ initialType = 'income', item, open, onOpenChange }: VaultDrawerProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [type, setType] = useState<'income' | 'expense'>(initialType)
  
  const { 
    addRecurringIncome, 
    updateRecurringIncome,
    addRecurringExpense,
    updateRecurringExpense,
    currency 
  } = useStore()
  
  const symbol = currencySymbols[currency]
  const isEditing = !!item

  useEffect(() => {
    if (item) {
      setName(item.name)
      setAmount(item.amount.toString())
      setFrequency(item.frequency)
    } else {
      setName('')
      setAmount('')
      setFrequency('monthly')
    }
    setType(initialType)
  }, [item, open, initialType])

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (!name.trim() || isNaN(numAmount) || numAmount <= 0) return

    if (isEditing && item) {
      if (type === 'income') {
        updateRecurringIncome(item.id, { name: name.trim(), amount: numAmount, frequency })
      } else {
        updateRecurringExpense(item.id, { name: name.trim(), amount: numAmount, frequency })
      }
    } else {
      if (type === 'income') {
        addRecurringIncome({ name: name.trim(), amount: numAmount, frequency })
      } else {
        addRecurringExpense({ name: name.trim(), amount: numAmount, frequency })
      }
    }

    setName('')
    setAmount('')
    setFrequency('monthly')
    onOpenChange(false)
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
        <DrawerTitle className="sr-only">
          {isEditing ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
        </DrawerTitle>
        <div className="mx-auto w-full max-w-sm">
          <div className="py-4 text-center">
            <motion.div 
              key={amount}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`text-5xl font-bold tabular-nums tracking-tight ${type === 'income' ? 'text-primary' : ''}`}
            >
              {symbol}{amount || '0'}
            </motion.div>
          </div>

          {/* Type Toggle */}
          {!isEditing && (
            <div className="flex bg-muted/50 rounded-lg p-1 mb-3">
              <button
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Income
              </button>
            </div>
          )}

          <Input
            placeholder={type === 'income' ? 'e.g., Salary, Allowance' : 'e.g., Rent, Netflix'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 h-10"
            autoFocus
          />

          <div className="flex bg-muted/50 rounded-lg p-1 mb-3">
            {(['daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  frequency === f
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
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

          <Button 
            onClick={handleSubmit} 
            className={`w-full h-11 ${type === 'income' ? 'bg-primary hover:bg-primary/90' : ''}`}
            disabled={!name.trim() || !amount || parseFloat(amount) <= 0}
          >
            {isEditing ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
