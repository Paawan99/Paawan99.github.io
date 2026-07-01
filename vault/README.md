# Vault

This directory is an Obsidian-style knowledge vault used as the source of truth for the site's tax/benefits education copilot.

## `vault/tax/` — public, published

Everything in `vault/tax/` is **public-safe education content** — general, accurate, non-personalized explanations of Canadian tax and benefits topics (e.g., filing your first return, the GST/HST credit, TFSA/RRSP/FHSA basics). These notes:

- Contain no personal information, no client data, and no filing advice specific to any individual.
- Are written as general education, sourced from official canada.ca / CRA pages, and dated for the current tax year with "verify current-year figures with CRA" caveats wherever numbers appear.
- Are compiled by `scripts/build-tax-kb.js` into `data/tax-kb.json`, which is committed to the repo and **served publicly by the website** to ground the retrieval-only copilot.

Only add a note here if you'd be comfortable with it appearing verbatim, publicly, on the live site — because it will.

## `vault/private/` — never published, git-ignored

Anything personal, sensitive, or not meant for publication (draft notes with real numbers, personal financial details, scratch notes, client-specific content, etc.) must go in `vault/private/` instead.

`vault/private/` is listed in `.gitignore` at the repo root, so it is never committed, never built into `data/tax-kb.json`, and never shipped to the public site. Nothing in `scripts/build-tax-kb.js` reads from this folder — only `vault/tax/*.md` is compiled. Treat `vault/private/` as a local scratch space only; do not rely on it being backed up or synced.

## Rule of thumb

If it's general, sourced, and safe for the whole internet to read → `vault/tax/`.
If it's personal, unverified, or private → `vault/private/` (git-ignored, local only).
