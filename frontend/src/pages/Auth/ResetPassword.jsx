import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../../features/auth/authThunks';
import { isStrongPassword } from '../../utils/validation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FaLock } from 'react-icons/fa';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing or invalid reset token.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const result = await dispatch(resetPassword({ token, newPassword }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload || 'Password reset successfully');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background dark:bg-slate-950 flex items-center justify-center px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-bold text-brand-text dark:text-white mb-2">Reset Password</h1>
          <p className="text-brand-textMuted">Enter your new password below.</p>
        </div>

        <Card elevation="lg" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              icon={FaLock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              icon={FaLock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center"
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
