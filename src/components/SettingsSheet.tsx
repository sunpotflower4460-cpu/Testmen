import { useEffect, useRef, useState } from 'react'
import type { AppApi } from '../lib/useAppData'
import { Sheet } from './Sheet'
import { exportData, parseImport } from '../lib/storage'
import { toKey } from '../lib/date'
import { usePremium } from '../lib/usePremium'
import { getAdPrivacyState, hideBanner, showAdPrivacyOptions, showBanner } from '../lib/ads'
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

type BusyAction = 'restore' | 'privacy' | 'export' | 'import' | null
const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export function SettingsSheet({ api, onClose, onUpgrade }: Props) {
  const { settings } = api.data
  const { premium, restore, isNative, loading } = usePremium()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false)
  const [busy, setBusy] = useState<BusyAction>(null)

  useEffect(() => {
    let active = true
    if (!isNative || premium || loading) {
      setPrivacyOptionsRequired(false)
      return undefined
    }

    void getAdPrivacyState().then((state) => {
      if (active) setPrivacyOptionsRequired(state.privacyOptionsRequired)
    })

    return () => {
      active = false
    }
  }, [isNative, loading, premium])

  async function doRestore() {
    if (busy) return
    setBusy('restore')
    setMsg(null)
    try {
      const ok = await restore()
      setMsg(ok ? '購入を復元しました' : '復元できる購入が見つかりませんでした')
    } finally {
      setBusy(null)
    }
  }

  async function manageAdPrivacy() {
    if (busy) return
    setBusy('privacy')
    setMsg(null)
    try {
      const state = await showAdPrivacyOptions()
      setPrivacyOptionsRequired(state.privacyOptionsRequired)

      if (state.canRequestAds) {
        const shown = await showBanner()
        document.documentElement.style.setProperty('--ad-h', shown ? '60px' : '0px')
      } else {
        await hideBanner()
        document.documentElement.style.setProperty('--ad-h', '0px')
      }

      setMsg('広告のプライバシー設定を更新しました')
    } finally {
      setBusy(null)
    }
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

  function clickDownload(href: string, filename: string, revoke?: string) {
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    if (revoke) window.setTimeout(() => URL.revokeObjectURL(revoke), 1000)
  }

  async function doExport() {
    if (busy) return
    setBusy('export')
    setMsg(null)

    const text = exportData(api.data)
    const filename = `habit-stamp-${toKey(new Date())}.json`

    try {
      if (isNative) {
        const file = new File([text], filename, { type: 'application/json' })
        if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: 'スタンプ習慣 バックアップ',
              files: [file],
            })
            setMsg('データを書き出しました')
            return
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              setMsg('書き出しをキャンセルしました')
              return
            }
          }
        }

        // iOS 15〜17.2のWKWebViewではblob:のdownloadが失敗するためdata URLを使う。
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(text)}`
        clickDownload(dataUrl, filename)
      } else {
        const blob = new Blob([text], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        clickDownload(url, filename, url)
      }
      setMsg('データを書き出しました')
    } catch {
      setMsg('データの書き出しに失敗しました')
    } finally {
      setBusy(null)
    }
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || busy) return
    if (file.size > MAX_IMPORT_BYTES) {
      setMsg('ファイルが大きすぎます（5MB以下のJSONをご利用ください）')
      return
    }

    setBusy('import')
    setMsg(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseImport(String(reader.result))
        if (!confirm('現在のデータを上書きします。よろしいですか？')) {
          setMsg('読み込みをキャンセルしました')
          return
        }
        api.replaceAll(data)
        setMsg('データを読み込みました')
      } catch (error) {
        setMsg(error instanceof Error ? error.message : '読み込みに失敗しました')
      } finally {
        setBusy(null)
      }
    }
    reader.onerror = () => {
      setBusy(null)
      setMsg('ファイルを読み取れませんでした')
    }
    reader.onabort = () => {
      setBusy(null)
      setMsg('読み込みをキャンセルしました')
    }
    reader.readAsText(file)
  }

  const habitCount = api.data.habits.length
  const recordCount = Object.values(api.data.records).reduce((count, dates) => count + dates.length, 0)

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

        {premium ? (
          <div className="premium-card premium-card--owned">
            <span className="premium-card__badge" aria-hidden>✨</span>
            <div className="premium-card__text">
              <strong>プレミアム有効</strong>
              <span>広告は非表示です。応援ありがとうございます！</span>
            </div>
          </div>
        ) : (
          <button className="premium-card" onClick={onUpgrade} disabled={busy !== null}>
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
            onChange={(event) => api.setSettings({ sound: event.target.checked })}
          />
          <span className="toggle__track" aria-hidden />
        </label>

        <div className="settings__group">
          <span className="settings__group-title">データ</span>
          <p className="settings__note">
            記録は{isNative ? 'この端末内' : 'このブラウザ内'}に保存されます。機種変更やバックアップにはエクスポートをご利用ください。
          </p>
          <div className="settings__buttons">
            <button className="btn btn--soft btn--block" onClick={doExport} disabled={busy !== null}>
              {busy === 'export' ? '書き出し中…' : '⬇ エクスポート'}
            </button>
            <button className="btn btn--soft btn--block" onClick={() => fileRef.current?.click()} disabled={busy !== null}>
              {busy === 'import' ? '読み込み中…' : '⬆ インポート'}
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} hidden />
          </div>
        </div>

        <div className="settings__group">
          <span className="settings__group-title">情報・サポート</span>
          <div className="settings__links">
            {!premium && (
              <button className="linkrow" onClick={doRestore} disabled={busy !== null}>
                <span>{busy === 'restore' ? '購入を確認中…' : '購入を復元'}</span><span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            {privacyOptionsRequired && !premium && (
              <button className="linkrow" onClick={manageAdPrivacy} disabled={busy !== null}>
                <span>{busy === 'privacy' ? '設定を確認中…' : '広告のプライバシー設定'}</span><span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            <button className="linkrow" onClick={rate} disabled={busy !== null}>
              <span>アプリを評価する</span><span className="linkrow__chev" aria-hidden>›</span>
            </button>
            <button className="linkrow" onClick={contact} disabled={busy !== null}>
              <span>お問い合わせ</span><span className="linkrow__chev" aria-hidden>›</span>
            </button>
            <a className="linkrow" href={URL_TERMS} target="_blank" rel="noreferrer">
              <span>利用規約</span><span className="linkrow__chev" aria-hidden>›</span>
            </a>
            <a className="linkrow" href={URL_PRIVACY} target="_blank" rel="noreferrer">
              <span>プライバシーポリシー</span><span className="linkrow__chev" aria-hidden>›</span>
            </a>
          </div>
        </div>

        {msg && <p className="settings__msg" role="status">{msg}</p>}
        <p className="settings__version">スタンプ習慣 v{APP_VERSION}</p>
      </div>
    </Sheet>
  )
}
