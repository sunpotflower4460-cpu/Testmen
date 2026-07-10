import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // TODO: あなたの逆ドメインに変更（App Store Connect の Bundle ID と一致させる）
  appId: 'com.sunpotflower.stamphabit',
  appName: 'スタンプ習慣',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
}

export default config
