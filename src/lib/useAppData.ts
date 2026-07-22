import { useCallback, useRef, useState } from 'react'
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
  const dataRef = useRef(data)

  const commitData = useCallback((update: (previous: AppData) => AppData) => {
    const previous = dataRef.current
    const next = update(previous)
    if (next === previous) return

    dataRef.current = next
    if (!saveData(next)) console.warn('Failed to persist app data')
    setData(next)
  }, [])

  const addHabit = useCallback((input: HabitInput) => {
    commitData((previous) => {
      const order = previous.habits.length
        ? Math.max(...previous.habits.map((habit) => habit.order)) + 1
        : 0
      const habit: Habit = {
        id: uid(),
        title: input.title.trim() || '無題',
        emoji: input.emoji || '✓',
        colorId: input.colorId || DEFAULT_COLOR_ID,
        createdAt: new Date().toISOString(),
        order,
      }
      return { ...previous, habits: [...previous.habits, habit] }
    })
  }, [commitData])

  const updateHabit = useCallback((id: string, input: HabitInput) => {
    commitData((previous) => ({
      ...previous,
      habits: previous.habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              title: input.title.trim() || habit.title,
              emoji: input.emoji,
              colorId: input.colorId,
            }
          : habit,
      ),
    }))
  }, [commitData])

  const deleteHabit = useCallback((id: string) => {
    commitData((previous) => {
      const records = { ...previous.records }
      delete records[id]
      return {
        ...previous,
        habits: previous.habits.filter((habit) => habit.id !== id),
        records,
      }
    })
  }, [commitData])

  const moveHabit = useCallback((id: string, direction: -1 | 1) => {
    commitData((previous) => {
      const sorted = [...previous.habits].sort((a, b) => a.order - b.order)
      const index = sorted.findIndex((habit) => habit.id === id)
      const swapIndex = index + direction
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return previous

      const current = sorted[index]
      const adjacent = sorted[swapIndex]
      const habits = previous.habits.map((habit) => {
        if (habit.id === current.id) return { ...habit, order: adjacent.order }
        if (habit.id === adjacent.id) return { ...habit, order: current.order }
        return habit
      })
      return { ...previous, habits }
    })
  }, [commitData])

  const toggleRecord = useCallback((habitId: string, dateKey: string) => {
    commitData((previous) => ({
      ...previous,
      records: toggleRecordDate(previous.records, habitId, dateKey).records,
    }))
  }, [commitData])

  const isDone = useCallback(
    (habitId: string, dateKey: string) => (data.records[habitId] ?? []).includes(dateKey),
    [data.records],
  )

  const doneSet = useCallback(
    (habitId: string) => new Set(data.records[habitId] ?? []),
    [data.records],
  )

  const setSettings = useCallback((patch: Partial<Settings>) => {
    commitData((previous) => ({
      ...previous,
      settings: { ...previous.settings, ...patch },
    }))
  }, [commitData])

  const replaceAll = useCallback((next: AppData) => {
    commitData(() => next)
  }, [commitData])

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
