# 広告（AdMobバナー）と「広告を消す」課金

スタンプ習慣は、画面下部にAdMobのバナー広告を1つだけ表示し、買い切りの「広告を消す」（¥300）で非表示にできます。
インタースティシャル・動画広告は使いません。

| 項目 | 値 | 設定場所 |
|---|---|---|
| AdMob アプリID | `ca-app-pub-9319737313114058~5691564857` | `ios/App/App/Info.plist`（`GADApplicationIdentifier`） |
| バナー広告ユニットID | `ca-app-pub-9319737313114058/5208222814` | `src/lib/config.ts`（`ADMOB_BANNER_PRODUCTION`） |
| テスト用ユニットID | `ca-app-pub-3940256099942544/2934735716` | `src/lib/config.ts`（`ADMOB_BANNER_TEST`） |
| 製品ID（非消耗型） | `com.sunpotflower.stamphabit.removeads` | `src/lib/config.ts`（`PRODUCT_REMOVE_ADS`） |
| ATT文言 | 広告をあなたに合った内容にするため、トラッキングをお願いしています | `Info.plist`（`NSUserTrackingUsageDescription`） |

## 仕組み

- **広告**：`@capacitor-community/admob` が Google Mobile Ads SDK（Swift Package Manager：`googleads/swift-package-manager-google-mobile-ads`）を取り込みます。`npx cap sync ios` で `ios/App/CapApp-SPM/Package.swift` に反映されます。
- **課金**：Swift製のローカルプラグイン `ios/App/App/StampPurchasesPlugin.swift`（StoreKit 2）。`ViewController.swift` がCapacitorへ登録します。RevenueCatなどの外部サービスは使いません。
- **購入済みの扱い**：起動時に `Transaction.currentEntitlements`（端末内の権利情報・通信不要）で確認し、購入済みなら AdMob・同意フォーム・ATT を一切起動しません。
- **表示順**：購入状態の確認 → 同意フォーム（必要地域のみ・UMP）→ ATT → バナー表示。

## テスト広告と本番広告の切り替え

`src/lib/config.ts` の `ADMOB_USE_TEST_ADS` だけで切り替えます（広告ユニットIDはこのファイル1箇所）。

- `true`（現在の設定）：Google公式のテスト広告ユニットを使い、AdMobにもテスト扱いで要求します。
- `false`：本番の広告ユニットを使います。**App Storeへ提出するビルドの前に必ず `false` にしてください。**
  開発中に本番ユニットで広告を表示・タップすると、AdMobアカウントが無効になるおそれがあります。

`npm run validate:appstore` は `ADMOB_USE_TEST_ADS = true` のままだと失敗します（提出前の安全装置です）。

## 動作確認の手順（Xcode・実機またはシミュレータ）

```bash
npm ci
npm run build && npx cap sync ios
npx cap open ios
```

1. Xcodeでパッケージ（Google Mobile Ads / UMP）の解決が終わるのを待つ
2. **広告**：`ADMOB_USE_TEST_ADS = true` のまま起動 →（初回のみ）ATTダイアログ →「Test Ad」と書かれたバナーが画面下部に出る
   - バナーがタブバーに重ならないこと
3. **課金（ローカルテスト）**：Xcode → Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration に
   `ios/App/App/StampHabit.storekit` を選ぶ。設定 →「広告を消す ¥300」→ 購入 → バナーが消える
4. アプリを完全終了して再起動 → 広告もATTも出ない（購入済み）
5. 設定 →「購入を復元」が動く（購入済みの端末で）
6. Xcode → Debug → StoreKit → Manage Transactions で購入を削除 → 再起動で広告が戻る
7. 実機・Sandbox：App Store Connect のIAPを作成後、Sandboxテスターで購入・キャンセル・復元を確認

## 提出前に必要なこと

1. App Store Connect →「ビジネス」で有料アプリ契約・銀行口座・税務情報を登録
2. App Store Connect でアプリ内課金（非消耗型）`com.sunpotflower.stamphabit.removeads` を作成（表示名「広告を消す」、価格 ¥300、審査用スクリーンショット）
3. AdMob の「プライバシーとメッセージ」で、EEA・英国向けの同意メッセージを公開（未公開だとこれらの地域では広告が出ません）
4. AdMob の `app-ads.txt`／アプリのストア連携（公開済みアプリとの紐付け）を確認
5. App Privacy（プライバシー申告）を広告あり用に更新：広告データ（識別子・使用状況）をトラッキング目的で申告
6. `ADMOB_USE_TEST_ADS = false` にして `npm run build && npx cap sync ios` → `npm run validate:appstore` が通ることを確認
7. アプリ本体の新バージョンと IAP を **同時に** 審査へ提出

## SKAdNetwork について

`Info.plist` の `SKAdNetworkItems` は、以前リポジトリに保存してあった一覧をそのまま入れています。
Googleは一覧を定期的に更新するため、提出前に
[Google公式ドキュメント](https://developers.google.com/admob/ios/ios14)の最新の一覧と照合し、不足分を追加してください。
