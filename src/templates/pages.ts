import { siteConfig } from "../config/site.js";
import { findAdjacentEntries } from "../lib/site-data.js";
import {
  absoluteUrl,
  displayUrlHost,
  escapeHtml,
  relativeUrl
} from "../lib/html.js";
import {
  formatDateJa,
  formatMonthJa,
  formatPublishedAt
} from "../lib/dates.js";
import type { CategoryBundle, MonthBundle, NewsEntry, SiteData } from "../types.js";
import { renderLayout } from "./layout.js";
import {
  renderBreadcrumb,
  renderCategoryQuickLinks,
  renderDayList,
  renderMonthTabs
} from "./components.js";

export function renderHomePage(data: SiteData): string {
  const route = "/";
  const children = `<section class="shell section-block home-categories">
      <div class="section-heading">
        <h2>カテゴリ一覧</h2>
      </div>
      <div class="category-grid">
        ${data.categories
          .map((category) => renderCategoryCard(route, category))
          .join("")}
      </div>
    </section>`;

  return renderLayout({
    route,
    title: siteConfig.title,
    description: siteConfig.description,
    categories: data.categories,
    children
  });
}

export function renderCategoryPage(data: SiteData, category: CategoryBundle): string {
  const route = category.route;
  const latestMonth = category.months[0]?.month;

  const children = `${renderBreadcrumb(route, [
      { label: "トップ", route: "/" },
      { label: category.definition.name }
    ])}
    <section class="shell section-block">
      <div class="category-page-header">
        <div>
          <p class="eyebrow">Category</p>
          <h1>${escapeHtml(category.definition.name)}</h1>
          <p>${escapeHtml(category.definition.description)}</p>
        </div>
        ${category.latestEntry ? `<a class="primary-link" href="${relativeUrl(route, category.latestEntry.route)}">最新日付を読む</a>` : ""}
      </div>
      ${renderCategoryQuickLinks(route, data.categories, category.definition.key)}
      ${renderMonthTabs(route, category.months, latestMonth)}
    </section>
    ${category.months
      .map(
        (month) => `<section class="shell month-section" id="month-${escapeHtml(month.month)}">
          <div class="month-heading">
            <h2>${escapeHtml(formatMonthJa(month.month))}</h2>
            <a href="${relativeUrl(route, month.route)}">この月だけ表示</a>
          </div>
          ${renderDayList(route, month.entries)}
        </section>`
      )
      .join("")}`;

  return renderLayout({
    route,
    title: category.definition.name,
    description: category.definition.description,
    categories: data.categories,
    activeCategory: category.definition.key,
    children
  });
}

export function renderMonthPage(data: SiteData, category: CategoryBundle, month: MonthBundle): string {
  const route = month.route;
  const description = `${category.definition.name}の${formatMonthJa(month.month)}の記事一覧です。`;

  const children = `${renderBreadcrumb(route, [
      { label: "トップ", route: "/" },
      { label: category.definition.name, route: category.route },
      { label: formatMonthJa(month.month) }
    ])}
    <section class="shell section-block">
      <div class="category-page-header">
        <div>
          <p class="eyebrow">Monthly Archive</p>
          <h1>${escapeHtml(category.definition.name)} ${escapeHtml(formatMonthJa(month.month))}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <a class="primary-link" href="${relativeUrl(route, category.route)}">カテゴリ一覧へ戻る</a>
      </div>
      ${renderCategoryQuickLinks(route, data.categories, category.definition.key)}
      ${renderMonthTabs(route, category.months, month.month)}
      ${renderDayList(route, month.entries)}
    </section>`;

  return renderLayout({
    route,
    title: `${category.definition.name} ${formatMonthJa(month.month)}`,
    description,
    categories: data.categories,
    activeCategory: category.definition.key,
    children
  });
}

