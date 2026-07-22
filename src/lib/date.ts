// ---- 日付ユーティリティ（ローカルタイム基準・"YYYY-MM-DD" キー） ---------

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土']

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function isFuture(key: string): boolean {
  return key > todayKey()
}

export function isToday(key: string): boolean {
  return key === todayKey()
}

export function weekdayOf(key: string): number {
  return fromKey(key).getDay()
}

export function weekdayLabel(dow: number): string {
  return WEEKDAY_JA[dow]
}

export function formatLongJa(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAY_JA[d.getDay()]})`
}

export function formatMonthJa(year: number, month0: number): string {
  return `${year}年${month0 + 1}月`
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

export function monthDayKeys(year: number, month0: number): string[] {
  const n = daysInMonth(year, month0)
  const keys: string[] = []
  for (let d = 1; d <= n; d++) {
    keys.push(toKey(new Date(year, month0, d)))
  }
  return keys
}

export function shiftKey(key: string, nDays: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + nDays)
  return toKey(d)
}

export function currentStreak(doneSet: Set<string>): number {
  const today = todayKey()
  let cursor = today
  if (!doneSet.has(today)) {
    cursor = shiftKey(today, -1)
    if (!doneSet.has(cursor)) return 0
  }
  let count = 0
  while (doneSet.has(cursor)) {
    count++
    cursor = shiftKey(cursor, -1)
  }
  return count
}

export function longestStreak(doneKeys: string[]): number {
  if (doneKeys.length === 0) return 0
  const sorted = [...new Set(doneKeys)].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (shiftKey(sorted[i - 1], 1) === sorted[i]) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}
