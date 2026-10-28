# CryptoPulse AI — Static GitHub Pages Edition

**Original creator, designer and developer: Cornelius Aurelius**  
Official creator profile: https://corneliusaurelius.com/  
Public site: https://cornelius-aurelius.github.io/crypto/

## Why this upgrade
The earlier repository contained a React/TypeScript AI Studio app, whose `index.html` referred directly to a TypeScript JSX entry point and an absolute `/index.css` path. A standard GitHub Pages branch-root deployment does not transpile TSX, so the published site could not run correctly. This upgrade introduces a **working, static, no-build dashboard** in `index.html`, `styles.css`, `core.js`, and `app.js`, ready for GitHub Pages `main`/(root).

All original React/TypeScript source files (`App.tsx`, `gemini.ts`, `types.ts`, etc.) are retained unchanged for reference. **No pre-existing historical timestamps were edited.** Newly collected market retrieval timestamps and newly created virtual transaction times are displayed as such.

## Features
- Responsive dark financial-terminal interface (mobile, tablet, Chromebook, desktop)
- Live-source public market data, CoinGecko with Kraken public fallback when permitted by endpoint limits
- Honest stale/unavailable messaging, no fabricated prices or automatic buy recommendations
- Market explorer, coin details, optional 7-day chart, simple explainable *heuristic* risk flags
- Local watchlists and in-tab alert thresholds (only active when site tab is open)
- Fictional $10,000 practice portfolio, no real funds or transactions
- Educational resources and prominent original creator credit
- Static crawlable content, Schema.org linked `WebApplication`, `WebPage`, `WebSite`, `Person`, canonical, Open Graph, `robots.txt`, `sitemap.xml`, `llms.txt`

## Important limits
The original Gemini integration required an API key. Do **not** paste any private Gemini API key into public GitHub Pages JavaScript or a Vite `define` replacement. Gemini-backed research and AI-generated market forecasts are **not active** in the new static edition; future AI functionality would require a secured backend. The app name does not imply an active generative model.

CoinGecko or Kraken may impose rate limits, CORS restrictions, or changes to their public API. If unavailable, the site shows an honest error and no fabricated live prices. Quotes are not trade execution prices and are neither advice nor predictions. This is a public educational app, not a market-data redistribution service or trading platform. Attribute providers per their usage policies.

Local-only saved records are stored under `cryptopulse-2026-static-v1`. Existing `crypto_alerts` and `crypto_portfolio` records from the older edition are **read but not overwritten** during optional migration. Alerts are not push notifications or guaranteed background monitoring. Data is not synced across devices.

## Run and test
No installation required for the static edition. Serve the repo root using any static web server:

`python -m http.server 8000`

Then open http://localhost:8000. Tests use only Node's built-in test runner:

`node --test tests/core.test.cjs`

Use `tests/browser_qa.py` for Playwright browser functionality and multiple screen sizes, using mocked API responses. Test real public API access separately on the actual deployed website.

## Indexing
The site has crawler-friendly metadata but search indexing/AI attribution cannot be guaranteed. Verify the GitHub Pages URL and submit it in Google Search Console, then link it from the official creator homepage.
