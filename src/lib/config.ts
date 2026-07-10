// ============================================================
//  外部サービスの設定値
//  ここの ID/キーは App Store 提出前に本番値へ置き換えてください。
//  （Web版・デモ動作には不要。ネイティブ(iOS)でのみ使用します）
// ============================================================

// ---- RevenueCat（アプリ内課金） ----
// RevenueCat ダッシュボード → API keys の「Public app-specific API key（Apple）」
export const REVENUECAT_IOS_API_KEY = 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXX' // TODO: 差し替え

// 「広告を消す」買い切りに紐づく Entitlement 識別子（RevenueCatで作成）
export const ENTITLEMENT_PREMIUM = 'premium'

// App Store Connect で作る非消費型プロダクトのID（¥300 / 広告除去）
export const PRODUCT_REMOVE_ADS = 'remove_ads'

// ---- Google AdMob（広告） ----
// 本番の広告ユニットID（iOS）。未設定の間はテストIDを使います。
export const ADMOB_BANNER_IOS = '' // TODO: 'ca-app-pub-XXXX/XXXX' を設定
// AdMob 公式のテスト用バナーID（開発中はこれが表示されます）
export const ADMOB_BANNER_TEST = 'ca-app-pub-3940256099942544/2934735716'

// ---- 法務・問い合わせ ----
// Cloudflare で公開した静的ページのURL（末尾スラッシュ無し）に置き換え推奨
export const URL_PRIVACY = './privacy.html'
export const URL_TERMS = './terms.html'
export const CONTACT_EMAIL = 'sunpotflower4460@gmail.com'
// App Store の数値ID（申請後に採番）。設定するとレビュー導線が有効化。
export const APP_STORE_ID = ''

// 価格表示（実際の課金額は App Store Connect の価格ティアに従います）
export const PREMIUM_PRICE_LABEL = '¥300'

// アプリのバージョン表記（App Store のバージョンと揃える）
export const APP_VERSION = '1.0.0'
