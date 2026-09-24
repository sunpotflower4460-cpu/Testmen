import fs from 'node:fs'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const errors = []
const requireCheck = (condition, message) => {
  if (!condition) errors.push(message)
}

const config = read('src/lib/config.ts')
const info = read('ios/App/App/Info.plist')
const privacyManifest = read('ios/App/App/PrivacyInfo.xcprivacy')
const project = read('ios/App/App.xcodeproj/project.pbxproj')
const privacyPolicy = read('public/privacy.html')
const terms = read('public/terms.html')

const revenueCatKey = config.match(/REVENUECAT_IOS_API_KEY\s*=\s*'([^']+)'/)?.[1] ?? ''
const admobBannerId = config.match(/ADMOB_BANNER_IOS\s*=\s*'([^']*)'/)?.[1] ?? ''
const ADMOB_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716'
const ADMOB_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511'

const capacitorConfig = read('capacitor.config.ts')
const monetization = /MONETIZATION_ENABLED\s*=\s*true/.test(config)

if (monetization) {
  requireCheck(
    /^appl_(?!X{3})\S{8,}$/.test(revenueCatKey),
    'RevenueCatの本番Public API keyを src/lib/config.ts に設定してください。',
  )
  requireCheck(
    /^ca-app-pub-\d+\/\d+$/.test(admobBannerId) && admobBannerId !== ADMOB_TEST_BANNER_ID,
    'AdMobの本番バナー広告ユニットIDを src/lib/config.ts に設定してください（Google公式テストIDは使用不可）。',
  )
  requireCheck(
    info.includes('GADApplicationIdentifier') && !info.includes(ADMOB_TEST_APP_ID),
    'Info.plist の GADApplicationIdentifier を本番AdMobアプリIDへ設定してください（docs/MONETIZATION.md 参照）。',
  )
  requireCheck(
    info.includes('NSUserTrackingUsageDescription'),
    'Info.plist に NSUserTrackingUsageDescription を追加してください（docs/MONETIZATION.md 参照）。',
  )
  requireCheck(
    !/includePlugins/.test(capacitorConfig) || /admob/.test(capacitorConfig),
    'capacitor.config.ts の includePlugins に AdMob / RevenueCat を追加してください。',
  )
} else {
  // 広告・課金なしの版：追跡や広告SDKの痕跡が残っていると審査でプライバシー申告と食い違う。
  requireCheck(
    !info.includes('NSUserTrackingUsageDescription') && !info.includes('GADApplicationIdentifier'),
    '広告なしの版では Info.plist から NSUserTrackingUsageDescription / GADApplicationIdentifier を外してください。',
  )
  requireCheck(
    /includePlugins/.test(capacitorConfig) && !/admob|revenuecat/i.test(capacitorConfig.replace(/\/\/.*$/gm, '')),
    '広告なしの版では capacitor.config.ts の includePlugins から AdMob / RevenueCat を外してください。',
  )
  requireCheck(
    !/admob|revenuecat/i.test(read('ios/App/CapApp-SPM/Package.swift')),
    'ios/App/CapApp-SPM/Package.swift に広告・課金SDKが残っています。npx cap sync ios を実行してください。',
  )
  requireCheck(
    !/AdMob|RevenueCat|アプリ内課金です/.test(privacyPolicy + terms),
    '広告なしの版では、規約・プライバシーポリシーから広告・課金の記述を外してください。',
  )
}

requireCheck(
  !privacyManifest.includes('<key>NSPrivacyTracking</key>\n\t<true/>') ||
    !privacyManifest.includes('<key>NSPrivacyTrackingDomains</key>\n\t<array/>'),
  'Privacy ManifestでTracking=trueかつTrackingDomains空配列は無効です。',
)
requireCheck(
  !project.includes('TARGETED_DEVICE_FAMILY = "1,2"'),
  'iPad画像がない初版では TARGETED_DEVICE_FAMILY をiPhone専用にしてください。',
)
requireCheck(!privacyPolicy.includes('本文は雛形です'), 'プライバシーポリシーの雛形注記を削除してください。')
requireCheck(!terms.includes('本文は雛形です'), '利用規約の雛形注記を削除してください。')

for (const path of [
  'fastlane/metadata/ja/privacy_url.txt',
  'fastlane/metadata/ja/support_url.txt',
  'fastlane/metadata/ja/marketing_url.txt',
]) {
  const value = read(path).trim()
  requireCheck(/^https:\/\//.test(value) && !value.includes('example.'), `${path} を実在するHTTPS URLへ変更してください。`)
}

for (const path of [
  'fastlane/metadata/review_information/first_name.txt',
  'fastlane/metadata/review_information/last_name.txt',
  'fastlane/metadata/review_information/phone_number.txt',
  'fastlane/metadata/review_information/email_address.txt',
]) {
  requireCheck(read(path).trim().length > 0, `${path} を入力してください。`)
}

if (errors.length > 0) {
  console.error('\nApp Store提出前チェック: 未完了項目があります。\n')
  errors.forEach((message, index) => console.error(`${index + 1}. ${message}`))
  console.error('\nすべて修正後に npm run validate:appstore を再実行してください。\n')
  process.exit(1)
}

console.log('App Store提出前チェックを通過しました。')
