import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Eye,
  Briefcase,
  Bell,
  LineChart,
  Bot,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/stocks', icon: TrendingUp, label: 'Stocks' },
    { path: '/watchlist', icon: Eye, label: 'Watchlist' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/predictions', icon: LineChart, label: 'Predictions' },
    { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  ];

  return (
    <>
      {/* BACKDROP FOR MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800 flex flex-col z-50
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-500">TradePro</h1>
            <p className="text-sm text-gray-400 mt-1">Invest Smarter</p>
          </div>

          {/* Close button (mobile only) */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose} // close sidebar after clicking on mobile
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-900/30 text-primary-400 font-medium'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
