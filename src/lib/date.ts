// ---- 日付ユーティリティ（ローカルタイム基準・"YYYY-MM-DD" キー） ---------

import { dateLocale } from './i18n/index.js'

// 2023-01-01 は日曜日。曜日番号（0=日）から曜日名を作る基準日。
const A_SUNDAY = { year: 2023, month0: 0, day: 1 }

// 記録のキーとカレンダーのマス目は西暦なので、地域の暦の設定に関係なく西暦で書く。
function format(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  const gregorian = `${locale.split('-u-')[0]}-u-ca-gregory`
  return new Intl.DateTimeFormat(gregorian, options).format(date)
}

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

export function weekdayLabel(dow: number, locale: string = dateLocale): string {
  return format(new Date(A_SUNDAY.year, A_SUNDAY.month0, A_SUNDAY.day + dow), locale, { weekday: 'short' })
}

// 日本語は long で「11月」になる。ほかの言語は短い月名にして幅を抑える。
function monthStyle(locale: string): 'long' | 'short' {
  return locale.startsWith('ja') ? 'long' : 'short'
}

/** ヘッダーの日付。例: 2026年11月26日(木) / Thu, Nov 26, 2026 */
export function formatLong(d: Date, locale: string = dateLocale): string {
  return format(d, locale, { year: 'numeric', month: monthStyle(locale), day: 'numeric', weekday: 'short' })
}

/** カレンダーの見出し。例: 2026年11月 / November 2026 */
export function formatMonth(year: number, month0: number, locale: string = dateLocale): string {
  return format(new Date(year, month0, 1), locale, { year: 'numeric', month: 'long' })
}

/** 月と日。例: 11月5日 / Nov 5 */
export function formatMonthDay(d: Date, locale: string = dateLocale): string {
  return format(d, locale, { month: monthStyle(locale), day: 'numeric' })
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