export function renderDailyPage(data: SiteData, category: CategoryBundle, entry: NewsEntry): string {
  const route = entry.route;
  const adjacent = findAdjacentEntries(data.entries, entry);
  const description = entry.summary;

  const children = `${renderBreadcrumb(route, [
      { label: "トップ", route: "/" },
      { label: category.definition.name, route: category.route },
      { label: formatMonthJa(entry.month), route: entry.monthRoute },
      { label: formatDateJa(entry.date) }
    ])}
    <article class="reading-shell daily-article">
      <header class="daily-header">
        <p class="eyebrow">${escapeHtml(category.definition.name)} / ${escapeHtml(formatDateJa(entry.date))}</p>
        <h1>${escapeHtml(entry.title)}</h1>
        <p class="lead">${escapeHtml(entry.summary)}</p>
        <div class="daily-actions">
          ${adjacent.previous ? `<a href="${relativeUrl(route, adjacent.previous.route)}">前日</a>` : `<span>前日なし</span>`}
          <a href="${relativeUrl(route, entry.monthRoute)}">同月一覧へ戻る</a>
          ${adjacent.next ? `<a href="${relativeUrl(route, adjacent.next.route)}">翌日</a>` : `<span>翌日なし</span>`}
        </div>
        ${renderCategoryQuickLinks(route, data.categories, category.definition.key)}
        <dl class="daily-note-grid">
          <div>
            <dt>注目テーマ</dt>
            <dd>${escapeHtml(entry.featured_theme)}</dd>
          </div>
          <div>
            <dt>要点</dt>
            <dd>${escapeHtml(entry.key_point)}</dd>
          </div>
          <div>
            <dt>次に見ること</dt>
            <dd>${escapeHtml(entry.next_watch)}</dd>
          </div>
        </dl>
      </header>

      <section class="ranking-toc" aria-labelledby="ranking-list-title">
        <h2 id="ranking-list-title">ランキング一覧</h2>
        <ol>
          ${entry.ranking
            .map((item) => `<li><a href="${relativeUrl(route, `${entry.route}#rank-${item.rank}`)}">${escapeHtml(item.title)}</a></li>`)
            .join("")}
        </ol>
      </section>

      <section class="content-section" aria-labelledby="today-summary">
        <h2 id="today-summary">今日の総評</h2>
        <div class="markdown-body">${entry.summaryHtml}</div>
      </section>

      <section class="content-section" aria-labelledby="ranking-body">
        <h2 id="ranking-body">ランキング本編</h2>
        ${entry.ranking.map((item) => renderRankingItem(item)).join("")}
      </section>

      <section class="content-section" aria-labelledby="final-summary">
        <h2 id="final-summary">最後のまとめ</h2>
        <div class="markdown-body">${entry.finalHtml}</div>
      </section>
    </article>`;

  return renderLayout({
    route,
    title: entry.title,
    description,
    categories: data.categories,
    activeCategory: category.definition.key,
    children
  });
}

function renderCategoryCard(route: string, category: CategoryBundle): string {
  const latest = category.latestEntry;
  const latestUrl = latest ? absoluteUrl(latest.route) : "";
  const topRankCount = siteConfig.homepage.categoryCardTopRankCount;
  const topRanks = latest?.ranking.slice(0, topRankCount) ?? [];

  return `<article class="category-card">
    <h3><a href="${relativeUrl(route, category.route)}">${escapeHtml(category.definition.name)}</a></h3>
    <p>${escapeHtml(category.definition.description)}</p>
    <dl>
      <div>
        <dt>最新更新日</dt>
        <dd>${latest ? escapeHtml(formatDateJa(latest.date)) : "未登録"}</dd>
      </div>
      <div>
        <dt>最新記事</dt>
        <dd>${latest ? `<a href="${relativeUrl(route, latest.route)}">${escapeHtml(latest.title)}</a>` : "未登録"}</dd>
      </div>
      <div>
        <dt>最新記事URL</dt>
        <dd>${latest ? `<a class="article-url" href="${relativeUrl(route, latest.route)}">${escapeHtml(latestUrl)}</a>` : "未登録"}</dd>
      </div>
    </dl>
    <div class="category-top-ranks">
      <h4>最新記事ランキング TOP${topRankCount}</h4>
      ${
        topRanks.length > 0
          ? `<ol>
              ${topRanks
                .map((item) => `<li><a href="${relativeUrl(route, `${latest?.route ?? ""}#rank-${item.rank}`)}">${escapeHtml(item.title)}</a></li>`)
                .join("")}
            </ol>`
          : `<p>未登録</p>`
      }
    </div>
  </article>`;
}

function renderRankingItem(item: NewsEntry["ranking"][number]): string {
  return `<article class="rank-section" id="rank-${item.rank}">
    <div class="rank-title-row">
      <span class="rank-badge">${item.rank}位</span>
      <h3>${escapeHtml(item.title)}</h3>
    </div>
    <dl class="source-meta">
      <div>
        <dt>発表元 / 情報源</dt>
        <dd>${escapeHtml(item.source_name)}</dd>
      </div>
      <div>
        <dt>公開日時</dt>
        <dd>${escapeHtml(formatPublishedAt(item.published_at))}</dd>
      </div>
      <div>
        <dt>URL</dt>
        <dd><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayUrlHost(item.url))}</a></dd>
      </div>
    </dl>
    <div class="rank-detail">
      <h4>【要点】</h4>
      <ul>
        ${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
      </ul>
      <h4>【注目理由】</h4>
      <p>${escapeHtml(item.reason)}</p>
      <h4>【影響】</h4>
      <p>${escapeHtml(item.impact)}</p>
      <h4>【注意点】</h4>
      <p>${escapeHtml(item.caution)}</p>
    </div>
  </article>`;
}
