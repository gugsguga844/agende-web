import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Video, DollarSign, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import AddClientModal from './AddClientModal';
import RichTextEditor from './RichTextEditor';
import { addSession, getClients, updateSession } from '../lib/api';
import { AddSessionPayload } from '../types/api';
import { useToast } from './ui/ToastContext';

interface Client {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  cpf_nif?: string;
  emergency_contact?: string;
  case_summary?: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

interface Session {
  id: number;
  user_id: number;
  participants: Array<{
    id: number;
    full_name: string;
    email: string;
  }>;
  start_time: string;
  end_time: string;
  duration_min: number;
  focus_topic: string;
  session_notes: string;
  type: string;
  meeting_url?: string;
  payment_status: string;
  payment_method?: string;
  session_status: string;
  price: number;
  created_at: string;
  updated_at: string;
}

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string; // Optional - when opened from client profile
  mode: 'register' | 'schedule'; // Determines the modal behavior
  editingSession?: Session; // Optional - when editing an existing session
  onSessionSaved?: (session?: Session) => void; // Callback para atualizar dashboard
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
  mode = 'register',
  editingSession,
  onSessionSaved
}) => {
  console.log('[AddSessionModal] props.onSessionSaved:', onSessionSaved);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
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
  const [meetingLink, setMeetingLink] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto' | 'dinheiro' | 'outro'>('pix');
  const [sessionPrice, setSessionPrice] = useState('');
  const [sessionPriceError, setSessionPriceError] = useState('');

  // Estado para clientes vindos da API
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setClientsLoading(true);
      setClientsError(null);
      getClients()
        .then((data) => {
          // Ajuste conforme o formato retornado pela API
          setClients(Array.isArray(data) ? data : data.data || []);
        })
        .catch((err) => {
          console.error(err);
          setClientsError('Erro ao buscar clientes.');
        })
        .finally(() => setClientsLoading(false));
    }
  }, [isOpen]);

  // Sample existing sessions for conflict detection
  const existingSessions = [
    { date: '2024-01-30', startTime: '14:00', endTime: '14:50', client: 'Pedro Oliveira' },
    { date: '2024-01-30', startTime: '15:30', endTime: '16:20', client: 'Ana Rodrigues' }
  ];

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(clientSearch.toLowerCase())
  );

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingSession) {
        // Preencher formulário com dados do agendamento existente
        const sessionDate = new Date(editingSession.start_time);
        const dateString = sessionDate.toISOString().split('T')[0];
        const timeString = sessionDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        setDate(dateString);
        setStartTime(timeString);
        setDuration(editingSession.duration_min.toString());
        setSessionTitle(editingSession.focus_topic);
        setSessionType(editingSession.type === 'Online' ? 'online' : 'presencial');
        setPaymentStatus(editingSession.payment_status === 'Paid' ? 'pago' : 'pendente');
        setNotes(editingSession.session_notes);
        setNotesExpanded(true); // Sempre expandir para registrar agendamento
        setMeetingLink(editingSession.meeting_url || '');
        setPaymentMethod(editingSession.payment_method === 'Pix' ? 'pix' : 
                        editingSession.payment_method === 'Cartão de Crédito' ? 'cartao' : 
                        editingSession.payment_method === 'Boleto' ? 'boleto' : 
                        editingSession.payment_method === 'Dinheiro' ? 'dinheiro' : 'outro');
        setSessionPrice((editingSession.price * 100).toString()); // Converter para centavos
        
        // Preencher clientes selecionados
        setSelectedClients(editingSession.participants.map(p => ({
          id: p.id,
          user_id: 0, // Valor padrão
          full_name: p.full_name,
          email: p.email,
          status: 'Active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      } else {
        // Reset form para novo agendamento
      setDate('');
        setStartTime('07:00'); // Horário padrão 07:00
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
      setMeetingLink('');
      setPaymentMethod('pix');
      setSessionPrice('');
      setSessionPriceError('');
      
      // Set client if provided
      if (clientName) {
          const client = clients.find(c => c.full_name === clientName);
        if (client) {
          setSelectedClients([client]);
            setClientSearch(client.full_name);
        }
      } else {
        setSelectedClients([]);
        setClientSearch('');
      }
    }
    }
  }, [isOpen, clientName, mode, editingSession, clients]);

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

  // Função para formatar valor como moeda
  function formatCurrency(value: string) {
    const clean = value.replace(/[^\d]/g, '');
    const number = parseFloat(clean) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para scroll suave ao topo do modal
  const scrollToTop = () => {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSessionPriceError('');
    
    try {
      // Get final duration value
      const finalDuration = isCustomDuration ? parseInt(customDuration) : parseInt(duration);
      
      // Validate custom duration
      if (isCustomDuration && (!customDuration || finalDuration <= 0 || finalDuration > 480)) {
        setErrorMessage('A duração deve ser entre 1 e 480 minutos.');
        scrollToTop();
        setIsSubmitting(false);
        return;
      }

      // Validação do valor
      const priceNumber = Number(sessionPrice) / 100;
      if (isNaN(priceNumber) || priceNumber <= 0 || priceNumber > 999999.99) {
        setSessionPriceError('Informe um valor válido entre R$ 0,01 e R$ 999.999,99');
        scrollToTop();
        setIsSubmitting(false);
        return;
      }

      // Check for time conflicts (apenas para novos agendamentos)
      if (!editingSession) {
      const hasConflict = checkTimeConflict(date, startTime, finalDuration);
      if (hasConflict) {
        setErrorMessage('Conflito de horário detectado. Este período já está ocupado por outro agendamento.');
          scrollToTop();
        setIsSubmitting(false);
        return;
      }
      }

      // Converter horário local para UTC antes de enviar
      const localDateTime = new Date(`${date}T${startTime}:00`);
      const utcDateTime = localDateTime.toISOString();

      // Montar payload conforme AddSessionPayload
      const payload: AddSessionPayload = {
        client_ids: selectedClients.map(c => c.id),
        start_time: utcDateTime, // Horário convertido para UTC
        duration_min: finalDuration,
        focus_topic: sessionTitle,
        session_notes: notes,
        type: sessionType === 'online' ? 'Online' : 'In-person',
        meeting_url: sessionType === 'online' ? meetingLink : undefined,
        payment_status: paymentStatus === 'pago' ? 'Paid' : 'Pending',
        payment_method: paymentStatus === 'pago' ? paymentMethod : undefined,
        price: priceNumber,
        session_status: mode === 'register' ? 'Completed' : 'Scheduled',
      };
      
      console.log('Payload enviado:', editingSession ? 'para updateSession' : 'para addSession', payload);
      
      if (editingSession) {
        // Atualizar agendamento existente
        await updateSession(editingSession.id.toString(), payload);
      } else {
        // Criar novo agendamento
        await addSession(payload);
      }

      // Se possível, retorne o agendamento recém criado/editado para atualização otimista
      let returnedSession: Session | undefined = undefined;
      if (editingSession) {
        // Atualização: recupere o agendamento editado (idealmente da API, mas aqui retornamos o payload)
        returnedSession = { ...editingSession, ...payload };
      } else {
        // Novo agendamento: recupere a resposta da API se possível, senão retorne o payload
        // Ideal: const created = await addSession(payload); returnedSession = created;
        // Aqui, como addSession não retorna, simulamos:
        returnedSession = {
          ...payload,
          id: Date.now(),
          user_id: 0,
          participants: selectedClients,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          end_time: new Date(new Date(payload.start_time).getTime() + payload.duration_min * 60000).toISOString(),
          meeting_url: payload.meeting_url || '',
        };
      }
      console.log('[AddSessionModal] onSessionSaved será chamado com:', returnedSession);
      if (typeof onSessionSaved === 'function') onSessionSaved(returnedSession);
      onClose();
      const actionText = editingSession ? 'atualizado(a)' : (mode === 'register' ? 'registrado(a)' : 'agendado(a)');
      
      // Determinar o texto do toast baseado no número de clientes
      let toastMessage;
      if (selectedClients.length === 1) {
        toastMessage = `Agendamento de ${selectedClients[0].full_name} ${actionText} com sucesso.`;
      } else {
        toastMessage = `Agendamento em grupo ${actionText} com sucesso.`;
      }
      
      showToast(toastMessage, 'success');
      
    } catch (error: unknown) {
      const maybeAny = error as { body?: { message?: string } } | undefined;
      setErrorMessage(maybeAny?.body?.message || 'Erro interno do servidor. Tente novamente em alguns instantes.');
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    if (!selectedClients.some(c => c.id === client.id)) {
      setSelectedClients(prev => [...prev, client]);
    }
    setClientSearch('');
  };

  const handleClientSaved = async (newClientName: string) => {
    try {
      const data = await getClients();
      const list: Client[] = Array.isArray(data) ? data : (data.data || []);
      setClients(list);
      const found = list.find(c => c.full_name.toLowerCase() === newClientName.toLowerCase());
      if (found) {
        setSelectedClients(prev => (prev.some(x => x.id === found.id) ? prev : [...prev, found]));
        setClientSearch('');
        setShowClientDropdown(false);
      }
    } catch (e) {
      // silenciosamente falha; a lista permanecerá como estava
    } finally {
      setIsAddClientModalOpen(false);
    }
  };

  const getModalTitle = () => {
    if (editingSession) {
      return 'Registrar Agendamento';
    }
    if (mode === 'register' && clientName) {
      return `Registrar Agendamento para ${clientName}`;
    }
    return mode === 'register' ? 'Registrar Agendamento' : 'Novo Agendamento';
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content">
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
                  Cliente{selectedClients.length > 1 ? 's (Agendamento em Grupo)' : ''}
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
                      placeholder={selectedClients.length > 0 ? '' : 'Digite o nome do cliente...'}
                      disabled={!!clientName} // Disabled if opened from client profile
                      required={selectedClients.length === 0}
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
                  {/* Chips dos clientes selecionados */}
                  {selectedClients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedClients.map(client => (
                        <span key={client.id} className="flex items-center bg-[#F8F9FA] rounded-full px-3 py-1 text-sm font-medium" style={{ color: '#343A40', border: '1px solid #DEE2E6' }}>
                          {client.full_name}
                          {!clientName && (
                            <button
                              type="button"
                              className="ml-2 text-[#E76F51] hover:text-red-700"
                              onClick={() => setSelectedClients(selectedClients.filter(c => c.id !== client.id))}
                              title="Remover cliente"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Client Dropdown */}
                  {showClientDropdown && !clientName && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto" style={{ border: '1px solid #DEE2E6' }}>
                      {clientsLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="w-10 h-10 border-4 border-[#347474] border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-[#6C757D]">Carregando clientes...</p>
                        </div>
                      ) : clientsError ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F9FA] mb-4 border border-dashed border-[#DEE2E6]">
                            <User size={36} className="text-[#B0BEC5]" />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#E76F51' }}>Erro ao buscar clientes</h4>
                          <p className="text-[#6C757D] mb-4">Não foi possível carregar a lista de clientes.<br/>Tente novamente mais tarde.</p>
                        </div>
                      ) : clients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F9FA] mb-4 border border-dashed border-[#DEE2E6]">
                            <User size={36} className="text-[#B0BEC5]" />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#343A40' }}>Nenhum cliente cadastrado</h4>
                          <p className="text-[#6C757D] mb-4">Para criar um agendamento, é necessário cadastrar pelo menos um cliente.<br/>Clique em <span className='font-semibold' style={{ color: '#347474' }}>'Adicionar novo cliente'</span> para começar.</p>
                          <button
                            type="button"
                            onClick={() => setIsAddClientModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#347474] text-white font-semibold text-base shadow hover:bg-[#285d5d] transition-colors"
                          >
                            <User size={18} /> Adicionar novo cliente
                          </button>
                        </div>
                      ) : filteredClients.filter(client => !selectedClients.some(c => c.id === client.id)).length > 0 ? (
                        <div className="py-2">
                          {filteredClients.filter(client => !selectedClients.some(c => c.id === client.id)).map((client) => (
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
                                <div className="font-medium" style={{ color: '#343A40' }}>{client.full_name}</div>
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
                    Data do Agendamento
                  </label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
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
                    disabled={!!editingSession}
                      required
                    />
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Hora de Início
                  </label>
                    <input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
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
                    disabled={!!editingSession}
                      required
                    />
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
                  {mode === 'register' ? 'Foco Principal do Agendamento' : 'Descrição do Agendamento (Opcional)'}
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
                    Tipo de Atendimento
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
              {paymentStatus === 'pago' && (
                <div className="mt-4 w-full">
                  <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Método de Pagamento
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cartao' | 'boleto' | 'dinheiro' | 'outro')}
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                  >
                    <option value="pix">Pix</option>
                    <option value="cartao">Cartão</option>
                    <option value="boleto">Boleto</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              )}
              {/* Campo de link da reunião para sessões online - agora fora do grid, ocupa 100% */}
              {sessionType === 'online' && (
                <div className="mt-4 w-full">
                  <label htmlFor="meetingLink" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Link da Reunião (Online)
                  </label>
                  <input
                    id="meetingLink"
                    type="url"
                    value={meetingLink}
                    onChange={e => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{ border: '1px solid #DEE2E6', color: '#343A40' }}
                    onFocus={e => {
                      e.target.style.borderColor = '#347474';
                      e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#DEE2E6';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    required
                  />
                </div>
              )}

              {/* Valor da Consulta */}
              <div>
                <label htmlFor="sessionPrice" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Valor da Consulta (R$)
                </label>
                <input
                  id="sessionPrice"
                  type="text"
                  value={formatCurrency(sessionPrice)}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    if (raw.length > 8) return; // Limite para 99999999 (999999,99)
                    setSessionPrice(raw);
                    setSessionPriceError('');
                  }}
                  className={`w-full px-4 py-3 rounded-lg transition-colors ${sessionPriceError ? 'border-red-400' : ''}`}
                  style={{ border: sessionPriceError ? '1px solid #E76F51' : '1px solid #DEE2E6', color: '#343A40' }}
                  onFocus={e => {
                    e.target.style.borderColor = '#347474';
                    e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = sessionPriceError ? '#E76F51' : '#DEE2E6';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Ex: 200,00"
                  required
                  maxLength={11}
                  autoComplete="off"
                />
                {sessionPriceError && (
                  <span className="text-xs text-[#E76F51] mt-1 block">{sessionPriceError}</span>
                )}
              </div>

              {/* Notes Section */}
              

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
                  <span>{isSubmitting ? 'Salvando...' : (mode === 'register' ? 'Concluir Sessão' : 'Agendar Sessão')}</span>
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
        onClientSaved={handleClientSaved}
      />
    </>
  );
};

export default AddSessionModal;