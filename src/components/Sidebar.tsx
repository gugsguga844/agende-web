import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Heart,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'sessions', label: 'Sessões', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col" style={{ borderRight: '1px solid #DEE2E6' }}>
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#347474' }}>
            <Heart size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#343A40' }}>Sessio</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#347474' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#343A40'
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4" style={{ borderTop: '1px solid #DEE2E6' }}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
            <span className="font-medium" style={{ color: '#6C757D' }}>DA</span>
          </div>
          <div>
            <p className="font-medium" style={{ color: '#343A40' }}>Dr(a). Ana Silva</p>
            <p className="text-sm" style={{ color: '#6C757D' }}>Psicóloga</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
          style={{ color: '#6C757D' }}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;