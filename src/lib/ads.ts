import { isNative } from './platform'
import { ADMOB_BANNER_IOS, ADMOB_BANNER_TEST } from './config'

export interface AdPrivacyState {
  canRequestAds: boolean
  privacyOptionsRequired: boolean
}

const EMPTY_PRIVACY_STATE: AdPrivacyState = {
  canRequestAds: false,
  privacyOptionsRequired: false,
}

let preparation: Promise<AdPrivacyState> | null = null
let lastPrivacyState: AdPrivacyState | null = null
// バナーを表示してよい状態か。非表示要求後に遅れて読み込まれた広告を片付けるのに使う。
let bannerWanted = false
let sizeListener: Promise<void> | null = null

/**
 * ネイティブバナーの実測高さを画面下部の余白に反映する。
 * バナーはセーフエリア下端に固定されるため、ホームインジケータ分の余白は
 * タブバーではなくバナーの下に置く（CSSの html.has-ad を参照）。
 */
function applyAdInset(height: number): void {
  const px = Math.max(0, Math.round(height))
  const root = document.documentElement
  root.style.setProperty('--ad-h', `${px}px`)
  root.classList.toggle('has-ad', px > 0)
}

function ensureSizeListener(): Promise<void> {
  if (!sizeListener) {
    sizeListener = (async () => {
      const { AdMob, BannerAdPluginEvents } = await import('@capacitor-community/admob')
      await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
        if (!bannerWanted) {
          applyAdInset(0)
          if (size.height > 0) void AdMob.removeBanner().catch(() => undefined)
          return
        }
        applyAdInset(size.height)
      })
    })().catch((error) => {
      sizeListener = null
      console.warn('AdMob size listener failed', error)
    })
  }
  return sizeListener
}

/** ATT・同意フォームは、アプリがアクティブになる前に要求すると表示されないことがある。 */
async function waitUntilAppActive(): Promise<void> {
  try {
    const { App } = await import('@capacitor/app')
    if ((await App.getState()).isActive) return
    await new Promise<void>((resolve) => {
      const handle = App.addListener('appStateChange', (state) => {
        if (!state.isActive) return
        void handle.then((h) => h.remove())
        resolve()
      })
    })
  } catch {
    // 状態を取得できない場合はそのまま続行する。
  }
}

function requiresPrivacyOptions(status: string): boolean {
  return status === 'REQUIRED'
}

async function prepareAdsInternal(): Promise<AdPrivacyState> {
  const { AdMob } = await import('@capacitor-community/admob')

  await AdMob.initialize({})
  await waitUntilAppActive()

  let consentInfo = await AdMob.requestConsentInfo()
  if (!consentInfo.canRequestAds && consentInfo.isConsentFormAvailable) {
    consentInfo = await AdMob.showConsentForm()
  }

  const state: AdPrivacyState = {
    canRequestAds: consentInfo.canRequestAds,
    privacyOptionsRequired: requiresPrivacyOptions(consentInfo.privacyOptionsRequirementStatus),
  }

  if (state.canRequestAds) {
    try {
      const tracking = await AdMob.trackingAuthorizationStatus()
      if (tracking.status === 'notDetermined') {
        await AdMob.requestTrackingAuthorization()
      }
    } catch {
      // ATTが利用できない／拒否でも一般広告として継続できる。
    }
  }

  lastPrivacyState = state
  return state
}

export async function prepareAds(): Promise<AdPrivacyState> {
  if (!isNative()) return EMPTY_PRIVACY_STATE
  if (!preparation) {
    preparation = prepareAdsInternal().catch((error) => {
      preparation = null
      console.warn('AdMob preparation failed', error)
      return EMPTY_PRIVACY_STATE
    })
  }
  return preparation
}

export async function showBanner(): Promise<boolean> {
  if (!isNative()) return false
  bannerWanted = true
  const privacy = await prepareAds()
  if (!privacy.canRequestAds || !bannerWanted) return false

  try {
    await ensureSizeListener()
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob')
    if (!bannerWanted) return false
    const useTest = !ADMOB_BANNER_IOS
    await AdMob.showBanner({
      adId: ADMOB_BANNER_IOS || ADMOB_BANNER_TEST,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: useTest,
    })
    return true
  } catch (error) {
    console.warn('showBanner failed', error)
    return false
  }
}

export async function hideBanner(): Promise<void> {
  if (!isNative()) return
  bannerWanted = false
  applyAdInset(0)
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.removeBanner()
  } catch (error) {
    console.warn('hideBanner failed', error)
  }
}

export async function getAdPrivacyState(): Promise<AdPrivacyState> {
  if (!isNative()) return EMPTY_PRIVACY_STATE
  return lastPrivacyState ?? prepareAds()
}

export async function showAdPrivacyOptions(): Promise<AdPrivacyState> {
  if (!isNative()) return EMPTY_PRIVACY_STATE
  const current = await prepareAds()
  if (!current.privacyOptionsRequired) return current

  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.showPrivacyOptionsForm()
    const consentInfo = await AdMob.requestConsentInfo()
    const next: AdPrivacyState = {
      canRequestAds: consentInfo.canRequestAds,
      privacyOptionsRequired: requiresPrivacyOptions(consentInfo.privacyOptionsRequirementStatus),
    }
    lastPrivacyState = next
    preparation = Promise.resolve(next)
    return next
  } catch (error) {
    console.warn('showPrivacyOptionsForm failed', error)
    return current
  }
}
