'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, DollarSign, CreditCard } from 'lucide-react'
import { useStore, RecurringItem, Frequency, currencySymbols } from '@/store/useStore'
import { useBudget } from '@/hooks/useBudget'
import { VaultDrawer } from '@/components/VaultDrawer'
import { SwipeableTransaction } from '@/components/SwipeableTransaction'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

const frequencyLabels: Record<Frequency, string> = {
  daily: '/day',
  weekly: '/week',
  monthly: '/month',
}

function RecurringItemList({
  items,
  onDelete,
  onEdit,
  emptyMessage,
}: {
  items: RecurringItem[]
  onDelete: (item: RecurringItem) => void
  onEdit: (item: RecurringItem) => void
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
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <SwipeableTransaction
            key={item.id}
            onDelete={() => onDelete(item)}
            onTap={() => onEdit(item)}
          >
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {symbol}{item.amount.toFixed(0)}{frequencyLabels[item.frequency || 'monthly']}
                </div>
              </div>
            </div>
          </SwipeableTransaction>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function VaultPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null)
  const [editingType, setEditingType] = useState<'income' | 'expense'>('income')
  
  const { 
    recurringIncome, 
    recurringExpenses, 
    currency,
    addRecurringIncome, 
    deleteRecurringIncome,
    addRecurringExpense,
    deleteRecurringExpense,
  } = useStore()

  const { totalMonthlyIncome, totalMonthlyExpenses, fixedNet } = useBudget()
  const symbol = currencySymbols[currency]

  const handleDeleteIncome = (item: RecurringItem) => {
    deleteRecurringIncome(item.id)
    toast({
      title: 'Income deleted',
      description: `${item.name} - ${symbol}${item.amount.toFixed(0)}`,
      action: (
        <ToastAction altText="Undo" onClick={() => addRecurringIncome({ name: item.name, amount: item.amount, frequency: item.frequency })}>
          Undo
        </ToastAction>
      ),
    })
  }

  const handleDeleteExpense = (item: RecurringItem) => {
    deleteRecurringExpense(item.id)
    toast({
      title: 'Expense deleted',
      description: `${item.name} - ${symbol}${item.amount.toFixed(0)}`,
      action: (
        <ToastAction altText="Undo" onClick={() => addRecurringExpense({ name: item.name, amount: item.amount, frequency: item.frequency })}>
          Undo
        </ToastAction>
      ),
    })
  }

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
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Income</div>
          <div className="text-lg font-semibold tabular-nums text-primary">{symbol}{totalMonthlyIncome.toFixed(0)}</div>
        </motion.div>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Expenses</div>
          <div className="text-lg font-semibold tabular-nums text-destructive">{symbol}{totalMonthlyExpenses.toFixed(0)}</div>
        </motion.div>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Net</div>
          <div className={`text-lg font-semibold tabular-nums ${fixedNet < 0 ? 'text-destructive' : ''}`}>{symbol}{fixedNet.toFixed(0)}</div>
        </motion.div>
      </div>

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setDrawerOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        <Plus className="w-5 h-5" />
        Add Income or Expense
      </motion.button>

      {/* Income Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Income</h2>
        </div>
        <RecurringItemList
          items={recurringIncome}
          onDelete={handleDeleteIncome}
          onEdit={(item) => {
            setEditingItem(item)
            setEditingType('income')
            setDrawerOpen(true)
          }}
          emptyMessage="No income added yet"
        />
      </section>

      {/* Expenses Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-medium">Fixed Expenses</h2>
        </div>
        <RecurringItemList
          items={recurringExpenses}
          onDelete={handleDeleteExpense}
          onEdit={(item) => {
            setEditingItem(item)
            setEditingType('expense')
            setDrawerOpen(true)
          }}
          emptyMessage="No expenses added yet"
        />
      </section>

      {/* Unified Drawer */}
      <VaultDrawer
        initialType={editingType}
        item={editingItem}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) setEditingItem(null)
        }}
      />
    </div>
  )
}
