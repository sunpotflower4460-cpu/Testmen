import type { AppData, Habit, Records, Settings } from './types.js'
import { DEFAULT_COLOR_ID, getColor } from './palette.js'

const STORAGE_KEY = 'habit-stamp:v1'
const SCHEMA_VERSION = 1
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/
const RESERVED_IDS = new Set(Object.getOwnPropertyNames(Object.prototype))
const MAX_TITLE_LENGTH = 24
const MAX_EMOJI_LENGTH = 16

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  weekStart: 0,
}

export function emptyData(): AppData {
  return {
    version: SCHEMA_VERSION,
    habits: [],
    records: {},
    settings: { ...DEFAULT_SETTINGS },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return normalize(parsed)
  } catch {
    return emptyData()
  }
}

function isValidDateKey(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(0)
  date.setHours(12, 0, 0, 0)
  date.setFullYear(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && SAFE_ID_RE.test(value) && !RESERVED_IDS.has(value)
}

function sanitizeHabits(input: unknown): Habit[] {
  if (!Array.isArray(input)) return []

  const seen = new Set<string>()
  const out: Habit[] = []

  input.forEach((h, index) => {
    if (!h || typeof h !== 'object') return
    const o = h as Record<string, unknown>
    if (!isSafeId(o.id) || seen.has(o.id)) return
    seen.add(o.id)

    const rawTitle = typeof o.title === 'string' ? o.title.trim() : ''
    const rawEmoji = typeof o.emoji === 'string' ? o.emoji : ''
    const rawColor = typeof o.colorId === 'string' ? o.colorId : DEFAULT_COLOR_ID
    const createdAtValue = typeof o.createdAt === 'string' ? Date.parse(o.createdAt) : Number.NaN

    out.push({
      id: o.id,
      title: (rawTitle || '無題').slice(0, MAX_TITLE_LENGTH),
      emoji: (rawEmoji || '✓').slice(0, MAX_EMOJI_LENGTH),
      colorId: getColor(rawColor).id,
      createdAt: Number.isFinite(createdAtValue)
        ? new Date(createdAtValue).toISOString()
        : new Date(0).toISOString(),
      order: typeof o.order === 'number' && Number.isFinite(o.order) ? o.order : index,
      archived: o.archived === true,
    })
  })

  return out
    .sort((a, b) => a.order - b.order)
    .map((habit, order) => ({ ...habit, order }))
}

function sanitizeRecords(input: unknown, validHabitIds: Set<string>): Records {
  const out: Records = {}
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out

  for (const [id, value] of Object.entries(input as Record<string, unknown>)) {
    if (!validHabitIds.has(id) || !Array.isArray(value)) continue
    const dates = Array.from(
      new Set(value.filter((v): v is string => typeof v === 'string' && isValidDateKey(v))),
    ).sort()
    if (dates.length > 0) out[id] = dates
  }
  return out
}

function normalize(d: Partial<AppData>): AppData {
  const habits = sanitizeHabits(d.habits)
  const habitIds = new Set(habits.map((habit) => habit.id))

  return {
    version: SCHEMA_VERSION,
    habits,
    records: sanitizeRecords(d.records, habitIds),
    settings: {
      sound: typeof d.settings?.sound === 'boolean' ? d.settings.sound : DEFAULT_SETTINGS.sound,
      weekStart: d.settings?.weekStart === 1 ? 1 : 0,
    },
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function parseImport(text: string): AppData {
  const parsed = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('不正な形式です')
  }

  const o = parsed as Record<string, unknown>
  if (!Array.isArray(o.habits) || !o.records || typeof o.records !== 'object' || Array.isArray(o.records)) {
    throw new Error('このアプリのデータではありません')
  }
  if (typeof o.version === 'number' && o.version > SCHEMA_VERSION) {
    throw new Error('このバージョンでは読み込めない新しい形式です')
  }

  return normalize(parsed as Partial<AppData>)
}

export function uid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
