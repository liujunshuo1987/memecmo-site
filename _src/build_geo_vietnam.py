#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Builds the three "choosing a GEO provider in Vietnam" pages.

  python3 _src/build_geo_vietnam.py

  /geo-vietnam/      English  - international buyers
  /vi/geo-viet-nam/  Vietnamese - local advertisers (no Chinese-brand framing)
  /zh/geo-vietnam/   Chinese  - Chinese brands entering Vietnam

Rules for the copy: no rank claims about ourselves, no competitor names, every
number traceable (aggregate of >=5 brands only), media layer outside Vietnam
stated as roadmap, Focus Media Vietnam named only as first partner (never as a
promise to place articles).
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://memecmo.ai'
URLS = {'en': SITE + '/geo-vietnam/', 'vi': SITE + '/vi/geo-viet-nam/', 'zh': SITE + '/zh/geo-vietnam/'}
PATHS = {'en': 'geo-vietnam', 'vi': 'vi/geo-viet-nam', 'zh': 'zh/geo-vietnam'}
UPDATED = '2026-10-21'
SOURCES = 'https://app.memecmo.ai/sources/vietnam'
CONTACT = 'mailto:samchan@memecmo.ai?subject=Same-question%20baseline%20%C2%B7%20Vietnam'

# The measured stage table (12 Vietnam brands, 2026-06-26 -> 10-21, 3,011
# cited answers, core stage excluded). Same figures as the internal doc.
STAGES = [('discovery', 3.9, 0.7), ('consideration', 26.1, 2.7), ('evaluation', 82.9, 11.4),
          ('competitive', 96.3, 10.6), ('trust', 97.2, 14.3)]

