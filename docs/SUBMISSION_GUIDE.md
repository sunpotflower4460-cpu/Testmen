# App Store 申請ガイド（スタンプ習慣 1.1：広告・課金あり）

1.0（広告なし）は 2026-11-26 に公開済みです。1.1 では、画面下部のバナー広告と、買い切りの「広告を消す」を追加します。
上から順に進めてください。終わった項目には `[x]` を付けます。

担当の印：【本人】アカウント所有者 ／ 【Muse】掲載情報の担当 ／ 【Claude】リポジトリとビルドの担当

## 現在の状況（2026-11-27）

- [x] バージョンを 1.1（ビルド 2）に変更
- [x] アプリ内課金「広告を消す」（`com.sunpotflower.stamphabit.removeads`、非消耗型、¥300）を App Store Connect に登録
- [x] AdMob の GDPR 同意メッセージを公開
- [x] `SKAdNetworkItems` を Google 公式の一覧と照合（50件）
- [x] 日本語のスクリーンショットを現行の画面で撮り直し
- [x] シミュレータ（iOS 26.2）で、ATT の表示、テスト広告、購入・キャンセル・復元（ローカルの StoreKit テスト）を確認
- [x] `app-ads.txt` を公開サイトに追加
- [x] 実機の Sandbox で購入・キャンセル・復元・再インストール後の復元を確認（2026-11-26）
- [x] AdMob アカウントの承認（2026-11-26）と、実アプリ ID での同意フローの表示・動作を確認（2026-11-27、シミュレータで欧州扱い）
- [x] アプリ内課金の審査用スクリーンショットを登録

---

## ステップ 1. 実機で確認する（テスト広告のまま）

`src/lib/config.ts` の `ADMOB_USE_TEST_ADS` が `true` の開発版を iPhone に入れて確認します【Claude がインストール、本人が操作】。

### 準備【本人】

- [x] アプリの設定 →「エクスポート」で記録を書き出す（**アプリを削除すると記録は消えます**）
- [x] App Store Connect →「ユーザとアクセス」→「Sandbox」でテスト用アカウントを作る
- [x] iPhone の Sandbox アカウント欄（設定 → デベロッパ。iOS の版で場所が違います）に、そのアカウントでサインインする

### 課金【本人】

- [x] 設定 →「広告を消す」に価格が円で表示される
- [x] 購入を途中でキャンセルできる（広告は出たまま）
- [x] 購入すると広告が消え、アプリを再起動しても出ない
- [x] 「購入を復元」で復元できたと表示される
- [x] アプリを削除して入れ直したあと、起動時点で広告が出ないか、「購入を復元」で消える
- [x] 書き出したファイルを「インポート」して記録が戻る

購入をやり直すときは、App Store Connect の Sandbox アカウントで購入履歴を消去します。

### 同意メッセージ（UMP）

同意メッセージは EEA・英国など、必要な地域でだけ表示されます。日本の端末で出ないのは通常の動作です。
表示の確認には、欧州として扱うテスト用の一時ビルドを使います【Claude】。この一時ビルドはコミットしません。
2026-11-27 に、フォームの表示、選択の保存、設定の「広告のプライバシー設定」からの再表示を確認しました。

### 基本の動作【本人】

- [ ] 習慣の追加・編集・削除・並び替えができる
- [ ] ハンコを押す・取り消す（すばやく連打しても記録が壊れない）
- [ ] カレンダーで過去の日を記録できる
- [ ] 設定で表示言語を切り替えられる
- [ ] 設定 →「利用規約」「プライバシーポリシー」が開き、✕ で戻れる
- [ ] 広告がタブバーやボタンに重ならない。画面の上下に文字が隠れていない
- [ ] 機内モードでも起動・記録できる

## ステップ 2. App Store Connect を整える

### 契約【本人】

- [ ] 「ビジネス」で、有料アプリ契約・銀行口座・税務情報が有効になっている

### App のプライバシー【Muse】

