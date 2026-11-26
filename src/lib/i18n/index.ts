// 表示言語の判定と文言の取り出し。
//
// 言語は起動時に端末の設定（iOSアプリではアプリごとの言語設定）から1回だけ決める。
// 対応していない言語の端末では英語を表示する。
//
// 言語を追加するときは次をそろえる（そろっていないと型検査か npm test が失敗する）:
//   1. このフォルダに文言ファイル（ja.ts と同じ形）を作り、Lang と DICTIONARIES、matchLang に足す
//   2. ios/App/App/<言語>.lproj/InfoPlist.strings（アプリ名・ATTの説明文）を作り、Xcodeに追加する
//   3. config.ts の URL_TERMS / URL_PRIVACY に表示するページを指定する
//   4. ios/App/App/StampHabit.storekit と App Store Connect に製品の表示名を足す

import { de } from './de.js'
import { en } from './en.js'
import { es } from './es.js'
import { fr } from './fr.js'
import { ja, type Messages } from './ja.js'
import { ko } from './ko.js'
import { ptBR } from './pt-BR.js'
import { zhHans } from './zh-Hans.js'
import { zhHant } from './zh-Hant.js'

export type { Messages }
export type Lang = 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko' | 'es' | 'fr' | 'de' | 'pt-BR'

export const DICTIONARIES: Record<Lang, Messages> = {
  ja,
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ko,
  es,
  fr,
  de,
  'pt-BR': ptBR,
}

const FALLBACK_LANG: Lang = 'en'
const FALLBACK_LOCALE: Record<Lang, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  ko: 'ko-KR',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  'pt-BR': 'pt-BR',
}

// 繁体字を使う地域。文字体系（Hans / Hant）の指定がないときの判断に使う。
const TRADITIONAL_REGIONS = ['tw', 'hk', 'mo']

/** 言語タグ1つに対応する表示言語。対応していなければ null。 */
export function matchLang(tag: string): Lang | null {
  const [base, ...rest] = tag.toLowerCase().split(/[-_]/)
  switch (base) {
    case 'ja':
    case 'en':
    case 'ko':
    case 'es':
    case 'fr':
    case 'de':
      return base
    case 'pt':
      return 'pt-BR'
    case 'zh':
    case 'yue':
      if (rest.includes('hant')) return 'zh-Hant'
      if (rest.includes('hans')) return 'zh-Hans'
      return base === 'yue' || rest.some((part) => TRADITIONAL_REGIONS.includes(part)) ? 'zh-Hant' : 'zh-Hans'
    default:
      return null
  }
}

/** 優先順に並んだ言語タグから、対応している最初の言語を選ぶ。 */
export function pickLang(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const matched = matchLang(tag)
    if (matched) return matched
  }
  return FALLBACK_LANG
}

/** 日付の書式に使うロケール。同じ言語なら利用者の地域（en-GB など）を尊重する。 */
export function pickLocale(preferred: readonly string[], target: Lang): string {
  return preferred.find((tag) => matchLang(tag) === target && tag.includes('-')) ?? FALLBACK_LOCALE[target]
}

function preferredLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}

export const lang: Lang = pickLang(preferredLanguages())
export const dateLocale: string = pickLocale(preferredLanguages(), lang)
export const t: Messages = DICTIONARIES[lang]
