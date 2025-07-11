import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainLayout from './components/MainLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {isAuthenticated ? (
        <MainLayout onLogout={handleLogout} />
      ) : (
        currentView === 'login' ? (
          <LoginPage 
            onLogin={handleLogin} 
            onNavigateToRegister={() => setCurrentView('register')}
          />
        ) : (
          <RegisterPage 
            onRegister={handleRegister}
            onBackToLogin={() => setCurrentView('login')}
          />
        )
      )}
    </div>
  );
}

export default App;