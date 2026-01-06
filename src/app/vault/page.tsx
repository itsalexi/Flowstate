'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, DollarSign, CreditCard, X, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStore, RecurringItem, Frequency, currencySymbols } from '@/store/useStore'
import { useBudget } from '@/hooks/useBudget'

const frequencyLabels: Record<Frequency, string> = {
  daily: '/day',
  weekly: '/week',
  monthly: '/month',
}

function InlineAddForm({ 
  onSubmit, 
  onCancel,
  placeholder,
}: { 
  onSubmit: (item: Omit<RecurringItem, 'id'>) => void
  onCancel: () => void
  placeholder: string
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (name.trim() && !isNaN(numAmount) && numAmount > 0) {
      onSubmit({ name: name.trim(), amount: numAmount, frequency })
      setName('')
      setAmount('')
      setFrequency('monthly')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 h-9"
            autoFocus
          />
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 h-9"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  frequency === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !amount}
              className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RecurringItemList({
  items,
  onDelete,
  emptyMessage,
}: {
  items: RecurringItem[]
  onDelete: (id: string) => void
  emptyMessage: string
}) {
  const { currency } = useStore()
  const symbol = currencySymbols[currency]

  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center justify-between p-3 rounded-lg border border-border"
          >
            <div>
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {symbol}{item.amount.toFixed(2)}{frequencyLabels[item.frequency || 'monthly']}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function VaultPage() {
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  
  const { 
    recurringIncome, 
    recurringExpenses, 
    currency,
    addRecurringIncome, 
    deleteRecurringIncome,
    addRecurringExpense,
    deleteRecurringExpense,
  } = useStore()

  const { fixedNet, weeklyBucket, baseDailyTarget } = useBudget()
  const symbol = currencySymbols[currency]

  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="text-lg font-semibold tracking-tight">The Vault</h1>
        <p className="text-muted-foreground text-sm">
          Configure your income and fixed expenses
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Net/mo</div>
          <div className="text-lg font-semibold tabular-nums">{symbol}{fixedNet.toFixed(0)}</div>
        </motion.div>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Weekly</div>
          <div className="text-lg font-semibold tabular-nums">{symbol}{weeklyBucket.toFixed(0)}</div>
        </motion.div>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Daily</div>
          <div className="text-lg font-semibold tabular-nums">{symbol}{baseDailyTarget.toFixed(0)}</div>
        </motion.div>
      </div>

      {/* Income Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <h2 className="font-medium">Income</h2>
          </div>
          {!showIncomeForm && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowIncomeForm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {showIncomeForm && (
            <InlineAddForm
              placeholder="e.g., Salary"
              onSubmit={(item) => {
                addRecurringIncome(item)
                setShowIncomeForm(false)
              }}
              onCancel={() => setShowIncomeForm(false)}
            />
          )}
        </AnimatePresence>
        <RecurringItemList
          items={recurringIncome}
          onDelete={deleteRecurringIncome}
          emptyMessage="No income added yet"
        />
      </section>

      {/* Expenses Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-medium">Fixed Expenses</h2>
          </div>
          {!showExpenseForm && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {showExpenseForm && (
            <InlineAddForm
              placeholder="e.g., Rent, Netflix"
              onSubmit={(item) => {
                addRecurringExpense(item)
                setShowExpenseForm(false)
              }}
              onCancel={() => setShowExpenseForm(false)}
            />
          )}
        </AnimatePresence>
        <RecurringItemList
          items={recurringExpenses}
          onDelete={deleteRecurringExpense}
          emptyMessage="No expenses added yet"
        />
      </section>
    </div>
  )
}
