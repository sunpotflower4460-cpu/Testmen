import { t } from '../lib/i18n'

export type Tab = 'today' | 'calendar'

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  onAdd: () => void
}

export function TabBar({ tab, onChange, onAdd }: Props) {
  return (
    <nav className="tabbar" aria-label={t.tabs.navigation}>
      <button
        className={'tabbar__item' + (tab === 'today' ? ' is-active' : '')}
        onClick={() => onChange('today')}
        aria-current={tab === 'today' ? 'page' : undefined}
      >
        <span className="tabbar__icon" aria-hidden>㊡</span>
        <span className="tabbar__label">{t.tabs.today}</span>
      </button>

      <button className="tabbar__fab" onClick={onAdd} aria-label={t.tabs.add}>
        ＋
      </button>

      <button
        className={'tabbar__item' + (tab === 'calendar' ? ' is-active' : '')}
        onClick={() => onChange('calendar')}
        aria-current={tab === 'calendar' ? 'page' : undefined}
      >
        <span className="tabbar__icon" aria-hidden>📅</span>
        <span className="tabbar__label">{t.tabs.calendar}</span>
      </button>
    </nav>
  )
}
