import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, X, Coffee, BookOpen, Users as UsersIcon, Video, MapPin, DollarSign, Trash2, MoreHorizontal, Plus, ChevronDown, Palette, Smile } from 'lucide-react';

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

interface TimeBlock {
  id: number;
  day: string;
  time: string;
  endTime: string;
  type: string;
  title: string;
  duration: string;
  color?: string;
  emoji?: string;
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
  const [actionMenuSessionId, setActionMenuSessionId] = useState<number | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string } | null>(null);
  const [blockForm, setBlockForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    color: '#8390FA',
    emoji: ''
  });

  const menuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const menuDropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const createMenuRef = useRef<HTMLDivElement>(null);
  
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

  // Bloqueios de tempo com cores personalizadas
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: 1,
      day: 'monday',
      time: '12:00',
      endTime: '13:00',
      type: 'lunch',
      title: 'Almoço',
      duration: '60min',
      color: '#8390FA',
      emoji: '🍽️'
    },
    {
      id: 2,
      day: 'wednesday',
      time: '13:00',
      endTime: '14:00',
      type: 'meeting',
      title: 'Reunião de Equipe',
      duration: '60min',
      color: '#E76F51',
      emoji: '👥'
    },
    {
      id: 3,
      day: 'friday',
      time: '16:00',
      endTime: '18:00',
      type: 'study',
      title: 'Estudo/Atualização',
      duration: '120min',
      color: '#6C757D',
      emoji: '📚'
    }
  ]);

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

  // Cores predefinidas para bloqueios
  const predefinedColors = [
    '#8390FA', // Azul lavanda
    '#E76F51', // Terracota
    '#6C757D', // Cinza
    '#F4A261', // Laranja
    '#2A9D8F', // Verde água
    '#E9C46A', // Amarelo
    '#264653', // Verde escuro
    '#F72585'  // Rosa
  ];

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

  // Calculate position for time blocks
  const getBlockPosition = (block: TimeBlock) => {
    const startMinutes = timeToMinutes(block.time);
    const endMinutes = timeToMinutes(block.endTime);
    const dayStartMinutes = workingHours.start * 60;
    const dayEndMinutes = workingHours.end * 60;
    const totalDayMinutes = dayEndMinutes - dayStartMinutes;
    
    const relativeStartMinutes = startMinutes - dayStartMinutes;
    const blockDurationMinutes = endMinutes - startMinutes;
    
    const top = (relativeStartMinutes / totalDayMinutes) * 100;
    const height = (blockDurationMinutes / totalDayMinutes) * 100;
    
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
  };

  // Drag and drop functions
  const handleMouseDown = (e: React.MouseEvent, session: Session) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    if (dragState.isDragging && calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const offsetY = dragState.cardOffsetY ?? 0;
      const relativeY = e.clientY - offsetY - rect.top;
      
      const timeColumnWidth = 120;
      const dayWidth = (rect.width - timeColumnWidth) / 5;
      const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayWidth);
      const newDay = weekDays[dayIndex]?.key || dragState.originalDay;
      
      const headerHeight = 80;
      const calendarHeight = 960;
      const relativeCalendarY = Math.max(0, relativeY - headerHeight);
      
      const totalDayMinutes = (workingHours.end - workingHours.start) * 60;
      const minutesFromStart = (relativeCalendarY / calendarHeight) * totalDayMinutes;
      const absoluteMinutes = workingHours.start * 60 + minutesFromStart;
      
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (dragState.newDay !== dragState.originalDay || dragState.newTime !== dragState.originalTime) {
        setDragState(prev => ({
          ...prev,
          isDragging: false
        }));
        setShowConfirmModal(true);
      } else {
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
        if (actionMenuSessionId) {
          setActionMenuSessionId(null);
        }
        if (showCreateMenu) {
          setShowCreateMenu(false);
        }
        if (showBlockModal) {
          setShowBlockModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging, showConfirmModal, actionMenuSessionId, showCreateMenu, showBlockModal, handleMouseMove, handleMouseUp]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuSessionId) {
        const menu = menuDropdownRefs.current[actionMenuSessionId];
        const button = menuButtonRefs.current[actionMenuSessionId];
        
        if (menu && !menu.contains(e.target as Node) && 
            button && !button.contains(e.target as Node)) {
          setActionMenuSessionId(null);
        }
      }

      if (showCreateMenu && createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionMenuSessionId, showCreateMenu]);

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
    
    const existingBlock = getBlocksForDay(day).find(b => {
      const blockStart = timeToMinutes(b.time);
      const blockEnd = timeToMinutes(b.endTime);
      const clickTime = timeToMinutes(time);
      return clickTime >= blockStart && clickTime < blockEnd;
    });
    
    if (!existingSession && !existingBlock) {
      setSelectedTimeSlot({ day, time });
      setBlockForm({
        title: '',
        startTime: time,
        endTime: minutesToTime(timeToMinutes(time) + 60), // Default 1 hour
        color: '#8390FA',
        emoji: ''
      });
      setShowBlockModal(true);
    }
  };

  const handleCreateBlock = () => {
    if (!selectedTimeSlot || !blockForm.title.trim()) return;

    const newBlock: TimeBlock = {
      id: Date.now(),
      day: selectedTimeSlot.day,
      time: blockForm.startTime,
      endTime: blockForm.endTime,
      type: 'custom',
      title: blockForm.title,
      duration: `${timeToMinutes(blockForm.endTime) - timeToMinutes(blockForm.startTime)}min`,
      color: blockForm.color,
      emoji: blockForm.emoji
    };

    setTimeBlocks(prev => [...prev, newBlock]);
    setShowBlockModal(false);
    setSelectedTimeSlot(null);
    setBlockForm({
      title: '',
      startTime: '',
      endTime: '',
      color: '#8390FA',
      emoji: ''
    });
  };

  const getDraggedSession = () => {
    return sessions.find(s => s.id === dragState.sessionId);
  };

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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
        
        {/* Novo Botão Unificado */}
        <div className="relative" ref={createMenuRef}>
          <div className="flex">
            <button 
              onClick={() => console.log('Agendar Sessão')}
              className="px-4 py-2 rounded-l-lg text-white transition-colors"
              style={{ backgroundColor: '#347474' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d6363';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#347474';
              }}
            >
              <Plus size={20} className="inline mr-2" />
              Novo
            </button>
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
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

          {/* Menu Dropdown */}
          {showCreateMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50" style={{ border: '1px solid #DEE2E6' }}>
              <div className="py-2">
                <button
                  onClick={() => {
                    console.log('Agendar Sessão');
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  style={{ color: '#343A40' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                    <Clock size={16} style={{ color: '#347474' }} />
                  </div>
                  <div>
                    <div className="font-medium">Agendar Sessão</div>
                    <div className="text-xs" style={{ color: '#6C757D' }}>Criar agendamento com cliente</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeSlot({ day: 'monday', time: '09:00' });
                    setBlockForm({
                      title: '',
                      startTime: '09:00',
                      endTime: '10:00',
                      color: '#8390FA',
                      emoji: ''
                    });
                    setShowBlockModal(true);
                    setShowCreateMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  style={{ color: '#343A40' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(131, 144, 250, 0.1)' }}>
                    <X size={16} style={{ color: '#8390FA' }} />
                  </div>
                  <div>
                    <div className="font-medium">Bloquear Horário</div>
                    <div className="text-xs" style={{ color: '#6C757D' }}>Criar bloqueio personalizado</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="bg-white rounded-xl shadow-sm overflow-visible" 
        style={{ border: '1px solid #DEE2E6' }}
      >
        {/* Header with days */}
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
        <div className="relative" style={{ height: '960px' }}>
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
                    const iconColor = session.paymentStatus === 'pago' ? '#347474' : '#F4A261';
                    const isMenuOpen = actionMenuSessionId === session.id;

                    const handleCardMouseDown = (e: React.MouseEvent) => {
                      const btn = menuButtonRefs.current[session.id];
                      const menu = menuDropdownRefs.current[session.id];
                      if (
                        btn?.contains(e.target as Node) ||
                        menu?.contains(e.target as Node)
                      ) {
                        return;
                      }
                      handleMouseDown(e, session);
                    };

                    return (
                      <div
                        key={session.id}
                        className={`absolute w-full px-1 ${isDragging ? 'opacity-50' : ''}`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: isDragging ? 50 : isMenuOpen ? 30 : 20
                        }}
                      >
                        <div
                          className="h-full p-2 rounded-lg cursor-move transition-all duration-200 border-l-4 shadow-sm group hover:shadow-md hover:-translate-y-0.5"
                          style={{
                            backgroundColor: session.paymentStatus === 'pago' ? 'rgba(52, 116, 116, 0.13)' : 'rgba(244, 162, 97, 0.13)',
                            borderLeftColor: session.paymentStatus === 'pago' ? '#347474' : '#F4A261',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                          }}
                          onMouseDown={handleCardMouseDown}
                        >
                          {/* Linha 1: Ícone, Tempo e Duração */}
                          <div className="flex items-center justify-between mb-0.5 w-full">
                            <SessionIcon size={16} style={{ color: iconColor }} />
                            <span className="text-xs font-medium text-center flex-1 mx-1" style={{ color: '#343A40' }}>
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="text-xs" style={{ color: '#6C757D' }}>
                              ({session.duration}min)
                            </span>
                          </div>

                          {/* Linha 2: Cliente e Menu */}
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm truncate flex-1" style={{ color: '#343A40' }}>
                              {session.client}
                            </div>
                            <div className="relative">
                              <button
                                ref={el => (menuButtonRefs.current[session.id] = el)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-full hover:bg-white/50 ml-1"
                                style={{ color: '#6C757D' }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setActionMenuSessionId(session.id === actionMenuSessionId ? null : session.id);
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              
                              {/* Menu de ações */}
                              {isMenuOpen && (
                                <div
                                  ref={el => (menuDropdownRefs.current[session.id] = el)}
                                  className="absolute right-0 bottom-8 bg-white rounded-lg shadow-xl border z-50 min-w-[200px]"
                                  style={{ border: '1px solid #DEE2E6' }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button
                                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                                    style={{ color: '#343A40' }}
                                    onClick={() => {
                                      console.log('Ver Prontuário');
                                      setActionMenuSessionId(null);
                                    }}
                                  >
                                    <BookOpen size={16} className="mr-2" /> Ver Prontuário
                                  </button>
                                  <button
                                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                                    style={{ color: '#343A40' }}
                                    onClick={() => {
                                      console.log('Editar Horário');
                                      setActionMenuSessionId(null);
                                    }}
                                  >
                                    <Clock size={16} className="mr-2" /> Editar Horário
                                  </button>
                                  <button
                                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50"
                                    style={{ color: '#347474' }}
                                    onClick={() => {
                                      console.log('Registrar Pagamento');
                                      setActionMenuSessionId(null);
                                    }}
                                  >
                                    <DollarSign size={16} className="mr-2" /> Registrar Pagamento
                                  </button>
                                  <div className="border-t my-1 border-gray-200" />
                                  <button
                                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-red-50 rounded-b-lg"
                                    style={{ color: '#E76F51' }}
                                    onClick={() => {
                                      console.log('Cancelar Sessão');
                                      setActionMenuSessionId(null);
                                    }}
                                  >
                                    <Trash2 size={16} className="mr-2" /> Cancelar Sessão
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Time blocks */}
                  {getBlocksForDay(day.key).map((block) => {
                    const position = getBlockPosition(block);
                    
                    return (
                      <div
                        key={block.id}
                        className="absolute w-full px-1"
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: 10
                        }}
                      >
                        <div
                          className="h-full p-2 rounded-lg border-l-4"
                          style={{
                            backgroundColor: `${block.color}20`,
                            borderLeftColor: block.color
                          }}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            {block.emoji && <span className="text-xs">{block.emoji}</span>}
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

      {/* Drag Preview */}
      {dragState.isDragging && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: dragState.currentPosition.x - 80,
            top: dragState.currentPosition.y - (dragState.cardOffsetY ?? 40)
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-3 border-l-4 border-2 border-dashed min-w-[160px]" style={{
            backgroundColor: getDraggedSession()?.paymentStatus === 'pago'
              ? 'rgba(52, 116, 116, 0.13)'
              : 'rgba(244, 162, 97, 0.13)',
            borderColor: getDraggedSession()?.paymentStatus === 'pago' ? '#347474' : '#F4A261',
            borderLeftColor: getDraggedSession()?.paymentStatus === 'pago' ? '#347474' : '#F4A261'
          }}>
            {(() => {
              const session = getDraggedSession();
              if (!session) return null;
              
              const SessionIcon = session.sessionType === 'online' ? Video : MapPin;
              const newEndTime = getDraggedSessionNewEndTime();
              const iconColor = session.paymentStatus === 'pago' ? '#347474' : '#F4A261';
              
              return (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <SessionIcon size={12} style={{ color: iconColor }} />
                    <span className="text-xs font-medium text-center flex-1 mx-1" style={{ color: '#343A40' }}>
                      {dragState.newTime} - {newEndTime}
                    </span>
                    <span className="text-xs" style={{ color: '#6C757D' }}>
                      ({session.duration}min)
                    </span>
                  </div>
                  
                  <div className="font-medium text-sm mb-1" style={{ color: '#343A40' }}>
                    {session.client}
                  </div>
                  
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
                className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                style={{ 
                  color: '#343A40',
                  border: '1px solid #DEE2E6'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmReschedule}
                className="px-3 py-2 rounded-lg text-white transition-colors"
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

      {/* Novo Modal de Bloqueio de Tempo */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: '#343A40' }}>
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
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateBlock(); }} className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Título do Bloqueio
                </label>
                <input
                  id="title"
                  type="text"
                  value={blockForm.title}
                  onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
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
                  placeholder="Ex: Almoço, Supervisão, Foco Profundo..."
                  required
                />
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Hora de Início
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
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
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Hora de Fim
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
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
                    required
                  />
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                  Cor do Bloqueio
                </label>
                <div className="flex items-center space-x-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBlockForm({ ...blockForm, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        blockForm.color === color ? 'scale-110 shadow-md' : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        borderColor: blockForm.color === color ? '#343A40' : 'transparent'
                      }}
                    />
                  ))}
                  <div className="flex items-center space-x-2 ml-4">
                    <Palette size={16} style={{ color: '#6C757D' }} />
                    <input
                      type="color"
                      value={blockForm.color}
                      onChange={(e) => setBlockForm({ ...blockForm, color: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ border: '1px solid #DEE2E6' }}
                    />
                  </div>
                </div>
              </div>

              {/* Emoji (Opcional) */}
              <div>
                <label htmlFor="emoji" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Emoji (Opcional)
                </label>
                <div className="flex items-center space-x-2">
                  <Smile size={16} style={{ color: '#6C757D' }} />
                  <input
                    id="emoji"
                    type="text"
                    value={blockForm.emoji}
                    onChange={(e) => setBlockForm({ ...blockForm, emoji: e.target.value.slice(0, 2) })}
                    className="flex-1 px-3 py-2 rounded-lg transition-colors"
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
                    placeholder="🍽️ 📚 ☕ 💼"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
                  style={{ 
                    color: '#343A40',
                    border: '1px solid #DEE2E6'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#347474' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6363';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#347474';
                  }}
                >
                  Criar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legenda Simplificada */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Sessão Paga */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm border-l-4" style={{
              backgroundColor: 'rgba(52, 116, 116, 0.13)',
              borderLeftColor: '#347474'
            }}></div>
            <span className="text-sm" style={{ color: '#6C757D' }}>Sessão Paga</span>
          </div>
          {/* Pagamento Pendente */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm border-l-4" style={{
              backgroundColor: 'rgba(244, 162, 97, 0.13)',
              borderLeftColor: '#F4A261'
            }}></div>
            <span className="text-sm" style={{ color: '#6C757D' }}>Pagamento Pendente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;