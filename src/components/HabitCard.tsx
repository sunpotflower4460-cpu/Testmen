import { useMemo } from 'react'
import type { Habit } from '../lib/types'
import type { AppApi } from '../lib/useAppData'
import { getColor } from '../lib/palette'
import { StampButton } from './StampButton'
import { currentStreak, todayKey } from '../lib/date'
import { t } from '../lib/i18n'

interface Props {
  habit: Habit
  api: AppApi
  onEdit: (h: Habit) => void
}

export function HabitCard({ habit, api, onEdit }: Props) {
  const color = getColor(habit.colorId)
  const done = api.isDone(habit.id, todayKey())
  const set = api.doneSet(habit.id)
  const streak = useMemo(() => currentStreak(set), [set])
  const total = set.size

  return (
    <article
      className={'card' + (done ? ' card--done' : '')}
      style={{ '--ink': color.ink, '--tint': color.tint } as React.CSSProperties}
    >
      <div className="card__top">
        <div className="card__meta">
          <h2 className="card__title">{habit.title}</h2>
          <div className="card__stats">
            {streak > 0 ? (
              <span className="chip chip--streak">{t.card.streak(streak)}</span>
            ) : (
              <span className="chip chip--muted">{t.card.startToday}</span>
            )}
            <span className="chip chip--muted">{t.card.total(total)}</span>
          </div>
        </div>
        <button
          className="icon-btn icon-btn--ghost"
          onClick={() => onEdit(habit)}
          aria-label={t.card.editNamed(habit.title)}
          title={t.card.edit}
        >
          ⋯
        </button>
      </div>

      <div className="card__stampwrap">
        <StampButton
          done={done}
          color={color}
          emoji={habit.emoji}
          soundOn={api.data.settings.sound}
          onToggle={() => api.toggleRecord(habit.id, todayKey())}
          ariaLabel={done ? t.card.undoToday(habit.title) : t.card.markToday(habit.title)}
        />
        <p className={'card__status' + (done ? ' card__status--done' : '')}>
          {done ? t.card.done : t.card.tapToStamp}
        </p>
      </div>
    </article>
  )
}
