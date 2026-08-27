import React from 'react';
import { motion } from 'framer-motion';
import { IoQrCodeSharp } from "react-icons/io5";
import {
  FiGrid, FiExternalLink, FiClock, FiEye, FiHeart, FiLock, FiGlobe, FiUsers,
  FiMail, FiPhone, FiMapPin, FiLink
} from 'react-icons/fi';

const getInitials = (card) => {
  const name = card.fullName || card.title || '';
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const DiscoverCardItem = ({ card, cardDesign, viewMode = 'grid', showTimeAgo = false, timeAgo, isAuthenticated = false }) => {
  if (!card) return null;

  const initials = getInitials(card);
  const isPrivate = card.privacy === 'private';
  const headerGradient = cardDesign?.backgroundColor
    ? `linear-gradient(135deg, ${cardDesign.backgroundColor}, ${cardDesign.backgroundColor}dd, #059669)`
    : 'linear-gradient(135deg, #059669, #10b981, #34d399)';

  /* ---- List view ---- */
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.005 }}
        transition={{ duration: 0.2 }}
        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl overflow-hidden flex flex-row h-full border-l-4 transition-all duration-300 hover:shadow-lg ${
          isPrivate
            ? 'border-l-orange-400 dark:border-l-orange-500 border border-white/20 dark:border-slate-700/50'
            : 'border-l-emerald-400 dark:border-l-emerald-500 border border-white/20 dark:border-slate-700/50'
        }`}
      >
        {/* Left thumbnail */}
        <div className="w-48 flex-shrink-0 relative overflow-hidden">
          {cardDesign?.cardImageUrl ? (
            <img
              src={cardDesign.cardImageUrl}
              alt={`${card.title} preview`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: headerGradient }}
            >
              <span className="text-3xl font-bold text-white/80">{initials}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 truncate" title={card.title}>
                {card.title || card.fullName || 'Untitled Card'}
              </h3>
              <span className={`ml-2 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                isPrivate
                  ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isPrivate ? <FiLock className="w-2.5 h-2.5 mr-0.5" /> : <FiGlobe className="w-2.5 h-2.5 mr-0.5" />}
                {isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
            {(card.jobTitle || card.company) && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                {card.jobTitle}{card.jobTitle && card.company ? ' at ' : ''}{card.company}
              </p>
            )}
            {card.tagline && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 italic mb-2">{card.tagline}</p>
            )}
            <div className="space-y-1 mb-2">
              {card.email && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiMail className="w-3 h-3 mr-2 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    {isAuthenticated ? card.email : (
                      card.email.includes('@')
                        ? card.email.split('@')[0].charAt(0) + '*'.repeat(Math.max(0, card.email.split('@')[0].length - 2)) + card.email.split('@')[0].charAt(card.email.split('@')[0].length - 1) + '@' + card.email.split('@')[1]
                        : '***@***.com'
                    )}
                  </span>
                </div>
              )}
              {card.phone && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiPhone className="w-3 h-3 mr-2 text-emerald-500 shrink-0" />
                  <span>{isAuthenticated ? card.phone : `***-***-${card.phone.slice(-4)}`}</span>
                </div>
              )}
              {isAuthenticated && card.mobile && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiPhone className="w-3 h-3 mr-2 text-emerald-500 shrink-0" />
                  <span>{card.mobile}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/c/${card.shortLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-medium py-2 px-3.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              View Card <FiExternalLink className="w-3 h-3" />
            </a>
            {isPrivate && (
              <button
                className="p-2 rounded-lg border border-orange-200 dark:border-orange-800 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                title="Private card - QR code access only"
              >
                <IoQrCodeSharp size={14} />
              </button>
            )}
            {card.views && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 ml-auto">
                <FiEye className="w-3 h-3" /> {card.views}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ---- Grid view ---- */
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-2xl flex flex-col h-full"
    >
      {/* ---- Header / Preview ---- */}
      <div className="relative h-44 overflow-hidden">
        {cardDesign?.cardImageUrl ? (
          <img
            src={cardDesign.cardImageUrl}
            alt={`${card.title} preview`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full relative" style={{ background: headerGradient }}>
            {/* Mesh pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            {/* Initials avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white drop-shadow-sm">{initials}</span>
              </div>
            </div>
          </div>
        )}

        {/* Frosted glass fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent backdrop-blur-[2px]" />

        {/* Privacy badge — floating top-right */}
        <div className={`absolute top-3 right-3 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md shadow-sm ${
          isPrivate
            ? 'bg-orange-500/80 text-white'
            : 'bg-emerald-500/80 text-white'
        }`}>
          {isPrivate ? <FiLock className="w-2.5 h-2.5 mr-0.5" /> : <FiGlobe className="w-2.5 h-2.5 mr-0.5" />}
          {isPrivate ? 'Private' : 'Public'}
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title block */}
        <div className="mb-3">
          <h3
            className="text-lg font-semibold text-gray-800 dark:text-slate-200 truncate leading-tight"
            title={card.title}
          >
            {card.title || card.fullName || 'Untitled Card'}
          </h3>
          {card.jobTitle && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{card.jobTitle}</p>
          )}
          {card.company && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{card.company}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-slate-700/60 mb-3" />

        {/* Contact info */}
        <div className="space-y-1.5 mb-3">
          {card.email && (
            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
              <FiMail className="w-3.5 h-3.5 mr-2.5 text-emerald-500 shrink-0" />
              <span className="truncate">
                {isAuthenticated ? card.email : (
                  card.email.includes('@')
                    ? card.email.split('@')[0].charAt(0) + '*'.repeat(Math.max(0, card.email.split('@')[0].length - 2)) + card.email.split('@')[0].charAt(card.email.split('@')[0].length - 1) + '@' + card.email.split('@')[1]
                    : '***@***.com'
                )}
              </span>
            </div>
          )}
          {card.phone && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiPhone className="w-3.5 h-3.5 mr-2.5 text-emerald-500 shrink-0" />
                  <span>{isAuthenticated ? card.phone : `***-***-${card.phone.slice(-4)}`}</span>
                </div>
              )}
              {isAuthenticated && card.mobile && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiPhone className="w-3.5 h-3.5 mr-2.5 text-emerald-500 shrink-0" />
                  <span>{card.mobile}</span>
                </div>
              )}
          {isAuthenticated && card.website && (
            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
              <FiGlobe className="w-3.5 h-3.5 mr-2.5 text-emerald-500 shrink-0" />
              <span className="truncate">{card.website}</span>
            </div>
          )}
          {isAuthenticated && card.address && (
                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                  <FiMapPin className="w-3.5 h-3.5 mr-2.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{card.address}{card.city ? `, ${card.city}` : ''}{card.country ? `, ${card.country}` : ''}</span>
                </div>
              )}
          {isAuthenticated && card.bio && (
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              <span className="line-clamp-2">{card.bio}</span>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {(card.views || card.loveCount || (showTimeAgo && timeAgo)) && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-slate-500 mb-3">
            {card.views && (
              <span className="flex items-center gap-1">
                <FiEye className="h-3 w-3 text-emerald-500" />
                {card.views} views
              </span>
            )}
            {card.views && card.loveCount && (
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            )}
            {card.loveCount && (
              <span className="flex items-center gap-1">
                <FiHeart className="h-3 w-3 text-red-400" />
                {card.loveCount} loves
              </span>
            )}
            {((card.views && showTimeAgo && timeAgo) || (card.loveCount && showTimeAgo && timeAgo)) && (
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            )}
            {showTimeAgo && timeAgo && (
              <span className="flex items-center gap-1">
                <FiClock className="h-3 w-3" />
                {timeAgo}
              </span>
            )}
          </div>
        )}

        {/* Short link */}
        <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-4 flex items-center gap-1">
          <FiLink className="w-3 h-3" />
          <span className="font-medium text-gray-500 dark:text-slate-400">{card.shortLink}</span>
        </p>

        {/* ---- Actions ---- */}
        <div className="flex gap-2 mt-auto">
          <a
            href={`/c/${card.shortLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-emerald-500/25"
          >
            View Card <FiExternalLink className="w-3.5 h-3.5" />
          </a>
          {isPrivate && (
            <button
              className="px-3 py-2.5 rounded-xl border border-orange-200 dark:border-orange-800/60 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
              title="Private card - QR code access only"
            >
              <IoQrCodeSharp size={16} />
            </button>
          )}
        </div>

        {/* Private notice */}
        {isPrivate && (
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/40">
            <p className="text-[11px] text-orange-600 dark:text-orange-400 flex items-center">
              <FiLock className="w-3 h-3 mr-1" />
              Private card — QR code access only
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DiscoverCardItem;
