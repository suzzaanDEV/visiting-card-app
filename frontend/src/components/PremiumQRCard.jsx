import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const C = {
  bg1: '#F0FDF4',
  bg2: '#FFFFFF',
  card: '#FFFFFF',
  brand: '#059669',
  brandLight: '#D1FAE5',
  brandMuted: '#6EE7B7',
  text: '#18181B',
  textSub: '#52525B',
  textMuted: '#A1A1AA',
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  qrFg: '#14532D',
  qrBg: '#FFFFFF',
  accent: '#ECFDF5',
};

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function getFontSize(font) {
  const m = font.match(/(\d+)px/);
  return m ? parseInt(m[1]) : 16;
}

function truncateText(ctx, text, maxW) {
  if (!maxW) return text;
  let t = text;
  while (ctx.measureText(t).width > maxW && t.length > 3) {
    t = t.slice(0, -4) + '...';
  }
  return t;
}

function drawText(ctx, text, centerX, y, font, color, maxW) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(truncateText(ctx, text, maxW), centerX, y);
  return y + getFontSize(font);
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawContactRow(ctx, icon, label, value, cx, y) {
  if (!value) return y;
  const rowW = 300;
  const rowX = cx - rowW / 2;

  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = C.brand;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, cx - rowW / 2 + 16, y + 10);

  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = C.textSub;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const displayVal = truncateText(ctx, value, rowW - 50);
  ctx.fillText(displayVal, rowX + 34, y + 10);

  return y + 28;
}

