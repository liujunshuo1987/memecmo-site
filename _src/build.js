#!/usr/bin/env node
/**
 * Build script: generate localized HTML files from template + i18n JSON.
 * Usage: node _src/build.js
 *
 * Reads:  _src/template.html, _src/i18n/{en,zh,vi,fil,th,ms}.json
 * Writes: index.html (en, default), zh/index.html, vi/index.html, fil/index.html, th/index.html, ms/index.html
 *         sitemap.xml (with all locales), llms.txt (English summary)
 */
const fs = require('fs');
const path = require('path');
const { px } = require('./pixel-icons');

const ROOT = path.resolve(__dirname, '..');
const TPL = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const I18N_DIR = path.join(__dirname, 'i18n');

const LOCALES = ['en', 'zh', 'zh-hant', 'vi', 'id', 'th', 'fil', 'ms'];
const DEFAULT_LOCALE = 'en';
const APP_LANGS = { zh: 'zh-CN', 'zh-hant': 'zh-TW' };
const SITE_URL = 'https://memecmo.ai';

// load all i18n
const dicts = {};
for (const lc of LOCALES) {
  dicts[lc] = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${lc}.json`), 'utf8'));
}
// English fallback: a locale missing a key (or a whole new block) renders the
// English text instead of a blank placeholder — new sections can ship in
// en/zh/vi first and be translated later without breaking th/fil/ms.
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === 'object') {
    const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) };
    for (const [k, v] of Object.entries(over)) out[k] = deepMerge(out[k], v);
    return out;
  }
  return over === undefined ? base : over;
}
for (const lc of LOCALES) if (lc !== DEFAULT_LOCALE) dicts[lc] = deepMerge(dicts[DEFAULT_LOCALE], dicts[lc]);

// Homepage hero (v2 "Island") copy lives in one file, one block per locale,
// English filling any gap.
const HERO = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'hero.json'), 'utf8'));
for (const lc of LOCALES) dicts[lc].hero2 = deepMerge(HERO[DEFAULT_LOCALE], HERO[lc] || {});

// helper: deep get with dotted path
function get(obj, p) {
  return p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// helper: html-escape (used only when explicitly needed; most fields are pre-rendered HTML)
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// build hreflang block
function hreflang(currentLocale) {
  const tags = LOCALES.map(lc => {
    const url = lc === DEFAULT_LOCALE ? SITE_URL + '/' : `${SITE_URL}/${lc}/`;
    const hl = dicts[lc].hreflang;
    return `  <link rel="alternate" hreflang="${hl}" href="${url}">`;
  }).join('\n');
  // x-default → english
  return tags + `\n  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`;
}

// build the language switcher menu HTML
function langMenu(currentLocale) {
  return LOCALES.map(lc => {
    const href = lc === DEFAULT_LOCALE ? '/' : `/${lc}/`;
    const isCurrent = lc === currentLocale;
    const native = dicts[lc].lang_native;
    return `      <li${isCurrent ? ' class="current"' : ''}><a href="${href}" lang="${dicts[lc].hreflang}" hreflang="${dicts[lc].hreflang}">${native}</a></li>`;
  }).join('\n');
}

// JSON-LD structured data
function jsonLd(locale) {
  const d = dicts[locale];
  const url = locale === DEFAULT_LOCALE ? SITE_URL + '/' : `${SITE_URL}/${locale}/`;
  const blocks = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": SITE_URL + '/#org',
      "name": "MemeCMO.ai",
      "alternateName": ["MemeCMO", "Meme CMO"],
      "url": SITE_URL + '/',
      "logo": SITE_URL + '/og.png',
      "description": d.meta.description,
      "areaServed": ["HK", "VN", "TH", "ID", "MY", "PH", "SG", "CN", "US"],
      "knowsLanguage": ["en", "zh", "vi", "fil", "th", "ms"],
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Hong Kong",
        "addressCountry": "HK"
      },
      "contactPoint": [{
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "samchan@memecmo.ai",
        "availableLanguage": ["en", "zh", "vi", "fil", "th", "ms"]
      }]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_URL + '/#website',
      "url": SITE_URL + '/',
      "name": "MemeCMO.ai",
      "publisher": { "@id": SITE_URL + '/#org' },
      "inLanguage": LOCALES.map(lc => dicts[lc].hreflang)
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url + '#webpage',
      "url": url,
      "name": d.meta.title,
      "description": d.meta.description,
      "inLanguage": d.hreflang,
      "isPartOf": { "@id": SITE_URL + '/#website' },
      "about": { "@id": SITE_URL + '/#org' }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": d.service.name,
      "serviceType": "Generative Engine Optimization",
      "provider": { "@id": SITE_URL + '/#org' },
      "areaServed": ["VN", "TH", "ID", "MY", "PH", "HK", "SG", "CN", "US"],
      "description": d.service.description,
      "offers": {
        "@type": "Offer",
        "name": d.service.offer_name,
        "description": d.service.offer_desc
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": d.faq.items.map(it => ({
        "@type": "Question",
        "name": it.q,
        "acceptedAnswer": { "@type": "Answer", "text": it.a }
      }))
    }
  ];
  return blocks.map(b => `<script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n</script>`).join('\n');
}

// Scroll narrative: one section per story block, screenshot in a Mac frame,
// alternating sides. Shots live in /shots/<name>.webp (scripts in memecmo-app).
function storyHtml(d) {
  const secs = (d.story && d.story.sections) || [];
  return secs.map((s, i) => `
<section class="sec story${i % 2 ? ' story-flip' : ''}" id="${s.id}">
  <div class="wrap story-grid">
    <div class="story-copy reveal">
      <span class="kicker">${s.tag}</span>
      <h2 class="sec-title">${s.title}</h2>
      <p class="sec-desc">${s.desc}</p>
      <ul class="story-points">
${(s.bullets || []).map((b) => `        <li>${b}</li>`).join('\n')}
      </ul>
${s.cta ? `      <a class="btn-ghost story-cta" href="${s.cta_href}">${s.cta} →</a>` : ''}
    </div>
    <figure class="mac reveal" style="--i:1">
      <div class="mac-bar"><span class="dots"><i></i><i></i><i></i></span><span class="mac-title">app.memecmo.ai</span></div>
      <div class="mac-screen"><img src="/shots/${s.shot}.webp" alt="${esc(s.alt || '')}" loading="lazy" width="1440" height="900"></div>
    </figure>
  </div>
</section>`).join('\n');
}

// build the slides HTML
function slidesHtml(d) {
  return d.hero.slides.map((s, i) => `
    <div class="slide${i === 0 ? ' active' : ''}" data-index="${i}">
      <div class="slide-glow"></div>
      <div class="slide-inner">
        <div class="slide-tag">${s.tag}</div>
        <h1 class="slide-title">${s.title}</h1>
        <p class="slide-desc">${s.desc}</p>
        <a href="${s.btn_href}" class="slide-btn">${s.btn} →</a>
      </div>
    </div>`).join('\n');
}

// philosophy cards
// Every card below the hero is a classic Mac window: pinstripe title bar,
// close box, ink outline, hard shadow. Text stays in Inter; pixels are imagery.
function win(title, body, cls = '', i = 0) {
  return `      <div class="win${cls ? ' ' + cls : ''} reveal" style="--i:${i % 3}"><div class="win-bar"><i></i><b>${title}</b></div><div class="win-body">${body}</div></div>`;
}
const PROMISE_ICONS = ['folder', 'doc', 'floppy', 'chat', 'percent', 'flag'];
function phiCards(d) {
  return d.philosophy.cards.map((c, i) => win(`0${i + 1}`, `${px(PROMISE_ICONS[i] || 'check', 2, 'win-px')}<h3>${c.title}</h3><p>${c.desc}</p>`, '', i)).join('\n');
}
// Fun pixel scenes, one per section corner; each shows one thing the product does.
const CITED = (s) => `<svg width="${14 * s}" height="${10 * s}" viewBox="0 0 14 10" shape-rendering="crispEdges" aria-hidden="true"><path fill="#2A2024" d="M1 0h12v1h-12zM0 1h1v6h-1zM13 1h1v6h-1zM1 7h5v1h-5zM8 7h5v1h-5zM5 8h1v1h-1zM7 8h1v1h-1zM5 9h2v1h-2z"/><path fill="#FFFFFF" d="M1 1h12v6h-12zM6 7h2v1h-2zM6 8h1v1h-1z"/><path fill="#C76B7A" d="M5 2h1v1h-1zM8 2h1v1h-1zM4 3h3v1h-3zM7 3h3v1h-3zM4 4h6v1h-6zM5 5h4v1h-4zM6 6h2v1h-2z"/></svg>`;
const SCENES = {
  engines: `<div class="sec-px px-scene px-bob" aria-hidden="true">${px('agent', 4)}${px('news', 4)}</div>`,
  methods: `<div class="sec-px px-found" aria-hidden="true">${px('magnifier', 5)}${px('star', 4, 'px-star px-tick')}</div>`,
  agents: `<div class="sec-px px-scene px-fly" aria-hidden="true"><i></i><i></i><i class="r"></i>${px('plane', 4)}</div>`,
  promises: `<div class="sec-px px-scene px-bob" aria-hidden="true">${px('cat', 5)}</div>`,
  process: `<div class="sec-px px-scene" aria-hidden="true">${px('hourglass', 4, 'px-tick')}${px('bars', 4)}</div>`,
  faq: `<div class="sec-px px-scene px-bob" aria-hidden="true">${CITED(4)}</div>`
};
const TRAIL = `<div class="band-trail" aria-hidden="true">${px('news', 3)}<i class="r"></i><i></i><i class="r"></i><i></i><i class="r"></i>${CITED(3)}</div>`;

// The hero's desktop: GEO icons floating around the slogan, some with labels.
function heroSky(h) {
  const L = h.icons || {};
  const icon = (name, scale, pos, label, cls = 'float') =>
    `      <div class="${cls}" style="${pos}">${px(name, scale)}${label ? `<span>${label}</span>` : ''}</div>`;
  return [
    `      <div class="float" style="left:5%;top:2%;--d:-.4s">${px('catcool', 4, 'px-cat')}${px('mac', 4)}<span>meme.cat</span></div>`,
    icon('magnifier', 3, 'left:2%;top:38%;--d:-2.6s', L.questions),
    icon('doc', 3, 'left:10%;top:68%;--d:-3.8s', L.sources),
    icon('hourglass', 3, 'left:20%;top:1%;--d:-4.2s'),
    icon('sparkle', 3, 'left:3%;top:90%;--d:-3.3s'),
    icon('cursor', 3, 'left:19%;top:86%', '', 'wander'),
    icon('bars', 4, 'right:6%;top:4%;--d:-1.5s'),
    icon('quote', 3, 'right:20%;top:0;--d:-2.1s'),
    `      <div class="float watcher" style="right:1%;top:28%;--d:-.9s"><div class="watch-eye">${px('eyebase', 6)}<i class="watch-iris">${px('iris', 6)}</i></div><span>${L.visibility}</span></div>`,
    `      <div class="float mini-eye" style="left:27%;top:5%;--d:-1.1s">${px('eye', 2)}</div>`,
    `      <div class="float mini-eye b2" style="right:27%;top:9%;--d:-2.4s">${px('eye', 2)}</div>`,
    `      <div class="float mini-eye b3" style="left:14%;top:52%;--d:-3.1s">${px('eye', 2)}</div>`,
    `      <div class="float mini-eye b4" style="right:17%;top:50%;--d:-.6s">${px('eyeclosed', 2)}</div>`,
    icon('pie', 3, 'right:10%;top:64%;--d:-1.9s', L.sov),
    icon('agent', 3, 'right:2%;top:86%;--d:-2.9s', L.agents)
  ].join('\n');
}

// Island source list: the public September 2026 Vietnam list (1,992 cited
// answers). Vietnamese and Indonesian write 1.992 and 19,2%.
const TOP_SOURCES = [['vnexpress.net', 382], ['brandsvietnam.com', 241], ['vietnam.vn', 226], ['cafef.vn', 208]];
const SOURCE_BASE = 1992;
function fmtNum(locale, n, decimals) {
  const s = decimals ? n.toFixed(decimals) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (locale !== 'vi' && locale !== 'id') return s;
  return decimals ? s.replace('.', ',') : s.replace(/,/g, '.');
}
function islandSources(locale) {
  return TOP_SOURCES.map(([domain, n]) =>
    `        <div class="ip-row"><span>${domain}</span><span class="ip-bar"><i style="width:${Math.round(n / TOP_SOURCES[0][1] * 100)}%"></i></span><span class="ip-val"><b>${fmtNum(locale, n / SOURCE_BASE * 100, 1)}%</b> ${n}/${fmtNum(locale, SOURCE_BASE)}</span></div>`
  ).join('\n');
}
// Each proof card carries one pixel mark: answers read, the brand's own site
// barely seen (a closed eye), the outlet AI sees most (an open eye).
const PROOF_ICONS = ['chat', 'eyeclosed', 'eye'];
function proofCards(h) {
  return h.proof.map((p, i) => `        <div class="proof-card"><i class="proof-px">${px(PROOF_ICONS[i], 2)}</i><b${i === 1 ? ' class="warn"' : ''}>${p.num}</b><span>${p.text}</span><small>${p.src}</small></div>`).join('\n');
}
// Inter for Latin and Vietnamese; Chinese and Thai get their Noto face first in line.
const SCRIPT_FONT = {
  zh: ['Noto Sans SC', 'Noto+Sans+SC:wght@400;500;700'],
  'zh-hant': ['Noto Sans TC', 'Noto+Sans+TC:wght@400;500;700'],
  th: ['Noto Sans Thai', 'Noto+Sans+Thai:wght@400;500;600;700']
};

// Engines and the pixel marks the site uses for them (our own glyphs, not the
// engines' logos). The AI Overview label is localized via hero.json.
const ENGINE_MARKS = {
  chatgpt: ['ChatGPT', '#4F8A8B', '<svg width="16" height="12" viewBox="0 0 9 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFFFFF" d="M1 0h7v1h-7zM0 1h9v1h-9zM0 2h2v1h-2zM3 2h1v1h-1zM5 2h1v1h-1zM7 2h2v1h-2zM0 3h9v1h-9zM1 4h7v1h-7zM2 5h2v1h-2zM2 6h1v1h-1z"/></svg>'],
  gemini: ['Gemini', '#5B7FA6', '<svg width="16" height="16" viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFFFFF" d="M4 0h1v2h-1zM3 2h3v1h-3zM2 3h5v1h-5zM0 4h9v1h-9zM2 5h5v1h-5zM3 6h3v1h-3zM4 7h1v2h-1z"/></svg>'],
  perplexity: ['Perplexity', '#8E6C9E', '<svg width="16" height="14" viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFFFFF" d="M1 0h4v1h-4zM0 1h1v3h-1zM5 1h1v3h-1zM1 4h6v1h-6zM5 5h2v1h-2zM6 6h2v1h-2zM7 7h2v1h-2z"/></svg>'],
  claude: ['Claude', '#A85C3B', '<svg width="16" height="11" viewBox="0 0 9 6" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFFFFF" d="M1 0h2v1h-2zM6 0h2v1h-2zM0 1h1v4h-1zM3 1h1v1h-1zM5 1h1v1h-1zM8 1h1v4h-1zM4 2h1v3h-1zM0 5h9v1h-9z"/></svg>'],
  aio: [null, '#7E8F3A', '<svg width="16" height="12" viewBox="0 0 9 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFFFFF" d="M0 0h9v1h-9zM0 1h1v5h-1zM8 1h1v5h-1zM2 2h5v1h-5zM2 4h4v1h-4zM0 6h9v1h-9z"/></svg>']
};
function engClasses(d) {
  return d.engines.classes.map((c, i) => {
    const chips = c.engines.map(id => {
      const [name, color, svg] = ENGINE_MARKS[id];
      return `<span class="eng-chip"><i style="background:${color}">${svg}</i>${name || d.hero2.aio}</span>`;
    }).join('');
    return win(`0${i + 1}`, `<div class="eng-chips">${chips}</div><h3>${c.name}</h3><p>${c.body}</p><span class="eng-lever">${c.lever}</span>`, 'eng-class', i);
  }).join('\n');
}
const METHOD_ICONS = ['bars', 'doc', 'eye', 'check', 'quote', 'hourglass'];
function metItems(d) {
  return d.methods.items.map((m, i) => win(`0${i + 1}`, `${px(METHOD_ICONS[i], 2, 'win-px')}<h3>${m.title}</h3><p>${m.body}</p>`, '', i)).join('\n');
}
function fontLink(locale) {
  const extra = SCRIPT_FONT[locale] ? `&family=${SCRIPT_FONT[locale][1]}` : '';
  return `https://fonts.googleapis.com/css2?family=Inter:wght@400..800${extra}&display=swap`;
}
function fontStack(locale) {
  const extra = SCRIPT_FONT[locale] ? `"${SCRIPT_FONT[locale][0]}",` : '';
  return `"Inter",${extra}-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans",sans-serif`;
}

