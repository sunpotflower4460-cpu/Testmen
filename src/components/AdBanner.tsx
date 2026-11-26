import { useEffect } from 'react'
import { usePremium } from '../lib/usePremium'
import { showBanner, hideBanner } from '../lib/ads'
import { t } from '../lib/i18n'

interface Props {
  onUpgrade: () => void
}

export function AdBanner({ onUpgrade }: Props) {
  const { premium, loading, isNative, monetization } = usePremium()

  useEffect(() => {
    // 余白（--ad-h）はネイティブバナーの実測サイズに合わせて ads.ts が更新する。
    if (!monetization || !isNative || loading) return undefined
    if (premium) {
      void hideBanner()
      return undefined
    }

    void showBanner()
    return () => {
      void hideBanner()
    }
  }, [monetization, isNative, loading, premium])

  if (!monetization || loading || premium) return null
  if (isNative) return null

  return (
    <div className="adbanner" role="complementary" aria-label={t.ads.label}>
      <span className="adbanner__tag">{t.ads.label}</span>
      <span className="adbanner__text">{t.ads.webPlaceholder}</span>
      <button className="adbanner__remove" onClick={onUpgrade}>
        {t.purchase.removeAds}
      </button>
    </div>
  )
}
