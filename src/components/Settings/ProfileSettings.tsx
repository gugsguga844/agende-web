import React, { useState, useEffect } from 'react';
import { Edit, X, Save, Camera, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, Award, FileText, CreditCard } from 'lucide-react';
import { getUser, updateUser, uploadImage } from '../../lib/api';
import { UpdateUserPayload } from '../../types/api';
import ImageCropper from '../ImageCropper';

interface UserProfile {
  id: number;
  full_name: string;
  professional_title?: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  specialty?: string;
  professional_license?: string;
  cpf_nif?: string;
  office_address?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ProfileSettingsProps {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  getInitials: (name: string) => string;
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
  isEditing,
  setIsEditing,
  getInitials
}) => {
  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  
  // User data state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [editData, setEditData] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Image cropper state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tempCroppedImage, setTempCroppedImage] = useState<File | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUser();
      console.log('Resposta da API getUser:', response);
      // Extrair dados do objeto 'data' retornado pela API
      const userData = response.data || response;
      console.log('Dados do usuário extraídos:', userData);
      setUserProfile(userData);
      setEditData(userData); // Inicializar dados de edição
    } catch (err) {
      console.error('Erro ao carregar perfil do usuário:', err);
      setError('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de edição
  const handleEditStart = () => {
    if (userProfile) {
      setEditData({ ...userProfile });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    // Limpar a URL de preview e a imagem temporária ao cancelar
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }
    setTempCroppedImage(null);
    setEditData(userProfile);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!editData) return;

    try {
      setSaving(true);
      
      // Se houver uma imagem cortada para fazer upload
      if (tempCroppedImage) {
        setUploadingImage(true);
        try {
          // Fazer upload da imagem para o S3
          const uploadResponse = await uploadImage(tempCroppedImage);
          console.log('Upload response:', uploadResponse);
          
          // Atualizar a URL da imagem no payload com a URL do S3
          editData.avatar_url = uploadResponse.url; // Isso será mapeado para image_url no payload
          
          // Limpar a imagem temporária após o upload bem-sucedido
          setTempCroppedImage(null);
          
        } catch (error: unknown) {
          console.error('Erro ao fazer upload da imagem:', error);
          setToast({ 
            show: true, 
            message: 'Erro ao fazer upload da imagem. Por favor, tente novamente.', 
            type: 'error' 
          });
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      
      // Preparar payload para a API
      const payload: UpdateUserPayload = {
        full_name: editData.full_name,
        email: editData.email,
        professional_title: editData.professional_title || '',
        phone: editData.phone || '',
        specialty: editData.specialty || '',
        professional_license: editData.professional_license || '',
        cpf_nif: editData.cpf_nif || '',
        office_address: editData.office_address || '',
        image_url: editData.avatar_url || undefined, // Enviando como image_url para o backend
      };

      console.log('Enviando dados para atualização:', payload);
      
      const response = await updateUser(payload);
      console.log('Resposta da atualização:', response);
      
      // Verificar se a resposta da API tem dados válidos
      const updatedData = response.data || response;
      const finalData = updatedData && updatedData.full_name ? updatedData : editData;
      
      // Atualizar dados locais
      setUserProfile(finalData);
      setEditData(finalData);
      setIsEditing(false);
      
      // Toast de sucesso
      setToast({ show: true, message: 'Perfil atualizado com sucesso!', type: 'success' });
      
    } catch (err: unknown) {
      console.error('Erro ao atualizar perfil:', err);
      
      // Toast de erro
      const errorMessage = (err as { body?: { message?: string }, message?: string }).body?.message || 
                          (err as { message?: string }).message || 
                          'Erro ao atualizar perfil';
      setToast({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Função para lidar com seleção de arquivo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setToast({ show: true, message: 'Por favor, selecione apenas arquivos de imagem.', type: 'error' });
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, message: 'A imagem deve ter no máximo 5MB.', type: 'error' });
        return;
      }
      
      setSelectedImageFile(file);
      setIsCropperOpen(true);
    }
  };

  // Função para quando o crop for completado
  const handleCropComplete = (croppedFile: File) => {
    try {
      // Criar URL de preview local
      const previewUrl = URL.createObjectURL(croppedFile);
      setPreviewImageUrl(previewUrl);
      
      // Salvar o arquivo cortado para upload posterior
      setTempCroppedImage(croppedFile);
      
      // Atualizar dados de edição com a URL de preview local
      if (editData) {
        setEditData({
          ...editData,
          avatar_url: previewUrl // Usamos a URL local temporária
        });
      }
      
    } catch (error: unknown) {
      console.error('Erro ao processar a imagem:', error);
      setToast({ 
        show: true, 
        message: 'Erro ao processar a imagem.', 
        type: 'error' 
      });
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse" style={{ border: '1px solid #DEE2E6' }}>
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle size={24} style={{ color: '#EF4444' }} />
            <div>
              <h3 className="font-semibold" style={{ color: '#EF4444' }}>Erro ao carregar perfil</h3>
              <p className="text-sm" style={{ color: '#6C757D' }}>{error}</p>
            </div>
          </div>
          <button 
            onClick={loadUserProfile}
            className="mt-4 text-sm font-medium underline"
            style={{ color: '#347474' }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile || !editData) {
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle size={24} style={{ color: '#F59E0B' }} />
            <div>
              <h3 className="font-semibold" style={{ color: '#F59E0B' }}>Perfil não encontrado</h3>
              <p className="text-sm" style={{ color: '#6C757D' }}>Não foi possível carregar os dados do perfil.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              style={{ backgroundColor: (isEditing && previewImageUrl) || userProfile?.avatar_url ? 'transparent' : '#347474' }}
            >
              {isEditing && previewImageUrl ? (
                <img 
                  src={previewImageUrl} 
                  alt="Preview da foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(userProfile?.full_name || '')
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            {/* Overlay de upload */}
            {isEditing && !uploadingImage && (
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
                {userProfile.professional_title ? `${userProfile.professional_title} ` : ''}{userProfile.full_name}
            </h2>
            <p className="text-lg" style={{ color: '#6C757D' }}>
              {userProfile.specialty || 'Profissional de Saúde'}
            </p>
          </div>
        </div>
        {/* Ação Principal */}
        {!isEditing && (
          <button
            onClick={handleEditStart}
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
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
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
            <div className="flex items-center space-x-2 py-2">
              <Mail size={16} style={{ color: '#6C757D' }} />
              <p className="font-medium" style={{ color: '#343A40' }}>{userProfile.email}</p>
              {userProfile.email_verified_at && (
                <CheckCircle size={16} style={{ color: '#10B981' }} />
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Telefone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={editData.phone || ''}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
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
            <div className="flex items-center space-x-2 py-2">
              <Phone size={16} style={{ color: '#6C757D' }} />
              <p className="font-medium" style={{ color: '#343A40' }}>
                {userProfile.phone || <span style={{ color: '#6C757D' }}>—</span>}
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
          Endereço do Consultório
        </label>
        {isEditing ? (
          <textarea
            value={editData.office_address || ''}
            onChange={(e) => setEditData({ ...editData, office_address: e.target.value })}
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
          <div className="flex items-start space-x-2 py-2">
            <MapPin size={16} style={{ color: '#6C757D', marginTop: '2px' }} />
            <p className="leading-relaxed" style={{ color: '#6C757D' }}>
              {userProfile.office_address || '—'}
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
                value={editData.professional_title || ''}
                onChange={(e) => setEditData({ ...editData, professional_title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                placeholder="Ex: Dr., Dra., Psic., ..."
                maxLength={12}
              />
            ) : (
              <div className="flex items-center space-x-2 py-2">
                <User size={16} style={{ color: '#6C757D' }} />
                <p className="font-medium" style={{ color: '#343A40' }}>
                  {userProfile.professional_title || <span style={{ color: '#6C757D' }}>—</span>}
                </p>
              </div>
            )}
          </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
            Especialidade
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.specialty || ''}
              onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
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
            <div className="flex items-center space-x-2 py-2">
              <Award size={16} style={{ color: '#6C757D' }} />
              <p className="font-medium" style={{ color: '#343A40' }}>
                {userProfile.specialty || <span style={{ color: '#6C757D' }}>—</span>}
              </p>
            </div>
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
              value={editData.professional_license || ''}
              onChange={(e) => setEditData({ ...editData, professional_license: e.target.value })}
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
            <div className="flex items-center space-x-2 py-2">
              <FileText size={16} style={{ color: '#6C757D' }} />
              <p className="font-medium" style={{ color: '#343A40' }}>
                {userProfile.professional_license || <span style={{ color: '#6C757D' }}>—</span>}
              </p>
            </div>
          )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
          CPF/NIF <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(para recibos)</span>
        </label>
        {isEditing ? (
          <input
            type="text"
            value={editData.cpf_nif || ''}
            onChange={(e) => setEditData({ ...editData, cpf_nif: e.target.value })}
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
          <div className="flex items-center space-x-2 py-2">
            <CreditCard size={16} style={{ color: '#6C757D' }} />
            <p className="font-medium" style={{ color: '#343A40' }}>
              {userProfile.cpf_nif ? maskCpf(userProfile.cpf_nif) : <span style={{ color: '#6C757D' }}>—</span>}
            </p>
          </div>
        )}
      </div>
    </div>
    {/* Botões de Ação */}
    {isEditing && (
      <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid #DEE2E6' }}>
        <button
          onClick={handleEditCancel}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#343A40', border: '1px solid #DEE2E6' }}
          onMouseEnter={(e) => {
            if (!saving) {
            e.currentTarget.style.backgroundColor = '#F8F9FA';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            }
          }}
        >
          <X size={16} />
          <span>Cancelar</span>
        </button>
        <button
          onClick={handleEditSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: saving ? '#6C757D' : '#347474' }}
          onMouseEnter={(e) => {
            if (!saving) {
            e.currentTarget.style.backgroundColor = '#2d6363';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = saving ? '#6C757D' : '#347474';
            }
          }}
        >
          <Save size={16} />
          <span>{saving ? 'Salvando...' : 'Salvar'}</span>
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

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedImageFile(null);
        }}
        onCropComplete={handleCropComplete}
        imageFile={selectedImageFile}
      />
  </div>
);
};

export default ProfileSettings; 