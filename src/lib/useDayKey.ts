import { useEffect, useState } from 'react'
import { todayKey } from './date'

/**
 * 現在の日付キー("YYYY-MM-DD")を返し、日付が変わったら自動で更新する。
 * これを使う側は日をまたいだ瞬間に再描画され、「今日」表示が古いままにならない。
 * タブ復帰(visibilitychange)時にも取り直す。
 */
export function useDayKey(): string {
  const [key, setKey] = useState(todayKey)

  useEffect(() => {
    let timer: number | undefined

    const scheduleMidnight = () => {
      const now = new Date()
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        2, // 深夜0時の2秒後に確実に切り替える
      )
      timer = window.setTimeout(() => {
        setKey(todayKey())
        scheduleMidnight()
      }, next.getTime() - now.getTime())
    }
    scheduleMidnight()

    const onVisible = () => {
      if (document.visibilityState === 'visible') setKey(todayKey())
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return key
}
