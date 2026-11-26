import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { URL_PRIVACY, URL_TERMS } from '../.test-dist/src/lib/config.js'
import { formatLong, formatMonth, formatMonthDay, weekdayLabel } from '../.test-dist/src/lib/date.js'
import { DICTIONARIES, matchLang, pickLang, pickLocale } from '../.test-dist/src/lib/i18n/index.js'
import { INK_COLORS } from '../.test-dist/src/lib/palette.js'

const LANGS = Object.keys(DICTIONARIES)
const KANA = /[぀-ヿ]/
const HAN = /[㐀-鿿]/
const HANGUL = /[ᄀ-ᇿ가-힯]/

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

/** 文言ファイルの全項目を「キーのパス -> 文字列または関数」にする。 */
function leaves(node, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object') leaves(value, path, out)
    else out.set(path, value)
  }
  return out
}

/** 関数の文言には目印の引数を渡して、表示される文字列にする。 */
function rendered(dictionary) {
  const out = new Map()
  for (const [path, value] of leaves(dictionary)) {
    out.set(path, typeof value === 'function' ? value('ARG1', 'ARG2', true) : value)
  }
  return out
}

test('every language has the same message keys, kinds and no empty text', () => {
  const base = [...leaves(DICTIONARIES.ja)].map(([path, value]) => `${path}:${typeof value}`)
  for (const lang of LANGS) {
    assert.deepEqual([...leaves(DICTIONARIES[lang])].map(([path, value]) => `${path}:${typeof value}`), base, lang)
    for (const [path, text] of rendered(DICTIONARIES[lang])) {
      assert.ok(text.trim().length > 0, `${lang}: ${path}`)
    }
  }
})

