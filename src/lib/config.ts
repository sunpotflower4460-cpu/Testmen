// ============================================================
//  外部サービスの設定値
//  App Store 提出前に ADMOB_USE_TEST_ADS を false にしてください。
//  （Web版・デモ動作には不要。ネイティブ(iOS)でのみ使用します）
// ============================================================

import type { Lang } from './i18n/index.js'

// ---- 広告・課金の有効化スイッチ ----
// false にすると AdMob / StoreKit を一切起動せず、広告・「広告を消す」の画面も出しません。
export const MONETIZATION_ENABLED = true

// ---- アプリ内課金（StoreKit 2・非消耗型） ----
// App Store Connect で作成した「広告を消す」の製品ID（¥300）。
// ネイティブ実装は ios/App/App/StampPurchasesPlugin.swift。
export const PRODUCT_REMOVE_ADS = 'com.sunpotflower.stamphabit.removeads'

// ---- Google AdMob（バナー広告のみ） ----
// 広告ユニットIDはここ1箇所で管理します。
// AdMob アプリID（ca-app-pub-9319737313114058~5691564857）は ios/App/App/Info.plist の
// GADApplicationIdentifier に設定してあります。
export const ADMOB_BANNER_PRODUCTION = 'ca-app-pub-9319737313114058/5208222814'
// Google 公式のテスト用バナー広告ユニットID（アダプティブバナー用）
export const ADMOB_BANNER_TEST = 'ca-app-pub-3940256099942544/2934735716'

// true の間は Google のテスト用広告ユニットを使い、AdMob にもテスト広告として扱わせます。
// 開発・動作確認中は true。App Store へ提出するビルドの前に false へ切り替えてください
// （true のままだと npm run validate:appstore が失敗します）。
export const ADMOB_USE_TEST_ADS = false

export const ADMOB_BANNER_UNIT_ID = ADMOB_USE_TEST_ADS ? ADMOB_BANNER_TEST : ADMOB_BANNER_PRODUCTION

// ---- 法務・問い合わせ ----
// 表示言語ごとのページ。Cloudflare で公開した静的ページのURL（末尾スラッシュ無し）に置き換え推奨
// 規約類の本文は日本語版と英語版だけを用意し、ほかの言語では英語版を表示する。
function legalPages(name: 'privacy' | 'terms'): Record<Lang, string> {
  const english = `./${name}.en.html`
  return {
    ja: `./${name}.html`,
    en: english,
    'zh-Hans': english,
    'zh-Hant': english,
    ko: english,
    es: english,
    fr: english,
    de: english,
    'pt-BR': english,
  }
}
export const URL_PRIVACY = legalPages('privacy')
export const URL_TERMS = legalPages('terms')
export const CONTACT_EMAIL = 'sunpotflower4460@gmail.com'
// App Store の数値ID（申請後に採番）。設定するとレビュー導線が有効化。
export const APP_STORE_ID = ''

// Web版プレビューでだけ使う価格表示。
// iOSアプリでは App Store から取得した利用者の国の通貨で表示し、取得できるまで価格を出しません
// （固定の金額を出すと、実際の請求額と食い違うため）。
export const WEB_PREVIEW_PRICE_LABEL = '¥300'

// アプリのバージョン表記（App Store のバージョンと揃える）
export const APP_VERSION = '1.1'
