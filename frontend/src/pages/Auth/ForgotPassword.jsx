import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword } from '../../features/auth/authThunks';
import { isValidEmail } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import {
  FiMail, FiArrowLeft, FiArrowRight, FiCheck, FiCopy
} from 'react-icons/fi';
import { FaLock } from 'react-icons/fa';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'sent'
  const [devResetToken, setDevResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    const result = await dispatch(forgotPassword(email.trim().toLowerCase()));
    if (result.meta.requestStatus === 'fulfilled') {
      const payload = result.payload;
      setStep('sent');
      if (payload?.devResetToken) {
        setDevResetToken(payload.devResetToken);
        toast.success('Development reset token generated below.');
      } else {
        toast.success(payload?.message || 'If the email exists, a reset link was sent.');
      }
    } else {
      toast.error(result.payload || 'Failed to send reset link');
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(devResetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Could not copy — select the token text manually');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 select-none">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <FaLock className="text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Forgot Password</h1>
          <p className="text-brand-textMuted">
            {step === 'email'
              ? 'Enter your email to receive a reset link.'
              : 'Check your email to finish resetting your password.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <Input
                    label="Email Address"
                    type="email"
                    icon={FiMail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full justify-center"
                  >
                    Send Reset Link
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm text-brand-textMuted hover:text-brand-text dark:hover:text-white font-medium transition-colors"
                    >
                      <FiArrowLeft className="h-4 w-4" /> Back to Login
                    </Link>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 bg-brand-primary/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-brand-primary/30">
                      <FiCheck className="text-brand-primary dark:text-emerald-400 text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-text dark:text-white">Reset Link Sent</h3>
                    <p className="text-sm text-brand-textMuted mt-1">
                      If an account exists for <span className="text-brand-text font-semibold dark:text-emerald-400 break-all">{email}</span>,
                      a password reset email is on its way. The link expires shortly.
                    </p>
                  </div>

                  {devResetToken && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider mb-0.5">
                            Dev Reset Token
                          </p>
                          <p className="break-all text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-200">{devResetToken}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyToken}
                          className="flex items-center justify-center gap-1 text-slate-400 hover:text-brand-text dark:hover:text-white text-xs transition-colors shrink-0 cursor-pointer"
                        >
                          {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> : <FiCopy className="h-3.5 w-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <Link
                        to={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors"
                      >
                        Open reset password page <FiArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 flex items-center justify-center text-brand-textMuted hover:text-brand-text dark:hover:text-white transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 cursor-pointer"
                    >
                      <FiArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    <Link
                      to="/login"
                      className="flex-1 flex items-center justify-center text-brand-textMuted hover:text-brand-primary dark:hover:text-emerald-400 transition-colors py-2.5 rounded-lg border border-brand-border dark:border-slate-700 font-medium"
                    >
                      Return to Login
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;