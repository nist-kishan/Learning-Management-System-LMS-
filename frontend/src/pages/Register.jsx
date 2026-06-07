import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { User, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // default role is STUDENT
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await API.post('/auth/register', { name, email, password, role });
      setLoading(false);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-3">
            <span className="font-display font-extrabold text-white text-2xl">A</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm mt-1">Start your learning journey today</p>
        </div>

        {/* Card */}
        <div className="glass px-8 py-8 rounded-3xl shadow-2xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 pl-10 rounded-xl glass-input transition-all duration-200"
                />
                <User className="absolute left-3.5 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email Address</label>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pl-10 rounded-xl glass-input transition-all duration-200"
                />
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Role selection segment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Choose Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`h-11 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                    role === 'STUDENT'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${role === 'STUDENT' ? 'opacity-100' : 'opacity-0'}`} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('INSTRUCTOR')}
                  className={`h-11 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                    role === 'INSTRUCTOR'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-white/10 hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${role === 'INSTRUCTOR' ? 'opacity-100' : 'opacity-0'}`} />
                  Instructor
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl gradient-btn text-white font-semibold flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? 'Creating Account...' : 'Register'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
