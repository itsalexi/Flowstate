'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useStore, Currency, currencySymbols, DayOfWeek, dayNames } from '@/store/useStore'
import { countSpendDays } from '@/hooks/useBudget'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { 
    currency, 
    setCurrency, 
    spendDays,
    toggleSpendDay,
  } = useStore()

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

      {/* Info */}
      <section className="pt-4">
        <p className="text-xs text-muted-foreground text-center">
          FlowState v1.0 • Made with ❤️
        </p>
      </section>
    </div>
  )
}
