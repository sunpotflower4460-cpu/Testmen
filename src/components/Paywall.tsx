import { useState } from 'react'
import { Sheet } from './Sheet'
import { usePremium } from '../lib/usePremium'
import { URL_PRIVACY, URL_TERMS } from '../lib/config'

interface Props {
  onClose: () => void
}

export function Paywall({ onClose }: Props) {
  const { premium, price, purchase, restore, isNative } = usePremium()
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function onBuy() {
    setBusy('buy')
    setMsg(null)
    const r = await purchase()
    setBusy(null)
    if (r === 'success') setMsg('ありがとうございます！広告を非表示にしました🎉')
    else if (r === 'cancelled') setMsg('購入をキャンセルしました')
    else setMsg('購入を完了できませんでした。時間をおいて再度お試しください。')
  }

  async function onRestore() {
    setBusy('restore')
    setMsg(null)
    const ok = await restore()
    setBusy(null)
    setMsg(ok ? '購入を復元しました' : '復元できる購入が見つかりませんでした')
  }

  return (
    <Sheet title="広告を消す" onClose={onClose}>
      <div className="paywall">
        <div className="paywall__hero">
          <div className="paywall__badge" aria-hidden>✨</div>
          <h3 className="paywall__title">スタンプ習慣 プレミアム</h3>
          <p className="paywall__sub">一度の購入で、ずっと広告なし</p>
        </div>

        <ul className="paywall__features">
          <li><span aria-hidden>🚫</span> すべての広告を非表示</li>
          <li><span aria-hidden>⚡</span> すっきり集中できる画面</li>
          <li><span aria-hidden>💛</span> 開発を応援できます</li>
        </ul>

        <div className="paywall__price">
          <span className="paywall__price-num">{price}</span>
          <span className="paywall__price-note">買い切り・追加課金なし</span>
        </div>

        {premium ? (
          <div className="paywall__owned">✓ 購入済みです。ありがとうございます！</div>
        ) : (
          <button className="btn btn--primary btn--lg btn--block" onClick={onBuy} disabled={busy !== null}>
            {busy === 'buy' ? '処理中…' : `${price} で広告を消す`}
          </button>
        )}

        <button className="btn btn--soft btn--block" onClick={onRestore} disabled={busy !== null}>
          {busy === 'restore' ? '確認中…' : '購入を復元'}
        </button>

        {msg && <p className="paywall__msg" role="status">{msg}</p>}

        {!isNative && (
          <p className="paywall__demo">
            ※ Web版は動作プレビューです。実際の課金は iOS アプリ版で行われます。
          </p>
        )}

        <p className="paywall__legal">
          購入すると
          <a href={URL_TERMS} target="_blank" rel="noreferrer">利用規約</a>
          と
          <a href={URL_PRIVACY} target="_blank" rel="noreferrer">プライバシーポリシー</a>
          に同意したものとみなされます。支払いは Apple ID に請求されます。
        </p>
      </div>
    </Sheet>
  )
}
