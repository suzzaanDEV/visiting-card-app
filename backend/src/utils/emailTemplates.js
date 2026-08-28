// Cardly email templates — responsive, table-based, brand-styled.
// Designed to render well across Gmail, Outlook, Apple Mail, and mobile clients.

const BRAND_COLOR = '#047857';
const BRAND_DARK = '#065f46';
const ACCENT = '#10b981';
const TEXT_COLOR = '#0f172a';
const MUTED = '#64748b';

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl, imageUrl, highlightColor }) {
    const accent = highlightColor || BRAND_COLOR;
    return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(title || 'Cardly')}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    a { text-decoration: none; }
    .preheader { display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; }
    .body { background-color: #f1f5f9; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${accent} 100%); }
    .brand-row { padding: 28px 32px; }
    .logo { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-sub { color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; }
    .content { padding: 32px 32px 8px 32px; color: ${TEXT_COLOR}; }
    .title { font-size: 22px; font-weight: 700; line-height: 1.3; color: ${TEXT_COLOR}; margin: 0 0 12px 0; }
    .body-copy { font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 16px 0; }
    .muted-copy { font-size: 13px; line-height: 1.6; color: ${MUTED}; }
    .cta-wrap { padding: 8px 32px 32px 32px; }
    .cta { display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; font-size: 15px; font-weight: 700; padding: 13px 28px; border-radius: 10px; }
    .divider { height: 1px; background: #eef2f7; }
    .footer { padding: 20px 32px 28px 32px; }
    .footer-text { color: ${MUTED}; font-size: 12px; line-height: 1.7; }
    .footer-brand { color: ${BRAND_COLOR}; font-weight: 700; font-size: 13px; }
    .hero img { width: 100%; height: auto; display: block; border: 0; }
    @media only screen and (max-width: 620px) {
      .content { padding: 24px 20px 4px 20px; }
      .brand-row { padding: 22px 20px; }
      .cta-wrap { padding: 4px 20px 24px 20px; }
      .footer { padding: 18px 20px 24px 20px; }
      .title { font-size: 19px; }
    }
    @media (prefers-color-scheme: dark) {
      body, .body { background-color: #0f172a; }
      .card { background-color: #1e293b; }
      .content { color: #f1f5f9; }
      .title { color: #ffffff; }
      .body-copy { color: #cbd5e1; }
      .divider { background: #3341558a; }
      .footer-text { color: #8b9cb2; }
    }
  </style>
</head>
<body class="body" style="margin:0;padding:0;background-color:#f1f5f9;">
  <div class="preheader" style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader || title || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="body" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td class="card" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 8px 28px rgba(2, 44, 34, 0.08);">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="header" style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${accent} 100%);">
                <tr>
                  <td class="brand-row" style="padding: 28px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span class="logo" style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.5px;">Cardly</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="logo-sub" style="color:rgba(255,255,255,0.85); font-size:12px; font-weight:500; letter-spacing:3px; text-transform:uppercase; padding-top:4px;">Digital Business Cards</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${imageUrl ? `<div class="hero" style="line-height:0;"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title || '')}" style="width:100%;height:auto;display:block;border:0;"/></div>` : ''}
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content" style="padding: 32px 32px 8px 32px; color: ${TEXT_COLOR};">
                    ${title ? `<h1 class="title" style="font-size:22px;font-weight:700;line-height:1.3;color:${TEXT_COLOR};margin:0 0 12px 0;">${escapeHtml(title)}</h1>` : ''}
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
              ${ctaText && ctaUrl ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="cta-wrap" style="padding: 8px 32px 32px 32px;">
                    <a href="${escapeHtml(ctaUrl)}" class="cta" style="display:inline-block; background:${BRAND_COLOR}; color:#ffffff; font-size:15px; font-weight:700; padding:13px 28px; border-radius:10px;">${escapeHtml(ctaText)}</a>
                  </td>
                </tr>
              </table>` : ''}
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td class="divider" style="height:1px; background:#eef2f7; line-height:1px; font-size:1px;">&nbsp;</td></tr>
                <tr>
                  <td class="footer" style="padding: 20px 32px 28px 32px;">
                    <span class="footer-brand" style="color:${BRAND_COLOR}; font-weight:700; font-size:13px;">Cardly</span>
                    <p class="footer-text" style="color:${MUTED}; font-size:12px; line-height:1.7; margin:6px 0 0 0;">Made with ♥ in Nepal &middot; <a href="${escapeHtml(process.env.FRONTEND_URL || 'https://cardly.app')}" style="color:${MUTED}; text-decoration:underline;">cardly.app</a></p>
                    <p class="footer-text" style="color:${MUTED}; font-size:12px; line-height:1.7; margin:10px 0 0 0;">If you didn’t request this email, you can safely ignore it. This is an automated message — please don’t reply to it.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Shared: "here is your code" with a large code block
function otpBody({ otp, name, minutes }) {
    return `<p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">Hi ${escapeHtml(name)},</p>
    <p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">Use the verification code below to complete this action. It expires in <strong>${minutes} minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 16px 0 20px 0;">
          <span style="display:inline-block; background:#f0fdf4; border:1px dashed #10b981; border-radius:12px; color:#047857; font-size:30px; font-weight:800; letter-spacing:10px; padding:16px 24px;">${escapeHtml(otp)}</span>
        </td>
      </tr>
    </table>
    <p class="muted-copy" style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 4px 0;">If you didn’t request this code, someone may be trying to access your account. Don’t share this code with anyone.</p>`;
}

function renderOtp({ otp, name = 'User', minutes = 15 }) {
    const title = 'Your Cardly verification code';
    const preheader = `Your Cardly verification code is ${otp}. It expires in ${minutes} minutes.`;
    const bodyHtml = otpBody({ otp, name, minutes });
    return baseHtml({ title, preheader, bodyHtml, ctaText: 'Go to Cardly', ctaUrl: process.env.FRONTEND_URL || 'https://cardly.app' });
}

function render2fa({ otp, name = 'User', minutes = 5 }) {
    const title = 'Two-Factor Authentication Code';
    const preheader = `Your Cardly 2FA code is ${otp}. It expires in ${minutes} minutes.`;
    const bodyHtml = `<p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">Hi ${escapeHtml(name)},</p>
    <p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">A sign-in was attempted to your Cardly account. Enter the code below to confirm it’s really you — it expires in <strong>${minutes} minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 16px 0 20px 0;">
          <span style="display:inline-block; background:#f0fdf4; border:1px dashed #10b981; border-radius:12px; color:#047857; font-size:30px; font-weight:800; letter-spacing:10px; padding:16px 24px;">${escapeHtml(otp)}</span>
        </td>
      </tr>
    </table>
    <p class="muted-copy" style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 4px 0;">If this wasn’t you, change your password immediately and contact support.</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText: 'Open Cardly', ctaUrl: process.env.FRONTEND_URL || 'https://cardly.app' });
}

function renderBroadcast({ title, message, imageUrl, ctaText, ctaUrl }) {
    const preheader = message?.slice(0, 110) || '';
    const bodyHtml = `<p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">${escapeHtml(message)}</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl, imageUrl });
}

function renderGeneric({ title, message, ctaText, ctaUrl, highlightColor }) {
    const preheader = message?.slice(0, 110) || '';
    const bodyHtml = `<p class="body-copy" style="font-size:15px;line-height:1.65;color:#334155;margin:0 0 16px 0;">${escapeHtml(message)}</p>`;
    return baseHtml({ title, preheader, bodyHtml, ctaText, ctaUrl, highlightColor });
}

module.exports = {
    renderOtp,
    render2fa,
    renderBroadcast,
    renderGeneric
};