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
    // 画面端の余白は CSS の env(safe-area-inset-*) で確保している。'always' にすると
    // WebView側でも余白が入って二重になり、画面の下（キーボードを閉じた後は上）に白い帯が出る。
    // この値を変えたら npx cap sync ios を実行すること。
    contentInset: 'never',
  },
}

export default config
