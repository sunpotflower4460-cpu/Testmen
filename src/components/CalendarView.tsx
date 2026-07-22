import { useMemo, useRef, useState } from 'react'
import type { Habit } from '../lib/types'
import type { AppApi } from '../lib/useAppData'
import { getColor } from '../lib/palette'
import {
  formatMonthJa,
  isFuture,
  isToday,
  monthDayKeys,
  weekdayLabel,
  weekdayOf,
  fromKey,
} from '../lib/date'
import { playStamp, playUnstamp } from '../lib/sound'

interface Props {
  habits: Habit[]
  api: AppApi
  onAdd: () => void
}

export function CalendarView({ habits, api, onAdd }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month0, setMonth0] = useState(now.getMonth())
  const lastToggle = useRef<{ key: string; at: number } | null>(null)

  const dayKeys = useMemo(() => monthDayKeys(year, month0), [year, month0])
  const monthCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const habit of habits) {
      const done = api.doneSet(habit.id)
      map[habit.id] = dayKeys.filter((key) => done.has(key)).length
    }
    return map
  }, [habits, api, dayKeys])

  function shiftMonth(delta: number) {
    let nextMonth = month0 + delta
    let nextYear = year
    if (nextMonth < 0) {
      nextMonth = 11
      nextYear--
    } else if (nextMonth > 11) {
      nextMonth = 0
      nextYear++
    }
    setYear(nextYear)
    setMonth0(nextMonth)
  }

  function goToday() {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth0(today.getMonth())
  }

  function onCellClick(habit: Habit, key: string) {
    if (isFuture(key)) return

    const inputKey = `${habit.id}:${key}`
    const timestamp = Date.now()
    if (lastToggle.current?.key === inputKey && timestamp - lastToggle.current.at < 180) return
    lastToggle.current = { key: inputKey, at: timestamp }

    const nowDone = !api.isDone(habit.id, key)
    api.toggleRecord(habit.id, key)
    if (api.data.settings.sound) nowDone ? playStamp() : playUnstamp()
  }

  const isCurrentMonth = year === now.getFullYear() && month0 === now.getMonth()

  if (habits.length === 0) {
    return (
      <div className="empty">
        <div className="empty__stamp" aria-hidden>📅</div>
        <h2 className="empty__title">記録するタイトルがありません</h2>
        <p className="empty__text">まずは継続したいことを登録しましょう。</p>
        <button className="btn btn--primary btn--lg" onClick={onAdd}>＋ タイトルを作る</button>
      </div>
    )
  }

  return (
    <div className="cal">
      <div className="cal__nav">
        <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="前の月">‹</button>
        <h2 className="cal__month">{formatMonthJa(year, month0)}</h2>
        <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="次の月">›</button>
        {!isCurrentMonth && (
          <button className="btn btn--soft btn--sm cal__today" onClick={goToday}>今日へ</button>
        )}
      </div>

      <p className="cal__hint">セルをタップで過去の記録も付けられます（縦：日付／横：タイトル）</p>

      <div className="cal__scroll">
        <table className="grid" style={{ '--cols': habits.length } as React.CSSProperties}>
          <thead>
            <tr>
              <th className="grid__corner">日付</th>
              {habits.map((habit) => {
                const color = getColor(habit.colorId)
                return (
                  <th key={habit.id} className="grid__habit" style={{ '--ink': color.ink, '--tint': color.tint } as React.CSSProperties} title={habit.title}>
                    <span className="grid__habit-emoji">{habit.emoji}</span>
                    <span className="grid__habit-title">{habit.title}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {dayKeys.map((key) => {
              const weekday = weekdayOf(key)
              const day = fromKey(key).getDate()
              const today = isToday(key)
              const future = isFuture(key)
              return (
                <tr key={key} className={'grid__row' + (today ? ' grid__row--today' : '') + (weekday === 0 ? ' grid__row--sun' : '') + (weekday === 6 ? ' grid__row--sat' : '')}>
                  <th className="grid__date" scope="row">
                    <span className="grid__date-num">{day}</span>
                    <span className="grid__date-dow">{weekdayLabel(weekday)}</span>
                  </th>
                  {habits.map((habit) => {
                    const color = getColor(habit.colorId)
                    const done = api.isDone(habit.id, key)
                    return (
                      <td key={habit.id} className="grid__cell">
                        <button
                          type="button"
                          className={'cell' + (done ? ' cell--done' : '') + (future ? ' cell--future' : '')}
                          style={{ '--ink': color.ink, '--tint': color.tint } as React.CSSProperties}
                          onClick={() => onCellClick(habit, key)}
                          disabled={future}
                          aria-label={`${habit.title} ${month0 + 1}月${day}日 ${done ? '達成済み' : '未達成'}`}
                          aria-pressed={done}
                        >
                          {done && <span className="cell__mark">{habit.emoji}</span>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <th className="grid__corner grid__corner--foot">計</th>
              {habits.map((habit) => (
                <td key={habit.id} className="grid__total">{monthCounts[habit.id]}<small>日</small></td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
