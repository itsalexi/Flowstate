This PRD defines FlowState, a local-first, high-performance PWA built using the Next.js App Router stack.

By using Next.js, you get the benefit of a professional routing system, optimized image handling, and an easy path to adding a database later if you ever change your mind—while staying purely local-storage based for now.


PRD: "FlowState" – Minimalist Budgeting (Next.js PWA)
1. Project Overview
FlowState is a "Safe to Spend" financial dashboard. It ignores your bank balance and instead focuses on your Spendable Velocity. It calculates a daily allowance and encourages savings by "banking" whatever you didn't spend at the end of the week.
2. The Tech Stack
Framework: Next.js 14+ (App Router).
PWA Support: @ducanh2912/next-pwa (the most modern PWA plugin for Next.js).
State Management: Zustand + persist middleware (local-first, no DB).
Styling: Tailwind CSS.
Components: Shadcn/UI (Radix UI) for accessible, clean components.
Charts: Tremor or Recharts (Tremor is built on Tailwind and looks very "Apple-esque").
Animations: Framer Motion.


3. Core Math Logic
To maintain the "Clean" requirement, the app handles the math in the background:

Fixed Net: Total Monthly Income - Total Monthly Expenses.
Weekly Bucket: Fixed Net / 4.
Daily Target: Weekly Bucket / 7.
Available Balance (Live): (Daily Target * Days Elapsed in Week) - Sum(Variable Transactions this week).
Why this formula? It creates a "rolling" budget. If you spend $0 on Day 1, Day 2 reflects Day 1's unspent money.


4. Functional Requirements
A. The Dashboard (Home)
The Hero Number: A massive Safe to Spend display with a spring animation when it updates.
The Progress Ring: A circular visualization of how much of the Weekly budget is remaining.
The Micro-Keypad: A slide-up drawer for entering expenses (Amount + Category Icon + Note).
Day-by-Day View: A list of transactions for the current day only.
B. The Vault (Configuration)
Income Manager: List recurring monthly income (Salary, etc.).
Expense Manager: List recurring monthly bills (Rent, Subs).
Logic Toggle: Option to "Reset Daily" vs "Rollover to End of Week."
C. Insights & Stats
Category Donut: Distribution of variable spending (e.g., "50% Food, 20% Transport").
Weekly Trend Bar Chart: Comparing total spending of the last 4 weeks.
Savings Ledger: Every Monday at 00:00, the remaining "Weekly Bucket" is moved to a "Savings" history. This shows the user their "Efficiency" over time.
D. History
Searchable, filterable list of every manual transaction entered.
Grouped by Week.


5. UI/UX & Design Language
Theme: Pure White / Deep Black (OLED).
Interactions:
Page Transitions: Horizontal "Slide" effect between tabs.
Input: Tactile feel—buttons should scale down slightly on click.
Feedback: Toast notifications (using sonner) when a transaction is added or a bill is due.
Responsiveness: Designed 100% for mobile-view (390px - 430px width).


6. PWA Features (iOS Focus)
Service Worker: Fast-loading and offline access.
App Icon: Custom manifest icons (192x192, 512x512).
Minimalist UI: No browser chrome (address bar, back buttons).
Apple Touch Icons: Specific configuration for high-res iOS home screen icons.


7. Next.js Implementation Blueprint (For your build)
Directory Structure:
/app

  /(dashboard)

    /page.tsx        <- Hero Number & Quick Add

    /vault          <- Fixed Income/Expenses

    /stats          <- Graphs & Savings

    /history        <- Transaction List

/store

  /useStore.ts      <- Zustand Store with Persist middleware

/components

  /ui               <- Shadcn components

  /BudgetProgress   <- Weekly visualizer

/hooks

  /useBudget.ts     <- Custom hook to calculate the math logic
Zustand Persistence (Local-First):
import { create } from 'zustand'

import { persist } from 'zustand/middleware'

export const useStore = create(

  persist(

    (set) => ({

      transactions: [],

      recurringIncome: [],

      recurringExpenses: [],

      addTransaction: (tx) => set((state) => ({ 

        transactions: [tx, ...state.transactions] 

      })),

      // ... more actions

    }),

    { name: 'flowstate-storage' }

  )

)


8. Development Roadmap
Phase 1: Logic & State. Set up Zustand and the math engine to calculate the "Safe to Spend" number.
Phase 2: The Vault. Build the forms to add recurring income/expenses so the app has a "starting pool."
Phase 3: The Dashboard. Build the "Big Number" and the Quick-Add keypad.
Phase 4: Animations & Charts. Add Framer Motion transitions and Tremor charts for the Stats page.
Phase 5: PWA Audit. Configure next-pwa and manifest files to ensure "Add to Home Screen" works perfectly on iOS.

Ready to build? This setup is extremely clean and avoids the complexity of databases while providing a premium, native-feeling experience.

