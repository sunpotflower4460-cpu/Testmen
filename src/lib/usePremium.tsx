import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  checkPremium,
  getPremiumPrice,
  buyPremium,
  restorePremium,
  resetDemoPremium,
  watchPremium,
  type PurchaseOutcome,
} from './purchases'
import { isNative } from './platform'
import { MONETIZATION_ENABLED, WEB_PREVIEW_PRICE_LABEL } from './config'

interface PremiumState {
  premium: boolean
  /** App Store の価格表示。まだ取得できていない場合は null */
  price: string | null
  /** 価格を取得できていない場合に取り直す */
  refreshPrice: () => void
  loading: boolean
  isNative: boolean
  /** 広告・課金を提供しているか（config.ts の MONETIZATION_ENABLED） */
  monetization: boolean
  purchase: () => Promise<PurchaseOutcome>
  restore: () => Promise<boolean>
  /** Webデモ専用：プレミアムを解除して再確認できるように */
  resetDemo: () => Promise<void>
}

const Ctx = createContext<PremiumState | null>(null)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [premium, setPremium] = useState(false)
  const [price, setPrice] = useState<string | null>(() => (isNative() ? null : WEB_PREVIEW_PRICE_LABEL))
  const [loading, setLoading] = useState(MONETIZATION_ENABLED)

  useEffect(() => {
    if (!MONETIZATION_ENABLED) return undefined
    let alive = true
    let unwatch: (() => void) | null = null
    ;(async () => {
      // 購入状態は端末内の権利情報だけで先に確定させ、広告の表示可否をすぐ決める。
      // 価格の取得（通信あり）は待たない。
      try {
        const p = await checkPremium()
        if (alive) setPremium(p)
      } finally {
        if (alive) setLoading(false)
      }
      void getPremiumPrice().then((pr) => {
        if (alive && pr) setPrice(pr)
      })
      const stop = await watchPremium((next) => {
        if (alive) setPremium(next)
      })
      if (alive) unwatch = stop
      else stop()
    })()
    return () => {
      alive = false
      unwatch?.()
    }
  }, [])

  const refreshPrice = useCallback(() => {
    if (!MONETIZATION_ENABLED) return
    void getPremiumPrice().then((pr) => {
      if (pr) setPrice(pr)
    })
  }, [])

  const purchase = useCallback(async () => {
    const outcome = await buyPremium()
    if (outcome === 'success') setPremium(true)
    return outcome
  }, [])

  const restore = useCallback(async () => {
    const ok = await restorePremium()
    // 通信失敗などで「見つからない」場合に、購入済みの状態を取り消さない。
    if (ok) setPremium(true)
    return ok
  }, [])

  const resetDemo = useCallback(async () => {
    await resetDemoPremium()
    setPremium(false)
  }, [])

  return (
    <Ctx.Provider
      value={{ premium, price, refreshPrice, loading, isNative: isNative(), monetization: MONETIZATION_ENABLED, purchase, restore, resetDemo }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function usePremium(): PremiumState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider')
  return ctx
}
