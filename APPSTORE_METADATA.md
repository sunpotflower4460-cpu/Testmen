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

初版（1.0.0）は **広告・App内課金なし** です（`MONETIZATION_ENABLED = false`）。
有効化の手順は [docs/MONETIZATION.md](./docs/MONETIZATION.md) を参照してください。

## App Privacy

「データを収集しない」と申告します。習慣記録は端末内だけに保存し、広告SDK・課金SDKはiOSアプリに組み込んでいません。

## 審査メモ

`fastlane/metadata/review_information/notes.txt` を使います（サインイン不要・広告/課金/トラッキングなし）。

## 提出前チェック

```bash
npm run check
npm run validate:appstore
```

`validate:appstore` が通るまで、Fastlaneのreleaseは実行しないでください。
