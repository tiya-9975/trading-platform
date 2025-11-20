import { NavLink } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Eye, 
  Briefcase, 
  Bell, 
  LineChart, 
  Bot,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
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
    <aside className="w-64 bg-black border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-primary-500">TradePro</h1>
        <p className="text-sm text-gray-400 mt-1">Invest Smarter</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-900/30 text-primary-400 font-medium'
                  : 'text-gray-300 hover:bg-dark-hover'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;