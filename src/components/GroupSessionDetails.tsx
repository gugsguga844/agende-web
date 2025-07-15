import React, { useState } from 'react';
import { X, Users, Calendar, Clock, MapPin, Video, DollarSign, Edit, FileText, User, ChevronLeft } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  email: string;
}

interface GroupSessionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData?: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    participants: Participant[];
    sessionType: 'presencial' | 'online';
    paymentStatus: 'pago' | 'pendente';
    notes: string;
  };
  onNavigateToClient?: (clientId: number) => void;
}

const GroupSessionDetails: React.FC<GroupSessionDetailsProps> = ({ 
  isOpen, 
  onClose, 
  sessionData,
  onNavigateToClient 
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(sessionData?.notes || '');

  if (!isOpen || !sessionData) return null;

  const handleSaveNotes = () => {
    // Here you would save the notes to the backend
    console.log('Saving notes:', editedNotes);
    setIsEditingNotes(false);
  };

  const handleCancelEdit = () => {
    setEditedNotes(sessionData.notes);
    setIsEditingNotes(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const SessionTypeIcon = sessionData.sessionType === 'online' ? Video : MapPin;
  const sessionTypeColor = sessionData.sessionType === 'online' ? '#347474' : '#F4A261';
  const paymentStatusColor = sessionData.paymentStatus === 'pago' ? '#347474' : '#F4A261';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
              <Users size={24} style={{ color: '#347474' }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
                Detalhes da Sessão em Grupo
              </h2>
              <p className="text-sm" style={{ color: '#6C757D' }}>
                {sessionData.participants.length} participantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-1 transition-colors"
            style={{ color: '#6C757D' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Info Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#343A40' }}>
              Informações da Sessão
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6C757D' }}>
                    Tema da Sessão
                  </label>
                  <p className="font-medium" style={{ color: '#343A40' }}>
                    {sessionData.title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6C757D' }}>
                    Data e Horário
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} style={{ color: '#6C757D' }} />
                    <span style={{ color: '#343A40' }}>
                      {formatDate(sessionData.date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock size={16} style={{ color: '#6C757D' }} />
                    <span style={{ color: '#343A40' }}>
                      {sessionData.startTime} - {sessionData.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6C757D' }}>
                    Tipo de Sessão
                  </label>
                  <div className="flex items-center space-x-2">
                    <SessionTypeIcon size={16} style={{ color: sessionTypeColor }} />
                    <span style={{ color: '#343A40' }}>
                      {sessionData.sessionType === 'online' ? 'Online' : 'Presencial'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6C757D' }}>
                    Status do Pagamento
                  </label>
                  <span 
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${paymentStatusColor}15`,
                      color: paymentStatusColor
                    }}
                  >
                    <DollarSign size={12} />
                    <span>{sessionData.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#343A40' }}>
              Participantes ({sessionData.participants.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionData.participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="bg-white rounded-lg p-4 border transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #DEE2E6' }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: '#347474' }}
                    >
                      {getInitials(participant.name)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: '#343A40' }}>
                        {participant.name}
                      </h4>
                      <p className="text-sm" style={{ color: '#6C757D' }}>
                        {participant.email}
                      </p>
                    </div>
                  </div>
                  
                  {onNavigateToClient && (
                    <button
                      onClick={() => onNavigateToClient(participant.id)}
                      className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                      style={{ 
                        color: '#347474',
                        border: '1px solid #DEE2E6'
                      }}
                    >
                      <User size={14} />
                      <span className="text-sm font-medium">Ver Prontuário</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                Notas da Sessão em Grupo
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                  style={{ 
                    color: '#347474',
                    border: '1px solid #DEE2E6'
                  }}
                >
                  <Edit size={16} />
                  <span className="text-sm font-medium">Editar</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
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
                  placeholder="Descreva a dinâmica do grupo, temas discutidos, intervenções realizadas..."
                />
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                    style={{ 
                      color: '#343A40',
                      border: '1px solid #DEE2E6'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: '#347474' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d6363';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#347474';
                    }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg p-4" style={{ backgroundColor: '#F8F9FA' }}>
                <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#6C757D' }}>
                  {sessionData.notes || 'Nenhuma nota adicionada para esta sessão em grupo.'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4" style={{ borderTop: '1px solid #DEE2E6' }}>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
              style={{ 
                color: '#343A40',
                border: '1px solid #DEE2E6'
              }}
            >
              <ChevronLeft size={16} />
              <span>Voltar</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                style={{ 
                  color: '#347474',
                  border: '1px solid #DEE2E6'
                }}
              >
                <FileText size={16} />
                <span>Gerar Relatório</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSessionDetails;