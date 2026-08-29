import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import {
  FiHome, FiSearch, FiPlus, FiBookmark, FiUser,
  FiBell, FiSun, FiMoon, FiLogOut,
  FiSettings, FiChevronDown
} from 'react-icons/fi';
import Logo from './Logo';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../ui/Dropdown';
import { API_BASE_URL } from '../../services/apiService';

// Landing page section anchors (used when on the homepage)
const SECTION_LINKS = [
  { label: 'Features', hash: '#features' },
  { label: 'Templates', hash: '#templates' },
  { label: 'How It Works', hash: '#how-it-works' },
  { label: 'Discover', hash: '#discover' },
  { label: 'Contact', hash: '#contact' },
];

const UnifiedNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicSettings, setPublicSettings] = useState({ siteName: 'Cardly', maintenanceMode: false, registrationEnabled: true });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/settings/public`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPublicSettings(data); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const transparent = isHome && !isScrolled;
  const hero = transparent && isDark;

  const navBg = transparent
    ? 'bg-transparent'
    : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-800/60 shadow-sm';

  const textColor = hero ? 'text-white' : 'text-gray-700 dark:text-slate-300';
  const textMuted = hero ? 'text-white/70' : 'text-gray-500 dark:text-slate-400';

  const profileMenuItems = [
    { label: 'Profile', icon: FiUser, onClick: () => navigate('/profile') },
    { label: 'Notifications', icon: FiBell, onClick: () => navigate('/notifications') },
    { divider: true },
    { label: 'Sign Out', icon: FiLogOut, danger: true, onClick: handleLogout },
  ];

  if (user?.role === 'admin') {
    profileMenuItems.splice(2, 0, {
      label: 'Admin Panel',
      icon: FiSettings,
      onClick: () => navigate('/admin/dashboard'),
    });
  }

  return (
    <>
      {/* ── Desktop Top Bar ── */}
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Left – Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <Logo className="h-8 w-8" color={hero ? '#ffffff' : '#047857'} />
              <span className={`text-xl font-bold tracking-tight ${hero ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {publicSettings.siteName || 'Cardly'}
              </span>
            </Link>

            {/* Center – Nav Links */}
            <div className="flex items-center gap-1">
              {isHome ? (
                <>
                  {SECTION_LINKS.map(link => (
                    <a
                      key={link.hash}
                      href={link.hash}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}
                    >
                      {link.label}
                    </a>
                  ))}
                </>
              ) : (
                <>
                  <NavLink to="/discover" className={({ isActive }) => `
                    px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? hero ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`
                    }
                  `}>
                    Discover
                  </NavLink>

                  <NavLink to="/search" className={({ isActive }) => `
                    px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? hero ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`
                    }
                  `}>
                    <FiSearch className="inline mr-1 h-3.5 w-3.5 -mt-0.5" />Search
                  </NavLink>
                </>
              )}

              {isAuthenticated && (
                <>
                  <NavLink to="/cards" className={({ isActive }) => `
                    px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? hero ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`
                    }
                  `}>
                    My Cards
                  </NavLink>

                  <NavLink to="/library" className={({ isActive }) => `
                    px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? hero ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`
                    }
                  `}>
                    Library
                  </NavLink>
                </>
              )}
            </div>

            {/* Right – Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer
                  ${hero ? 'text-white/80 hover:text-white hover:bg-white/10' : `${textMuted} hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800`}
                `}
                aria-label="Toggle theme"
              >
                {isDark ? <FiSun className="w-4.5 h-4.5" /> : <FiMoon className="w-4.5 h-4.5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <NotificationDropdown />

                  {/* Profile Dropdown */}
                  <Dropdown
                    width="w-52"
                    trigger={
                      <button className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors duration-150
                        ${hero ? 'text-white hover:bg-white/10' : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}
                      `}>
                        <div className={`w-7 h-7 ${hero ? 'bg-white/20' : 'bg-emerald-600'} text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden`}>
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            (user?.name || user?.username)?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                          )}
                        </div>
                        <span className="text-sm font-medium max-w-[100px] truncate">{user?.name || user?.username}</span>
                        <FiChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    }
                    items={profileMenuItems}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  {publicSettings.maintenanceMode && (
                    <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-md font-medium hidden sm:inline-block">
                      Maintenance
                    </span>
                  )}
                  <NavLink
                    to="/login"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                      ${hero ? 'text-white hover:bg-white/10' : `${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}
                    `}
                  >
                    Log In
                  </NavLink>
                  {publicSettings.registrationEnabled !== false && (
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-150 shadow-sm"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <nav className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Logo className="h-7 w-7" color={hero ? '#ffffff' : '#047857'} />
            <span className={`text-lg font-bold tracking-tight ${hero ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {publicSettings.siteName || 'Cardly'}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer
                ${hero ? 'text-white/80 hover:bg-white/10' : `${textMuted} hover:bg-gray-100 dark:hover:bg-slate-800`}
              `}
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {isAuthenticated && <NotificationDropdown />}

            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className={`p-2 rounded-lg transition-colors cursor-pointer
                ${hero ? 'text-white/80 hover:bg-white/10' : `${textMuted} hover:bg-gray-100 dark:hover:bg-slate-800`}
              `}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-full rounded-full transition-all duration-300 bg-current ${mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                <span className={`block h-0.5 w-full rounded-full bg-current transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {isHome && SECTION_LINKS.map(link => (
                <a
                  key={link.hash}
                  href={link.hash}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}
                >
                  {link.label}
                </a>
              ))}
              {!isHome && (
                <>
                  <Link to="/discover" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}>
                    Discover
                  </Link>
                  <Link to="/search" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}>
                    Search
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link to="/cards" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}>
                    My Cards
                  </Link>
                  <Link to="/library" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}>
                    Library
                  </Link>
                </>
              )}
              <div className="pt-2 pb-1 border-t border-gray-100 dark:border-slate-800 mt-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${textColor} hover:bg-gray-100 dark:hover:bg-slate-800`}>
                      Profile
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-center text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                      Log In
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      {isAuthenticated ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16 px-2">
            {/* Home */}
            <TabItem to="/" icon={FiHome} label="Home" />

            {/* Search */}
            <TabItem to="/search" icon={FiSearch} label="Search" />

            {/* My Cards – FAB */}
            <div className="relative -mt-5">
              <Link
                to="/cards/add"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
                aria-label="Create Card"
              >
                <FiPlus className="w-6 h-6" />
              </Link>
            </div>

            {/* Library */}
            <TabItem to="/library" icon={FiBookmark} label="Library" />

            {/* Profile */}
            <TabItem to="/profile" icon={FiUser} label="Profile" />
          </div>
        </div>
      ) : (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16 px-2">
            <TabItem to="/" icon={FiHome} label="Home" />
            <TabItem to="/search" icon={FiSearch} label="Search" />
            <TabItem to="/login" icon={FiUser} label="Log In" />
          </div>
        </div>
      )}
    </>
  );
};

/* ── Small tab item used by the bottom bar ── */
const TabItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `
        flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors duration-150
        ${isActive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-400 dark:text-slate-500'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};

export default UnifiedNavigation;
