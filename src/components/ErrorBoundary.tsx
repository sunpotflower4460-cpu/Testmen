import { Component, type ReactNode } from 'react'
import { backupRawData, STORAGE_KEY } from '../lib/storage'
import { t } from '../lib/i18n'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * 予期せぬ例外でアプリが真っ白になるのを防ぐ最後の砦。
 * データ破損などで描画に失敗しても、リロードやデータ初期化で復帰できる導線を出す。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => {
    if (!confirm(t.crash.resetConfirm)) return
    try {
      // 念のため原文を退避してから消去する（上書きされるまで復旧の余地を残す）。
      backupRawData()
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash">
          <div className="crash__stamp" aria-hidden>😵</div>
          <h1 className="crash__title">{t.crash.title}</h1>
          <p className="crash__text">
            {t.crash.lead}
            <br />
            {t.crash.body}
          </p>
          <div className="crash__actions">
            <button className="btn btn--primary" onClick={() => location.reload()}>
              {t.crash.reload}
            </button>
            <button className="btn btn--danger-ghost" onClick={this.reset}>
              {t.crash.reset}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