// tech list
function techList(d) {
  const icons = ['mac', 'eye', 'bars', 'doc', 'globe'];
  return d.tech.items.map((it, i) => win(`0${i + 1}`, `${px(icons[i], 2, 'win-px')}<h3>${it.strong}</h3><p>${it.rest}</p>`, 'step', i)).join('\n');
}

// market cards
function marketCards(d) {
  return d.market.cards.map(c => `      <div class="market-card reveal"><div class="market-flag">${c.flag}</div><div class="market-name">${c.name}</div><div class="market-lang">${c.lang}</div><div class="market-desc">${c.desc}</div></div>`).join('\n');
}

// process steps
function processSteps(d) {
  return d.process.steps.map((s, i) => win(s.phase, `<h3>${s.title}</h3><p>${s.desc}</p>`, 'pstep', i)).join('\n');
}

// faq HTML
function faqHtml(d) {
  return d.faq.items.map(it => `      <details class="faq-item reveal"><summary>${it.q}</summary><div class="faq-a">${it.a}</div></details>`).join('\n');
}

// open graph locale alt
function ogLocaleAlt(currentLocale) {
  return LOCALES.filter(lc => lc !== currentLocale).map(lc => `  <meta property="og:locale:alternate" content="${dicts[lc].og_locale}">`).join('\n');
}

