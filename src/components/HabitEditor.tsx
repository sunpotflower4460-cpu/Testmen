import { useEffect, useMemo, useRef, useState } from 'react'
import type { Habit } from '../lib/types'
import type { AppApi } from '../lib/useAppData'
import { EMOJI_CHOICES, INK_COLORS, DEFAULT_COLOR_ID, getColor } from '../lib/palette'
import { currentStreak, longestStreak } from '../lib/date'
import { t } from '../lib/i18n'
import { Sheet } from './Sheet'

interface Props {
  habit: Habit | null
  habits: Habit[]
  api: AppApi
  onClose: () => void
}

export function HabitEditor({ habit, habits, api, onClose }: Props) {
  const editing = habit !== null
  const [title, setTitle] = useState(habit?.title ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? EMOJI_CHOICES[0])
  const [colorId, setColorId] = useState(habit?.colorId ?? DEFAULT_COLOR_ID)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  // シートがせり上がる途中でフォーカスすると、iOSがキーボードを避けるスクロール量を誤り、
  // 入力欄が画面の外へ出る。アニメーション（.sheet__panel の 0.34s）が終わってからフォーカスする。
  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setTitle(habit?.title ?? '')
    setEmoji(habit?.emoji ?? EMOJI_CHOICES[0])
    setColorId(habit?.colorId ?? DEFAULT_COLOR_ID)
    setConfirmDelete(false)
  }, [habit])

  const color = getColor(colorId)
  const stats = useMemo(() => {
    if (!habit) return null
    const keys = api.data.records[habit.id] ?? []
    return {
      total: keys.length,
      current: currentStreak(new Set(keys)),
      longest: longestStreak(keys),
    }
  }, [habit, api.data.records])

  const index = habit ? habits.findIndex((item) => item.id === habit.id) : -1
  const isFirst = index <= 0
  const isLast = index < 0 || index >= habits.length - 1

  function save() {
    if (!title.trim()) return
    if (editing && habit) api.updateHabit(habit.id, { title, emoji, colorId })
    else api.addHabit({ title, emoji, colorId })
    onClose()
  }

  function remove() {
    if (habit) api.deleteHabit(habit.id)
    onClose()
  }

  return (
    <Sheet title={editing ? t.editor.editTitle : t.editor.newTitle} onClose={onClose}>
      <div className="editor">
        <div className="editor__preview" style={{ '--ink': color.ink, '--tint': color.tint } as React.CSSProperties}>
          <span className="editor__preview-stamp">{emoji}</span>
          <span className="editor__preview-title">{title.trim() || t.editor.previewPlaceholder}</span>
        </div>

        {stats && (
          <div className="editor__stats">
            <div className="editor__stat"><strong>{stats.total}</strong><span>{t.editor.totalStat}</span></div>
            <div className="editor__stat"><strong>{stats.current}</strong><span>{t.editor.currentStreak}</span></div>
            <div className="editor__stat"><strong>{stats.longest}</strong><span>{t.editor.longestStreak}</span></div>
          </div>
        )}

        <label className="field">
          <span className="field__label">{t.editor.nameLabel}</span>
          <input
            ref={titleRef}
            className="field__input"
            type="text"
            value={title}
            maxLength={24}
            placeholder={t.editor.namePlaceholder}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) save()
            }}
          />
        </label>

        <div className="field">
          <span className="field__label">{t.editor.emojiLabel}</span>
          <div className="emoji-grid">
            {EMOJI_CHOICES.map((item) => (
              <button
                key={item}
                type="button"
                className={'emoji-grid__item' + (item === emoji ? ' is-selected' : '')}
                onClick={() => setEmoji(item)}
                aria-label={item}
                aria-pressed={item === emoji}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">{t.editor.colorLabel}</span>
          <div className="color-row">
            {INK_COLORS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={'color-dot' + (item.id === colorId ? ' is-selected' : '')}
                style={{ background: item.ink }}
                onClick={() => setColorId(item.id)}
                aria-label={t.colors[item.id]}
                aria-pressed={item.id === colorId}
                title={t.colors[item.id]}
              />
            ))}
          </div>
        </div>

        {editing && habits.length > 1 && (
          <div className="field">
            <span className="field__label">{t.editor.orderLabel}</span>
            <div className="reorder">
              <button className="btn btn--soft" onClick={() => habit && api.moveHabit(habit.id, -1)} disabled={isFirst}>
                {t.editor.moveUp}
              </button>
              <button className="btn btn--soft" onClick={() => habit && api.moveHabit(habit.id, 1)} disabled={isLast}>
                {t.editor.moveDown}
              </button>
            </div>
          </div>
        )}

        <div className="editor__actions">
          <button className="btn btn--primary btn--block" onClick={save} disabled={!title.trim()}>
            {editing ? t.editor.save : t.editor.create}
          </button>

          {editing && !confirmDelete && (
            <button className="btn btn--danger-ghost btn--block" onClick={() => setConfirmDelete(true)}>
              {t.editor.delete}
            </button>
          )}
          {editing && confirmDelete && (
            <div className="confirm">
              <p className="confirm__text">{t.editor.deleteConfirm}</p>
              <div className="confirm__row">
                <button className="btn btn--soft" onClick={() => setConfirmDelete(false)}>{t.editor.keep}</button>
                <button className="btn btn--danger" onClick={remove}>{t.editor.deleteNow}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}
