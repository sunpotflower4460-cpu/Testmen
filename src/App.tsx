import { useMemo, useState } from 'react'
import { useAppData } from './lib/useAppData'
import type { Habit } from './lib/types'
import { TodayView } from './components/TodayView'
import { CalendarView } from './components/CalendarView'
import { TabBar, type Tab } from './components/TabBar'
import { HabitEditor } from './components/HabitEditor'
import { SettingsSheet } from './components/SettingsSheet'
import { formatLongJa } from './lib/date'
import { useDayKey } from './lib/useDayKey'

export default function App() {
  const api = useAppData()
  const [tab, setTab] = useState<Tab>('today')
  const [editing, setEditing] = useState<Habit | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const dayKey = useDayKey()

  const sortedHabits = useMemo(
    () => [...api.data.habits].sort((a, b) => a.order - b.order),
    [api.data.habits],
  )

  // dayKey が変わる（日付が変わる）と再計算され、日をまたいでも「今日」が更新される
  const today = useMemo(() => formatLongJa(new Date()), [dayKey])

  function openNew() {
    setEditing(null)
    setShowEditor(true)
  }

  function openEdit(h: Habit) {
    setEditing(h)
    setShowEditor(true)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden>㊡</span>
          <div>
            <h1 className="app-header__title">スタンプ習慣</h1>
            <p className="app-header__date">{today}</p>
          </div>
        </div>
        <button
          className="icon-btn"
          onClick={() => setShowSettings(true)}
          aria-label="設定"
          title="設定"
        >
          ⚙
        </button>
      </header>

      <main className="app-main">
        {tab === 'today' ? (
          <TodayView
            habits={sortedHabits}
            api={api}
            onAdd={openNew}
            onEdit={openEdit}
          />
        ) : (
          <CalendarView habits={sortedHabits} api={api} onAdd={openNew} />
        )}
      </main>

      <TabBar tab={tab} onChange={setTab} onAdd={openNew} />

      {showEditor && (
        <HabitEditor
          habit={editing}
          habits={sortedHabits}
          api={api}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showSettings && (
        <SettingsSheet api={api} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
