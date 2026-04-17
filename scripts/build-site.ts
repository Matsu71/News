import fs from "node:fs";
import path from "node:path";
import { loadNewsEntries } from "../src/lib/content.js";
import { renderCategoryRss, renderRootRss, renderSitemap } from "../src/lib/feeds.js";
import { routeToOutputPath } from "../src/lib/html.js";
import { createSiteCardPng } from "../src/lib/png.js";
import { buildSiteData } from "../src/lib/site-data.js";
import {
  renderCategoryPage,
  renderDailyPage,
  renderHomePage,
  renderMonthPage
} from "../src/templates/pages.js";
import { buildContentIndex } from "./build-content-index.js";

const outDir = path.resolve(process.cwd(), "docs");
const cssSource = path.resolve(process.cwd(), "src", "styles", "main.css");

const loaded = loadNewsEntries();
for (const warning of loaded.warnings) {
  console.warn(`Warning: ${warning}`);
}
if (loaded.errors.length > 0) {
  console.error("Build stopped because content validation failed.");
  for (const error of loaded.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const data = buildSiteData(loaded.entries);
const routes: string[] = ["/"];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "assets"), { recursive: true });

writePage("/", renderHomePage(data));

for (const category of data.categories) {
  writePage(category.route, renderCategoryPage(data, category));
  routes.push(category.route);

  writeFile(category.rssRoute, renderCategoryRss(category));

  for (const month of category.months) {
    writePage(month.route, renderMonthPage(data, category, month));
    routes.push(month.route);
  }

  for (const entry of category.entries) {
    writePage(entry.route, renderDailyPage(data, category, entry));
    routes.push(entry.route);
  }
}

writeFile("/rss.xml", renderRootRss(data));
writeFile("/sitemap.xml", renderSitemap(routes));
writeFile("/content-index.json", `${buildContentIndex()}\n`);
writeFile("/.nojekyll", "");
fs.copyFileSync(cssSource, path.join(outDir, "assets", "main.css"));
fs.writeFileSync(path.join(outDir, "assets", "site-card.png"), createSiteCardPng());

console.log(`Built ${routes.length} HTML page(s) into docs/.`);

function writePage(route: string, html: string): void {
  writeFile(route, html);
}

function writeFile(route: string, content: string | Buffer): void {
  const outputPath = routeToOutputPath(outDir, route);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}
