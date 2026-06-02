import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const BASE = resolve(process.cwd());

function walk(dir, pattern) {
  const results = [];
  const list = readdirSync(dir);
  for (const entry of list) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...walk(full, pattern));
    } else if (pattern.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

const dirs = [
  join(BASE, 'src', 'features'),
  join(BASE, 'app', '(dashboard)'),
  join(BASE, 'src', 'components'),
];

let files = [];
for (const d of dirs) {
  files.push(...walk(d, /\.tsx$/));
}

// Exclude src/components/ui/
files = files.filter(f => !f.replace(/\\/g, '/').includes('src/components/ui/'));

console.log(`Processing ${files.length} files...`);

const replacements = [];

// Status badges - must match EXACT combined pattern first (before individual replacements)
const badgeReplacements = [
  {
    match: /\bbg-green-100\s+text-green-800\b/g,
    replacement: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  },
  {
    match: /\bbg-red-100\s+text-red-800\b/g,
    replacement: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  },
  {
    match: /\bbg-blue-100\s+text-blue-800\b/g,
    replacement: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  },
  {
    match: /\bbg-purple-100\s+text-purple-800\b/g,
    replacement: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  },
];

// Text colors - order matters: more specific first
const textReplacements = [
  { match: /\btext-gray-600\b/g, replacement: 'text-muted-foreground' },
  { match: /\btext-gray-500\b/g, replacement: 'text-muted-foreground' },
  { match: /\btext-gray-400\b/g, replacement: 'text-muted-foreground/60' },
  { match: /\btext-gray-700\b/g, replacement: 'text-foreground/70' },
  { match: /\btext-gray-800\b/g, replacement: 'text-foreground/80' },
];

// Background colors
const bgReplacements = [
  { match: /\bbg-gray-100\b/g, replacement: 'bg-muted' },
  { match: /\bbg-white\b/g, replacement: 'bg-background' },
];

// Hover states
const hoverReplacements = [
  { match: /\bhover:bg-gray-50\b/g, replacement: 'hover:bg-muted/50' },
];

// Card title specific
const cardReplacements = [
  { match: /\btext-sm\s+text-gray-500\b/g, replacement: 'text-sm text-muted-foreground' },
];

let totalReplacements = 0;
let modifiedFiles = [];

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let fileReplacements = 0;

  // Apply badge replacements first (combined patterns)
  for (const { match, replacement } of badgeReplacements) {
    const newContent = content.replace(match, () => {
      fileReplacements++;
      return replacement;
    });
    content = newContent;
  }

  // Apply card title replacements
  for (const { match, replacement } of cardReplacements) {
    const newContent = content.replace(match, () => {
      fileReplacements++;
      return replacement;
    });
    content = newContent;
  }

  // Apply text replacements
  for (const { match, replacement } of textReplacements) {
    const newContent = content.replace(match, () => {
      fileReplacements++;
      return replacement;
    });
    content = newContent;
  }

  // Apply bg replacements
  for (const { match, replacement } of bgReplacements) {
    const newContent = content.replace(match, () => {
      fileReplacements++;
      return replacement;
    });
    content = newContent;
  }

  // Apply hover replacements
  for (const { match, replacement } of hoverReplacements) {
    const newContent = content.replace(match, () => {
      fileReplacements++;
      return replacement;
    });
    content = newContent;
  }

  if (fileReplacements > 0) {
    writeFileSync(file, content, 'utf-8');
    modifiedFiles.push({ file: file.replace(BASE, ''), replacements: fileReplacements });
    totalReplacements += fileReplacements;
  }
}

console.log('\nModified files:');
for (const { file, replacements } of modifiedFiles) {
  console.log(`  ${file} (${replacements} replacements)`);
}
console.log(`\nTotal: ${totalReplacements} replacements across ${modifiedFiles.length} files`);
