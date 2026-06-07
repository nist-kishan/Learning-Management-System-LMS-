import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { LogOut, User as UserIcon, BookOpen, Shield } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
        return <Shield className="w-3.5 h-3.5 mr-1" />;
      case 'INSTRUCTOR':
        return <BookOpen className="w-3.5 h-3.5 mr-1" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <nav className="h-16 border-b border-white/5 glass px-6 flex items-center justify-between z-50 sticky top-0">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-display font-extrabold text-white text-lg">A</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">
          Aura<span className="gradient-text">LMS</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
            
            <div className={`flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
              {getRoleIcon(user.role)}
              {user.role}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/5 text-gray-400 hover:text-rose-400 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
