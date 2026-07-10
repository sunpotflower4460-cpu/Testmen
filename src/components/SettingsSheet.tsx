import { useRef, useState } from 'react'
import type { AppApi } from '../lib/useAppData'
import { Sheet } from './Sheet'
import { exportData, parseImport } from '../lib/storage'
import { usePremium } from '../lib/usePremium'
import {
  URL_PRIVACY,
  URL_TERMS,
  CONTACT_EMAIL,
  APP_STORE_ID,
  APP_VERSION,
} from '../lib/config'

interface Props {
  api: AppApi
  onClose: () => void
  onUpgrade: () => void
}

export function SettingsSheet({ api, onClose, onUpgrade }: Props) {
  const { settings } = api.data
  const { premium, restore } = usePremium()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function doRestore() {
    const ok = await restore()
    setMsg(ok ? '購入を復元しました' : '復元できる購入が見つかりませんでした')
  }

  function contact() {
    const subject = encodeURIComponent('スタンプ習慣 お問い合わせ')
    const body = encodeURIComponent(`\n\n---\nバージョン: ${APP_VERSION}`)
    location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  function rate() {
    if (!APP_STORE_ID) {
      setMsg('公開後にレビューできるようになります')
      return
    }
    location.href = `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
  }

  function doExport() {
    const text = exportData(api.data)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const stamp = new Date().toISOString().slice(0, 10)
    a.download = `habit-stamp-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('データを書き出しました')
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseImport(String(reader.result))
        if (!confirm('現在のデータを上書きします。よろしいですか？')) return
        api.replaceAll(data)
        setMsg('データを読み込みました')
      } catch {
        setMsg('読み込みに失敗しました（ファイル形式をご確認ください）')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const habitCount = api.data.habits.length
  const recordCount = Object.values(api.data.records).reduce((n, a) => n + a.length, 0)

  return (
    <Sheet title="設定" onClose={onClose}>
      <div className="settings">
        <div className="settings__stats">
          <div className="settings__stat">
            <strong>{habitCount}</strong>
            <span>タイトル</span>
          </div>
          <div className="settings__stat">
            <strong>{recordCount}</strong>
            <span>スタンプ</span>
          </div>
        </div>

        {/* プレミアム */}
        {premium ? (
          <div className="premium-card premium-card--owned">
            <span className="premium-card__badge" aria-hidden>✨</span>
            <div className="premium-card__text">
              <strong>プレミアム有効</strong>
              <span>広告は非表示です。応援ありがとうございます！</span>
            </div>
          </div>
        ) : (
          <button className="premium-card" onClick={onUpgrade}>
            <span className="premium-card__badge" aria-hidden>✨</span>
            <div className="premium-card__text">
              <strong>広告を消す（プレミアム）</strong>
              <span>買い切りで、ずっと広告なしに</span>
            </div>
            <span className="premium-card__chev" aria-hidden>›</span>
          </button>
        )}

        <label className="toggle">
          <div className="toggle__text">
            <span className="toggle__label">効果音</span>
            <span className="toggle__desc">ハンコを押した時に音を鳴らす</span>
          </div>
          <input
            type="checkbox"
            className="toggle__input"
            checked={settings.sound}
            onChange={(e) => api.setSettings({ sound: e.target.checked })}
          />
          <span className="toggle__track" aria-hidden />
        </label>

        <div className="settings__group">
          <span className="settings__group-title">データ</span>
          <p className="settings__note">
            記録はこの端末のブラウザ内（localStorage）に保存されます。機種変更やバックアップにはエクスポートをご利用ください。
          </p>
          <div className="settings__buttons">
            <button className="btn btn--soft btn--block" onClick={doExport}>
              ⬇ エクスポート
            </button>
            <button className="btn btn--soft btn--block" onClick={() => fileRef.current?.click()}>
              ⬆ インポート
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              hidden
            />
          </div>
        </div>

        {/* 情報・サポート */}
        <div className="settings__group">
          <span className="settings__group-title">情報・サポート</span>
          <div className="settings__links">
            {!premium && (
              <button className="linkrow" onClick={doRestore}>
                <span>購入を復元</span>
                <span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            <button className="linkrow" onClick={rate}>
              <span>アプリを評価する</span>
              <span className="linkrow__chev" aria-hidden>›</span>
            </button>
            <button className="linkrow" onClick={contact}>
              <span>お問い合わせ</span>
              <span className="linkrow__chev" aria-hidden>›</span>
            </button>
            <a className="linkrow" href={URL_TERMS} target="_blank" rel="noreferrer">
              <span>利用規約</span>
              <span className="linkrow__chev" aria-hidden>›</span>
            </a>
            <a className="linkrow" href={URL_PRIVACY} target="_blank" rel="noreferrer">
              <span>プライバシーポリシー</span>
              <span className="linkrow__chev" aria-hidden>›</span>
            </a>
          </div>
        </div>

        {msg && <p className="settings__msg" role="status">{msg}</p>}

        <p className="settings__version">スタンプ習慣 v{APP_VERSION}</p>
      </div>
    </Sheet>
  )
}
