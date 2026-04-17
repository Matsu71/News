import { loadNewsEntries } from "../src/lib/content.js";

const result = loadNewsEntries();

for (const warning of result.warnings) {
  console.warn(`Warning: ${warning}`);
}

if (result.errors.length > 0) {
  console.error("Content validation failed.");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Content validation passed: ${result.entries.length} file(s).`);
