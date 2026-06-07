import { useSelector } from 'react-redux';
import { User, Mail, Shield, BookOpen, Calendar, Key, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'INSTRUCTOR':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'INSTRUCTOR':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Your Profile</h1>
        <p className="text-gray-400 text-xs mt-0.5">Manage your personal settings and account credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-display font-extrabold shadow-lg shadow-indigo-500/20 mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <h2 className="font-display font-bold text-white text-lg">{user.name}</h2>
          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          
          <div className={`mt-4 flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
            {getRoleIcon(user.role)}
            <span className="ml-1">{user.role}</span>
          </div>
        </div>

        {/* Right Side: Account Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-white text-base border-b border-white/5 pb-3">
              Account Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-500 text-xs block uppercase font-bold tracking-wider">Full Name</span>
                <span className="text-white font-medium">{user.name}</span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 text-xs block uppercase font-bold tracking-wider">Email Address</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 text-xs block uppercase font-bold tracking-wider">User ID</span>
                <span className="text-gray-400 font-mono text-xs block mt-1">{user.id}</span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 text-xs block uppercase font-bold tracking-wider">System Role</span>
                <span className="text-white font-medium">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Simulated Password Change Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-white text-base border-b border-white/5 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              Security Settings
            </h3>
            
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                To change your password, sign out and use the <strong>"Forgot Password"</strong> option on the Sign In page. This will print a reset code directly to your system's Spring Boot backend log for verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
