import assert from 'node:assert/strict'
import test from 'node:test'
import { daysInMonth, longestStreak, monthDayKeys, shiftKey, toKey } from '../.test-dist/src/lib/date.js'

test('leap year and month boundaries are correct', () => {
  assert.equal(daysInMonth(2024, 1), 29)
  assert.equal(daysInMonth(2025, 1), 28)
  assert.equal(shiftKey('2026-01-01', -1), '2025-12-31')
  assert.equal(shiftKey('2024-02-28', 1), '2024-02-29')
  assert.equal(monthDayKeys(2026, 6).at(-1), '2026-07-31')
})

test('local date keys are zero-padded', () => {
  assert.equal(toKey(new Date(2026, 0, 5)), '2026-01-05')
})

test('longest streak ignores duplicate keys', () => {
  assert.equal(longestStreak(['2026-07-01', '2026-07-02', '2026-07-02', '2026-07-04']), 2)
})
