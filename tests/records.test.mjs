import assert from 'node:assert/strict'
import test from 'node:test'
import { toggleRecordDate } from '../.test-dist/src/lib/records.js'

test('two immediate toggles return to the original state', () => {
  const first = toggleRecordDate({}, 'habit-1', '2026-07-22')
  assert.equal(first.nowDone, true)
  assert.deepEqual(first.records, { 'habit-1': ['2026-07-22'] })

  const second = toggleRecordDate(first.records, 'habit-1', '2026-07-22')
  assert.equal(second.nowDone, false)
  assert.deepEqual(second.records, {})
})

test('dates stay unique and sorted', () => {
  const result = toggleRecordDate({ h: ['2026-07-23', '2026-07-21'] }, 'h', '2026-07-22')
  assert.deepEqual(result.records.h, ['2026-07-21', '2026-07-22', '2026-07-23'])
})
