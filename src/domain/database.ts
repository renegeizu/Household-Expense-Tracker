import Dexie, { type Table } from 'dexie'
import type { Expense, HouseholdBackup, Member } from './types'

class HouseholdDatabase extends Dexie {
  members!: Table<Member, string>
  expenses!: Table<Expense, string>

  constructor() {
    super('commonplace-household')
    this.version(1).stores({ members: 'id, name', expenses: 'id, date, type, category, memberId' })
  }
}

export const database = new HouseholdDatabase()

export async function readHousehold(): Promise<{ members: Member[]; expenses: Expense[] }> {
  const [members, expenses] = await Promise.all([database.members.toArray(), database.expenses.toArray()])
  return { members, expenses: expenses.sort((left, right) => right.date.localeCompare(left.date)) }
}

export async function saveMember(member: Member): Promise<void> {
  await database.members.put(member)
}

export async function removeMember(memberId: string): Promise<void> {
  // Delete private expenses and the member together so no dangling owner IDs remain.
  await database.transaction('rw', database.members, database.expenses, async () => {
    await database.expenses.where('memberId').equals(memberId).delete()
    await database.members.delete(memberId)
  })
}

export async function saveExpense(expense: Expense): Promise<void> {
  await database.expenses.put(expense)
}

export async function removeExpense(expenseId: string): Promise<void> {
  await database.expenses.delete(expenseId)
}

export async function replaceHousehold(backup: HouseholdBackup): Promise<void> {
  // Validation happens before this transaction; a failed write preserves the old ledger.
  await database.transaction('rw', database.members, database.expenses, async () => {
    await database.members.clear()
    await database.expenses.clear()
    await database.members.bulkPut(backup.members)
    await database.expenses.bulkPut(backup.expenses)
  })
}

export async function mergeHousehold(backup: HouseholdBackup): Promise<void> {
  // Stable IDs make imports idempotent and let backups update matching records.
  await database.transaction('rw', database.members, database.expenses, async () => {
    await database.members.bulkPut(backup.members)
    await database.expenses.bulkPut(backup.expenses)
  })
}