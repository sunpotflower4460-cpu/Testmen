import type { AppData, Habit, Records, Settings } from './types'
import { DEFAULT_COLOR_ID } from './palette'

const STORAGE_KEY = 'habit-stamp:v1'
const SCHEMA_VERSION = 1

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

/** localStorage から読み込む。壊れていれば空データにフォールバック。 */
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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** 不正なhabit要素を除外し、欠損フィールドを補完する。 */
function sanitizeHabits(input: unknown): Habit[] {
  if (!Array.isArray(input)) return []
  const out: Habit[] = []
  input.forEach((h, i) => {
    if (!h || typeof h !== 'object') return
    const o = h as Record<string, unknown>
    if (typeof o.id !== 'string' || o.id === '') return
    out.push({
      id: o.id,
      title: typeof o.title === 'string' && o.title ? o.title : '無題',
      emoji: typeof o.emoji === 'string' && o.emoji ? o.emoji : '✓',
      colorId: typeof o.colorId === 'string' && o.colorId ? o.colorId : DEFAULT_COLOR_ID,
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date(0).toISOString(),
      order: typeof o.order === 'number' && Number.isFinite(o.order) ? o.order : i,
      archived: o.archived === true,
    })
  })
  return out
}

/**
 * records を「habitId -> 有効な日付文字列(YYYY-MM-DD)の配列」に矯正する。
 * 破損データ（数値・文字列・非配列など）で描画時に new Set(...) が
 * 例外を投げてアプリが起動不能になるのを防ぐ。
 */
function sanitizeRecords(input: unknown): Records {
  const out: Records = {}
  if (!input || typeof input !== 'object') return out
  for (const [id, val] of Object.entries(input as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue
    const dates = Array.from(
      new Set(val.filter((v): v is string => typeof v === 'string' && DATE_RE.test(v))),
    ).sort()
    if (dates.length) out[id] = dates
  }
  return out
}

/** 欠損フィールドを補完し、型を揃える（破損データにも耐える）。 */
function normalize(d: Partial<AppData>): AppData {
  return {
    version: SCHEMA_VERSION,
    habits: sanitizeHabits(d.habits),
    records: sanitizeRecords(d.records),
    settings: {
      sound: typeof d.settings?.sound === 'boolean' ? d.settings.sound : DEFAULT_SETTINGS.sound,
      weekStart: d.settings?.weekStart === 1 ? 1 : 0,
    },
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 容量超過などは黙って無視（アプリは動作継続）
  }
}

/** データをJSON文字列として書き出す（エクスポート用）。 */
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

/** JSON文字列を検証して取り込む（インポート用）。失敗時は例外。 */
export function parseImport(text: string): AppData {
  const parsed = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('不正な形式です')
  }
  const o = parsed as Record<string, unknown>
  // このアプリのエクスポート形式であることの最低限の確認
  if (!('habits' in o) && !('records' in o)) {
    throw new Error('このアプリのデータではありません')
  }
  // normalize が破損要素を除去しつつ正しい型に矯正する
  return normalize(parsed as Partial<AppData>)
}

/** 簡易ユニークID。 */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
