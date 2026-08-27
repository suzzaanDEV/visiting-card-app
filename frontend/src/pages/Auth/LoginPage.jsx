import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/authThunks';
import { clearAuthError } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaIdCard, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

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
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Welcome Back</h1>
          <p className="text-brand-textMuted">Sign in to your Cardly account</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation="lg" className="p-8">
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

            {/* Divider */}
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
