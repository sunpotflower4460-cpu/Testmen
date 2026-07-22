import { useEffect, useState } from 'react'
import { todayKey } from './date'

/** 現在の日付キーを返し、日付・時計・タイムゾーン変更にも追従する。 */
export function useDayKey(): string {
  const [key, setKey] = useState(todayKey)

  useEffect(() => {
    let timer: number | undefined

    const clearTimer = () => {
      if (timer !== undefined) window.clearTimeout(timer)
      timer = undefined
    }

    const scheduleMidnight = () => {
      clearTimer()
      const now = new Date()
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        2,
      )
      timer = window.setTimeout(() => {
        setKey(todayKey())
        scheduleMidnight()
      }, Math.max(0, next.getTime() - now.getTime()))
    }

    const refresh = () => {
      setKey(todayKey())
      scheduleMidnight()
    }

    scheduleMidnight()

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)

    return () => {
      clearTimer()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
    }
  }, [])

  return key
}
