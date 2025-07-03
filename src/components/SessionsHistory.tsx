import React, { useState } from 'react';
import { Calendar, ChevronDown, FileText, Clock, Edit } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface SessionsHistoryProps {
  onNavigateToClient: () => void;
}

const SessionsHistory: React.FC<SessionsHistoryProps> = ({ onNavigateToClient }) => {
  const [selectedDateRange, setSelectedDateRange] = useState("Hoje")  

  return (
    <div className="flex-1 bg-[#F9FAFB] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header da Página */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937]">Histórico de Sessões</h1>

          {/* Seletor de Data Avançado */}
          <div className="relative group">
            <button className="inline-flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-[#1F2937] font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{selectedDateRange}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {/* Dropdown de Opções de Data */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Períodos Rápidos
                </div>

                {["Hoje", "Ontem", "Esta Semana", "Semana Passada", "Este Mês", "Mês Passado"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedDateRange(period)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedDateRange === period
                        ? "bg-[#2563EB] bg-opacity-10 text-[#2563EB] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    📅 Selecionar dia específico
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    📊 Selecionar intervalo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Lista Cronológica */}
        <div className="space-y-8">
          {/* Grupo por Dia - Terça-feira */}
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-[#1F2937]">Terça-feira, 30 de Janeiro de 2024</h2>
              <div className="ml-4 text-sm text-[#6B7280] bg-gray-100 px-3 py-1 rounded-full">3 sessões</div>
            </div>

            <div className="space-y-4">
              {[
                {
                  time: "14:00",
                  client: "Juliana Costa",
                  type: "Presencial",
                  paymentStatus: "Pago",
                  notes:
                    "Paciente demonstrou progresso significativo na gestão da ansiedade. Relatou melhora no sono e maior controle emocional durante situações de estresse...",
                },
                {
                  time: "15:30",
                  client: "Carlos Santos",
                  type: "Online",
                  paymentStatus: "Pago",
                  notes:
                    "Primeira consulta realizada com sucesso. Paciente apresentou histórico de ansiedade social. Estabelecemos objetivos terapêuticos iniciais...",
                },
                {
                  time: "17:00",
                  client: "Maria Oliveira",
                  type: "Presencial",
                  paymentStatus: "Pendente",
                  notes:
                    "Sessão de terapia de casal. Trabalhamos questões de comunicação e estabelecimento de limites saudáveis na relação...",
                },
              ].map((session, index) => (
                <Card
                  key={index}
                  className="bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-[#347474]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Informações Principais */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-[#347474]" />
                            <span className="text-xl font-bold text-[#1F2937]">{session.time}</span>
                          </div>
                          <div className="h-6 w-px bg-gray-300"></div>
                          <h3 className="text-lg font-semibold text-[#1F2937]">{session.client}</h3>
                        </div>

                        {/* Tags de Contexto */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge
                            className={`text-xs px-2 py-1 ${
                              session.type === "Online" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {session.type}
                          </Badge>
                          <Badge
                            className={`text-xs px-2 py-1 ${
                              session.paymentStatus === "Pago"
                                ? "bg-[#10B981] text-white"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {session.paymentStatus}
                          </Badge>
                        </div>

                        {/* Notas da Sessão */}
                        <p className="text-sm text-[#6B7280] leading-relaxed">{session.notes}</p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#347474] text-[#347474] hover:bg-[#347474] hover:text-white bg-transparent"
                          onClick={() => onNavigateToClient()}
                        >
                          Ver Prontuário
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-[#6B7280] hover:bg-gray-50 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar Nota
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Grupo por Dia - Segunda-feira */}
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-[#1F2937]">Segunda-feira, 29 de Janeiro de 2024</h2>
              <div className="ml-4 text-sm text-[#6B7280] bg-gray-100 px-3 py-1 rounded-full">2 sessões</div>
            </div>

            <div className="space-y-4">
              {[
                {
                  time: "10:00",
                  client: "Pedro Lima",
                  type: "Presencial",
                  paymentStatus: "Pago",
                  notes:
                    "Sessão focada em técnicas de mindfulness e controle de impulsos. Paciente relatou melhora na gestão da raiva...",
                },
                {
                  time: "16:00",
                  client: "Ana Rodrigues",
                  type: "Online",
                  paymentStatus: "Pago",
                  notes:
                    "Continuidade do trabalho com transtorno de ansiedade generalizada. Revisamos as técnicas de respiração...",
                },
              ].map((session, index) => (
                <Card
                  key={index}
                  className="bg-white hover:shadow-md transition-all duration-200 border-l-4 border-l-[#347474]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Informações Principais */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-[#347474]" />
                            <span className="text-xl font-bold text-[#1F2937]">{session.time}</span>
                          </div>
                          <div className="h-6 w-px bg-gray-300"></div>
                          <h3 className="text-lg font-semibold text-[#1F2937]">{session.client}</h3>
                        </div>

                        {/* Tags de Contexto */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge
                            className={`text-xs px-2 py-1 ${
                              session.type === "Online" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {session.type}
                          </Badge>
                          <Badge
                            className={`text-xs px-2 py-1 ${
                              session.paymentStatus === "Pago"
                                ? "bg-[#10B981] text-white"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {session.paymentStatus}
                          </Badge>
                        </div>

                        {/* Notas da Sessão */}
                        <p className="text-sm text-[#6B7280] leading-relaxed">{session.notes}</p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#347474] text-[#347474] hover:bg-[#347474] hover:text-white bg-transparent"
                          onClick={() => onNavigateToClient()}
                        >
                          Ver Prontuário
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-[#6B7280] hover:bg-gray-50 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar Nota
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Estado Vazio (quando não há sessões) */}
          {selectedDateRange === "Mês Passado" && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-[#1F2937] mb-2">Nenhuma sessão encontrada</h3>
              <p className="text-[#6B7280] mb-4">
                Não há sessões registradas para o período selecionado.
                <br />
                Tente selecionar outra data ou intervalo.
              </p>
              <Button
                variant="outline"
                className="border-[#347474] text-[#347474] hover:bg-[#347474] hover:text-white bg-transparent"
                onClick={() => setSelectedDateRange("Esta Semana")}
              >
                Ver Esta Semana
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsHistory;