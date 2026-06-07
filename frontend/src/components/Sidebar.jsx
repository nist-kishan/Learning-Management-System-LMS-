import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, BookOpen, User, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const links = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    },
    {
      to: '/my-courses',
      label: user.role === 'INSTRUCTOR' ? 'My Created Courses' : 'My Courses',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['STUDENT', 'INSTRUCTOR'],
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0f131e]/50 backdrop-blur-md hidden md:flex flex-col py-6 px-4 gap-2 h-full z-45">
      <div className="px-3 mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
        Navigation
      </div>
      
      <div className="flex flex-col gap-1">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'sidebar-active text-blue-400 bg-blue-500/10 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-[#1e293b]/20 border border-white/5 text-xs text-center text-gray-500">
        Logged in as <span className="text-gray-300 font-semibold">{user.name}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
