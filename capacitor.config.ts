import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.sunpotflower.stamphabit',
  appName: 'スタンプ習慣',
  webDir: 'dist',
  // AdMob（Google Mobile Ads SDK をSwift Package Managerで取り込む）を含める。
  // アプリ内課金は ios/App/App/StampPurchasesPlugin.swift（StoreKit 2）で実装しているため、
  // ここには含めない。
  includePlugins: [
    '@capacitor/app',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
    '@capacitor-community/admob',
  ],
  ios: {
    contentInset: 'always',
  },
}

export default config
