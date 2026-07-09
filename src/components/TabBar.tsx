export type Tab = 'today' | 'calendar'

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  onAdd: () => void
}

export function TabBar({ tab, onChange, onAdd }: Props) {
  return (
    <nav className="tabbar" aria-label="メインナビゲーション">
      <button
        className={'tabbar__item' + (tab === 'today' ? ' is-active' : '')}
        onClick={() => onChange('today')}
        aria-current={tab === 'today'}
      >
        <span className="tabbar__icon" aria-hidden>㊡</span>
        <span className="tabbar__label">今日</span>
      </button>

      <button className="tabbar__fab" onClick={onAdd} aria-label="タイトルを追加">
        ＋
      </button>

      <button
        className={'tabbar__item' + (tab === 'calendar' ? ' is-active' : '')}
        onClick={() => onChange('calendar')}
        aria-current={tab === 'calendar'}
      >
        <span className="tabbar__icon" aria-hidden>📅</span>
        <span className="tabbar__label">カレンダー</span>
      </button>
    </nav>
  )
}
