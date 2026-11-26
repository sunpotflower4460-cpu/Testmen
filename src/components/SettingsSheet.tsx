import { useEffect, useRef, useState } from 'react'
import type { AppApi } from '../lib/useAppData'
import { Sheet } from './Sheet'
import { LegalLink } from './LegalLink'
import { exportData, parseImport } from '../lib/storage'
import { toKey } from '../lib/date'
import { DICTIONARIES, LANGUAGE_NAMES, lang, setLanguageSetting, t, type Lang, type LangSetting } from '../lib/i18n'
import { useLanguage } from '../lib/useLanguage'
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
  const { premium, price, restore, isNative, loading, monetization } = usePremium()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false)
  const [busy, setBusy] = useState<BusyAction>(null)
  const { setting: languageSetting } = useLanguage()

  useEffect(() => {
    let active = true
    if (!monetization || !isNative || premium || loading) {
      setPrivacyOptionsRequired(false)
      return undefined
    }

    void getAdPrivacyState().then((state) => {
      if (active) setPrivacyOptionsRequired(state.privacyOptionsRequired)
    })

    return () => {
      active = false
    }
  }, [monetization, isNative, loading, premium])

  async function doRestore() {
    if (busy) return
    setBusy('restore')
    setMsg(null)
    try {
      const ok = await restore()
      setMsg(ok ? t.purchase.restored : t.purchase.nothingToRestore)
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

      if (state.canRequestAds) await showBanner()
      else await hideBanner()

      setMsg(t.settings.adPrivacyUpdated)
    } finally {
      setBusy(null)
    }
  }

  function changeLanguage(next: LangSetting) {
    // 直前の操作結果は前の言語のままになるので消す。
    setMsg(null)
    setLanguageSetting(next)
  }

  function contact() {
    const subject = encodeURIComponent(t.settings.mailSubject)
    const body = encodeURIComponent(`\n\n---\n${t.settings.mailVersion(APP_VERSION)}`)
    location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  function rate() {
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
              title: t.settings.backupShareTitle,
              files: [file],
            })
            setMsg(t.settings.exported)
            return
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              setMsg(t.settings.exportCancelled)
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
      setMsg(t.settings.exported)
    } catch {
      setMsg(t.settings.exportFailed)
    } finally {
      setBusy(null)
    }
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || busy) return
    if (file.size > MAX_IMPORT_BYTES) {
      setMsg(t.settings.fileTooLarge)
      return
    }

    setBusy('import')
    setMsg(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = parseImport(String(reader.result))
        if (!confirm(t.settings.overwriteConfirm)) {
          setMsg(t.settings.importCancelled)
          return
        }
        api.replaceAll(data)
        setMsg(t.settings.imported)
      } catch (error) {
        setMsg(error instanceof Error ? error.message : t.settings.importFailed)
      } finally {
        setBusy(null)
      }
    }
    reader.onerror = () => {
      setBusy(null)
      setMsg(t.settings.fileUnreadable)
    }
    reader.onabort = () => {
      setBusy(null)
      setMsg(t.settings.importCancelled)
    }
    reader.readAsText(file)
  }

  const habitCount = api.data.habits.length
  const recordCount = Object.values(api.data.records).reduce((count, dates) => count + dates.length, 0)

  return (
    <Sheet title={t.settings.title} onClose={onClose}>
      <div className="settings">
        <div className="settings__stats">
          <div className="settings__stat">
            <strong>{habitCount}</strong>
            <span>{t.settings.habits}</span>
          </div>
          <div className="settings__stat">
            <strong>{recordCount}</strong>
            <span>{t.settings.stamps}</span>
          </div>
        </div>

        {!monetization ? null : premium ? (
          <div className="premium-card premium-card--owned">
            <span className="premium-card__badge" aria-hidden>✨</span>
            <div className="premium-card__text">
              <strong>{t.settings.premiumActive}</strong>
              <span>{t.settings.premiumThanks}</span>
            </div>
          </div>
        ) : (
          <button className="premium-card" onClick={onUpgrade} disabled={busy !== null}>
            <span className="premium-card__badge" aria-hidden>✨</span>
            <div className="premium-card__text">
              <strong>{price ? t.purchase.removeAdsWithPrice(price) : t.purchase.removeAds}</strong>
              <span>{t.settings.removeAdsHint}</span>
            </div>
            <span className="premium-card__chev" aria-hidden>›</span>
          </button>
        )}

        <label className="toggle">
          <div className="toggle__text">
            <span className="toggle__label">{t.settings.sound}</span>
            <span className="toggle__desc">{t.settings.soundHint}</span>
          </div>
          <input
            type="checkbox"
            className="toggle__input"
            checked={settings.sound}
            onChange={(event) => api.setSettings({ sound: event.target.checked })}
          />
          <span className="toggle__track" aria-hidden />
        </label>

        <label className="settings__group">
          {/* 読めない言語になっていても探せるように、地球の記号と英語名を添える */}
          <span className="settings__group-title">
            <span aria-hidden>🌐 </span>
            {t.settings.language}
            {t.settings.language !== DICTIONARIES.en.settings.language && ` / ${DICTIONARIES.en.settings.language}`}
          </span>
          <select
            className="field__input settings__select"
            value={languageSetting}
            onChange={(event) => changeLanguage(event.target.value as LangSetting)}
            disabled={busy !== null}
          >
            <option value="auto">{t.settings.languageAuto}</option>
            {(Object.keys(LANGUAGE_NAMES) as Lang[]).map((code) => (
              <option key={code} value={code} lang={code}>
                {LANGUAGE_NAMES[code]}
              </option>
            ))}
          </select>
        </label>

        <div className="settings__group">
          <span className="settings__group-title">{t.settings.data}</span>
          <p className="settings__note">
            {isNative ? t.settings.dataNoteDevice : t.settings.dataNoteBrowser}
          </p>
          <div className="settings__buttons">
            <button className="btn btn--soft btn--block" onClick={doExport} disabled={busy !== null}>
              {busy === 'export' ? t.settings.exporting : t.settings.export}
            </button>
            <button className="btn btn--soft btn--block" onClick={() => fileRef.current?.click()} disabled={busy !== null}>
              {busy === 'import' ? t.settings.importing : t.settings.import}
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} hidden />
          </div>
        </div>

        <div className="settings__group">
          <span className="settings__group-title">{t.settings.support}</span>
          <div className="settings__links">
            {monetization && !premium && (
              <button className="linkrow" onClick={doRestore} disabled={busy !== null}>
                <span>{busy === 'restore' ? t.settings.restoring : t.purchase.restore}</span><span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            {privacyOptionsRequired && !premium && (
              <button className="linkrow" onClick={manageAdPrivacy} disabled={busy !== null}>
                <span>{busy === 'privacy' ? t.settings.adPrivacyChecking : t.settings.adPrivacy}</span><span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            {/* 公開前は評価ページが存在しないため出さない（審査で「未完成の機能」と見なされるのを避ける） */}
            {APP_STORE_ID && (
              <button className="linkrow" onClick={rate} disabled={busy !== null}>
                <span>{t.settings.rate}</span><span className="linkrow__chev" aria-hidden>›</span>
              </button>
            )}
            <button className="linkrow" onClick={contact} disabled={busy !== null}>
              <span>{t.settings.contact}</span><span className="linkrow__chev" aria-hidden>›</span>
            </button>
            <LegalLink className="linkrow" href={URL_TERMS[lang]} title={t.settings.terms}>
              <span>{t.settings.terms}</span><span className="linkrow__chev" aria-hidden>›</span>
            </LegalLink>
            <LegalLink className="linkrow" href={URL_PRIVACY[lang]} title={t.settings.privacy}>
              <span>{t.settings.privacy}</span><span className="linkrow__chev" aria-hidden>›</span>
            </LegalLink>
          </div>
        </div>

        {msg && <p className="settings__msg" role="status">{msg}</p>}
        <p className="settings__version">{t.appName} v{APP_VERSION}</p>
      </div>
    </Sheet>
  )
}
