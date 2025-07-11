import React, { useState } from 'react';
import { Calendar, ChevronDown, User, Video, MapPin, DollarSign, FileText, MoreHorizontal, Clock, Search } from 'lucide-react';

interface SessionsHistoryProps {
  onNavigateToClient: () => void;
}

const SessionsHistory: React.FC<SessionsHistoryProps> = ({ onNavigateToClient }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample sessions data grouped by date
  const sessionsData = {
    'today': {
      'Terça-feira, 30 de Janeiro de 2024': [
        {
          id: 1,
          time: '14:00',
          client: 'Juliana Costa',
          status: 'realizada',
          paymentStatus: 'pago',
          sessionType: 'presencial',
          notes: 'Sessão muito produtiva. Juliana demonstrou progresso significativo no controle da ansiedade. Trabalhamos técnicas de respiração e ela relatou melhora no sono. Discutimos estratégias para lidar com situações estressantes no trabalho. Ela está mais confiante e conseguindo aplicar as técnicas aprendidas. Durante a sessão, praticamos exercícios de mindfulness e respiração diafragmática.',
          shortNotes: 'Progresso no controle da ansiedade, técnicas de respiração...'
        },
        {
          id: 2,
          time: '15:30',
          client: 'Carlos Mendes',
          status: 'realizada',
          paymentStatus: 'pendente',
          sessionType: 'online',
          notes: 'Carlos chegou um pouco tenso hoje. Relatou uma semana difícil no trabalho com muitas demandas e prazos apertados. Praticamos exercícios de mindfulness e respiração. Ele conseguiu relaxar durante a sessão e saiu mais tranquilo. Reforçamos a importância da prática diária das técnicas.',
          shortNotes: 'Semana difícil no trabalho, praticamos mindfulness...'
        }
      ]
    },
    'yesterday': {
      'Segunda-feira, 29 de Janeiro de 2024': [
        {
          id: 3,
          time: '10:00',
          client: 'Maria Santos',
          status: 'realizada',
          paymentStatus: 'pago',
          sessionType: 'presencial',
          notes: 'Primeira sessão com Maria. Realizamos avaliação inicial completa. Paciente apresenta sintomas de ansiedade social moderada. Histórico familiar de transtornos de ansiedade. Estabelecemos rapport positivo e definimos objetivos terapêuticos iniciais.',
          shortNotes: 'Primeira sessão - avaliação inicial, ansiedade social...'
        },
        {
          id: 4,
          time: '11:30',
          client: 'Pedro Oliveira',
          status: 'realizada',
          paymentStatus: 'pago',
          sessionType: 'online',
          notes: 'Continuidade do tratamento para depressão. Pedro relatou melhora no humor e maior disposição para atividades cotidianas. Implementamos técnicas de ativação comportamental e discutimos a importância da rotina de exercícios.',
          shortNotes: 'Continuidade tratamento depressão, melhora no humor...'
        },
        {
          id: 5,
          time: '16:00',
          client: 'Ana Rodrigues',
          status: 'realizada',
          paymentStatus: 'pendente',
          sessionType: 'presencial',
          notes: 'Sessão focada em técnicas de enfrentamento para situações de estresse no trabalho. Ana demonstrou boa compreensão das estratégias apresentadas e relatou ter aplicado algumas técnicas durante a semana.',
          shortNotes: 'Técnicas de enfrentamento para estresse no trabalho...'
        }
      ]
    }
  };

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'this-week', label: 'Esta Semana' },
    { value: 'last-week', label: 'Semana Passada' },
    { value: 'this-month', label: 'Este Mês' },
    { value: 'custom-day', label: 'Selecionar um dia específico' },
    { value: 'custom-range', label: 'Selecionar um intervalo' }
  ];

  const getCurrentData = () => {
    if (selectedPeriod === 'today') return sessionsData.today;
    if (selectedPeriod === 'yesterday') return sessionsData.yesterday;
    // For other periods, we would fetch from API
    return {};
  };

  // Filter sessions based on search term
  const filterSessions = (sessions: any[]) => {
    if (!searchTerm.trim()) return sessions;
    
    return sessions.filter(session => 
      session.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.shortNotes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentData = getCurrentData();
  const hasData = Object.keys(currentData).length > 0;

  const getSessionTypeIcon = (type: string) => {
    return type === 'online' ? Video : MapPin;
  };

  const getSessionTypeColor = (type: string) => {
    return type === 'online' ? '#347474' : '#F4A261';
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'pago' ? '#347474' : '#F4A261';
  };

  const getSelectedPeriodLabel = () => {
    const option = periodOptions.find(opt => opt.value === selectedPeriod);
    return option ? option.label : 'Hoje';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Histórico de Sessões</h1>
        
        {/* Date Control */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              border: '1px solid #DEE2E6',
              backgroundColor: '#FFFFFF',
              color: '#343A40'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8F9FA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Calendar size={20} style={{ color: '#6C757D' }} />
            <span className="font-medium">{getSelectedPeriodLabel()}</span>
            <ChevronDown size={16} style={{ color: '#6C757D' }} />
          </button>

          {/* Dropdown */}
          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10" style={{ border: '1px solid #DEE2E6' }}>
              <div className="py-2">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedPeriod(option.value);
                      setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedPeriod === option.value 
                        ? 'font-medium' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ 
                      color: selectedPeriod === option.value ? '#347474' : '#343A40',
                      backgroundColor: selectedPeriod === option.value ? 'rgba(52, 116, 116, 0.05)' : 'transparent'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
          <input
            type="text"
            placeholder="Buscar por cliente ou palavras-chave nas notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Content */}
      {hasData ? (
        <div className="space-y-8">
          {Object.entries(currentData).map(([date, sessions]) => {
            const filteredSessions = filterSessions(sessions as any[]);
            
            if (filteredSessions.length === 0 && searchTerm.trim()) {
              return null; // Don't show date header if no sessions match search
            }

            return (
              <div key={date}>
                {/* Date Header */}
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#343A40' }}>
                  {date}
                </h2>

                {/* Sessions List */}
                {filteredSessions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => {
                      const SessionTypeIcon = getSessionTypeIcon(session.sessionType);
                      const isExpanded = expandedSession === session.id;

                      return (
                        <div 
                          key={session.id} 
                          className="bg-white rounded-xl shadow-sm p-6 transition-shadow hover:shadow-md"
                          style={{ border: '1px solid #DEE2E6' }}
                        >
                          {/* Session Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                                <Clock size={20} style={{ color: '#347474' }} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                                    {session.time}
                                  </h3>
                                  <span className="text-lg font-medium" style={{ color: '#343A40' }}>
                                    {session.client}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <SessionTypeIcon size={14} style={{ color: getSessionTypeColor(session.sessionType) }} />
                                  <span className="text-sm" style={{ color: '#6C757D' }}>
                                    {session.sessionType === 'online' ? 'Online' : 'Presencial'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Tags */}
                            <div className="flex items-center space-x-2">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                                style={{ 
                                  backgroundColor: `${getPaymentStatusColor(session.paymentStatus)}15`,
                                  color: getPaymentStatusColor(session.paymentStatus)
                                }}
                              >
                                <DollarSign size={12} />
                                <span>{session.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</span>
                              </span>
                              
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: '#347474' }}
                              >
                                Realizada
                              </span>
                            </div>
                          </div>

                          {/* Notes Preview */}
                          <div className="mb-4">
                            <p className="leading-relaxed" style={{ color: '#6C757D' }}>
                              {isExpanded ? session.notes : session.shortNotes}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={onNavigateToClient}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-white transition-colors"
                                style={{ backgroundColor: '#347474' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2d6363';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#347474';
                                }}
                              >
                                <User size={14} />
                                <span className="text-sm font-medium">Ver Prontuário</span>
                              </button>
                              
                              <button 
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
                                style={{ 
                                  color: '#347474',
                                  border: '1px solid #DEE2E6'
                                }}
                              >
                                <FileText size={14} />
                                <span className="text-sm font-medium">Editar Nota</span>
                              </button>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                                className="text-sm font-medium hover:underline"
                                style={{ color: '#347474' }}
                              >
                                {isExpanded ? 'Ver menos' : 'Ver mais'}
                              </button>
                              
                              <button
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                style={{ color: '#6C757D' }}
                                title="Mais ações"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* No results for search */
                  <div className="text-center py-8">
                    <p style={{ color: '#6C757D' }}>
                      Nenhuma sessão encontrada para "{searchTerm}" neste período.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F8F9FA' }}>
            <FileText size={32} style={{ color: '#6C757D' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>
            Nenhuma sessão encontrada para este período
          </h3>
          <p style={{ color: '#6C757D' }}>
            Tente selecionar outra data ou período.
          </p>
          <button
            onClick={() => setShowDatePicker(true)}
            className="mt-4 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#347474' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d6363';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#347474';
            }}
          >
            Selecionar outro período
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionsHistory;