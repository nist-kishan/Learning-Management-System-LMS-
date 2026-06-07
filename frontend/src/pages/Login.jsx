import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import API from '../services/api';
import { Mail, Lock, ArrowRight, BookOpen, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [authError, setAuthError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(loginStart());
    setAuthError(null);
    setInfoMessage(null);

    try {
      const res = await API.post('/auth/login', { email, password });
      dispatch(loginSuccess(res.data));
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid email or password!';
      dispatch(loginFailure(errMsg));
      setAuthError(errMsg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setAuthError(null);
    setInfoMessage(null);

    try {
      const res = await API.post('/auth/forgot-password', { email: forgotEmail });
      setInfoMessage('A password reset code has been printed to the Spring Boot Console. Please retrieve it to reset your password.');
      setShowResetForm(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return;
    setAuthError(null);
    setInfoMessage(null);

    try {
      const res = await API.post('/auth/reset-password', { token: resetToken, newPassword });
      setInfoMessage('Password has been reset successfully! You can now log in.');
      setShowForgotModal(false);
      setShowResetForm(false);
      setResetToken('');
      setNewPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid reset token.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4 relative overflow-hidden">
      {/* Background blobs for premium vibe */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-3">
            <span className="font-display font-extrabold text-white text-2xl">A</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Welcome to <span className="gradient-text">AuraLMS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your learning dashboard</p>
        </div>

        {/* Card */}
        <div className="glass px-8 py-8 rounded-3xl shadow-2xl relative">
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-400 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 pl-10 rounded-xl glass-input transition-all duration-200"
                />
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setAuthError(null);
                    setInfoMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pl-10 rounded-xl glass-input transition-all duration-200"
                />
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl gradient-btn text-white font-semibold flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass max-w-md w-full p-8 rounded-3xl shadow-2xl relative border border-white/10">
            <h2 className="font-display font-bold text-2xl text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we'll generate a reset code.
            </p>

            {!showResetForm ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input"
                  />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold"
                  >
                    Generate Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Reset Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the 8-character code"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl glass-input"
                  />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setInfoMessage(null);
                    }}
                    className="px-4 h-11 rounded-xl hover:bg-white/5 text-gray-300 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-11 rounded-xl gradient-btn text-white font-semibold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
