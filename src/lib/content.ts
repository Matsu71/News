import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { extractSection, renderMarkdown } from "./markdown.js";
import {
  isValidDateString,
  isValidDateTimeString,
  monthToRouteParts,
  toMonthId
} from "./dates.js";
import type { LoadResult, NewsEntry, NewsFrontmatter, RankingItem } from "../types.js";

const CONTENT_DIR = path.resolve(process.cwd(), "content");
const REQUIRED_STRING_FIELDS: Array<keyof Omit<NewsFrontmatter, "ranking">> = [
  "category",
  "date",
  "title",
  "summary",
  "featured_theme",
  "next_watch",
  "key_point"
];
const REQUIRED_RANKING_FIELDS: Array<keyof Omit<RankingItem, "rank" | "points">> = [
  "title",
  "source_name",
  "published_at",
  "url",
  "reason",
  "impact",
  "caution"
];

export function loadNewsEntries(): LoadResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entries: NewsEntry[] = [];

  if (!fs.existsSync(CONTENT_DIR)) {
    return { entries, errors: [`content ディレクトリが見つかりません: ${CONTENT_DIR}`], warnings };
  }

  const files = walkMarkdownFiles(CONTENT_DIR);
  for (const filePath of files) {
    const result = loadNewsFile(filePath);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.entry) {
      entries.push(result.entry);
    }
  }

  return {
    entries: entries.sort((a, b) =>
      a.category === b.category ? b.date.localeCompare(a.date) : a.category.localeCompare(b.category)
    ),
    errors,
    warnings
  };
}

function loadNewsFile(filePath: string): {
  entry: NewsEntry | null;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const parts = relativePath.split(path.sep);

  if (parts.length !== 3) {
    errors.push(`${relativePath}: content/<category>/<YYYY-MM>/<YYYY-MM-DD>.md の形式で配置してください。`);
  }

  const [categoryDir = "", monthDir = "", fileName = ""] = parts;
  const fileDate = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parseFrontmatter(raw, relativePath);
  errors.push(...parsed.errors);

  if (!parsed.data) {
    return { entry: null, errors, warnings };
  }

  const frontmatter = normalizeFrontmatter(parsed.data);
  const entryErrors = validateFrontmatter(frontmatter, {
    relativePath,
    categoryDir,
    monthDir,
    fileDate,
    body: parsed.body
  });
  errors.push(...entryErrors);

  const summaryMarkdown = extractSection(parsed.body, "今日の総評") ?? "";
  const finalMarkdown = extractSection(parsed.body, "最後のまとめ") ?? "";
  if (!summaryMarkdown) {
    warnings.push(`${relativePath}: 本文に「## 今日の総評」が見つかりません。`);
  }
  if (!finalMarkdown) {
    warnings.push(`${relativePath}: 本文に「## 最後のまとめ」が見つかりません。`);
  }

  const month = toMonthId(frontmatter.date);
  const { year, monthNumber } = monthToRouteParts(month);
  const day = frontmatter.date.slice(8, 10);

  const entry: NewsEntry = {
    ...frontmatter,
    filePath,
    relativePath,
    body: parsed.body,
    month,
    route: `/${frontmatter.category}/${year}/${monthNumber}/${day}/`,
    monthRoute: `/${frontmatter.category}/${year}/${monthNumber}/`,
    summaryMarkdown,
    finalMarkdown,
    summaryHtml: renderMarkdown(summaryMarkdown || frontmatter.summary),
    finalHtml: renderMarkdown(finalMarkdown)
  };

  return { entry, errors, warnings };
}

function parseFrontmatter(raw: string, relativePath: string): {
  data: Record<string, unknown> | null;
  body: string;
  errors: string[];
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      data: null,
      body: raw,
      errors: [`${relativePath}: YAML frontmatter が見つかりません。`]
    };
  }

  try {
    const data = YAML.parse(match[1]) as Record<string, unknown> | null;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {
        data: null,
        body: match[2],
        errors: [`${relativePath}: frontmatter はオブジェクト形式で書いてください。`]
      };
    }
    return { data, body: match[2], errors: [] };
  } catch (error) {
    return {
      data: null,
      body: match[2],
      errors: [`${relativePath}: YAML frontmatter の解析に失敗しました: ${(error as Error).message}`]
    };
  }
}

