import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { requestEmailOtp, verifyEmailOtp } from '../../features/auth/authThunks';
import { isValidEmail, isValidOtp } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FaEnvelope, FaShieldAlt } from 'react-icons/fa';

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

  useEffect(() => {
    if (location.state?.devOtp) {
      setDevOtp(location.state.devOtp);
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
    const result = await dispatch(requestEmailOtp(payload));
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
      setCooldown(payload.resendCooldownSeconds || RESEND_COOLDOWN);
    } else {
      toast.error(result.payload || 'Failed to send code');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if ((!email && !pendingId) || !otp) {
      toast.error('Email and code are required');
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
      ? { userId: pendingId, otp: otp.trim() }
      : { email: email.trim().toLowerCase(), otp: otp.trim() };

    const result = await dispatch(verifyEmailOtp(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload?.message || 'Email verified');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Verify Email</h1>
          <p className="text-brand-textMuted">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {devOtp && (
          <div className="mb-4 rounded-xl border border-brand-warning/30 bg-brand-warning/10 dark:bg-amber-950/20 px-4 py-3 text-sm text-brand-warning">
            <p className="font-bold flex items-center gap-2">
              <span>⚠️ Development OTP</span>
            </p>
            <p className="mt-1.5 text-2xl font-mono tracking-widest text-center py-2 bg-brand-surface dark:bg-slate-800 rounded-lg font-bold border border-brand-warning/20">
              {devOtp}
            </p>
            <p className="mt-1 text-xs text-brand-textMuted dark:text-slate-400">
              Shown because email delivery is disabled in development.
            </p>
          </div>
        )}

        <Card elevation="lg" className="p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon={FaEnvelope}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              readOnly={Boolean(pendingId)}
            />

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleRequest}
                disabled={isLoading || cooldown > 0}
                className="whitespace-nowrap flex-shrink-0"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Code'}
              </Button>
              {pendingId && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={async () => {
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
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
              <span className="text-xs text-brand-textMuted leading-normal">
                Generates a 6-digit code to complete sign-up process.
              </span>
            </div>

            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              icon={FaShieldAlt}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="tracking-widest"
              placeholder="000000"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center"
            >
              Verify Email
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
