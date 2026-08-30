import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, verifyTwoFactor } from '../../features/auth/authThunks';
import { clearAuthError, clearTwoFactor } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaIdCard, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, isLoading, error, user, twoFactor } = useSelector((state) => state.auth);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (twoFactor && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && twoFactor) {
      // Timer expired, clear 2FA state
      dispatch(clearTwoFactor());
      setOtp('');
      toast.error('Verification code expired. Please log in again.');
    }
    return () => clearInterval(interval);
  }, [twoFactor, timeLeft, dispatch]);

  // Reset timer when twoFactor changes
  useEffect(() => {
    if (twoFactor) {
      setTimeLeft(300);
    }
  }, [twoFactor]);

  useEffect(() => {
    if (isAuthenticated && user?.isEmailVerified === false && user?.email) {
      navigate('/verify-email', { state: { email: user.email } });
    } else if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Show error toast if there's an error
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [isAuthenticated, user, error, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Prepare user data
    const userData = { email, password };
    dispatch(login(userData));
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }
    if (otp.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    dispatch(verifyTwoFactor({ email: twoFactor.email, otp }));
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      const response = await fetch('/api/auth/resend-2fa-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twoFactor.email })
      });
      const data = await response.json();
      if (response.ok) {
        setTimeLeft(300); // Reset timer
        if (data.devOtp) {
          dispatch({ type: 'auth/login/fulfilled', payload: { twoFactor: { ...twoFactor, devOtp: data.devOtp } } });
        }
        toast.success('New verification code sent');
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        {/* Login/2FA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
            {twoFactor ? (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-primary/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-primary">
                    <FaShieldAlt className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-text dark:text-white">Two-Factor Verification</h3>
                  <p className="text-sm text-brand-textMuted mt-1">
                    Code sent to <span className="text-brand-text font-semibold dark:text-emerald-400">{twoFactor.email}</span>
                  </p>
                  <div className="mt-2 text-sm font-medium text-brand-primary dark:text-emerald-400">
                    Expires in {formatTime(timeLeft)}
                  </div>
                </div>

                {twoFactor.devOtp && (
                  <div className="rounded-xl border border-brand-warning/30 bg-brand-warning/10 dark:bg-amber-950/20 px-4 py-3 text-sm text-brand-warning text-center">
                    <p className="font-semibold text-xs mb-1">⚠️ Dev OTP Code</p>
                    <p className="text-2xl font-mono tracking-widest font-bold bg-brand-surface dark:bg-slate-900 border border-brand-warning/20 rounded py-2">
                      {twoFactor.devOtp}
                    </p>
                    <p className="mt-1 text-[10px] text-brand-textMuted dark:text-slate-400">
                      Shown because email delivery is disabled in development.
                    </p>
                  </div>
                )}

                <Input
                  label="6-Digit Verification Code"
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  icon={FaShieldAlt}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="tracking-widest text-center text-xl font-bold"
                  required
                />

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full justify-center"
                >
                  Verify & Sign In
                </Button>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
                    className="w-full text-center text-sm font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors disabled:text-brand-textMuted disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : timeLeft <= 240 ? 'Resend Code' : `Resend available in ${formatTime(Math.max(0, timeLeft - 240))}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearTwoFactor());
                      setOtp('');
                      setTimeLeft(300);
                    }}
                    className="w-full text-center text-sm font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  icon={FaEnvelope}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                
                {/* Password Field */}
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={FaLock}
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
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  }
                />
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
              </form>
            )}

            {/* Divider */}
            {!twoFactor && (
              <>
                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-brand-border dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-3 bg-brand-surface dark:bg-slate-800 text-brand-textMuted font-semibold">
                        Account Access
                      </span>
                    </div>
                  </div>
                </div>

                {/* Link to Forgot Password */}
                <div className="text-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-brand-primary hover:text-brand-primaryHover font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </>
            )}
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