function normalizeFrontmatter(data: Record<string, unknown>): NewsFrontmatter {
  return {
    category: toText(data.category),
    date: toText(data.date),
    title: toText(data.title),
    summary: toText(data.summary),
    featured_theme: toText(data.featured_theme),
    next_watch: toText(data.next_watch),
    key_point: toText(data.key_point),
    ranking: Array.isArray(data.ranking) ? data.ranking.map((item) => normalizeRankingItem(item)) : []
  };
}

function normalizeRankingItem(item: unknown): RankingItem {
  const raw = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
  const points = raw.points;

  return {
    rank: Number(raw.rank),
    title: toText(raw.title),
    source_name: toText(raw.source_name),
    published_at: toText(raw.published_at),
    url: toText(raw.url),
    points: Array.isArray(points) ? points.map((point) => toText(point)).filter(Boolean) : [toText(points)].filter(Boolean),
    reason: toText(raw.reason),
    impact: toText(raw.impact),
    caution: toText(raw.caution)
  };
}

function validateFrontmatter(
  frontmatter: NewsFrontmatter,
  context: {
    relativePath: string;
    categoryDir: string;
    monthDir: string;
    fileDate: string;
    body: string;
  }
): string[] {
  const errors: string[] = [];
  const prefix = `${context.relativePath}:`;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`${prefix} frontmatter.${field} は必須です。`);
    }
  }

  if (frontmatter.category && frontmatter.category !== context.categoryDir) {
    errors.push(`${prefix} category とディレクトリ名が一致しません (${frontmatter.category} !== ${context.categoryDir})。`);
  }

  if (!isValidDateString(frontmatter.date)) {
    errors.push(`${prefix} date は YYYY-MM-DD の妥当な日付で指定してください。`);
  } else {
    if (frontmatter.date !== context.fileDate) {
      errors.push(`${prefix} date とファイル名が一致しません (${frontmatter.date} !== ${context.fileDate})。`);
    }
    if (toMonthId(frontmatter.date) !== context.monthDir) {
      errors.push(`${prefix} date と月ディレクトリが一致しません (${toMonthId(frontmatter.date)} !== ${context.monthDir})。`);
    }
  }

  if (!Array.isArray(frontmatter.ranking) || frontmatter.ranking.length === 0) {
    errors.push(`${prefix} ranking は1件以上必要です。`);
  }

  frontmatter.ranking.forEach((item, index) => {
    const expectedRank = index + 1;
    if (item.rank !== expectedRank) {
      errors.push(`${prefix} ranking[${index}].rank は ${expectedRank} にしてください。`);
    }

    for (const field of REQUIRED_RANKING_FIELDS) {
      if (!item[field]) {
        errors.push(`${prefix} ranking[${index}].${field} は必須です。`);
      }
    }

    if (item.points.length === 0) {
      errors.push(`${prefix} ranking[${index}].points は1件以上必要です。`);
    }

    if (item.url) {
      try {
        new URL(item.url);
      } catch {
        errors.push(`${prefix} ranking[${index}].url は妥当な URL にしてください。`);
      }
    }

    if (item.published_at && !isValidDateTimeString(item.published_at)) {
      errors.push(`${prefix} ranking[${index}].published_at は日時として解釈できる形式にしてください。`);
    }
  });

  if (!/^##\s+今日の総評/m.test(context.body)) {
    errors.push(`${prefix} 本文に「## 今日の総評」を追加してください。`);
  }
  if (!/^##\s+最後のまとめ/m.test(context.body)) {
    errors.push(`${prefix} 本文に「## 最後のまとめ」を追加してください。`);
  }

  return errors;
}

function walkMarkdownFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value).trim();
}
