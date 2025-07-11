import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Bold, Italic, List, Clock, User, MapPin, Video, DollarSign, Search, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import AddClientModal from './AddClientModal';

interface Client {
  id: number;
  name: string;
  email: string;
}

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string; // Optional - when opened from client profile
  mode: 'register' | 'schedule'; // Determines the modal behavior
}

interface ToastMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ 
  isOpen, 
  onClose, 
  clientName,
  mode = 'register'
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('50');
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionType, setSessionType] = useState<'presencial' | 'online'>('presencial');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>('pendente');
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(mode === 'register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState<ToastMessage>({ type: 'success', message: '', show: false });
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Sample clients data
  const clients: Client[] = [
    { id: 1, name: 'Juliana Costa', email: 'juliana@email.com' },
    { id: 2, name: 'Carlos Mendes', email: 'carlos@email.com' },
    { id: 3, name: 'Maria Santos', email: 'maria@email.com' },
    { id: 4, name: 'Pedro Oliveira', email: 'pedro@email.com' },
    { id: 5, name: 'Ana Rodrigues', email: 'ana@email.com' },
    { id: 6, name: 'João Silva', email: 'joao@email.com' },
    { id: 7, name: 'Carla Ferreira', email: 'carla@email.com' }
  ];

  // Sample existing sessions for conflict detection
  const existingSessions = [
    { date: '2024-01-30', startTime: '14:00', endTime: '14:50', client: 'Pedro Oliveira' },
    { date: '2024-01-30', startTime: '15:30', endTime: '16:20', client: 'Ana Rodrigues' }
  ];

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setDate('');
      setStartTime('');
      setDuration('50');
      setCustomDuration('');
      setIsCustomDuration(false);
      setSessionTitle('');
      setSessionType('presencial');
      setPaymentStatus('pendente');
      setNotes('');
      setNotesExpanded(mode === 'register');
      setErrorMessage('');
      setIsSubmitting(false);
      
      // Set client if provided
      if (clientName) {
        const client = clients.find(c => c.name === clientName);
        if (client) {
          setSelectedClient(client);
          setClientSearch(client.name);
        }
      } else {
        setSelectedClient(null);
        setClientSearch('');
      }
    }
  }, [isOpen, clientName, mode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-client-selector]')) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Check for time conflicts
  const checkTimeConflict = (sessionDate: string, sessionStartTime: string, sessionDuration: number) => {
    const sessionEndTime = calculateEndTime(sessionStartTime, sessionDuration);
    
    return existingSessions.some(existing => {
      if (existing.date !== sessionDate) return false;
      
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);
      const newStart = timeToMinutes(sessionStartTime);
      const newEnd = timeToMinutes(sessionEndTime);
      
      // Check for overlap
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const hours = Math.floor(endMinutes / 60);
    const minutes = endMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message, show: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Get final duration value
      const finalDuration = isCustomDuration ? parseInt(customDuration) : parseInt(duration);
      
      // Validate custom duration
      if (isCustomDuration && (!customDuration || finalDuration <= 0 || finalDuration > 480)) {
        setErrorMessage('A duração deve ser entre 1 e 480 minutos.');
        setIsSubmitting(false);
        return;
      }

      // Check for time conflicts
      const hasConflict = checkTimeConflict(date, startTime, finalDuration);
      
      if (hasConflict) {
        setErrorMessage('Conflito de horário detectado. Este período já está ocupado por outra sessão.');
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sessionData = {
        client: selectedClient,
        date,
        startTime,
        duration: finalDuration,
        sessionTitle,
        sessionType,
        paymentStatus,
        notes
      };
      
      console.log('Session data:', sessionData);
      
      // Success - close modal and show toast
      onClose();
      
      const actionText = mode === 'register' ? 'registrada' : 'agendada';
      showToast('success', `Sessão com ${selectedClient?.name} ${actionText} com sucesso.`);
      
    } catch (error) {
      setErrorMessage('Erro interno do servidor. Tente novamente em alguns instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const getModalTitle = () => {
    if (mode === 'register' && clientName) {
      return `Registrar Sessão para ${clientName}`;
    }
    return mode === 'register' ? 'Registrar Sessão' : 'Novo Agendamento';
  };

  const getDurationOptions = () => {
    return ['30', '45', '50', '60', '90', '120'];
  };

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      setDuration('');
    } else {
      setIsCustomDuration(false);
      setDuration(value);
      setCustomDuration('');
    }
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
              <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
                {getModalTitle()}
              </h2>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 rounded-lg p-1 transition-colors"
                style={{ color: '#6C757D' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-4 rounded-lg flex items-start space-x-3" style={{ backgroundColor: 'rgba(231, 111, 81, 0.1)', border: '1px solid rgba(231, 111, 81, 0.2)' }}>
                <AlertCircle size={20} style={{ color: '#E76F51', marginTop: '2px' }} />
                <div>
                  <p className="font-medium" style={{ color: '#E76F51' }}>Erro ao salvar</p>
                  <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client Selection */}
              <div data-client-selector>
                <label htmlFor="client" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Cliente
                </label>
                <div className="relative">
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10" style={{ color: '#6C757D' }} />
                    <input
                      id="client"
                      type="text"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientDropdown(true);
                        if (!e.target.value) {
                          setSelectedClient(null);
                        }
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg transition-colors"
                      style={{ 
                        border: '1px solid #DEE2E6',
                        color: '#343A40'
                      }}
                      onFocusCapture={(e) => {
                        e.target.style.borderColor = '#347474';
                        e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => {
                          e.target.style.borderColor = '#DEE2E6';
                          e.target.style.boxShadow = 'none';
                        }, 150);
                      }}
                      placeholder="Digite o nome do cliente..."
                      disabled={!!clientName} // Disabled if opened from client profile
                      required
                    />
                    <ChevronDown 
                      size={20} 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" 
                      style={{ color: '#6C757D' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                      style={{ color: '#347474' }}
                      title="Adicionar novo cliente"
                    >
                      +
                    </button>
                  </div>

                  {/* Client Dropdown */}
                  {showClientDropdown && !clientName && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto" style={{ border: '1px solid #DEE2E6' }}>
                      {filteredClients.length > 0 ? (
                        <div className="py-2">
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleClientSelect(client)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
                                <User size={16} style={{ color: '#6C757D' }} />
                              </div>
                              <div>
                                <div className="font-medium" style={{ color: '#343A40' }}>{client.name}</div>
                                <div className="text-sm" style={{ color: '#6C757D' }}>{client.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 px-4 text-center" style={{ color: '#6C757D' }}>
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Data da Sessão
                  </label>
                  <div className="relative">
                    <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
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
                      required
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Hora de Início
                  </label>
                  <div className="relative">
                    <Clock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
                    <input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
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
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Duração (min)
                  </label>
                  {!isCustomDuration ? (
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg transition-colors"
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
                      required
                    >
                      {getDurationOptions().map(option => (
                        <option key={option} value={option}>{option} min</option>
                      ))}
                      <option value="custom">Personalizado...</option>
                    </select>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg transition-colors"
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
                        placeholder="Ex: 75"
                        min="1"
                        max="480"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(false)}
                        className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ 
                          border: '1px solid #DEE2E6',
                          color: '#6C757D'
                        }}
                        title="Voltar para opções padrão"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Title */}
              <div>
                <label htmlFor="sessionTitle" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  {mode === 'register' ? 'Foco Principal da Sessão' : 'Tema da Sessão (Opcional)'}
                </label>
                <input
                  id="sessionTitle"
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-colors"
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
                  placeholder="Ex: Ansiedade Generalizada - CBT, Primeira Consulta..."
                />
              </div>

              {/* Session Type and Payment Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Session Type */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                    Tipo de Sessão
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setSessionType('presencial')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        sessionType === 'presencial' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: sessionType === 'presencial' ? '#347474' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: sessionType === 'presencial' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <MapPin size={16} />
                      <span>Presencial</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('online')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        sessionType === 'online' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: sessionType === 'online' ? '#347474' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: sessionType === 'online' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <Video size={16} />
                      <span>Online</span>
                    </button>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                    Status do Pagamento
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('pago')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        paymentStatus === 'pago' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: paymentStatus === 'pago' ? '#347474' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: paymentStatus === 'pago' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <DollarSign size={16} />
                      <span>Pago</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('pendente')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                        paymentStatus === 'pendente' 
                          ? 'text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: paymentStatus === 'pendente' ? '#F4A261' : 'transparent',
                        border: '1px solid #DEE2E6',
                        color: paymentStatus === 'pendente' ? '#FFFFFF' : '#343A40'
                      }}
                    >
                      <DollarSign size={16} />
                      <span>Pendente</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="notes" className="block text-sm font-medium" style={{ color: '#343A40' }}>
                    Notas da Sessão {mode === 'schedule' && <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(opcional)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotesExpanded(!notesExpanded)}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#347474' }}
                  >
                    {notesExpanded ? 'Minimizar' : 'Expandir'}
                  </button>
                </div>
                
                {notesExpanded && (
                  <>
                    {/* Rich Text Toolbar */}
                    <div className="flex items-center space-x-2 p-2 rounded-t-lg" style={{ 
                      border: '1px solid #DEE2E6',
                      backgroundColor: '#F8F9FA'
                    }}>
                      <button
                        type="button"
                        className="p-2 rounded transition-colors hover:bg-gray-200"
                        style={{ color: '#6C757D' }}
                        title="Negrito"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded transition-colors hover:bg-gray-200"
                        style={{ color: '#6C757D' }}
                        title="Itálico"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded transition-colors hover:bg-gray-200"
                        style={{ color: '#6C757D' }}
                        title="Lista"
                      >
                        <List size={16} />
                      </button>
                    </div>

                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={mode === 'register' ? 8 : 4}
                      className="w-full px-4 py-3 rounded-b-lg transition-colors resize-none"
                      style={{ 
                        border: '1px solid #DEE2E6',
                        borderTop: 'none',
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
                      placeholder={mode === 'register' 
                        ? "Descreva os pontos principais da sessão, evolução do paciente, técnicas utilizadas, observações importantes..."
                        : "Adicione observações ou preparações para esta sessão..."
                      }
                      required={mode === 'register'}
                    />
                  </>
                )}

                {!notesExpanded && (
                  <div 
                    className="w-full px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ 
                      border: '1px solid #DEE2E6',
                      color: '#6C757D'
                    }}
                    onClick={() => setNotesExpanded(true)}
                  >
                    {mode === 'register' 
                      ? "Clique para adicionar notas da sessão..."
                      : "Clique para adicionar observações..."
                    }
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
                  <span>{isSubmitting ? 'Salvando...' : (mode === 'register' ? 'Salvar Sessão' : 'Agendar Sessão')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification - Renderizado FORA do modal */}
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
      <style>
        {`
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
        `}
      </style>

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
      />
    </>
  );
};

export default AddSessionModal;