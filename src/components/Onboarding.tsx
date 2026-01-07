'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Calendar, Wallet, Download, TrendingUp, PiggyBank, Delete, Share, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore, DayOfWeek, dayNames, Frequency, currencySymbols } from '@/store/useStore'

const frequencies: { id: Frequency; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [localSpendDays, setLocalSpendDays] = useState<Record<DayOfWeek, boolean>>({
    0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true
  })
  const [incomeName, setIncomeName] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeFrequency, setIncomeFrequency] = useState<Frequency>('monthly')
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const { setSpendDays, addRecurringIncome, recurringIncome, deleteRecurringIncome, completeOnboarding, currency } = useStore()
  const [showAddIncome, setShowAddIncome] = useState(false)
  const symbol = currencySymbols[currency]

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  const toggleDay = (day: DayOfWeek) => {
    setLocalSpendDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const handleKeypadPress = (value: string) => {
    if (value === 'backspace') {
      setIncomeAmount((prev) => prev.slice(0, -1))
    } else if (value === '.') {
      if (!incomeAmount.includes('.')) {
        setIncomeAmount((prev) => (prev === '' ? '0.' : prev + '.'))
      }
    } else {
      const parts = incomeAmount.split('.')
      if (parts[1] && parts[1].length >= 2) return
      setIncomeAmount((prev) => prev + value)
    }
  }

  const handleAddIncome = () => {
    if (incomeAmount && parseFloat(incomeAmount) > 0) {
      addRecurringIncome({
        name: incomeName || 'Income',
        amount: parseFloat(incomeAmount),
        frequency: incomeFrequency,
      })
      setIncomeName('')
      setIncomeAmount('')
      setIncomeFrequency('monthly')
      setShowAddIncome(false)
    }
  }

  const handleComplete = () => {
    setSpendDays(localSpendDays)
    completeOnboarding()
  }

  const totalSteps = 4

  const canProceed = () => {
    if (step === 0) return true
    if (step === 1) return Object.values(localSpendDays).some(Boolean)
    if (step === 2) return true
    if (step === 3) return true
    return true
  }

  return (
    <div className="fixed inset-0 flex flex-col p-6 bg-background z-50">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i <= step ? 1 : 0 }}
            className={`h-1 flex-1 rounded-full origin-left ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <>
              <div className="flex-1 flex flex-col justify-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
                    <TrendingUp className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">Flowstate</h1>
                  <p className="text-muted-foreground text-lg">Know what you can spend, every day</p>
                </motion.div>

                <div className="space-y-3">
                  {[
                    { icon: Calendar, text: 'Set your spending days' },
                    { icon: Wallet, text: 'Track your income' },
                    { icon: PiggyBank, text: 'Stay within budget effortlessly' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Spend Days */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">When do you spend?</h1>
                <p className="text-muted-foreground">Select the days you usually spend money</p>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                    <motion.button
                      key={day}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleDay(day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${
                        localSpendDays[day]
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {dayNames[day]}
                    </motion.button>
                  ))}
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-center text-muted-foreground">
                    Your budget gets divided across these days.
                    <br />
                    <span className="text-foreground font-medium">
                      {Object.values(localSpendDays).filter(Boolean).length} days selected
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Income */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <Wallet className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your income</h1>
                <p className="text-muted-foreground">Add your recurring income sources</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Existing incomes */}
                {recurringIncome.length > 0 && (
                  <div className="space-y-2">
                    {recurringIncome.map((income) => (
                      <motion.div
                        key={income.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                      >
                        <div>
                          <div className="font-medium">{income.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {symbol}{income.amount.toFixed(0)}/{income.frequency === 'weekly' ? 'week' : 'month'}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteRecurringIncome(income.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add income form */}
                {showAddIncome ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="text-center py-2">
                      <motion.div
                        key={incomeAmount}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold tabular-nums text-primary"
                      >
                        {symbol}{incomeAmount || '0'}
                      </motion.div>
                    </div>

                    <Input
                      placeholder="Source (e.g., Allowance, Salary)"
                      value={incomeName}
                      onChange={(e) => setIncomeName(e.target.value)}
                      className="h-11"
                    />

                    <div className="flex gap-2">
                      {frequencies.map((freq) => (
                        <button
                          key={freq.id}
                          onClick={() => setIncomeFrequency(freq.id)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            incomeFrequency === freq.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleKeypadPress(key)}
                          className="h-10 rounded-lg bg-background hover:bg-muted text-base font-medium flex items-center justify-center transition-colors"
                        >
                          {key === 'backspace' ? <Delete className="w-4 h-4" /> : key}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddIncome(false)
                          setIncomeAmount('')
                          setIncomeName('')
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddIncome}
                        disabled={!incomeAmount || parseFloat(incomeAmount) <= 0}
                        className="flex-1"
                      >
                        Add
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddIncome(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add income source</span>
                  </motion.button>
                )}

                {recurringIncome.length === 0 && !showAddIncome && (
                  <p className="text-xs text-muted-foreground text-center">
                    You can skip this and add income later in the Vault
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 3: Add to Home Screen */}
          {step === 3 && (
            <>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Download className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Add to Home Screen</h1>
                  <p className="text-muted-foreground">Quick access, just like a native app</p>
                </div>

                {isStandalone ? (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="text-primary font-medium">You&apos;re all set!</p>
                    <p className="text-sm text-muted-foreground mt-1">Flowstate is already on your home screen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isIOS ? (
                      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                          <div>
                            <p className="font-medium">Tap the Share button</p>
                            <p className="text-sm text-muted-foreground">At the bottom of Safari</p>
                            <Share className="w-5 h-5 text-muted-foreground mt-2" />
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                          <div>
                            <p className="font-medium">Add to Home Screen</p>
                            <p className="text-sm text-muted-foreground">Scroll down and tap the option</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
                          <div>
                            <p className="font-medium">Tap Add</p>
                            <p className="text-sm text-muted-foreground">Confirm to add Flowstate</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
                          <div>
                            <p className="font-medium">Tap the menu</p>
                            <p className="text-sm text-muted-foreground">Three dots in your browser</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
                          <div>
                            <p className="font-medium">Install app or Add to Home Screen</p>
                            <p className="text-sm text-muted-foreground">Look for the install option</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center">
                      You can always do this later from your browser
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pb-safe">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12"
          >
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (step === totalSteps - 1) {
              handleComplete()
            } else {
              setStep(step + 1)
            }
          }}
          disabled={!canProceed()}
          className="flex-1 h-12"
        >
          {step === totalSteps - 1 ? (
            'Get Started'
          ) : step === 3 && !isStandalone ? (
            'Skip for now'
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
