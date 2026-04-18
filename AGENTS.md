# AGENTS.md

## Purpose

このリポジトリは、AIニュース / AIツールニュース / 一般ニュースなどの毎日更新コンテンツを、GitHub Pages で公開できる静的Webサイトとして管理するためのワークスペースである。

## Project Rules

- 日本語UIと日本語コンテンツを前提にする。
- ニュース本文は `content/` 配下の Markdown + YAML frontmatter で、1ファイル1日単位で管理する。
- GitHub Actions は使わず、手元で `npm run build` を実行して `docs/` を commit / push する。
- トップページにはヒーローや独立した最新記事一覧を置かず、カテゴリ一覧だけを表示する。
- トップページの各カテゴリカードには、最新更新日、最新記事URL、最新記事内ランキングTOP3を表示する。
- 古い日付の記事はカテゴリページ、月別ページ、日別ページから閲覧させる。
- カテゴリ追加時は `content/<category>/` を増やし、必要に応じて `src/config/categories.ts` に表示名と説明を追加する。
- 変更後は `npm run build` で validation と typecheck を通し、生成済み `docs/` も更新する。

## Content Rules

- frontmatter の `category` はディレクトリ名と一致させる。
- frontmatter の `date` はファイル名と一致させる。
- `ranking` は1件以上、`rank` は1からの連番にする。
- 本文には `## 今日の総評` と `## 最後のまとめ` を必ず含める。
- 実ニュースでは、事実と推測を混在させない。推測を書く場合は明示する。