C = {
 'en': {
  'lang': 'en', 'home': '/', 'about': '/about/',
  'title': 'Choosing a GEO provider in Vietnam: the five tests AI tells buyers to apply',
  'desc': 'What to ask a GEO (generative engine optimization) provider in Vietnam: a measured Vietnamese baseline, verifiable metrics, a local source strategy, attributed cases and a same-question test. Plus what AI actually reads when buyers do not know your brand yet.',
  'kicker': 'Vietnam · buyer’s guide',
  'h1': 'Choosing a GEO provider in Vietnam',
  'lead': 'Ask an AI assistant who to hire for GEO in Vietnam and, after naming a few agencies, it gives the same advice in English, Vietnamese and Chinese: do not sign on a ranking — have the candidates measure the same questions, then compare. These are those tests, and how we meet each one.',
  'stat_h': 'Why the first answer is decided off your website',
  'stat_p': 'Across the 12 brands we measure in Vietnam (3,011 AI answers with citations, June–October 2026), when buyers do not know a brand yet AI names it in <b>3.9%</b> of answers — and the brand’s own website is <b>0.7%</b> of the sources AI reads. <b>99.3%</b> comes from third parties. A provider that only works on your website is working on that 0.7%.',
  'stage_head': ('Buyer stage', 'AI names the brand', 'Brand site in sources'),
  'stage_names': {'discovery': 'Exploring the category', 'consideration': 'Considering options', 'evaluation': 'Evaluating', 'competitive': 'Comparing', 'trust': 'Checking reputation'},
  'stage_note': 'Later-stage questions often contain the brand name, which lifts the naming rate. Across all cited answers, 39% cite the brand’s site at least once — mostly after buyers know the brand.',
  'tests_h': 'The five tests',
  'ask': 'Ask for', 'we': 'What we provide',
  'tests': [
   ('A measured Vietnamese baseline', 'Answers for your category, buyers and competitors, in Vietnamese, per AI engine, with the sources each answer cites.', 'A Day-0 baseline on a frozen question panel across ChatGPT, Gemini, Perplexity, Claude and the live Google AI Overview page, with every citation recorded.'),
   ('Verifiable deliverables and metrics', 'An agreed question set, measurement cadence, citation reports and staged targets. Decline promises of a “guaranteed AI recommendation”.', 'Every rate is shown with its fraction. The question panel is held fixed so months compare. No score is edited by hand, and instrument faults are disclosed in the weekly report.'),
   ('A local source strategy', 'Which Vietnamese outlets, industry sites and directories the provider will earn citations from — by name.', 'We publish a monthly list of the sources AI engines cite in Vietnam and plan placements from it. In Vietnam the local media layer is being built with Focus Media Vietnam as first partner; other markets are on our roadmap.'),
   ('Cases with attribution', 'Real cases that separate AI mentions, organic traffic and leads — not correlation sold as cause.', 'Every published action is logged with its date and compared before and after on the same questions.'),
   ('A same-question test', 'Two or three candidates audit or pilot the same question set, so methods and results can be compared.', 'We offer it first: you receive our frozen question list with our baseline, and can ask any other candidate to report on the same list.'),
  ],
  'not_h': 'What we do not do',
  'not': ['Guarantee rankings or AI recommendations.', 'Publish rankings that place ourselves first.', 'Buy placements in “best agency” lists.'],
  'cta_h': 'Start with your own answers',
  'cta_p': 'Send us your category and two competitors. We return the baseline on a frozen question list — and the list itself, so you can hold anyone else to it.',
  'cta': 'Request a same-question baseline',
  'links': [('Monthly list of sources AI cites in Vietnam', SOURCES), ('How GEO platforms compare', '/compare/'), ('Live demo workspace', 'https://app.memecmo.ai/demo')],
  'foot': 'MemeCMO Tech Limited · Hong Kong CR No. 80218619 · Updated 2026-10-21',
  'faq_extra': ('How much of what AI reads comes from a brand’s own website?', 'In MemeCMO’s measurement of 12 brands in Vietnam (3,011 cited AI answers, June–October 2026), the brand’s own website made up 0.7% of the sources AI read when buyers did not know the brand yet, and 14.3% at the reputation-check stage. AI named the brand in 3.9% of discovery-stage answers.'),
 },
 'vi': {
  'lang': 'vi', 'home': '/vi/', 'about': '/vi/about/',
  'title': 'Chọn đơn vị GEO tại Việt Nam: 5 phép thử mà chính AI khuyên người mua',
  'desc': 'Nên hỏi gì khi chọn đơn vị GEO (tối ưu hiển thị trên công cụ AI) tại Việt Nam: mức nền đo bằng tiếng Việt, chỉ số kiểm chứng được, chiến lược nguồn tin địa phương, tình huống có quy kết và phép thử trên cùng bộ câu hỏi.',
  'kicker': 'Việt Nam · Hướng dẫn cho người mua',
  'h1': 'Chọn đơn vị GEO tại Việt Nam',
  'lead': 'Hỏi trợ lý AI nên thuê ai làm GEO tại Việt Nam, sau vài cái tên, AI đưa ra cùng một lời khuyên: đừng ký hợp đồng chỉ vì bảng xếp hạng — hãy để các ứng viên đo trên cùng một bộ câu hỏi rồi so sánh. Dưới đây là các phép thử đó, và cách chúng tôi đáp ứng từng phép thử.',
  'stat_h': 'Vì sao câu trả lời đầu tiên được quyết định ngoài website của bạn',
  'stat_p': 'Trên 12 thương hiệu chúng tôi đo tại Việt Nam (3.011 câu trả lời AI có trích dẫn, tháng 6–10/2026): khi người mua chưa biết thương hiệu, AI chỉ nhắc tên thương hiệu trong <b>3,9%</b> câu trả lời, và website của chính thương hiệu chỉ chiếm <b>0,7%</b> nguồn AI đọc. <b>99,3%</b> đến từ bên thứ ba. Đơn vị chỉ làm trên website của bạn là đang làm trên 0,7% đó.',
  'stage_head': ('Giai đoạn của người mua', 'AI nhắc tên thương hiệu', 'Website thương hiệu trong nguồn'),
  'stage_names': {'discovery': 'Tìm hiểu ngành hàng', 'consideration': 'Cân nhắc lựa chọn', 'evaluation': 'Đánh giá', 'competitive': 'So sánh', 'trust': 'Kiểm tra uy tín'},
  'stage_note': 'Câu hỏi ở các giai đoạn sau thường có tên thương hiệu nên tỷ lệ được nhắc cao hơn. Tính trên mọi câu trả lời có trích dẫn, 39% trích website thương hiệu ít nhất một lần — chủ yếu sau khi người mua đã biết thương hiệu.',
  'tests_h': 'Năm phép thử',
  'ask': 'Hãy yêu cầu', 'we': 'Chúng tôi cung cấp',
  'tests': [
   ('Mức nền đo bằng tiếng Việt', 'Câu trả lời cho ngành hàng, khách hàng và đối thủ của bạn, bằng tiếng Việt, theo từng công cụ AI, kèm nguồn mà mỗi câu trả lời trích dẫn.', 'Mức nền ngày 0 trên bộ câu hỏi cố định, đo trên ChatGPT, Gemini, Perplexity, Claude và trang Google AI Overview thật; mọi trích dẫn đều được ghi lại.'),
   ('Sản phẩm bàn giao và chỉ số kiểm chứng được', 'Bộ câu hỏi, tần suất đo, báo cáo trích dẫn và mục tiêu theo giai đoạn được thống nhất. Từ chối lời hứa “bảo đảm AI đề xuất”.', 'Mỗi tỷ lệ đều ghi rõ tử số và mẫu số. Bộ câu hỏi được giữ cố định để các tháng so sánh được. Không ai sửa điểm bằng tay, và lỗi công cụ đo được công khai trong báo cáo tuần.'),
   ('Chiến lược nguồn tin địa phương', 'Đơn vị sẽ giành trích dẫn từ những báo, trang ngành và danh bạ nào tại Việt Nam — nêu tên cụ thể.', 'Chúng tôi công bố hằng tháng danh sách nguồn mà các công cụ AI trích dẫn tại Việt Nam và lập kế hoạch dựa trên đó. Cộng đồng nguồn tin tại Việt Nam được xây dựng cùng Focus Media Việt Nam — đối tác đầu tiên.'),
   ('Tình huống có quy kết', 'Tình huống thật, tách bạch việc được AI nhắc, lưu lượng tự nhiên và khách hàng tiềm năng — không biến tương quan thành nhân quả.', 'Mỗi hành động đã đăng đều được ghi ngày và so sánh trước–sau trên cùng bộ câu hỏi.'),
   ('Phép thử trên cùng bộ câu hỏi', 'Hai hoặc ba ứng viên làm audit hoặc thí điểm trên cùng một bộ câu hỏi để so sánh phương pháp và kết quả.', 'Chúng tôi đề xuất trước: bạn nhận bộ câu hỏi cố định cùng mức nền của chúng tôi, và có thể yêu cầu bất kỳ ứng viên nào khác báo cáo trên đúng bộ đó.'),
  ],
  'not_h': 'Những điều chúng tôi không làm',
  'not': ['Bảo đảm thứ hạng hay việc AI đề xuất.', 'Tự đăng bảng xếp hạng đưa mình lên đầu.', 'Mua vị trí trong các danh sách “đơn vị tốt nhất”.'],
  'cta_h': 'Bắt đầu từ chính câu trả lời về bạn',
  'cta_p': 'Gửi cho chúng tôi ngành hàng và hai đối thủ. Chúng tôi gửi lại mức nền trên bộ câu hỏi cố định — kèm chính bộ câu hỏi đó, để bạn dùng nó đối chiếu với bất kỳ ai khác.',
  'cta': 'Yêu cầu mức nền trên cùng bộ câu hỏi',
  'links': [('Danh sách nguồn AI trích dẫn tại Việt Nam (hằng tháng)', SOURCES + '/vi'), ('Đề xuất hợp tác cho báo chí: cùng xây GEO', '/vi/doi-tac-truyen-thong/'), ('So sánh các nền tảng GEO', '/compare/'), ('Không gian làm việc mẫu', 'https://app.memecmo.ai/demo')],
  'foot': 'MemeCMO Tech Limited · Số ĐKKD Hồng Kông 80218619 · Cập nhật 21/10/2026',
  'faq_extra': ('AI đọc bao nhiêu từ website của chính thương hiệu?', 'Trong phép đo của MemeCMO trên 12 thương hiệu tại Việt Nam (3.011 câu trả lời AI có trích dẫn, tháng 6–10/2026), website của chính thương hiệu chỉ chiếm 0,7% nguồn AI đọc khi người mua chưa biết thương hiệu, và 14,3% ở giai đoạn kiểm tra uy tín. AI nhắc tên thương hiệu trong 3,9% câu trả lời ở giai đoạn tìm hiểu.'),
 },
 'zh': {
  'lang': 'zh-Hans', 'home': '/zh/', 'about': '/zh/about/',
  'title': '中国品牌进入越南:AI 用越南语怎么说你,以及怎么选 GEO 服务商',
  'desc': '中国品牌进入越南时,越南买家会直接问 ChatGPT、Gemini、Perplexity。AI 只复述它在越南语网络上读到的内容。本文给出 AI 自己建议买家用的五条服务商检验标准,以及出海品牌要多做的三件事。',
  'kicker': '越南 · 出海品牌指南',
  'h1': '中国品牌进入越南,AI 用越南语怎么介绍你?',
  'lead': '越南买家越来越多地直接问 AI。对刚进入越南的中国品牌,越南语网络上关于你的内容往往很少,AI 只能复述它读到的东西——常常是竞品,或是过时的信息。问 AI「越南 GEO 找谁」,它在列出几家机构之后会补一句:不要只凭推荐榜签约,让候选方在同一套问题上实测再比较。下面是这几条标准,以及我们怎样逐条做到。',
  'stat_h': '新客户第一次听到你时,AI 读的几乎都是别人写的',
  'stat_p': '我们在越南测量的 12 个品牌(3,011 条带引用的 AI 回答,2026 年 6–10 月)里:买家还不认识品牌时,AI 只在 <b>3.9%</b> 的回答里提到该品牌,品牌官网只占 AI 所读来源的 <b>0.7%</b>,<b>99.3%</b> 来自第三方。只在官网上做功夫,做的就是这 0.7%。',
  'stage_head': ('买家所处阶段', 'AI 点名品牌', '官网占所读来源'),
  'stage_names': {'discovery': '了解品类', 'consideration': '考虑选项', 'evaluation': '评估', 'competitive': '比较', 'trust': '核实口碑'},
  'stage_note': '后几个阶段的问题常带品牌名,点名率高部分由此而来。全部带引用的回答里,39% 至少引用过一次品牌官网——大多发生在买家已经认识品牌之后。',
  'tests_h': 'AI 建议买家用的五条标准',
  'ask': '应当要求', 'we': '我们提供',
  'tests': [
   ('越南语实测基线', '针对你的品类、目标客户和竞品,用越南语逐个 AI 平台给出当前回答,以及每条回答引用的来源。', 'Day-0 基线:固定问题集,覆盖 ChatGPT、Gemini、Perplexity、Claude 和真实的 Google AI Overview 页面,每一条引用都入库。'),
   ('可核验的交付与指标', '约定问题集、监测频次、引用来源报告和阶段目标;不要接受「保证 AI 推荐」这类承诺。', '每个比率都写明分子分母;问题集保持固定,月度之间可比;分数任何人不得手工修改;测量仪器出错会在周报里说明。'),
   ('本地化与来源策略', '服务商要争取哪些越南本地媒体、行业网站和目录的引用——要列出名字。', '我们按月公开 AI 在越南引用的来源榜单,据此规划投放。越南的信源共同体与分众越南共同建设,分众越南是首个合作方;其他东南亚国家在路线图上。'),
   ('案例和归因', '真实案例,区分 AI 提及、自然流量和销售线索,不把相关说成因果。', '每一次发布都记下日期,在同一套问题上做前后对比。'),
   ('同题实测', '请两到三家候选方在同一套问题上做审计或试点,再比较方法和结果。', '我们先提出:把固定问题清单和我们的基线一起交给你,你可以要求任何其他候选方在同一份清单上报告。'),
  ],
  'extra_h': '出海品牌还要多做的三件事',
  'extra': [
   ('先对齐事实', '中文资料、越南语资料和官网各语言版本的数字与说法要一致——网点数、成立时间、产品参数。AI 会交叉核对,口径不一致会拉低可信度。'),
   ('写越南语原生内容,不是翻译稿', '按越南买家真实会问的问题来写,用他们的说法和比较方式。'),
   ('把事实放进 AI 在越南真正引用的地方', '官网之外,还要出现在 AI 在越南实际引用的本地媒体和行业网站上。我们的月度来源榜单列出了这些地方。'),
  ],
  'not_h': '我们不做的事',
  'not': ['承诺排名或保证 AI 推荐。', '发布把自己排在第一的榜单。', '花钱买「最佳机构」榜单的位置。'],
  'cta_h': '先看 AI 现在怎么说你',
  'cta_p': '告诉我们你的品类和两个竞品。我们交回固定问题清单上的越南语基线——连同清单本身,你可以拿它去要求任何其他候选方。',
  'cta': '申请同题实测基线',
  'links': [('AI 在越南引用的来源(月度榜单)', SOURCES), ('GEO 平台能力对比', '/compare/'), ('在线演示工作区', 'https://app.memecmo.ai/demo')],
  'foot': 'MemeCMO Tech Limited · 香港公司注册编号 80218619 · 更新于 2026-10-21',
  'faq_extra': ('品牌官网在 AI 所读来源里占多少?', '在 MemeCMO 对越南 12 个品牌的测量中(3,011 条带引用的 AI 回答,2026 年 6–10 月),买家还不认识品牌时,品牌官网只占 AI 所读来源的 0.7%,到核实口碑阶段为 14.3%;探索阶段 AI 只在 3.9% 的回答里提到该品牌。'),
 },
}

CSS = """
:root{--canvas:#FBF7F4;--surface:#FFF;--raised:#F4ECE6;--ink:#2A2024;--dim:#6E625F;--faint:#9C8E8A;--brand:#C76B7A;--press:#B25A69;--edge:rgba(58,30,34,.12)}
*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--ink);font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang SC","Noto Sans SC",sans-serif;line-height:1.7}
.wrap{max-width:880px;margin:0 auto;padding:36px 22px 64px}
header.site{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:700;font-size:17px}
nav a{color:var(--dim);text-decoration:none;font-size:13.5px;margin-left:18px}nav a:hover{color:var(--ink)}
.kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-bottom:10px}
h1{font-size:34px;line-height:1.2;margin:0 0 16px;letter-spacing:-.3px}
.lead{font-size:17px;color:var(--dim);margin:0 0 34px}
h2{font-size:22px;margin:44px 0 14px}
.card{background:var(--surface);border:1px solid var(--edge);border-radius:14px;padding:22px 24px}
table{border-collapse:collapse;width:100%;font-size:14px;margin-top:14px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid rgba(58,30,34,.08)}
th{font-size:12.5px;color:var(--dim);font-weight:600}
td.num{font-variant-numeric:tabular-nums}
tr.hi td{background:rgba(199,107,122,.08);font-weight:600}
.note{font-size:13px;color:var(--faint);margin-top:12px}
ol.tests{list-style:none;padding:0;margin:0;counter-reset:t}
ol.tests>li{counter-increment:t;background:var(--surface);border:1px solid var(--edge);border-radius:14px;padding:20px 24px 18px;margin-bottom:14px}
ol.tests h3{font-size:17px;margin:0 0 10px}ol.tests h3::before{content:counter(t) " · ";color:var(--brand)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.pair .lbl{font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.pair p{margin:0;font-size:14.5px}
.pair .we p{color:var(--ink)}.pair .ask p{color:var(--dim)}
ul.plain{padding-left:20px}ul.plain li{margin-bottom:6px}
.cta{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;margin-top:6px}
.cta:hover{background:var(--press)}
ul.links{list-style:none;padding:0;margin:18px 0 0}ul.links li{margin-bottom:6px}ul.links a{color:var(--press)}
footer{margin-top:52px;font-size:12px;color:var(--faint);border-top:1px solid var(--edge);padding-top:18px}
footer a{color:var(--faint)}
@media(max-width:640px){.pair{grid-template-columns:1fr}h1{font-size:28px}}
"""

