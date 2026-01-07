import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Category = 
  | 'food' 
  | 'transport' 
  | 'entertainment' 
  | 'shopping' 
  | 'health' 
  | 'utilities' 
  | 'other'

export type Frequency = 'daily' | 'weekly' | 'monthly'

export type Currency = 'USD' | 'PHP' | 'EUR' | 'GBP' | 'JPY'

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

// Days of the week (0 = Sunday, 6 = Saturday)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const dayNames: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

// SpendDays: which days of the week the user plans to spend
export type SpendDays = Record<DayOfWeek, boolean>

export interface Transaction {
  id: string
  amount: number
  category: Category
  note: string
  date: string // ISO string
  isFavorite?: boolean
}

export interface RecurringItem {
  id: string
  name: string
  amount: number
  frequency: Frequency
}

export interface SavingsEntry {
  id: string
  weekStart: string // ISO string (Sunday)
  amount: number
  date: string // ISO string when it was banked
}

export interface MonthlyRecord {
  id: string
  month: string // YYYY-MM format
  income: number // Total income for the month
  fixedExpenses: number // Total fixed expenses
  variableExpenses: number // Total variable spending
  savedAmount: number // Amount saved/leftover
  date: string // ISO string when recorded
}

export interface QuickExpense {
  id: string
  amount: number
  category: Category
  note: string
  usageCount: number
  isFavorite: boolean
}

interface FlowStateStore {
  // Data
  transactions: Transaction[]
  recurringIncome: RecurringItem[]
  recurringExpenses: RecurringItem[]
  savings: SavingsEntry[]
  currency: Currency
  quickExpenses: QuickExpense[]
  spendDays: SpendDays // Which days of the week the user plans to spend
  monthlyRecords: MonthlyRecord[] // Historical monthly data

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, tx: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  restoreTransaction: (tx: Transaction) => void
  toggleFavoriteTransaction: (id: string) => void
  
  addRecurringIncome: (item: Omit<RecurringItem, 'id'>) => void
  updateRecurringIncome: (id: string, item: Partial<RecurringItem>) => void
  deleteRecurringIncome: (id: string) => void
  
  addRecurringExpense: (item: Omit<RecurringItem, 'id'>) => void
  updateRecurringExpense: (id: string, item: Partial<RecurringItem>) => void
  deleteRecurringExpense: (id: string) => void
  
  addSavingsEntry: (entry: Omit<SavingsEntry, 'id'>) => void
  
  setCurrency: (currency: Currency) => void
  setSpendDays: (days: SpendDays) => void
  toggleSpendDay: (day: DayOfWeek) => void
  
  addMonthlyRecord: (record: Omit<MonthlyRecord, 'id'>) => void
  
  addQuickExpense: (expense: Omit<QuickExpense, 'id' | 'usageCount'>) => void
  incrementQuickExpenseUsage: (id: string) => void
  toggleFavoriteQuickExpense: (id: string) => void
  deleteQuickExpense: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useStore = create<FlowStateStore>()(
  persist(
    (set) => ({
      transactions: [],
      recurringIncome: [],
      recurringExpenses: [],
      savings: [],
      currency: 'PHP' as Currency,
      quickExpenses: [],
      // Default: Mon-Sat (school days)
      spendDays: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true } as SpendDays,
      monthlyRecords: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [{ ...tx, id: generateId() }, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      restoreTransaction: (tx) =>
        set((state) => {
          const exists = state.transactions.some((t) => t.id === tx.id)
          if (exists) return state
          const newTransactions = [...state.transactions, tx].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          return { transactions: newTransactions }
        }),

      toggleFavoriteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, isFavorite: !tx.isFavorite } : tx
          ),
        })),

      addRecurringIncome: (item) =>
        set((state) => ({
          recurringIncome: [...state.recurringIncome, { ...item, id: generateId() }],
        })),

      updateRecurringIncome: (id, item) =>
        set((state) => ({
          recurringIncome: state.recurringIncome.map((i) =>
            i.id === id ? { ...i, ...item } : i
          ),
        })),

      deleteRecurringIncome: (id) =>
        set((state) => ({
          recurringIncome: state.recurringIncome.filter((i) => i.id !== id),
        })),

      addRecurringExpense: (item) =>
        set((state) => ({
          recurringExpenses: [...state.recurringExpenses, { ...item, id: generateId() }],
        })),

      updateRecurringExpense: (id, item) =>
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map((i) =>
            i.id === id ? { ...i, ...item } : i
          ),
        })),

      deleteRecurringExpense: (id) =>
        set((state) => ({
          recurringExpenses: state.recurringExpenses.filter((i) => i.id !== id),
        })),

      addSavingsEntry: (entry) =>
        set((state) => ({
          savings: [{ ...entry, id: generateId() }, ...state.savings],
        })),

      setCurrency: (currency) =>
        set({ currency }),

      setSpendDays: (days) =>
        set({ spendDays: days }),

      toggleSpendDay: (day) =>
        set((state) => ({
          spendDays: { ...state.spendDays, [day]: !state.spendDays[day] },
        })),

      addMonthlyRecord: (record) =>
        set((state) => ({
          monthlyRecords: [{ ...record, id: generateId() }, ...state.monthlyRecords],
        })),

      addQuickExpense: (expense) =>
        set((state) => ({
          quickExpenses: [
            { ...expense, id: generateId(), usageCount: 0 },
            ...state.quickExpenses,
          ],
        })),

      incrementQuickExpenseUsage: (id: string) =>
        set((state) => ({
          quickExpenses: state.quickExpenses.map((qe) =>
            qe.id === id ? { ...qe, usageCount: qe.usageCount + 1 } : qe
          ),
        })),

      toggleFavoriteQuickExpense: (id) =>
        set((state) => ({
          quickExpenses: state.quickExpenses.map((qe) =>
            qe.id === id ? { ...qe, isFavorite: !qe.isFavorite } : qe
          ),
        })),

      deleteQuickExpense: (id) =>
        set((state) => ({
          quickExpenses: state.quickExpenses.filter((qe) => qe.id !== id),
        })),
    }),
    { name: 'flowstate-storage' }
  )
)
