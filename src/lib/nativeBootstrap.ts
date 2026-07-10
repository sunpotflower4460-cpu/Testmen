// ネイティブ(iOS)起動時の見た目調整。Webでは何もしない。
import { isNative } from './platform'

export async function nativeBootstrap(): Promise<void> {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    // 明るい紙色の背景に合わせて、ステータスバーは濃い文字色に
    await StatusBar.setStyle({ style: Style.Light })
  } catch {
    // プラグイン未導入でも継続
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    // ignore
  }
}
