import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Aegis Shield', href: '/aegis-shield', icon: '🛡️' },
    { name: 'Inheritance', href: '/inheritance', icon: '🏛️' },
    { name: 'Transactions', href: '/transactions', icon: '💼' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AEGIS</h1>
            <p className="text-sm text-gray-500">Security Hub</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 