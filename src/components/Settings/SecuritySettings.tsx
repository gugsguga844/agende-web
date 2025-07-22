import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Shield, LogOut, Lock, Eye, EyeOff, X } from 'lucide-react';

const mockSessions = [
  {
    id: 1,
    device: 'Chrome em Windows 10',
    location: 'São Paulo, Brasil',
    lastAccess: '22 de Julho de 2025',
    current: false,
  },
  {
    id: 2,
    device: 'Safari em iPhone 13',
    location: 'Rio de Janeiro, Brasil',
    lastAccess: '21 de Julho de 2025',
    current: false,
  },
  {
    id: 3,
    device: 'Edge em Windows 11',
    location: 'Belo Horizonte, Brasil',
    lastAccess: 'Agora mesmo',
    current: true,
  },
];

const SecuritySettings: React.FC = () => {
  // Estados fictícios
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [sessions, setSessions] = useState(mockSessions);

  // Handler para alterar senha
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    // Simular sucesso
    setPasswordSuccess('Senha alterada com sucesso!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('');
    }, 1500);
  };

  // Handler para desconectar sessão
  const handleDisconnectSession = (id: number) => {
    setSessions(sessions => sessions.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
        Segurança da Conta
      </h3>
      <div className="space-y-4">
        {/* Senha */}
        <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <div className="flex items-center gap-3">
            <Lock size={20} style={{ color: '#347474' }} />
            <div>
              <h4 className="font-medium" style={{ color: '#343A40' }}>Senha</h4>
              <p className="text-sm" style={{ color: '#6C757D' }}>Última alteração há 3 meses</p>
            </div>
          </div>
          <button className="font-medium hover:underline" style={{ color: '#347474' }} onClick={() => setShowPasswordModal(true)}>
            Alterar Senha
          </button>
        </div>
        {/* 2FA */}
        <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <div className="flex items-center gap-3">
            {is2FAEnabled ? (
              <Shield size={20} style={{ color: '#10B981' }} />
            ) : (
              <AlertCircle size={20} style={{ color: '#F4A261' }} />
            )}
            <div>
              <h4 className="font-medium" style={{ color: '#343A40' }}>Autenticação em Duas Etapas</h4>
              {is2FAEnabled ? (
                <span className="text-sm" style={{ color: '#10B981' }}>
                  Ativada
                </span>
              ) : (
                <span className="text-sm" style={{ color: '#F4A261' }}>
                  Desativada. A sua conta está menos segura.
                </span>
              )}
            </div>
          </div>
          {is2FAEnabled ? (
            <button className="font-medium hover:underline" style={{ color: '#10B981' }}>
              Gerir
            </button>
          ) : (
            <button className="font-medium hover:underline" style={{ color: '#F4A261' }}>
              Configurar
            </button>
          )}
        </div>
        {/* Sessões Ativas */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <LogOut size={20} style={{ color: '#2563EB' }} />
            <div>
              <h4 className="font-medium" style={{ color: '#343A40' }}>Sessões Ativas</h4>
              <span className="text-sm" style={{ color: '#2563EB' }}>{sessions.length} sessão{sessions.length !== 1 ? 's' : ''} ativa{sessions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button className="font-medium hover:underline" style={{ color: '#2563EB' }} onClick={() => setShowSessionsModal(true)}>
            Ver Sessões
          </button>
        </div>
      </div>

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowPasswordModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#343A40' }}>Alterar Senha</h4>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>Senha Atual</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
                    style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                  />
                  <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
                    style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                  />
                  <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={() => setShowNewPassword(v => !v)} tabIndex={-1}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
                    style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                  />
                  <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && <div className="text-[#E76F51] text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-[#10B981] text-sm">{passwordSuccess}</div>}
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: '#347474' }}>
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sessões Ativas */}
      {showSessionsModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowSessionsModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#343A40' }}>Sessões Ativas</h4>
            <ul className="divide-y divide-[#DEE2E6]">
              {sessions.map(session => (
                <li key={session.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: '#343A40' }}>{session.device}</div>
                    <div className="text-sm" style={{ color: '#6C757D' }}>{session.location}</div>
                    <div className="text-xs" style={{ color: '#6C757D' }}>Último acesso: {session.lastAccess}</div>
                    {session.current && <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-[#10B981] text-white">Sessão Atual</span>}
                  </div>
                  {!session.current && (
                    <button
                      className="ml-4 px-3 py-1 rounded bg-[#E76F51] text-white text-xs font-semibold hover:bg-[#c94c2b] transition-colors"
                      onClick={() => handleDisconnectSession(session.id)}
                    >
                      Desconectar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
