import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, FileText, ChevronDown, CheckCircle, AlertCircle, CreditCard, UserPlus } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToastMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  
  // Additional information fields
  const [birthDate, setBirthDate] = useState('');
  const [cpfNif, setCpfNif] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  // UI state
  const [isAdditionalInfoExpanded, setIsAdditionalInfoExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastMessage>({ type: 'success', message: '', show: false });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset all fields
      setFullName('');
      setEmail('');
      setPhone('');
      setStatus('Ativo');
      setBirthDate('');
      setCpfNif('');
      setEmergencyContact('');
      setIsAdditionalInfoExpanded(false);
      setIsSubmitting(false);
      setErrors({});
    }
  }, [isOpen]);

  // Toast auto-hide effect
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  if (!isOpen && !toast.show) return null;

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    // Email validation (optional but must be valid if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Phone mask
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // CPF/NIF mask
  const formatCpfNif = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleCpfNifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfNif(e.target.value);
    setCpfNif(formatted);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const clientData = {
        fullName: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
        birthDate: birthDate || null,
        cpfNif: cpfNif.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        createdAt: new Date().toISOString()
      };

      console.log('Client data to save:', clientData);

      // Success - close modal and show toast
      onClose();
      showToast('success', `Cliente "${fullName}" adicionado com sucesso.`);

    } catch (error) {
      console.error('Error saving client:', error);
      setErrors({ general: 'Não foi possível salvar o cliente. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
              <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
                Adicionar Novo Cliente
              </h2>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 rounded-lg p-1 transition-colors"
                style={{ color: '#6C757D' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mx-6 mt-4 p-4 rounded-lg flex items-start space-x-3" style={{ backgroundColor: 'rgba(231, 111, 81, 0.1)', border: '1px solid rgba(231, 111, 81, 0.2)' }}>
                <AlertCircle size={20} style={{ color: '#E76F51', marginTop: '2px' }} />
                <div>
                  <p className="font-medium" style={{ color: '#E76F51' }}>Erro ao salvar</p>
                  <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.general}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Essential Information */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Nome Completo <span style={{ color: '#E76F51' }}>*</span>
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors ${
                        errors.fullName ? 'border-red-300' : ''
                      }`}
                      style={{ 
                        border: errors.fullName ? '1px solid #E76F51' : '1px solid #DEE2E6',
                        color: '#343A40'
                      }}
                      onFocus={(e) => {
                        if (!errors.fullName) {
                          e.target.style.borderColor = '#347474';
                          e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.fullName) {
                          e.target.style.borderColor = '#DEE2E6';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                      placeholder="Digite o nome completo..."
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Email <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(opcional)</span>
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                      style={{ 
                        border: errors.email ? '1px solid #E76F51' : '1px solid #DEE2E6',
                        color: '#343A40'
                      }}
                      onFocus={(e) => {
                        if (!errors.email) {
                          e.target.style.borderColor = '#347474';
                          e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.email) {
                          e.target.style.borderColor = '#DEE2E6';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                      placeholder="exemplo@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Telefone <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
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
                      placeholder="(xx) xxxxx-xxxx"
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                    Status Inicial
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStatus('Ativo')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        status === 'Ativo' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: status === 'Ativo' ? '#347474' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: status === 'Ativo' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>Ativo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Inativo')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        status === 'Inativo' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: status === 'Inativo' ? '#6C757D' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: status === 'Inativo' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <X size={16} />
                      <span>Inativo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #DEE2E6' }}></div>

              {/* Additional Information Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsAdditionalInfoExpanded(!isAdditionalInfoExpanded)}
                  className="flex items-center justify-between w-full py-2 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <ChevronDown 
                      size={16} 
                      style={{ 
                        color: '#347474',
                        transform: isAdditionalInfoExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                    <span className="font-medium" style={{ color: '#347474' }}>
                      Informações Adicionais
                    </span>
                    <span className="text-sm" style={{ color: '#6C757D' }}>(opcional)</span>
                  </div>
                </button>

                {/* Expanded Additional Fields */}
                {isAdditionalInfoExpanded && (
                  <div className="mt-4 space-y-4 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                    {/* Birth Date and CPF/NIF Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Birth Date */}
                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                          Data de Nascimento
                        </label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                          <input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
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
                          />
                        </div>
                      </div>

                      {/* CPF/NIF */}
                      <div>
                        <label htmlFor="cpfNif" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                          CPF/NIF <span className="text-xs" style={{ color: '#6C757D' }}>(para recibos)</span>
                        </label>
                        <div className="relative">
                          <CreditCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                          <input
                            id="cpfNif"
                            type="text"
                            value={cpfNif}
                            onChange={handleCpfNifChange}
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
                            placeholder="000.000.000-00"
                            maxLength={14}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                        Contato de Emergência
                      </label>
                      <div className="relative">
                        <UserPlus size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                        <input
                          id="emergencyContact"
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
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
                          placeholder="Nome e telefone..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                  style={{ 
                    color: '#343A40',
                    border: '1px solid #DEE2E6'
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: isSubmitting ? '#6C757D' : '#347474',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#2d6363';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#347474';
                    }
                  }}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-4 right-4 z-[100] transition-all duration-300 ease-in-out transform"
          style={{
            animation: 'slideInFromRight 0.3s ease-out'
          }}
        >
          <div 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-sm min-w-[300px]"
            style={{
              backgroundColor: toast.type === 'success' ? '#347474' : '#E76F51',
              color: '#FFFFFF'
            }}
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

      {/* CSS Animation */}
      <style jsx>{`
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
    </>
  );
};

export default AddClientModal;