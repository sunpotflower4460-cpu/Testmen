// Capacitor 実行環境の判定ラッパー。
// Web（ブラウザ / Cloudflare）では isNative=false となり、
// ネイティブ専用プラグインは呼び出さない。
import { Capacitor } from '@capacitor/core'

export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}

export function isIOS(): boolean {
  return getPlatform() === 'ios'
}
