import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Clock } from 'lucide-react';

const CalendarBackup: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState('weekly');

  // Sample data for the calendar
  const sessions = [
    {
      id: 1,
      day: 'monday',
      time: '09:00',
      client: 'Juliana Costa',
      duration: '50min',
      status: 'confirmado'
    },
    {
      id: 2,
      day: 'monday',
      time: '10:30',
      client: 'Carlos Mendes',
      duration: '50min',
      status: 'confirmado'
    },
    {
      id: 3,
      day: 'tuesday',
      time: '14:00',
      client: 'Maria Santos',
      duration: '50min',
      status: 'pendente'
    },
    {
      id: 4,
      day: 'wednesday',
      time: '09:00',
      client: 'Pedro Oliveira',
      duration: '50min',
      status: 'confirmado'
    },
    {
      id: 5,
      day: 'wednesday',
      time: '15:30',
      client: 'Ana Rodrigues',
      duration: '50min',
      status: 'confirmado'
    },
    {
      id: 6,
      day: 'thursday',
      time: '10:00',
      client: 'João Silva',
      duration: '50min',
      status: 'confirmado'
    },
    {
      id: 7,
      day: 'friday',
      time: '14:00',
      client: 'Carla Ferreira',
      duration: '50min',
      status: 'confirmado'
    }
  ];

  const weekDays = [
    { key: 'monday', label: 'Segunda', date: '15/01' },
    { key: 'tuesday', label: 'Terça', date: '16/01' },
    { key: 'wednesday', label: 'Quarta', date: '17/01' },
    { key: 'thursday', label: 'Quinta', date: '18/01' },
    { key: 'friday', label: 'Sexta', date: '19/01' }
  ];

  const getSessionsForDay = (day: string) => {
    return sessions.filter(session => session.day === day);
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Agenda</h1>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <div className="flex rounded-lg p-1" style={{ backgroundColor: '#F8F9FA' }}>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'weekly' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
              style={{ 
                color: viewMode === 'weekly' ? '#343A40' : '#6C757D'
              }}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'monthly' 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-gray-200'
              }`}
              style={{ 
                color: viewMode === 'monthly' ? '#343A40' : '#6C757D'
              }}
            >
              Mensal
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6C757D' }}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
            15 - 19 Janeiro 2024
          </h2>
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6C757D' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button 
          className="px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#347474' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d6363';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#347474';
          }}
        >
          Novo Agendamento
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        {/* Header with days */}
        <div className="grid grid-cols-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <div className="p-4" style={{ backgroundColor: '#F8F9FA', borderRight: '1px solid #DEE2E6' }}>
            <span className="text-sm font-medium" style={{ color: '#6C757D' }}>Horário</span>
          </div>
          {weekDays.map((day) => (
            <div key={day.key} className="p-4 text-center" style={{ 
              backgroundColor: '#F8F9FA', 
              borderRight: day.key !== 'friday' ? '1px solid #DEE2E6' : 'none'
            }}>
              <div className="font-semibold" style={{ color: '#343A40' }}>{day.label}</div>
              <div className="text-sm" style={{ color: '#6C757D' }}>{day.date}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
              <div className="p-4 text-sm font-medium" style={{ 
                backgroundColor: '#F8F9FA', 
                borderRight: '1px solid #DEE2E6',
                color: '#6C757D'
              }}>
                {time}
              </div>
              {weekDays.map((day) => {
                const daySession = getSessionsForDay(day.key).find(s => s.time === time);
                return (
                  <div key={`${day.key}-${time}`} className="p-2 min-h-[60px]" style={{ 
                    borderRight: day.key !== 'friday' ? '1px solid #DEE2E6' : 'none'
                  }}>
                    {daySession && (
                      <div 
                        className={`p-2 rounded-lg cursor-pointer transition-colors border-l-4`}
                        style={{
                          backgroundColor: daySession.status === 'confirmado' ? 'rgba(52, 116, 116, 0.1)' : 'rgba(244, 162, 97, 0.1)',
                          borderLeftColor: daySession.status === 'confirmado' ? '#347474' : '#F4A261'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = daySession.status === 'confirmado' ? 'rgba(52, 116, 116, 0.2)' : 'rgba(244, 162, 97, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = daySession.status === 'confirmado' ? 'rgba(52, 116, 116, 0.1)' : 'rgba(244, 162, 97, 0.1)';
                        }}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock size={12} style={{ color: '#6C757D' }} />
                          <span className="text-xs" style={{ color: '#6C757D' }}>{daySession.duration}</span>
                        </div>
                        <div className="font-medium text-sm" style={{ color: '#343A40' }}>{daySession.client}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-sm border-l-4" style={{ 
            backgroundColor: 'rgba(52, 116, 116, 0.1)',
            borderLeftColor: '#347474'
          }}></div>
          <span className="text-sm" style={{ color: '#6C757D' }}>Confirmado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-sm border-l-4" style={{ 
            backgroundColor: 'rgba(244, 162, 97, 0.1)',
            borderLeftColor: '#F4A261'
          }}></div>
          <span className="text-sm" style={{ color: '#6C757D' }}>Pendente</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarBackup;