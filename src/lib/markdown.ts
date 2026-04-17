import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = token.attrGet("href") ?? "";
  if (/^https?:\/\//.test(href)) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source: string): string {
  return markdown.render(source.trim());
}

export function extractSection(source: string, headingText: string): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(headingText)}\\s*$`);
  const nextSectionPattern = /^##\s+/;
  const start = lines.findIndex((line) => headingPattern.test(line.trim()));

  if (start === -1) {
    return null;
  }

  const collected: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (nextSectionPattern.test(lines[index].trim())) {
      break;
    }
    collected.push(lines[index]);
  }

  return collected.join("\n").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
