"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"

// Tipo para os dados da API
interface DashboardData {
  monthly_revenue: {
    current_value: number
    previous_month_value: number
    comparison_previous_month_percentage: number
  }
  sessions_today: {
    completed: number
    total: number
  }
  pending_payments: {
    count: number
    total_value: number
  }
}

// Props do componente
interface DashboardCardsProps {
  data: DashboardData
}

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função para formatar percentual
const formatPercentage = (value: number) => {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

export default function DashboardCards({ data }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Sessões de Hoje */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#347474]" />
              </div>
              <h3 className="text-sm font-medium text-[#6B7280]">Sessões de Hoje</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Métricas principais */}
            <div className="flex-1">
              <div className="text-3xl font-bold text-[#343A40] mb-1">{data.sessions_today.total}</div>
              <div className="flex items-center space-x-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    data.sessions_today.completed === data.sessions_today.total
                      ? "bg-[#347474] bg-opacity-10 text-[#347474]"
                      : "bg-gray-100 text-[#6B7280]"
                  }`}
                >
                  {data.sessions_today.completed === data.sessions_today.total && data.sessions_today.total > 0
                    ? "✓ Completas"
                    : `${data.sessions_today.completed} de ${data.sessions_today.total} completadas`}
                </div>
              </div>
            </div>

            {/* Gráfico de Anel */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                {/* Círculo de fundo */}
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Círculo de progresso */}
                <path
                  className="text-[#347474]"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={`${
                    data.sessions_today.total > 0
                      ? (data.sessions_today.completed / data.sessions_today.total) * 100
                      : 0
                  }, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Percentual no centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#347474]">
                  {data.sessions_today.total > 0
                    ? Math.round((data.sessions_today.completed / data.sessions_today.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Faturamento no Mês */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#347474] bg-opacity-10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#347474]" />
              </div>
              <h3 className="text-sm font-medium text-[#6B7280]">Faturamento no Mês</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Valor principal */}
            <div className="flex-1">
              <div className="text-3xl font-bold text-[#343A40] mb-1">
                {formatCurrency(data.monthly_revenue.current_value)}
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    data.monthly_revenue.comparison_previous_month_percentage >= 0
                      ? "bg-[#347474] bg-opacity-10 text-[#347474]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {formatPercentage(data.monthly_revenue.comparison_previous_month_percentage)} vs. mês anterior
                </div>
              </div>
            </div>

            {/* Sparkline dinâmico baseado na comparação */}
            <div className="w-20 h-10 relative group">
              <svg className="w-full h-full cursor-pointer" viewBox="0 0 80 40" preserveAspectRatio="none">
                {/* Definir gradiente para área preenchida */}
                <defs>
                  <linearGradient id="sparklineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#347474" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#347474" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="sparklineAreaGradientNegative" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Gerar dados do sparkline baseado na comparação */}
                {(() => {
                  const isPositive = data.monthly_revenue.comparison_previous_month_percentage >= 0;
                  const percentage = Math.abs(data.monthly_revenue.comparison_previous_month_percentage);
                  
                  // Gerar pontos do sparkline baseado na porcentagem
                  const points = [];
                  const numPoints = 8;
                  
                  for (let i = 0; i < numPoints; i++) {
                    const x = (i / (numPoints - 1)) * 80;
                    let y;
                    
                    if (isPositive) {
                      // Linha crescente para valores positivos
                      y = 40 - (i / (numPoints - 1)) * 25 - (percentage / 100) * 10;
                    } else {
                      // Linha decrescente para valores negativos
                      y = 15 + (i / (numPoints - 1)) * 20 + (percentage / 100) * 5;
                    }
                    
                    points.push(`${x},${y}`);
                  }
                  
                  const pathData = `M ${points.join(' L ')}`;
                  const areaPathData = `${pathData} L 80,40 L 0,40 Z`;
                  
                  return (
                    <>
                      {/* Área preenchida */}
                      <path
                        d={areaPathData}
                        fill={isPositive ? "url(#sparklineAreaGradient)" : "url(#sparklineAreaGradientNegative)"}
                      />
                      
                      {/* Linha do sparkline */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isPositive ? "#347474" : "#EF4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:stroke-width-3 transition-all duration-200"
                      />
                      
                      {/* Ponto destacado no final */}
                      <circle 
                        cx="80" 
                        cy={isPositive ? "5" : "35"} 
                        r="2.5" 
                        fill={isPositive ? "#347474" : "#EF4444"} 
                        className="group-hover:r-3 transition-all duration-200"
                      />
                    </>
                  );
                })()}
                              </svg>
                
                {/* Tooltip no hover */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${data.monthly_revenue.comparison_previous_month_percentage >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="font-medium">
                      {data.monthly_revenue.comparison_previous_month_percentage >= 0 ? '+' : ''}
                      {data.monthly_revenue.comparison_previous_month_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-gray-300 text-xs mb-1">
                    vs. mês anterior
                  </div>
                  <div className="text-gray-300 text-xs">
                    Mês anterior: {formatCurrency(data.monthly_revenue.previous_month_value)}
                  </div>
                  
                  {/* Seta do tooltip */}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Pagamentos Pendentes */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#F4A261] bg-opacity-10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-[#F4A261]" />
              </div>
              <h3 className="text-sm font-medium text-[#6B7280]">Pagamentos Pendentes</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Métrica principal */}
            <div className="flex-1">
              <div className="text-3xl font-bold text-[#343A40] mb-1">{data.pending_payments.count}</div>
              <div className="flex items-center space-x-2">
                {data.pending_payments.count > 0 ? (
                  <div className="text-xs px-2 py-1 rounded-full font-medium bg-[#F4A261] bg-opacity-10 text-[#F4A261]">
                    {formatCurrency(data.pending_payments.total_value)} total
                  </div>
                ) : (
                  <div className="text-xs px-2 py-1 rounded-full font-medium bg-[#347474] bg-opacity-10 text-[#347474]">
                    ✓ Tudo em dia
                  </div>
                )}
              </div>
            </div>

            {/* Ícone de status */}
            <div className="w-8 h-8 flex items-center justify-center">
              {data.pending_payments.count > 0 ? (
                <div className="text-xl">⚠️</div>
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#347474]" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Exemplo de uso:
export function ExampleUsage() {
  // Exemplo com crescimento positivo
  const positiveData: DashboardData = {
    monthly_revenue: {
      current_value: 12450.0,
      previous_month_value: 10800.0,
      comparison_previous_month_percentage: 15.3,
    },
    sessions_today: {
      completed: 3,
      total: 5,
    },
    pending_payments: {
      count: 4,
      total_value: 680.0,
    },
  }

  // Exemplo com queda
  const negativeData: DashboardData = {
    monthly_revenue: {
      current_value: 8500.0,
      previous_month_value: 9260.0,
      comparison_previous_month_percentage: -8.2,
    },
    sessions_today: {
      completed: 2,
      total: 3,
    },
    pending_payments: {
      count: 1,
      total_value: 150.0,
    },
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Crescimento Positivo (+15.3%)</h3>
        <DashboardCards data={positiveData} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Queda (-8.2%)</h3>
        <DashboardCards data={negativeData} />
      </div>
    </div>
  )
}
