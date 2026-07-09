// ---- ドメインモデル -------------------------------------------------------

/** インク色のプリセット。ハンコの朱色を筆頭に、和の色味で揃える。 */
export interface InkColor {
  id: string
  name: string
  /** メインのインク色 */
  ink: string
  /** カード等で使う淡い背景色 */
  tint: string
}

/** 継続したいこと（＝トラッカーの1タイトル）。 */
export interface Habit {
  id: string
  title: string
  /** ハンコの絵柄に使う絵文字 */
  emoji: string
  /** インク色プリセットのid */
  colorId: string
  createdAt: string // ISO
  /** 並び順。小さいほど上。 */
  order: number
  archived?: boolean
}

/**
 * 記録本体。habitId -> ("YYYY-MM-DD" のSet) を配列で保持する。
 * 「できた日」だけを持ち、無い日は未達成として扱うシンプルな構造。
 */
export type Records = Record<string, string[]>

export interface AppData {
  version: number
  habits: Habit[]
  records: Records
  settings: Settings
}

export interface Settings {
  sound: boolean
  /** カレンダーの週の開始曜日。0=日曜, 1=月曜 */
  weekStart: 0 | 1
}
