import type { CategoryDefinition, CategoryKey } from "../types.js";

export const categoryDefinitions: CategoryDefinition[] = [
  {
    key: "ai-news",
    name: "AIニュース",
    description: "AI技術、研究、規制、企業動向を中心に扱います。"
  },
  {
    key: "ai-tools-news",
    name: "AIツールニュース",
    description: "生成AIツール、業務活用、プロダクト更新を中心に扱います。"
  },
  {
    key: "general-news",
    name: "一般ニュース",
    description: "社会、経済、国際、テクノロジー全般の主要ニュースを扱います。"
  }
];

export function getCategoryDefinition(key: CategoryKey): CategoryDefinition {
  return (
    categoryDefinitions.find((category) => category.key === key) ?? {
      key,
      name: key
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      description: "content 配下に追加されたカテゴリです。必要に応じて src/config/categories.ts に説明文を追加してください。"
    }
  );
}

export function buildCategoryList(contentCategoryKeys: CategoryKey[]): CategoryDefinition[] {
  const keys = new Set<CategoryKey>();
  for (const category of categoryDefinitions) {
    keys.add(category.key);
  }
  for (const key of contentCategoryKeys) {
    keys.add(key);
  }
  return [...keys].map((key) => getCategoryDefinition(key));
}
