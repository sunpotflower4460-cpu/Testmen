import { useEffect } from 'react'
import { usePremium } from '../lib/usePremium'
import { showBanner, hideBanner } from '../lib/ads'

interface Props {
  onUpgrade: () => void
}

/**
 * 広告枠。
 * - プレミアム時は一切表示しない。
 * - ネイティブ: 画面下に実際の AdMob バナーを出し、DOM側は高さ分を確保。
 * - Web: 実広告は出せないため、レイアウト確認用のプレビュー枠を表示。
 */
export function AdBanner({ onUpgrade }: Props) {
  const { premium, isNative } = usePremium()

  useEffect(() => {
    if (isNative && !premium) {
      showBanner()
      document.documentElement.style.setProperty('--ad-h', '60px')
      return () => {
        hideBanner()
        document.documentElement.style.setProperty('--ad-h', '0px')
      }
    }
    document.documentElement.style.setProperty('--ad-h', '0px')
    return undefined
  }, [isNative, premium])

  if (premium) return null

  // ネイティブでは実バナーが下部オーバーレイで表示されるため、DOMには何も出さない
  if (isNative) return null

  // Web プレビュー用のダミー枠
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
