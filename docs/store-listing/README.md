# App Store 掲載文の下書き（日本語以外の8言語）

**下書きです。** 日本語の掲載文（`fastlane/metadata/ja/`）をもとに作成しました。ネイティブ話者の確認はしていません。
このフォルダは `fastlane` の対象外なので、`bundle exec fastlane release` を実行しても **アップロードされません**。

| フォルダ | 言語 |
|---|---|
| `en-US` | 英語 |
| `zh-Hans` | 中国語（簡体字） |
| `zh-Hant` | 中国語（繁体字） |
| `ko` | 韓国語 |
| `es-ES` | スペイン語 |
| `fr-FR` | フランス語 |
| `de-DE` | ドイツ語 |
| `pt-BR` | ポルトガル語（ブラジル） |

各フォルダのファイル名は fastlane と同じです。`keywords.txt` と `promotional_text.txt` は直訳ではなく、各言語向けに言葉を選んでいます。

## アプリ内課金（広告を消す）の表示名と説明

App Store Connect の「アプリ内課金」→ `com.sunpotflower.stamphabit.removeads` →「ローカリゼーション」に手で追加します
（表示名は30文字以内、説明は45文字以内）。

| 言語 | 表示名 | 説明 |
|---|---|---|
| 日本語 | 広告を消す | 一度の購入で、すべての広告を非表示にします。 |
| 英語 | Remove Ads | Remove all ads with a single purchase. |
| 中国語（簡体字） | 移除广告 | 一次购买，移除所有广告。 |
| 中国語（繁体字） | 移除廣告 | 一次購買，移除所有廣告。 |
| 韓国語 | 광고 제거 | 한 번 구입하면 모든 광고가 사라집니다. |
| スペイン語 | Quitar anuncios | Una sola compra quita todos los anuncios. |
| フランス語 | Supprimer les pubs | Un seul achat supprime toutes les pubs. |
| ドイツ語 | Werbung entfernen | Ein Kauf entfernt die gesamte Werbung. |
| ポルトガル語 | Remover anúncios | Uma compra remove todos os anúncios. |

## 日本語の「このバージョンの新機能」の追記案

`release_notes.txt` の下書きには、多言語対応の一文を加えています。日本語（`fastlane/metadata/ja/release_notes.txt`）はまだ変えていません。
そろえる場合は次の内容にします。

```text
画面下部にバナー広告を追加しました。設定画面の「広告を消す」（買い切り）で、広告を非表示にできます。
日本語のほか8言語に対応し、設定画面で表示言語を選べるようになりました。
```

「このバージョンの新機能」は、2回目以降のバージョンで使う欄です。初めての公開では入力しません。

## 反映する手順

1. 内容を確認する（できれば各言語を読める人に見てもらう）
2. 使う言語のフォルダを `fastlane/metadata/` にコピーする
3. `fastlane/Fastfile` の `languages: ["ja"]`（2か所）に、その言語を足す
4. App Store Connect で、アプリ内課金のローカリゼーションを追加する
5. スクリーンショットを確認する。言語別の画像がないと、主言語（日本語）の画像が使われる場合があります
6. アプリ名がほかのアプリと重複していないか、登録時に確認する

## 公開ページ

- プライバシーポリシー：日本語以外は英語版（`privacy.en.html`）を指定しています
- サポートURL・マーケティングURL：日本語と同じ Web 版のトップです（閲覧者の言語で表示されます）
