# 毎日ニュース解説サイト

AIニュース、AIツールニュース、一般ニュースなどの毎日更新コンテンツを、GitHub Pages で公開するための静的サイトです。

このリポジトリでは、ニュース本文を `content/` 配下の Markdown + YAML frontmatter で管理します。人間が読めて、Git 差分も追いやすく、後から本文データを再利用しやすい構造を優先しています。

> `content/` に入っている初期データは、実ニュースではなく動作確認用のサンプルです。実運用では当日の一次情報・公開日時・URLを確認したうえで差し替えてください。

## 技術構成

- TypeScript
- Markdown + YAML frontmatter
- 独自の軽量 SSG
- Vite によるローカルプレビュー
- GitHub Pages の `main` branch / `docs` folder 公開を想定

GitHub Actions は使いません。ローカルで `npm run build` を実行し、生成された `docs/` を commit / push して公開します。

## ディレクトリ構成

```text
.
├── content/
│   ├── ai-news/
│   │   └── 2026-04/
│   │       ├── 2026-04-17.md
│   │       └── 2026-04-18.md
│   ├── ai-tools-news/
│   └── general-news/
├── docs/                    # build 後の GitHub Pages 公開物
├── prompts/                 # 将来のニュース生成プロンプト置き場
├── scripts/
│   ├── build-content-index.ts
│   ├── build-site.ts
│   └── validate-content.ts
├── src/
│   ├── config/
│   │   ├── categories.ts
│   │   └── site.ts
│   ├── lib/
│   ├── styles/
│   └── templates/
├── .env.example
├── package.json
└── tsconfig.json
```

## 初回セットアップ

```bash
npm install
npm run build
```

ローカルで確認する場合:

```bash
npm run dev
```

Vite が表示する URL をブラウザで開いて確認します。

## よく使うコマンド

```bash
npm run validate
```

`content/` 配下の frontmatter と本文構造を検証します。

```bash
npm run build
```

バリデーション後、静的サイトを `docs/` に生成します。

```bash
npm run index
```

`docs/content-index.json` だけを生成します。外部ツールや将来の自動生成処理がコンテンツ一覧を読む用途を想定しています。

```bash
npm run typecheck
```

TypeScript の型チェックを行います。

## 毎日の手動更新フロー

1. `content/<category>/<YYYY-MM>/<YYYY-MM-DD>.md` を追加する
2. `npm run validate` を実行する
3. `npm run build` を実行する
4. `npm run dev` でローカル表示を確認する
5. 問題なければ `content/`、`docs/`、必要な設定変更を commit する
6. `main` branch に push して GitHub Pages に反映する

## コンテンツファイル形式

1ファイル1日単位です。例:

```text
content/ai-news/2026-04/2026-04-18.md
```

最低限、次の形式で作成します。

```markdown
---
category: ai-news
date: "2026-04-18"
title: "2026年4月18日 AIニュース解説"
summary: "その日の総評の短い要約"
featured_theme: "注目テーマ"
next_watch: "次に見ること"
key_point: "重要ポイント"
ranking:
  - rank: 1
    title: "ニュースタイトル"
    source_name: "発表元 / 情報源"
    published_at: "2026-04-18T09:30:00+09:00"
    url: "https://example.com/news"
    points:
      - "要点1"
      - "要点2"
    reason: "注目理由"
    impact: "影響"
    caution: "注意点"
---

## 今日の総評

本文を書きます。

## 最後のまとめ

本文を書きます。
```

`ランキング本編` は frontmatter の `ranking` から自動生成されます。日別ページの冒頭にはタイトルのみのランキング一覧が出力され、各順位の `#rank-1`、`#rank-2` へアンカーリンクで移動できます。

## バリデーション内容

`npm run validate` では、最低限次を確認します。

- frontmatter 必須項目が存在する
- `ranking` が1件以上ある
- `rank` が1からの連番である
- `title` が空でない
- `url` が空でなく、URLとして解釈できる
- `date` が妥当な `YYYY-MM-DD` である
- `category` とディレクトリ名が一致する
- `date` とファイル名、月ディレクトリが一致する
- 本文に `## 今日の総評` と `## 最後のまとめ` がある

## ページ構成

- `/`
  - カテゴリ一覧
  - 各カテゴリの最新日付へのリンク
  - 各カテゴリの最新記事URL
  - 各カテゴリの最新記事内ランキングTOP3
- `/<category>/`
  - カテゴリページ
  - 月別切替
  - 日別一覧
- `/<category>/<YYYY>/<MM>/`
  - 同カテゴリの月別一覧
  - 日別詳細ページから戻る先
- `/<category>/<YYYY>/<MM>/<DD>/`
  - 日別詳細ページ
  - ランキング一覧
  - 今日の総評
  - ランキング本編
  - 最後のまとめ

## GitHub Pages 公開手順

1. GitHub にリポジトリを作成し、この内容を push する
2. ローカルで `npm install` を実行する
3. `SITE_BASE_URL` を指定して build する

```bash
SITE_BASE_URL=https://your-account.github.io/your-repository npm run build
```

4. 生成された `docs/` を含めて commit / push する
5. GitHub のリポジトリ設定を開く
6. `Settings` → `Pages` を開く
7. `Build and deployment` で `Deploy from a branch` を選ぶ
8. Branch を `main`、folder を `/docs` にする
9. 保存後、GitHub Pages の公開 URL を確認する

GitHub Actions は不要です。更新時は、手元で build して `docs/` を更新し、commit / push します。

## カテゴリ追加

例として金融ニュースを追加する場合:

1. `content/finance-news/2026-04/2026-04-18.md` を追加する
2. 必要に応じて `src/config/categories.ts` に表示名と説明文を追加する
3. `npm run validate`
4. `npm run build`

`src/config/categories.ts` に定義がないカテゴリも、content 側に存在すればフォールバック表示で生成されます。ただし、トップページの表示名や説明を整えるため、カテゴリを増やしたら設定も追加する運用を推奨します。

## トップページの表示ルール

トップページにはヒーローや独立した最新記事一覧を置かず、カテゴリ一覧だけを表示します。各カテゴリカードには、そのカテゴリの最新更新日、最新記事URL、最新記事内ランキングTOP3を表示します。

古い日付の記事は、カテゴリページ、月別ページ、日別詳細ページから閲覧します。

ランキング表示件数は `src/config/site.ts` の `homepage.categoryCardTopRankCount` で管理しています。

## 環境変数

```bash
SITE_BASE_URL=https://your-account.github.io/your-repository
```

`SITE_BASE_URL` は sitemap、RSS、OGP の絶対URL生成に使います。未指定の場合はローカル確認用の `http://localhost:5173` が使われます。

## 今後の拡張ポイント

- `scripts/generate-news.ts` を追加して、AI生成結果を `content/` に保存する
- `prompts/` 配下にカテゴリ別の生成方針を整備する
- ニュースソース一覧ページを追加する
- 関連記事やタグを frontmatter に追加する
- カテゴリ別の補足メタデータを `src/config/categories.ts` に追加する
- 画像サムネイルを frontmatter に追加する
