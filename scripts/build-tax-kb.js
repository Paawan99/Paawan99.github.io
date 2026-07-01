#!/usr/bin/env node
/**
 * build-tax-kb.js
 *
 * Dependency-free build script (Node built-ins only: fs, path).
 *
 * Reads every *.md note in vault/tax/ (public-safe Canadian tax/benefits
 * education notes) and compiles them into data/tax-kb.json, which grounds
 * the site's retrieval-only tax/benefits copilot.
 *
 * Note structure expected in each vault/tax/*.md file:
 *   # Title                     <- first H1 becomes the entry title
 *   tags: tax, benefits, ...    <- optional tags line near the top
 *   ## Section heading          <- becomes a retrieval chunk
 *   ...body...
 *   ## Sources                  <- special section: parsed into `sources`,
 *                                  excluded from `chunks`
 *   - https://www.canada.ca/... <- URLs extracted via regex
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const VAULT_TAX_DIR = path.join(ROOT_DIR, 'vault', 'tax');
const OUTPUT_FILE = path.join(ROOT_DIR, 'data', 'tax-kb.json');

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

/**
 * Split raw markdown body (after the H1/title line) into `## ` sections.
 * Returns an array of { heading, text } in document order, including a
 * possible "Sources" section (caller is responsible for separating it out).
 */
function splitIntoSections(body) {
  const lines = body.split(/\r?\n/);
  const sections = [];
  let currentHeading = null;
  let currentLines = [];

  function flush() {
    if (currentHeading === null) return;
    const text = currentLines.join('\n').trim();
    if (currentHeading.trim() && text) {
      sections.push({ heading: currentHeading.trim(), text });
    }
  }

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      currentHeading = match[1];
      currentLines = [];
    } else if (currentHeading !== null) {
      currentLines.push(line);
    }
    // Lines before the first "## " heading (e.g. tags line) are ignored here;
    // they're handled separately by extractTags/extractTitle.
  }
  flush();

  return sections;
}

function extractTitle(raw, fallback) {
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const match = /^#\s+(.+?)\s*$/.exec(line);
    if (match) return match[1].trim();
  }
  return fallback;
}

function extractTags(raw) {
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const match = /^tags:\s*(.+?)\s*$/i.exec(line);
    if (match) {
      return match[1]
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function extractSources(sectionText) {
  const matches = sectionText.match(URL_REGEX);
  if (!matches) return [];
  // De-duplicate while preserving order, strip trailing punctuation.
  const seen = new Set();
  const sources = [];
  for (let url of matches) {
    url = url.replace(/[.,;:)]+$/, '');
    if (!seen.has(url)) {
      seen.add(url);
      sources.push(url);
    }
  }
  return sources;
}

function buildKeywords(title, headings, tags) {
  const words = new Set();
  const addWordsFrom = (str) => {
    const tokens = str
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    for (const t of tokens) words.add(t);
  };

  addWordsFrom(title);
  for (const h of headings) addWordsFrom(h);
  for (const t of tags) addWordsFrom(t);

  return Array.from(words).join(' ');
}

function buildEntryFromFile(filename) {
  const filePath = path.join(VAULT_TAX_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');

  const id = filename.replace(/\.md$/i, '');
  const title = extractTitle(raw, id);
  const tags = extractTags(raw);

  const allSections = splitIntoSections(raw);

  const chunks = [];
  let sources = [];

  for (const section of allSections) {
    if (/^sources$/i.test(section.heading)) {
      sources = extractSources(section.text);
    } else {
      chunks.push({ heading: section.heading, text: section.text });
    }
  }

  const headings = chunks.map((c) => c.heading);
  const keywords = buildKeywords(title, headings, tags);

  return {
    id,
    title,
    keywords,
    sourceFile: filename,
    chunks,
    sources,
  };
}

function main() {
  if (!fs.existsSync(VAULT_TAX_DIR)) {
    throw new Error(`Vault directory not found: ${VAULT_TAX_DIR}`);
  }

  const filenames = fs
    .readdirSync(VAULT_TAX_DIR)
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .sort();

  const entries = filenames.map(buildEntryFromFile);

  const noteCount = entries.length;
  const chunkCount = entries.reduce((sum, e) => sum + e.chunks.length, 0);

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      builder: 'scripts/build-tax-kb.js',
      noteCount,
    },
    stats: {
      notes: noteCount,
      chunks: chunkCount,
    },
    entries,
  };

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(
    `Wrote ${OUTPUT_FILE}: ${noteCount} notes, ${chunkCount} chunks.`
  );
}

main();
