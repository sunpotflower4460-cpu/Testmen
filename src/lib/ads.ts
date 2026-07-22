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

async function prepareAdsInternal(): Promise<AdPrivacyState> {
  const { AdMob, PrivacyOptionsRequirementStatus } = await import('@capacitor-community/admob')

  await AdMob.initialize({})

  let consentInfo = await AdMob.requestConsentInfo()
  if (!consentInfo.canRequestAds && consentInfo.isConsentFormAvailable) {
    consentInfo = await AdMob.showConsentForm()
  }

  const state: AdPrivacyState = {
    canRequestAds: consentInfo.canRequestAds,
    privacyOptionsRequired:
      consentInfo.privacyOptionsRequirementStatus === PrivacyOptionsRequirementStatus.REQUIRED,
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
  const privacy = await prepareAds()
  if (!privacy.canRequestAds) return false

  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob')
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
    const { AdMob, PrivacyOptionsRequirementStatus } = await import('@capacitor-community/admob')
    await AdMob.showPrivacyOptionsForm()
    const consentInfo = await AdMob.requestConsentInfo()
    const next: AdPrivacyState = {
      canRequestAds: consentInfo.canRequestAds,
      privacyOptionsRequired:
        consentInfo.privacyOptionsRequirementStatus === PrivacyOptionsRequirementStatus.REQUIRED,
    }
    lastPrivacyState = next
    preparation = Promise.resolve(next)
    return next
  } catch (error) {
    console.warn('showPrivacyOptionsForm failed', error)
    return current
  }
}
