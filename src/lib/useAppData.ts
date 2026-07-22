import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData, Habit, Settings } from './types'
import { loadData, saveData, uid } from './storage'
import { DEFAULT_COLOR_ID } from './palette'
import { toggleRecordDate } from './records'

export interface HabitInput {
  title: string
  emoji: string
  colorId: string
}

export interface AppApi {
  data: AppData
  addHabit: (input: HabitInput) => void
  updateHabit: (id: string, input: HabitInput) => void
  deleteHabit: (id: string) => void
  moveHabit: (id: string, dir: -1 | 1) => void
  toggleRecord: (habitId: string, dateKey: string) => void
  isDone: (habitId: string, dateKey: string) => boolean
  doneSet: (habitId: string) => Set<string>
  setSettings: (patch: Partial<Settings>) => void
  replaceAll: (next: AppData) => void
}

export function useAppData(): AppApi {
  const [data, setData] = useState<AppData>(() => loadData())

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveData(data)
  }, [data])

  const addHabit = useCallback((input: HabitInput) => {
    setData((prev) => {
      const order = prev.habits.length
        ? Math.max(...prev.habits.map((h) => h.order)) + 1
        : 0
      const habit: Habit = {
        id: uid(),
        title: input.title.trim() || '無題',
        emoji: input.emoji || '✓',
        colorId: input.colorId || DEFAULT_COLOR_ID,
        createdAt: new Date().toISOString(),
        order,
      }
      return { ...prev, habits: [...prev.habits, habit] }
    })
  }, [])

  const updateHabit = useCallback((id: string, input: HabitInput) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === id
          ? { ...h, title: input.title.trim() || h.title, emoji: input.emoji, colorId: input.colorId }
          : h,
      ),
    }))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setData((prev) => {
      const records = { ...prev.records }
      delete records[id]
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        records,
      }
    })
  }, [])

  const moveHabit = useCallback((id: string, dir: -1 | 1) => {
    setData((prev) => {
      const sorted = [...prev.habits].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((h) => h.id === id)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= sorted.length) return prev
      const a = sorted[idx]
      const b = sorted[swap]
      const habits = prev.habits.map((h) => {
        if (h.id === a.id) return { ...h, order: b.order }
        if (h.id === b.id) return { ...h, order: a.order }
        return h
      })
      return { ...prev, habits }
    })
  }, [])

  const toggleRecord = useCallback((habitId: string, dateKey: string) => {
    setData((prev) => ({
      ...prev,
      records: toggleRecordDate(prev.records, habitId, dateKey).records,
    }))
  }, [])

  const isDone = useCallback(
    (habitId: string, dateKey: string) => (data.records[habitId] ?? []).includes(dateKey),
    [data.records],
  )

  const doneSet = useCallback(
    (habitId: string) => new Set(data.records[habitId] ?? []),
    [data.records],
  )

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const replaceAll = useCallback((next: AppData) => setData(next), [])

  return {
    data,
    addHabit,
    updateHabit,
    deleteHabit,
    moveHabit,
    toggleRecord,
    isDone,
    doneSet,
    setSettings,
    replaceAll,
  }
}
