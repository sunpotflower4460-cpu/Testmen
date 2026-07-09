import { useEffect, useState } from 'react'
import type { Habit } from '../lib/types'
import type { AppApi } from '../lib/useAppData'
import { EMOJI_CHOICES, INK_COLORS, DEFAULT_COLOR_ID, getColor } from '../lib/palette'
import { Sheet } from './Sheet'

interface Props {
  habit: Habit | null
  api: AppApi
  onClose: () => void
}

export function HabitEditor({ habit, api, onClose }: Props) {
  const editing = habit !== null
  const [title, setTitle] = useState(habit?.title ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? EMOJI_CHOICES[0])
  const [colorId, setColorId] = useState(habit?.colorId ?? DEFAULT_COLOR_ID)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setTitle(habit?.title ?? '')
    setEmoji(habit?.emoji ?? EMOJI_CHOICES[0])
    setColorId(habit?.colorId ?? DEFAULT_COLOR_ID)
  }, [habit])

  const color = getColor(colorId)

  function save() {
    if (!title.trim()) return
    if (editing && habit) {
      api.updateHabit(habit.id, { title, emoji, colorId })
    } else {
      api.addHabit({ title, emoji, colorId })
    }
    onClose()
  }

  function remove() {
    if (habit) api.deleteHabit(habit.id)
    onClose()
  }

  return (
    <Sheet title={editing ? 'タイトルを編集' : '新しいタイトル'} onClose={onClose}>
      <div className="editor">
        {/* プレビュー */}
        <div
          className="editor__preview"
          style={{ '--ink': color.ink, '--tint': color.tint } as React.CSSProperties}
        >
          <span className="editor__preview-stamp">{emoji}</span>
          <span className="editor__preview-title">{title.trim() || 'タイトル名'}</span>
        </div>

        <label className="field">
          <span className="field__label">続けたいこと</span>
          <input
            className="field__input"
            type="text"
            value={title}
            maxLength={24}
            placeholder="例）本を10分読む"
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>

        <div className="field">
          <span className="field__label">ハンコの絵柄</span>
          <div className="emoji-grid">
            {EMOJI_CHOICES.map((em) => (
              <button
                key={em}
                type="button"
                className={'emoji-grid__item' + (em === emoji ? ' is-selected' : '')}
                onClick={() => setEmoji(em)}
                aria-pressed={em === emoji}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">インクの色</span>
          <div className="color-row">
            {INK_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={'color-dot' + (c.id === colorId ? ' is-selected' : '')}
                style={{ background: c.ink }}
                onClick={() => setColorId(c.id)}
                aria-label={c.name}
                aria-pressed={c.id === colorId}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="editor__actions">
          <button
            className="btn btn--primary btn--block"
            onClick={save}
            disabled={!title.trim()}
          >
            {editing ? '保存する' : '作成する'}
          </button>

          {editing && !confirmDelete && (
            <button className="btn btn--danger-ghost btn--block" onClick={() => setConfirmDelete(true)}>
              このタイトルを削除
            </button>
          )}
          {editing && confirmDelete && (
            <div className="confirm">
              <p className="confirm__text">記録もすべて削除されます。よろしいですか？</p>
              <div className="confirm__row">
                <button className="btn btn--soft" onClick={() => setConfirmDelete(false)}>
                  やめる
                </button>
                <button className="btn btn--danger" onClick={remove}>
                  削除する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}
