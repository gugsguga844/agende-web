import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'sessions', label: 'Agendamentos', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative h-screen">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg flex flex-col h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`} 
        style={{ borderRight: '1px solid #DEE2E6' }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#347474' }}>
              <Heart size={isCollapsed ? 28 : 24} className="text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold transition-opacity duration-300" style={{ color: '#343A40' }}>
                AgendeWeb
              </h1>
            )}
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
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-3' : 'space-x-3 px-3'
                    } py-3 rounded-lg transition-all duration-200 group relative ${
                      isActive 
                        ? 'text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#347474' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#343A40'
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={isCollapsed ? 24 : 20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium transition-opacity duration-300">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4" style={{ borderTop: '1px solid #DEE2E6' }}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <div 
              className={`${
                isCollapsed ? 'w-12 h-12' : 'w-10 h-10'
              } rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200`} 
              style={{ backgroundColor: '#F8F9FA' }}
            >
              <span 
                className={`font-medium ${isCollapsed ? 'text-base' : 'text-sm'}`} 
                style={{ color: '#6C757D' }}
              >
                {getInitials('N')}
              </span>
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <p className="font-medium" style={{ color: '#343A40' }}>Nome</p>
                <p className="text-sm" style={{ color: '#6C757D' }}>Profissional</p>
              </div>
            )}
          </div>
          
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-3' : 'space-x-2 px-3'
            } py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 group relative`}
            style={{ color: '#6C757D' }}
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut size={isCollapsed ? 20 : 16} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="transition-opacity duration-300">Sair</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sair
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Floating Toggle Button - Positioned on the border */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-white rounded-full shadow-lg border flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-110 group z-50"
        style={{ 
          borderColor: '#DEE2E6',
          color: '#347474'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#347474';
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.borderColor = '#347474';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.color = '#347474';
          e.currentTarget.style.borderColor = '#DEE2E6';
        }}
        title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="transition-transform duration-200 group-hover:scale-110" />
        ) : (
          <ChevronLeft size={16} className="transition-transform duration-200 group-hover:scale-110" />
        )}
        
        {/* Enhanced tooltip for floating button */}
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
          {isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        </div>
      </button>
    </div>
  );
};

export default Sidebar;