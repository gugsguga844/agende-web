import React, { useState } from 'react';
import { Edit, Phone, Mail, User, Plus, Calendar, FileText } from 'lucide-react';
import AddSessionModal from './AddSessionModal';

const ClientProfile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

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
      notes: 'Sessão muito produtiva. Juliana demonstrou progresso significativo no controle da ansiedade. Trabalhamos técnicas de respiração e ela relatou melhora no sono. Discutimos estratégias para lidar com situações estressantes no trabalho. Ela está mais confiante e conseguindo aplicar as técnicas aprendidas.',
      summary: 'Progresso no controle da ansiedade, melhora no sono...'
    },
    {
      id: 2,
      date: '2024-01-08',
      notes: 'Juliana chegou um pouco tensa hoje. Relatou uma semana difícil no trabalho com muitas demandas. Praticamos exercícios de mindfulness e respiração. Ela conseguiu relaxar durante a sessão e saiu mais tranquila. Reforçamos a importância da prática diária das técnicas.',
      summary: 'Semana difícil no trabalho, praticamos mindfulness...'
    },
    {
      id: 3,
      date: '2024-01-01',
      notes: 'Primeira sessão do ano. Juliana está motivada para continuar o tratamento. Definimos metas para 2024, incluindo manter a regularidade dos exercícios e implementar uma rotina de autocuidado. Ela está confiante e determinada.',
      summary: 'Definimos metas para 2024, paciente motivada...'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8" style={{ border: '1px solid #DEE2E6' }}>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
              <User size={24} style={{ color: '#6C757D' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>{client.name}</h1>
              <div className="flex items-center space-x-4" style={{ color: '#6C757D' }}>
                <div className="flex items-center space-x-1">
                  <Mail size={16} />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone size={16} />
                  <span>{client.phone}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#347474' }}
            >
              {client.status}
            </span>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
              style={{ 
                color: '#343A40',
                border: '1px solid #DEE2E6'
              }}
            >
              <Edit size={16} />
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions History */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>Histórico de Sessões</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
              style={{ backgroundColor: '#347474' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d6363';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#347474';
              }}
            >
              <Plus size={20} />
              <span>Adicionar Nova Sessão</span>
            </button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#347474', opacity: 0.1 }}>
                      <Calendar size={16} style={{ color: '#347474' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#343A40' }}>
                        {new Date(session.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm" style={{ color: '#6C757D' }}>Sessão individual</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ color: '#6C757D' }}>
                  {expandedSession === session.id ? (
                    <p className="leading-relaxed">{session.notes}</p>
                  ) : (
                    <p className="leading-relaxed">{session.summary}</p>
                  )}
                </div>
                
                <button
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  className="mt-3 text-sm font-medium hover:underline"
                  style={{ color: '#347474' }}
                >
                  {expandedSession === session.id ? 'Ver menos' : 'Ver mais'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#343A40' }}>Informações Importantes</h2>
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={20} style={{ color: '#6C757D' }} />
              <h3 className="font-semibold" style={{ color: '#343A40' }}>Notas Fixas</h3>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="leading-relaxed text-sm" style={{ color: '#6C757D' }}>
                {client.notes}
              </p>
            </div>
            <button className="mt-4 text-sm font-medium hover:underline" style={{ color: '#347474' }}>
              Editar notas
            </button>
          </div>
        </div>
      </div>

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