test('messages with arguments keep every argument in the text', () => {
  for (const lang of LANGS) {
    for (const [path, value] of leaves(DICTIONARIES[lang])) {
      if (typeof value !== 'function') continue
      for (const done of [true, false]) {
        const text = value('ARG1', 'ARG2', done)
        assert.ok(text.includes('ARG1'), `${lang}: ${path} -> ${text}`)
        if (path === 'calendar.cell') assert.ok(text.includes('ARG2'), `${lang}: ${path} -> ${text}`)
        assert.ok(!/undefined|\$\{/.test(text), `${lang}: ${path} -> ${text}`)
      }
    }
    const cell = DICTIONARIES[lang].calendar.cell
    assert.notEqual(cell('a', 'b', true), cell('a', 'b', false), lang)
  }
})

test('no language contains characters left over from another script', () => {
  for (const lang of LANGS.filter((value) => value !== 'ja')) {
    for (const [path, text] of rendered(DICTIONARIES[lang])) {
      assert.ok(!KANA.test(text), `${lang}: ${path}: ${text}`)
      if (!lang.startsWith('zh')) assert.ok(!HAN.test(text), `${lang}: ${path}: ${text}`)
      if (lang !== 'ko') assert.ok(!HANGUL.test(text), `${lang}: ${path}: ${text}`)
    }
  }
  const simplifiedOnly = /[设历习记录删广复买态载导误]/
  for (const [path, text] of rendered(DICTIONARIES['zh-Hant'])) {
    assert.ok(!simplifiedOnly.test(text), `zh-Hant: ${path}: ${text}`)
  }
})

test('nothing was left untranslated in English', () => {
  // 製品名や、その言語でも同じ綴りになる語だけを許可する。
  const sameAsEnglish = {
    es: ['appName', 'calendar.total', 'calendar.dayUnit', 'purchase.premiumName'],
    fr: ['appName', 'calendar.date', 'calendar.total', 'colors.indigo', 'purchase.premiumName'],
    de: ['appName', 'purchase.premiumName', 'settings.mailVersion'],
    'pt-BR': ['appName', 'calendar.total', 'calendar.dayUnit', 'purchase.premiumName'],
    ko: [],
    'zh-Hans': [],
    'zh-Hant': [],
  }
  const english = rendered(DICTIONARIES.en)
  for (const [lang, allowed] of Object.entries(sameAsEnglish)) {
    for (const [path, text] of rendered(DICTIONARIES[lang])) {
      if (text === english.get(path)) assert.ok(allowed.includes(path), `${lang}: ${path}: ${text}`)
    }
  }
})

test('counts use the right singular and plural forms', () => {
  const streak = (lang, count) => DICTIONARIES[lang].card.streak(count)
  assert.equal(streak('es', 1), '🔥 Racha de 1 día')
  assert.equal(streak('es', 2), '🔥 Racha de 2 días')
  assert.equal(streak('de', 1), '🔥 1 Tag in Folge')
  assert.equal(streak('de', 5), '🔥 5 Tage in Folge')
  assert.equal(streak('fr', 1), '🔥 1 jour d’affilée')
  assert.equal(streak('fr', 3), '🔥 3 jours d’affilée')
  assert.equal(streak('pt-BR', 1), '🔥 1 dia seguido')
  assert.equal(streak('pt-BR', 4), '🔥 4 dias seguidos')
})

test('captions under a number also read correctly for a count of one', () => {
  // 数字の下に置くラベルは件数で変化しないため、複数形の名詞（"1 veces" など）を使わない。
  assert.equal(DICTIONARIES.es.editor.totalStat, 'en total')
  assert.equal(DICTIONARIES['pt-BR'].editor.totalStat, 'no total')
})

test('French punctuation never wraps onto its own line', () => {
  for (const [path, text] of rendered(DICTIONARIES.fr)) {
    assert.ok(!/ [?!:]/.test(text), `fr: ${path}: ${text}`)
  }
})

test('input placeholders stay short enough for the title field', () => {
  for (const lang of LANGS) {
    const text = DICTIONARIES[lang].editor.namePlaceholder
    assert.ok(text.length <= 30, `${lang}: ${text}`)
  }
})

test('every ink color has a display name', () => {
  for (const dictionary of Object.values(DICTIONARIES)) {
    assert.deepEqual(Object.keys(dictionary.colors), INK_COLORS.map((color) => color.id))
  }
})

test('device language tags map to the supported language', () => {
  const cases = {
    'ja-JP': 'ja', 'en-GB': 'en', 'ko-KR': 'ko', 'es-419': 'es', 'fr-CA': 'fr', 'de-AT': 'de',
    'pt-BR': 'pt-BR', 'pt-PT': 'pt-BR',
    zh: 'zh-Hans', 'zh-CN': 'zh-Hans', 'zh-SG': 'zh-Hans', 'zh-Hans-HK': 'zh-Hans',
    'zh-TW': 'zh-Hant', 'zh-HK': 'zh-Hant', 'zh-MO': 'zh-Hant', 'zh-Hant': 'zh-Hant', 'zh-Hant-CN': 'zh-Hant',
    'yue-Hant-HK': 'zh-Hant', 'yue-Hans-CN': 'zh-Hans',
    'it-IT': null, constructor: null, '': null,
  }
  for (const [tag, expected] of Object.entries(cases)) assert.equal(matchLang(tag), expected, tag)
})

test('the first supported language wins, and unsupported devices get English', () => {
  assert.equal(pickLang(['ja-JP']), 'ja')
  assert.equal(pickLang(['en-GB', 'ja-JP']), 'en')
  assert.equal(pickLang(['it-IT', 'ko-KR']), 'ko')
  assert.equal(pickLang(['it-IT']), 'en')
  assert.equal(pickLang([]), 'en')
})

test('date locale keeps the user region within the chosen language', () => {
  assert.equal(pickLocale(['en-GB', 'ja-JP'], 'en'), 'en-GB')
  assert.equal(pickLocale(['it-IT'], 'en'), 'en-US')
  assert.equal(pickLocale(['ja'], 'ja'), 'ja-JP')
  assert.equal(pickLocale(['zh-HK'], 'zh-Hant'), 'zh-HK')
  assert.equal(pickLocale(['zh-Hant'], 'zh-Hant'), 'zh-Hant')
  assert.equal(pickLocale(['es-MX'], 'es'), 'es-MX')
})

test('dates are formatted per locale, keeping the previous Japanese format', () => {
  const date = new Date(2026, 10, 26)
  assert.equal(formatLong(date, 'ja-JP'), '2026年11月26日(木)')
  assert.equal(formatLong(date, 'en-US'), 'Thu, Nov 26, 2026')
  assert.equal(formatMonth(2026, 10, 'ja-JP'), '2026年11月')
  assert.equal(formatMonth(2026, 10, 'en-US'), 'November 2026')
  assert.equal(formatMonthDay(date, 'ja-JP'), '11月26日')
  assert.equal(formatMonthDay(date, 'en-US'), 'Nov 26')
  assert.deepEqual([0, 1, 6].map((day) => weekdayLabel(day, 'ja-JP')), ['日', '月', '土'])
  assert.deepEqual([0, 1, 6].map((day) => weekdayLabel(day, 'en-US')), ['Sun', 'Mon', 'Sat'])
  for (const lang of LANGS) {
    const locale = pickLocale([], lang)
    assert.match(formatLong(date, locale), /2026/, lang)
    assert.match(formatMonth(2026, 10, locale), /2026/, lang)
    assert.equal(new Set([0, 1, 2, 3, 4, 5, 6].map((day) => weekdayLabel(day, locale))).size, 7, lang)
  }
})

test('dates stay Gregorian even when the device prefers another calendar', () => {
  assert.equal(formatMonth(2026, 10, 'en-US-u-ca-persian'), 'November 2026')
  assert.equal(formatMonth(2026, 10, 'ja-JP-u-ca-japanese'), '2026年11月')
  assert.match(formatLong(new Date(2026, 10, 26), 'en-US-u-ca-buddhist'), /2026/)
})

test('each language has its iOS strings, store product name and legal pages', () => {
  const project = read('ios/App/App.xcodeproj/project.pbxproj')
  const store = JSON.parse(read('ios/App/App/StampHabit.storekit'))
  const productLangs = store.products[0].localizations.map((item) => matchLang(item.locale))

  for (const lang of LANGS) {
    const strings = read(`ios/App/App/${lang}.lproj/InfoPlist.strings`)
    assert.ok(strings.includes(`"CFBundleDisplayName" = "${DICTIONARIES[lang].appName}";`), `${lang}: app name`)
    assert.match(strings, /"NSUserTrackingUsageDescription" = ".+";/, `${lang}: ATT`)
    assert.ok(project.includes(`${lang}.lproj/InfoPlist.strings`), `${lang}: not in the Xcode project`)
    assert.ok(productLangs.includes(lang), `${lang}: StoreKit product localization`)
    for (const url of [URL_PRIVACY[lang], URL_TERMS[lang]]) {
      assert.ok(existsSync(new URL(`../public/${url.replace('./', '')}`, import.meta.url)), `${lang}: ${url}`)
    }
  }
})
