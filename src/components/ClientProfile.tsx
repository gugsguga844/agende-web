import React, { useState } from 'react';
import { Edit, Phone, Mail, User, Calendar, FileText, ChevronDown, Archive, DollarSign, Save, X } from 'lucide-react';
import AddSessionModal from './AddSessionModal';

const ClientProfile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({
    name: 'Juliana Costa',
    email: 'juliana@email.com',
    phone: '(11) 99999-9999',
    status: 'Ativo',
    notes: 'Paciente com quadro de ansiedade generalizada. Responde bem à terapia cognitivo-comportamental. Importante manter rotina de exercícios e técnicas de respiração.'
  });

  const client = {
    name: 'Juliana Costa',
    email: 'juliana@email.com',
    phone: '(11) 99999-9999',
    status: 'Ativo',
    notes: 'Paciente com quadro de ansiedade generalizada. Responde bem à terapia cognitivo-comportamental. Importante manter rotina de exercícios e técnicas de respiração.'
  };

  const sessions = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'Ansiedade Generalizada - CBT',
      notes: 'Sessão muito produtiva. Juliana demonstrou progresso significativo no controle da ansiedade. Trabalhamos técnicas de respiração e ela relatou melhora no sono. Discutimos estratégias para lidar com situações estressantes no trabalho. Ela está mais confiante e conseguindo aplicar as técnicas aprendidas. Durante a sessão, praticamos exercícios de mindfulness e respiração diafragmática. Juliana relatou que tem conseguido usar essas técnicas no dia a dia, especialmente antes de reuniões importantes no trabalho.',
      summary: 'Progresso no controle da ansiedade, melhora no sono, técnicas de respiração...'
    },
    {
      id: 2,
      date: '2024-01-08',
      title: 'Estresse no Trabalho - Mindfulness',
      notes: 'Juliana chegou um pouco tensa hoje. Relatou uma semana difícil no trabalho com muitas demandas e prazos apertados. Praticamos exercícios de mindfulness e respiração. Ela conseguiu relaxar durante a sessão e saiu mais tranquila. Reforçamos a importância da prática diária das técnicas. Discutimos estratégias para gerenciar melhor o tempo e estabelecer limites saudáveis no ambiente profissional.',
      summary: 'Semana difícil no trabalho, praticamos mindfulness, estratégias de gestão...'
    },
    {
      id: 3,
      date: '2024-01-01',
      title: 'Planejamento 2024 - Metas Terapêuticas',
      notes: 'Primeira sessão do ano. Juliana está motivada para continuar o tratamento. Definimos metas para 2024, incluindo manter a regularidade dos exercícios e implementar uma rotina de autocuidado. Ela está confiante e determinada. Estabelecemos objetivos específicos: prática diária de mindfulness por 10 minutos, exercícios físicos 3x por semana, e técnicas de respiração antes de situações estressantes.',
      summary: 'Definimos metas para 2024, paciente motivada, rotina de autocuidado...'
    },
    {
      id: 4,
      date: '2023-12-18',
      title: 'Avaliação de Progresso - Trimestre',
      notes: 'Sessão de avaliação trimestral. Juliana demonstrou evolução significativa desde o início do tratamento. Redução considerável dos episódios de ansiedade, melhora na qualidade do sono e maior confiança em situações sociais. Ela relatou sentir-se mais preparada para enfrentar desafios e tem aplicado consistentemente as técnicas aprendidas.',
      summary: 'Avaliação trimestral, evolução significativa, redução da ansiedade...'
    }
  ];

  const tabs = [
    { id: 'sessions', label: 'Histórico de Sessões', icon: Calendar },
    { id: 'details', label: 'Detalhes e Contato', icon: User },
    { id: 'documents', label: 'Documentos', icon: FileText }
  ];

  const handleSave = () => {
    // Aqui salvaria os dados editados
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md" style={{ border: '1px solid #DEE2E6' }}>
                {/* Header do Card */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                        <Calendar size={20} style={{ color: '#347474' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: '#343A40' }}>
                          {session.title}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#6C757D' }}>
                          {new Date(session.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="leading-relaxed" style={{ color: '#6C757D' }}>
                          {expandedSession === session.id ? session.notes : session.summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{ color: '#347474' }}>
                        {expandedSession === session.id ? 'Ver menos' : 'Ver mais'}
                      </span>
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          color: '#347474',
                          transform: expandedSession === session.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Ações (visível quando expandido) */}
                {expandedSession === session.id && (
                  <div className="px-6 pb-6 pt-0" style={{ borderTop: '1px solid #F8F9FA' }}>
                    <div className="flex items-center space-x-3 mt-4">
                      <button 
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                        style={{ 
                          color: '#347474',
                          border: '1px solid #DEE2E6',
                          backgroundColor: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8F9FA';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <Edit size={14} />
                        <span className="text-sm font-medium">Editar Nota</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'details':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                Informações do Cliente
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                  style={{ 
                    color: '#347474',
                    border: '1px solid #DEE2E6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedClient.name}
                    onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
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
                ) : (
                  <p className="py-2" style={{ color: '#343A40' }}>{client.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedClient.email}
                    onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
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
                ) : (
                  <p className="py-2" style={{ color: '#343A40' }}>{client.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedClient.phone}
                    onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
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
                ) : (
                  <p className="py-2" style={{ color: '#343A40' }}>{client.phone}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editedClient.status}
                    onChange={(e) => setEditedClient({ ...editedClient, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg transition-colors"
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
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                ) : (
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: client.status === 'Ativo' ? '#347474' : '#6C757D' }}
                  >
                    {client.status}
                  </span>
                )}
              </div>

              {/* Notas Administrativas */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Notas Administrativas
                </label>
                {isEditing ? (
                  <textarea
                    value={editedClient.notes}
                    onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg transition-colors resize-none"
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
                ) : (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#F8F9FA' }}>
                    <p className="leading-relaxed" style={{ color: '#6C757D' }}>
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação (quando editando) */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid #DEE2E6' }}>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      color: '#343A40',
                      border: '1px solid #DEE2E6'
                    }}
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
                    onClick={handleSave}
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
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center" style={{ border: '1px solid #DEE2E6' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F8F9FA' }}>
              <FileText size={32} style={{ color: '#6C757D' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>
              Documentos em Breve
            </h3>
            <p className="max-w-md mx-auto leading-relaxed" style={{ color: '#6C757D' }}>
              Em breve, você poderá anexar arquivos e documentos importantes ao prontuário do seu cliente com segurança.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header - Cartão de Visitas */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" style={{ border: '1px solid #DEE2E6' }}>
        <div className="flex justify-between items-start">
          {/* Lado Esquerdo - Informações do Cliente */}
          <div className="flex items-start space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: '#347474' }}
            >
              {getInitials(client.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>
                {client.name}
              </h1>
              <div className="space-y-1" style={{ color: '#6C757D' }}>
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>{client.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Botão com Dropdown */}
          <div className="relative">
            <div className="flex">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-l-lg text-white transition-colors"
                style={{ backgroundColor: '#347474' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d6363';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#347474';
                }}
              >
                Registrar Sessão
              </button>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3 py-2 rounded-r-lg text-white transition-colors border-l border-white border-opacity-20"
                style={{ backgroundColor: '#347474' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d6363';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#347474';
                }}
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-10" style={{ border: '1px solid #DEE2E6' }}>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setActiveTab('details');
                      setIsEditing(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    style={{ color: '#343A40' }}
                  >
                    <Edit size={16} />
                    <span>Editar Cliente</span>
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    style={{ color: '#343A40' }}
                  >
                    <DollarSign size={16} />
                    <span>Ver Histórico Financeiro</span>
                  </button>
                  <div className="border-t my-1" style={{ borderColor: '#DEE2E6' }} />
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors flex items-center space-x-2"
                    style={{ color: '#E76F51' }}
                  >
                    <Archive size={16} />
                    <span>Arquivar Cliente</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="mb-8">
        <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                }`}
                style={{ 
                  color: isActive ? '#343A40' : '#6C757D'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {renderTabContent()}

      {/* Add Session Modal */}
      <AddSessionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientName={client.name}
      />
    </div>
  );
};

export default ClientProfile;