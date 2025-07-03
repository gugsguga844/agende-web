import React, { useState } from 'react';
import { User, Lock, Heart } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#347474' }}>
              <Heart size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#343A40' }}>Sessio</h1>
          <p style={{ color: '#6C757D' }}>Sua prática, organizada e segura</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              E-mail
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg transition-colors"
                style={{ 
                  border: '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#347474';
                  e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#DEE2E6';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Senha
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg transition-colors"
                style={{ 
                  border: '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#347474';
                  e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#DEE2E6';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#347474',
              focusRingColor: '#347474'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d6363';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#347474';
            }}
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: '#6C757D' }}>
            Não tem uma conta?{' '}
            <a href="#" className="font-medium hover:underline" style={{ color: '#347474' }}>
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;