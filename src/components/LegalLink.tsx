import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isNative } from '../lib/platform'

interface Props {
  href: string
  title: string
  className?: string
  children: ReactNode
}

/**
 * 利用規約・プライバシーポリシーへのリンク。
 * iOSアプリ内では target="_blank" の同梱ページを開けない（Capacitorが外部アプリへ渡すため）ので、
 * ネイティブではアプリ内ビューアで表示する。Webでは通常どおり新しいタブで開く。
 */
export function LegalLink({ href, title, className, children }: Props) {
  const [open, setOpen] = useState(false)

  if (!isNative()) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    )
  }

  return (
    <>
      <a
        className={className}
        href={href}
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        {children}
      </a>
      {open && createPortal(<LegalViewer href={href} title={title} onClose={() => setOpen(false)} />, document.body)}
    </>
  )
}

function LegalViewer({ href, title, onClose }: { href: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    // 下にあるシートのEscハンドラより先に処理し、ビューアだけを閉じる。
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onCloseRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prevFocus?.focus?.()
    }
  }, [])

  return (
    <div className="legal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="legal__head">
        <h2 className="legal__title">{title}</h2>
        <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>
      <iframe className="legal__frame" src={href} title={title} />
    </div>
  )
}