// build a single locale
function buildLocale(locale) {
  const d = dicts[locale];
  const isDefault = locale === DEFAULT_LOCALE;
  const url = isDefault ? SITE_URL + '/' : `${SITE_URL}/${locale}/`;

  const replacements = {
    LANG: d.hreflang,
    DIR: d.dir || 'ltr',
    LOCALE_CODE: locale,
    PAGE_URL: url,
    CANONICAL: url,
    META_TITLE: d.meta.title,
    META_DESCRIPTION: d.meta.description,
    META_KEYWORDS: d.meta.keywords,
    OG_TITLE: d.og.title,
    OG_DESCRIPTION: d.og.description,
    OG_LOCALE: d.og_locale,
    OG_LOCALE_ALT: ogLocaleAlt(locale),
    HREFLANG_TAGS: hreflang(locale),
    JSONLD: jsonLd(locale),

    NAV_PHILOSOPHY: d.nav.philosophy,
    NAV_TECH: d.nav.tech,
    NAV_MARKET: d.nav.market,
    NAV_PROCESS: d.nav.process,
    NAV_CONTACT: d.nav.contact,
    NAV_CTA: d.nav.cta,
    NAV_SIGNIN: d.nav.signin,
    LANG_CURRENT_LABEL: d.lang_native,
    LANG_MENU: langMenu(locale),

    SLIDES: slidesHtml(d),
    SLIDES_COUNTER_TOTAL: String(d.hero.slides.length).padStart(2, '0'),
    SCROLL_LABEL: d.hero.scroll_label,
    PAUSE_LABEL: d.hero.pause_label_playing,
    PAUSE_LABEL_PLAYING: d.hero.pause_label_playing,
    PAUSE_LABEL_PAUSED: d.hero.pause_label_paused,
    PAUSE_LABEL_PLAYING_JSON: JSON.stringify(d.hero.pause_label_playing),
    PAUSE_LABEL_PAUSED_JSON: JSON.stringify(d.hero.pause_label_paused),

    NAV_ABOUT: (d.nav && d.nav.about) || 'About',
    GEO_VN_URL: locale === 'vi' ? '/vi/geo-viet-nam/' : locale.startsWith('zh') ? '/zh/geo-vietnam/' : '/geo-vietnam/',
    GEO_VN_LABEL: locale === 'vi' ? 'GEO tại Việt Nam' : locale === 'zh' ? '越南 GEO' : locale === 'zh-hant' ? '越南 GEO' : 'GEO in Vietnam',
    NAV_GUIDE: (d.nav && d.nav.guide) || 'Guide',
    NAV_US: (d.nav && d.nav.us) || 'US',
    FONT_LINK: fontLink(locale),
    FONT_STACK: fontStack(locale),
    HERO_TITLE: d.hero2.title,
    HERO_DESC: d.hero2.desc,
    HERO_SCAN_LABEL: d.hero2.scan_label,
    ISLAND_ARIA: esc(d.hero2.island_aria),
    ISLAND_MSGS: esc(JSON.stringify(d.hero2.island)),
    ISLAND_MSG0: d.hero2.island[0],
    ISLAND_PILL: d.hero2.island_pill,
    ISLAND_SRC_TITLE: d.hero2.src_title,
    ISLAND_SOURCES: islandSources(locale),
    ISLAND_SRC_NOTE: d.hero2.src_note,
    ISLAND_SRC_LINK: d.hero2.src_link,
    ISLAND_SRC_HREF: d.hero2.src_href,
    ENGINES_LABEL: d.hero2.engines_label,
    AIO_LABEL: d.hero2.aio,
    PROOF_NOTE: d.hero2.proof_note ? `      <p class="proof-note">${d.hero2.proof_note}</p>` : '',
    PROOF_CARDS: proofCards(d.hero2),
    HERO_SKY: heroSky(d.hero2),
    PX_ENGINES: SCENES.engines,
    PX_METHODS: SCENES.methods,
    PX_AGENTS: SCENES.agents,
    PX_PROMISES: SCENES.promises,
    PX_MARKETS: `<div class="sec-px px-scene px-bob px-watch" aria-hidden="true">${px('eye', 3, 'mini-blink')}${px('globe', 4)}</div>`,
    PX_PROCESS: SCENES.process,
    PX_FAQ: SCENES.faq,
    PX_TRAIL: TRAIL,
    PX_CONTACT: px('floppy', 4, 'sec-px'),
    PX_WINDOW: px('mac', 2, 'win-px'),
    HERO_MOCK_NOTE: (d.ws && d.ws.mock_note) || '',
    STORY_SECTIONS: storyHtml(d),
    STORY_NAV: (d.story && d.story.nav) || 'Inside',
    WS_TAG: (d.ws && d.ws.tag) || '',
    WS_TITLE: (d.ws && d.ws.title) || '',
    WS_DESC: (d.ws && d.ws.desc) || '',
    WS_B1: (d.ws && d.ws.b1) || '',
    WS_B2: (d.ws && d.ws.b2) || '',
    WS_B3: (d.ws && d.ws.b3) || '',
    WS_DEMO: (d.ws && d.ws.demo) || 'Open the live demo',
    WS_DEMO_SUB: (d.ws && d.ws.demo_sub) || '',
    QUOTE_TITLE: d.tech.quote_title,
    QUOTE_DESC: d.tech.quote_desc,

    NAV_METHODS: d.nav.methods,
    ENG_TAG: d.engines.tag,
    ENG_TITLE: d.engines.title,
    ENG_DESC: d.engines.desc,
    ENG_CLASSES: engClasses(d),
    ENG_NOTE: d.engines.note,
    MET_TAG: d.methods.tag,
    MET_TITLE: d.methods.title,
    MET_DESC: d.methods.desc,
    MET_ITEMS: metItems(d),
    TAGLINE_MAIN: d.tagline.main,
    TAGLINE_SUB: d.tagline.sub,

    PHI_TAG: d.philosophy.tag,
    PHI_TITLE: d.philosophy.title,
    PHI_DESC: d.philosophy.desc,
    PHI_CARDS: phiCards(d),

    TECH_TAG: d.tech.tag,
    TECH_TITLE: d.tech.title,
    TECH_DESC: d.tech.desc,
    TECH_STACK_TITLE: d.tech.stack_title,
    TECH_LIST: techList(d),
    TECH_CENTER: d.tech.center_text,

    MARKET_TAG: d.market.tag,
    MARKET_TITLE: d.market.title,
    MARKET_DESC: d.market.desc,
    MARKET_CARDS: marketCards(d),
    MARKET_INSIGHT_TITLE: d.market.insight_title,
    MARKET_INSIGHT_BODY: d.market.insight_body,

    PROCESS_TAG: d.process.tag,
    PROCESS_TITLE: d.process.title,
    PROCESS_DESC: d.process.desc,
    PROCESS_STEPS: processSteps(d),

    FAQ_TAG: d.faq.tag,
    FAQ_TITLE: d.faq.title,
    FAQ_DESC: d.faq.desc,
    FAQ_ITEMS: faqHtml(d),

    CONTACT_TAG: d.contact.tag,
    CONTACT_TITLE: d.contact.title,
    CONTACT_LEAD: d.contact.lead,
    CONTACT_EMAIL_LABEL: d.contact.email_label,
    CONTACT_HQ_LABEL: d.contact.hq_label,
    CONTACT_HQ_VALUE: d.contact.hq_value,
    CONTACT_FORM_TITLE: d.contact.form_title,
    CONTACT_FORM_SUB: d.contact.form_sub,
    CONTACT_F_NAME: d.contact.f_name,
    CONTACT_F_NAME_PH: d.contact.f_name_ph,
    CONTACT_F_COMPANY: d.contact.f_company,
    CONTACT_F_COMPANY_PH: d.contact.f_company_ph,
    CONTACT_F_EMAIL: d.contact.f_email,
    CONTACT_F_EMAIL_PH: d.contact.f_email_ph,
    CONTACT_F_MARKET: d.contact.f_market,
    CONTACT_F_MARKET_PH: d.contact.f_market_ph,
    CONTACT_F_MSG: d.contact.f_msg,
    CONTACT_F_MSG_PH: d.contact.f_msg_ph,
    CONTACT_SUBMIT: d.contact.submit,
    CONTACT_SUBMIT_DONE: d.contact.submit_done,
    CONTACT_SUBMIT_LOADING: d.contact.submit_loading,
    CONTACT_SUBMIT_ERROR: d.contact.submit_error,

    FOOTER_BACK_TOP: d.footer.back_top,
    FOOTER_LICENSE: d.footer.license,

    HERO_SCAN_PH: d.hero_scan_ph,
    HERO_SCAN_BTN: d.hero_scan_btn,
    HERO_SCAN_NOTE: d.hero_scan_note,
    APP_LANG: APP_LANGS[locale] || 'en',
    APP_MARKET: ({ vi: 'Vietnam', id: 'Indonesia', th: 'Thailand', ms: 'Malaysia', fil: 'Philippines' })[locale] || '',

    YEAR: '2026'
  };

  let out = TPL;
  for (const [k, v] of Object.entries(replacements)) {
    out = out.split('{{' + k + '}}').join(String(v));
  }

  // Cross-domain language handoff: localStorage doesn't cross memecmo.ai →
  // app.memecmo.ai, so auth links carry the locale explicitly. App-side
  // languages are en / zh-CN / zh-TW (site zh is Simplified, zh-hant is
  // Traditional); the other locales fall back to en until the app grows them.
  const APP_LANG = APP_LANGS[locale] || 'en';
  out = out
    .split('https://app.memecmo.ai/login').join(`https://app.memecmo.ai/login?lang=${APP_LANG}`)
    .split('https://app.memecmo.ai/signup').join(`https://app.memecmo.ai/signup?lang=${APP_LANG}`);

  const outDir = isDefault ? ROOT : path.join(ROOT, locale);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('  wrote', path.relative(ROOT, outPath), `(${out.length} bytes)`);
}

// sitemap
function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = LOCALES.map(lc => {
    const loc = lc === DEFAULT_LOCALE ? SITE_URL + '/' : `${SITE_URL}/${lc}/`;
    const alts = LOCALES.map(other => {
      const otherUrl = other === DEFAULT_LOCALE ? SITE_URL + '/' : `${SITE_URL}/${other}/`;
      return `    <xhtml:link rel="alternate" hreflang="${dicts[other].hreflang}" href="${otherUrl}"/>`;
    }).join('\n');
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${lc === DEFAULT_LOCALE ? '1.0' : '0.9'}</priority>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>
  </url>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
  <url><loc>${SITE_URL}/about/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/compare/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/geo-vietnam/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/vi/geo-viet-nam/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/zh/geo-vietnam/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/vi/doi-tac-truyen-thong/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
${LOCALES.filter(l => l !== 'en').map(l => `  <url><loc>${SITE_URL}/${l}/about/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log('  wrote sitemap.xml');
}

// build
console.log('Building MemeCMO.ai (i18n)…');
for (const lc of LOCALES) buildLocale(lc);
buildSitemap();
console.log('Done.');
