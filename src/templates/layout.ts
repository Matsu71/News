import { siteConfig } from "../config/site.js";
import type { CategoryBundle } from "../types.js";
import { absoluteUrl, escapeHtml, relativeUrl } from "../lib/html.js";

export function renderLayout({
  route,
  title,
  description,
  children,
  categories,
  activeCategory
}: {
  route: string;
  title: string;
  description: string;
  children: string;
  categories: CategoryBundle[];
  activeCategory?: string;
}): string {
  const pageTitle = title === siteConfig.title ? title : `${title} | ${siteConfig.title}`;
  const ogImage = absoluteUrl("/assets/site-card.png");
  const activeCategoryBundle = categories.find((category) => category.definition.key === activeCategory);

  return `<!doctype html>
<html lang="${siteConfig.language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(absoluteUrl(route))}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="${escapeHtml(absoluteUrl(route))}">
    <link rel="stylesheet" href="${relativeUrl(route, "/assets/main.css")}">
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(siteConfig.title)} RSS" href="${relativeUrl(route, "/rss.xml")}">
    ${
      activeCategoryBundle
        ? `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(activeCategoryBundle.definition.name)} RSS" href="${relativeUrl(route, activeCategoryBundle.rssRoute)}">`
        : ""
    }
  </head>
  <body id="top">
    <header class="site-header">
      <div class="shell header-inner">
        <div class="brand-block">
          <a class="site-title" href="${relativeUrl(route, "/")}">${escapeHtml(siteConfig.title)}</a>
          <p class="site-description">${escapeHtml(siteConfig.description)}</p>
        </div>
        <nav class="category-tabs" aria-label="カテゴリ">
          ${categories
            .map((category) => {
              const active = category.definition.key === activeCategory ? " aria-current=\"page\"" : "";
              return `<a class="category-tab" href="${relativeUrl(route, category.route)}"${active}>${escapeHtml(category.definition.name)}</a>`;
            })
            .join("")}
        </nav>
      </div>
    </header>
    <main>
      ${children}
    </main>
    <footer class="site-footer">
      <div class="shell footer-inner">
        <p>静的生成されたニュース解説サイトです。コンテンツは Markdown で管理されています。</p>
        <a href="${relativeUrl(route, "/rss.xml")}">RSS</a>
        <a href="${relativeUrl(route, "/sitemap.xml")}">sitemap</a>
      </div>
    </footer>
    <a class="back-to-top" href="#top">ページ上部へ</a>
  </body>
</html>`;
}
