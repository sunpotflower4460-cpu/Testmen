# Cloudflare Pages へのデプロイ手順

このアプリはバックエンド不要の静的サイト（`npm run build` の出力 `dist/` を配信するだけ）なので、
**Cloudflare Pages の GitHub 連携**でそのまま公開できます。API トークンは不要で、`main` に push するたびに自動デプロイされます。

## 手順（ダッシュボードで一度だけ設定）

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログイン
2. 左メニュー **Workers & Pages** → **Create** → **Pages** タブ → **Connect to Git**
3. GitHub を認可し、リポジトリ **`sunpotflower4460-cpu/Testmen`** を選択
4. ビルド設定を次のように入力：

   | 項目 | 値 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `Vite`（無ければ `None` でOK） |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. **Save and Deploy** を押す

数十秒で `https://testmen.pages.dev`（プロジェクト名により変わります）が発行されます。
以降は `main` への push ごとに自動で再デプロイされます。プルリクエストにはプレビューURLも付きます。

## 補足

- Node バージョンはリポジトリ直下の `.node-version`（= 20）で固定しています。
- 独自ドメインを使う場合は、Pages プロジェクトの **Custom domains** から追加できます。
- `vite.config.ts` の `base: './'` により、`*.pages.dev` でもサブパス配信でも正しく動作します。
- ルーティングは単一ページ（URL遷移なし）のため、SPA フォールバック設定は不要です。

## Workers（Workers Builds）で公開する場合

「Create → Import a repository」から **Worker** として取り込んだ場合は、
リポジトリ直下の `wrangler.toml` で `dist/` を静的アセットとして配信します（サーバーコード不要）。

Worker のプロジェクト設定（**Settings → Build**）で次を確認してください：

| 項目 | 値 |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy`（既定のまま） |

これで `wrangler.toml` の `[assets] directory = "./dist"` が配信対象になり、
デプロイ成功後に `testmen.<サブドメイン>.workers.dev` が有効になります。
URL が出ない場合は **Settings → Domains & Routes** で `workers.dev` を有効化してください。

## 手動デプロイ（任意）

CI を使わずローカルから公開したい場合：

```bash
npm install
npm run build
npx wrangler pages deploy dist
```
