# iOS ビルド & App Store 申請ガイド（残り＝手動作業のみ）

自動化できる部分は**すべて実施済み**です。このリポジトリには次が含まれています：

- ✅ iOS ネイティブプロジェクト `ios/`（生成済み・Swift Package Manager 構成＝`pod install` 不要）
- ✅ `Info.plist`：ATT文言・AdMob ID枠・SKAdNetwork・向き固定・輸出コンプライアンス自動回答
- ✅ `ios/App/App/PrivacyInfo.xcprivacy`（Xcodeプロジェクトに登録済み）
- ✅ アプリアイコン（1024, 透過なし）・スプラッシュ画像
- ✅ App Store スクリーンショット 4枚（6.7", 1290×2796）`fastlane/screenshots/ja/`
- ✅ ストア説明文・メタデータ `fastlane/metadata/`（自動アップロード可）
- ✅ 広告(AdMob)・課金(RevenueCat)のコード実装

残っているのは、**あなたのアカウント/鍵が必要な手動作業だけ**です（下記）。

---

## 手動作業チェックリスト

### A. 手元で開く（Mac）
```bash
npm install
npm run build
npx cap sync ios     # ← ios/ は生成済み。add は不要
npx cap open ios     # Xcode が開く（初回はSPM解決に少し時間がかかります）
```

### B. 署名（Xcode）
- **Signing & Capabilities → Team** に自分の Apple Developer チームを設定
- Bundle ID は `com.sunpotflower.stamphabit`（変えたい場合は `capacitor.config.ts`・Xcode・`fastlane/Appfile` を揃える）

### C. 広告（AdMob）— 実IDに差し替え 🍎
1. [AdMob](https://apps.admob.com/) でアプリ＋バナー広告ユニットを作成
2. `src/lib/config.ts` の `ADMOB_BANNER_IOS` に**バナー広告ユニットID**
3. `ios/App/App/Info.plist` の `GADApplicationIdentifier` を**自分のAdMobアプリID**へ
   （現在は Google のテストIDが入っています）
4. `npm run build && npx cap sync ios`

### D. 課金（RevenueCat + App Store Connect）🍎
1. App Store Connect：**App内課金（非消費型）** `remove_ads` を ¥300 で作成
2. RevenueCat：Entitlement `premium` に `remove_ads` を紐付け、Offering(current) に追加、**Public API key(Apple)** を取得
3. `src/lib/config.ts` の `REVENUECAT_IOS_API_KEY` を設定 → `npm run build && npx cap sync ios`
   （`ENTITLEMENT_PREMIUM` / `PRODUCT_REMOVE_ADS` は既定値のままRevenueCat/ASCと一致させればOK）

### E. 公開URLの反映
- Cloudflare の公開URLに合わせて更新：
  - `src/lib/config.ts` の `URL_PRIVACY` / `URL_TERMS`
  - `fastlane/metadata/ja/privacy_url.txt` / `support_url.txt` / `marketing_url.txt`

### F. ストア情報の登録
- 手入力する場合：`APPSTORE_METADATA.md` の内容をコピペ
- 自動アップロードする場合（Mac）：
  ```bash
  bundle install            # 初回のみ（Gemfile）
  bundle exec fastlane upload_metadata   # 説明文＋スクショをASCへ
  ```
  ※ 事前に App Store Connect で同じ Bundle ID のアプリを作成しておくこと

### G. ビルド → 申請
- Xcode：**Product → Archive → Distribute App → App Store Connect → Upload**
  - または `bundle exec fastlane release`（署名設定済みが前提）
- App Store Connect で **App本体＋App内課金 `remove_ads` を同時に審査提出**
- App Privacy（データ収集）の設問は `APPSTORE_METADATA.md` の通りに回答

---

## 補足
- **Web を変更したら**：`npm run build && npx cap sync ios`（毎回）
- `PrivacyInfo.xcprivacy` は登録済みですが、Xcode で対象ターゲットに含まれているか一度ご確認ください
- スクリーンショットの他サイズが必要になったら、開発時に生成スクリプトで追加できます（履歴参照）

## よくあるつまずき
| 症状 | 対処 |
|---|---|
| 広告が出ない | まずはテストIDで確認。実IDは審査/反映まで時間差あり |
| 課金で商品が取得できない | ASC の有料App契約・税務/銀行情報が未完了だと取得不可 |
| SPM解決に失敗 | Xcode の File → Packages → Reset Package Caches |
| Web変更が反映されない | `npm run build && npx cap sync ios` を再実行 |
