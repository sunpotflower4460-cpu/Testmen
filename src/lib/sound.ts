// ---- 効果音（WebAudio。外部ファイル不要の合成音） ------------------------

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/**
 * ハンコを押した瞬間の「トン」という柔らかい音。
 * 低い胴鳴り（triangle）＋短いノイズの当たりで、木＋紙の質感を狙う。
 */
export function playStamp(): void {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime

  // 胴鳴り（ピッチが少し下がる）
  const osc = ac.createOscillator()
  const oscGain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.12)
  oscGain.gain.setValueAtTime(0.0001, now)
  oscGain.gain.exponentialRampToValueAtTime(0.32, now + 0.008)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
  osc.connect(oscGain).connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.24)

  // 紙に当たる短いノイズ
  const dur = 0.06
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate)
  const ch = buffer.getChannelData(0)
  for (let i = 0; i < ch.length; i++) {
    ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length)
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.14, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 900
  noise.connect(hp).connect(noiseGain).connect(ac.destination)
  noise.start(now)
  noise.stop(now + dur)
}

/** 取り消し時の控えめな音。 */
export function playUnstamp(): void {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(320, now)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.1)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
  osc.connect(g).connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.16)
}
