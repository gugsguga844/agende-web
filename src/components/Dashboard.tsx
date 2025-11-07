import React, { useState, useEffect } from 'react';
import { Clock, Users, Calendar, Plus, FileText, Trash2, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import DashboardCards from './Dashboard/DashboardCards';
import { Badge } from './ui/badge';
import AddSessionModal from './AddSessionModal';
import AddClientModal from './AddClientModal';
import { getSessions } from '../lib/api';
import { getDashboardStatistics } from '../lib/api';

interface DashboardProps {
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

interface DashboardStats {
  monthly_revenue: {
    current_value: number;
    previous_month_value: number;
    comparison_previous_month_percentage: number;
  };
  sessions_today: {
    completed: number;
    total: number;
  };
  pending_payments: {
    count: number;
    total_value: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToHistory }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [modalClientName, setModalClientName] = useState<string | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'register' | 'schedule'>('register');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erro ao carregar sessões:', error.message);
      } else {
        console.error('Erro ao carregar sessões:', error);
      }
      setSessionsError('Erro ao carregar sessões. Tente novamente.');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Carregar sessões quando o componente montar
  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDashboardStatistics();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas da dashboard:', err);
      setError('Erro ao carregar dados da dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  // (Removido: markSessionAsCompleted não é utilizada)

  // (Removido: weeklySessionsData, maxSessions, generateDonutPath, activeClientsPercentage pois não são utilizados)

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

  // (Removido: formatCurrency não é utilizada)

  // (Removido: formatPercentage não é utilizada)

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse" style={{ border: '1px solid #DEE2E6' }}>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadDashboardStats}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return null;
  }

  return (
    <div>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--sys-text-main))' }}>
              Bem-vindo(a) de volta, Ana!
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

        {/* Stat Cards - NOVO COMPONENTE */}
        <div className="mb-8 w-full">
          <DashboardCards data={dashboardStats} />
        </div>

        {/* Sessões Anteriores */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>Agendamentos Concluidos</h2>
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
                Nenhum agendamento registrado ainda
              </h4>
              <p className="text-[#6C757D] mb-6">
                Assim que você registrar um agendamento, ele aparecerá aqui.
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
            <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Próximos Agendamentos do Dia</h2>
            <div className="space-y-4">
              {(() => {
                if (loadingSessions) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#347474] mb-4"></div>
                      <p className="text-[#6C757D]">Carregando agendamentos...</p>
                    </div>
                  );
                }

                if (sessionsError) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-[#DEE2E6] text-center shadow-sm">
                      <Calendar size={48} className="mb-4 text-red-500" />
                      <h4 className="text-lg font-semibold mb-2 text-red-600">Erro ao carregar agendamentos</h4>
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
                      <h4 className="text-lg font-semibold mb-2" style={{ color: '#343A40' }}>Nada agendado para hoje</h4>
                      <p className="text-[#6C757D] mb-6">Você ainda não possui agendamentos marcados para este dia.<br />Que tal agendar um?</p>
                      <Button
                        className="bg-[#347474] hover:bg-[#285d5d] text-white px-6 py-3 rounded-lg font-semibold text-base"
                        onClick={() => openAddSessionModal(undefined, 'schedule')}
                      >
                        <Plus className="w-5 h-5 mr-2" /> Novo Agendamento
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
                              Marcar como Concluído
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
        onClose={() => setIsAddSessionModalOpen(false)}
        clientName={modalClientName}
        mode={modalMode}
        editingSession={editingSession}
        onSessionSaved={async (newSession) => {
          console.log('[Dashboard] onSessionSaved recebeu:', newSession);
          // Atualização otimista: se o modal retornar a nova sessão, adicione imediatamente
          if (newSession) {
            setSessions(prev => [newSession, ...prev]);
          }
          setLoadingSessions(true);
          // Pequeno delay para garantir propagação no backend
          await new Promise(res => setTimeout(res, 300));
          await loadSessions();
          await loadDashboardStats();
          setLoadingSessions(false);
        }}
      />
      {isAddClientModalOpen && (
        <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientSaved={() => {
          loadSessions();
          loadDashboardStats();
        }}
      />)}
      </div>
    );
  };

  export default Dashboard;