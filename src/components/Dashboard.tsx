import React, { useState, useEffect } from 'react';
import { Clock, User, ChevronRight, TrendingUp, Users, CreditCard, Calendar, Plus, FileText, MoreHorizontal, Edit, Archive, Trash2, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import AddSessionModal from './AddSessionModal';
import AddClientModal from './AddClientModal';
import { getSessions, updateSession } from '../lib/api';

interface DashboardProps {
  onNavigateToClient: () => void;
  onNavigateToHistory?: () => void;
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

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToClient, onNavigateToHistory }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const [openClientMenu, setOpenClientMenu] = useState<number | null>(null);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [modalClientName, setModalClientName] = useState<string | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'register' | 'schedule'>('register');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);

  // Carregar sessões da API
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setSessionsError(null);
      const sessionsData = await getSessions();
      console.log('Dados retornados pela API getSessions:', sessionsData);
      
      // Verificar se os dados estão em uma propriedade específica (ex: data, sessions, etc.)
      let sessionsArray = sessionsData;
      if (sessionsData && typeof sessionsData === 'object' && !Array.isArray(sessionsData)) {
        // Tentar encontrar o array de sessões em propriedades comuns
        sessionsArray = sessionsData.data || sessionsData.sessions || sessionsData.results || [];
        console.log('Array de sessões extraído:', sessionsArray);
      }
      
      setSessions(sessionsArray);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      setSessionsError('Erro ao carregar sessões. Tente novamente.');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Carregar sessões quando o componente montar
  useEffect(() => {
    loadSessions();
  }, []);

  // Função para obter sessões do dia atual
  const getTodaySessions = () => {
    // Verificar se sessions é um array válido
    if (!Array.isArray(sessions)) {
      console.warn('sessions não é um array:', sessions);
      return [];
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      const sessionDateString = sessionDate.toISOString().split('T')[0];
      // Filtrar apenas sessões do dia atual E que não estejam completadas
      return sessionDateString === todayString && session.session_status !== 'Completed';
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  // Função para formatar horário local
  const formatLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Função para traduzir tipo de sessão
  const translateSessionType = (type: string) => {
    switch (type) {
      case 'In-person':
        return 'Presencial';
      case 'Online':
        return 'Online';
      default:
        return type;
    }
  };

  // Função para marcar sessão como completada
  const markSessionAsCompleted = async (session: Session) => {
    try {
      const updatePayload = {
        client_ids: session.participants.map(p => p.id),
        start_time: session.start_time,
        duration_min: session.duration_min,
        focus_topic: session.focus_topic,
        session_notes: session.session_notes,
        type: session.type,
        meeting_url: session.meeting_url,
        payment_status: session.payment_status,
        payment_method: session.payment_method,
        price: session.price,
        session_status: 'Completed' // Marcar como completada
      };

      await updateSession(session.id.toString(), updatePayload);
      
      // Recarregar sessões para atualizar a lista
      await loadSessions();
      
      console.log(`Sessão ${session.id} marcada como completada`);
    } catch (error) {
      console.error('Erro ao marcar sessão como completada:', error);
    }
  };

  const recentClients = [
    {
      id: 1,
      name: 'Juliana Costa',
      email: 'juliana@email.com',
      lastSession: '2024-01-15',
      lastSessionFocus: 'Ansiedade Generalizada - CBT',
      status: 'Ativo'
    },
    {
      id: 2,
      name: 'Carlos Mendes',
      email: 'carlos@email.com',
      lastSession: '2024-01-14',
      lastSessionFocus: 'Acompanhamento Pós-Trauma',
      status: 'Ativo'
    },
    {
      id: 3,
      name: 'Maria Santos',
      email: 'maria@email.com',
      lastSession: '2024-01-13',
      lastSessionFocus: 'Primeira Consulta - Avaliação',
      status: 'Ativo'
    }
  ];

  // const todaySessions = [
  //   {
  //     id: 1,
  //     time: '09:00',
  //     client: 'Juliana Costa',
  //     status: 'confirmado'
  //   },
  //   {
  //     id: 2,
  //     time: '10:30',
  //     client: 'Carlos Mendes',
  //     status: 'confirmado'
  //   },
  //   {
  //     id: 3,
  //     time: '14:00',
  //     client: 'Maria Santos',
  //     status: 'pendente'
  //   },
  //   {
  //     id: 4,
  //     time: '15:30',
  //     client: 'Pedro Oliveira',
  //     status: 'confirmado'
  //   }
  // ];

  // Sample data for sparkline (last 7 days)
  const weeklySessionsData = [8, 12, 10, 15, 11, 14, 16];
  const maxSessions = Math.max(...weeklySessionsData);

  // Generate SVG path for sparkline
  const generateSparklinePath = (data: number[]) => {
    const width = 60;
    const height = 20;
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / maxSessions) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Generate donut chart path
  const generateDonutPath = (percentage: number) => {
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return { strokeDasharray, strokeDashoffset };
  };

  // Garante que o valor está entre 0 e 100
  const activeClientsPercentage = Math.max(0, Math.min(100, 85));
  const donutProps = generateDonutPath(activeClientsPercentage);

  // Função para abrir o modal com contexto
  const openAddSessionModal = (clientName?: string, mode: 'register' | 'schedule' = 'register', session?: Session) => {
    setModalClientName(clientName);
    setModalMode(mode);
    setEditingSession(session);
    setIsAddSessionModalOpen(true);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.group')) {
        setShowCreateMenu(false);
      }
    };
    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showCreateMenu]);

  return (
  <div>
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--sys-text-main))' }}>
            Bem-vindo(a) de volta, Dr(a). Ana!
          </h1>
          <p style={{ color: 'rgb(var(--sys-text-muted))' }}>
            Este é seu resumo do dia :)
          </p>
        </div>
        <div className="relative group">
          {/* O botão principal só abre/fecha o menu, não executa ação */}
          <button
            type="button"
            className="inline-flex items-center font-medium px-4 py-2 rounded-lg transition-colors bg-[#347474] hover:bg-[#285d5d] text-white"
            onClick={() => setShowCreateMenu((v) => !v)}
            aria-haspopup="true"
            aria-expanded={showCreateMenu}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Novo</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dropdown Menu */}
          {(showCreateMenu || undefined) && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-2">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  onClick={() => {
                    setShowCreateMenu(false);
                    openAddSessionModal(undefined, 'schedule');
                  }}
                >
                  <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#347474]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1F2937]">Agendar Sessão</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  onClick={() => {
                    setShowCreateMenu(false);
                    setIsAddClientModalOpen(true); // simula abrir modal de cliente
                  }}
                >
                  <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#347474]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1F2937]">Adicionar Cliente</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="flex flex-row gap-6 mb-8 w-full">
        {/* Sessões de Hoje */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Calendar size={20} style={{ color: '#10B981' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#343A40' }}>Sessões de Hoje</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {(() => {
                const todaySessions = getTodaySessions();
                const completedSessions = sessions.filter(s => {
                  const sessionDate = new Date(s.start_time);
                  const today = new Date();
                  const sessionDateString = sessionDate.toISOString().split('T')[0];
                  const todayString = today.toISOString().split('T')[0];
                  return sessionDateString === todayString && s.session_status === 'Completed';
                });
                
                const totalSessions = todaySessions.length + completedSessions.length;
                const completedCount = completedSessions.length;
                const progressPercentage = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;
                const isAllCompleted = totalSessions > 0 && completedCount === totalSessions;
                
                return (
                  <div className="flex items-center space-x-4">
                    {/* Círculo de Progresso */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-4 relative">
                        <span className="text-2xl font-bold" style={{ color: '#343A40' }}>
                          {totalSessions}
                        </span>
                        {/* Círculo de progresso */}
                        <svg className="absolute inset-0 w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          {/* Fundo */}
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="4"
                          />
                          {/* Progresso */}
                          {progressPercentage > 0 && (
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke={isAllCompleted ? '#10B981' : '#F4A261'}
                              strokeWidth="4"
                              strokeDasharray={2 * Math.PI * 28}
                              strokeDashoffset={2 * Math.PI * 28 - (progressPercentage / 100) * 2 * Math.PI * 28}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.5s' }}
                            />
                          )}
                        </svg>
                        {/* Ícone de sucesso quando todas concluídas */}
                        {isAllCompleted && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações de Progresso */}
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1" style={{ color: '#6C757D' }}>
                        {totalSessions === 0 ? 'Nenhuma sessão agendada' :
                         completedCount === 0 ? `${totalSessions} agendada${totalSessions > 1 ? 's' : ''} para hoje` :
                         isAllCompleted ? 'Todas as sessões concluídas!' :
                         `${completedCount} de ${totalSessions} concluída${completedCount > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs" style={{ color: '#6C757D' }}>
                        {totalSessions === 0 ? 'Dia livre!' :
                         completedCount === 0 ? 'Comece o dia!' :
                         isAllCompleted ? 'Excelente trabalho!' :
                         `${Math.round(progressPercentage)}% do dia concluído`}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Faturamento no Mês */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <DollarSign size={20} style={{ color: '#2563EB' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#343A40' }}>Faturamento no Mês</h3>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#343A40' }}>
                R$ {sessions
                  .filter(s => {
                    const sessionDate = new Date(s.start_time);
                    const now = new Date();
                    return sessionDate.getMonth() === now.getMonth() && 
                           sessionDate.getFullYear() === now.getFullYear() &&
                           s.payment_status === 'Paid';
                  })
                  .reduce((total, session) => total + session.price, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm" style={{ color: '#6C757D' }}>
                {sessions.filter(s => {
                  const sessionDate = new Date(s.start_time);
                  const now = new Date();
                  return sessionDate.getMonth() === now.getMonth() && 
                         sessionDate.getFullYear() === now.getFullYear() &&
                         s.payment_status === 'Paid';
                }).length} sessões pagas
              </p>
            </div>
            <div className="flex flex-col items-end">
              <svg width="60" height="20" className="mb-1">
                <path
                  d="M0,10 L10,8 L20,12 L30,6 L40,10 L50,4 L60,8"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs" style={{ color: '#6C757D' }}>Este mês</span>
            </div>
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(244, 162, 97, 0.1)' }}>
                <CreditCard size={20} style={{ color: '#F4A261' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#343A40' }}>Pagamentos Pendentes</h3>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#343A40' }}>
                {sessions.filter(s => s.payment_status === 'Pending').length}
              </p>
              <p className="text-sm" style={{ color: '#6C757D' }}>
                R$ {sessions
                  .filter(s => s.payment_status === 'Pending')
                  .reduce((total, session) => total + session.price, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 mb-1">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 44 44">
                  {/* Fundo */}
                  <circle
                    cx="22"
                    cy="22"
                    r="16"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="3"
                  />
                  {/* Progresso */}
                  {(() => {
                    const totalSessions = sessions.length;
                    const pendingSessions = sessions.filter(s => s.payment_status === 'Pending').length;
                    const percentage = totalSessions > 0 ? (pendingSessions / totalSessions) * 100 : 0;
                    return percentage > 0 ? (
                      <circle
                        cx="22"
                        cy="22"
                        r="16"
                        fill="none"
                        stroke="#F4A261"
                        strokeWidth="3"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 - (percentage / 100) * 2 * Math.PI * 16}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s' }}
                      />
                    ) : null;
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold" style={{ color: '#F4A261' }}>
                    {(() => {
                      const totalSessions = sessions.length;
                      const pendingSessions = sessions.filter(s => s.payment_status === 'Pending').length;
                      return totalSessions > 0 ? Math.round((pendingSessions / totalSessions) * 100) : 0;
                    })()}%
                  </span>
                </div>
              </div>
              <span className="text-xs" style={{ color: '#6C757D' }}>Pendente/Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessões Anteriores */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>Sessões Anteriores</h2>
          <button
            className="text-sm font-medium text-[#347474] hover:underline px-3 py-1 rounded transition-colors"
            onClick={() => {
              if (typeof onNavigateToHistory === 'function') onNavigateToHistory();
            }}
          >
            Ver Todas
          </button>
        </div>
        {sessions.filter(s => s.session_status === 'Completed').length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
            <FileText size={48} className="mb-4 text-[#347474]" />
            <h4 className="text-lg font-semibold mb-2" style={{ color: '#343A40' }}>
              Nenhuma sessão registrada ainda
            </h4>
            <p className="text-[#6C757D] mb-6">
              Assim que você registrar uma sessão, ela aparecerá aqui.<br />Mantenha seu histórico clínico sempre atualizado!
            </p>
            <Button
              className="bg-[#347474] hover:bg-[#285d5d] text-white px-6 py-3 rounded-lg font-semibold text-base"
              onClick={() => onNavigateToHistory && onNavigateToHistory()}
            >
              <FileText className="w-5 h-5 mr-2" /> Ver Histórico Completo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions
              .filter(s => s.session_status === 'Completed')
              .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
              .slice(0, 3)
              .map(session => (
                <div
                  key={session.id}
                  className="bg-white p-6 rounded-xl shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #DEE2E6' }}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: '#347474' }}
                      >
                        {getInitials(session.participants.length === 1 ? session.participants[0].full_name : 'Grupo')}
                      </div>
                      <div className="flex-1">
                        {session.participants.length === 1 ? (
                          <h3 className="font-semibold text-lg" style={{ color: '#343A40' }}>
                            <span
                              className="cursor-pointer hover:text-[#347474] transition-colors font-semibold text-lg"
                              style={{ color: '#343A40' }}
                              title={session.participants[0].full_name}
                            >
                              {session.participants[0].full_name.length > 20 
                                ? session.participants[0].full_name.substring(0, 20) + '...'
                                : session.participants[0].full_name
                              }
                            </span>
                          </h3>
                        ) : (
                          <h3 className="font-semibold text-lg" style={{ color: '#343A40' }}>Sessão em Grupo</h3>
                        )}
                        <p className="text-sm" style={{ color: '#6C757D' }}>
                          {session.participants.length === 1
                            ? session.participants[0].email
                            : (
                              <span
                                className="cursor-pointer hover:text-[#347474] transition-colors"
                                title={session.participants.map(p => p.full_name).join(', ')}
                              >
                                {session.participants[0].full_name}...
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Informações da Sessão */}
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6C757D' }}>
                      Data: {new Date(session.start_time).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#343A40' }}>
                      Foco: {session.focus_topic}
                    </p>
                  </div>
                  {/* Ações */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {}}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: '#347474' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2d6363')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#347474')}
                    >
                      <FileText size={14} />
                      <span className="text-sm font-medium">Ver Detalhes da Sessão</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Today's Sessions */}
      <div>
          <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Próximas Sessões do Dia</h2>
          <div className="space-y-4">
            {(() => {
              if (loadingSessions) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#347474] mb-4"></div>
                    <p className="text-[#6C757D]">Carregando sessões...</p>
                  </div>
                );
              }

              if (sessionsError) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
                    <Calendar size={48} className="mb-4 text-red-500" />
                    <h4 className="text-lg font-semibold mb-2 text-red-600">Erro ao carregar sessões</h4>
                    <p className="text-[#6C757D] mb-6">{sessionsError}</p>
                    <Button
                      className="bg-[#347474] hover:bg-[#285d5d] text-white px-6 py-3 rounded-lg font-semibold text-base"
                      onClick={loadSessions}
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                );
              }

              const todaySessions = getTodaySessions();
              
              if (todaySessions.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
                    <Calendar size={48} className="mb-4 text-[#347474]" />
                    <h4 className="text-lg font-semibold mb-2" style={{ color: '#343A40' }}>Nenhuma sessão agendada para hoje</h4>
                    <p className="text-[#6C757D] mb-6">Você ainda não possui sessões marcadas para este dia.<br />Que tal agendar uma nova sessão?</p>
                    <Button
                      className="bg-[#347474] hover:bg-[#285d5d] text-white px-6 py-3 rounded-lg font-semibold text-base"
                      onClick={() => openAddSessionModal(undefined, 'schedule')}
                    >
                      <Plus className="w-5 h-5 mr-2" /> Agendar Nova Sessão
                    </Button>
                  </div>
                );
              }
              return todaySessions.map((session, index) => {
                // Verifica se a sessão já passou, mas ainda está como 'Scheduled'
                const now = new Date();
                const sessionStart = new Date(session.start_time);
                const isPast = sessionStart < now;
                const needsRegister = isPast && session.session_status === 'Scheduled';
                return (
                  <Card
                    key={session.id}
                    className={"bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-[#347474]"}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* Informações Principais */}
                        <div className={`flex-1${needsRegister ? ' opacity-60' : ''}`}>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-[#347474]" />
                              <span className="text-xl font-bold text-[#1F2937]">{formatLocalTime(session.start_time)}</span>
                            </div>
                            <div className="h-6 w-px bg-gray-300"></div>
                            {session.participants.length === 1 ? (
                              <h3 className="text-lg font-semibold text-[#1F2937]">
                                {session.participants[0].full_name}
                              </h3>
                            ) : (
                              <div className="flex flex-col">
                                <h3 className="text-lg font-semibold text-[#1F2937]">Sessão em Grupo</h3>
                                <span className="text-sm text-[#6B7280] font-normal mt-1">
                                  {session.participants.slice(0, 2).map(p => p.full_name).join(', ')}
                                  {session.participants.length > 2 && ` e mais ${session.participants.length - 2}`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Tags de Contexto */}
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge
                              className={`text-xs px-2 py-1 transition-colors duration-150 cursor-default
                                ${session.type === "Online"
                                  ? "bg-[#E6F4F1] text-[#347474] hover:bg-[#d2f0e7] hover:text-[#285d5d]"
                                  : "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"}
                              `}
                            >
                              {translateSessionType(session.type)}
                            </Badge>
                            <Badge
                              className={`text-xs px-2 py-1 transition-colors duration-150 cursor-default
                                ${session.payment_status === "Paid"
                                  ? "bg-[#10B981] text-white hover:bg-[#059669] hover:text-white"
                                  : "bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900"}
                              `}
                            >
                              {session.payment_status === "Paid" ? "Pago" : "Pendente"}
                            </Badge>
                            {needsRegister && (
                              <Badge className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 cursor-default hover:bg-yellow-200 transition-colors duration-150">
                                A Registrar
                              </Badge>
                            )}
                          </div>

                          {/* Notas Contextuais */}
                          <p className="text-sm text-[#6B7280] italic">{session.focus_topic}</p>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-6">
                          <Button
                            size="sm"
                            className="bg-[#347474] hover:bg-[#285d5d] text-white"
                            onClick={() => openAddSessionModal(session.participants[0]?.full_name, 'register', session)}
                          >
                            Registrar Sessão
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#347474] text-[#347474] hover:bg-[#347474] hover:text-white bg-transparent"
                          >
                            Ver Prontuário
                          </Button>

                          {/* Menu de Ações Secundárias */}
                          <div className="relative group">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-[#6B7280] hover:bg-gray-50 bg-transparent"
                            >
                              ⋯
                            </Button>

                            {/* Dropdown Menu (aparece no hover) */}
                            <div className="absolute right-0 top-full mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                {session.payment_status === "Pending" && (
                                  <button
                                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                                    style={{ color: '#10B981' }}
                                    onClick={() => {/* ação de registrar pagamento */}}
                                  >
                                    <DollarSign size={16} className="mr-2" /> Registrar Pagamento
                                  </button>
                                )}
                                <button
                                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                                  style={{ color: '#343A40' }}
                                  onClick={() => {
                                    console.log('Reagendar Sessão');
                                  }}
                                >
                                  <Clock size={16} className="mr-2" /> Reagendar Sessão
                                </button>
                                <button
                                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-red-50 rounded-b-lg"
                                  style={{ color: '#E76F51' }}
                                  onClick={() => {
                                    console.log('Cancelar Sessão');
                                  }}
                                >
                                  <Trash2 size={16} className="mr-2" /> Cancelar Sessão
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        </div>
    </div>

    <AddSessionModal
      isOpen={isAddSessionModalOpen}
      onClose={() => {
        setIsAddSessionModalOpen(false);
        setEditingSession(undefined);
        // Recarregar sessões quando o modal for fechado (após criar uma nova sessão)
        loadSessions();
      }}
      clientName={modalClientName}
      mode={modalMode}
      editingSession={editingSession}
    />
    {isAddClientModalOpen && (
      <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} />
    )}
    </div>
  );
};

export default Dashboard;