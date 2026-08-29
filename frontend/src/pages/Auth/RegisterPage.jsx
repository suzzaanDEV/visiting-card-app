import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../features/auth/authThunks';
import { clearAuthError } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaIdCard, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCamera } from 'react-icons/fa';
import { isStrongPassword, isValidEmail } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.isEmailVerified) {
      navigate('/dashboard');
    } else if (isAuthenticated && user?.email && user?.isEmailVerified === false) {
      navigate('/verify-email', { state: { email: user.email } });
    }

    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [isAuthenticated, error, user, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isStrongPassword(formData.password)) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    const username = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const userData = {
      username: username,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      profilePicture: formData.profilePicture
    };

    try {
      const result = await dispatch(register(userData)).unwrap();
      if (result.devOtp) {
        toast.success('Account created! Use the development OTP on the next screen.');
      } else {
        toast.success('Account created! Check your email for the verification code.');
      }
      navigate('/verify-email', {
        state: {
          email: formData.email.trim().toLowerCase(),
          devOtp: result.devOtp,
          pendingId: result.pendingId || null,
        },
      });
    } catch (err) {
      toast.error(err || 'Registration failed');
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
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Join Cardly</h1>
          <p className="text-brand-textMuted">Create your account and start networking</p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                icon={FaUser}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              {/* Email Field */}
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                icon={FaEnvelope}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

              {/* Password Field */}
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={FaLock}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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

              {/* Confirm Password Field */}
              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={FaLock}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 rounded text-brand-textMuted hover:text-brand-primary transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                }
              />

              {/* Profile Picture Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-text dark:text-brand-text/90 tracking-wide uppercase">
                  Profile Picture (Optional)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textMuted">
                    <FaCamera className="h-5 w-5" />
                  </div>
                  <input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2 bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl transition-all duration-200 outline-none text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Terms Acceptance */}
              <label className="flex items-start gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary/30 focus:ring-2 cursor-pointer"
                />
                <span className="text-xs text-brand-textMuted leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-primary hover:underline font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-brand-primary hover:underline font-semibold">
                    Privacy Policy
                  </Link>
                  , and I consent to the use of cookies as described in our{' '}
                  <Link to="/cookie-policy" target="_blank" className="text-brand-primary hover:underline font-semibold">
                    Cookie Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full justify-center mt-2"
              >
                Create Account
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-brand-textMuted text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:text-brand-primaryHover font-bold transition-colors">
              Sign In
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

export default RegisterPage;
