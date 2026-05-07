# MemeCMO.ai — Site

Multi-language landing page for MemeCMO.ai, a Generative Engine Optimization (GEO) consultancy.

- **Live**: https://memecmo.ai
- **Hosting**: Vercel (static)
- **Languages**: English (default), 中文, Tiếng Việt, Filipino, ภาษาไทย, Bahasa Melayu

## Architecture

This is a static site built from a single template + 6 translation JSON files. No frontend framework, no build step on Vercel — everything is generated locally and committed.

```
memecmo-site/
├── _src/
│   ├── template.html        ← single source of truth for HTML/CSS/JS
│   ├── i18n/
│   │   ├── en.json          ← English (default, master)
│   │   ├── zh.json          ← 中文
│   │   ├── vi.json          ← Tiếng Việt
│   │   ├── fil.json         ← Filipino
│   │   ├── th.json          ← ภาษาไทย
│   │   └── ms.json          ← Bahasa Melayu
│   ├── build.js             ← generator (vanilla Node, no deps)
│   └── make_og.py           ← regenerate og.png (Python + PIL)
│
├── index.html               ← built EN page (default, root)
├── zh/index.html            ← built per-locale pages
├── vi/index.html
├── fil/index.html
├── th/index.html
├── ms/index.html
│
├── llms.txt                 ← LLM-readable site summary (AEO)
├── robots.txt               ← allow major AI crawlers
├── sitemap.xml              ← auto-generated, with hreflang per URL
├── og.png                   ← 1200×630 social card
├── favicon.svg
└── vercel.json              ← redirects, headers
```

## Editing content

1. Edit the relevant `_src/i18n/<lang>.json`. Keys mirror across languages.
2. Run `node _src/build.js` from the repo root.
3. The 6 `index.html` files and `sitemap.xml` are regenerated.
4. `git add -A && git commit -m "..." && git push` — Vercel auto-deploys.

To regenerate `og.png`: `python3 _src/make_og.py` (requires Pillow: `pip install Pillow`).

## SEO / AEO included

- **Per-page**: localized `<title>`, `description`, `keywords`, canonical URL, Open Graph, Twitter Card.
- **hreflang**: full mesh between all 6 locales + `x-default` → English.
- **JSON-LD**: 5 schema blocks per page — `Organization`, `WebSite`, `WebPage`, `Service`, `FAQPage`.
- **llms.txt**: machine-readable site summary specifically for AI assistants (the meta-eat-its-own-dogfood part — we run a GEO firm).
- **robots.txt**: explicitly allows GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, Google-Extended, ClaudeBot, anthropic-ai, Applebot-Extended, Bytespider, CCBot, MistralAI-User, etc.
- **sitemap.xml**: every URL declares its hreflang siblings.
- **HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy**: set in `vercel.json`.

## Deployment

Vercel deploys automatically on `main` push. No build command, no install command — the repo is the deployment.

DNS:
- `memecmo.ai` (apex) → A `216.198.79.1` (Vercel)
- `www.memecmo.ai` → CNAME `cname.vercel-dns.com.`
- www domain redirects to apex (308 Permanent), configured both in Vercel Domains and as a fallback in `vercel.json`.

## Adding a new language

1. Copy `_src/i18n/en.json` to `_src/i18n/<code>.json` and translate.
2. Add the locale code to the `LOCALES` array in `_src/build.js`.
3. Run `node _src/build.js`. A new `<code>/index.html` appears.
4. Commit + push.

## Contact

liujunshuo1987@gmail.com
