import { useAuth } from '../../context/AuthContext';
import { User, DollarSign } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name}!</h2>
          <p className="text-sm text-gray-500 mt-1">Track your investments and grow your wealth</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <DollarSign size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Available Balance</p>
              <p className="text-lg font-semibold text-green-600">
                ${user?.balance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;