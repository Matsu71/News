import type { CategoryBundle, MonthBundle, NewsEntry } from "../types.js";
import { formatDateJa, formatMonthJa } from "../lib/dates.js";
import { escapeHtml, relativeUrl } from "../lib/html.js";

export function renderBreadcrumb(
  route: string,
  items: Array<{ label: string; route?: string }>
): string {
  return `<nav class="breadcrumb" aria-label="パンくず">
    ${items
      .map((item, index) => {
        const itemRoute = item.route;
        const isLast = index === items.length - 1 || !itemRoute;
        if (isLast) {
          return `<span>${escapeHtml(item.label)}</span>`;
        }
        return `<a href="${relativeUrl(route, itemRoute)}">${escapeHtml(item.label)}</a>`;
      })
      .join("<span aria-hidden=\"true\">/</span>")}
  </nav>`;
}

export function renderMonthTabs(route: string, months: MonthBundle[], activeMonth?: string): string {
  if (months.length === 0) {
    return "";
  }

  return `<nav class="month-tabs" aria-label="月別切替">
    ${months
      .map((month) => {
        const active = month.month === activeMonth ? " aria-current=\"page\"" : "";
        return `<a class="month-tab" href="${relativeUrl(route, month.route)}"${active}>${escapeHtml(formatMonthJa(month.month))}</a>`;
      })
      .join("")}
  </nav>`;
}

export function renderDayList(route: string, entries: NewsEntry[]): string {
  if (entries.length === 0) {
    return `<p class="empty-message">この月のニュースはまだありません。</p>`;
  }

  return `<div class="day-list">
    ${entries
      .map((entry) => {
        const topRank = entry.ranking[0]?.title ?? "未登録";
        return `<article class="day-card">
          <p class="day-card-date">${escapeHtml(formatDateJa(entry.date))}</p>
          <h3><a href="${relativeUrl(route, entry.route)}">${escapeHtml(entry.title)}</a></h3>
          <p>${escapeHtml(entry.summary)}</p>
          <p class="top-rank">1位: ${escapeHtml(topRank)}</p>
        </article>`;
      })
      .join("")}
  </div>`;
}

export function renderCategoryQuickLinks(
  route: string,
  categories: CategoryBundle[],
  activeCategory?: string
): string {
  return `<nav class="inline-switch" aria-label="カテゴリ切替">
    <span>カテゴリ切替</span>
    ${categories
      .map((category) => {
        const active = category.definition.key === activeCategory ? " aria-current=\"page\"" : "";
        return `<a href="${relativeUrl(route, category.route)}"${active}>${escapeHtml(category.definition.name)}</a>`;
      })
      .join("")}
  </nav>`;
}
