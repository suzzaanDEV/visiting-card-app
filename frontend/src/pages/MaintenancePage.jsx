import React from 'react';
import Logo from '../components/Layout/Logo';

const MaintenancePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center overflow-hidden relative">
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 w-72 h-72 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
    </div>

    <div className="relative max-w-xl w-full px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-10">
        <Logo className="h-10 w-10" color="#10B981" />
        <span className="text-2xl font-bold text-white tracking-tight">Cardly</span>
      </div>

      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 mb-8">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
          />
        </svg>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
        Under Maintenance
      </h1>
      <p className="text-lg text-emerald-100/80 leading-relaxed mb-4">
        We&apos;re currently performing scheduled maintenance to make Cardly faster, safer, and
        more beautiful. This usually only takes a few minutes.
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-100 text-sm font-medium border border-white/10">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
        </span>
        We&apos;ll be back shortly
      </div>

      <p className="mt-10 text-sm text-emerald-100/60">
        Need help? Contact us and we&apos;ll keep you updated.
      </p>
    </div>
  </div>
);

export default MaintenancePage;