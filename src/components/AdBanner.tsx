import { useEffect } from 'react'
import { usePremium } from '../lib/usePremium'
import { showBanner, hideBanner } from '../lib/ads'

interface Props {
  onUpgrade: () => void
}

export function AdBanner({ onUpgrade }: Props) {
  const { premium, loading, isNative } = usePremium()

  useEffect(() => {
    // 余白（--ad-h）はネイティブバナーの実測サイズに合わせて ads.ts が更新する。
    if (!isNative || loading) return undefined
    if (premium) {
      void hideBanner()
      return undefined
    }

    void showBanner()
    return () => {
      void hideBanner()
    }
  }, [isNative, loading, premium])

  if (loading || premium) return null
  if (isNative) return null

  return (
    <div className="adbanner" role="complementary" aria-label="広告">
      <span className="adbanner__tag">広告</span>
      <span className="adbanner__text">ここにバナー広告が表示されます（Webはプレビュー）</span>
      <button className="adbanner__remove" onClick={onUpgrade}>
        広告を消す
      </button>
    </div>
  )
}
