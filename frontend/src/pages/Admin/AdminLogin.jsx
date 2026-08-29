import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiCopy, FiCheck,
  FiRefreshCw, FiCreditCard
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../services/apiService';

const DEMO_EMAIL = 'suzan.privatespace@gmail.com';
const DEMO_PASSWORD = 'admin123';

const AdminLogin = () => {
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [adminEmail, setAdminEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [visitsToShown, setVisitsToShown] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (visitsToShown) return;
    setVisitsToShown(true);
    if (!formData.email && !formData.password) {
      setFormData({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    }
  }, [visitsToShown, formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = pasted.split('');
      while (newDigits.length < 6) newDigits.push('');
      setOtpDigits(newDigits);
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs[focusIdx].current?.focus();
    }
  };

  const startResendTimer = () => {
    setResendIn(30);
  };

  const requestOtp = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (response.ok && data.requiresOTP) {
      setAdminEmail(data.adminEmail);
      setDevOtp(data.devOtp || '');
      setOtpDigits(['', '', '', '', '', '']);
      setStep('otp');
      startResendTimer();
      toast.success(data.message || 'OTP sent to your email');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setLoading(true);
    try {
      await requestOtp();
      toast.success('A new code has been sent');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDevOtpFill = () => {
    if (!devOtp) return;
    setOtpDigits(devOtp.split(''));
    toast.success('Dev OTP applied');
    otpRefs[5].current?.focus();
  };

  const handleCopyDevOtp = async () => {
    try {
      await navigator.clipboard.writeText(devOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('OTP copied to clipboard');
    } catch {
      toast.error('Could not copy — tap the box and type the code');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          name: data.admin.username,
          email: data.admin.email,
          role: data.admin.role,
          userId: data.admin.adminId
        }));
        toast.success('Login successful!');
        window.location.href = '/admin';
      } else {
        toast.error(data.error || 'Invalid OTP');
        setOtpDigits(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtpDigits(['', '', '', '', '', '']);
    setCopied(false);
  };

  const inputClass = 'w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/50 focus:bg-white/[0.07] transition-all outline-none backdrop-blur-sm';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4 dark">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-emerald-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-green-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-emerald-950/60" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/50 p-8 sm:p-10 border border-white/10 ring-1 ring-white/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-5">
              <div className="absolute inset-0 bg-emerald-500/40 rounded-2xl blur-xl" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/20">
                <FaCrown className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">Admin Panel</h1>
            <p className="text-sm text-slate-400">
              {step === 'credentials'
                ? 'Sign in to manage the Cardly platform'
                : 'Enter the verification code sent to your email'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              /* Step 1: Credentials */
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="suzan.privatespace@gmail.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={inputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Continue'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ email: DEMO_EMAIL, password: DEMO_PASSWORD })}
                  className="w-full flex items-center justify-center gap-2 bg-white/[0.04] border border-white/10 text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all"
                >
                  <FiCreditCard className="h-4 w-4" />
                  Use Demo Credentials
                </button>
              </motion.form>
            ) : (
              /* Step 2: OTP Verification */
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleOtpSubmit}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-emerald-400/30">
                    <FiShield className="text-emerald-400 text-xl" />
                  </div>
                  <p className="text-sm text-slate-400 mb-1">
                    Code sent to
                  </p>
                  <p className="text-sm font-medium text-white break-all">{adminEmail}</p>
                </div>

                <AnimatePresence>
                  {devOtp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-0.5">
                            Dev OTP
                          </p>
                          <p className="text-2xl font-bold text-emerald-200 tracking-[0.3em] font-mono">{devOtp}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={handleDevOtpFill}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Auto-fill
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyDevOtp}
                            className="flex items-center justify-center gap-1 text-slate-400 hover:text-white text-xs transition-colors"
                          >
                            {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-400" /> : <FiCopy className="h-3.5 w-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                    6-Digit Verification Code
                  </label>
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 sm:w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/50 transition-all outline-none"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    {resendIn > 0
                      ? `You can request a new code in ${resendIn}s`
                      : 'Code expires in 5 minutes'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="flex-1 flex items-center justify-center text-slate-400 hover:text-white transition-colors py-2.5 rounded-lg border border-white/5"
                  >
                    <FiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendIn > 0 || loading}
                    className="flex-1 flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg border border-white/5"
                  >
                    <FiRefreshCw className={`h-4 w-4 ${resendIn > 0 ? '' : 'group-hover:animate-spin'}`} />
                    {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500">
              Demo Mode
            </p>
            <p className="text-xs text-slate-600 mt-1 font-mono">{DEMO_EMAIL} / {DEMO_PASSWORD}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;