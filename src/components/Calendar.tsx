import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Clock, Plus, X, Coffee, BookOpen, Users as UsersIcon, Video, MapPin } from 'lucide-react';

interface Session {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  client: string;
  clientEmail: string;
  duration: number; // em minutos
  status: 'confirmado' | 'pendente';
  sessionType: 'online' | 'presencial';
  paymentStatus: 'pago' | 'pendente';
  notes: string;
}

interface DragState {
  isDragging: boolean;
  sessionId: number | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  originalDay: string;
  originalTime: string;
  newDay: string;
  newTime: string;
  cardOffsetY?: number; // vertical offset of mouse inside card
}

const Calendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState('weekly');
  const [hoveredSession, setHoveredSession] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sessionId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    originalDay: '',
    originalTime: '',
    newDay: '',
    newTime: ''
  });

  const calendarRef = useRef<HTMLDivElement>(null);

  // Sample data with precise timing
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      day: 'monday',
      startTime: '09:00',
      endTime: '09:50',
      client: 'Juliana Costa',
      clientEmail: 'juliana@email.com',
      duration: 50,
      status: 'confirmado',
      sessionType: 'presencial',
      paymentStatus: 'pago',
      notes: 'Paciente com ansiedade generalizada. Sessão focada em técnicas de respiração.'
    },
    {
      id: 2,
      day: 'monday',
      startTime: '10:30',
      endTime: '11:20',
      client: 'Carlos Mendes',
      clientEmail: 'carlos@email.com',
      duration: 50,
      status: 'confirmado',
      sessionType: 'online',
      paymentStatus: 'pendente',
      notes: 'Acompanhamento pós-trauma. Trabalhando resiliência emocional.'
    },
    {
      id: 3,
      day: 'tuesday',
      startTime: '14:30',
      endTime: '15:20',
      client: 'Maria Santos',
      clientEmail: 'maria@email.com',
      duration: 50,
      status: 'pendente',
      sessionType: 'presencial',
      paymentStatus: 'pago',
      notes: 'Primeira sessão - avaliação inicial completa.'
    },
    {
      id: 4,
      day: 'wednesday',
      startTime: '09:15',
      endTime: '10:05',
      client: 'Pedro Oliveira',
      clientEmail: 'pedro@email.com',
      duration: 50,
      status: 'confirmado',
      sessionType: 'online',
      paymentStatus: 'pago',
      notes: 'Continuidade do tratamento para depressão.'
    },
    {
      id: 5,
      day: 'wednesday',
      startTime: '15:30',
      endTime: '16:20',
      client: 'Ana Rodrigues',
      clientEmail: 'ana@email.com',
      duration: 50,
      status: 'confirmado',
      sessionType: 'presencial',
      paymentStatus: 'pago',
      notes: 'Técnicas de enfrentamento para estresse no trabalho.'
    },
    {
      id: 6,
      day: 'thursday',
      startTime: '10:00',
      endTime: '11:30',
      client: 'João Silva',
      clientEmail: 'joao@email.com',
      duration: 90,
      status: 'confirmado',
      sessionType: 'online',
      paymentStatus: 'pendente',
      notes: 'Terapia cognitivo-comportamental para ansiedade social. Sessão estendida.'
    },
    {
      id: 7,
      day: 'friday',
      startTime: '14:00',
      endTime: '14:50',
      client: 'Carla Ferreira',
      clientEmail: 'carla@email.com',
      duration: 50,
      status: 'confirmado',
      sessionType: 'presencial',
      paymentStatus: 'pago',
      notes: 'Sessão de acompanhamento. Evolução positiva no quadro.'
    }
  ]);

  // Bloqueios de tempo
  const timeBlocks = [
    {
      id: 1,
      day: 'monday',
      time: '12:00',
      type: 'lunch',
      title: 'Almoço',
      duration: '60min'
    },
    {
      id: 2,
      day: 'wednesday',
      time: '13:00',
      type: 'meeting',
      title: 'Reunião de Equipe',
      duration: '60min'
    },
    {
      id: 3,
      day: 'friday',
      time: '16:00',
      type: 'study',
      title: 'Estudo/Atualização',
      duration: '120min'
    }
  ];

  const weekDays = [
    { key: 'monday', label: 'Segunda', date: '15/01' },
    { key: 'tuesday', label: 'Terça', date: '16/01' },
    { key: 'wednesday', label: 'Quarta', date: '17/01' },
    { key: 'thursday', label: 'Quinta', date: '18/01' },
    { key: 'friday', label: 'Sexta', date: '19/01' }
  ];

  const workingHours = { start: 7, end: 19 };
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Utility functions
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const snapToGrid = (minutes: number): number => {
    const snapInterval = 5; // Snap to 5-minute intervals
    return Math.round(minutes / snapInterval) * snapInterval;
  };

  // Calculate position and height for sessions
  const getSessionPosition = (session: Session) => {
    const startMinutes = timeToMinutes(session.startTime);
    const endMinutes = timeToMinutes(session.endTime);
    const dayStartMinutes = workingHours.start * 60; // 7:00 AM
    const dayEndMinutes = workingHours.end * 60; // 7:00 PM
    const totalDayMinutes = dayEndMinutes - dayStartMinutes;
    
    const relativeStartMinutes = startMinutes - dayStartMinutes;
    const sessionDurationMinutes = endMinutes - startMinutes;
    
    const top = (relativeStartMinutes / totalDayMinutes) * 100;
    const height = (sessionDurationMinutes / totalDayMinutes) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  // Get sessions for a specific day
  const getSessionsForDay = (day: string) => {
    return sessions.filter(session => session.day === day);
  };

  const getBlocksForDay = (day: string) => {
    return timeBlocks.filter(block => block.day === day);
  };

  
  const isWorkingHour = (timeString: string) => {
    const hour = parseInt(timeString.split(':')[0]);
    return hour >= workingHours.start && hour < workingHours.end;
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'lunch': return Coffee;
      case 'study': return BookOpen;
      case 'meeting': return UsersIcon;
      default: return Clock;
    }
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'lunch': return '#F4A261';
      case 'study': return '#6C757D';
      case 'meeting': return '#E76F51';
      default: return '#DEE2E6';
    }
  };

  // Reset drag state completely
  const resetDragState = () => {
    setDragState({
      isDragging: false,
      sessionId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      originalDay: '',
      originalTime: '',
      newDay: '',
      newTime: ''
    });
    setHoveredSession(null); // Always clear hover on drag cancel
  };

  // Drag and drop functions
  const handleMouseDown = (e: React.MouseEvent, session: Session) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredSession(null); // Always clear hover on drag start
    // Calculate offset between mouse and top of card
    const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cardOffsetY = e.clientY - cardRect.top;

    setDragState({
      isDragging: true,
      sessionId: session.id,
      startPosition: { x: e.clientX, y: e.clientY },
      currentPosition: { x: e.clientX, y: e.clientY },
      originalDay: session.day,
      originalTime: session.startTime,
      newDay: session.day,
      newTime: session.startTime,
      cardOffsetY
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (dragState.isDragging) {
      setHoveredSession(null); // Always clear hover during drag
    }
    if (dragState.isDragging && calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      // Use offset if present, fallback to 0 for safety
      const offsetY = dragState.cardOffsetY ?? 0;
      const relativeY = e.clientY - offsetY - rect.top;
      
      // CORREÇÃO: Usar largura exata da coluna de horário (120px)
      const timeColumnWidth = 120;
      const dayWidth = (rect.width - timeColumnWidth) / 5;
      const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayWidth);
      const newDay = weekDays[dayIndex]?.key || dragState.originalDay;
      
      // Ajuste: header mais alto para alinhar com 7:00
      const headerHeight = 80;
      const calendarHeight = rect.height - headerHeight;
      const relativeCalendarY = Math.max(0, relativeY - headerHeight);
      
      // CORREÇÃO CRÍTICA: Cálculo mais preciso do tempo
      const totalDayMinutes = (workingHours.end - workingHours.start) * 60; // 12 horas * 60 minutos
      const minutesFromStart = (relativeCalendarY / calendarHeight) * totalDayMinutes;
      const absoluteMinutes = workingHours.start * 60 + minutesFromStart;
      
      // Snap to 5-minute intervals e garantir limites
      const snappedMinutes = snapToGrid(Math.max(workingHours.start * 60, Math.min(workingHours.end * 60 - 30, absoluteMinutes)));
      const newTime = minutesToTime(snappedMinutes);
      
      setDragState(prev => ({
        ...prev,
        currentPosition: { x: e.clientX, y: e.clientY },
        newDay,
        newTime
      }));
    }
  }, [dragState.isDragging, dragState.originalDay, dragState.cardOffsetY, workingHours.start, workingHours.end]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      // CRITICAL FIX: Remove event listeners IMMEDIATELY when mouse is released
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (dragState.newDay !== dragState.originalDay || dragState.newTime !== dragState.originalTime) {
        // Stop dragging but keep the drag data for the modal
        setDragState(prev => ({
          ...prev,
          isDragging: false // STOP DRAGGING IMMEDIATELY
        }));
        setShowConfirmModal(true);
      } else {
        // No change, reset everything
        resetDragState();
      }
    }
  }, [dragState, handleMouseMove]);

  // Add event listeners
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Handle ESC key to cancel drag
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dragState.isDragging) {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          resetDragState();
        }
        if (showConfirmModal) {
          setShowConfirmModal(false);
          resetDragState();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging, showConfirmModal, handleMouseMove, handleMouseUp]);

  const confirmReschedule = () => {
    if (dragState.sessionId) {
      setSessions(prev => prev.map(session => {
        if (session.id === dragState.sessionId) {
          const startMinutes = timeToMinutes(dragState.newTime);
          const endMinutes = startMinutes + session.duration;
          return {
            ...session,
            day: dragState.newDay,
            startTime: dragState.newTime,
            endTime: minutesToTime(endMinutes)
          };
        }
        return session;
      }));
    }
    
    setShowConfirmModal(false);
    resetDragState();
  };

  const cancelReschedule = () => {
    setShowConfirmModal(false);
    resetDragState();
  };

  const handleTimeSlotClick = (day: string, time: string) => {
    if (!isWorkingHour(time)) return;
    
    const existingSession = getSessionsForDay(day).find(s => {
      const sessionStart = timeToMinutes(s.startTime);
      const sessionEnd = timeToMinutes(s.endTime);
      const clickTime = timeToMinutes(time);
      return clickTime >= sessionStart && clickTime < sessionEnd;
    });
    
    const existingBlock = getBlocksForDay(day).find(b => b.time === time);
    
    if (!existingSession && !existingBlock) {
      setSelectedTimeSlot({ day, time });
      setShowBlockModal(true);
    }
  };

  const getDraggedSession = () => {
    return sessions.find(s => s.id === dragState.sessionId);
  };

  // Calculate new end time for dragged session
  const getDraggedSessionNewEndTime = () => {
    const session = getDraggedSession();
    if (!session) return '';
    
    const startMinutes = timeToMinutes(dragState.newTime);
    const endMinutes = startMinutes + session.duration;
    return minutesToTime(endMinutes);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Agenda</h1>
        
        <div className="flex items-center space-x-4">
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
      <div 
        ref={calendarRef}
        className="bg-white rounded-xl shadow-sm overflow-hidden" 
        style={{ border: '1px solid #DEE2E6' }}
      >
        {/* Header with days and workload indicators */}
        <div className="grid" style={{ 
          gridTemplateColumns: '120px repeat(5, 1fr)',
          borderBottom: '1px solid #DEE2E6' 
        }}>
          <div className="p-4" style={{ backgroundColor: '#F8F9FA', borderRight: '1px solid #DEE2E6' }}>
            <span className="text-sm font-medium" style={{ color: '#6C757D' }}>Horário</span>
          </div>
          {weekDays.map((day, index) => (
  <div
    key={day.key}
    className="p-4 text-center"
    style={{
      backgroundColor: '#F8F9FA',
      borderRight: index < weekDays.length - 1 ? '1px solid #DEE2E6' : 'none',
    }}
  >
    <div className="font-semibold" style={{ color: '#343A40' }}>{day.label}</div>
    <div className="text-sm" style={{ color: '#6C757D' }}>{day.date}</div>
  </div>
))}
        </div>

        {/* Time slots with absolute positioned sessions */}
        <div className="relative" style={{ height: '720px' }}>
          {/* Time labels */}
          <div className="absolute left-0 top-0 bottom-0" style={{ width: '120px', zIndex: 10 }}>
            {timeSlots.map((time, index) => (
              <div 
                key={time}
                className="absolute text-sm font-medium text-center"
                style={{ 
                  top: `${(index / timeSlots.length) * 100}%`,
                  height: `${100 / timeSlots.length}%`,
                  backgroundColor: '#F8F9FA',
                  borderRight: '1px solid #DEE2E6',
                  borderBottom: index < timeSlots.length - 1 ? '1px solid #DEE2E6' : 'none',
                  color: isWorkingHour(time) ? '#6C757D' : '#ADB5BD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '120px'
                }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="absolute top-0 bottom-0 right-0" style={{ left: '120px' }}>
            <div className="grid grid-cols-5 h-full">
              {weekDays.map((day, dayIndex) => (
                <div 
                  key={day.key}
                  className="relative"
                  style={{ 
                    borderRight: dayIndex < weekDays.length - 1 ? '1px solid #DEE2E6' : 'none'
                  }}
                >
                  {/* Hour lines */}
                  {timeSlots.map((time, index) => (
                    <div
                      key={`${day.key}-${time}`}
                      className="absolute w-full cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        top: `${(index / timeSlots.length) * 100}%`,
                        height: `${100 / timeSlots.length}%`,
                        borderBottom: index < timeSlots.length - 1 ? '1px solid #DEE2E6' : 'none',
                        backgroundColor: !isWorkingHour(time) ? '#FAFBFC' : 'transparent'
                      }}
                      onClick={() => handleTimeSlotClick(day.key, time)}
                    />
                  ))}

                  {/* Sessions */}
                  {getSessionsForDay(day.key).map((session) => {
                    const position = getSessionPosition(session);
                    const isDragging = dragState.isDragging && dragState.sessionId === session.id;
                    const SessionIcon = session.sessionType === 'online' ? Video : MapPin;
                    const isHovered = hoveredSession === session.id;
                    
                    return (
                      <div
                        key={session.id}
                        className={`absolute w-full px-1 ${isDragging ? 'opacity-50' : ''}`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: isDragging ? 50 : 20
                        }}
                      >
                        <div
                          className="h-full p-2 rounded-lg cursor-move transition-all duration-200 border-l-4 shadow-sm"
                          style={{
                            backgroundColor: session.status === 'confirmado' ? 'rgba(52, 116, 116, 0.1)' : 'rgba(244, 162, 97, 0.1)',
                            borderLeftColor: session.status === 'confirmado' ? '#347474' : '#F4A261',
                            border: isDragging ? '2px dashed #347474' : undefined,
                            // Hover effects - IMMEDIATE, NO TIMER
                            transform: isHovered && !isDragging ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: isHovered && !isDragging 
                              ? '0 8px 25px rgba(0, 0, 0, 0.15)' 
                              : isDragging 
                                ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                                : '0 2px 4px rgba(0, 0, 0, 0.05)',
                            cursor: isDragging ? 'grabbing' : 'grab'
                          }}
                          onMouseDown={(e) => handleMouseDown(e, session)}
                          onMouseEnter={e => {
                            if (!dragState.isDragging) {
                              // IMMEDIATE hover effect for animation
                              setHoveredSession(session.id);
                              
                              // Clear any existing timer
                              if (hoverTimerRef.current) {
                                clearTimeout(hoverTimerRef.current);
                              }
                              // Set a new timer ONLY for the popover
                              hoverTimerRef.current = setTimeout(() => {
                                setMousePosition({ x: e.clientX, y: e.clientY });
                              }, 1000); // 1 second delay for popover
                            }
                          }}
                          onMouseMove={e => {
                            if (!dragState.isDragging && hoveredSession === session.id) {
                              setMousePosition({ x: e.clientX, y: e.clientY });
                            }
                          }}
                          onMouseLeave={e => {
                            // Clear the timer if mouse leaves before delay completes
                            if (hoverTimerRef.current) {
                              clearTimeout(hoverTimerRef.current);
                              hoverTimerRef.current = null;
                            }
                            setHoveredSession(null);
                          }}
                        >
                          {/* Session header */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              <SessionIcon size={12} style={{ color: session.sessionType === 'online' ? '#347474' : '#F4A261' }} />
                              <span className="text-xs font-medium" style={{ color: '#343A40' }}>
                                {session.startTime} - {session.endTime}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: '#6C757D' }}>
                              ({session.duration}min)
                            </span>
                          </div>
                          
                          {/* Client name */}
                          <div className="font-medium text-sm mb-1" style={{ color: '#343A40' }}>
                            {session.client}
                          </div>
                          

                        </div>
                      </div>
                    );
                  })}

                  {/* Time blocks */}
                  {getBlocksForDay(day.key).map((block) => {
                    const BlockIcon = getBlockIcon(block.type);
                    const startMinutes = timeToMinutes(block.time);
                    const duration = parseInt(block.duration.replace('min', ''));
                    const dayStartMinutes = workingHours.start * 60;
                    const dayEndMinutes = workingHours.end * 60;
                    const totalDayMinutes = dayEndMinutes - dayStartMinutes;
                    
                    const relativeStartMinutes = startMinutes - dayStartMinutes;
                    const top = (relativeStartMinutes / totalDayMinutes) * 100;
                    const height = (duration / totalDayMinutes) * 100;
                    
                    return (
                      <div
                        key={block.id}
                        className="absolute w-full px-1"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          zIndex: 10
                        }}
                      >
                        <div
                          className="h-full p-2 rounded-lg border-l-4"
                          style={{
                            backgroundColor: `${getBlockColor(block.type)}20`,
                            borderLeftColor: getBlockColor(block.type)
                          }}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <BlockIcon size={12} style={{ color: getBlockColor(block.type) }} />
                            <span className="text-xs" style={{ color: '#6C757D' }}>{block.duration}</span>
                          </div>
                          <div className="font-medium text-sm" style={{ color: '#343A40' }}>{block.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Popover - Only shows after timer delay */}
      {hoveredSession && !dragState.isDragging && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl p-4 max-w-sm"
          style={{ 
            left: mousePosition.x + 10,
            top: mousePosition.y - 100,
            border: '1px solid #DEE2E6'
          }}
        >
          {(() => {
            const session = sessions.find(s => s.id === hoveredSession);
            if (!session) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: '#343A40' }}>{session.client}</h4>
                  <div className="flex items-center space-x-1">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: session.sessionType === 'online' ? 'rgba(52, 116, 116, 0.1)' : 'rgba(244, 162, 97, 0.1)',
                        color: session.sessionType === 'online' ? '#347474' : '#F4A261'
                      }}
                    >
                      {session.sessionType === 'online' ? 'Online' : 'Presencial'}
                    </span>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: session.paymentStatus === 'pago' ? 'rgba(52, 116, 116, 0.1)' : 'rgba(244, 162, 97, 0.1)',
                        color: session.paymentStatus === 'pago' ? '#347474' : '#F4A261'
                      }}
                    >
                      {session.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: '#6C757D' }}>{session.clientEmail}</p>
                <p className="text-sm mb-3" style={{ color: '#6C757D' }}>{session.notes}</p>
                <button 
                  className="w-full px-3 py-2 rounded-lg text-white transition-colors text-sm"
                  style={{ backgroundColor: '#347474' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6363';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#347474';
                  }}
                >
                  Ver Prontuário
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Drag Preview - Only show when actively dragging */}
      {dragState.isDragging && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: dragState.currentPosition.x - 100, // Reduced from 120
            top: dragState.currentPosition.y - (dragState.cardOffsetY ?? 40)
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-3 border-l-4 border-2 border-dashed min-w-[200px]" style={{ // Reduced from 240px
            borderColor: '#347474',
            borderLeftColor: getDraggedSession()?.status === 'confirmado' ? '#347474' : '#F4A261'
          }}>
            {(() => {
              const session = getDraggedSession();
              if (!session) return null;
              
              const SessionIcon = session.sessionType === 'online' ? Video : MapPin;
              const newEndTime = getDraggedSessionNewEndTime();
              
              return (
                <>
                  {/* Session header with updated times */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <SessionIcon size={12} style={{ color: session.sessionType === 'online' ? '#347474' : '#F4A261' }} />
                      <span className="text-xs font-medium" style={{ color: '#343A40' }}>
                        {dragState.newTime} - {newEndTime}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#6C757D' }}>
                      ({session.duration}min)
                    </span>
                  </div>
                  
                  {/* Client name */}
                  <div className="font-medium text-sm mb-1" style={{ color: '#343A40' }}>
                    {session.client}
                  </div>
                  
                  {/* Day indicator */}
                  <div className="text-xs" style={{ color: '#6C757D' }}>
                    {weekDays.find(d => d.key === dragState.newDay)?.label}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#343A40' }}>
              Confirmar Reagendamento
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6C757D' }}>
              Deseja reagendar a sessão com <strong>{getDraggedSession()?.client}</strong> para{' '}
              <strong>{weekDays.find(d => d.key === dragState.newDay)?.label}</strong> às{' '}
              <strong>{dragState.newTime}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelReschedule}
                className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                style={{ 
                  color: '#343A40',
                  border: '1px solid #DEE2E6'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmReschedule}
                className="px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#347474' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d6363';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#347474';
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Creation Modal */}
      {showBlockModal && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                Bloquear Horário
              </h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="hover:bg-gray-100 rounded-lg p-1 transition-colors"
                style={{ color: '#6C757D' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm mb-4" style={{ color: '#6C757D' }}>
              {weekDays.find(d => d.key === selectedTimeSlot.day)?.label} às {selectedTimeSlot.time}
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowBlockModal(false)}
                className="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #DEE2E6' }}
              >
                <div className="flex items-center space-x-3">
                  <Coffee size={20} style={{ color: '#F4A261' }} />
                  <span style={{ color: '#343A40' }}>Almoço</span>
                </div>
              </button>
              
              <button 
                onClick={() => setShowBlockModal(false)}
                className="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #DEE2E6' }}
              >
                <div className="flex items-center space-x-3">
                  <UsersIcon size={20} style={{ color: '#E76F51' }} />
                  <span style={{ color: '#343A40' }}>Reunião</span>
                </div>
              </button>
              
              <button 
                onClick={() => setShowBlockModal(false)}
                className="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #DEE2E6' }}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen size={20} style={{ color: '#6C757D' }} />
                  <span style={{ color: '#343A40' }}>Estudo/Atualização</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
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
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm border-l-4" style={{ 
              backgroundColor: 'rgba(108, 117, 125, 0.2)',
              borderLeftColor: '#6C757D'
            }}></div>
            <span className="text-sm" style={{ color: '#6C757D' }}>Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;