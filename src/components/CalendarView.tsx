import { useMemo, useState } from 'react'
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

  const dayKeys = useMemo(() => monthDayKeys(year, month0), [year, month0])

  // 月内の達成数（タイトル毎）
  const monthCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const h of habits) {
      const set = api.doneSet(h.id)
      map[h.id] = dayKeys.filter((k) => set.has(k)).length
    }
    return map
  }, [habits, api, dayKeys])

  function shiftMonth(delta: number) {
    let m = month0 + delta
    let y = year
    if (m < 0) {
      m = 11
      y--
    } else if (m > 11) {
      m = 0
      y++
    }
    setYear(y)
    setMonth0(m)
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth0(t.getMonth())
  }

  function onCellClick(habit: Habit, key: string) {
    if (isFuture(key)) return
    const nowDone = api.toggleRecord(habit.id, key)
    if (api.data.settings.sound) {
      nowDone ? playStamp() : playUnstamp()
    }
  }

  const isCurrentMonth = year === now.getFullYear() && month0 === now.getMonth()

  if (habits.length === 0) {
    return (
      <div className="empty">
        <div className="empty__stamp" aria-hidden>📅</div>
        <h2 className="empty__title">記録するタイトルがありません</h2>
        <p className="empty__text">まずは継続したいことを登録しましょう。</p>
        <button className="btn btn--primary btn--lg" onClick={onAdd}>
          ＋ タイトルを作る
        </button>
      </div>
    )
  }

  return (
    <div className="cal">
      <div className="cal__nav">
        <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="前の月">
          ‹
        </button>
        <h2 className="cal__month">{formatMonthJa(year, month0)}</h2>
        <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="次の月">
          ›
        </button>
        {!isCurrentMonth && (
          <button className="btn btn--soft btn--sm cal__today" onClick={goToday}>
            今日へ
          </button>
        )}
      </div>

      <p className="cal__hint">セルをタップで過去の記録も付けられます（縦：日付／横：タイトル）</p>

      <div className="cal__scroll">
        <table className="grid" style={{ '--cols': habits.length } as React.CSSProperties}>
          <thead>
            <tr>
              <th className="grid__corner">日付</th>
              {habits.map((h) => {
                const c = getColor(h.colorId)
                return (
                  <th
                    key={h.id}
                    className="grid__habit"
                    style={{ '--ink': c.ink, '--tint': c.tint } as React.CSSProperties}
                    title={h.title}
                  >
                    <span className="grid__habit-emoji">{h.emoji}</span>
                    <span className="grid__habit-title">{h.title}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {dayKeys.map((key) => {
              const dow = weekdayOf(key)
              const d = fromKey(key).getDate()
              const today = isToday(key)
              const future = isFuture(key)
              return (
                <tr
                  key={key}
                  className={
                    'grid__row' +
                    (today ? ' grid__row--today' : '') +
                    (dow === 0 ? ' grid__row--sun' : '') +
                    (dow === 6 ? ' grid__row--sat' : '')
                  }
                >
                  <th className="grid__date" scope="row">
                    <span className="grid__date-num">{d}</span>
                    <span className="grid__date-dow">{weekdayLabel(dow)}</span>
                  </th>
                  {habits.map((h) => {
                    const c = getColor(h.colorId)
                    const done = api.isDone(h.id, key)
                    return (
                      <td key={h.id} className="grid__cell">
                        <button
                          type="button"
                          className={
                            'cell' +
                            (done ? ' cell--done' : '') +
                            (future ? ' cell--future' : '')
                          }
                          style={{ '--ink': c.ink, '--tint': c.tint } as React.CSSProperties}
                          onClick={() => onCellClick(h, key)}
                          disabled={future}
                          aria-label={`${h.title} ${d}日 ${done ? '達成済み' : '未達成'}`}
                          aria-pressed={done}
                        >
                          {done && <span className="cell__mark">{h.emoji}</span>}
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
              {habits.map((h) => (
                <td key={h.id} className="grid__total">
                  {monthCounts[h.id]}
                  <small>日</small>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
