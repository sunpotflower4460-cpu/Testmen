# 広告・課金を有効にする手順（2つ目以降のバージョン向け）

初版は **広告・課金なし** で出しています（`src/lib/config.ts` の `MONETIZATION_ENABLED = false`）。
コード（AdMob・RevenueCat・「広告を消す」画面）はそのまま残してあるので、次の手順で有効にできます。

## 1. アカウント側の準備

1. App Store Connect →「ビジネス」で **有料アプリ契約**・銀行口座・税務情報を登録
2. App Store Connect でアプリ内課金（非消費型）`remove_ads` を作成
3. RevenueCat で Entitlement `premium` を作り、`remove_ads` を Current Offering の Lifetime パッケージに登録
4. AdMob で iOS アプリとバナー広告ユニットを作成し、「プライバシーとメッセージ」で同意メッセージを公開

## 2. アプリ側の変更

1. `src/lib/config.ts`
   - `MONETIZATION_ENABLED = true`
   - `REVENUECAT_IOS_API_KEY` と `ADMOB_BANNER_IOS` を本番値に
2. `capacitor.config.ts` の `includePlugins` に次を追加
   ```ts
   '@capacitor-community/admob', '@revenuecat/purchases-capacitor',
   ```
3. `ios/App/App/Info.plist` の `ITSAppUsesNonExemptEncryption` の上に [`ads-info-plist.xml`](./ads-info-plist.xml) の中身を貼り付け、
   `GADApplicationIdentifier` を本番の AdMob アプリID（`ca-app-pub-...~...`）に変更
4. 規約・プライバシーポリシーに広告・課金の記述を戻す（`git log -p public/privacy.html` で以前の文面を確認できます）
5. App Store の説明文・審査メモ・スクリーンショット・App Privacy（プライバシー申告）を広告あり用に更新
6. `npm run build && npx cap sync ios` → `npm run validate:appstore` が通ることを確認
7. アプリ本体と IAP `remove_ads` を **同時に** 審査へ提出
