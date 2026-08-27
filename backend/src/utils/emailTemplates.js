// Simple HTML email templates for Cardly — lightweight, responsive, themed
const BRAND_COLOR = '#047857';
const ACCENT = '#10b981';

function baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl, imageUrl }) {
    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <style>
    body { background-color: #f3f4f6; margin:0; padding:0; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
    .header { background: linear-gradient(90deg, ${BRAND_COLOR}, ${ACCENT}); padding: 20px; color: #fff; text-align: left; }
    .logo { font-weight: 700; font-size: 18px; }
    .content { padding: 24px; color: #0f172a; }
    .preheader { color: #94a3b8; font-size: 13px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 600; margin: 4px 0 12px 0; }
    .body { font-size: 15px; line-height: 1.6; color: #334155; }
    .cta { display: inline-block; margin-top: 18px; background: ${BRAND_COLOR}; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; }
    .footer { padding: 16px 24px; background: #f8fafc; color: #64748b; font-size: 13px; }
    .muted { color: #94a3b8; font-size: 13px; }
    img.hero { width: 100%; height: auto; border-bottom: 1px solid #eef2f7; display:block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Cardly</div>
    </div>
    ${imageUrl ? `<img class="hero" src="${imageUrl}" alt="${title || ''}"/>` : ''}
    <div class="content">
      ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
      ${title ? `<div class="title">${title}</div>` : ''}
      <div class="body">${bodyHtml}</div>
      ${ctaText && ctaUrl ? `<a class="cta" href="${ctaUrl}">${ctaText}</a>` : ''}
    </div>
    <div class="footer">
      <div>Made with ♥ in Nepal</div>
      <div class="muted">If you didn’t request this email, you can safely ignore it.</div>
    </div>
  </div>
</body>
</html>`;
}

function renderOtp({ otp, name = 'User', minutes = 15 }) {
    const title = 'Your Cardly verification code';
    const preheader = `Your Cardly verification code is ${otp}. It expires in ${minutes} minutes.`;
    const bodyHtml = `<p>Hi ${escapeHtml(name)},</p>
    <p>Use the verification code below to complete your sign in or action.</p>
    <p style="font-size:28px;font-weight:700;margin:12px 0;color:${BRAND_COLOR};">${escapeHtml(otp)}</p>
    <p>This code will expire in <strong>${minutes} minutes</strong>.</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText: 'Go to Cardly', ctaUrl: process.env.FRONTEND_URL || 'https://cardly.app' });
}

function renderBroadcast({ title, message, imageUrl, ctaText, ctaUrl }) {
    const preheader = message?.slice(0, 100) || '';
    const bodyHtml = `<p>${escapeHtml(message)}</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl, imageUrl });
}

function renderGeneric({ title, message, ctaText, ctaUrl }) {
    const preheader = message?.slice(0, 100) || '';
    const bodyHtml = `<p>${escapeHtml(message)}</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    renderOtp,
    renderBroadcast,
    renderGeneric
};
