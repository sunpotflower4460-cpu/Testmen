import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // TODO: あなたの逆ドメインに変更（App Store Connect の Bundle ID と一致させる）
  appId: 'com.sunpotflower.stamphabit',
  appName: 'スタンプ習慣',
  webDir: 'dist',
  // iOSアプリに組み込むネイティブプラグイン（広告：AdMob／課金：RevenueCat）
  includePlugins: [
    '@capacitor/app',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
    '@capacitor-community/admob',
    '@revenuecat/purchases-capacitor',
  ],
  ios: {
    contentInset: 'always',
  },
}

export default config
