import { isNative } from './platform'
import {
  REVENUECAT_IOS_API_KEY,
  ENTITLEMENT_PREMIUM,
  PRODUCT_REMOVE_ADS,
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

function hasRevenueCatConfiguration(): boolean {
  return (
    REVENUECAT_IOS_API_KEY.startsWith('appl_') &&
    !REVENUECAT_IOS_API_KEY.includes('XXX') &&
    REVENUECAT_IOS_API_KEY.length > 12
  )
}

let configured = false
let configuring: Promise<void> | null = null

export async function initPurchases(): Promise<void> {
  if (!isNative() || configured) return
  if (!hasRevenueCatConfiguration()) {
    console.warn('RevenueCat is not configured. Set REVENUECAT_IOS_API_KEY before release.')
    return
  }
  if (!configuring) {
    configuring = (async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY })
      configured = true
    })().catch((error) => {
      configuring = null
      console.warn('RevenueCat init failed', error)
    })
  }
  await configuring
}

async function getPremiumPackage() {
  await initPurchases()
  if (!configured) return null

  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  const offerings = await Purchases.getOfferings()
  const current = offerings.current
  if (!current) return null

  if (current.lifetime?.product.identifier === PRODUCT_REMOVE_ADS) {
    return current.lifetime
  }

  return current.availablePackages.find(
    (item) => item.product.identifier === PRODUCT_REMOVE_ADS,
  ) ?? null
}

export async function checkPremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    await initPurchases()
    if (!configured) return false
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined
  } catch (error) {
    console.warn('checkPremium failed', error)
    return false
  }
}

export async function getPremiumPrice(): Promise<string> {
  if (!isNative()) return PREMIUM_PRICE_LABEL
  try {
    const pkg = await getPremiumPackage()
    return pkg?.product.priceString ?? PREMIUM_PRICE_LABEL
  } catch (error) {
    console.warn('getPremiumPrice failed', error)
    return PREMIUM_PRICE_LABEL
  }
}

export type PurchaseOutcome = 'success' | 'cancelled' | 'error'

export async function buyPremium(): Promise<PurchaseOutcome> {
  if (!isNative()) {
    setDemoPremium(true)
    return 'success'
  }
  try {
    const pkg = await getPremiumPackage()
    if (!pkg) return 'error'
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] ? 'success' : 'error'
  } catch (error: unknown) {
    const err = error as { code?: string; userCancelled?: boolean }
    if (err?.userCancelled || err?.code === 'PURCHASE_CANCELLED') return 'cancelled'
    console.warn('buyPremium failed', error)
    return 'error'
  }
}

export async function restorePremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    await initPurchases()
    if (!configured) return false
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const { customerInfo } = await Purchases.restorePurchases()
    return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined
  } catch (error) {
    console.warn('restorePremium failed', error)
    return false
  }
}

export async function resetDemoPremium(): Promise<void> {
  if (!isNative()) setDemoPremium(false)
}
