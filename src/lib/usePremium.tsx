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
  type PurchaseOutcome,
} from './purchases'
import { isNative } from './platform'
import { PREMIUM_PRICE_LABEL } from './config'

interface PremiumState {
  premium: boolean
  price: string
  loading: boolean
  isNative: boolean
  purchase: () => Promise<PurchaseOutcome>
  restore: () => Promise<boolean>
  /** Webデモ専用：プレミアムを解除して再確認できるように */
  resetDemo: () => Promise<void>
}

const Ctx = createContext<PremiumState | null>(null)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [premium, setPremium] = useState(false)
  const [price, setPrice] = useState(PREMIUM_PRICE_LABEL)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      await initPurchases()
      const [p, pr] = await Promise.all([checkPremium(), getPremiumPrice()])
      if (!alive) return
      setPremium(p)
      setPrice(pr)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const purchase = useCallback(async () => {
    const outcome = await buyPremium()
    if (outcome === 'success') setPremium(true)
    return outcome
  }, [])

  const restore = useCallback(async () => {
    const ok = await restorePremium()
    setPremium(ok)
    return ok
  }, [])

  const resetDemo = useCallback(async () => {
    await resetDemoPremium()
    setPremium(false)
  }, [])

  return (
    <Ctx.Provider
      value={{ premium, price, loading, isNative: isNative(), purchase, restore, resetDemo }}
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
