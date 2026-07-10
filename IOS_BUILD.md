# iOS アプリ化 & App Store 申請ガイド（Mac作業）

このアプリは **Capacitor** で iOS ネイティブアプリとして書き出せます。以下は **Mac** での作業手順です。
（Web版・広告・課金のコードはすべて実装済み。ここでは実機ビルドと各サービスの接続を行います）

> 記号の意味： 🖥 = Macでのコマンド ／ ⚙️ = 設定値の入力 ／ 🍎 = Apple/各サービスのサイト作業

---

## 0. 事前準備

- Xcode（Mac App Store から）＋ コマンドラインツール
- CocoaPods： `sudo gem install cocoapods`
- Node.js 20 以上
- Apple Developer Program 登録（年 $99）
- Google AdMob アカウント（広告）／ RevenueCat アカウント（課金・無料枠あり）

---

## 1. iOS プロジェクトを生成する

```bash
# 依存インストール & Webビルド
npm install
npm run build

# iOS プラットフォームを追加（初回のみ）
npx cap add ios

# Webビルドをネイティブへ同期（ビルドのたびに実行）
npx cap sync ios
```

> 以降、**Web側を変更したら毎回** `npm run build && npx cap sync ios` を実行してください。

---

## 2. アイコン・スプラッシュ

`assets/icon.svg` を元に 1024×1024 の PNG（`assets/icon.png`）を用意し、次を実行：

```bash
npm install -D @capacitor/assets   # Macではsharpが正常に入ります
npx @capacitor/assets generate --ios
```

（手動で行う場合は Xcode の `App/Assets.xcassets` にアイコンを設定してもOK）

---

## 3. Xcode で署名・基本設定

```bash
npx cap open ios
```

Xcode の **Signing & Capabilities** で：
- **Team**：自分の Apple Developer チームを選択
- **Bundle Identifier**：`capacitor.config.ts` の `appId`（例 `com.sunpotflower.stamphabit`）と一致させる
- **Display Name**：スタンプ習慣
- **Version / Build**：`1.0.0 / 1`

---

## 4. 広告（AdMob）の接続

1. 🍎 [AdMob](https://apps.admob.com/) でアプリを登録し、**バナー広告ユニット**を作成
2. ⚙️ `src/lib/config.ts` の `ADMOB_BANNER_IOS` に本番の広告ユニットIDを設定
   （空のままだと Google のテスト広告が表示されます）
3. ⚙️ `ios/App/App/Info.plist` に以下を追加：
   - `GADApplicationIdentifier`（String）= AdMob の **アプリID**（`ca-app-pub-XXXX~XXXX`）
   - `NSUserTrackingUsageDescription`（String）= 例：「広告を最適化するために使用します」
   - `SKAdNetworkItems`：Google 提供の SKAdNetwork ID 一覧（AdMob ドキュメント参照）
4. 🖥 `npx cap sync ios`（プラグインの Pod が入ります）

> ATT（トラッキング許可）ダイアログはアプリ起動時に自動で出ます（`initAds` 内で要求）。

---

## 5. 課金（RevenueCat + App Store Connect）

**App Store Connect 側** 🍎
1. アプリを作成（Bundle ID を一致）
2. **App内課金 → 非消費型**を作成：Product ID = `remove_ads`、価格 = **¥300 のティア**
3. 審査提出用のメタデータ（表示名・説明）を入力

**RevenueCat 側** 🍎
1. プロジェクト作成 → Apple アプリを追加（App Store Connect の共有シークレットを登録）
2. **Entitlement** を作成：識別子 `premium`
3. **Product** に `remove_ads` を追加 → **Offering（current）** に紐付け
4. **Public API key（Apple）** を取得

**コード側** ⚙️（`src/lib/config.ts`）
```ts
export const REVENUECAT_IOS_API_KEY = 'appl_xxxxxxxx' // ← 貼り付け
export const ENTITLEMENT_PREMIUM   = 'premium'        // RevenueCatと一致
export const PRODUCT_REMOVE_ADS    = 'remove_ads'     // App Store Connectと一致
```
→ 🖥 `npm run build && npx cap sync ios`

> テストは Sandbox（App Store Connect の Sandbox テスターアカウント）で行えます。

---

## 6. 法務・情報

- `public/privacy.html` / `public/terms.html` は Cloudflare で公開済みのURLに差し替え推奨
  （`src/lib/config.ts` の `URL_PRIVACY` / `URL_TERMS`）
- App Store Connect の **プライバシー（データ収集）** 設問では、広告(AdMob)による
  「識別子」「使用状況データ」の収集を申告してください。

---

## 7. ビルド → 申請

1. Xcode で実機/シミュレータ動作確認
2. **Product → Archive**
3. **Distribute App → App Store Connect → Upload**
4. App Store Connect で **TestFlight** 確認 → スクリーンショット等を揃えて **審査へ提出**
   - アプリ本体と **App内課金 `remove_ads` を同時に審査提出**するのを忘れずに

---

## よくあるつまずき

| 症状 | 対処 |
|---|---|
| 広告が出ない | 最初はテストIDで確認。実IDは審査通過後に反映されることがある |
| 課金ボタンで商品が取れない | App Store Connect の契約(有料App)・税務/銀行情報が未完了だと取得不可 |
| ビルド時 Pod エラー | `cd ios/App && pod install` を手動実行 |
| Web変更が反映されない | `npm run build && npx cap sync ios` を再実行 |
