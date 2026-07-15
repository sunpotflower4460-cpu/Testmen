# App Store 申請メタデータ（コピペ用まとめ）

App Store Connect に入力する内容を全てまとめました。`fastlane/metadata/` にも同じ内容が入っており、
`fastlane upload_metadata` で自動アップロードできます（手入力する場合は以下をコピペ）。

---

## 基本情報
| 項目 | 値 |
|---|---|
| アプリ名 | スタンプ習慣：毎日をハンコで記録 |
| サブタイトル | 続けたいことをワンタップ記録 |
| Bundle ID | `com.sunpotflower.stamphabit` |
| 主カテゴリ | ヘルスケア/フィットネス（HEALTH_AND_FITNESS） |
| 副カテゴリ | 仕事効率化（PRODUCTIVITY） |
| 年齢制限 | 4+ |
| 価格 | 無料（App内課金あり） |
| 対応言語 | 日本語 |

## キーワード
```
習慣,習慣化,記録,トラッカー,継続,カレンダー,ルーティン,日課,目標,健康,勉強,ダイエット,スタンプ,ハンコ,モチベーション
```

## プロモーションテキスト
> 「本日できた？」だけに集中。できたらハンコをトンっと押すだけ。連続日数とカレンダーで“続く”を実感できる、シンプルで気持ちいい習慣トラッカーです。

## 説明文
`fastlane/metadata/ja/description.txt` を参照（そのままコピペ可）。

## URL（公開後に自分のドメインへ更新）
- サポートURL / マーケティングURL：`https://<あなたのCloudflare公開URL>/`
- プライバシーポリシー：`https://<あなたのCloudflare公開URL>/privacy.html`

> ⚠️ `fastlane/metadata/ja/*_url.txt` のプレースホルダを実URLに置き換えてください。

---

## App内課金（In-App Purchase）
| 項目 | 値 |
|---|---|
| タイプ | 非消費型（Non-Consumable） |
| 参照名 | 広告を消す（プレミアム） |
| Product ID | `remove_ads` |
| 価格 | ¥300（該当ティア） |
| 表示名 | 広告を消す |
| 説明 | すべての広告を非表示にします。買い切りで、追加課金はありません。 |

> RevenueCat 側：Entitlement `premium` に `remove_ads` を紐付け、Offering(current) に追加。

---

## App Privacy（データ収集の申告）
アプリ自体はデータを外部送信しませんが、**広告(AdMob)** が以下を扱います。App Store Connect では次のように申告してください。

- **収集してユーザーをトラッキングに使用**：
  - 識別子（デバイスID／IDFA）— 用途：サードパーティ広告
- **収集（ユーザーにリンクしない）**：
  - 使用状況データ、診断（AdMob の計測）
- **購入**：App内課金の管理（RevenueCat/Apple） — 用途：App機能
- アプリの習慣記録データは**端末内のみ**に保存し、収集しません。

> AdMob/RevenueCat の SDK はそれぞれプライバシーマニフェストを同梱しています。アプリ本体にも
> `ios/App/App/PrivacyInfo.xcprivacy` を追加済みです。

---

## 審査に関する情報（App Review）
- **サインイン不要**（デモアカウント不要）
- 連絡先メール：`sunpotflower4460@gmail.com`
- 審査メモ：`fastlane/metadata/review_information/notes.txt` を参照
- **App内課金 `remove_ads` を、アプリ本体と同時に審査提出**してください

## 輸出コンプライアンス
- 標準的な暗号(HTTPS)のみ使用 → `Info.plist` に `ITSAppUsesNonExemptEncryption = false` 設定済み（質問は自動でスキップ）

## コンテンツ権利
- 第三者コンテンツの使用なし

---

## スクリーンショット
`fastlane/screenshots/ja/` に 6.7インチ（1290×2796）を4枚同梱済み。
`fastlane upload_metadata` でそのままアップロードされます。
（他サイズが必要な場合は `npm run build` 後に `_gen_shots.mjs` 相当を調整して生成できます）
