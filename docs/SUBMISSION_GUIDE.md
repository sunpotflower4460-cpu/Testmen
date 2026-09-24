# はじめての App Store 申請ガイド（スタンプ習慣 v1.0.0）

初版は **広告・課金なし** の無料アプリとして申請します。
上から順に進めれば申請まで届くようにしてあります。終わった項目には `[x]` を付けていきましょう。

- 🧑 … あなたがブラウザや Mac で行う作業
- 🤖 … Claude（またはコマンド）が自動で行う作業

---

## ステップ 1. プライバシーポリシーを公開する（🧑 5分）

App Store の審査では、ブラウザで開けるプライバシーポリシーのURLが必須です。
このリポジトリの `public/privacy.html` を Cloudflare Pages で無料公開します。

- [ ] 1-1. 修正ブランチを `main` に取り込む（Cloudflare は `main` の内容を公開します）
- [ ] 1-2. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログイン（無料アカウントでOK）
- [ ] 1-3. **Workers & Pages** →「作成（Create）」→ **Pages** タブ →「Git に接続（Connect to Git）」
- [ ] 1-4. GitHub を認可し、リポジトリ `sunpotflower4460-cpu/Testmen` を選択
- [ ] 1-5. ビルドの設定を次のようにして「保存してデプロイ（Save and Deploy）」

  | 項目 | 値 |
  |---|---|
  | Production branch | `main` |
  | Framework preset | `None` |
  | Build command | `npm run build` |
  | Build output directory | `dist` |

- [ ] 1-6. 表示された URL（例：`https://testmen.pages.dev`）を開き、`/privacy.html` と `/terms.html` が表示されることを確認
- [ ] 1-7. その URL を Claude に伝える → 🤖 申請用の URL 3つを書き換えます

## ステップ 2. 審査担当者への連絡先を決める（🧑 1分）

審査中に Apple から連絡が来ることがあるため、連絡先が必要です（ストアには公開されません）。

- [ ] 姓・名（ローマ字でも可）と電話番号（例：`+81 90-1234-5678`）を Claude に伝える → 🤖 入力します

ここまで終わると `npm run validate:appstore` が「通過しました」になります。

## ステップ 3. App Store Connect にアプリを登録する（🧑 15分）