LOGO = '<svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 8 h40 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 H30 l-10 10 v-10 h-8 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 z" fill="#C76B7A"/><path d="M22 40 V22 l10 11 10 -11 v18" stroke="#FFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'

e = html.escape


def pct(v, lang):
    s = ('%.1f' % v)
    return (s.replace('.', ',') if lang == 'vi' else s) + '%'


CJK = '\u3000-\u9fff\uff00-\uffef'


def zh_punct(t):
    # ASCII , : ; ( ) beside a CJK character become full-width; digits like 3,011 are untouched.
    if not isinstance(t, str):
        return t
    for a_, b_ in ((',', '\uff0c'), (':', '\uff1a'), (';', '\uff1b')):
        t = re.sub('(?<=[%s])%s|%s(?=[%s])' % (CJK, re.escape(a_), re.escape(a_), CJK), b_, t)
    t = re.sub('(?<=[%s])\\(|\\((?=[%s])' % (CJK, CJK), '\uff08', t)
    t = re.sub('(?<=[%s0-9%%])\\)' % CJK, '\uff09', t)
    return t


def localise(c):
    out = {}
    for key, v in c.items():
        if key in ('lang', 'home', 'about', 'links'):
            out[key] = v
        elif isinstance(v, str):
            out[key] = zh_punct(v)
        elif isinstance(v, tuple):
            out[key] = tuple(zh_punct(x) for x in v)
        elif isinstance(v, list):
            out[key] = [tuple(zh_punct(x) for x in i) if isinstance(i, tuple) else zh_punct(i) for i in v]
        elif isinstance(v, dict):
            out[key] = {kk: zh_punct(vv) for kk, vv in v.items()}
        else:
            out[key] = v
    out['links'] = [(zh_punct(t), u) for t, u in c['links']]
    return out


