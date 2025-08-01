"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"

// Tipo para os dados da API
interface DashboardData {
  monthly_revenue: {
    current_value: number
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
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
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
                    : `${data.sessions_today.completed} de ${data.sessions_today.total}`}
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
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
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

            {/* Sparkline com área preenchida */}
            <div className="w-20 h-10">
              <svg className="w-full h-full" viewBox="0 0 80 40" preserveAspectRatio="none">
                {/* Definir gradiente para área preenchida */}
                <defs>
                  <linearGradient id="sparklineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Área preenchida */}
                <path
                  d="M0,30 L13,25 L26,28 L39,20 L52,16 L65,12 L80,8 L80,40 L0,40 Z"
                  fill="url(#sparklineAreaGradient)"
                />

                {/* Linha do sparkline */}
                <path
                  d="M0,30 L13,25 L26,28 L39,20 L52,16 L65,12 L80,8"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Ponto destacado no final */}
                <circle cx="80" cy="8" r="2.5" fill="#7C3AED" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Pagamentos Pendentes */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
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
  const exampleData: DashboardData = {
    monthly_revenue: {
      current_value: 12450.0,
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

  return <DashboardCards data={exampleData} />
}
