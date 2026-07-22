# iOS ビルド & App Store 申請ガイド

このリポジトリには、CapacitorのiOSプロジェクト、アイコン、Privacy Manifest、App Storeメタデータ、広告・課金の実装が含まれています。
初版は **iPhone専用** とし、iPad用スクリーンショット不足による提出ブロックを避けます。

## 0. 必要環境

- Node.js 22以上
- Xcode 26以上
- Apple Developer Program
- AdMobアカウント
- RevenueCatアカウント

## 1. コード品質確認

```bash
npm ci
npm run check
```

`npm run check` はTypeScript/Vite本番ビルドと、日付・記録・インポートの自動テストを実行します。

## 2. Xcodeプロジェクトを同期

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Web側を変更した場合は、必ず `npm run build && npx cap sync ios` を再実行してください。

## 3. 署名と端末設定

Xcodeの **Signing & Capabilities** で次を確認します。

- Team：自分のApple Developerチーム
- Bundle Identifier：`com.sunpotflower.stamphabit`
- Version / Build：`1.0.0 / 1`
- Supported Destinations：iPhone
- In-App Purchase capability：追加済みであることを確認

## 4. AdMob・UMP同意

1. AdMobでiOSアプリとバナー広告ユニットを作成
2. `src/lib/config.ts` の `ADMOB_BANNER_IOS` を本番バナーIDへ変更
3. `ios/App/App/Info.plist` の `GADApplicationIdentifier` を本番アプリIDへ変更
4. AdMobの **Privacy & messaging** で、対象地域向けメッセージを公開
5. 実機で次を確認
   - 初回起動で必要地域のみ同意フォームが出る
   - 同意完了前に広告が読み込まれない
   - 設定画面に必要時のみ「広告のプライバシー設定」が出る
   - プレミアム購入済みではAdMob/ATTが起動しない

## 5. RevenueCat・App内課金

1. App Store Connectで非消費型IAP `remove_ads` を作成
2. RevenueCatでEntitlement `premium` を作成
3. `remove_ads` をCurrent OfferingのLifetime packageへ登録
4. `src/lib/config.ts` の `REVENUECAT_IOS_API_KEY` をApple用Public API keyへ変更
5. Sandboxで購入・キャンセル・復元・再起動後の維持を確認

コードはOfferingの先頭商品ではなく、Product ID `remove_ads` と一致する商品だけを購入します。

## 6. 公開URLと審査情報

次を実在するHTTPS URLへ変更します。

- `fastlane/metadata/ja/privacy_url.txt`
- `fastlane/metadata/ja/support_url.txt`
- `fastlane/metadata/ja/marketing_url.txt`

次も入力します。

- `fastlane/metadata/review_information/first_name.txt`
- `last_name.txt`
- `phone_number.txt`
- `email_address.txt`

## 7. App Store提出前の機械チェック

```bash
npm run validate:appstore
```

本番ID、公開URL、審査連絡先、Privacy Manifest、iPhone専用設定、雛形文言の残存を検査します。1件でも未完了なら終了コード1で停止します。

## 8. Archive・TestFlight

```bash
bundle install
bundle exec fastlane release
```

またはXcodeで次を実行します。

1. Product → Archive
2. Validate App
3. Distribute App → App Store Connect → Upload
4. TestFlightで実機確認
5. アプリ本体とIAP `remove_ads` を同時に審査提出

## 最終実機チェック

- 新規インストール／アップデート
- 習慣の追加・編集・削除・並べ替え
- 今日と過去日の記録、日付またぎ、タイムゾーン変更
- 高速連打で記録が壊れない
- エクスポート／インポート
- オフライン起動
- VoiceOver、文字サイズ、Reduce Motion
- 広告同意、広告表示、購入、復元、購入済み再起動
