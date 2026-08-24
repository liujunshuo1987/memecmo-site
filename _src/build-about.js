#!/usr/bin/env node
// Build /about/ for all 6 locales from the EN master (about/index.html) by
// swapping localized strings. Facts (names, numbers, addresses) stay latin.
// Run AFTER _src/build.js. EN master is hand-maintained; this file holds the
// per-locale strings.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EN = fs.readFileSync(path.join(ROOT, 'about', 'index.html'), 'utf8')
  // idempotent re-runs: strip any previously injected hreflang lines
  .split('\n').filter(l => !l.includes('rel="alternate" hreflang')).join('\n')
  .replace(/<link rel="canonical" href="[^"]*about\/">/, '<link rel="canonical" href="https://memecmo.ai/about/">');

const SITE = 'https://memecmo.ai';
const LOCS = { en: '', zh: 'zh/', vi: 'vi/', th: 'th/', fil: 'fil/', ms: 'ms/' };
const HREFLANG = Object.entries(LOCS).map(([lc, p]) =>
  `<link rel="alternate" hreflang="${lc === 'zh' ? 'zh' : lc}" href="${SITE}/${p}about/">`).join('\n') +
  `\n<link rel="alternate" hreflang="x-default" href="${SITE}/about/">`;

const T = {
  zh: {
    _lang: 'zh',
    'About MemeCMO — MemeCMO Tech Limited': '关于 MemeCMO — MemeCMO Tech Limited',
    'About Us · 關於我們': 'About Us · 关于我们',
    'MemeCMO is a Generative Engine Optimization (GEO) platform: ten AI agents measure how ChatGPT, Gemini, Perplexity, Claude and Google AI Overview describe a brand, build the missing assets — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — and report every week. Two product lines: Southeast Asia in six markets and local languages, and the United States, measured state by state.':
      'MemeCMO 是生成式引擎优化(GEO)平台:十个 AI 智能体测量 ChatGPT、Gemini、Perplexity、Claude 与 Google AI Overview 如何描述品牌,建设缺失资产——标准答案、JSON-LD Schema、缺口内容、第三方引用、百科条目——并每周汇报。两条产品线:东南亚六大市场(本地语言)与美国(逐州测量)。',
    'Registration · 法定註冊資訊': '法定注册信息 · Registration',
    'Leadership · 董事及核心人員': '董事及核心人员 · Leadership',
    'The platform · 平台': '平台 · The platform',
    'Clients · 客戶': '客户 · Clients',
    'Legal name': '法定名称', 'Founded': '成立日期', 'Registered office': '注册办事处', 'Markets': '服务市场', 'Contact': '联系方式',
    'Official registry:': '官方查册:',
    'Founding Director · 創始董事': '创始董事 · Founding Director',
    'Chief Technology Advisor · 首席技術顧問': '首席技术顾问 · Chief Technology Advisor',
    'Sole director of MemeCMO Tech Limited — corporate governance, business strategy and Southeast Asia market development.': 'MemeCMO Tech Limited 唯一董事,负责公司治理、商业策略与东南亚市场拓展。',
    'Leads architecture and R&amp;D of the GEO multi-agent platform: the ten-agent suite, the measurement methodology and the state-aware US line.': '主导 GEO 多智能体平台的架构与研发:十智能体套件、测量方法论与州级美国线。',
    '<b>Measure</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate and answer accuracy, per engine, on a frozen prompt panel so movement is signal, not noise.': '<b>测量</b>——出现率、声量份额、引用率、AI 情感、首位提及率与答案准确率,逐引擎、在冻结的提示词面板上进行,让变化是信号而非噪音。',
    '<b>Build</b> — every agent ships a publish-ready deliverable grounded in verified brand facts: standard answers, schema, gap content, placements for the sources AI actually cites, encyclopedia entries.': '<b>建设</b>——每个智能体交付可直接发布的成果,以核验过的品牌事实为据:标准答案、Schema、缺口内容、面向 AI 真正引用信源的投放、百科条目。',
    '<b>Report</b> — a stage-aware digest to the client\'s inbox every week, monthly deep reports, drop alerts, and one-page portfolio rollups for agencies.': '<b>汇报</b>——每周按阶段解读的客户摘要、月度深度报告、下跌告警,以及面向代理商的一页组合汇总。',
    'Enter the platform →': '进入平台 →', 'Product guide': '产品使用说明', 'US state-aware line': '美国州级产品线',
    '<b>Focus Media Vietnam</b> — first channel partner and flagship client (Vietnam · elevator media / OOH digital signage).': '<b>分众越南(Focus Media Vietnam)</b>——首个渠道伙伴与旗舰客户(越南 · 电梯媒体 / 户外数字标牌)。',
    'Home': '首页', 'Guide': '使用说明', 'US line': '美国线', 'Sign in →': '登录 →',
  },
  vi: {
    _lang: 'vi',
    'About MemeCMO — MemeCMO Tech Limited': 'Về MemeCMO — MemeCMO Tech Limited',
    'About Us · 關於我們': 'Về chúng tôi · About Us',
    'MemeCMO is a Generative Engine Optimization (GEO) platform: ten AI agents measure how ChatGPT, Gemini, Perplexity, Claude and Google AI Overview describe a brand, build the missing assets — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — and report every week. Two product lines: Southeast Asia in six markets and local languages, and the United States, measured state by state.':
      'MemeCMO là nền tảng Tối ưu hóa Công cụ Sinh tạo (GEO): mười AI agent đo lường cách ChatGPT, Gemini, Perplexity, Claude và Google AI Overview mô tả thương hiệu, xây dựng tài sản còn thiếu — câu trả lời chuẩn, schema JSON-LD, nội dung lấp khoảng trống, trích dẫn bên thứ ba, mục bách khoa — và báo cáo hàng tuần. Hai dòng sản phẩm: Đông Nam Á tại sáu thị trường bằng ngôn ngữ địa phương, và Hoa Kỳ đo theo từng bang.',
    'Registration · 法定註冊資訊': 'Thông tin đăng ký · Registration',
    'Leadership · 董事及核心人員': 'Ban lãnh đạo · Leadership',
    'The platform · 平台': 'Nền tảng · The platform',
    'Clients · 客戶': 'Khách hàng · Clients',
    'Legal name': 'Tên pháp lý', 'Founded': 'Thành lập', 'Registered office': 'Văn phòng đăng ký', 'Markets': 'Thị trường', 'Contact': 'Liên hệ',
    'Official registry:': 'Đăng ký chính thức:',
    'Founding Director · 創始董事': 'Giám đốc sáng lập · Founding Director',
    'Chief Technology Advisor · 首席技術顧問': 'Cố vấn công nghệ trưởng · Chief Technology Advisor',
    'Sole director of MemeCMO Tech Limited — corporate governance, business strategy and Southeast Asia market development.': 'Giám đốc duy nhất của MemeCMO Tech Limited — quản trị công ty, chiến lược kinh doanh và phát triển thị trường Đông Nam Á.',
    'Leads architecture and R&amp;D of the GEO multi-agent platform: the ten-agent suite, the measurement methodology and the state-aware US line.': 'Dẫn dắt kiến trúc và R&D của nền tảng đa agent GEO: bộ mười agent, phương pháp đo lường và dòng Hoa Kỳ theo bang.',
    '<b>Measure</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate and answer accuracy, per engine, on a frozen prompt panel so movement is signal, not noise.': '<b>Đo lường</b> — tần suất xuất hiện, thị phần giọng nói, tỷ lệ trích dẫn, cảm xúc AI, tỷ lệ nhắc đầu tiên và độ chính xác câu trả lời, theo từng engine, trên bộ câu hỏi cố định để biến động là tín hiệu, không phải nhiễu.',
    '<b>Build</b> — every agent ships a publish-ready deliverable grounded in verified brand facts: standard answers, schema, gap content, placements for the sources AI actually cites, encyclopedia entries.': '<b>Xây dựng</b> — mỗi agent bàn giao sản phẩm sẵn sàng xuất bản dựa trên dữ kiện thương hiệu đã xác minh: câu trả lời chuẩn, schema, nội dung lấp khoảng trống, đăng tải cho các nguồn AI thực sự trích dẫn, mục bách khoa.',
    '<b>Report</b> — a stage-aware digest to the client\'s inbox every week, monthly deep reports, drop alerts, and one-page portfolio rollups for agencies.': '<b>Báo cáo</b> — bản tin theo giai đoạn đến hộp thư khách hàng mỗi tuần, báo cáo sâu hàng tháng, cảnh báo sụt giảm và tổng hợp danh mục một trang cho đại lý.',
    'Enter the platform →': 'Vào nền tảng →', 'Product guide': 'Hướng dẫn sản phẩm', 'US state-aware line': 'Dòng Hoa Kỳ theo bang',
    '<b>Focus Media Vietnam</b> — first channel partner and flagship client (Vietnam · elevator media / OOH digital signage).': '<b>Focus Media Vietnam</b> — đối tác kênh đầu tiên và khách hàng chủ lực (Việt Nam · truyền thông thang máy / biển quảng cáo số OOH).',
    'Home': 'Trang chủ', 'Guide': 'Hướng dẫn', 'US line': 'Dòng Hoa Kỳ', 'Sign in →': 'Đăng nhập →',
  },
  th: {
    _lang: 'th',
    'About MemeCMO — MemeCMO Tech Limited': 'เกี่ยวกับ MemeCMO — MemeCMO Tech Limited',
    'About Us · 關於我們': 'เกี่ยวกับเรา · About Us',
    'MemeCMO is a Generative Engine Optimization (GEO) platform: ten AI agents measure how ChatGPT, Gemini, Perplexity, Claude and Google AI Overview describe a brand, build the missing assets — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — and report every week. Two product lines: Southeast Asia in six markets and local languages, and the United States, measured state by state.':
      'MemeCMO คือแพลตฟอร์ม Generative Engine Optimization (GEO): AI agent สิบตัววัดว่า ChatGPT, Gemini, Perplexity, Claude และ Google AI Overview อธิบายแบรนด์อย่างไร สร้างสินทรัพย์ที่ขาด — คำตอบมาตรฐาน, schema JSON-LD, เนื้อหาปิดช่องว่าง, การอ้างอิงบุคคลที่สาม, รายการสารานุกรม — และรายงานทุกสัปดาห์ สองสายผลิตภัณฑ์: เอเชียตะวันออกเฉียงใต้หกตลาดในภาษาท้องถิ่น และสหรัฐฯ วัดรายรัฐ',
    'Registration · 法定註冊資訊': 'ข้อมูลจดทะเบียน · Registration',
    'Leadership · 董事及核心人員': 'ผู้นำ · Leadership',
    'The platform · 平台': 'แพลตฟอร์ม · The platform',
    'Clients · 客戶': 'ลูกค้า · Clients',
    'Legal name': 'ชื่อตามกฎหมาย', 'Founded': 'ก่อตั้ง', 'Registered office': 'สำนักงานจดทะเบียน', 'Markets': 'ตลาด', 'Contact': 'ติดต่อ',
    'Official registry:': 'ทะเบียนทางการ:',
    'Founding Director · 創始董事': 'กรรมการผู้ก่อตั้ง · Founding Director',
    'Chief Technology Advisor · 首席技術顧問': 'ที่ปรึกษาเทคโนโลยีหลัก · Chief Technology Advisor',
    'Sole director of MemeCMO Tech Limited — corporate governance, business strategy and Southeast Asia market development.': 'กรรมการคนเดียวของ MemeCMO Tech Limited — ธรรมาภิบาล กลยุทธ์ธุรกิจ และการพัฒนาตลาดเอเชียตะวันออกเฉียงใต้',
    'Leads architecture and R&amp;D of the GEO multi-agent platform: the ten-agent suite, the measurement methodology and the state-aware US line.': 'นำสถาปัตยกรรมและ R&D ของแพลตฟอร์ม GEO หลาย agent: ชุดสิบ agent วิธีวัดผล และสายสหรัฐฯ รายรัฐ',
    '<b>Measure</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate and answer accuracy, per engine, on a frozen prompt panel so movement is signal, not noise.': '<b>วัด</b> — อัตราการปรากฏ ส่วนแบ่งเสียง อัตราการอ้างอิง ความรู้สึกของ AI อัตราการถูกเอ่ยชื่อแรก และความแม่นยำของคำตอบ รายengine บนชุดคำถามคงที่ เพื่อให้การเปลี่ยนแปลงคือสัญญาณ ไม่ใช่สัญญาณรบกวน',
    '<b>Build</b> — every agent ships a publish-ready deliverable grounded in verified brand facts: standard answers, schema, gap content, placements for the sources AI actually cites, encyclopedia entries.': '<b>สร้าง</b> — ทุก agent ส่งมอบงานพร้อมเผยแพร่บนพื้นฐานข้อเท็จจริงแบรนด์ที่ตรวจสอบแล้ว: คำตอบมาตรฐาน, schema, เนื้อหาปิดช่องว่าง, การเผยแพร่ไปยังแหล่งที่ AI อ้างอิงจริง, รายการสารานุกรม',
    '<b>Report</b> — a stage-aware digest to the client\'s inbox every week, monthly deep reports, drop alerts, and one-page portfolio rollups for agencies.': '<b>รายงาน</b> — สรุปตามช่วงส่งถึงอีเมลลูกค้าทุกสัปดาห์ รายงานเชิงลึกรายเดือน แจ้งเตือนเมื่อคะแนนลด และสรุปพอร์ตหนึ่งหน้าสำหรับเอเจนซี่',
    'Enter the platform →': 'เข้าสู่แพลตฟอร์ม →', 'Product guide': 'คู่มือผลิตภัณฑ์', 'US state-aware line': 'สายสหรัฐฯ รายรัฐ',
    '<b>Focus Media Vietnam</b> — first channel partner and flagship client (Vietnam · elevator media / OOH digital signage).': '<b>Focus Media Vietnam</b> — พาร์ทเนอร์ช่องทางรายแรกและลูกค้าเรือธง (เวียดนาม · สื่อในลิฟต์ / ป้ายดิจิทัล OOH)',
    'Home': 'หน้าแรก', 'Guide': 'คู่มือ', 'US line': 'สายสหรัฐฯ', 'Sign in →': 'เข้าสู่ระบบ →',
  },
  fil: {
    _lang: 'fil',
    'About MemeCMO — MemeCMO Tech Limited': 'Tungkol sa MemeCMO — MemeCMO Tech Limited',
    'About Us · 關於我們': 'Tungkol sa amin · About Us',
    'MemeCMO is a Generative Engine Optimization (GEO) platform: ten AI agents measure how ChatGPT, Gemini, Perplexity, Claude and Google AI Overview describe a brand, build the missing assets — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — and report every week. Two product lines: Southeast Asia in six markets and local languages, and the United States, measured state by state.':
      'Ang MemeCMO ay isang Generative Engine Optimization (GEO) platform: sampung AI agent ang sumusukat kung paano inilalarawan ng ChatGPT, Gemini, Perplexity, Claude at Google AI Overview ang isang brand, bumubuo ng kulang na asset — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — at nagre-report linggo-linggo. Dalawang product line: Timog-Silangang Asya sa anim na merkado sa lokal na wika, at Estados Unidos na sinusukat bawat estado.',
    'Registration · 法定註冊資訊': 'Rehistro · Registration',
    'Leadership · 董事及核心人員': 'Pamunuan · Leadership',
    'The platform · 平台': 'Ang platform',
    'Clients · 客戶': 'Mga kliyente · Clients',
    'Legal name': 'Legal na pangalan', 'Founded': 'Itinatag', 'Registered office': 'Rehistradong opisina', 'Markets': 'Mga merkado', 'Contact': 'Kontak',
    'Official registry:': 'Opisyal na registry:',
    'Founding Director · 創始董事': 'Founding Director',
    'Chief Technology Advisor · 首席技術顧問': 'Chief Technology Advisor',
    'Sole director of MemeCMO Tech Limited — corporate governance, business strategy and Southeast Asia market development.': 'Nag-iisang direktor ng MemeCMO Tech Limited — corporate governance, business strategy at pagpapaunlad ng merkado sa Timog-Silangang Asya.',
    'Leads architecture and R&amp;D of the GEO multi-agent platform: the ten-agent suite, the measurement methodology and the state-aware US line.': 'Nangunguna sa arkitektura at R&D ng GEO multi-agent platform: ang sampung-agent suite, ang measurement methodology at ang state-aware US line.',
    '<b>Measure</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate and answer accuracy, per engine, on a frozen prompt panel so movement is signal, not noise.': '<b>Sukatin</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate at answer accuracy, bawat engine, sa frozen prompt panel para signal ang galaw, hindi ingay.',
    '<b>Build</b> — every agent ships a publish-ready deliverable grounded in verified brand facts: standard answers, schema, gap content, placements for the sources AI actually cites, encyclopedia entries.': '<b>Bumuo</b> — bawat agent ay nagde-deliver ng publish-ready na output batay sa verified na brand facts: standard answers, schema, gap content, placements para sa mga source na talagang sini-cite ng AI, encyclopedia entries.',
    '<b>Report</b> — a stage-aware digest to the client\'s inbox every week, monthly deep reports, drop alerts, and one-page portfolio rollups for agencies.': '<b>Mag-report</b> — stage-aware digest sa inbox ng kliyente linggo-linggo, buwanang malalim na report, drop alerts, at one-page portfolio rollups para sa mga agency.',
    'Enter the platform →': 'Pumasok sa platform →', 'Product guide': 'Gabay sa produkto', 'US state-aware line': 'US state-aware line',
    '<b>Focus Media Vietnam</b> — first channel partner and flagship client (Vietnam · elevator media / OOH digital signage).': '<b>Focus Media Vietnam</b> — unang channel partner at flagship client (Vietnam · elevator media / OOH digital signage).',
    'Home': 'Home', 'Guide': 'Gabay', 'US line': 'US line', 'Sign in →': 'Mag-sign in →',
  },
  ms: {
    _lang: 'ms',
    'About MemeCMO — MemeCMO Tech Limited': 'Tentang MemeCMO — MemeCMO Tech Limited',
    'About Us · 關於我們': 'Tentang kami · About Us',
    'MemeCMO is a Generative Engine Optimization (GEO) platform: ten AI agents measure how ChatGPT, Gemini, Perplexity, Claude and Google AI Overview describe a brand, build the missing assets — standard answers, JSON-LD schema, gap content, third-party citations, encyclopedia entries — and report every week. Two product lines: Southeast Asia in six markets and local languages, and the United States, measured state by state.':
      'MemeCMO ialah platform Generative Engine Optimization (GEO): sepuluh ejen AI mengukur bagaimana ChatGPT, Gemini, Perplexity, Claude dan Google AI Overview menggambarkan jenama, membina aset yang kurang — jawapan standard, skema JSON-LD, kandungan jurang, petikan pihak ketiga, entri ensiklopedia — dan melaporkan setiap minggu. Dua barisan produk: Asia Tenggara di enam pasaran dalam bahasa tempatan, dan Amerika Syarikat diukur mengikut negeri.',
    'Registration · 法定註冊資訊': 'Pendaftaran · Registration',
    'Leadership · 董事及核心人員': 'Kepimpinan · Leadership',
    'The platform · 平台': 'Platform',
    'Clients · 客戶': 'Pelanggan · Clients',
    'Legal name': 'Nama sah', 'Founded': 'Ditubuhkan', 'Registered office': 'Pejabat berdaftar', 'Markets': 'Pasaran', 'Contact': 'Hubungi',
    'Official registry:': 'Pendaftaran rasmi:',
    'Founding Director · 創始董事': 'Pengarah Pengasas · Founding Director',
    'Chief Technology Advisor · 首席技術顧問': 'Penasihat Teknologi Ketua · Chief Technology Advisor',
    'Sole director of MemeCMO Tech Limited — corporate governance, business strategy and Southeast Asia market development.': 'Pengarah tunggal MemeCMO Tech Limited — tadbir urus korporat, strategi perniagaan dan pembangunan pasaran Asia Tenggara.',
    'Leads architecture and R&amp;D of the GEO multi-agent platform: the ten-agent suite, the measurement methodology and the state-aware US line.': 'Menerajui seni bina dan R&D platform berbilang ejen GEO: suite sepuluh ejen, metodologi pengukuran dan barisan AS mengikut negeri.',
    '<b>Measure</b> — presence, share of voice, citation rate, AI sentiment, top-of-mind rate and answer accuracy, per engine, on a frozen prompt panel so movement is signal, not noise.': '<b>Ukur</b> — kehadiran, share of voice, kadar petikan, sentimen AI, kadar top-of-mind dan ketepatan jawapan, mengikut enjin, pada panel prompt beku supaya pergerakan ialah isyarat, bukan hingar.',
    '<b>Build</b> — every agent ships a publish-ready deliverable grounded in verified brand facts: standard answers, schema, gap content, placements for the sources AI actually cites, encyclopedia entries.': '<b>Bina</b> — setiap ejen menghantar hasil sedia terbit berasaskan fakta jenama yang disahkan: jawapan standard, skema, kandungan jurang, penempatan untuk sumber yang benar-benar dipetik AI, entri ensiklopedia.',
    '<b>Report</b> — a stage-aware digest to the client\'s inbox every week, monthly deep reports, drop alerts, and one-page portfolio rollups for agencies.': '<b>Lapor</b> — ringkasan mengikut peringkat ke peti masuk pelanggan setiap minggu, laporan mendalam bulanan, amaran penurunan, dan gabungan portfolio satu muka untuk agensi.',
    'Enter the platform →': 'Masuk ke platform →', 'Product guide': 'Panduan produk', 'US state-aware line': 'Barisan AS mengikut negeri',
    '<b>Focus Media Vietnam</b> — first channel partner and flagship client (Vietnam · elevator media / OOH digital signage).': '<b>Focus Media Vietnam</b> — rakan saluran pertama dan pelanggan utama (Vietnam · media lif / papan tanda digital OOH).',
    'Home': 'Laman utama', 'Guide': 'Panduan', 'US line': 'Barisan AS', 'Sign in →': 'Log masuk →',
  },
};

// EN gets hreflang injected too.
function withHreflang(html, canonicalPath) {
  return html.replace('<link rel="canonical" href="https://memecmo.ai/about/">',
    `<link rel="canonical" href="${SITE}/${canonicalPath}about/">\n${HREFLANG}`);
}

let en = withHreflang(EN, '');
fs.writeFileSync(path.join(ROOT, 'about', 'index.html'), en, 'utf8');
console.log('  about/ (en) hreflang ✓');

for (const [lc, dict] of Object.entries(T)) {
  let html = withHreflang(EN, LOCS[lc]);
  html = html.replace('<html lang="en">', `<html lang="${dict._lang}">`);
  for (const [k, v] of Object.entries(dict)) {
    if (k === '_lang') continue;
    html = html.split(k).join(v);
  }
  const dir = path.join(ROOT, LOCS[lc], 'about');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  console.log(`  ${LOCS[lc]}about/ ✓`);
}
