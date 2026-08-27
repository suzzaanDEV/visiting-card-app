import React from 'react';
import {
  FiMail, FiPhone, FiGlobe, FiMapPin, FiBriefcase,
  FiLinkedin, FiTwitter, FiGithub, FiInstagram,
  FiFacebook, FiYoutube
} from 'react-icons/fi';
import {
  FaLinkedin, FaTwitter, FaGithub, FaInstagram,
  FaFacebook, FaYoutube, FaDribbble, FaBehance
} from 'react-icons/fa';

const socialIconMap = {
  linkedin: { fi: FiLinkedin, fa: FaLinkedin, color: '#0077b5' },
  twitter: { fi: FiTwitter, fa: FaTwitter, color: '#1da1f2' },
  github: { fi: FiGithub, fa: FaGithub, color: '#333' },
  instagram: { fi: FiInstagram, fa: FaInstagram, color: '#e4405f' },
  facebook: { fi: FiFacebook, fa: FaFacebook, color: '#1877f2' },
  youtube: { fi: FiYoutube, fa: FaYoutube, color: '#ff0000' },
  dribbble: { fi: null, fa: FaDribbble, color: '#ea4c89' },
  behance: { fi: null, fa: FaBehance, color: '#1769ff' }
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
};

const CardRenderer = ({ card, className = '' }) => {
  if (!card) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-semibold mb-2">No Card Data</div>
          <div className="text-sm">Card information not available</div>
        </div>
      </div>
    );
  }

  const td = (card.template && card.template.design) || {};
  const d = card.cardDesign || {};
  const backgroundColor = (d.backgroundColor || td.backgroundColor || card.backgroundColor || '#10B981');
  const textColor = (d.textColor || td.textColor || card.textColor || '#ffffff');
  const accentColor = (d.accentColor || td.accentColor || '#047857');
  const fontFamily = (d.fontFamily || td.fontFamily || card.fontFamily || 'Inter');
  const backgroundImage = d.backgroundImage || td.backgroundImage || '';
  const borderRadius = d.borderRadius || (td.borderRadius ? `${td.borderRadius}px` : '12px');
  const layout = d.layout || td.layout || 'standard';

  const isLight = isLightColor(backgroundColor);
  const accentBg = accentColor;

  const contactItems = [
    card.email && { icon: FiMail, value: card.email, href: `mailto:${card.email}` },
    card.phone && { icon: FiPhone, value: card.phone, href: `tel:${card.phone}` },
    card.mobile && card.mobile !== card.phone && { icon: FiPhone, value: card.mobile, href: `tel:${card.mobile}` },
    card.website && { icon: FiGlobe, value: card.website, href: card.website.startsWith('http') ? card.website : `https://${card.website}` },
    [card.address, card.city, card.state, card.country].filter(Boolean).length > 0 && {
      icon: FiMapPin,
      value: [card.address, card.city, card.state, card.country].filter(Boolean).join(', '),
      href: null
    },
    card.company && { icon: FiBriefcase, value: [card.company, card.department].filter(Boolean).join(' - '), href: null }
  ].filter(Boolean);

  const socialLinks = card.socialLinks || {};
  const socialEntries = Object.entries(socialLinks).filter(([, url]) => url && url.trim());

  const layoutClass = {
    standard: '',
    modern: 'card-layout-modern',
    minimal: 'card-layout-minimal',
    bold: 'card-layout-bold'
  }[layout] || '';

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${layoutClass} ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        borderRadius,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined
      }}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor, opacity: 0.85 }}
        />
      )}

      <div
        className="relative z-10 h-full flex flex-col"
        style={layout === 'modern' ? { padding: '1.5rem' } : { padding: layout === 'minimal' ? '1.25rem' : '1.5rem' }}
      >
        {layout === 'bold' && (
          <div
            className="absolute top-0 left-0 right-0 h-1/3 z-0"
            style={{ backgroundColor: accentBg }}
          />
        )}

        {layout === 'modern' ? (
          <ModernLayout
            card={card}
            contactItems={contactItems}
            socialEntries={socialEntries}
            textColor={textColor}
            accentColor={accentColor}
            isLight={isLight}
          />
        ) : layout === 'minimal' ? (
          <MinimalLayout
            card={card}
            contactItems={contactItems}
            socialEntries={socialEntries}
            textColor={textColor}
            accentColor={accentColor}
            isLight={isLight}
          />
        ) : layout === 'bold' ? (
          <BoldLayout
            card={card}
            contactItems={contactItems}
            socialEntries={socialEntries}
            textColor={textColor}
            accentColor={accentColor}
            isLight={isLight}
          />
        ) : (
          <StandardLayout
            card={card}
            contactItems={contactItems}
            socialEntries={socialEntries}
            textColor={textColor}
            accentColor={accentColor}
            isLight={isLight}
          />
        )}
      </div>
    </div>
  );
};

