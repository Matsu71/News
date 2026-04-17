import { buildCategoryList } from "../config/categories.js";
import type { CategoryBundle, NewsEntry, SiteData } from "../types.js";
import { compareDateAsc, compareDateDesc, monthToRouteParts } from "./dates.js";

export function buildSiteData(entries: NewsEntry[]): SiteData {
  const categoryKeys = [...new Set(entries.map((entry) => entry.category))].sort();
  const definitions = buildCategoryList(categoryKeys);

  const categories: CategoryBundle[] = definitions.map((definition) => {
    const categoryEntries = entries.filter((entry) => entry.category === definition.key).sort(compareDateDesc);
    const months = [...new Set(categoryEntries.map((entry) => entry.month))]
      .sort((a, b) => b.localeCompare(a))
      .map((month) => {
        const { year, monthNumber } = monthToRouteParts(month);
        return {
          month,
          route: `/${definition.key}/${year}/${monthNumber}/`,
          entries: categoryEntries.filter((entry) => entry.month === month).sort(compareDateDesc)
        };
      });

    return {
      definition,
      route: `/${definition.key}/`,
      rssRoute: `/${definition.key}/rss.xml`,
      entries: categoryEntries,
      months,
      latestEntry: categoryEntries[0] ?? null
    };
  });

  return {
    categories,
    entries: [...entries].sort(compareDateDesc)
  };
}

export function findAdjacentEntries(entries: NewsEntry[], current: NewsEntry): {
  previous: NewsEntry | null;
  next: NewsEntry | null;
} {
  const sameCategory = entries.filter((entry) => entry.category === current.category).sort(compareDateAsc);
  const index = sameCategory.findIndex((entry) => entry.route === current.route);

  return {
    previous: index > 0 ? sameCategory[index - 1] : null,
    next: index >= 0 && index < sameCategory.length - 1 ? sameCategory[index + 1] : null
  };
}
