// ============================================================
//  課金サービス
//  - ネイティブ(iOS): RevenueCat 経由で実際に購入/復元
//  - Web(ブラウザ): ストアが無いため「デモ」動作（localStorageで疑似的に解放）
//    → 課金フローとプレミアム表示をブラウザでも確認できるようにするため
// ============================================================
import { isNative } from './platform'
import {
  REVENUECAT_IOS_API_KEY,
  ENTITLEMENT_PREMIUM,
  PREMIUM_PRICE_LABEL,
} from './config'

const DEMO_KEY = 'habit-stamp:premium-demo'

function demoPremium(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}
function setDemoPremium(v: boolean) {
  try {
    localStorage.setItem(DEMO_KEY, v ? '1' : '0')
  } catch {
    // ignore
  }
}

let configured = false

/** RevenueCat の初期化（ネイティブのみ）。Webは何もしない。 */
export async function initPurchases(): Promise<void> {
  if (!isNative() || configured) return
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY })
    configured = true
  } catch (e) {
    console.warn('RevenueCat init failed', e)
  }
}

/** 現在プレミアムかどうか。 */
export async function checkPremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined
  } catch (e) {
    console.warn('checkPremium failed', e)
    return false
  }
}

/** 価格表示用の文字列（ネイティブは実際の価格、Webは設定値）。 */
export async function getPremiumPrice(): Promise<string> {
  if (!isNative()) return PREMIUM_PRICE_LABEL
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const offerings = await Purchases.getOfferings()
    const pkg = offerings.current?.availablePackages?.[0]
    return pkg?.product?.priceString ?? PREMIUM_PRICE_LABEL
  } catch {
    return PREMIUM_PRICE_LABEL
  }
}

export type PurchaseOutcome = 'success' | 'cancelled' | 'error'

/** プレミアム（広告除去）を購入。 */
export async function buyPremium(): Promise<PurchaseOutcome> {
  if (!isNative()) {
    // Webデモ：疑似的に解放
    setDemoPremium(true)
    return 'success'
  }
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const offerings = await Purchases.getOfferings()
    const pkg = offerings.current?.availablePackages?.[0]
    if (!pkg) return 'error'
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] ? 'success' : 'error'
  } catch (e: unknown) {
    const err = e as { code?: string; userCancelled?: boolean }
    if (err?.userCancelled || err?.code === 'PURCHASE_CANCELLED') return 'cancelled'
    console.warn('buyPremium failed', e)
    return 'error'
  }
}

/** 購入の復元。 */
export async function restorePremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.restorePurchases()
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined
  } catch (e) {
    console.warn('restorePremium failed', e)
    return false
  }
}

/** （デバッグ用）Webデモのプレミアムを解除。 */
export async function resetDemoPremium(): Promise<void> {
  if (!isNative()) setDemoPremium(false)
}
