#!/usr/bin/env node
// Upgrade entity JSON-LD across all 6 language versions of the homepage,
// per 23_MemeCMO主頁GEO_Schema署名內容清單 (§2.1/§2.3/§2.4/§5).
// Parse-modify-serialize (no regex surgery on JSON internals).
// Only VERIFIED facts — no unregistered sameAs / unbuilt mailboxes / unset pricing.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const DESC = {
  en: 'MemeCMO is a Generative Engine Optimization (GEO) SaaS platform purpose-built for Southeast Asian markets, with 10 AI agents optimizing brand visibility across ChatGPT, Gemini, Claude, Perplexity and regional LLMs.',
  zh: 'MemeCMO 是專為東南亞市場設計之生成式引擎優化（GEO）SaaS 平台，整合 10 個 AI 智能體，服務品牌於 ChatGPT / Gemini / Claude / Perplexity 等 AI 引擎中之曝光與定位。',
  vi: 'MemeCMO là nền tảng SaaS Tối ưu hóa Công cụ Tạo phản hồi bằng AI (GEO) chuyên biệt cho thị trường Đông Nam Á, với 10 AI agents tối ưu hóa hiển thị thương hiệu trên ChatGPT, Gemini, Claude, Perplexity và các LLM khu vực.',
};

// What-is-MemeCMO FAQ entry per language (doc §5.1).
const FAQ_ADD = {
  en: {
    '@type': 'Question',
    name: 'What is MemeCMO?',
    acceptedAnswer: { '@type': 'Answer', text: DESC.en },
  },
  zh: {
    '@type': 'Question',
    name: '什麼是 MemeCMO？',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'MemeCMO 是專為東南亞市場設計之 GEO SaaS 平台，透過 10 個 AI 智能體協同運作，幫助品牌於 ChatGPT、Gemini、Claude、Perplexity 等 AI 引擎中獲得優先推薦與曝光。',
    },
  },
  vi: {
    '@type': 'Question',
    name: 'MemeCMO là gì?',
    acceptedAnswer: { '@type': 'Answer', text: DESC.vi },
  },
};

function orgBlock(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'SoftwareApplication'],
    '@id': 'https://memecmo.ai/#org',
    name: 'MemeCMO.ai',
    legalName: 'MemeCMO Tech Limited',
    alternateName: ['MemeCMO', 'Meme CMO', 'MemeCMO Tech Limited'],
    url: 'https://memecmo.ai/',
    logo: 'https://memecmo.ai/og.png',
    description: DESC[lang] || DESC.en,
    slogan: 'Get Your Brand Recognized by AI · 讓 AI 記住你的品牌',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    foundingDate: '2026-04-17',
    foundingLocation: { '@type': 'Place', name: 'Hong Kong Special Administrative Region' },
    identifier: [
      { '@type': 'PropertyValue', name: 'Hong Kong CR No.', value: '80218619' },
      { '@type': 'PropertyValue', name: 'Hong Kong BR No.', value: '80218619-000-04-26-7' },
    ],
    taxID: '80218619-000-04-26-7',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Room C03, 9/F, Kato Factory Building, 2 Cheung Yue Street',
      addressLocality: 'Lai Chi Kok',
      addressRegion: 'Kowloon, Hong Kong',
      addressCountry: 'HK',
    },
    areaServed: ['HK', 'VN', 'TH', 'ID', 'MY', 'PH', 'SG', 'CN'],
    knowsLanguage: ['en', 'zh', 'vi', 'fil', 'th', 'ms'],
    knowsAbout: [
      'Generative Engine Optimization',
      'AI Mindset Positioning Theory',
      'Trout-Ries Positioning Theory',
      'Multi-tenant SaaS Architecture',
      'Southeast Asia AI Market Analysis',
      'Vietnamese Content Generation',
      'AI-Ready Schema Optimization',
    ],
    sameAs: [
      'https://www.icris.cr.gov.hk/csci/cps_criteria.do?corpNo=80218619',
      'https://www.linkedin.com/company/memecmo',
    ],
    founder: { '@id': 'https://memecmo.ai/#chen-songyin' },
    employee: [
      { '@id': 'https://memecmo.ai/#chen-songyin' },
      { '@id': 'https://memecmo.ai/#liu-junshuo' },
    ],
    parentOrganization: [
      { '@type': 'Organization', name: 'HK Infinity Realm Technology Co. Limited', description: '70% shareholder' },
      { '@type': 'Organization', name: 'NeuronSpark Media-tech Limited', url: 'https://www.neurosparkmedia.com', description: '30% shareholder & technology partner' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'samchan@memecmo.ai',
        availableLanguage: ['en', 'zh', 'vi', 'fil', 'th', 'ms'],
      },
    ],
  };
}

