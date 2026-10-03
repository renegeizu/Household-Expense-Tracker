export const CATEGORIES = [
  'Groceries',
  'Housing',
  'Utilities',
  'Transport',
  'Health',
  'Leisure',
  'Savings',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]
export type ExpenseType = 'shared' | 'personal'

export interface Member {
  id: string
  name: string
  monthlyIncomeCents: number
  color: string
  createdAt: string
}

export interface Expense {
  id: string
  title: string
  amountCents: number
  category: Category
  type: ExpenseType
  memberId: string | null
  date: string
  createdAt: string
}

export interface HouseholdBackup {
  format: 'commonplace-backup'
  version: 1
  exportedAt: string
  members: Member[]
  expenses: Expense[]
}

export interface MemberSummary {
  member: Member
  weight: number
  sharedShareCents: number
  personalCents: number
  totalSpentCents: number
  remainingCents: number
}