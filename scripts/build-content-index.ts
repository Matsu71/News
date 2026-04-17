import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadNewsEntries } from "../src/lib/content.js";
import { buildSiteData } from "../src/lib/site-data.js";

export function buildContentIndex(): string {
  const loaded = loadNewsEntries();
  if (loaded.errors.length > 0) {
    throw new Error(`content validation failed:\n${loaded.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  const data = buildSiteData(loaded.entries);
  return JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      categories: data.categories.map((category) => ({
        key: category.definition.key,
        name: category.definition.name,
        description: category.definition.description,
        route: category.route,
        latest_date: category.latestEntry?.date ?? null,
        months: category.months.map((month) => ({
          month: month.month,
          route: month.route,
          dates: month.entries.map((entry) => entry.date)
        }))
      })),
      entries: data.entries.map((entry) => ({
        category: entry.category,
        date: entry.date,
        month: entry.month,
        title: entry.title,
        summary: entry.summary,
        route: entry.route,
        month_route: entry.monthRoute,
        top_rank_title: entry.ranking[0]?.title ?? null,
        ranking_count: entry.ranking.length
      }))
    },
    null,
    2
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputPath = path.resolve(process.cwd(), "docs", "content-index.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${buildContentIndex()}\n`);
  console.log(`Wrote ${outputPath}`);
}
