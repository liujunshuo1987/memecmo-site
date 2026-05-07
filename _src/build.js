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

const ROOT = path.resolve(__dirname, '..');
const TPL = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const I18N_DIR = path.join(__dirname, 'i18n');

const LOCALES = ['en', 'zh', 'vi', 'fil', 'th', 'ms'];
const DEFAULT_LOCALE = 'en';
const SITE_URL = 'https://memecmo.ai';

// load all i18n
const dicts = {};
for (const lc of LOCALES) {
  dicts[lc] = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${lc}.json`), 'utf8'));
}

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
      "areaServed": ["HK", "VN", "TH", "ID", "MY", "PH", "SG", "CN"],
      "knowsLanguage": ["en", "zh", "vi", "fil", "th", "ms"],
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Hong Kong",
        "addressCountry": "HK"
      },
      "contactPoint": [{
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "liujunshuo1987@gmail.com",
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
      "areaServed": ["VN", "TH", "ID", "MY", "PH", "HK", "SG", "CN"],
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
function phiCards(d) {
  return d.philosophy.cards.map(c => `      <div class="phi-card reveal"><div class="phi-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.desc}</p></div>`).join('\n');
}

// tech list
function techList(d) {
  return d.tech.items.map(it => `          <li class="reveal"><div class="geo-list-dot"></div><div><strong>${it.strong}</strong> — ${it.rest}</div></li>`).join('\n');
}

// market cards
function marketCards(d) {
  return d.market.cards.map(c => `      <div class="market-card reveal"><div class="market-flag">${c.flag}</div><div class="market-name">${c.name}</div><div class="market-lang">${c.lang}</div><div class="market-desc">${c.desc}</div></div>`).join('\n');
}

// process steps
function processSteps(d) {
  return d.process.steps.map(s => `      <div class="process-step reveal"><div class="process-dot"></div><div class="process-phase">${s.phase}</div><h3>${s.title}</h3><p>${s.desc}</p></div>`).join('\n');
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

    YEAR: '2026'
  };

  let out = TPL;
  for (const [k, v] of Object.entries(replacements)) {
    out = out.split('{{' + k + '}}').join(String(v));
  }

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
