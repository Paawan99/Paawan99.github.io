#!/usr/bin/env node
/**
 * build-kb.js
 *
 * Dependency-free, generic build script (Node built-ins only: fs, path).
 *
 * Reads every *.md note in vault/<topic>/ (public-safe education notes) and
 * compiles them into data/<topic>-kb.json, which grounds a retrieval-only
 * copilot for that topic.
 *
 * Usage:
 *   node scripts/build-kb.js crs remittance   # build only these topics
 *   node scripts/build-kb.js                  # build every vault/ subdir
 *                                              # except "private" and "tax"
 *                                              # (the live tax pipeline is
 *                                              # never touched by this script)
 *
 * Note structure expected in each vault/<topic>/*.md file:
 *   # Title                     <- first H1 becomes the entry title
 *   tags: foo, bar, ...         <- optional tags line near the top
 *   ## Section heading          <- becomes a retrieval chunk
 *   ...body...
 *   ## Sources                  <- special section: parsed into `sources`,
 *                                  excluded from `chunks`
 *   - https://example.com/...   <- URLs extracted via regex
 *
 * This mirrors scripts/build-tax-kb.js exactly (same parsing rules and
 * output schema), generalized to accept a topic name instead of being
 * hardcoded to "tax".
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const VAULT_DIR = path.join(ROOT_DIR, 'vault');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const EXCLUDED_TOPICS = new Set(['private', 'tax']);

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

function buildEntryFromFile(vaultTopicDir, filename) {
  const filePath = path.join(vaultTopicDir, filename);
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

function buildTopic(topic) {
  const vaultTopicDir = path.join(VAULT_DIR, topic);

  if (!fs.existsSync(vaultTopicDir)) {
    throw new Error(`Vault directory not found: ${vaultTopicDir}`);
  }

  const filenames = fs
    .readdirSync(vaultTopicDir)
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .sort();

  const entries = filenames.map((f) => buildEntryFromFile(vaultTopicDir, f));

  const noteCount = entries.length;
  const chunkCount = entries.reduce((sum, e) => sum + e.chunks.length, 0);

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      builder: 'scripts/build-kb.js',
      noteCount,
    },
    stats: {
      notes: noteCount,
      chunks: chunkCount,
    },
    entries,
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const outputFile = path.join(DATA_DIR, `${topic}-kb.json`);
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(
    `[${topic}] Wrote ${path.relative(ROOT_DIR, outputFile)}: ${noteCount} notes, ${chunkCount} chunks.`
  );
}

function discoverTopics() {
  return fs
    .readdirSync(VAULT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDED_TOPICS.has(name))
    .sort();
}

function main() {
  const cliTopics = process.argv.slice(2);
  const topics = cliTopics.length > 0 ? cliTopics : discoverTopics();

  if (topics.length === 0) {
    console.log('No topics to build.');
    return;
  }

  for (const topic of topics) {
    buildTopic(topic);
  }
}

main();
