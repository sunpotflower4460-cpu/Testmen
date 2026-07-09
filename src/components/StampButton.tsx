import { useCallback, useEffect, useRef, useState } from 'react'
import type { InkColor } from '../lib/types'
import { useReducedMotion } from '../lib/useReducedMotion'
import { playStamp, playUnstamp } from '../lib/sound'

interface Particle {
  id: number
  tx: number
  ty: number
  rot: number
  scale: number
  delay: number
  kind: 'ink' | 'ring' | 'spark' | 'emoji'
}

interface Props {
  done: boolean
  color: InkColor
  emoji: string
  soundOn: boolean
  /** トグルを実行し、実行後に「できた状態か」を返す */
  onToggle: () => boolean
  size?: number
  disabled?: boolean
  ariaLabel?: string
}

let PID = 0

function makeBurst(): Particle[] {
  const list: Particle[] = []
  const inkCount = 14
  for (let i = 0; i < inkCount; i++) {
    const angle = (i / inkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const dist = 46 + Math.random() * 52
    list.push({
      id: PID++,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      rot: (Math.random() - 0.5) * 320,
      scale: 0.5 + Math.random() * 0.9,
      delay: Math.random() * 40,
      kind: Math.random() < 0.28 ? 'spark' : 'ink',
    })
  }
  // 舞い上がる絵柄をいくつか
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
    const dist = 60 + Math.random() * 46
    list.push({
      id: PID++,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - 20,
      rot: (Math.random() - 0.5) * 120,
      scale: 0.8 + Math.random() * 0.5,
      delay: 20 + Math.random() * 60,
      kind: 'emoji',
    })
  }
  return list
}

export function StampButton({
  done,
  color,
  emoji,
  soundOn,
  onToggle,
  size = 128,
  disabled = false,
  ariaLabel,
}: Props) {
  const reduced = useReducedMotion()
  const [pressing, setPressing] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const clearTimer = useRef<number | null>(null)

  const commit = useCallback(() => {
    if (disabled) return
    const nowDone = onToggle()
    setAnimKey((k) => k + 1)
    if (nowDone) {
      if (soundOn) playStamp()
      if (!reduced) {
        // 波紋とパーティクルは「実際に押した瞬間」のみ。マウント時には出さない。
        setCelebrate(true)
        setParticles(makeBurst())
        if (clearTimer.current) window.clearTimeout(clearTimer.current)
        clearTimer.current = window.setTimeout(() => {
          setParticles([])
          setCelebrate(false)
        }, 1100)
      }
    } else {
      if (soundOn) playUnstamp()
      setCelebrate(false)
      setParticles([])
    }
  }, [disabled, onToggle, soundOn, reduced])

  useEffect(() => {
    return () => {
      if (clearTimer.current) window.clearTimeout(clearTimer.current)
    }
  }, [])

  return (
    <button
      type="button"
      className={
        'stamp' +
        (done ? ' is-done' : '') +
        (pressing ? ' is-pressing' : '') +
        (disabled ? ' is-disabled' : '')
      }
      style={
        {
          '--ink': color.ink,
          '--tint': color.tint,
          '--size': `${size}px`,
        } as React.CSSProperties
      }
      onPointerDown={() => !disabled && setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerLeave={() => setPressing(false)}
      onClick={commit}
      disabled={disabled}
      aria-pressed={done}
      aria-label={ariaLabel}
    >
      {/* 押し込みで沈む土台 */}
      <span className="stamp__base">
        {/* インクの円環と芯 */}
        <span key={animKey} className={'stamp__face' + (done ? ' stamp__face--stamped' : '')}>
          <span className="stamp__ring" />
          <span className="stamp__glyph">{emoji}</span>
          <span className="stamp__grain" aria-hidden />
        </span>
        {/* 押した瞬間の波紋 */}
        {celebrate && <span key={`r${animKey}`} className="stamp__ripple" aria-hidden />}
      </span>

      {/* パーティクル（飛沫・きらめき・舞う絵柄） */}
      {particles.length > 0 && (
        <span className="stamp__burst" aria-hidden>
          {particles.map((p) => (
            <span
              key={p.id}
              className={`particle particle--${p.kind}`}
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  '--rot': `${p.rot}deg`,
                  '--sc': p.scale,
                  '--delay': `${p.delay}ms`,
                } as React.CSSProperties
              }
            >
              {p.kind === 'emoji' ? emoji : p.kind === 'spark' ? '✦' : ''}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}
