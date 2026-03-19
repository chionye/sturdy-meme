import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiCheckSquare, FiClock, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import Logo from '../ui/Logo';

const navItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/dashboard/votes', icon: FiCheckSquare, label: 'Active Votes' },
  { to: '/dashboard/history', icon: FiClock, label: 'Vote History' },
  { to: '/dashboard/profile', icon: FiUser, label: 'My Profile' },
];

const UserSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-purple-800/30">
        <Logo size="md" className="brightness-0 invert" />
        <p className="text-purple-300 text-xs mt-1 pl-1">Member Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                active ? 'bg-white text-purple-700 shadow-md' : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-800/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{user?.name?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-purple-300 text-xs font-mono">{user?.userCode}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-purple-300 hover:text-white text-sm transition-colors">
          <FiLogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-purple-700 to-indigo-700 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <FiMenu className="h-6 w-6" />
        </button>
        <Logo size="xs" className="brightness-0 invert" />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-purple-700 to-indigo-800">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white">
              <FiX className="h-6 w-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-gradient-to-b from-purple-700 to-indigo-800 shadow-xl z-20">
        <SidebarContent />
      </div>
    </>
  );
};

export default UserSidebar;
