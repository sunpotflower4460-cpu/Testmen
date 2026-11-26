# App Store 申請メタデータ

## 基本情報

| 項目 | 値 |
|---|---|
| アプリ名 | スタンプ習慣：毎日をハンコで記録 |
| サブタイトル | 続けたいことをワンタップ記録 |
| Bundle ID | `com.sunpotflower.stamphabit` |
| 主カテゴリ | ヘルスケア/フィットネス |
| 副カテゴリ | 仕事効率化 |
| 年齢制限 | 4+ |
| 価格 | 無料 |
| 対応言語 | 日本語 |
| 対応端末 | iPhone（初版） |

## キーワード

`習慣,習慣化,記録,トラッカー,継続,カレンダー,ルーティン,日課,目標,健康,勉強,ダイエット,スタンプ,ハンコ,モチベーション`

## 広告・App内課金

| 項目 | 値 |
|---|---|
| 広告 | Google AdMob のバナーのみ（画面下部）。インタースティシャル・動画なし |
| AdMob アプリID | `ca-app-pub-9319737313114058~5691564857`（Info.plist の `GADApplicationIdentifier`） |
| バナー広告ユニットID | `ca-app-pub-9319737313114058/5208222814`（`src/lib/config.ts`） |
| IAPタイプ | 非消耗型（StoreKit 2） |
| Product ID | `com.sunpotflower.stamphabit.removeads` |
| 表示名 | 広告を消す（¥300） |
| 説明 | すべての広告を非表示にします。買い切りで、追加課金はありません。 |

提出するビルドでは `ADMOB_USE_TEST_ADS = false` にしてください（`npm run validate:appstore` が検出します）。
手順は [docs/MONETIZATION.md](./docs/MONETIZATION.md) を参照してください。

## App Privacy

習慣記録は端末内だけに保存します。広告（AdMob）は、実際に組み込んだSDKのPrivacy Reportと Google の最新の案内に合わせてApp Store Connectへ申告してください。

- 広告識別子・使用状況データ・診断：AdMobによる広告配信（トラッキングに使用）
- 購入情報：Appleが管理（開発者は取得しない）
- 起動時に「広告を消す」購入済みなら、AdMob・ATTを一切起動しない

## 審査メモ

`fastlane/metadata/review_information/notes.txt` を使います（サインイン不要・広告/ATT/IAPの説明入り）。
IAP `com.sunpotflower.stamphabit.removeads` は、アプリ本体のバージョンと同時に審査へ提出してください。

## 提出前チェック

```bash
npm run check
npm run validate:appstore
```

`validate:appstore` が通るまで、Fastlaneのreleaseは実行しないでください。
