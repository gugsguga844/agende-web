import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ClientsList from './ClientsList';
import ClientProfile from './ClientProfile';
import Calendar from './Calendar';
import Settings from './Settings/Settings';
import SessionsHistory from './SessionsHistory';
import FinancialPage from './FinancialPage';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigateToClient={() => setActiveTab('client-profile')} />;
      case 'clients':
        return <ClientsList onNavigateToClient={() => setActiveTab('client-profile')} />;
      case 'client-profile':
        return <ClientProfile />;
      case 'sessions':
        return <SessionsHistory onNavigateToClient={() => setActiveTab('client-profile')} />;
      case 'calendar':
        return <Calendar />;
      case 'financial':
        return <FinancialPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigateToClient={() => setActiveTab('client-profile')} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout} 
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;