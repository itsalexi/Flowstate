'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Sun, Moon, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useStore, Currency, currencySymbols, DayOfWeek, dayNames } from '@/store/useStore'
import { countSpendDays, useBudget } from '@/hooks/useBudget'
import { PiggyBank } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { 
    currency, 
    setCurrency, 
    spendDays,
    toggleSpendDay,
    resetAllData,
    savingsRate,
    setSavingsRate,
  } = useStore()
  const { spendableMonthlyBudget } = useBudget()
  const symbol = currencySymbols[currency]
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const totalSpendDays = countSpendDays(spendDays)

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="p-2 -ml-2 rounded-lg hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Spend Days */}
      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Spend Days</h2>
          <p className="text-xs text-muted-foreground">
            Which days do you plan to spend money? ({totalSpendDays} days selected)
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
            <motion.button
              key={day}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSpendDay(day)}
              className={`p-2.5 rounded-lg border text-center transition-colors ${
                spendDays[day]
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              <div className="text-xs font-medium">{dayNames[day]}</div>
            </motion.button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Your weekly budget is divided across these days
        </p>
      </section>

      {/* Savings Rate */}
      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Savings Target</h2>
          <p className="text-xs text-muted-foreground">
            Set aside a percentage of your budget as savings
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-primary" />
              <span className="font-medium">{savingsRate}%</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {symbol}{(spendableMonthlyBudget / (1 - savingsRate/100) * savingsRate / 100).toFixed(0)}/mo
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={savingsRate}
            onChange={(e) => setSavingsRate(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
      </section>

      {/* Currency */}
      <section className="space-y-3">
        <h2 className="font-medium">Currency</h2>
        <div className="grid grid-cols-3 gap-2">
          {(['PHP', 'USD', 'EUR'] as Currency[]).map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrency(c)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                currency === c
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <div className="text-xl font-semibold">{currencySymbols[c]}</div>
              <div className="text-xs text-muted-foreground">{c}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="font-medium">Appearance</h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div className="text-left">
              <div className="font-medium text-sm">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className="text-xs text-muted-foreground">
                Tap to switch
              </div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
            theme === 'dark' ? 'bg-primary' : 'bg-muted'
          }`}>
            <motion.div 
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-white"
              style={{ marginLeft: theme === 'dark' ? 16 : 0 }}
            />
          </div>
        </motion.button>
      </section>

      {/* Reset */}
      <section className="space-y-3">
        <h2 className="font-medium text-destructive">Danger Zone</h2>
        {!showResetConfirm ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-destructive" />
              <div className="text-left">
                <div className="font-medium text-sm text-destructive">Reset All Data</div>
                <div className="text-xs text-muted-foreground">
                  Delete all transactions and settings
                </div>
              </div>
            </div>
          </motion.button>
        ) : (
          <div className="p-4 rounded-lg border border-destructive bg-destructive/10 space-y-3">
            <p className="text-sm font-medium text-destructive">Are you sure?</p>
            <p className="text-xs text-muted-foreground">
              This will delete all your data and restart the onboarding process. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-3 rounded-lg border border-border bg-card text-sm font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetAllData()
                  setShowResetConfirm(false)
                  router.replace('/')
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
              >
                Reset Everything
              </motion.button>
            </div>
          </div>
        )}
      </section>

      {/* Info */}
      <section className="pt-4">
        <p className="text-xs text-muted-foreground text-center">
          FlowState v1.0 • Made with ❤️
        </p>
      </section>
    </div>
  )
}
