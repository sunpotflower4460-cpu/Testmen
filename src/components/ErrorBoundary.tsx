import { Component, type ReactNode } from 'react'
import { backupRawData, STORAGE_KEY } from '../lib/storage'

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
    if (!confirm('記録をすべて消去して初期状態に戻します。よろしいですか？')) return
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
          <h1 className="crash__title">問題が発生しました</h1>
          <p className="crash__text">
            アプリの表示中にエラーが起きました。
            <br />
            まずは再読み込みをお試しください。
          </p>
          <div className="crash__actions">
            <button className="btn btn--primary" onClick={() => location.reload()}>
              再読み込み
            </button>
            <button className="btn btn--danger-ghost" onClick={this.reset}>
              データを初期化して復旧
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
