import React, { useState, useEffect } from 'react';
import { Edit, X, Save, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  title?: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  crp: string;
  address: string;
  cpf: string;
  photo: string | null;
}

interface ProfileSettingsProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  handleCancel: () => void;
  handleSave: () => void;
  getInitials: (name: string) => string;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const maskCpf = (cpf: string) => {
  // Exibe apenas os 3 do meio e os 2 finais
  if (!cpf || cpf.length < 11) return cpf;
  // Remove não dígitos
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profileData,
  setProfileData,
  isEditing,
  setIsEditing,
  handleCancel,
  handleSave,
  getInitials,
  handlePhotoUpload
}) => {
  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handler para salvar com toast
  const handleSaveWithToast = () => {
    handleSave();
    setToast({ show: true, message: 'Perfil atualizado com sucesso!', type: 'success' });
  };

  return (
  <div className="space-y-8">
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
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    {/* Header do Perfil */}
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Avatar/Foto */}
          <div className="relative group">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold relative overflow-hidden"
              style={{ backgroundColor: profileData.photo ? 'transparent' : '#347474' }}
            >
              {profileData.photo ? (
                <img 
                  src={profileData.photo} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(profileData.name)
              )}
            </div>
            {/* Overlay de upload */}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label className="cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          {/* Informações de Identificação */}
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#343A40' }}>
                {/* Exibe título se houver */}
                {profileData.title ? `${profileData.title} ` : ''}{profileData.name}
            </h2>
            <p className="text-lg" style={{ color: '#6C757D' }}>
              {profileData.specialty}
            </p>
          </div>
        </div>
        {/* Ação Principal */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#347474' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d6363';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#347474';
            }}
          >
            <Edit size={16} />
            <span>Editar Perfil</span>
          </button>
        )}
      </div>
    </div>
    {/* Seção: Informações de Contato */}
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
      <h3 className="text-lg font-semibold mb-6" style={{ color: '#343A40' }}>
        Informações de Contato
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#347474';
                e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DEE2E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          ) : (
            <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Telefone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#347474';
                e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DEE2E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          ) : (
            <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.phone}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
          Endereço do Consultório
        </label>
        {isEditing ? (
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded-lg transition-colors resize-none"
            style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
            onFocus={(e) => {
              e.target.style.borderColor = '#347474';
              e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#DEE2E6';
              e.target.style.boxShadow = 'none';
            }}
          />
        ) : (
          <div className="rounded-lg p-3" style={{ backgroundColor: '#F8F9FA' }}>
            <p className="leading-relaxed" style={{ color: '#6C757D' }}>
              {profileData.address}
            </p>
          </div>
        )}
      </div>
    </div>
    {/* Seção: Informações Profissionais */}
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
      <h3 className="text-lg font-semibold mb-6" style={{ color: '#343A40' }}>
        Informações Profissionais
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Título Profissional (opcional)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.title || ''}
                onChange={e => setProfileData({ ...profileData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                placeholder="Ex: Dr., Dra., Psic., ..."
                maxLength={12}
              />
            ) : (
              <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.title || <span className="text-[#6C757D]">—</span>}</p>
            )}
          </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Especialidade
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.specialty}
              onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#347474';
                e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DEE2E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          ) : (
            <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.specialty}</p>
          )}
        </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Registro Profissional
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.crp}
              onChange={(e) => setProfileData({ ...profileData, crp: e.target.value })}
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#347474';
                e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DEE2E6';
                e.target.style.boxShadow = 'none';
              }}
            />
          ) : (
            <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.crp}</p>
          )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
          CPF/NIF <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(para recibos)</span>
        </label>
        {isEditing ? (
          <input
            type="text"
            value={profileData.cpf}
            onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
            className="w-full px-3 py-2 rounded-lg transition-colors"
            style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
            onFocus={(e) => {
              e.target.style.borderColor = '#347474';
              e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#DEE2E6';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="000.000.000-00"
          />
        ) : (
              <p className="py-2 font-medium" style={{ color: '#343A40' }}>{maskCpf(profileData.cpf)}</p>
        )}
      </div>
    </div>
    {/* Botões de Ação */}
    {isEditing && (
      <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid #DEE2E6' }}>
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#343A40', border: '1px solid #DEE2E6' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8F9FA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <X size={16} />
          <span>Cancelar</span>
        </button>
        <button
              onClick={handleSaveWithToast}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#347474' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d6363';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#347474';
          }}
        >
          <Save size={16} />
          <span>Salvar</span>
        </button>
      </div>
    )}
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

export default ProfileSettings; 