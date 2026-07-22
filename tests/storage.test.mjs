import assert from 'node:assert/strict'
import test from 'node:test'
import { parseImport } from '../.test-dist/src/lib/storage.js'

test('import normalizes malformed habits and records', () => {
  const data = parseImport(JSON.stringify({
    habits: [
      { id: 'a', title: '', emoji: '', colorId: '', order: 'bad' },
      { id: '', title: 'invalid' },
    ],
    records: {
      a: ['2026-07-02', 12, 'bad', '2026-07-01', '2026-07-01'],
      b: 'not-an-array',
    },
    settings: { sound: false, weekStart: 1 },
  }))

  assert.equal(data.habits.length, 1)
  assert.equal(data.habits[0].title, '無題')
  assert.deepEqual(data.records.a, ['2026-07-01', '2026-07-02'])
  assert.deepEqual(data.settings, { sound: false, weekStart: 1 })
})

test('unrelated JSON is rejected', () => {
  assert.throws(() => parseImport('{"hello":"world"}'))
})
