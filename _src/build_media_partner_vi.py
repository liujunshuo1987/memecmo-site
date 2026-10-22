#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Builds the Vietnamese media-partner page (the public twin of the partner deck).

  python3 _src/build_media_partner_vi.py

  /vi/doi-tac-truyen-thong/  Vietnamese - newsrooms and media groups

Rules for the copy: no rank claims about ourselves, no promise of AI outcomes,
no paid placement, outlet figures only from the public monthly source list,
no client named, commercial terms discussed per newsroom (never on the page).
"""
import json
import os
from urllib.parse import quote

from build_geo_vietnam import C as GUIDE, CSS, LOGO, ROOT, SITE, SOURCES, STAGES, e, pct

URL = SITE + '/vi/doi-tac-truyen-thong/'
PATH = 'vi/doi-tac-truyen-thong'
UPDATED = '2026-10-21'
CONTACT = 'mailto:samchan@memecmo.ai?subject=' + quote('Hợp tác truyền thông · MemeCMO')

# September 2026 public list: 1,992 cited AI answers, 10 brand panels, 6 industries, 4 engines.
BASE = 1992
OUTLETS = [('vnexpress.net', 382), ('brandsvietnam.com', 241), ('vietnam.vn', 226), ('cafef.vn', 208)]

TITLE = 'Đề xuất hợp tác cho báo chí Việt Nam: cùng xây GEO'
DESC = ('Báo chí Việt Nam đã là nguồn mà ChatGPT, Gemini, Perplexity và Google AI Overview trích dẫn. '
        'MemeCMO đề xuất với các tòa soạn: báo cáo trích dẫn hằng tháng, báo cáo nguồn tin đồng thương hiệu, '
        'tập huấn và báo cáo hiệu quả — độc lập biên tập, không mua bài, không bán thứ hạng AI.')
LEAD = ('Khi người mua hỏi trợ lý AI nên chọn sản phẩm hay dịch vụ nào, AI trả lời dựa trên những gì nó đọc được — '
        'và báo chí Việt Nam nằm trong số nguồn được trích dẫn nhiều nhất. Chúng tôi đo được điều đó hằng tháng. '
        'Trang này tóm tắt đề xuất của MemeCMO gửi các tòa soạn: cùng xây GEO (tối ưu hiển thị trên công cụ AI) '
        'mà vẫn giữ nguyên độc lập biên tập.')

STAGE_READS = [
    ('Tìm hiểu', 'trang chuyên ngành, chuỗi nhà thuốc, bệnh viện, nhà bán lẻ'),
    ('Cân nhắc và so sánh', 'nền tảng tài liệu, báo đời sống, diễn đàn, trang đánh giá'),
    ('Kiểm tra uy tín', 'báo toàn quốc, báo kinh doanh, Wikipedia, trang tuyển dụng'),
]

PARTNER_GETS = [
    ('Báo cáo trích dẫn hằng tháng', 'AI trích dẫn quý báo bao nhiêu, ở ngành nào, ở giai đoạn nào của hành trình mua — số liệu dùng được cho kinh doanh quảng cáo.'),
    ('Báo cáo nguồn tin đồng thương hiệu', 'Dữ liệu hằng tháng về những nguồn AI trích dẫn tại Việt Nam, làm chất liệu cho tin bài dữ liệu. Tòa soạn biên tập độc lập.'),
    ('Tập huấn cho tòa soạn', 'Viết thế nào để AI đọc đúng và tiếp tục trích dẫn: ghi rõ tác giả, ngày đăng, dữ liệu có cấu trúc.'),
    ('Báo cáo hiệu quả', 'Bài nào thực sự thay đổi câu trả lời của AI — so sánh trước và sau trên cùng một bộ câu hỏi.'),
]

WE_GET = [
    ('Kênh nội dung minh bạch', 'Bài dữ liệu, chuyên mục, nội dung hợp tác. Nội dung hợp tác luôn được ghi rõ.'),
    ('Báo cáo được báo đăng', 'Khi báo cáo nguồn tin xuất hiện trên báo, chính nó trở thành nguồn mà AI trích dẫn.'),
    ('Sự thật kiểm chứng được', 'Thương hiệu gửi dữ liệu rõ ràng, có nguồn — tòa soạn biên tập nhanh hơn và ít rủi ro hơn.'),
]

RULES = [
    ('Độc lập biên tập.', 'Tòa soạn toàn quyền quyết định đăng gì. Chúng tôi không mua bài; nội dung hợp tác luôn ghi rõ.'),
    ('Không hứa kết quả AI.', 'Chúng tôi cam kết đo lường và đối soát minh bạch, không cam kết AI sẽ trả lời thế nào.'),
    ('Không bán “thứ hạng AI”.', 'Không bán vị trí trong câu trả lời của AI, không thổi phồng số lần trích dẫn.'),
    ('Chỉ công khai số tổng hợp.', 'Không nêu tên thương hiệu hay tờ báo trong dữ liệu công khai khi chưa có đồng ý.'),
]

STEPS = [
    ('Báo cáo trích dẫn đầu tiên — miễn phí', 'Chúng tôi gửi riêng cho quý báo: AI trích dẫn quý báo ở ngành nào, giai đoạn nào, bao nhiêu lần. Không ràng buộc.'),
    ('Một bài dữ liệu chung', 'Từ danh sách nguồn AI trích dẫn hằng tháng. Tòa soạn biên tập độc lập.'),
    ('Thỏa thuận đối tác theo quý', 'Báo cáo hằng tháng, tập huấn tòa soạn, báo cáo hiệu quả. Điều khoản thương mại được thảo luận riêng với từng tòa soạn.'),
]

DISC = next(s for s in STAGES if s[0] == 'discovery')

FAQ = [
    ('MemeCMO đề xuất gì với báo chí Việt Nam?',
     'MemeCMO đề xuất các tòa soạn cùng xây GEO (tối ưu hiển thị trên công cụ AI): MemeCMO đo cách ChatGPT, Gemini, Perplexity, Claude và Google AI Overview trích dẫn báo chí, '
     'gửi tòa soạn báo cáo trích dẫn hằng tháng, báo cáo nguồn tin đồng thương hiệu, tập huấn và báo cáo hiệu quả. Tòa soạn giữ toàn quyền biên tập.'),
    ('Báo nào được AI trích dẫn nhiều nhất tại Việt Nam?',
     'Theo danh sách công khai tháng 9/2026 của MemeCMO (%s câu trả lời AI có trích dẫn, 10 bảng thương hiệu, 6 ngành, 4 công cụ AI): %s.'
     % ('{:,}'.format(BASE).replace(',', '.'), '; '.join('%s được trích dẫn trong %s câu trả lời' % (d, pct(n * 100.0 / BASE, 'vi')) for d, n in OUTLETS))),
    ('Vì sao báo chí quan trọng với GEO?',
     'Trong phép đo của MemeCMO trên 12 thương hiệu tại Việt Nam (3.011 câu trả lời AI có trích dẫn, tháng 6–10/2026), khi người mua chưa biết thương hiệu, '
     'website của chính thương hiệu chỉ chiếm %s nguồn AI đọc; phần còn lại đến từ bên thứ ba, trong đó có báo chí.' % pct(DISC[2], 'vi')),
    ('Tòa soạn nhận được gì khi hợp tác với MemeCMO?',
     ' '.join('%s: %s' % (a, b) for a, b in PARTNER_GETS)),
    ('MemeCMO có mua bài hay bán thứ hạng trên AI không?',
     'Không. MemeCMO không mua bài, không bán vị trí trong câu trả lời của AI và không hứa kết quả AI. Nội dung hợp tác luôn được ghi rõ, và dữ liệu công khai chỉ là số tổng hợp.'),
    ('Bắt đầu hợp tác với MemeCMO thế nào?',
     'Bước đầu là một báo cáo trích dẫn miễn phí, gửi riêng cho tòa soạn. Sau đó là một bài dữ liệu chung, rồi thỏa thuận đối tác theo quý. Liên hệ: samchan@memecmo.ai.'),
]

EXTRA_CSS = """
ol.steps{padding-left:22px}ol.steps li{margin-bottom:10px}ol.steps b{display:block}
ul.rules{list-style:none;padding:0}ul.rules li{background:var(--surface);border:1px solid var(--edge);border-radius:12px;padding:14px 18px;margin-bottom:10px;font-size:15px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.grid.three{grid-template-columns:repeat(3,1fr)}
.grid .card h3{font-size:16.5px;margin:0 0 6px}.grid .card p{margin:0;font-size:14.5px;color:var(--dim)}
@media(max-width:640px){.grid,.grid.three{grid-template-columns:1fr}}
"""


def cards(items):
    return '<div class="grid%s">%s</div>' % (' three' if len(items) == 3 else '', ''.join('<div class="card"><h3>%s</h3><p>%s</p></div>' % (e(a), e(b)) for a, b in items))


def page():
    g = GUIDE['vi']
    ld = [
        {'@context': 'https://schema.org', '@type': 'Article', '@id': URL + '#article', 'headline': TITLE,
         'description': DESC, 'inLanguage': 'vi', 'url': URL, 'datePublished': UPDATED, 'dateModified': UPDATED,
         'author': {'@id': SITE + '/#org'}, 'publisher': {'@id': SITE + '/#org'},
         'about': 'Hợp tác giữa báo chí và đo lường GEO tại Việt Nam'},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': 'vi',
         'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ]},
    ]
    outlets = ''.join('<tr><td>%s</td><td class="num">%s</td><td class="num">%s / %s</td></tr>' % (
        e(d), pct(n * 100.0 / BASE, 'vi'), n, '{:,}'.format(BASE).replace(',', '.')) for d, n in OUTLETS)
    stages = ''.join('<tr%s><td>%s</td><td class="num">%s</td></tr>' % (
        ' class="hi"' if s == 'discovery' else '', e(g['stage_names'][s]), pct(o, 'vi')) for s, _, o in STAGES)
    reads = ''.join('<li><b>%s:</b> %s</li>' % (e(a), e(b)) for a, b in STAGE_READS)
    rules = ''.join('<li><b>%s</b> %s</li>' % (e(a), e(b)) for a, b in RULES)
    steps = ''.join('<li><b>%s</b>%s</li>' % (e(a), e(b)) for a, b in STEPS)
    faq = ''.join('<h3 style="font-size:16px;margin:22px 0 6px">%s</h3><p style="margin:0;font-size:14.5px;color:var(--dim)">%s</p>' % (e(q), e(a)) for q, a in FAQ)
    return '''<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%(title)s | MemeCMO</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(url)s">
<link rel="alternate" hreflang="vi" href="%(url)s">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png?v=2">
<link rel="shortcut icon" href="/favicon.ico?v=2">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2">
<meta property="og:type" content="article">
<meta property="og:url" content="%(url)s">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="https://memecmo.ai/og.png">
%(ld)s
<style>%(css)s</style>
</head>
<body>
<div class="wrap">
<header class="site"><a class="logo" href="/vi/">%(logo)s MemeCMO</a><nav><a href="/vi/about/">About</a><a href="/compare/">Compare</a><a href="https://app.memecmo.ai/demo">Demo</a></nav></header>
<div class="kicker">Việt Nam · Dành cho tòa soạn</div>
<h1>Đề xuất hợp tác cho báo chí: cùng xây GEO tại Việt Nam</h1>
<p class="lead">%(lead)s</p>
<h2>Báo chí Việt Nam đã là nguồn hàng đầu của AI</h2>
<div class="card"><p style="margin:0">Tỷ lệ câu trả lời AI có trích dẫn nhắc tới từng tờ báo, tháng 9/2026.</p>
<table><thead><tr><th>Báo</th><th>Tỷ lệ câu trả lời</th><th>Số câu trả lời</th></tr></thead><tbody>%(outlets)s</tbody></table>
<p class="note">Nguồn: danh sách công khai hằng tháng của MemeCMO — 10 bảng thương hiệu, 6 ngành, 4 công cụ AI. Một câu trả lời có thể trích dẫn nhiều báo nên các tỷ lệ không cộng thành 100%%.</p></div>
<h2>AI đọc ở đâu thay đổi theo hành trình mua</h2>
<ul class="plain">%(reads)s</ul>
<div class="card"><p style="margin:0">Trên 12 thương hiệu chúng tôi đo tại Việt Nam (3.011 câu trả lời AI có trích dẫn, tháng 6–10/2026), website của chính thương hiệu chỉ chiếm <b>%(disc)s</b> nguồn AI đọc khi người mua chưa biết thương hiệu. Phần còn lại là bên thứ ba — trong đó có báo chí.</p>
<table><thead><tr><th>%(sh0)s</th><th>%(sh2)s</th></tr></thead><tbody>%(stages)s</tbody></table></div>
<h2>Quý báo nhận được</h2>
%(partner)s
<h2>MemeCMO và khách hàng nhận được</h2>
%(we)s
<h2>Bốn nguyên tắc</h2>
<ul class="rules">%(rules)s</ul>
<h2>Bắt đầu trong ba bước</h2>
<ol class="steps">%(steps)s</ol>
<a class="cta" href="%(contact)s">Liên hệ hợp tác</a>
<h2>Câu hỏi thường gặp</h2>
%(faq)s
<ul class="links"><li><a href="%(sources)s">Danh sách nguồn AI trích dẫn tại Việt Nam (hằng tháng) →</a></li><li><a href="/vi/geo-viet-nam/">Chọn đơn vị GEO tại Việt Nam →</a></li></ul>
<footer>MemeCMO Tech Limited · Số ĐKKD Hồng Kông 80218619 · Cập nhật 21/10/2026 · <a href="/llms.txt">llms.txt</a></footer>
</div>
</body>
</html>
''' % {
        'title': e(TITLE), 'desc': e(DESC), 'url': URL,
        'ld': '\n'.join('<script type="application/ld+json">\n%s\n</script>' % json.dumps(x, ensure_ascii=False, indent=2) for x in ld),
        'css': CSS + EXTRA_CSS, 'logo': LOGO, 'lead': e(LEAD), 'outlets': outlets, 'reads': reads,
        'disc': pct(DISC[2], 'vi'), 'sh0': e(g['stage_head'][0]), 'sh2': e(g['stage_head'][2]), 'stages': stages,
        'partner': cards(PARTNER_GETS), 'we': cards(WE_GET), 'rules': rules, 'steps': steps,
        'contact': CONTACT, 'faq': faq, 'sources': SOURCES + '/vi',
    }


if __name__ == '__main__':
    d = os.path.join(ROOT, PATH)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page())
    print('wrote', PATH + '/index.html')
