// Vercel Edge Function — receives contact form submissions and emails them via Resend.
// Required env var: RESEND_API_KEY (set in Vercel project settings)
// Optional env var: LEAD_TO (recipient email — defaults to liujunshuo1987@gmail.com)

export const config = { runtime: 'edge' };

const ALLOWED_ORIGINS = [
  'https://memecmo.ai',
  'https://www.memecmo.ai',
];

const LOCALE_NAMES = {
  en: 'English', zh: '中文', vi: 'Tiếng Việt',
  fil: 'Filipino', th: 'ภาษาไทย', ms: 'Bahasa Melayu',
};

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function cap(s, n) { return String(s ?? '').slice(0, n); }

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://memecmo.ai';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  // Origin guard (allow curl tests with no origin too)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403, headers: cors });
  }

  let data;
  try { data = await req.json(); }
  catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400, headers: cors }); }

  // Honeypot — if a bot fills the hidden field, fake a success.
  if (data.hp && String(data.hp).trim().length > 0) {
    return Response.json({ ok: true }, { headers: cors });
  }

  const name    = cap(data.name, 200).trim();
  const company = cap(data.company, 200).trim();
  const email   = cap(data.email, 200).trim();
  const market  = cap(data.market, 200).trim();
  const message = cap(data.message, 5000).trim();
  const locale  = cap(data.locale, 8).trim() || 'en';

  if (!name || !company || !email) {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400, headers: cors });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: 'bad_email' }, { status: 400, headers: cors });
  }

  const apiKey = (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : '') || '';
  if (!apiKey) {
    return Response.json({ ok: false, error: 'unconfigured' }, { status: 500, headers: cors });
  }
  const recipient = (typeof process !== 'undefined' ? process.env.LEAD_TO : '') || 'liujunshuo1987@gmail.com';
  const sender = (typeof process !== 'undefined' ? process.env.LEAD_FROM : '') || 'MemeCMO Lead <onboarding@resend.dev>';

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  const ts = new Date().toISOString();
  const localeName = LOCALE_NAMES[locale] || locale;

  const subject = `[MemeCMO] ${cap(company, 80)} — ${cap(name, 50)} (${locale})`;
  const text =
`New AIGVR diagnosis request

Name:    ${name}
Company: ${company}
Email:   ${email}
Market:  ${market || '(not specified)'}
Locale:  ${localeName} (${locale})

Message:
${message || '(empty)'}

---
Submitted: ${ts}
Origin:    ${origin || '(none)'}
IP:        ${ip}
UA:        ${ua}
`;

  const html =
`<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f5fa;padding:24px;color:#1a1726">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;padding:28px;border:1px solid #e6e3ee">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#c850c0,#4158d0);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800">M</div>
      <div style="font-size:13px;letter-spacing:3px;color:#6b6880">MEMECMO LEAD</div>
    </div>
    <h2 style="margin:0 0 18px;font-size:19px">New AIGVR diagnosis request</h2>
    <table cellpadding="8" style="font-size:14px;border-collapse:collapse;width:100%">
      <tr><td style="color:#6b6880;width:110px"><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
      <tr style="background:#fafaff"><td style="color:#6b6880"><b>Company</b></td><td>${escapeHtml(company)}</td></tr>
      <tr><td style="color:#6b6880"><b>Email</b></td><td><a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none">${escapeHtml(email)}</a></td></tr>
      <tr style="background:#fafaff"><td style="color:#6b6880"><b>Market</b></td><td>${escapeHtml(market) || '<span style="color:#aaa">(not specified)</span>'}</td></tr>
      <tr><td style="color:#6b6880"><b>Locale</b></td><td>${escapeHtml(localeName)} <span style="color:#aaa">(${escapeHtml(locale)})</span></td></tr>
    </table>
    <div style="margin-top:18px;padding:14px 16px;background:#f6f5fa;border-radius:10px;white-space:pre-wrap;font-size:14px">${escapeHtml(message) || '<span style="color:#aaa">(empty)</span>'}</div>
    <div style="margin-top:22px;padding-top:16px;border-top:1px solid #ececf6;font-size:11px;color:#9a98ae">
      Submitted ${escapeHtml(ts)} · Origin ${escapeHtml(origin || '(none)')} · IP ${escapeHtml(ip)}
    </div>
  </div>
</body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('resend_error', res.status, errText);
      return Response.json({ ok: false, error: 'send_failed' }, { status: 502, headers: cors });
    }
    return Response.json({ ok: true }, { headers: cors });
  } catch (err) {
    console.error('exception', err);
    return Response.json({ ok: false, error: 'exception' }, { status: 500, headers: cors });
  }
}
