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
| 価格 | 無料（App内課金あり） |
| 対応言語 | 日本語 |
| 対応端末 | iPhone（初版） |

## キーワード

`習慣,習慣化,記録,トラッカー,継続,カレンダー,ルーティン,日課,目標,健康,勉強,ダイエット,スタンプ,ハンコ,モチベーション`

## App内課金

| 項目 | 値 |
|---|---|
| タイプ | 非消費型 |
| Product ID | `remove_ads` |
| Entitlement | `premium` |
| 表示名 | 広告を消す |
| 説明 | すべての広告を非表示にします。買い切りで、追加課金はありません。 |

## App Privacy

習慣記録は端末内だけに保存します。AdMobとRevenueCat/Appleが扱うデータは、実際に組み込んだSDKのPrivacy Reportと各社の最新仕様に合わせてApp Store Connectへ申告してください。

- 広告識別子・使用状況・診断：AdMobによる広告配信
- 購入情報：Apple／RevenueCatによる購入管理
- プレミアム購入済みユーザーではAdMobを初期化しない

## 審査メモ

- サインイン不要
- 今日タブで習慣を作成し、中央のハンコを押すと記録できます
- カレンダータブで過去日も記録できます
- 設定から非消費型IAP `remove_ads` の購入・復元ができます
- 必要地域では広告読み込み前にGoogle UMP同意フォームを表示します
- アプリ本体とIAPを同時に審査へ提出してください

## 提出前チェック

```bash
npm run check
npm run validate:appstore
```

`validate:appstore` が通るまで、Fastlaneのreleaseは実行しないでください。
