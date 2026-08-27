import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { forgotPassword } from '../../features/auth/authThunks';
import { isValidEmail } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [devResetToken, setDevResetToken] = useState('');

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

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Forgot Password</h1>
          <p className="text-brand-textMuted">Enter your email to receive a reset link.</p>
        </div>

        {devResetToken && (
          <div className="mb-4 rounded-xl border border-brand-warning/30 bg-brand-warning/10 dark:bg-amber-950/20 px-4 py-3 text-sm text-brand-warning">
            <p className="font-bold">⚠️ Development reset token</p>
            <p className="mt-1 break-all font-mono text-xs p-2 bg-brand-surface dark:bg-slate-800 rounded-lg border border-brand-warning/10">
              {devResetToken}
            </p>
            <Link
              to={`/reset-password?token=${devResetToken}`}
              className="mt-2.5 inline-block text-sm font-bold text-brand-primary hover:text-brand-primaryHover transition-colors"
            >
              Open reset password page &rarr;
            </Link>
          </div>
        )}

        <Card elevation="lg" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon={FaEnvelope}
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
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
