import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, verifyTwoFactor } from '../../features/auth/authThunks';
import { clearAuthError, clearTwoFactor } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaIdCard } from 'react-icons/fa';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft,
  FiRefreshCw, FiCopy, FiCheck
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import OtpInput from '../../components/ui/OtpInput';
import { isValidEmail } from '../../utils/validation';

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN = 30; // seconds

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resendIn, setResendIn] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, error, user, twoFactor } = useSelector((state) => state.auth);

  // Countdown timer for OTP step
  useEffect(() => {
    if (!twoFactor) return undefined;
    if (timeLeft <= 0) {
      dispatch(clearTwoFactor());
      setOtp('');
      toast.error('Verification code expired. Please log in again.');
      return undefined;
    }
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [twoFactor, timeLeft, dispatch]);

  // Entering OTP step: reset timers and load the dev OTP
  useEffect(() => {
    if (twoFactor) {
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setResendIn(RESEND_COOLDOWN);
      setOtp('');
      setDevOtp(twoFactor.devOtp || '');
      setCopied(false);
    }
  }, [twoFactor]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Post-auth redirect + error toasts
  useEffect(() => {
    if (isAuthenticated && user?.isEmailVerified === false && user?.email) {
      navigate('/verify-email', { state: { email: user.email } });
    } else if (isAuthenticated) {
      navigate('/dashboard');
    }

    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [isAuthenticated, user, error, dispatch, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    dispatch(login({ email: email.trim(), password }));
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }
    dispatch(verifyTwoFactor({ email: twoFactor.email, otp }));
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-2fa-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twoFactor.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setTimeLeft(OTP_EXPIRY_SECONDS);
        if (data.devOtp) setDevOtp(data.devOtp);
        setResendIn(RESEND_COOLDOWN);
        toast.success(data.message || 'New verification code sent');
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearTwoFactor());
    setOtp('');
    setDevOtp('');
    setCopied(false);
    setTimeLeft(OTP_EXPIRY_SECONDS);
  };

  const handleCopyOtp = async () => {
    try {
      await navigator.clipboard.writeText(devOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('Code copied to clipboard');
    } catch {
      toast.error('Could not copy — tap the box and type the code');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 select-none"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <FaIdCard className="text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">
            {twoFactor ? 'Verification' : 'Welcome Back'}
          </h1>
          <p className="text-brand-textMuted">
            {twoFactor ? 'Two-factor authentication is required' : 'Sign in to your Cardly account'}
          </p>
        </motion.div>

        {/* Login / 2FA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
            <AnimatePresence mode="wait">
              {twoFactor ? (
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
                    <div className="w-14 h-14 bg-brand-primary/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-brand-primary/30">
                      <FiShield className="text-brand-primary dark:text-emerald-400 text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-text dark:text-white">Two-Factor Verification</h3>
                    <p className="text-sm text-brand-textMuted mt-1">
                      Code sent to <span className="text-brand-text font-semibold dark:text-emerald-400 break-all">{twoFactor.email}</span>
                    </p>
                    <p className="mt-2 text-sm font-medium text-brand-primary dark:text-emerald-400">
                      Expires in {formatTime(timeLeft)}
                    </p>
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
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider mb-0.5">
                              Dev Code
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-200 tracking-[0.3em] font-mono">{devOtp}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => { setOtp(devOtp); }}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Auto-fill
                            </button>
                            <button
                              type="button"
                              onClick={handleCopyOtp}
                              className="flex items-center justify-center gap-1 text-slate-400 hover:text-brand-text dark:hover:text-white text-xs transition-colors cursor-pointer"
                            >
                              {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> : <FiCopy className="h-3.5 w-3.5" />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-medium text-brand-text dark:text-slate-300 mb-3 text-center">
                      6-Digit Verification Code
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      autoFocus
                      disabled={isLoading || isResending}
                    />
                    <p className="text-xs text-brand-textMuted text-center mt-3">
                      {resendIn > 0
                        ? `You can request a new code in ${resendIn}s`
                        : 'Code expires in 5 minutes'}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={otp.length !== 6}
                    className="w-full justify-center"
                  >
                    Verify & Sign In
                  </Button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex-1 flex items-center justify-center text-brand-textMuted hover:text-brand-text dark:hover:text-white transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 cursor-pointer"
                    >
                      <FiArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0 || isResending}
                      className="flex-1 flex items-center justify-center gap-2 text-brand-textMuted hover:text-brand-primary dark:hover:text-emerald-400 disabled:text-brand-textMuted/50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 cursor-pointer"
                    >
                      <FiRefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                      {isResending ? 'Sending...' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* Step 1: Credentials */
                <motion.form
                  key="credentials"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    icon={FiMail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />

                  <Input
                    label="Password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    icon={FiLock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 rounded text-brand-textMuted hover:text-brand-primary transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    }
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full justify-center"
                  >
                    Sign In
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-brand-primary hover:text-brand-primaryHover font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-brand-textMuted text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:text-brand-primaryHover font-bold transition-colors">
              Create an Account
            </Link>
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-4"
        >
          <Link to="/" className="text-brand-textMuted hover:text-brand-text transition-colors text-sm font-medium">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;