export async function renderPremiumCardToCanvas(card, qrDataURL, scale = 3) {
  const W = 480;
  const H = 780;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const cx = W / 2;

  // ── Background gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#F0FDF4');
  bgGrad.addColorStop(0.5, '#FAFAF9');
  bgGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle decorative circle (top-right) ──
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = C.brand;
  ctx.beginPath();
  ctx.arc(W + 40, -40, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.04;
  ctx.beginPath();
  ctx.arc(-30, H * 0.6, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Card body ──
  const cardX = 24;
  const cardY = 24;
  const cardW = W - 48;
  const cardH = H - 48;
  const cardR = 24;

  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  roundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Top accent line ──
  const accentGrad = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0);
  accentGrad.addColorStop(0, 'rgba(5,150,105,0)');
  accentGrad.addColorStop(0.5, 'rgba(5,150,105,0.6)');
  accentGrad.addColorStop(1, 'rgba(5,150,105,0)');
  ctx.fillStyle = accentGrad;
  roundedRect(ctx, cx - 80, cardY + 20, 160, 3, 1.5);
  ctx.fill();

  // ── QR Code ──
  const qrSize = 180;
  const qrPad = 18;
  const qrBoxSize = qrSize + qrPad * 2;
  const qrY = cardY + 48;

  // QR shadow layer
  ctx.shadowColor = 'rgba(5,150,105,0.1)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  roundedRect(ctx, cx - qrBoxSize / 2, qrY, qrBoxSize, qrBoxSize, 20);
  ctx.fillStyle = C.qrBg;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  roundedRect(ctx, cx - qrBoxSize / 2, qrY, qrBoxSize, qrBoxSize, 20);
  ctx.strokeStyle = 'rgba(5,150,105,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (qrDataURL) {
    const qrImg = await loadImage(qrDataURL);
    if (qrImg) {
      ctx.save();
      roundedRect(ctx, cx - qrSize / 2, qrY + qrPad, qrSize, qrSize, 12);
      ctx.clip();
      ctx.drawImage(qrImg, cx - qrSize / 2, qrY + qrPad, qrSize, qrSize);
      ctx.restore();
    } else {
      roundedRect(ctx, cx - qrSize / 2, qrY + qrPad, qrSize, qrSize, 12);
      ctx.fillStyle = C.borderLight;
      ctx.fill();
    }
  }

  let ty = qrY + qrBoxSize + 24;

  // ── "SCAN ME" label ──
  ty = drawText(ctx, 'SCAN ME', cx, ty, '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.brand, W - 80) + 4;
  ty = drawText(ctx, 'to connect instantly', cx, ty, '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.textMuted, W - 80) + 20;

  // ── Thin divider ──
  const divGrad = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
  divGrad.addColorStop(0, 'rgba(0,0,0,0)');
  divGrad.addColorStop(0.5, C.border);
  divGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = divGrad;
  ctx.fillRect(cx - 60, ty, 120, 1);
  ty += 20;

  // ── Name ──
  if (card.fullName) {
    ty = drawText(ctx, card.fullName, cx, ty, '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.text, W - 80) + 6;
  }

  // ── Title / Company ──
  if (card.jobTitle || card.company) {
    const sub = [card.jobTitle, card.company].filter(Boolean).join('  ·  ');
    ty = drawText(ctx, sub, cx, ty, '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.textSub, W - 80) + 4;
  }

  // ── Industry tag ──
  if (card.industry) {
    ty += 6;
    const tagText = card.industry;
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const tagW = ctx.measureText(tagText).width + 20;
    roundedRect(ctx, cx - tagW / 2, ty, tagW, 22, 11);
    ctx.fillStyle = C.accent;
    ctx.fill();
    roundedRect(ctx, cx - tagW / 2, ty, tagW, 22, 11);
    ctx.strokeStyle = 'rgba(5,150,105,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    drawText(ctx, tagText, cx, ty + 4, '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.brand, tagW - 20);
    ty += 30;
  }

  ty += 8;

  // ── Contact rows ──
  const contacts = [
    { icon: '✉', label: 'Email', value: card.email },
    { icon: '☎', label: 'Phone', value: card.phone },
    { icon: '◎', label: 'Web', value: card.website },
    { icon: '◉', label: 'Address', value: card.address },
  ].filter(c => c.value);

  if (contacts.length > 0) {
    // Contact section background
    const contactBgY = ty - 6;
    const contactBgH = contacts.length * 28 + 12;
    roundedRect(ctx, cx - 140, contactBgY, 280, contactBgH, 12);
    ctx.fillStyle = 'rgba(236,253,245,0.5)';
    ctx.fill();

    for (const c of contacts) {
      ty = drawContactRow(ctx, c.icon, c.label, c.value, cx, ty);
    }
    ty += 8;
  }

  // ── Skills tags ──
  if (card.skills && card.skills.length > 0) {
    ty += 4;
    const skills = Array.isArray(card.skills) ? card.skills : card.skills.split(',').map(s => s.trim()).filter(Boolean);
    const maxShow = 4;
    const shown = skills.slice(0, maxShow);
    ctx.font = '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const tagWidths = shown.map(s => ctx.measureText(s).width + 14);
    const totalTagsW = tagWidths.reduce((a, b) => a + b, 0) + (shown.length - 1) * 6;
    let tagX = cx - totalTagsW / 2;

    for (let i = 0; i < shown.length; i++) {
      const tw = tagWidths[i];
      roundedRect(ctx, tagX, ty, tw, 18, 9);
      ctx.fillStyle = i === 0 ? C.brand : C.accent;
      ctx.fill();
      drawText(ctx, shown[i], tagX + tw / 2, ty + 3, '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', i === 0 ? '#FFFFFF' : C.brand, tw - 14);
      tagX += tw + 6;
    }
    ty += 26;
  }

  // ── Bottom branding ──
  const brandY = H - 82;

  const divGrad2 = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
  divGrad2.addColorStop(0, 'rgba(0,0,0,0)');
  divGrad2.addColorStop(0.5, C.border);
  divGrad2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = divGrad2;
  ctx.fillRect(cx - 60, brandY, 120, 1);

  // Cardly logo text
  drawText(ctx, 'Cardly', cx, brandY + 14, '800 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.brand, 120);
  drawText(ctx, 'Digital Business Card', cx, brandY + 34, '400 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', C.textMuted, 160);

  return canvas;
}

const PremiumQRCard = React.forwardRef(({ card, qrUrl }, ref) => {
  const contacts = [
    { icon: '✉', value: card?.email },
    { icon: '☎', value: card?.phone },
    { icon: '◎', value: card?.website },
    { icon: '◉', value: card?.address },
  ].filter(c => c.value);

  const skills = card?.skills
    ? (Array.isArray(card.skills) ? card.skills : card.skills.split(',').map(s => s.trim()).filter(Boolean)).slice(0, 4)
    : [];

  return (
    <div
      ref={ref}
      style={{
        width: 480,
        height: 780,
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 50%, #FFFFFF 100%)',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(5,150,105,0.06)' }} />
      <div style={{ position: 'absolute', bottom: '40%', left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(5,150,105,0.04)' }} />

      {/* Card */}
      <div style={{
        marginTop: 24,
        width: 432,
        height: 732,
        background: '#FFFFFF',
        borderRadius: 24,
        boxShadow: '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 32px 28px',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
      }}>
        {/* Top accent */}
        <div style={{ width: 120, height: 3, borderRadius: 1.5, background: 'linear-gradient(90deg, transparent, #059669, transparent)', marginBottom: 20 }} />

        {/* QR Code */}
        <div style={{
          padding: 18,
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 4px 16px rgba(5,150,105,0.1), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(5,150,105,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {qrUrl && (
            <QRCodeSVG
              value={qrUrl}
              size={180}
              level="H"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#14532D"
            />
          )}
        </div>

        {/* Scan label */}
        <p style={{ margin: '16px 0 0', fontSize: 13, fontWeight: 600, color: '#059669', letterSpacing: 3, textAlign: 'center', textTransform: 'uppercase' }}>Scan Me</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#A1A1AA', textAlign: 'center' }}>to connect instantly</p>

        {/* Divider */}
        <div style={{ width: 100, height: 1, background: 'linear-gradient(90deg, transparent, #E4E4E7, transparent)', margin: '18px 0 0' }} />

        {/* Name */}
        {card?.fullName && (
          <p style={{ margin: '18px 0 0', fontSize: 20, fontWeight: 700, color: '#18181B', textAlign: 'center', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {card.fullName}
          </p>
        )}

        {/* Title / Company */}
        {(card?.jobTitle || card?.company) && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#52525B', textAlign: 'center' }}>
            {[card.jobTitle, card.company].filter(Boolean).join('  ·  ')}
          </p>
        )}

        {/* Industry tag */}
        {card?.industry && (
          <span style={{
            display: 'inline-block',
            margin: '10px 0 0',
            padding: '3px 12px',
            fontSize: 10,
            fontWeight: 500,
            color: '#059669',
            background: '#ECFDF5',
            border: '1px solid rgba(5,150,105,0.15)',
            borderRadius: 11,
          }}>
            {card.industry}
          </span>
        )}

        {/* Contact details */}
        {contacts.length > 0 && (
          <div style={{
            marginTop: 16,
            width: '100%',
            maxWidth: 280,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            background: 'rgba(236,253,245,0.5)',
            borderRadius: 12,
            padding: '6px 0',
          }}>
            {contacts.map((c, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 16px',
                fontSize: 11,
                color: '#52525B',
              }}>
                <span style={{ color: '#059669', fontSize: 11, width: 18, textAlign: 'center', flexShrink: 0 }}>{c.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            {skills.map((s, i) => (
              <span key={i} style={{
                padding: '3px 10px',
                fontSize: 9,
                fontWeight: 500,
                color: i === 0 ? '#FFFFFF' : '#059669',
                background: i === 0 ? '#059669' : '#ECFDF5',
                borderRadius: 9,
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Branding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, #E4E4E7, transparent)', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#059669', letterSpacing: 0.5 }}>Cardly</p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: '#A1A1AA', letterSpacing: 0.5 }}>Digital Business Card</p>
        </div>
      </div>
    </div>
  );
});

PremiumQRCard.displayName = 'PremiumQRCard';

export default PremiumQRCard;
