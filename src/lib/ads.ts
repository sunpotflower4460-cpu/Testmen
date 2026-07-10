// ============================================================
//  広告サービス（Google AdMob）
//  - ネイティブ(iOS): 画面下部にバナーを表示
//  - Web: 何もしない（プレビュー用のダミー枠は AdBanner が描画）
// ============================================================
import { isNative } from './platform'
import { ADMOB_BANNER_IOS, ADMOB_BANNER_TEST } from './config'

let initialized = false

/** AdMob 初期化 ＋ ATT（トラッキング許可）リクエスト。ネイティブのみ。 */
export async function initAds(): Promise<void> {
  if (!isNative() || initialized) return
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.initialize({})
    // iOS14.5+ のトラッキング許可ダイアログ（広告のパーソナライズに必要）
    try {
      await AdMob.requestTrackingAuthorization()
    } catch {
      // 許可なしでも非パーソナライズ広告で継続
    }
    initialized = true
  } catch (e) {
    console.warn('AdMob init failed', e)
  }
}

/** バナーを表示。ネイティブのみ。 */
export async function showBanner(): Promise<void> {
  if (!isNative()) return
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import(
      '@capacitor-community/admob'
    )
    const useTest = !ADMOB_BANNER_IOS
    await AdMob.showBanner({
      adId: ADMOB_BANNER_IOS || ADMOB_BANNER_TEST,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: useTest,
    })
  } catch (e) {
    console.warn('showBanner failed', e)
  }
}

/** バナーを消す（購入後など）。ネイティブのみ。 */
export async function hideBanner(): Promise<void> {
  if (!isNative()) return
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.removeBanner()
  } catch (e) {
    console.warn('hideBanner failed', e)
  }
}
