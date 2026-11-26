import assert from 'node:assert/strict'
import test from 'node:test'
import { formatLong, formatMonth, formatMonthDay, weekdayLabel } from '../.test-dist/src/lib/date.js'
import { DICTIONARIES, pickLang, pickLocale } from '../.test-dist/src/lib/i18n/index.js'
import { INK_COLORS } from '../.test-dist/src/lib/palette.js'

const JAPANESE = /[぀-ヿ㐀-鿿]/

/** 文言ファイルの全項目を「キーのパス -> 表示される文字列」にする。 */
function flatten(node, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out.set(path, value)
    else if (typeof value === 'function') out.set(path, String(value('X', 'Y', true)))
    else flatten(value, path, out)
  }
  return out
}

test('every language has the same message keys and no empty text', () => {
  const base = [...flatten(DICTIONARIES.ja).keys()]
  for (const [lang, dictionary] of Object.entries(DICTIONARIES)) {
    const messages = flatten(dictionary)
    assert.deepEqual([...messages.keys()], base, lang)
    for (const [path, text] of messages) assert.ok(text.trim().length > 0, `${lang}: ${path}`)
  }
})

test('English text contains no leftover Japanese', () => {
  for (const [path, text] of flatten(DICTIONARIES.en)) {
    assert.ok(!JAPANESE.test(text), `${path}: ${text}`)
  }
})

test('every ink color has a display name', () => {
  for (const dictionary of Object.values(DICTIONARIES)) {
    assert.deepEqual(Object.keys(dictionary.colors), INK_COLORS.map((color) => color.id))
  }
})

test('the first supported language wins, and unsupported devices get English', () => {
  assert.equal(pickLang(['ja-JP']), 'ja')
  assert.equal(pickLang(['en-GB', 'ja-JP']), 'en')
  assert.equal(pickLang(['fr-FR', 'ja-JP']), 'ja')
  assert.equal(pickLang(['fr-FR']), 'en')
  assert.equal(pickLang(['constructor']), 'en')
  assert.equal(pickLang([]), 'en')
})

test('date locale keeps the user region within the chosen language', () => {
  assert.equal(pickLocale(['en-GB', 'ja-JP'], 'en'), 'en-GB')
  assert.equal(pickLocale(['fr-FR'], 'en'), 'en-US')
  assert.equal(pickLocale(['ja'], 'ja'), 'ja-JP')
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
})
