// 表示言語の判定と文言の取り出し。
//
// 言語は起動時に端末の設定（iOSアプリではアプリごとの言語設定）から1回だけ決める。
// 対応していない言語の端末では英語を表示する。
//
// 言語を追加するときは次の4か所をそろえる:
//   1. このフォルダに文言ファイル（en.ts と同じ形）を作り、下の DICTIONARIES に足す
//   2. ios/App/App/<言語>.lproj/InfoPlist.strings（アプリ名・ATTの説明文）をXcodeに追加する
//   3. public/terms.<言語>.html と privacy.<言語>.html を作り、config.ts のURLに足す
//   4. ios/App/App/StampHabit.storekit と App Store Connect に製品の表示名を足す

import { en } from './en.js'
import { ja, type Messages } from './ja.js'

export type { Messages }
export type Lang = 'ja' | 'en'

export const DICTIONARIES: Record<Lang, Messages> = { ja, en }

const FALLBACK_LANG: Lang = 'en'
const FALLBACK_LOCALE: Record<Lang, string> = { ja: 'ja-JP', en: 'en-US' }

const baseOf = (tag: string) => tag.toLowerCase().split(/[-_]/)[0]

function isLang(value: string): value is Lang {
  return Object.prototype.hasOwnProperty.call(DICTIONARIES, value)
}

/** 優先順に並んだ言語タグから、対応している最初の言語を選ぶ。 */
export function pickLang(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const base = baseOf(tag)
    if (isLang(base)) return base
  }
  return FALLBACK_LANG
}

/** 日付の書式に使うロケール。同じ言語なら利用者の地域（en-GB など）を尊重する。 */
export function pickLocale(preferred: readonly string[], target: Lang): string {
  return preferred.find((tag) => baseOf(tag) === target && tag.includes('-')) ?? FALLBACK_LOCALE[target]
}

function preferredLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}

export const lang: Lang = pickLang(preferredLanguages())
export const dateLocale: string = pickLocale(preferredLanguages(), lang)
export const t: Messages = DICTIONARIES[lang]
