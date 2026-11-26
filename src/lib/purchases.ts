import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { isNative } from './platform'
import { PRODUCT_REMOVE_ADS, WEB_PREVIEW_PRICE_LABEL } from './config'

// ネイティブ実装: ios/App/App/StampPurchasesPlugin.swift（StoreKit 2）
export type PurchaseOutcome = 'success' | 'cancelled' | 'pending' | 'error'

interface StampPurchasesPlugin {
  getProduct(options: { productId: string }): Promise<{
    found: boolean
    displayPrice?: string
    displayName?: string
  }>
  isPurchased(options: { productId: string }): Promise<{ purchased: boolean }>
  purchase(options: { productId: string }): Promise<{ status: PurchaseOutcome; message?: string }>
  restore(options: { productId: string }): Promise<{ purchased: boolean }>
  addListener(
    eventName: 'premiumChanged',
    listener: (event: { productId: string; purchased: boolean }) => void,
  ): Promise<PluginListenerHandle>
}

const StampPurchases = registerPlugin<StampPurchasesPlugin>('StampPurchases')

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

const options = { productId: PRODUCT_REMOVE_ADS }

/** 起動時の購入状態確認。端末内の権利情報だけを見るので通信不要。失敗時は未購入扱い。 */
export async function checkPremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    const { purchased } = await StampPurchases.isPurchased(options)
    return purchased
  } catch (error) {
    console.warn('checkPremium failed', error)
    return false
  }
}

/** App Store から取得した、利用者の国の通貨での価格。取得できない場合は null。 */
export async function getPremiumPrice(): Promise<string | null> {
  if (!isNative()) return WEB_PREVIEW_PRICE_LABEL
  try {
    const product = await StampPurchases.getProduct(options)
    return product.found && product.displayPrice ? product.displayPrice : null
  } catch (error) {
    console.warn('getPremiumPrice failed', error)
    return null
  }
}

export async function buyPremium(): Promise<PurchaseOutcome> {
  if (!isNative()) {
    setDemoPremium(true)
    return 'success'
  }
  try {
    const { status, message } = await StampPurchases.purchase(options)
    if (status === 'error') console.warn('buyPremium failed', message)
    return status
  } catch (error) {
    console.warn('buyPremium failed', error)
    return 'error'
  }
}

export async function restorePremium(): Promise<boolean> {
  if (!isNative()) return demoPremium()
  try {
    const { purchased } = await StampPurchases.restore(options)
    return purchased
  } catch (error) {
    console.warn('restorePremium failed', error)
    return false
  }
}

/**
 * 購入状態の変化（家族共有・返金・「承認と購入のリクエスト」の承認等）を購読する。
 * 戻り値で購読を解除できる。
 */
export async function watchPremium(onChange: (premium: boolean) => void): Promise<() => void> {
  if (!isNative()) return () => undefined
  try {
    const handle = await StampPurchases.addListener('premiumChanged', (event) => {
      if (event.productId === PRODUCT_REMOVE_ADS) onChange(event.purchased)
    })
    return () => {
      void handle.remove().catch(() => undefined)
    }
  } catch (error) {
    console.warn('watchPremium failed', error)
    return () => undefined
  }
}

export async function resetDemoPremium(): Promise<void> {
  if (!isNative()) setDemoPremium(false)
}
