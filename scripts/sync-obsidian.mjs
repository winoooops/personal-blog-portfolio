#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const args = process.argv.slice(2);
const configArgIndex = args.findIndex((arg) => arg === '--config');
const configPath = path.resolve(
  cwd,
  configArgIndex >= 0 ? args[configArgIndex + 1] : 'obsidian.config.json',
);
const dryRun = args.includes('--dry-run');

if (!existsSync(configPath)) {
  console.error(`Missing config: ${path.relative(cwd, configPath)}`);
  console.error('Create one from obsidian.config.example.json, then run npm run sync:obsidian.');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const vaultPath = path.resolve(cwd, config.vaultPath || '');
const outputDir = path.resolve(cwd, config.outputDir || 'src/content/posts');
const assetOutputDir = path.resolve(cwd, config.assetOutputDir || 'public/obsidian-assets');
const notes = Array.isArray(config.notes) ? config.notes : [];

const VALID_TAGS = ['Essay', 'Notes', 'Build', 'Tools', 'Process'];

if (!existsSync(vaultPath)) {
  console.error(`Vault path does not exist: ${vaultPath}`);
  process.exit(1);
}

if (notes.length === 0) {
  console.error('No notes configured. Add note paths to the "notes" array.');
  process.exit(1);
}

const noteSlugMap = new Map(
  notes.map((note) => {
    const source = typeof note === 'string' ? note : note.source;
    const sourcePath = path.resolve(vaultPath, source);
    const slug =
      (typeof note === 'string' ? '' : note.slug) ||
      slugify(path.basename(source, path.extname(source)));
    return [stripExtension(path.basename(sourcePath)).toLowerCase(), slug];
  }),
);

if (!dryRun) {
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(assetOutputDir, { recursive: true });
}

const copied = [];

for (const noteEntry of notes) {
  const note = typeof noteEntry === 'string' ? { source: noteEntry } : noteEntry;
  const sourcePath = path.resolve(vaultPath, note.source);

  if (!existsSync(sourcePath)) {
    console.warn(`Skipping missing note: ${note.source}`);
    continue;
  }

  const sourceText = readFileSync(sourcePath, 'utf8');
  const parsed = splitFrontmatter(sourceText);
  const sourceMeta = parseSimpleFrontmatter(parsed.frontmatter);
  const slug = note.slug || slugify(sourceMeta.slug || sourceMeta.title || path.basename(note.source, path.extname(note.source)));
  const title = note.title || sourceMeta.title || titleFromSlug(slug);
  const dek =
    note.dek || note.description || sourceMeta.dek || sourceMeta.description || `Notes on ${title}.`;
  const date =
    note.date ||
    note.pubDate ||
    sourceMeta.date ||
    sourceMeta.pubDate ||
    statSync(sourcePath).mtime.toISOString().slice(0, 10);
  const tag = pickTag(note.tag, sourceMeta.tag, note.tags, sourceMeta.tags);
  const featured = Boolean(note.featured ?? sourceMeta.featured ?? false);
  const draft = Boolean(note.draft ?? sourceMeta.draft ?? false);
  const transformedBody = transformObsidianSyntax(parsed.body, vaultPath, assetOutputDir);
  const readMin = note.readMin || sourceMeta.readMin || estimateReadMin(transformedBody);
  const frontmatterLines = [
    '---',
    `title: ${quoteYaml(title)}`,
    `tag: ${tag}`,
    `date: ${quoteYaml(date)}`,
    `readMin: ${readMin}`,
    `dek: ${quoteYaml(dek)}`,
  ];
  if (featured) frontmatterLines.push('featured: true');
  frontmatterLines.push(`draft: ${draft}`);
  frontmatterLines.push('source: obsidian');
  frontmatterLines.push(`obsidianPath: ${quoteYaml(note.source)}`);
  frontmatterLines.push('---', '');
  const frontmatter = frontmatterLines.join('\n');
  const targetPath = path.join(outputDir, `${slug}.md`);

  copied.push({ source: note.source, target: path.relative(cwd, targetPath) });

  if (!dryRun) {
    writeFileSync(targetPath, `${frontmatter}${transformedBody.trimStart()}\n`);
  }
}

for (const item of copied) {
  console.log(`${dryRun ? 'Would sync' : 'Synced'} ${item.source} -> ${item.target}`);
}

function pickTag(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const values = Array.isArray(candidate) ? candidate : [candidate];
    for (const raw of values) {
      const normalized = String(raw).trim();
      const match = VALID_TAGS.find((tag) => tag.toLowerCase() === normalized.toLowerCase());
      if (match) return match;
    }
  }
  return 'Notes';
}

function estimateReadMin(body) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: '', body: text };
  return {
    frontmatter: match[1],
    body: text.slice(match[0].length),
  };
}

function parseSimpleFrontmatter(frontmatter) {
  const meta = {};
  const lines = frontmatter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (rawValue === '') {
      const values = [];
      while (lines[index + 1]?.trimStart().startsWith('- ')) {
        index += 1;
        values.push(unquote(lines[index].trimStart().slice(2).trim()));
      }
      meta[key] = values;
    } else {
      meta[key] = parseScalar(rawValue);
    }
  }

  return meta;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item.trim()))
      .filter(Boolean);
  }
  return unquote(trimmed);
}

function transformObsidianSyntax(body, vaultPathValue, assetOutputDirValue) {
  return body
    .replace(/!\[\[([^\]]+)\]\]/g, (_match, target) => {
      const [assetName, altText] = target.split('|').map((part) => part.trim());
      const assetPath = findFileByName(vaultPathValue, assetName);
      if (!assetPath) return `![${altText || assetName}](${assetName})`;
      const safeName =
        slugify(path.basename(assetName, path.extname(assetName))) +
        path.extname(assetName).toLowerCase();
      const targetPath = path.join(assetOutputDirValue, safeName);
      if (!dryRun) copyFileSync(assetPath, targetPath);
      return `![${altText || path.basename(assetName, path.extname(assetName))}](../../obsidian-assets/${safeName})`;
    })
    .replace(/\[\[([^\]]+)\]\]/g, (_match, target) => {
      const [noteName, label] = target.split('|').map((part) => part.trim());
      const cleanName = stripExtension(path.basename(noteName));
      const slug = noteSlugMap.get(cleanName.toLowerCase());
      if (!slug) return label || cleanName;
      return `[${label || cleanName}](../${slug}/)`;
    });
}

function findFileByName(root, fileName) {
  const queue = [root];
  const wanted = path.basename(fileName).toLowerCase();

  while (queue.length > 0) {
    const current = queue.shift();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) queue.push(fullPath);
      } else if (entry.name.toLowerCase() === wanted) {
        return fullPath;
      }
    }
  }

  return '';
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function quoteYaml(value) {
  return JSON.stringify(String(value));
}

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function stripExtension(value) {
  return value.replace(/\.[^.]+$/, '');
}
