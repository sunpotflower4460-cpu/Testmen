import type { Records } from './types.js'

export interface ToggleRecordResult {
  records: Records
  nowDone: boolean
}

export function toggleRecordDate(records: Records, habitId: string, dateKey: string): ToggleRecordResult {
  const dates = new Set(records[habitId] ?? [])
  const nowDone = !dates.has(dateKey)
  if (nowDone) dates.add(dateKey)
  else dates.delete(dateKey)

  const nextRecords = { ...records }
  const nextDates = Array.from(dates).sort()
  if (nextDates.length > 0) nextRecords[habitId] = nextDates
  else delete nextRecords[habitId]

  return { records: nextRecords, nowDone }
}
