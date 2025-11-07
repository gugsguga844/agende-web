import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, X, Coffee, BookOpen, Users as UsersIcon, Video, MapPin, DollarSign, Trash2, MoreHorizontal, Plus, ChevronDown, Palette, Smile, Settings } from 'lucide-react';
import AddSessionModal from './AddSessionModal';
import { getSessions, getSession, updateSession } from '../lib/api';

interface Session {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  client: string;
  clientEmail: string;
  duration: number; // em minutos
  status: 'confirmado' | 'pendente' | 'cancelado';
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
  itemId: number | null;
  itemType: 'session' | 'block' | null;
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
  const [weekDays, setWeekDays] = useState<5 | 7>(5); // 5 or 7 days view
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [viewOptions, setViewOptions] = useState({
    showTimeBlocks: true,
    showCancelledSessions: false
  });
  const [actionMenuSessionId, setActionMenuSessionId] = useState<number | null>(null);
  const [actionMenuBlockId, setActionMenuBlockId] = useState<number | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string } | null>(null);
  const [blockForm, setBlockForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    color: '#8390FA',
    emoji: ''
  });
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  const menuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const menuDropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const blockMenuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const blockMenuDropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const createMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    itemId: null,
    itemType: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    originalDay: '',
    originalTime: '',
    newDay: '',
    newTime: ''
  });

  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement>(null);

  // Data selecionada na visualização diária
  const [dailyDate, setDailyDate] = useState<Date>(new Date());

  // Emojis populares organizados por categoria
  const emojiCategories = {
    'Comida': ['🍽️', '☕', '🥗', '🍕', '🍔', '🥪', '🍜', '🍰'],
    'Trabalho': ['💼', '📊', '📈', '💻', '📝', '📞', '✉️', '📋'],
    'Estudo': ['📚', '📖', '✏️', '🎓', '🔬', '📐', '🧮', '💡'],
    'Saúde': ['🏥', '💊', '🩺', '🧘', '🏃', '💪', '🧠', '❤️'],
    'Pessoas': ['👥', '👨‍⚕️', '👩‍⚕️', '🤝', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓'],
    'Atividades': ['🎯', '🎨', '🎵', '🎪', '🎭', '🎬', '🎮', '🏆'],
    'Transporte': ['🚗', '🚌', '🚇', '✈️', '🚲', '🚶', '🏠', '🏢'],
    'Símbolos': ['⭐', '🔥', '💎', '🎉', '🎊', '🌟', '✨', '🎈']
  };

  // Sessions carregadas da API
  const [sessions, setSessions] = useState<Session[]>([]);

  const toDayKey = (date: Date): string => {
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()];
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  useEffect(() => {
    (async () => {
      try {
        const res = await getSessions();
        const list = Array.isArray(res) ? res : (res.data || []);
        const mapped: Session[] = list.map((s: any) => {
          const start = new Date(s.start_time);
          const duration = s.duration_min ?? (s.end_time ? Math.max(0, (new Date(s.end_time).getTime() - start.getTime())/60000) : 50);
          const end = new Date(start.getTime() + duration * 60000);
          const participants = s.participants || s.clients || [];
          const clientName = participants.length === 1 ? (participants[0].full_name || participants[0].name || 'Cliente') : `${participants.length} clientes`;
          return {
            id: s.id,
            day: toDayKey(start),
            startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
            endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
            client: clientName,
            clientEmail: participants[0]?.email || '',
            duration: Math.round(duration),
            status: (s.session_status === 'Completed' ? 'confirmado' : 'pendente'),
            sessionType: s.type === 'Online' ? 'online' : 'presencial',
            paymentStatus: s.payment_status === 'Paid' ? 'pago' : 'pendente',
            notes: s.session_notes || ''
          } as Session;
        });
        setSessions(mapped);
      } catch (e) {
        console.error('[Calendar] Falha ao carregar sessões', e);
      }
    })();
  }, []);

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
    }
  ]);

  // weekDaysData dinâmico: Segunda a Domingo, baseado em currentWeek
  function getWeekDaysData() {
    const today = new Date();
    // Encontrar a segunda-feira da semana atual
    const temp = new Date(today);
    const dayOfWeek = (temp.getDay() + 6) % 7; // 0 = segunda
    temp.setDate(temp.getDate() - dayOfWeek + currentWeek * 7);
    const labels = {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo',
    } as const;
    const keys = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
    const arr = [] as Array<{ key: string; label: string; date: string; dateObj: Date }>;
    for (let i = 0; i < 7; i++) {
      const d = new Date(temp);
      d.setDate(temp.getDate() + i);
      const key = keys[i];
      const label = labels[key as keyof typeof labels];
      const day = d.toLocaleDateString('pt-BR', { day: '2-digit' });
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      arr.push({ key, label, date: `${day}/${month}`, dateObj: d });
    }
    return arr;
  }

  const weekDaysData = React.useMemo(() => getWeekDaysData(), [currentWeek]);

  // Função utilitária para obter a ordem correta dos dias
  function getDisplayedDays(weekDays: number) {
    if (weekDays === 5) {
      // Segunda a Sexta
      return weekDaysData.slice(0, 5);
    } else {
      // Domingo a Sábado
      return [
        weekDaysData[6], // Domingo
        ...weekDaysData.slice(0, 6) // Segunda a Sábado
      ];
    }
  }

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
      itemId: null,
      itemType: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      originalDay: '',
      originalTime: '',
      newDay: '',
      newTime: ''
    });
  };

  // Drag and drop functions - Updated to handle both sessions and blocks
  const handleMouseDown = (e: React.MouseEvent, item: Session | TimeBlock, type: 'session' | 'block') => {
    e.preventDefault();
    e.stopPropagation();
    // O evento deve ser disparado no container do card
    const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cardOffsetY = e.clientY - cardRect.top;
    console.log('cardOffsetY', cardOffsetY); // Para depuração, compare com o backup
    const startTime = type === 'session' ? (item as Session).startTime : (item as TimeBlock).time;
    const day = item.day;
    setDragState({
      isDragging: true,
      itemId: item.id,
      itemType: type,
      startPosition: { x: e.clientX, y: e.clientY },
      currentPosition: { x: e.clientX, y: e.clientY },
      originalDay: day,
      originalTime: startTime,
      newDay: day,
      newTime: startTime,
      cardOffsetY
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && calendarRef.current) {
      const rect = calendarRef.current.getBoundingClientRect();
      const offsetY = dragState.cardOffsetY ?? 0;
      const relativeY = e.clientY - offsetY - rect.top;
      const timeColumnWidth = 120;
      const headerHeight = 80;
      const calendarHeight = 960;

      // Determine day according to view
      const newDay = (viewMode === 'daily')
        ? getDayKeyFor(dailyDate)
        : (() => {
            const relativeX = e.clientX - rect.left;
            const dayWidth = (rect.width - timeColumnWidth) / weekDays;
            const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayWidth);
            return getDisplayedDays(weekDays)[dayIndex]?.key || dragState.originalDay;
          })();

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
  }, [dragState.isDragging, dragState.originalDay, dragState.cardOffsetY, workingHours.start, workingHours.end, weekDays, viewMode, dailyDate]);

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
        if (actionMenuBlockId) {
          setActionMenuBlockId(null);
        }
        if (showCreateMenu) {
          setShowCreateMenu(false);
        }
        if (showBlockModal) {
          setShowBlockModal(false);
        }
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        }
        if (showViewOptions) {
          setShowViewOptions(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging, showConfirmModal, actionMenuSessionId, actionMenuBlockId, showCreateMenu, showBlockModal, showEmojiPicker, showViewOptions, handleMouseMove, handleMouseUp]);

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

      if (actionMenuBlockId) {
        const menu = blockMenuDropdownRefs.current[actionMenuBlockId];
        const button = blockMenuButtonRefs.current[actionMenuBlockId];
        
        if (menu && !menu.contains(e.target as Node) && 
            button && !button.contains(e.target as Node)) {
          setActionMenuBlockId(null);
        }
      }

      if (showCreateMenu && createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }

      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }

      if (showViewOptions && !(e.target as Element).closest('[data-view-options]')) {
        setShowViewOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionMenuSessionId, actionMenuBlockId, showCreateMenu, showEmojiPicker, showViewOptions]);

  const confirmReschedule = async () => {
    if (dragState.itemId && dragState.itemType) {
      if (dragState.itemType === 'session') {
        try {
          const sessionId = String(dragState.itemId);
          const s = await getSession(sessionId);
          const data = (s?.data ?? s) as any;
          // Construir nova data/hora (Diário: dailyDate + newTime; Semanal/Mensal: mantém dia calculado)
          const baseDate = (viewMode === 'daily') ? dailyDate : new Date();
          const yyyy = baseDate.getFullYear();
          const mm = (baseDate.getMonth() + 1).toString().padStart(2, '0');
          const dd = baseDate.getDate().toString().padStart(2, '0');
          const newLocalISO = new Date(`${yyyy}-${mm}-${dd}T${dragState.newTime}:00`).toISOString();

          const participants = data.participants || data.clients || [];
          const payload = {
            client_ids: participants.map((p: any) => p.id).filter((id: any) => typeof id === 'number'),
            start_time: newLocalISO,
            duration_min: data.duration_min ?? (data.end_time ? Math.max(0, (new Date(data.end_time).getTime() - new Date(data.start_time).getTime())/60000) : 50),
            focus_topic: data.focus_topic || '',
            session_notes: data.session_notes || '',
            type: data.type || 'In-person',
            meeting_url: data.meeting_url || undefined,
            payment_status: data.payment_status || 'Pending',
            payment_method: data.payment_method || undefined,
            price: typeof data.price === 'number' ? data.price : 0,
            session_status: data.session_status || 'Scheduled',
          };

          await updateSession(sessionId, payload);

          setSessions(prev => prev.map(session => {
            if (session.id === dragState.itemId) {
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
        } catch (e) {
          console.error('[Calendar] Falha ao reagendar sessão', e);
        }
      } else if (dragState.itemType === 'block') {
        setTimeBlocks(prev => prev.map(block => {
          if (block.id === dragState.itemId) {
            const originalDuration = timeToMinutes(block.endTime) - timeToMinutes(block.time);
            const newEndTime = minutesToTime(timeToMinutes(dragState.newTime) + originalDuration);
            return {
              ...block,
              day: dragState.newDay,
              time: dragState.newTime,
              endTime: newEndTime
            };
          }
          return block;
        }));
      }
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

  const handleDeleteBlock = (blockId: number) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== blockId));
    setActionMenuBlockId(null);
  };

  const getDraggedItem = () => {
    if (dragState.itemType === 'session') {
      return sessions.find(s => s.id === dragState.itemId);
    } else if (dragState.itemType === 'block') {
      return timeBlocks.find(b => b.id === dragState.itemId);
    }
    return null;
  };

  const getDraggedItemNewEndTime = () => {
    const item = getDraggedItem();
    if (!item) return '';
    
    if (dragState.itemType === 'session') {
      const session = item as Session;
      const startMinutes = timeToMinutes(dragState.newTime);
      const endMinutes = startMinutes + session.duration;
      return minutesToTime(endMinutes);
    } else if (dragState.itemType === 'block') {
      const block = item as TimeBlock;
      const originalDuration = timeToMinutes(block.endTime) - timeToMinutes(block.time);
      const newEndTime = minutesToTime(timeToMinutes(dragState.newTime) + originalDuration);
      return newEndTime;
    }
    return '';
  };

  const handleEmojiSelect = (emoji: string) => {
    setBlockForm(prev => ({ ...prev, emoji }));
    setShowEmojiPicker(false);
  };

  const getWeekRangeText = () => {
    const firstDay = weekDaysData[0];
    const lastIndex = weekDays === 5 ? 4 : 6;
    const lastDay = weekDaysData[lastIndex];
    return `${firstDay.date} - ${lastDay.date}`;
  };

  const isToday = (dayKey: string) => {
    const today = new Date();
    const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    return dayKey === todayKey;
  };

  // Função utilitária para obter o dia atual
  function getTodayKey() {
    const today = new Date();
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
  }

  function getDayKeyFor(date: Date) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  }

  // 1. Cabeçalho dinâmico
  // Substituir o texto do cabeçalho por:
  const getHeaderText = () => {
    if (viewMode === 'monthly') {
      const now = new Date();
      const month = new Date(now.getFullYear(), now.getMonth() + currentWeek, 1);
      return `${month.toLocaleString('pt-BR', { month: 'long' }).replace(/^./, str => str.toUpperCase())} ${month.getFullYear()}`;
    } else if (viewMode === 'daily') {
      const day = dailyDate.toLocaleDateString('pt-BR', { day: '2-digit' });
      const monthName = dailyDate.toLocaleString('pt-BR', { month: 'long' }).replace(/^./, str => str.toUpperCase());
      const year = dailyDate.getFullYear();
      return `${day} ${monthName} ${year}`;
    } else {
      return getWeekRangeText();
    }
  };

  // 2. Navegação por mês na visualização mensal
  const handlePrev = () => {
    if (viewMode === 'daily') {
      const d = new Date(dailyDate);
      d.setDate(d.getDate() - 1);
      setDailyDate(d);
    } else {
      setCurrentWeek(currentWeek - 1);
    }
  };
  const handleNext = () => {
    if (viewMode === 'daily') {
      const d = new Date(dailyDate);
      d.setDate(d.getDate() + 1);
      setDailyDate(d);
    } else {
      setCurrentWeek(currentWeek + 1);
    }
  };

  // Definir a função dayStr antes do uso
  function dayStr(day: number) {
    return day.toString().padStart(2, '0');
  }

  // Visualização Diária
  function DailyView() {
    const todayKey = getDayKeyFor(dailyDate);
    const dayLabel = dailyDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayDate = dailyDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-visible" style={{ border: '1px solid #DEE2E6' }}>
        {/* Header do dia */}
        <div className="grid" style={{ gridTemplateColumns: '120px 1fr', borderBottom: '1px solid #DEE2E6' }}>
          <div className="p-4" style={{ backgroundColor: '#F8F9FA', borderRight: '1px solid #DEE2E6' }}>
            <span className="text-sm font-medium" style={{ color: '#6C757D' }}>Horário</span>
          </div>
          <div className="p-4 text-center relative" style={{ backgroundColor: '#F8F9FA', color: '#347474' }}>
            <div className="font-semibold">{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</div>
            <div className="text-sm" style={{ color: '#347474' }}>{dayDate}</div>
          </div>
        </div>
        {/* Time slots e sessões */}
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
          {/* Coluna do dia */}
          <div className="absolute top-0 bottom-0 right-0" style={{ left: '120px' }}>
            <div className="relative h-full">
              {/* Hour lines */}
              {timeSlots.map((time, index) => (
                <div
                  key={`${todayKey}-${time}`}
                  className="absolute w-full cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    top: `${(index / timeSlots.length) * 100}%`,
                    height: `${100 / timeSlots.length}%`,
                    borderBottom: index < timeSlots.length - 1 ? '1px solid #DEE2E6' : 'none',
                    backgroundColor: !isWorkingHour(time) ? '#FAFBFC' : 'transparent'
                  }}
                  onClick={() => handleTimeSlotClick(todayKey, time)}
                />
              ))}
              {/* Sessions */}
              {getSessionsForDay(todayKey).map((session) => {
                const position = getSessionPosition(session);
                const isDragging = dragState.isDragging && dragState.itemId === session.id && dragState.itemType === 'session';
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
                  handleMouseDown(e, session, 'session');
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
                      <div className="flex items-center justify-between mb-0.5 w-full">
                        <SessionIcon size={16} style={{ color: iconColor }} />
                        <span className="text-xs font-medium text-center flex-1 mx-1" style={{ color: '#343A40' }}>
                          {session.startTime} - {session.endTime}
                        </span>
                        <span className="text-xs" style={{ color: '#6C757D' }}>
                          ({session.duration}min)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate flex-1" style={{ color: '#343A40' }}>
                          {session.client}
                        </div>
                        {/* ...menu de ações... */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visualização Mensal
  function MonthlyView() {
    // Gerar os dias do mês atual
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstWeekDay = firstDay.getDay(); // 0 = domingo
    // Montar grid: cada célula é um dia
    const daysArray = [];
    for (let i = 0; i < firstWeekDay; i++) daysArray.push(null); // Espaço antes do 1º dia
    for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
    while (daysArray.length % 7 !== 0) daysArray.push(null); // Completar última semana
    // Adicionar mock de muitos eventos em um dia para teste
    const extraSessions = [
      { id: 100, day: 'monday', startTime: '08:00', endTime: '08:50', client: 'Teste 1', duration: 50, status: 'confirmado', sessionType: 'presencial', paymentStatus: 'pago', notes: '' },
      { id: 101, day: 'monday', startTime: '09:00', endTime: '09:50', client: 'Teste 2', duration: 50, status: 'confirmado', sessionType: 'online', paymentStatus: 'pendente', notes: '' },
      { id: 102, day: 'monday', startTime: '10:00', endTime: '10:50', client: 'Teste 3', duration: 50, status: 'confirmado', sessionType: 'presencial', paymentStatus: 'pago', notes: '' },
      { id: 103, day: 'monday', startTime: '11:00', endTime: '11:50', client: 'Teste 4', duration: 50, status: 'confirmado', sessionType: 'online', paymentStatus: 'pendente', notes: '' },
    ];
    const allSessions = [...sessions, ...extraSessions];
    function getSessionsForDate(day: number) {
      if (!day) return [];
      // Procurar pelo campo date em weekDaysData (mock)
      const dateStr = day.toString().padStart(2, '0') + '/' + (month + 1).toString().padStart(2, '0');
      const dayKey = weekDaysData.find(d => d.date.startsWith(dayStr(day)))?.key;
      if (!dayKey) return [];
      return allSessions.filter(session => session.day === dayKey);
    }
    // Popover de eventos
    const [popoverDay, setPopoverDay] = React.useState<number | null>(null);
    const [popoverAnchor, setPopoverAnchor] = React.useState<{left: number, top: number} | null>(null);
    const closePopover = () => setPopoverDay(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (popoverDay !== null) {
        const handleClickOutside = (e: MouseEvent) => {
          if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
            setPopoverDay(null);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [popoverDay]);

    // Função para abrir o popover e calcular a posição relativa ao container
    const handlePopoverOpen = (day: number, event: React.MouseEvent) => {
      const targetRect = (event.target as HTMLElement).getBoundingClientRect();
      const containerRect = calendarContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      // Posição centralizada horizontalmente em relação ao botão/célula
      let left = targetRect.left - containerRect.left + targetRect.width / 2;
      // Posição vertical: preferencialmente abaixo, mas se não couber, acima
      const popoverHeight = 260; // valor aproximado, pode ajustar
      let top = targetRect.bottom - containerRect.top;
      let showAbove = false;
      if (top + popoverHeight > containerRect.height) {
        top = targetRect.top - containerRect.top - popoverHeight;
        showAbove = true;
      }
      setPopoverAnchor({ left, top });
      setPopoverDay(day);
    };

    return (
      <div ref={calendarContainerRef} className="bg-white rounded-xl shadow-sm overflow-visible relative" style={{ border: '1px solid #DEE2E6' }}>
        <div className="grid grid-cols-7 bg-[#F1F3F5]" style={{ minHeight: '520px' }}>
          {/* Cabeçalho dos dias */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((w, i) => (
            <div
              key={i}
              className="text-base font-bold text-center py-3 bg-[#F8F9FA]"
              style={{
                color: '#343A40',
                letterSpacing: 1,
                borderRight: i < 6 ? '1px solid #DEE2E6' : 'none',
                borderBottom: '1px solid #DEE2E6',
                borderTop: 'none',
                borderLeft: 'none',
                borderRadius: 0
              }}
            >
              {w}
            </div>
          ))}
          {/* Grid dos dias */}
          {daysArray.map((day, idx) => {
            const isPrevMonth = idx < firstWeekDay;
            const isNextMonth = idx >= firstWeekDay + daysInMonth;
            const isOutMonth = isPrevMonth || isNextMonth;
            const events = getSessionsForDate(day || 0);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            // Cálculo para bordas: última coluna e última linha
            const isLastCol = (idx + 1) % 7 === 0;
            const isLastRow = idx >= daysArray.length - 7;
            return (
              <div
                key={idx}
                className={`relative group min-h-[80px] aspect-square flex flex-col items-start justify-start p-2 ${isToday ? 'bg-[#eaf6fb] border-t-4 border-[#347474]' : isOutMonth ? 'bg-[#F8F9FA]' : 'bg-white'} ${isOutMonth ? 'text-[#ADB5BD]' : 'text-[#343A40]'} ${isToday ? 'font-bold' : 'font-medium'}`}
                style={{
                  borderRight: !isLastCol ? '1px solid #DEE2E6' : 'none',
                  borderBottom: !isLastRow ? '1px solid #DEE2E6' : 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRadius: 0,
                  zIndex: isToday ? 2 : 1,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  overflow: 'visible'
                }}
              >
                {day && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-base" style={{ fontWeight: isToday ? 700 : 500 }}>{day}</span>
                    {isToday && <span className="text-xs font-bold text-[#347474]">Hoje</span>}
                  </div>
                )}
                {/* Renderizar eventos e popover apenas para dias do mês atual */}
                {!isOutMonth && (
                  <>
                    <div className="flex flex-col gap-1 w-full">
                      {events.slice(0, 3).map((session: any, i: number) => (
                        <div key={i} className="truncate px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer" style={{
                          background: session.paymentStatus === 'pago' ? '#34747422' : session.paymentStatus === 'pendente' ? '#F4A26122' : '#6C757D22',
                          color: session.paymentStatus === 'pago' ? '#347474' : session.paymentStatus === 'pendente' ? '#F4A261' : '#6C757D',
                          border: `1px solid ${session.paymentStatus === 'pago' ? '#34747444' : session.paymentStatus === 'pendente' ? '#F4A26144' : '#6C757D44'}`
                        }}
                          title={session.client}
                          onClick={(e) => handlePopoverOpen(day as number, e)}
                        >
                          {session.startTime} {session.client.length > 10 ? session.client.slice(0, 10) + '…' : session.client}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <button className="text-xs text-[#347474] underline mt-1" onClick={(e) => handlePopoverOpen(day as number, e)}>
                          +{events.length - 3} mais…
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {/* Popover global fora do grid */}
        {popoverDay !== null && popoverAnchor && (
          <div
            ref={popoverRef}
            className="absolute bg-white border rounded-lg shadow-xl p-3 min-w-[180px]"
            style={{
              left: popoverAnchor.left,
              top: popoverAnchor.top,
              borderColor: '#DEE2E6',
              zIndex: 9999,
              boxShadow: '0 8px 32px 0 rgba(52, 116, 116, 0.18), 0 1.5px 6px 0 rgba(52, 116, 116, 0.10)',
              transform: 'translate(-50%, 0)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm" style={{ color: '#347474' }}>Eventos do dia {popoverDay}</span>
              <button className="text-xs text-[#347474]" onClick={closePopover}>Fechar</button>
            </div>
            <div className="flex flex-col gap-2">
              {popoverDay !== null && getSessionsForDate(popoverDay).map((session: any, i: number) => (
                <div key={i} className="flex flex-col px-2 py-1 rounded border" style={{ borderColor: '#DEE2E6', background: '#f8fafc' }}>
                  <span className="font-medium text-xs" style={{ color: '#343A40' }}>{session.startTime} - {session.endTime}</span>
                  <span className="text-xs" style={{ color: '#347474' }}>{session.client}</span>
                  <span className="text-xs" style={{ color: '#6C757D' }}>{session.sessionType === 'online' ? 'Online' : 'Presencial'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Agenda</h1>
        <div className="flex items-center space-x-3">
          {/* Botão Exibir */}
          <div className="relative" data-view-options>
            <button
              onClick={() => setShowViewOptions(!showViewOptions)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border text-sm font-medium shadow-sm"
              style={{ backgroundColor: '#fff', color: '#343A40', border: '1px solid #DEE2E6', height: '44px', minWidth: '120px' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8F9FA'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
            >
              <Settings size={16} style={{ color: '#6C757D' }} />
              <span>Exibir</span>
              <ChevronDown size={14} style={{ color: '#6C757D' }} />
            </button>
            {/* View Options Dropdown */}
            {showViewOptions && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50" style={{ border: '1px solid #DEE2E6' }}>
                <div className="p-4">
                  {/* Period Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                      Período Visível
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="weekDays"
                          checked={weekDays === 5}
                          onChange={() => setWeekDays(5)}
                          className="w-4 h-4"
                          style={{ accentColor: '#347474' }}
                        />
                        <span className="text-sm" style={{ color: '#343A40' }}>Semana de 5 dias</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="weekDays"
                          checked={weekDays === 7}
                          onChange={() => setWeekDays(7)}
                          className="w-4 h-4"
                          style={{ accentColor: '#347474' }}
                        />
                        <span className="text-sm" style={{ color: '#343A40' }}>Semana de 7 dias</span>
                      </label>
                    </div>
                  </div>

                  {/* Display Options Section */}
                  <div className="pt-3" style={{ borderTop: '1px solid #DEE2E6' }}>
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#343A40' }}>
                      Mostrar na Agenda
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={viewOptions.showTimeBlocks}
                          onChange={(e) => setViewOptions({
                            ...viewOptions,
                            showTimeBlocks: e.target.checked
                          })}
                          className="w-4 h-4"
                          style={{ accentColor: '#347474' }}
                        />
                        <span className="text-sm" style={{ color: '#343A40' }}>Meus bloqueios de tempo</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={viewOptions.showCancelledSessions}
                          onChange={(e) => setViewOptions({
                            ...viewOptions,
                            showCancelledSessions: e.target.checked
                          })}
                          className="w-4 h-4"
                          style={{ accentColor: '#347474' }}
                        />
                        <span className="text-sm" style={{ color: '#343A40' }}>Sessões canceladas</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Botão Novo */}
          <div className="relative" ref={createMenuRef}>
            <div>
              {/* O botão principal só abre/fecha o menu, não executa ação */}
              <button
                type="button"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#347474', height: '44px', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d6363';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#347474';
                }}
                aria-haspopup="true"
                aria-expanded={showCreateMenu}
              >
                <Plus size={20} className="inline mr-2" />
                Novo
                <ChevronDown size={16} className="ml-2" />
              </button>
              {/* Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50" style={{ border: '1px solid #DEE2E6' }}>
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateMenu(false);
                        // Abrir modal de agendamento de sessão
                        setShowAddSessionModal(true);
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
                      type="button"
                      onClick={() => {
                        setShowCreateMenu(false);
                        setSelectedTimeSlot({ day: 'monday', time: '09:00' });
                        setBlockForm({
                          title: '',
                          startTime: '09:00',
                          endTime: '10:00',
                          color: '#8390FA',
                          emoji: ''
                        });
                        setShowBlockModal(true);
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
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6C757D' }}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
            {getHeaderText()}
          </h2>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6C757D' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex rounded-lg p-1" style={{ backgroundColor: '#F8F9FA' }}>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'daily' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
            style={{ 
              color: viewMode === 'daily' ? '#343A40' : '#6C757D'
            }}
          >
            Diário
          </button>
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

      {/* Calendar Grid */}
      <div 
        ref={calendarRef}
        className="bg-white rounded-xl shadow-sm overflow-visible" 
        style={{ border: '1px solid #DEE2E6' }}
      >
        {viewMode === 'daily' && <DailyView />}
        {viewMode === 'weekly' && (
          <>
            {/* Header with days */}
            <div className="grid" style={{ 
              gridTemplateColumns: `120px repeat(${weekDays}, 1fr)`,
              borderBottom: '1px solid #DEE2E6' 
            }}>
              <div className="p-4" style={{ backgroundColor: '#F8F9FA', borderRight: '1px solid #DEE2E6' }}>
                <span className="text-sm font-medium" style={{ color: '#6C757D' }}>Horário</span>
              </div>
              {getDisplayedDays(weekDays).map((day, index) => (
                <div
                  key={day.key}
                  className={`p-4 text-center relative ${
                    isToday(day.key) ? 'relative' : ''
                  }`}
                  style={{
                    backgroundColor: isToday(day.key) ? 'rgba(52, 116, 116, 0.05)' : '#F8F9FA',
                    borderRight: index < weekDays - 1 ? '1px solid #DEE2E6' : 'none',
                    color: isToday(day.key) ? '#347474' : '#343A40'
                  }}
                >
                  {isToday(day.key) && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: '#347474' }}
                    ></div>
                  )}
                  <div className="font-semibold">{day.label}</div>
                  <div className="text-sm" style={{ color: isToday(day.key) ? '#347474' : '#6C757D' }}>{day.date}</div>
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
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${weekDays}, 1fr)` }}>
                  {getDisplayedDays(weekDays).map((day, dayIndex) => (
                    <div 
                      key={day.key}
                      className="relative"
                      style={{ 
                        borderRight: dayIndex < weekDays - 1 ? '1px solid #DEE2E6' : 'none',
                        backgroundColor: isToday(day.key) ? 'rgba(52, 116, 116, 0.02)' : 'transparent'
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
                        const isDragging = dragState.isDragging && dragState.itemId === session.id && dragState.itemType === 'session';
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
                          handleMouseDown(e, session, 'session');
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
                                {!(viewMode === 'weekly' && weekDays === 7) && (
                                  <span className="text-xs" style={{ color: '#6C757D' }}>
                                    ({session.duration}min)
                                  </span>
                                )}
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

                      {/* Time blocks - Now draggable */}
                      {viewOptions.showTimeBlocks && getBlocksForDay(day.key).map((block) => {
                        const position = getBlockPosition(block);
                        const isDragging = dragState.isDragging && dragState.itemId === block.id && dragState.itemType === 'block';
                        const isMenuOpen = actionMenuBlockId === block.id;

                        const handleBlockMouseDown = (e: React.MouseEvent) => {
                          const btn = blockMenuButtonRefs.current[block.id];
                          const menu = blockMenuDropdownRefs.current[block.id];
                          if (
                            btn?.contains(e.target as Node) ||
                            menu?.contains(e.target as Node)
                          ) {
                            return;
                          }
                          handleMouseDown(e, block, 'block');
                        };
                        
                        return (
                          <div
                            key={block.id}
                            className={`absolute w-full px-1 ${isDragging ? 'opacity-50' : ''}`}
                            style={{
                              top: position.top,
                              height: position.height,
                              zIndex: isDragging ? 50 : isMenuOpen ? 30 : 10
                            }}
                          >
                            <div
                              className="h-full p-2 rounded-lg border-l-4 cursor-move transition-all duration-200 shadow-sm group hover:shadow-md hover:-translate-y-0.5"
                              style={{
                                backgroundColor: `${block.color}20`,
                                borderLeftColor: block.color,
                                cursor: isDragging ? 'grabbing' : 'grab'
                              }}
                              onMouseDown={handleBlockMouseDown}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1">
                                  {block.emoji && <span className="text-xs">{block.emoji}</span>}
                                  <span className="text-xs" style={{ color: '#6C757D' }}>{block.duration}</span>
                                </div>
                                <div className="relative">
                                  <button
                                    ref={el => (blockMenuButtonRefs.current[block.id] = el)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-full hover:bg-white/50"
                                    style={{ color: '#6C757D' }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setActionMenuBlockId(block.id === actionMenuBlockId ? null : block.id);
                                    }}
                                  >
                                    <MoreHorizontal size={12} />
                                  </button>
                                  
                                  {/* Menu de ações para bloqueios */}
                                  {isMenuOpen && (
                                    <div
                                      ref={el => (blockMenuDropdownRefs.current[block.id] = el)}
                                      className="absolute right-0 bottom-6 bg-white rounded-lg shadow-xl border z-50 min-w-[160px]"
                                      style={{ border: '1px solid #DEE2E6' }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <button
                                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                                        style={{ color: '#343A40' }}
                                        onClick={() => {
                                          console.log('Editar Bloqueio');
                                          setActionMenuBlockId(null);
                                        }}
                                      >
                                        <Clock size={14} className="mr-2" /> Editar
                                      </button>
                                      <div className="border-t my-1 border-gray-200" />
                                      <button
                                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-red-50 rounded-b-lg"
                                        style={{ color: '#E76F51' }}
                                        onClick={() => {
                                          handleDeleteBlock(block.id);
                                        }}
                                      >
                                        <Trash2 size={14} className="mr-2" /> Excluir
                                      </button>
                                    </div>
                                  )}
                                </div>
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
          </>
        )}
        {viewMode === 'monthly' && <MonthlyView />}
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
            backgroundColor: (() => {
              const item = getDraggedItem();
              if (dragState.itemType === 'session') {
                const session = item as Session;
                return session?.paymentStatus === 'pago'
                  ? 'rgba(52, 116, 116, 0.13)'
                  : 'rgba(244, 162, 97, 0.13)';
              } else if (dragState.itemType === 'block') {
                const block = item as TimeBlock;
                return `${block?.color}20`;
              }
              return 'rgba(52, 116, 116, 0.13)';
            })(),
            borderColor: (() => {
              const item = getDraggedItem();
              if (dragState.itemType === 'session') {
                const session = item as Session;
                return session?.paymentStatus === 'pago' ? '#347474' : '#F4A261';
              } else if (dragState.itemType === 'block') {
                const block = item as TimeBlock;
                return block?.color || '#8390FA';
              }
              return '#347474';
            })(),
            borderLeftColor: (() => {
              const item = getDraggedItem();
              if (dragState.itemType === 'session') {
                const session = item as Session;
                return session?.paymentStatus === 'pago' ? '#347474' : '#F4A261';
              } else if (dragState.itemType === 'block') {
                const block = item as TimeBlock;
                return block?.color || '#8390FA';
              }
              return '#347474';
            })()
          }}>
            {(() => {
              const item = getDraggedItem();
              if (!item) return null;
              
              if (dragState.itemType === 'session') {
                const session = item as Session;
                const SessionIcon = session.sessionType === 'online' ? Video : MapPin;
                const newEndTime = getDraggedItemNewEndTime();
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
                      {weekDaysData.find(d => d.key === dragState.newDay)?.label}
                    </div>
                  </>
                );
              } else if (dragState.itemType === 'block') {
                const block = item as TimeBlock;
                const newEndTime = getDraggedItemNewEndTime();
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      {block.emoji && <span className="text-xs">{block.emoji}</span>}
                      <span className="text-xs font-medium text-center flex-1 mx-1" style={{ color: '#343A40' }}>
                        {dragState.newTime} - {newEndTime}
                      </span>
                    </div>
                    
                    <div className="font-medium text-sm mb-1" style={{ color: '#343A40' }}>
                      {block.title}
                    </div>
                    
                    <div className="text-xs" style={{ color: '#6C757D' }}>
                      {weekDaysData.find(d => d.key === dragState.newDay)?.label}
                    </div>
                  </>
                );
              }
              
              return null;
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
              {(() => {
                const item = getDraggedItem();
                if (dragState.itemType === 'session') {
                  const session = item as Session;
                  return (
                    <>
                      Deseja reagendar a sessão com <strong>{session?.client}</strong> para{' '}
                      <strong>{weekDaysData.find(d => d.key === dragState.newDay)?.label}</strong> às{' '}
                      <strong>{dragState.newTime}</strong>?
                    </>
                  );
                } else if (dragState.itemType === 'block') {
                  const block = item as TimeBlock;
                  return (
                    <>
                      Deseja mover o bloqueio <strong>{block?.title}</strong> para{' '}
                      <strong>{weekDaysData.find(d => d.key === dragState.newDay)?.label}</strong> às{' '}
                      <strong>{dragState.newTime}</strong>?
                    </>
                  );
                }
                return 'Deseja confirmar esta alteração?';
              })()}
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
                  <div className="relative flex-1">
                    <input
                      id="emoji"
                      type="text"
                      value={blockForm.emoji}
                      onChange={(e) => setBlockForm({ ...blockForm, emoji: e.target.value.slice(0, 2) })}
                      className="w-full px-3 py-2 pr-10 rounded-lg transition-colors"
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
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                      style={{ color: '#6C757D' }}
                    >
                      <Smile size={16} />
                    </button>
                  </div>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="mt-3 p-4 bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto"
                    style={{ border: '1px solid #DEE2E6' }}
                  >
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium mb-2" style={{ color: '#6C757D' }}>
                          {category}
                        </h4>
                        <div className="grid grid-cols-8 gap-1">
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleEmojiSelect(emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Adicionar estado para modal de sessão */}
      {showAddSessionModal && (
        <AddSessionModal isOpen={showAddSessionModal} onClose={() => setShowAddSessionModal(false)} mode="schedule" />
      )}
    </div>
  );
};

export default Calendar;