def page(k):
    c = localise(C[k]) if k == 'zh' else C[k]
    alt = '\n'.join('<link rel="alternate" hreflang="%s" href="%s">' % (h, URLS[x]) for x, h in (('en', 'en'), ('vi', 'vi'), ('zh', 'zh-Hans')))
    alt += '\n<link rel="alternate" hreflang="x-default" href="%s">' % URLS['en']
    faq = [{'@type': 'Question', 'name': t[0], 'acceptedAnswer': {'@type': 'Answer', 'text': '%s %s' % (t[1], t[2])}} for t in c['tests']]
    faq.append({'@type': 'Question', 'name': c['faq_extra'][0], 'acceptedAnswer': {'@type': 'Answer', 'text': c['faq_extra'][1]}})
    ld = [
        {'@context': 'https://schema.org', '@type': 'Article', '@id': URLS[k] + '#article', 'headline': c['title'],
         'description': c['desc'], 'inLanguage': c['lang'], 'url': URLS[k], 'datePublished': UPDATED, 'dateModified': UPDATED,
         'author': {'@id': SITE + '/#org'}, 'publisher': {'@id': SITE + '/#org'}, 'about': 'Generative Engine Optimization in Vietnam'},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': c['lang'], 'mainEntity': faq},
    ]
    rows = ''.join('<tr%s><td>%s</td><td class="num">%s</td><td class="num">%s</td></tr>' % (
        ' class="hi"' if s == 'discovery' else '', e(c['stage_names'][s]), pct(n, k), pct(o, k)) for s, n, o in STAGES)
    tests = ''.join('<li><h3>%s</h3><div class="pair"><div class="ask"><div class="lbl">%s</div><p>%s</p></div><div class="we"><div class="lbl">%s</div><p>%s</p></div></div></li>' % (
        e(t[0]), e(c['ask']), e(t[1]), e(c['we']), e(t[2])) for t in c['tests'])
    extra = ''
    if 'extra' in c:
        extra = '<h2>%s</h2><ol class="tests">%s</ol>' % (e(c['extra_h']), ''.join(
            '<li><h3>%s</h3><p style="margin:0;font-size:14.5px">%s</p></li>' % (e(a), e(b)) for a, b in c['extra']))
    links = ''.join('<li><a href="%s">%s →</a></li>' % (u, e(t)) for t, u in c['links'])
    nots = ''.join('<li>%s</li>' % e(x) for x in c['not'])
    return '''<!DOCTYPE html>
<html lang="%(lang)s">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%(title)s | MemeCMO</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(url)s">
%(alt)s
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
<header class="site"><a class="logo" href="%(home)s">%(logo)s MemeCMO</a><nav><a href="%(about)s">About</a><a href="/compare/">Compare</a><a href="https://app.memecmo.ai/demo">Demo</a></nav></header>
<div class="kicker">%(kicker)s</div>
<h1>%(h1)s</h1>
<p class="lead">%(lead)s</p>
<h2>%(stat_h)s</h2>
<div class="card"><p style="margin:0">%(stat_p)s</p>
<table><thead><tr><th>%(sh0)s</th><th>%(sh1)s</th><th>%(sh2)s</th></tr></thead><tbody>%(rows)s</tbody></table>
<p class="note">%(stage_note)s</p></div>
<h2>%(tests_h)s</h2>
<ol class="tests">%(tests)s</ol>
%(extra)s
<h2>%(not_h)s</h2>
<ul class="plain">%(nots)s</ul>
<h2>%(cta_h)s</h2>
<p>%(cta_p)s</p>
<a class="cta" href="%(contact)s">%(cta)s</a>
<ul class="links">%(links)s</ul>
<footer>%(foot)s · <a href="/llms.txt">llms.txt</a></footer>
</div>
</body>
</html>
''' % {
        'lang': c['lang'], 'title': e(c['title']), 'desc': e(c['desc']), 'url': URLS[k], 'alt': alt,
        'ld': '\n'.join('<script type="application/ld+json">\n%s\n</script>' % json.dumps(x, ensure_ascii=False, indent=2) for x in ld),
        'css': CSS, 'home': c['home'], 'about': c['about'], 'logo': LOGO, 'kicker': e(c['kicker']), 'h1': e(c['h1']),
        'lead': e(c['lead']), 'stat_h': e(c['stat_h']), 'stat_p': c['stat_p'],
        'sh0': e(c['stage_head'][0]), 'sh1': e(c['stage_head'][1]), 'sh2': e(c['stage_head'][2]), 'rows': rows,
        'stage_note': e(c['stage_note']), 'tests_h': e(c['tests_h']), 'tests': tests, 'extra': extra,
        'not_h': e(c['not_h']), 'nots': nots, 'cta_h': e(c['cta_h']), 'cta_p': e(c['cta_p']), 'contact': CONTACT,
        'cta': e(c['cta']), 'links': links, 'foot': e(c['foot']),
    }


if __name__ == '__main__':
    for k in ('en', 'vi', 'zh'):
        d = os.path.join(ROOT, PATHS[k])
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(k))
        print('wrote', PATHS[k] + '/index.html')
