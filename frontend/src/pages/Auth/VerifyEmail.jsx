import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { requestEmailOtp, verifyEmailOtp } from '../../features/auth/authThunks';
import { isValidEmail, isValidOtp } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import OtpInput from '../../components/ui/OtpInput';
import {
  FiMail, FiShield, FiArrowLeft, FiRefreshCw, FiCopy, FiCheck
} from 'react-icons/fi';

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState(location.state?.email || sessionStorage.getItem('pendingEmail') || user?.email || '');
  const [pendingId, setPendingId] = useState(location.state?.pendingId || sessionStorage.getItem('pendingId') || null);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [cooldown, setCooldown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasSent, setHasSent] = useState(Boolean(location.state?.devOtp || location.state?.email));
  const [isResending, setIsResending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (location.state?.devOtp) {
      setDevOtp(location.state.devOtp);
      setHasSent(true);
      toast.success('Development OTP generated. Use the code shown below.');
    }
    if (location.state?.pendingId) {
      setPendingId(location.state.pendingId);
      sessionStorage.setItem('pendingId', location.state.pendingId);
    }
  }, [location.state]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequest = async () => {
    if (!email) {
      toast.error('Enter your email first.');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before resending.`);
      return;
    }

    const payload = pendingId ? { pendingId } : email.trim().toLowerCase();
    setIsResending(true);
    const result = await dispatch(requestEmailOtp(payload));
    setIsResending(false);
    if (result.meta.requestStatus === 'fulfilled') {
      const payload = result.payload;
      if (payload.alreadyVerified) {
        toast.success('Email is already verified.');
        navigate('/dashboard');
        return;
      }
      if (payload.devOtp) {
        setDevOtp(payload.devOtp);
        toast.success('Development OTP generated below.');
      } else if (payload.emailDelivered) {
        toast.success(payload.message || 'Verification code sent');
      } else {
        toast(payload.message || 'Code generated. Configure SMTP to receive emails.', { icon: 'ℹ️' });
      }
      setHasSent(true);
      setOtp('');
      setCooldown(payload.resendCooldownSeconds || RESEND_COOLDOWN);
    } else {
      toast.error(result.payload || 'Failed to send code');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if ((!email && !pendingId) || otp.length !== 6) {
      toast.error('Email and complete 6-digit code are required');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!isValidOtp(otp)) {
      toast.error('Code must be exactly 6 digits.');
      return;
    }

    const payload = pendingId
      ? { userId: pendingId, otp }
      : { email: email.trim().toLowerCase(), otp };

    const result = await dispatch(verifyEmailOtp(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload?.message || 'Email verified');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Verification failed');
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/auth/cancel-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId }),
      });
      if (res.ok) {
        sessionStorage.removeItem('pendingId');
        sessionStorage.removeItem('pendingEmail');
        toast.success('Pending registration cancelled');
        navigate('/register');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    } finally {
      setIsCancelling(false);
    }
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
        <div className="text-center mb-8 select-none">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <FiShield className="text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Verify Email</h1>
          <p className="text-brand-textMuted">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                icon={FiMail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                readOnly={Boolean(pendingId)}
              />

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
                          onClick={() => setOtp(devOtp)}
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
                  autoFocus={hasSent}
                  disabled={isLoading || isResending}
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={otp.length !== 6}
                className="w-full justify-center"
              >
                Verify Email
              </Button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRequest}
                  disabled={isLoading || isResending || cooldown > 0}
                  className="flex-1 flex items-center justify-center gap-2 text-brand-textMuted hover:text-brand-primary dark:hover:text-emerald-400 disabled:text-brand-textMuted/50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 cursor-pointer"
                >
                  <FiRefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
                {pendingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex-1 flex items-center justify-center text-brand-textMuted hover:text-brand-danger transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 cursor-pointer"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-sm text-brand-textMuted hover:text-brand-text dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <FiArrowLeft className="h-4 w-4" /> Back to Login
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;