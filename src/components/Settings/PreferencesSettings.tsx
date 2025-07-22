import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Globe, Sun, Moon, Monitor, Users, User } from 'lucide-react';

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
];

const timezones = [
  { value: 'America/Sao_Paulo', label: 'GMT-3:00 São Paulo' },
  { value: 'America/New_York', label: 'GMT-4:00 Nova York' },
  { value: 'Europe/Lisbon', label: 'GMT+0:00 Lisboa' },
  { value: 'Europe/Madrid', label: 'GMT+1:00 Madrid' },
];

const PreferencesSettings: React.FC = () => {
  const [terminology, setTerminology] = useState<'pacientes' | 'clientes'>('pacientes');
  const [theme, setTheme] = useState<'claro' | 'escuro' | 'auto'>('auto');
  const [density, setDensity] = useState<'padrao' | 'compacta'>('padrao');
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Detectar fuso horário do navegador (mock)
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && timezones.some(t => t.value === tz)) setTimezone(tz);
    } catch {}
  }, []);

  const handleSave = () => {
    setToast({ show: true, message: 'Preferências salvas com sucesso!', type: 'success' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-4 right-4 z-[100] transition-all duration-300 ease-in-out transform"
          style={{ animation: 'slideInFromRight 0.3s ease-out' }}
        >
          <div 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-sm min-w-[300px]"
            style={{ backgroundColor: toast.type === 'success' ? '#347474' : '#E76F51', color: '#FFFFFF' }}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <p className="font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors flex-shrink-0"
            >
              <span className="sr-only">Fechar</span>
              ×
            </button>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>Preferências</h2>
      <p className="mb-6 text-[#6C757D]">Personalize a experiência do Sessio conforme o seu jeito de trabalhar.</p>
      {/* Terminologia */}
      <section className="mb-8 bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Users size={18} className="text-[#347474]" /> Terminologia para atendidos
        </h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="terminology" value="pacientes" checked={terminology === 'pacientes'} onChange={() => setTerminology('pacientes')} className="accent-[#347474]" />
            Pacientes
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="terminology" value="clientes" checked={terminology === 'clientes'} onChange={() => setTerminology('clientes')} className="accent-[#347474]" />
            Clientes
          </label>
        </div>
      </section>
      {/* Aparência */}
      <section className="mb-8 bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Sun size={18} className="text-[#347474]" /> Aparência
        </h3>
        <div className="mb-4">
          <span className="font-medium">Tema da Interface</span>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" value="claro" checked={theme === 'claro'} onChange={() => setTheme('claro')} className="accent-[#347474]" />
              <Sun size={16} /> Claro
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" value="escuro" checked={theme === 'escuro'} onChange={() => setTheme('escuro')} className="accent-[#347474]" />
              <Moon size={16} /> Escuro
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="theme" value="auto" checked={theme === 'auto'} onChange={() => setTheme('auto')} className="accent-[#347474]" />
              <Monitor size={16} /> Automático
            </label>
          </div>
        </div>
        <div>
          <span className="font-medium">Densidade da Interface</span>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="density" value="padrao" checked={density === 'padrao'} onChange={() => setDensity('padrao')} className="accent-[#347474]" />
              Padrão (mais espaçado)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="density" value="compacta" checked={density === 'compacta'} onChange={() => setDensity('compacta')} className="accent-[#347474]" />
              Compacta (mais informação)
            </label>
          </div>
        </div>
      </section>
      {/* Idioma e Região */}
      <section className="mb-8 bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Globe size={18} className="text-[#347474]" /> Idioma e Região
        </h3>
        <div className="mb-4">
          <span className="font-medium">Idioma</span>
          <select
            className="w-full mt-2 px-4 py-2 rounded-lg border border-[#DEE2E6] text-[#343A40] focus:border-[#347474] focus:ring-2 focus:ring-[#347474]"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="font-medium">Fuso Horário</span>
          <select
            className="w-full mt-2 px-4 py-2 rounded-lg border border-[#DEE2E6] text-[#343A40] focus:border-[#347474] focus:ring-2 focus:ring-[#347474]"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </section>
      <div className="flex justify-end pt-4">
        <button
          className="px-6 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors"
          onClick={handleSave}
        >
          Salvar Preferências
        </button>
      </div>
      {/* CSS Animation para toast */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PreferencesSettings; 