1. [App Store Connect](https://appstoreconnect.apple.com/) →「アプリ」→「＋」→「新規アプリ」
   - プラットフォーム：iOS
   - 名前：`スタンプ習慣：毎日をハンコで記録`（使われていたら少し変えて Claude に伝えてください）
   - 言語：日本語
   - バンドルID：`com.sunpotflower.stamphabit`
     - 一覧に出ない場合は、先に [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/identifiers/list) の「Identifiers」→「＋」→ App IDs で同じIDを登録
   - SKU：`stamphabit001`（自分用の管理番号。なんでもOK）
   - ユーザーアクセス：フルアクセス
2. **App プライバシー**（左メニュー）
   - プライバシーポリシーURL：ステップ1の `…/privacy.html`
   - 「データの収集」→ **「いいえ、このアプリからデータを収集しません」** → 公開
3. **価格および配信状況**：価格「無料（0円）」、配信する国（日本だけでも全世界でもOK）
4. **App 情報**
   - カテゴリ：プライマリ「ヘルスケア／フィットネス」、セカンダリ「仕事効率化」
   - 年齢制限：「設定」を押し、質問はすべて **「なし」／「いいえ」** → 4+
   - コンテンツ配信権：「いいえ（第三者のコンテンツを含まない）」
5. **1.0 の提出準備**（バージョンのページ）… 次の内容をそのままコピーして貼り付けます

   | 欄 | コピー元ファイル |
   |---|---|
   | プロモーション用テキスト | `fastlane/metadata/ja/promotional_text.txt` |
   | 概要 | `fastlane/metadata/ja/description.txt` |
   | キーワード | `fastlane/metadata/ja/keywords.txt` |
   | サポートURL / マーケティングURL | `fastlane/metadata/ja/support_url.txt` / `marketing_url.txt` |
   | 著作権 | `fastlane/metadata/copyright.txt` |
   | App Review に関する情報のメモ | `fastlane/metadata/review_information/notes.txt` |

   - 「サインインが必要」は **オフ**
   - スクリーンショット：「iPhone 6.9インチ」の枠に `fastlane/screenshots/ja/` の3枚をドラッグ
   - 「このバージョンの最新情報」は初版では入力欄がありません（空で大丈夫）

## ステップ 4. Mac でビルドしてアップロードする（🧑 30〜60分）

事前に Mac へ入れておくもの：**Xcode**（App Store から無料）と **Node.js 22**（<https://nodejs.org/>）

```bash
git clone https://github.com/sunpotflower4460-cpu/Testmen.git
cd Testmen
npm ci                 # 依存パッケージを入れる
npm run check          # ビルドと自動テスト（エラーが出ないこと）
npm run validate:appstore   # 「通過しました」と出ること
npx cap sync ios       # 最新の画面を iOS プロジェクトへ反映
npx cap open ios       # Xcode が開く
```

Xcode での作業：

1. 左の「App」→ TARGETS「App」→ **Signing & Capabilities**
   - 「Automatically manage signing」にチェック
   - Team：自分の Apple Developer チームを選ぶ
2. 上部の実行先を **自分の iPhone**（USBでつなぐ）にして ▶ を押し、実機で動くか確認
   - 初回は iPhone の「設定 → プライバシーとセキュリティ → デベロッパモード」をオンにする必要があります
3. 実行先を **Any iOS Device (arm64)** に変更 → メニュー **Product → Archive**
4. 完成すると Organizer が開く →「Distribute App」→「App Store Connect」→「Upload」→ 最後まで「Next」
5. 10〜30分後、App Store Connect の **TestFlight** タブにビルドが出ます
   - 「輸出コンプライアンス」は設定済みなので質問は出ません

## ステップ 5. 実機で最終確認（🧑 15分）

TestFlight アプリ（App Store から無料）で自分の iPhone に入れて確認します。

- [ ] 習慣の追加・編集・削除・並び替えができる
- [ ] ハンコを押す・取り消す（すばやく連打しても記録が壊れない）
- [ ] カレンダーで過去の日を記録できる
- [ ] 設定 →「利用規約」「プライバシーポリシー」が開き、✕ で戻れる
- [ ] 設定 → エクスポート（共有シートが出る）
- [ ] 画面の上下（ノッチ・ホームバー）に文字やボタンが隠れていない
- [ ] アプリを完全に終了して開き直しても、記録が残っている
- [ ] 機内モードでも起動・記録できる

気になる点があれば、スクリーンショットと一緒に Claude に伝えてください。

## ステップ 6. 審査に提出（🧑 3分）

1. App Store Connect → 1.0 の提出準備 →「ビルド」欄の「＋」で TestFlight のビルドを選ぶ
2. 右上の **「審査用に追加」→「審査へ提出」**
3. 審査は通常 **1〜3日** です。結果はメールで届きます
   - 承認されたら「このバージョンをリリース」で公開されます
   - **リジェクト（差し戻し）されても大丈夫です。** よくあることなので、届いた文面をそのまま Claude に貼ってもらえれば、一緒に直します

---

## 困ったとき

| 症状 | 対処 |
|---|---|
| Xcode で「No account for team」 | Xcode → Settings → Accounts で Apple ID を追加 |
| 「Bundle ID が使えない」 | ステップ3-1 の Identifiers 登録を確認 |
| Archive がグレーで押せない | 実行先を「Any iOS Device (arm64)」に変更 |
| アップロード後 TestFlight に出ない | 30分ほど待つ。Apple からのメール（処理エラー）を確認 |

広告・課金をあとから有効にする手順は [MONETIZATION.md](./MONETIZATION.md) を参照してください。
