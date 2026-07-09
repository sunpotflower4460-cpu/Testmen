import type { AppData, Settings } from './types'

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

/** 欠損フィールドを補完し、型を揃える。 */
function normalize(d: Partial<AppData>): AppData {
  return {
    version: SCHEMA_VERSION,
    habits: Array.isArray(d.habits) ? d.habits : [],
    records: d.records && typeof d.records === 'object' ? d.records : {},
    settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) },
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
  const data = normalize(parsed as Partial<AppData>)
  if (!Array.isArray(data.habits)) throw new Error('habits が見つかりません')
  return data
}

/** 簡易ユニークID。 */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
