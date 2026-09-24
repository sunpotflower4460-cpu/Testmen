import assert from 'node:assert/strict'
import test from 'node:test'
import { emptyData, loadData, parseImport, RECOVERY_KEY, saveData, STORAGE_KEY } from '../.test-dist/src/lib/storage.js'

test('import normalizes malformed habits and records', () => {
  const data = parseImport(JSON.stringify({
    version: 1,
    habits: [
      { id: 'b', title: '  second  ', emoji: '', colorId: 'unknown', order: 2 },
      { id: 'a', title: '', emoji: '', colorId: '', order: 1 },
      { id: 'a', title: 'duplicate', order: 0 },
      { id: '__proto__', title: 'unsafe' },
      { id: 'constructor', title: 'also unsafe' },
      { id: '', title: 'invalid' },
    ],
    records: {
      a: ['2026-07-02', 12, 'bad', '2026-02-30', '2026-07-01', '2026-07-01'],
      b: ['2024-02-29', '2023-02-29'],
      orphan: ['2026-07-01'],
    },
    settings: { sound: false, weekStart: 1 },
  }))

  assert.deepEqual(data.habits.map(({ id, order }) => ({ id, order })), [
    { id: 'a', order: 0 },
    { id: 'b', order: 1 },
  ])
  assert.equal(data.habits[0].title, '無題')
  assert.equal(data.habits[1].title, 'second')
  assert.equal(data.habits[1].colorId, 'vermilion')
  assert.deepEqual(data.records.a, ['2026-07-01', '2026-07-02'])
  assert.deepEqual(data.records.b, ['2024-02-29'])
  assert.equal(data.records.orphan, undefined)
  assert.deepEqual(data.settings, { sound: false, weekStart: 1 })
})

test('empty valid backup is accepted', () => {
  const data = parseImport('{"version":1,"habits":[],"records":{},"settings":{}}')
  assert.deepEqual(data.habits, [])
  assert.deepEqual(data.records, {})
})

test('unrelated or partial JSON is rejected', () => {
  assert.throws(() => parseImport('{"hello":"world"}'))
  assert.throws(() => parseImport('{"habits":[]}'))
  assert.throws(() => parseImport('{"records":{}}'))
  assert.throws(() => parseImport('[]'))
})

test('newer schema versions are rejected instead of being silently truncated', () => {
  assert.throws(() => parseImport('{"version":2,"habits":[],"records":{}}'))
})

test('saveData reports both persistence success and failure', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let stored = ''

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        setItem(_key, value) {
          stored = value
        },
      },
    })
    assert.equal(saveData(emptyData()), true)
    assert.equal(JSON.parse(stored).version, 1)

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        setItem() {
          throw new Error('quota exceeded')
        },
      },
    })
    assert.equal(saveData(emptyData()), false)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})

test('broken JSON is rejected with a user-facing message, and a BOM is tolerated', () => {
  assert.throws(() => parseImport('{"habits": ['), { message: 'JSONファイルとして読み込めませんでした' })
  const data = parseImport('\uFEFF{"version":1,"habits":[],"records":{}}')
  assert.deepEqual(data.habits, [])
})

test('unreadable stored data is kept aside before it can be overwritten', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const store = new Map([[STORAGE_KEY, '{"habits": [truncated']])

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, value),
      },
    })
    assert.deepEqual(loadData(), emptyData())
    assert.equal(store.get(RECOVERY_KEY), '{"habits": [truncated')

    store.set(STORAGE_KEY, 'null')
    assert.deepEqual(loadData(), emptyData())
    assert.equal(store.get(RECOVERY_KEY), 'null')
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})
