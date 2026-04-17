export type CategoryKey = string;

export interface CategoryDefinition {
  key: CategoryKey;
  name: string;
  description: string;
}

export interface RankingItem {
  rank: number;
  title: string;
  source_name: string;
  published_at: string;
  url: string;
  points: string[];
  reason: string;
  impact: string;
  caution: string;
}

export interface NewsFrontmatter {
  category: CategoryKey;
  date: string;
  title: string;
  summary: string;
  featured_theme: string;
  next_watch: string;
  key_point: string;
  ranking: RankingItem[];
}

export interface NewsEntry extends NewsFrontmatter {
  filePath: string;
  relativePath: string;
  body: string;
  month: string;
  route: string;
  monthRoute: string;
  summaryMarkdown: string;
  finalMarkdown: string;
  summaryHtml: string;
  finalHtml: string;
}

export interface LoadResult {
  entries: NewsEntry[];
  errors: string[];
  warnings: string[];
}

export interface MonthBundle {
  month: string;
  route: string;
  entries: NewsEntry[];
}

export interface CategoryBundle {
  definition: CategoryDefinition;
  route: string;
  rssRoute: string;
  entries: NewsEntry[];
  months: MonthBundle[];
  latestEntry: NewsEntry | null;
}

export interface SiteData {
  categories: CategoryBundle[];
  entries: NewsEntry[];
}
