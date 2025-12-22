import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { requestEmailOtp, verifyEmailOtp } from '../../features/auth/authThunks';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequest = async () => {
    if (!email) {
      toast.error('Enter your email first.');
      return;
    }
    const result = await dispatch(requestEmailOtp(email));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload || 'Verification code sent');
    } else {
      toast.error(result.payload || 'Failed to send code');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Email and code are required');
      return;
    }
    const result = await dispatch(verifyEmailOtp({ email, otp }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(result.payload || 'Email verified');
    } else {
      toast.error(result.payload || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Verify Email</h1>
        <p className="text-sm text-gray-500 mb-6">Request a code and verify your email.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRequest}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </button>
            <span className="text-sm text-gray-500">You’ll receive a 6-digit code.</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6-digit code"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;