Google の [App Store のデータ開示](https://developers.google.com/admob/ios/privacy/data-disclosure)（2026-11-12 更新版を確認）を見ながら回答します。
Google Mobile Ads SDK は、次のデータを収集する場合があります。

| Google の説明 | App Store Connect で対応する分類 |
|---|---|
| デバイス ID（広告 ID など） | 識別子 → デバイス ID |
| 広告データ（閲覧した広告など） | 使用状況データ → 広告データ |
| アプリの起動やタップなどの操作 | 使用状況データ → 製品の操作 |
| IP アドレスから分かるおおよその位置 | 位置情報 → おおよその場所 |
| クラッシュログ | 診断 → クラッシュデータ |
| 起動時間などのパフォーマンス | 診断 → パフォーマンスデータ |

- [ ] 各データの利用目的と「ユーザに関連付けられるか」を、上のページと画面の説明に合わせて選ぶ
- [ ] 広告に使う識別子などは「トラッキングに使用する」として申告する（アプリは ATT の許可を求めます）
- [ ] 回答を「公開」する
- [ ] プライバシーポリシー URL：`https://testmen.sunpotflower4460.workers.dev/privacy.html`

### 年齢制限【Muse】

- [ ] 質問のうち、広告の有無を問う項目に「あり」と答える（文言は画面で確認する）

### アプリ内課金【Muse】

- [ ] 日本の価格が ¥300 になっている
- [ ] 表示名と説明を確認する（他の言語の案は [store-listing/README.md](./store-listing/README.md)）
- [x] 審査用スクリーンショットを登録する

### 1.1 のバージョンページ【Muse】

「＋」で iOS の新しいバージョン `1.1` を作り、次の内容を確認します。

| 欄 | コピー元ファイル |
|---|---|
| このバージョンの新機能 | `fastlane/metadata/ja/release_notes.txt` |
| プロモーション用テキスト | `fastlane/metadata/ja/promotional_text.txt` |
| 概要 | `fastlane/metadata/ja/description.txt` |
| キーワード | `fastlane/metadata/ja/keywords.txt` |
| サポートURL / マーケティングURL | `fastlane/metadata/ja/support_url.txt` / `marketing_url.txt` |
| App Review に関する情報のメモ | `fastlane/metadata/review_information/notes.txt` |

- [ ] 「このバージョンの新機能」に多言語対応も書くか決める（案は [store-listing/README.md](./store-listing/README.md)）
- [ ] スクリーンショットを差し替える：6.9インチ枠に `*_1290x2796.png`、6.5インチ枠に `*_1284x2778.png`（`fastlane/screenshots/ja/`）
- [ ] 「サインインが必要」は **オフ**
- [ ] 【本人】App Review の連絡先（氏名・電話番号・メール）を画面に直接入力する。このリポジトリは公開されているため、ファイルには書きません

`fastlane` の `upload_metadata` と `release` は、確認なしで掲載文とスクリーンショットを上書きします（`force`）。
手で入力した内容と突き合わせてから使ってください。

## ステップ 3. 本番広告に切り替えてアップロードする【Claude】

**本人の了承が出てから始めます。** 本番広告にしたビルドでは、自分で広告をタップしないでください。

- [x] ブランチで `src/lib/config.ts` の `ADMOB_USE_TEST_ADS` を `false` にする（2026-11-27、オーナー了承済み）
- [x] `npm run check` と `npm run validate:appstore` が通る
- [ ] PR を作り、CI が通ったら1コミットにまとめてマージする
- [ ] 最新の `main` からビルドする

```bash
git switch main && git pull
npm ci
npm run check
npm run validate:appstore
npx cap sync ios
npx cap open ios
```

1. TARGETS「App」→ **Signing & Capabilities** で、自動署名とチームを確認する
2. 実行先を **Any iOS Device (arm64)** にして、**Product → Archive**
3. Organizer →「Distribute App」→「App Store Connect」→「Upload」
4. しばらくして **TestFlight** にビルド（1.1 / 2）が出る

同じビルド番号は二度アップロードできません。やり直すときは Xcode の `CURRENT_PROJECT_VERSION` を上げます。

## ステップ 4. 審査に提出する【本人】

1. 1.1 のページの「ビルド」で、アップロードしたビルドを選ぶ
2. 同じページの「アプリ内課金とサブスクリプション」で「広告を消す」を追加する（アプリと同時に審査へ出します）
3. **「審査用に追加」→「審査へ提出」**
4. 承認されたら公開する。差し戻された場合は、届いた文面をそのまま Claude に伝えてください

公開後に、AdMob の画面でアプリと App Store の掲載を紐付け、`app-ads.txt` の確認状況を見ます。

---

## 困ったとき

| 症状 | 対処 |
|---|---|
| Xcode で「No account for team」 | Xcode → Settings → Accounts で Apple ID を追加 |
| Archive がグレーで押せない | 実行先を「Any iOS Device (arm64)」に変更 |
| アップロード後 TestFlight に出ない | 30分ほど待つ。Apple からのメール（処理エラー）を確認 |
| 価格が表示されない | 有料アプリ契約と、アプリ内課金の状態を確認 |
| 実機で価格がドルになる | Sandbox アカウントの国と地域を確認 |

広告と課金の仕組みは [MONETIZATION.md](./MONETIZATION.md) を参照してください。
