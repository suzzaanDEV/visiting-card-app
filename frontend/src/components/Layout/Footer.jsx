import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiArrowUp, FiMail } from 'react-icons/fi';
import Logo from './Logo';

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Top Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">

          {/* Col 1 – Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo className="h-8 w-8" color="#10B981" />
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cardly</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Digital visiting cards for modern professionals. Create, share, and manage your networking presence.
            </p>
          </div>

          {/* Col 2 – Product */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/discover">Search Cards</FooterLink>
              <FooterLink to="/cards/add">Templates</FooterLink>
              <FooterLink to="/about">Pricing</FooterLink>
            </ul>
          </div>

          {/* Col 3 – Company */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/discover">Blog</FooterLink>
            </ul>
          </div>

          {/* Col 4 – Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
              <FooterLink to="/about">Security</FooterLink>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {year} Cardly. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/suzzaanDEV"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
            </a>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <FiArrowUp className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
    >
      {children}
    </Link>
  </li>
);

export default Footer;
