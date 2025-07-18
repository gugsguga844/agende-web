import React, { useState, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User, 
  CreditCard, 
  Filter,
  Download,
  Search,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart3
} from 'lucide-react';

// Função utilitária para calcular receita por cliente
function getTopClients(transactions: { client: string, amount: number, status: string }[], topN = 5) {
  const totals: Record<string, number> = {};
  let total = 0;
  transactions.forEach((t) => {
    if (t.status === 'paid') {
      totals[t.client] = (totals[t.client] || 0) + t.amount;
      total += t.amount;
    }
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, topN);
  const outrosSum = sorted.slice(topN).reduce((acc, [, v]) => acc + (typeof v === 'number' ? v : 0), 0);
  const result = top.map(([name, value]) => ({ name, value: value as number, percent: total ? ((value as number) / total) * 100 : 0 }));
  if (outrosSum > 0) {
    result.push({ name: 'Outros', value: outrosSum, percent: total ? (outrosSum / total) * 100 : 0 });
  }
  return { data: result, total };
}

const FinancialPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Para tooltips dos gráficos
  const [barTooltip, setBarTooltip] = useState<{ x: number, y: number, value: number, label: string } | null>(null);
  const [donutTooltip, setDonutTooltip] = useState<{ x: number, y: number, name: string, value: number, percent: number } | null>(null);

  // Mock data para demonstração
  const financialSummary = {
    totalReceived: 4850.00,
    totalPending: 1200.00,
    totalMonth: 6050.00,
    sessionsCount: 42,
    averageSession: 144.05,
    monthlyGrowth: 12.5,
    pendingGrowth: -8.3
  };

  const transactions = [
    {
      id: 1,
      date: '2024-01-20',
      client: 'Juliana Costa',
      sessionType: 'individual',
      amount: 150.00,
      status: 'paid',
      paymentMethod: 'pix',
      sessionDate: '2024-01-20',
      notes: 'Sessão individual - Ansiedade'
    },
    {
      id: 2,
      date: '2024-01-19',
      client: 'Grupo de Apoio - Ansiedade',
      sessionType: 'group',
      amount: 300.00,
      status: 'paid',
      paymentMethod: 'transferencia',
      sessionDate: '2024-01-19',
      notes: 'Sessão em grupo - 5 participantes',
      participants: 5
    },
    {
      id: 3,
      date: '2024-01-18',
      client: 'Carlos Mendes',
      sessionType: 'individual',
      amount: 150.00,
      status: 'pending',
      paymentMethod: 'dinheiro',
      sessionDate: '2024-01-18',
      notes: 'Sessão individual - Acompanhamento'
    },
    {
      id: 4,
      date: '2024-01-17',
      client: 'Maria Santos',
      sessionType: 'individual',
      amount: 150.00,
      status: 'paid',
      paymentMethod: 'cartao',
      sessionDate: '2024-01-17',
      notes: 'Primeira consulta'
    },
    {
      id: 5,
      date: '2024-01-16',
      client: 'Pedro Oliveira',
      sessionType: 'individual',
      amount: 150.00,
      status: 'overdue',
      paymentMethod: 'pix',
      sessionDate: '2024-01-16',
      notes: 'Sessão individual - Vencida há 4 dias'
    }
  ];

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'this-week', label: 'Esta Semana' },
    { value: 'this-month', label: 'Este Mês' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'this-quarter', label: 'Este Trimestre' },
    { value: 'this-year', label: 'Este Ano' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#347474';
      case 'pending': return '#F4A261';
      case 'overdue': return '#E76F51';
      default: return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return Clock;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cartao': return 'Cartão';
      case 'dinheiro': return 'Dinheiro';
      case 'transferencia': return 'Transferência';
      default: return method;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCurrentPeriodLabel = () => {
    const option = periodOptions.find(opt => opt.value === selectedPeriod);
    return option ? option.label : 'Este Mês';
  };

  // Dados para o donut chart de receita por cliente
  const { data: topClients, total: totalReceitaClientes } = getTopClients(transactions);
  // Cores para as fatias
  const donutColors = ['#347474', '#F4A261', '#E76F51', '#6C757D', '#264653', '#A8A8A8'];

  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#343A40' }}>
              Dashboard Financeiro
            </h1>
            <p style={{ color: '#6C757D' }}>
              Acompanhe suas receitas e controle seus pagamentos
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-white shadow-sm"
              style={{ 
                border: '1px solid #DEE2E6',
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
              <span className="font-medium">{getCurrentPeriodLabel()}</span>
              <ChevronDown size={16} style={{ color: '#6C757D' }} />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10" style={{ border: '1px solid #DEE2E6' }}>
                <div className="py-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value);
                        setShowPeriodDropdown(false);
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

        {/* Financial Summary Cards - Estilo Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Recebido */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: '#347474' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                  <TrendingUp size={24} style={{ color: '#347474' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#6C757D' }}>Total Recebido</h3>
                  <p className="text-2xl font-bold" style={{ color: '#347474' }}>
                    R$ {financialSummary.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <ArrowUp size={16} style={{ color: '#347474' }} />
                <span className="text-sm font-medium" style={{ color: '#347474' }}>
                  +{financialSummary.monthlyGrowth}%
                </span>
              </div>
              <span className="text-sm" style={{ color: '#6C757D' }}>vs. mês anterior</span>
            </div>
          </div>

          {/* Total Pendente */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: '#F4A261' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(244, 162, 97, 0.1)' }}>
                  <Clock size={24} style={{ color: '#F4A261' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#6C757D' }}>Total Pendente</h3>
                  <p className="text-2xl font-bold" style={{ color: '#F4A261' }}>
                    R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <ArrowDown size={16} style={{ color: '#347474' }} />
                <span className="text-sm font-medium" style={{ color: '#347474' }}>
                  {financialSummary.pendingGrowth}%
                </span>
              </div>
              <span className="text-sm" style={{ color: '#6C757D' }}>vs. mês anterior</span>
            </div>
          </div>

          {/* Total do Mês */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4" style={{ borderLeftColor: '#6C757D' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)' }}>
                  <DollarSign size={24} style={{ color: '#6C757D' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#6C757D' }}>Faturamento do Período</h3>
                  <p className="text-2xl font-bold" style={{ color: '#343A40' }}>
                    R$ {financialSummary.totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm" style={{ color: '#6C757D' }}>
                {financialSummary.sessionsCount} sessões realizadas
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                Receita Mensal
              </h3>
              <button className="text-sm font-medium hover:underline" style={{ color: '#347474' }}>
                Ver Relatório
              </button>
            </div>
            
            {/* Simplified Chart Representation - agora com tooltip */}
            <div ref={chartRef} className="h-48 flex items-end justify-between space-x-2 relative">
              {[65, 45, 78, 52, 89, 67, 94, 73, 85, 91, 76, 88].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80 relative"
                  style={{
                    height: `${height}%`,
                    backgroundColor: index === 11 ? '#347474' : 'rgba(52, 116, 116, 0.3)',
                    minHeight: '20px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    const chartRect = chartRef.current?.getBoundingClientRect();
                    const barRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    setBarTooltip({
                      x: barRect.left - (chartRect?.left ?? 0) + barRect.width / 2,
                      y: barRect.top - (chartRect?.top ?? 0),
                      value: height * 100, // Exemplo: valor fictício
                      label: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][index]
                    });
                  }}
                  onMouseLeave={() => setBarTooltip(null)}
                />
              ))}
              {/* Tooltip do gráfico de barras */}
              {barTooltip && (
                <div
                  className="absolute z-50 px-3 py-2 rounded-lg shadow-xl bg-white border text-sm font-medium"
                  style={{
                    left: barTooltip.x - 60,
                    top: barTooltip.y - 40,
                    minWidth: 120,
                    borderColor: '#DEE2E6',
                    color: '#343A40',
                    pointerEvents: 'none'
                  }}
                >
                  <div>{barTooltip.label}</div>
                  <div className="font-bold">R$ {barTooltip.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-4 text-xs" style={{ color: '#6C757D' }}>
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
              <span>Set</span>
              <span>Out</span>
              <span>Nov</span>
              <span>Dez</span>
            </div>
          </div>

          {/* Receita por Cliente (Donut Chart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
                Receita por Cliente
              </h3>
            </div>
            {/* Donut Chart Dinâmico */}
            <div className="flex items-center justify-center mb-6 relative">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="#F8F9FA"
                    strokeWidth="4"
                  />
                  {/* Fatias do donut */}
                  {topClients.reduce((acc: { offset: number, slices: JSX.Element[] }, client, i) => {
                    const prev = acc.offset;
                    const percent = client.percent;
                    const dash = (percent / 100) * 75.36;
                    const color = donutColors[i % donutColors.length];
                    acc.slices.push(
                      <circle
                        key={client.name}
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={`${dash} 75.36`}
                        strokeDashoffset={`-${prev}`}
                        strokeLinecap="round"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={e => {
                          const rect = (e.currentTarget as SVGCircleElement).getBoundingClientRect();
                          setDonutTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            name: client.name,
                            value: client.value,
                            percent: client.percent
                          });
                        }}
                        onMouseLeave={() => setDonutTooltip(null)}
                      />
                    );
                    acc.offset += dash;
                    return acc;
                  }, { offset: 0, slices: [] }).slices}
                </svg>
                {/* Tooltip do donut */}
                {donutTooltip && (
                  <div
                    className="absolute z-50 px-3 py-2 rounded-lg shadow-xl bg-white border text-sm font-medium"
                    style={{
                      left: 64,
                      top: 0,
                      minWidth: 160,
                      borderColor: '#DEE2E6',
                      color: '#343A40',
                      pointerEvents: 'none'
                    }}
                  >
                    <div className="font-bold">{donutTooltip.name}</div>
                    <div>R$ {donutTooltip.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({donutTooltip.percent.toFixed(1)}%)</div>
                  </div>
                )}
              </div>
            </div>
            {/* Legenda dos clientes */}
            <div className="space-y-3">
              {topClients.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: donutColors[i % donutColors.length] }}
                    />
                    <span className="text-sm" style={{ color: '#343A40' }}>{item.name}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#6C757D' }}>
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg transition-colors w-80 bg-white shadow-sm"
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

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors bg-white shadow-sm ${
                  statusFilter !== 'all' ? 'text-white' : ''
                }`}
                style={{ 
                  border: '1px solid #DEE2E6',
                  backgroundColor: statusFilter !== 'all' ? '#347474' : '#FFFFFF',
                  color: statusFilter !== 'all' ? '#FFFFFF' : '#343A40'
                }}
                onMouseEnter={(e) => {
                  if (statusFilter === 'all') {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }
                }}
                onMouseLeave={(e) => {
                  if (statusFilter === 'all') {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                <Filter size={20} />
                <span>Status</span>
                {statusFilter !== 'all' && (
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                    1
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10" style={{ border: '1px solid #DEE2E6' }}>
                  <div className="py-2">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'paid', label: 'Pagos' },
                      { value: 'pending', label: 'Pendentes' },
                      { value: 'overdue', label: 'Vencidos' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          statusFilter === option.value ? 'font-medium' : 'hover:bg-gray-50'
                        }`}
                        style={{ 
                          color: statusFilter === option.value ? '#347474' : '#343A40',
                          backgroundColor: statusFilter === option.value ? 'rgba(52, 116, 116, 0.05)' : 'transparent'
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

          {/* Export Button */}
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-50 bg-white shadow-sm"
            style={{ 
              border: '1px solid #DEE2E6',
              color: '#343A40'
            }}
          >
            <Download size={20} />
            <span>Exportar</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: '#DEE2E6' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
              Transações Recentes
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#F8F9FA' }}>
                <tr>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Data
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Cliente/Sessão
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Valor
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Pagamento
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  
                  return (
                    <tr 
                      key={transaction.id} 
                      className={`${index !== filteredTransactions.length - 1 ? 'border-b' : ''} hover:bg-gray-50 transition-colors`}
                      style={{ borderColor: '#F8F9FA' }}
                    >
                      <td className="py-4 px-6" style={{ color: '#343A40' }}>
                        <div className="font-medium">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium" style={{ color: '#343A40' }}>
                              {transaction.client}
                            </span>
                            {transaction.sessionType === 'group' && (
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: 'rgba(244, 162, 97, 0.2)',
                                  color: '#F4A261'
                                }}
                              >
                                👥 {transaction.participants}
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: '#6C757D' }}>
                            {transaction.notes}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-lg" style={{ color: '#347474' }}>
                          R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1"
                            style={{
                              backgroundColor: `${getStatusColor(transaction.status)}15`,
                              color: getStatusColor(transaction.status)
                            }}
                          >
                            <StatusIcon size={14} />
                            <span>{getStatusText(transaction.status)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <CreditCard size={16} style={{ color: '#6C757D' }} />
                          <span style={{ color: '#6C757D' }}>
                            {getPaymentMethodText(transaction.paymentMethod)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === transaction.id ? null : transaction.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            style={{ color: '#6C757D' }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {openDropdown === transaction.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10" style={{ border: '1px solid #DEE2E6' }}>
                              <div className="py-1">
                                <button
                                  onClick={() => setOpenDropdown(null)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                                  style={{ color: '#343A40' }}
                                >
                                  <Eye size={16} />
                                  <span>Ver Detalhes</span>
                                </button>
                                <button
                                  onClick={() => setOpenDropdown(null)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                                  style={{ color: '#343A40' }}
                                >
                                  <Edit size={16} />
                                  <span>Editar</span>
                                </button>
                                <div className="border-t my-1" style={{ borderColor: '#DEE2E6' }} />
                                <button
                                  onClick={() => setOpenDropdown(null)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors flex items-center space-x-2"
                                  style={{ color: '#E76F51' }}
                                >
                                  <Trash2 size={16} />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto mb-4" style={{ color: '#6C757D' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>
                  Nenhuma transação encontrada
                </h3>
                <p style={{ color: '#6C757D' }}>
                  Tente ajustar sua busca ou filtros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;