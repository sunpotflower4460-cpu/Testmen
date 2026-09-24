import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // TODO: あなたの逆ドメインに変更（App Store Connect の Bundle ID と一致させる）
  appId: 'com.sunpotflower.stamphabit',
  appName: 'スタンプ習慣',
  webDir: 'dist',
  // 初版は広告・課金なしのため、AdMob / RevenueCat をiOSアプリに組み込まない。
  // 有効化するときは docs/MONETIZATION.md の手順でこの一覧に追加する。
  includePlugins: ['@capacitor/app', '@capacitor/splash-screen', '@capacitor/status-bar'],
  ios: {
    contentInset: 'always',
  },
}

export default config
