import React, { useState } from 'react';
import { Clock, User, ChevronRight, TrendingUp, Users, CreditCard, Calendar, Plus, FileText, MoreHorizontal, Edit, Archive, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import AddSessionModal from './AddSessionModal';

interface DashboardProps {
  onNavigateToClient: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToClient }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const [openClientMenu, setOpenClientMenu] = useState<number | null>(null);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [modalClientName, setModalClientName] = useState<string | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'register' | 'schedule'>('register');

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
  const openAddSessionModal = (clientName?: string, mode: 'register' | 'schedule' = 'register') => {
    setModalClientName(clientName);
    setModalMode(mode);
    setIsAddSessionModalOpen(true);
  };

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
          <button
  className="inline-flex items-center font-medium px-4 py-2 rounded-lg transition-colors bg-[#347474] hover:bg-[#285d5d] text-white"
            onClick={() => openAddSessionModal(undefined, 'schedule')}
>
            <Plus className="w-4 h-4 mr-2" />
            <span>Novo</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="py-2">
              <button
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                onClick={() => openAddSessionModal(undefined, 'schedule')}
              >
                <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#347474]" />
                </div>
                <div>
                  <p className="font-medium text-[#1F2937]">Agendar Sessão</p>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#347474]" />
                </div>
                <div>
                  <p className="font-medium text-[#1F2937]">Adicionar Cliente</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="flex flex-row gap-6 mb-8 w-full">
        {/* Sessions This Week */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                <TrendingUp size={20} style={{ color: 'rgb(var(--sys-primary))' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'rgb(var(--sys-text-main))' }}>Sessões na Semana</h3>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#343A40' }}>16</p>
              <p className="text-sm" style={{ color: '#6C757D' }}>+2 vs. semana passada</p>
            </div>
            <div className="flex flex-col items-end">
              <svg width="60" height="20" className="mb-1">
                <path
                  d={generateSparklinePath(weeklySessionsData)}
                  fill="none"
                  stroke="#347474"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs" style={{ color: '#6C757D' }}>Últimos 7 dias</span>
            </div>
          </div>
        </div>

        {/* Active Clients */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid #DEE2E6' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                <Users size={20} style={{ color: '#347474' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#343A40' }}>Clientes Ativos</h3>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold mb-1" style={{ color: '#343A40' }}>24</p>
              <p className="text-sm" style={{ color: '#6C757D' }}>85% da base total</p>
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
                    stroke="#DEE2E6"
                    strokeWidth="3"
                  />
                  {/* Progresso */}
                  {activeClientsPercentage > 0 && (
                    <circle
                      cx="22"
                      cy="22"
                      r="16"
                      fill="none"
                      stroke="#347474"
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 16}
                      strokeDashoffset={2 * Math.PI * 16 - (activeClientsPercentage / 100) * 2 * Math.PI * 16}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s' }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold" style={{ color: '#347474' }}>{activeClientsPercentage}%</span>
                </div>
              </div>
              <span className="text-xs" style={{ color: '#6C757D' }}>Ativo/Total</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
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
              <p className="text-3xl font-bold mb-1" style={{ color: '#343A40' }}>3</p>
              <p className="text-sm" style={{ color: '#6C757D' }}>R$ 450,00 total</p>
            </div>
            <div className="flex flex-col items-end">
              <button className="text-sm font-medium hover:underline mb-1" style={{ color: '#347474' }}>
                Ver detalhes
              </button>
              <span className="text-xs" style={{ color: '#6C757D' }}>Em breve</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#343A40' }}>Acessados Recentemente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentClients.map((client) => (
            <div 
              key={client.id} 
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
                    {getInitials(client.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" style={{ color: '#343A40' }}>{client.name}</h3>
                    <p className="text-sm" style={{ color: '#6C757D' }}>{client.email}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Última Sessão */}
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#6C757D' }}>
                  Última sessão: {new Date(client.lastSession).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm font-medium" style={{ color: '#343A40' }}>
                  Foco: {client.lastSessionFocus}
                </p>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={onNavigateToClient}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#347474' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6363';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#347474';
                  }}
                >
                  <FileText size={14} />
                  <span className="text-sm font-medium">Ver Prontuário</span>
                </button>
                
                <div className="relative group" data-client-menu={client.id}>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ color: '#6C757D' }}
                    title="Mais ações"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {/* Menu de Ações */}
                  <div className="absolute right-0 bottom-10 bg-white rounded-lg shadow-xl border z-50 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style={{ border: '1px solid #DEE2E6' }}>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                        style={{ color: '#343A40' }}
                        onClick={() => {
                        openAddSessionModal(client.name, 'schedule');
                        }}
                      >
                        <Calendar size={16} className="mr-2" />
                        Agendar Nova Sessão
                      </button>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                        style={{ color: '#343A40' }}
                        onClick={() => {
                          console.log('Editar Cliente', client.name);
                        }}
                      >
                        <Edit size={16} className="mr-2" />
                        Editar Cliente
                      </button>
                      <div className="border-t my-1 border-gray-200" />
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-red-50 rounded-b-lg"
                        style={{ color: '#E76F51' }}
                        onClick={() => {
                          console.log('Arquivar Cliente', client.name);
                        }}
                      >
                        <Archive size={16} className="mr-2" />
                        Arquivar Cliente
                      </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Sessions */}
      <div>
          <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Próximas Sessões do Dia</h2>
          <div className="space-y-4">
            {[
              {
                time: "14:00",
                client: "Juliana Costa",
                isFirstSession: false,
                type: "Presencial",
                paymentStatus: "Pago",
                notes: "Ansiedade generalizada - CBT",
              },
              {
                time: "15:30",
                client: "Carlos Santos",
                isFirstSession: true,
                type: "Online",
                paymentStatus: "Pendente",
                notes: "Primeira consulta - Avaliação inicial",
              },
              {
                time: "17:00",
                client: "Maria Oliveira",
                isFirstSession: false,
                type: "Presencial",
                paymentStatus: "Pago",
                notes: "Terapia de casal - Sessão 8",
              },
            ].map((session, index) => (
              <Card
                key={index}
                className="bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-[#347474]"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Informações Principais */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-[#347474]" />
                          <span className="text-xl font-bold text-[#1F2937]">{session.time}</span>
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h3 className="text-lg font-semibold text-[#1F2937]">{session.client}</h3>
                      </div>

                      {/* Tags de Contexto */}
                      <div className="flex items-center space-x-2 mb-3">
                        {session.isFirstSession && (
                          <Badge className="bg-[#EF4444] text-white text-xs px-2 py-1">1ª Sessão</Badge>
                        )}
                        <Badge
                          className={`text-xs px-2 py-1 ${
                            session.type === "Online" ? "bg-[#E6F4F1] text-[#347474]" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {session.type}
                        </Badge>
                        <Badge
                          className={`text-xs px-2 py-1 ${
                            session.paymentStatus === "Pago"
                              ? "bg-[#10B981] text-white"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {session.paymentStatus}
                        </Badge>
                      </div>

                      {/* Notas Contextuais */}
                      <p className="text-sm text-[#6B7280] italic">{session.notes}</p>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2 ml-6">
                      <Button
                        size="sm"
                        className="bg-[#347474] hover:bg-[#285d5d] text-white"
                        onClick={() => openAddSessionModal(session.client, 'register')}
                      >
                        {new Date().getHours() >= Number.parseInt(session.time.split(":")[0])
                          ? "Registrar Sessão"
                          : "Iniciar Sessão"}
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
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            {session.paymentStatus === "Pendente" && (
                              <button className="w-full text-left px-4 py-2 text-sm text-[#1F2937] hover:bg-gray-50 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                                <span>Marcar como Pago</span>
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
            ))}
          </div>
        </div>
    </div>

    <AddSessionModal
      isOpen={isAddSessionModalOpen}
      onClose={() => setIsAddSessionModalOpen(false)}
      clientName={modalClientName}
      mode={modalMode}
    />
    </div>
  );
};

export default Dashboard;