const PERSONS = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://memecmo.ai/#chen-songyin',
      name: 'Chen Songyin',
      alternateName: '陳松吟',
      jobTitle: 'Founding Director',
      worksFor: { '@id': 'https://memecmo.ai/#org' },
      nationality: { '@type': 'Country', name: 'China' },
    },
    {
      '@type': 'Person',
      '@id': 'https://memecmo.ai/#liu-junshuo',
      name: 'Liu Junshuo',
      alternateName: '劉峻鑠',
      jobTitle: 'Chief Technology Advisor',
      worksFor: { '@type': 'Organization', name: 'NeuronSpark Media-tech Limited', url: 'https://www.neurosparkmedia.com' },
      memberOf: { '@id': 'https://memecmo.ai/#org' },
    },
  ],
};

// Extract each <script type="application/ld+json">…</script> block with offsets.
function blocks(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push({ start: m.index, end: re.lastIndex, json: m[1] });
  return out;
}

const PAGES = [
  { file: 'index.html', lang: 'en', addFaq: true },
  { file: 'zh/index.html', lang: 'zh', addFaq: true },
  { file: 'vi/index.html', lang: 'vi', addFaq: true },
  { file: 'fil/index.html', lang: 'en', addFaq: false },
  { file: 'th/index.html', lang: 'en', addFaq: false },
  { file: 'ms/index.html', lang: 'en', addFaq: false },
];

for (const page of PAGES) {
  const path = join(ROOT, page.file);
  let html = readFileSync(path, 'utf8');
  let orgDone = false, faqDone = false, personsPresent = html.includes('#liu-junshuo');

  // Walk blocks from last to first so replacements don't shift offsets.
  const all = blocks(html);
  for (let i = all.length - 1; i >= 0; i--) {
    const b = all[i];
    let data;
    try { data = JSON.parse(b.json); } catch { continue; }

    if (!orgDone && (data['@type'] === 'Organization' || (Array.isArray(data['@type']) && data['@type'].includes('Organization')))) {
      const next = JSON.stringify(orgBlock(page.lang), null, 2);
      html = html.slice(0, b.start) + `<script type="application/ld+json">\n${next}\n</script>` + html.slice(b.end);
      orgDone = true;
    } else if (page.addFaq && !faqDone && data['@type'] === 'FAQPage' && Array.isArray(data.mainEntity)) {
      const q = FAQ_ADD[page.lang] || FAQ_ADD.en;
      if (!data.mainEntity.some((e) => e.name === q.name)) data.mainEntity.unshift(q);
      const next = JSON.stringify(data, null, 2);
      html = html.slice(0, b.start) + `<script type="application/ld+json">\n${next}\n</script>` + html.slice(b.end);
      faqDone = true;
    }
  }

  // Insert Person graph right after the (new) Organization block.
  if (!personsPresent) {
    const marker = '</script>';
    const orgIdx = html.indexOf('"@id": "https://memecmo.ai/#org"');
    const insertAt = html.indexOf(marker, orgIdx) + marker.length;
    html = html.slice(0, insertAt) +
      `\n<script type="application/ld+json">\n${JSON.stringify(PERSONS, null, 2)}\n</script>` +
      html.slice(insertAt);
  }

  writeFileSync(path, html);
  console.log(`${page.file}: org=${orgDone ? '✓' : '✗'} faq=${page.addFaq ? (faqDone ? '✓' : '✗') : '-'} persons=${personsPresent ? 'kept' : '✓added'}`);
}
console.log('done');