function isLightColor(hex) {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function InitialsAvatar({ name, accentColor, textColor, isLight, size = 'lg' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-16 h-16 text-2xl'
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold mx-auto`}
      style={{
        backgroundColor: isLight ? (accentColor || textColor + '18') : 'rgba(255,255,255,0.2)',
        color: isLight ? '#ffffff' : textColor
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function ContactItem({ icon: Icon, value, href, textColor }) {
  const content = (
    <span className="truncate block">{value}</span>
  );
  return (
    <div className="flex items-center gap-2 text-xs leading-tight" style={{ color: textColor, opacity: 0.9 }}>
      <Icon className="w-3 h-3 flex-shrink-0 opacity-70" />
      {href ? (
        <a href={href} className="truncate hover:underline" target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
          {content}
        </a>
      ) : content}
    </div>
  );
}

function SocialIcons({ entries, accentColor, isLight }) {
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {entries.map(([platform, url]) => {
        const iconDef = socialIconMap[platform];
        if (!iconDef) return null;
        const Icon = iconDef.fa || iconDef.fi;
        if (!Icon) return null;
        const href = url.startsWith('http') ? url : `https://${url}`;
        return (
          <a
            key={platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
              color: isLight ? (accentColor || iconDef.color) : '#ffffff'
            }}
          >
            <Icon className="w-3 h-3" />
          </a>
        );
      })}
    </div>
  );
}

