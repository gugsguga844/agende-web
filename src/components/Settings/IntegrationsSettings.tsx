import React, { useState } from 'react';
import { Calendar, CreditCard, CheckCircle, Circle, ChevronRight, RefreshCw, LogOut } from 'lucide-react';

const integrations = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sincronize as suas sessões do Sessio com a sua agenda Google para ver todos os seus compromissos num único lugar.',
    icon: <Calendar size={36} className="text-[#4285F4]" />, // Google blue
    type: 'calendar',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Receba pagamentos dos seus pacientes diretamente através de faturas com link geradas pelo Sessio.',
    icon: <CreditCard size={36} className="text-[#635BFF]" />, // Stripe purple
    type: 'payment',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Receba pagamentos dos seus pacientes diretamente através de faturas com link geradas pelo Sessio.',
    icon: <CreditCard size={36} className="text-[#009EE3]" />, // Mercado Pago blue
    type: 'payment',
  },
];

const mockStatus = {
  'google-calendar': 'connected',
  stripe: 'disconnected',
  mercadopago: 'disconnected',
};

const IntegrationsSettings: React.FC = () => {
  const [modal, setModal] = useState<null | 'google-calendar' | 'stripe' | 'mercadopago'>(null);
  const [status, setStatus] = useState<typeof mockStatus>(mockStatus);
  const [syncBothWays, setSyncBothWays] = useState(true);
  const [selectedCalendar, setSelectedCalendar] = useState('Agenda Principal');
  const [loading, setLoading] = useState(false);

  // Mock agendas do Google
  const googleCalendars = ['Agenda Principal', 'Pessoal', 'Trabalho'];

  const handleConnect = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      setStatus(s => ({ ...s, [id]: 'connected' }));
      setLoading(false);
    }, 1200);
  };

  const handleDisconnect = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      setStatus(s => ({ ...s, [id]: 'disconnected' }));
      setModal(null);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>Integrações</h2>
      <p className="mb-6 text-[#6C757D]">Conecte o Sessio com outras ferramentas essenciais para automatizar tarefas e centralizar sua rotina profissional.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {integrations.map(integration => (
          <div key={integration.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col border border-[#DEE2E6] h-full">
            <div className="flex items-center gap-4 mb-4">
              {integration.icon}
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>{integration.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {status[integration.id as keyof typeof status] === 'connected' ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${status[integration.id as keyof typeof status] === 'connected' ? 'text-green-600' : 'text-gray-500'}`}>
                    {status[integration.id as keyof typeof status] === 'connected' ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[#6C757D] flex-1 mb-6">{integration.description}</p>
            <div className="flex justify-end mt-auto">
              {status[integration.id as keyof typeof status] === 'connected' ? (
                <button
                  className="px-5 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors flex items-center gap-2"
                  onClick={() => setModal(integration.id as any)}
                  disabled={loading}
                >
                  Gerir <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  className="px-5 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors flex items-center gap-2"
                  onClick={() => handleConnect(integration.id)}
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Conectar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Modal Google Calendar */}
      {modal === 'google-calendar' && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
              <Calendar size={24} className="text-[#4285F4]" /> Google Calendar
            </h3>
            <div className="mb-6">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input type="checkbox" checked={syncBothWays} onChange={() => setSyncBothWays(v => !v)} className="accent-[#347474]" />
                Sincronização Bidirecional
              </label>
              <label className="block font-medium mb-2">Escolha da Agenda</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-[#DEE2E6] text-[#343A40] focus:border-[#347474] focus:ring-2 focus:ring-[#347474]"
                value={selectedCalendar}
                onChange={e => setSelectedCalendar(e.target.value)}
              >
                {googleCalendars.map(cal => (
                  <option key={cal} value={cal}>{cal}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between mt-8">
              <button
                className="px-5 py-2 rounded-lg bg-[#E76F51] text-white font-semibold hover:bg-[#c75a3a] transition-colors flex items-center gap-2"
                onClick={() => handleDisconnect('google-calendar')}
                disabled={loading}
              >
                <LogOut size={18} /> Desconectar
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors"
                onClick={() => setModal(null)}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Stripe */}
      {modal === 'stripe' && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
              <CreditCard size={24} className="text-[#635BFF]" /> Stripe
            </h3>
            <p className="mb-6 text-[#6C757D]">Receba pagamentos dos seus pacientes diretamente através de faturas com link geradas pelo Sessio.</p>
            <div className="flex justify-between mt-8">
              <button
                className="px-5 py-2 rounded-lg bg-[#E76F51] text-white font-semibold hover:bg-[#c75a3a] transition-colors flex items-center gap-2"
                onClick={() => handleDisconnect('stripe')}
                disabled={loading}
              >
                <LogOut size={18} /> Desconectar
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors"
                onClick={() => setModal(null)}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Mercado Pago */}
      {modal === 'mercadopago' && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 relative">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
              <CreditCard size={24} className="text-[#009EE3]" /> Mercado Pago
            </h3>
            <p className="mb-6 text-[#6C757D]">Receba pagamentos dos seus pacientes diretamente através de faturas com link geradas pelo Sessio.</p>
            <div className="flex justify-between mt-8">
              <button
                className="px-5 py-2 rounded-lg bg-[#E76F51] text-white font-semibold hover:bg-[#c75a3a] transition-colors flex items-center gap-2"
                onClick={() => handleDisconnect('mercadopago')}
                disabled={loading}
              >
                <LogOut size={18} /> Desconectar
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors"
                onClick={() => setModal(null)}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings; 