import { useEffect, useState } from 'react'
import { Sheet } from './Sheet'
import { usePremium } from '../lib/usePremium'
import { URL_PRIVACY, URL_TERMS } from '../lib/config'
import { LegalLink } from './LegalLink'
import { lang, t } from '../lib/i18n'

interface Props {
  onClose: () => void
}

export function Paywall({ onClose }: Props) {
  const { premium, price, refreshPrice, purchase, restore, isNative } = usePremium()
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  // 起動時にオフラインだった場合などは、この画面を開いた時にもう一度価格を取りに行く。
  useEffect(() => {
    if (!price) refreshPrice()
  }, [price, refreshPrice])

  async function onBuy() {
    setBusy('buy')
    setMsg(null)
    const r = await purchase()
    setBusy(null)
    if (r === 'success') setMsg(t.purchase.success)
    else if (r === 'cancelled') setMsg(t.purchase.cancelled)
    else if (r === 'pending') setMsg(t.purchase.pending)
    else setMsg(t.purchase.failed)
  }

  async function onRestore() {
    setBusy('restore')
    setMsg(null)
    const ok = await restore()
    setBusy(null)
    setMsg(ok ? t.purchase.restored : t.purchase.nothingToRestore)
  }

  return (
    <Sheet title={t.purchase.removeAds} onClose={onClose}>
      <div className="paywall">
        <div className="paywall__hero">
          <div className="paywall__badge" aria-hidden>✨</div>
          <h3 className="paywall__title">{t.purchase.premiumName}</h3>
          <p className="paywall__sub">{t.purchase.tagline}</p>
        </div>

        <ul className="paywall__features">
          <li><span aria-hidden>🚫</span> {t.purchase.featureNoAds}</li>
          <li><span aria-hidden>⚡</span> {t.purchase.featureFocus}</li>
          <li><span aria-hidden>💛</span> {t.purchase.featureSupport}</li>
        </ul>

        <div className="paywall__price">
          {price && <span className="paywall__price-num">{price}</span>}
          <span className="paywall__price-note">{t.purchase.oneTime}</span>
        </div>

        {premium ? (
          <div className="paywall__owned">{t.purchase.owned}</div>
        ) : (
          <button className="btn btn--primary btn--lg btn--block" onClick={onBuy} disabled={busy !== null}>
            {busy === 'buy' ? t.purchase.processing : price ? t.purchase.buyFor(price) : t.purchase.removeAds}
          </button>
        )}

        <button className="btn btn--soft btn--block" onClick={onRestore} disabled={busy !== null}>
          {busy === 'restore' ? t.purchase.checking : t.purchase.restore}
        </button>

        {msg && <p className="paywall__msg" role="status">{msg}</p>}

        {!isNative && (
          <p className="paywall__demo">
            {t.purchase.webPreview}
          </p>
        )}

        <p className="paywall__legal">
          {t.purchase.agreePrefix}
          <LegalLink href={URL_TERMS[lang]} title={t.settings.terms}>{t.settings.terms}</LegalLink>
          {t.purchase.agreeBetween}
          <LegalLink href={URL_PRIVACY[lang]} title={t.settings.privacy}>{t.settings.privacy}</LegalLink>
          {t.purchase.agreeSuffix}
        </p>
      </div>
    </Sheet>
  )
}
