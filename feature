# Feature Specification: Dynamic Weekly Budgeting System

## Overview

The Dynamic Weekly Budgeting System helps users manage their spending flexibly without rigid daily limits. Instead of enforcing fixed daily budgets, the system allocates a weekly budget and dynamically calculates a recommended daily spend based on remaining funds and remaining planned spend days. This allows savings from earlier days to roll forward naturally and adjusts automatically for overspending.

This feature is designed for students and users with irregular schedules (e.g., school days vs rest days), making budgeting feel adaptive, fair, and non-punitive.

---

## Goals

* Avoid rigid “use it or lose it” daily budgets
* Reward users for spending less on earlier days
* Adapt to variable schedules (5–6 school days, optional weekends)
* Make budget logic transparent and easy to understand
* Reduce guilt and friction around spending

---

## Core Concepts

### Monthly Budget

* User-defined total monthly spending budget
* Example: ₱8,000

### Weekly Budget

* Monthly budget divided into weekly envelopes
* Default: Monthly budget ÷ 4
* Example: ₱8,000 ÷ 4 = ₱2,000 per week

### Spend Days

* Days of the week when the user expects to spend money
* User selects these during onboarding or weekly setup
* Example: Mon–Sat (6 spend days), Sun excluded

### Dynamic Daily Budget

* Not fixed
* Recalculated every day based on:

```
Daily Available = Weekly Remaining Budget ÷ Remaining Spend Days
```

This value represents the *maximum safe amount* the user can spend today without hurting future days.

---

## User Flow

### 1. Onboarding Setup

**Step 1: Set Monthly Budget**

* User inputs monthly budget amount

**Step 2: Select Spend Days**

* UI presents day toggles (Mon–Sun)
* User selects which days they typically spend

**Step 3: Choose Week Start**

* Sunday or Monday

---

### 2. Weekly Initialization

At the start of each week:

* Weekly budget is reset
* Spend days are loaded
* Remaining spend days = total selected spend days

Initial daily recommendation:

```
Weekly Budget ÷ Spend Days
```

---

### 3. Daily Experience

Each day, the app displays:

* **Today’s Available Spend** (primary value)
* Weekly remaining budget
* Remaining spend days

#### Spend Day Behavior

* App shows how much the user can safely spend today
* If the user saved previously, today’s available amount increases

Example:

* Weekly remaining: ₱1,800
* Remaining spend days: 5
* Today’s available: ₱360

UI copy suggestion:

> +₱27 carried over from previous days

---

### 4. Logging Expenses

When an expense is logged:

* Deduct from weekly remaining budget
* Recalculate remaining spend days (if applicable)
* Automatically adjust future daily recommendations

#### Overspending

If the user exceeds today’s available amount:

* No hard block
* App informs user:

> You went ₱90 over today. Tomorrow’s budget will adjust automatically.

---

### 5. Non-Spend Day Logic

Non-spend days default to:

* Today’s available spend: ₱0

If the user spends anyway:

* Expense is allowed
* Deducted from weekly budget
* Future daily recommendations decrease

Optional warning UI:

> Today isn’t a planned spend day. This will affect upcoming days.

---

## Edge Cases

### Variable Weekly Schedules

* User can edit spend days per week
* Recalculation occurs immediately

### Missed Spend Day (No Spending Logged)

* Budget rolls forward automatically
* No penalty or manual action required

### End of Week

* Unused weekly budget does not roll over by default (configurable)
* Weekly budget resets on new week

---

## Data Model (Simplified)

* MonthlyBudget
* WeeklyBudget
* WeeklyRemaining
* SpendDays[] (booleans per weekday)
* RemainingSpendDays
* ExpenseLog { amount, date, category }

---

## UX Principles

* **Derived, not enforced**: daily budgets guide, not restrict
* **Reward restraint**: savings immediately increase future flexibility
* **Transparency**: users always know *why* today’s amount changed
* **Low guilt**: no red warnings, no shaming language


## Summary

This feature replaces rigid daily budgeting with a flexible, adaptive system that mirrors real-life spending behavior. By anchoring on weekly limits and dynamically adjusting daily recommendations, users gain clarity, control, and motivation to spend smarter without feeling constrained.
