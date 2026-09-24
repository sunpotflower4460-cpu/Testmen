import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  initPurchases,
  checkPremium,
  getPremiumPrice,
  buyPremium,
  restorePremium,
  resetDemoPremium,
  watchPremium,
  type PurchaseOutcome,
} from './purchases'
import { isNative } from './platform'
import { MONETIZATION_ENABLED, PREMIUM_PRICE_LABEL } from './config'

interface PremiumState {
  premium: boolean
  price: string
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
  const [price, setPrice] = useState(PREMIUM_PRICE_LABEL)
  const [loading, setLoading] = useState(MONETIZATION_ENABLED)

  useEffect(() => {
    if (!MONETIZATION_ENABLED) return undefined
    let alive = true
    let unwatch: (() => void) | null = null
    ;(async () => {
      try {
        await initPurchases()
        const [p, pr] = await Promise.all([checkPremium(), getPremiumPrice()])
        if (!alive) return
        setPremium(p)
        setPrice(pr)
      } finally {
        if (alive) setLoading(false)
      }
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
      value={{ premium, price, loading, isNative: isNative(), monetization: MONETIZATION_ENABLED, purchase, restore, resetDemo }}
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
