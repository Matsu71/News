import { siteConfig } from "../config/site.js";
import type { CategoryBundle, NewsEntry, SiteData } from "../types.js";
import { dateToRfc822 } from "./dates.js";
import { absoluteUrl, escapeXml } from "./html.js";

export function renderSitemap(routes: string[]): string {
  const urls = routes
    .sort()
    .map((route) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderRootRss(data: SiteData): string {
  return renderRss({
    title: siteConfig.title,
    description: siteConfig.description,
    route: "/rss.xml",
    siteRoute: "/",
    entries: data.entries
  });
}

export function renderCategoryRss(category: CategoryBundle): string {
  return renderRss({
    title: `${category.definition.name} | ${siteConfig.title}`,
    description: category.definition.description,
    route: category.rssRoute,
    siteRoute: category.route,
    entries: category.entries
  });
}

function renderRss({
  title,
  description,
  route,
  siteRoute,
  entries
}: {
  title: string;
  description: string;
  route: string;
  siteRoute: string;
  entries: NewsEntry[];
}): string {
  const items = entries
    .slice(0, 50)
    .map((entry) => {
      const topTitle = entry.ranking[0]?.title ? `1位: ${entry.ranking[0].title}` : "";
      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(absoluteUrl(entry.route))}</link>
      <guid>${escapeXml(absoluteUrl(entry.route))}</guid>
      <pubDate>${dateToRfc822(entry.date)}</pubDate>
      <description>${escapeXml([entry.summary, topTitle].filter(Boolean).join(" / "))}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(absoluteUrl(siteRoute))}</link>
    <description>${escapeXml(description)}</description>
    <language>ja</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(absoluteUrl(route))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
