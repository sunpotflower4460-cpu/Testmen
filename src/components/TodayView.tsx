import { useMemo } from 'react'
import type { Habit } from '../lib/types'
import type { AppApi } from '../lib/useAppData'
import { HabitCard } from './HabitCard'
import { todayKey } from '../lib/date'

interface Props {
  habits: Habit[]
  api: AppApi
  onAdd: () => void
  onEdit: (h: Habit) => void
}

export function TodayView({ habits, api, onAdd, onEdit }: Props) {
  const key = todayKey()
  const doneCount = useMemo(
    () => habits.filter((h) => api.isDone(h.id, key)).length,
    [habits, api, key],
  )
  const total = habits.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const allDone = total > 0 && doneCount === total

  if (total === 0) {
    return (
      <div className="empty">
        <div className="empty__stamp" aria-hidden>㊡</div>
        <h2 className="empty__title">継続したいことを登録しよう</h2>
        <p className="empty__text">
          読書・運動・早寝——なんでもOK。<br />
          毎日「できた」ら、気持ちいいハンコを押して記録します。
        </p>
        <button className="btn btn--primary btn--lg" onClick={onAdd}>
          ＋ 最初のタイトルを作る
        </button>
      </div>
    )
  }

  return (
    <div className="today">
      <section className="progress" aria-label="今日の達成状況">
        <div className="progress__head">
          <span className="progress__label">今日の達成</span>
          <span className="progress__count">
            <strong>{doneCount}</strong> / {total}
          </span>
        </div>
        <div className="progress__bar">
          <div
            className={'progress__fill' + (allDone ? ' progress__fill--full' : '')}
            style={{ width: `${pct}%` }}
          />
        </div>
        {allDone && <p className="progress__done">🎉 今日はぜんぶ達成！</p>}
      </section>

      <div className="card-list">
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} api={api} onEdit={onEdit} />
        ))}
      </div>

      <button className="btn btn--soft btn--block" onClick={onAdd}>
        ＋ タイトルを追加
      </button>
    </div>
  )
}