function StandardLayout({ card, contactItems, socialEntries, textColor, accentColor, isLight }) {
  return (
    <>
      <div className="text-center pt-2 pb-3">
        <InitialsAvatar
          name={card.fullName}
          accentColor={accentColor}
          textColor={textColor}
          isLight={isLight}
        />
        <h3 className="text-lg font-bold mt-2 leading-tight">{card.fullName}</h3>
        {card.jobTitle && (
          <p className="text-xs mt-0.5" style={{ opacity: 0.85 }}>{card.jobTitle}</p>
        )}
        {card.companyTagline && (
          <p className="text-[10px] mt-0.5 italic" style={{ opacity: 0.7 }}>{card.companyTagline}</p>
        )}
        {card.tagline && (
          <p className="text-[10px] mt-0.5 italic" style={{ opacity: 0.7 }}>{card.tagline}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {contactItems.map((item, i) => (
          <ContactItem key={i} {...item} textColor={textColor} />
        ))}
        <SocialIcons entries={socialEntries} accentColor={accentColor} isLight={isLight} />
      </div>

      {card.bio && (
        <div className="pt-2 mt-auto" style={{ borderTop: `1px solid ${textColor}22` }}>
          <p className="text-[10px] leading-relaxed" style={{ opacity: 0.8 }}>
            {card.bio.length > 120 ? card.bio.slice(0, 120) + '...' : card.bio}
          </p>
        </div>
      )}
    </>
  );
}

function ModernLayout({ card, contactItems, socialEntries, textColor, accentColor, isLight }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <InitialsAvatar
          name={card.fullName}
          accentColor={accentColor}
          textColor={textColor}
          isLight={isLight}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-tight truncate">{card.fullName}</h3>
          {card.jobTitle && (
            <p className="text-xs truncate" style={{ opacity: 0.8 }}>{card.jobTitle}</p>
          )}
          {card.company && (
            <p className="text-[10px] truncate" style={{ opacity: 0.7 }}>{card.company}</p>
          )}
        </div>
      </div>

      {card.tagline && (
        <p className="text-[10px] italic mb-2" style={{ opacity: 0.7 }}>{card.tagline}</p>
      )}

      <div className="grid grid-cols-1 gap-1 mb-2">
        {contactItems.map((item, i) => (
          <ContactItem key={i} {...item} textColor={textColor} />
        ))}
      </div>

      <SocialIcons entries={socialEntries} accentColor={accentColor} isLight={isLight} />

      {card.bio && (
        <div className="pt-2 mt-auto" style={{ borderTop: `1px solid ${textColor}22` }}>
          <p className="text-[10px] leading-relaxed" style={{ opacity: 0.8 }}>
            {card.bio.length > 100 ? card.bio.slice(0, 100) + '...' : card.bio}
          </p>
        </div>
      )}
    </>
  );
}

function MinimalLayout({ card, contactItems, socialEntries, textColor, accentColor, isLight }) {
  return (
    <>
      <div className="mb-3">
        <h3 className="text-lg font-light tracking-wide leading-tight">{card.fullName}</h3>
        {card.jobTitle && (
          <p className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ opacity: 0.6 }}>{card.jobTitle}</p>
        )}
        {card.company && (
          <p className="text-[10px] mt-0.5 tracking-wide" style={{ opacity: 0.5 }}>{card.company}</p>
        )}
      </div>

      <div
        className="w-8 h-px mb-3"
        style={{ backgroundColor: isLight ? textColor + '40' : 'rgba(255,255,255,0.3)' }}
      />

      <div className="flex-1 space-y-1.5">
        {contactItems.map((item, i) => (
          <ContactItem key={i} {...item} textColor={textColor} />
        ))}
        <SocialIcons entries={socialEntries} accentColor={accentColor} isLight={isLight} />
      </div>

      {card.bio && (
        <div className="pt-2 mt-auto">
          <p className="text-[10px] italic leading-relaxed" style={{ opacity: 0.7 }}>
            {card.bio.length > 100 ? card.bio.slice(0, 100) + '...' : card.bio}
          </p>
        </div>
      )}
    </>
  );
}

function BoldLayout({ card, contactItems, socialEntries, textColor, accentColor, isLight }) {
  return (
    <>
      <div className="text-center pt-8 pb-2 relative z-10">
        <InitialsAvatar
          name={card.fullName}
          accentColor={accentColor}
          textColor={textColor}
          isLight={isLight}
        />
        <h3 className="text-xl font-extrabold mt-2 leading-tight drop-shadow-sm">{card.fullName}</h3>
        {card.jobTitle && (
          <p className="text-xs font-semibold mt-0.5" style={{ opacity: 0.9 }}>{card.jobTitle}</p>
        )}
        {card.company && (
          <p className="text-[10px] mt-0.5" style={{ opacity: 0.8 }}>{card.company}</p>
        )}
        {card.companyTagline && (
          <p className="text-[10px] mt-0.5 italic" style={{ opacity: 0.7 }}>{card.companyTagline}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 relative z-10">
        {contactItems.map((item, i) => (
          <ContactItem key={i} {...item} textColor={textColor} />
        ))}
        <SocialIcons entries={socialEntries} accentColor={accentColor} isLight={isLight} />
      </div>

      {card.bio && (
        <div className="pt-2 mt-auto relative z-10" style={{ borderTop: `1px solid ${textColor}22` }}>
          <p className="text-[10px] leading-relaxed" style={{ opacity: 0.85 }}>
            {card.bio.length > 120 ? card.bio.slice(0, 120) + '...' : card.bio}
          </p>
        </div>
      )}
    </>
  );
}

export default CardRenderer;
