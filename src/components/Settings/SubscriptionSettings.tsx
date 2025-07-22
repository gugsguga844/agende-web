import React, { useState } from 'react';
import { Crown, CreditCard, FileText, X, CheckCircle, MoreHorizontal, Plus, Star } from 'lucide-react';

const planPrices = {
  mensal: {
    freemium: 'R$ 0',
    basic: 'R$ 29,90/mês',
    pro: 'R$ 59,90/mês',
    clinic: 'R$ 149,90/mês',
  },
  anual: {
    freemium: 'R$ 0',
    basic: 'R$ 299,00/ano',
    pro: 'R$ 599,00/ano',
    clinic: 'R$ 1.499,00/ano',
  },
};

const plans = [
  {
    id: 'freemium',
    name: 'Freemium',
    features: [
      'Agenda limitada',
      'Gestão básica de clientes',
      'Suporte comunitário',
    ],
    current: false,
  },
  {
    id: 'basic',
    name: 'Básico',
    features: [
      'Agenda completa',
      'Gestão de clientes',
      'Exportação de dados',
      'Suporte por e-mail',
    ],
    current: false,
  },
  {
    id: 'pro',
    name: 'Profissional',
    features: [
      'Tudo do Básico',
      'Notas clínicas avançadas',
      'Gestão financeira',
      'Relatórios',
      'Suporte prioritário',
    ],
    current: true,
  },
  {
    id: 'clinic',
    name: 'Clínica',
    features: [
      'Tudo do Profissional',
      'Gestão de equipe',
      'Permissões avançadas',
      'Painel de produtividade',
      'Customização de marca',
    ],
    current: false,
  },
];

const mockCards = [
  { id: 1, brand: 'Visa', last4: '4532', main: true, exp: '08/27' },
  { id: 2, brand: 'Mastercard', last4: '1234', main: false, exp: '01/26' },
];

const mockHistory = [
  { id: 1, date: '15/07/2025', desc: 'Assinatura Plano Profissional', value: 'R$ 49,90', status: 'Pago', receipt: '#' },
  { id: 2, date: '15/06/2025', desc: 'Assinatura Plano Profissional', value: 'R$ 49,90', status: 'Pago', receipt: '#' },
  { id: 3, date: '15/05/2025', desc: 'Assinatura Plano Profissional', value: 'R$ 49,90', status: 'Pago', receipt: '#' },
];

const SubscriptionSettings: React.FC = () => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmPlanModal, setShowConfirmPlanModal] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [cards, setCards] = useState(mockCards);
  const [addingCard, setAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ brand: '', last4: '', exp: '' });
  const [mainCardId, setMainCardId] = useState(1);
  const nextBillingDate = '15 de Agosto de 2025';
  const lastInvoice = mockHistory[0];
  const [planPeriod, setPlanPeriod] = useState<'mensal' | 'anual'>('mensal');

  // Funções fictícias para cartões
  const handleSetMain = (id: number) => setMainCardId(id);
  const handleRemoveCard = (id: number) => setCards(cards => cards.filter(c => c.id !== id));
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    setCards(cards => [...cards, { ...newCard, id: Date.now(), main: false }]);
    setNewCard({ brand: '', last4: '', exp: '' });
    setAddingCard(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
        Plano e Faturamento
      </h3>
      {/* Card do Plano */}
      <div className="bg-gradient-to-r from-[#347474] to-[#2d6363] rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold mb-2">Plano Profissional</h4>
          <p className="opacity-90">R$ 49,90/mês • Renovação em {nextBillingDate}</p>
        </div>
        <button
          className="px-5 py-2 rounded-lg font-semibold bg-white text-[#347474] hover:bg-gray-100 transition-colors shadow"
          onClick={() => setShowPlanModal(true)}
        >
          Gerir Plano
        </button>
      </div>
      {/* Métodos de Pagamento */}
      <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
        <div>
          <h4 className="font-medium flex items-center gap-2" style={{ color: '#343A40' }}>
            <CreditCard size={18} /> Método de Pagamento
          </h4>
          <p className="text-sm" style={{ color: '#6C757D' }}>Cartão terminado em 4532</p>
        </div>
        <button className="font-medium hover:underline" style={{ color: '#347474' }} onClick={() => setShowPaymentModal(true)}>
          Gerenciar
        </button>
      </div>
      {/* Histórico de Pagamentos */}
      <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
        <div>
          <h4 className="font-medium flex items-center gap-2" style={{ color: '#343A40' }}>
            <FileText size={18} /> Histórico de Pagamentos
          </h4>
          <div className="text-sm" style={{ color: '#6C757D' }}>
            Última fatura: {lastInvoice.desc} - {lastInvoice.value} <a href={lastInvoice.receipt} className="underline ml-2" style={{ color: '#347474' }}>Ver Recibo</a>
          </div>
        </div>
        <button className="font-medium hover:underline" style={{ color: '#347474' }} onClick={() => setShowHistoryModal(true)}>
          Ver histórico completo
        </button>
      </div>
      {/* Cancelar Assinatura */}
      <div className="flex justify-between items-center py-4">
        <div>
          <h4 className="font-medium" style={{ color: '#343A40' }}>Cancelar Assinatura</h4>
          <p className="text-sm" style={{ color: '#6C757D' }}>Cancele a qualquer momento</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors"
          onClick={() => setShowCancelModal(true)}
        >
          Cancelar Assinatura
        </button>
      </div>

      {/* Modal Gerir Plano */}
      {showPlanModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowPlanModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-2xl font-bold mb-8" style={{ color: '#343A40' }}>Comparar Planos</h4>
            {/* Switch Mensal/Anual */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-full bg-[#F8F9FA] border border-[#DEE2E6] p-1">
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${planPeriod === 'mensal' ? 'bg-[#347474] text-white' : 'text-[#347474]'}`}
                  style={{ outline: 'none' }}
                  onClick={() => setPlanPeriod('mensal')}
                >
                  Mensal
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${planPeriod === 'anual' ? 'bg-[#347474] text-white' : 'text-[#347474]'}`}
                  style={{ outline: 'none' }}
                  onClick={() => setPlanPeriod('anual')}
                >
                  Anual
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-8 flex flex-col items-center shadow-sm h-full ${plan.current ? 'border-[#347474] bg-[#F8F9FA]' : 'border-[#DEE2E6] bg-white'}`}
                  style={{ minHeight: 420, display: 'flex' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {plan.current && <Star size={18} className="text-[#347474]" />}<span className="font-bold text-lg" style={{ color: '#343A40' }}>{plan.name}</span>
                  </div>
                  <div className="text-2xl font-bold mb-2" style={{ color: plan.current ? '#347474' : '#343A40' }}>
                    {planPrices[planPeriod][plan.id as keyof typeof planPrices['mensal']]}
                  </div>
                  <ul className="mb-4 space-y-1 text-sm flex-1 w-full" style={{ minHeight: 120 }}>
                    {plan.features.map(f => <li key={f} className="text-[#6C757D]">{f}</li>)}
                  </ul>
                  <div className="flex-1" />
                  <div className="w-full flex justify-center mt-auto">
                    {plan.current ? (
                      <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed w-full" disabled>Plano Atual</button>
                    ) : (
                      <button
                        className="px-4 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors w-full"
                        onClick={() => setShowConfirmPlanModal({ open: true, planId: plan.id })}
                      >
                        {plan.id === 'freemium' || plan.id === 'basic' ? 'Fazer Downgrade' : 'Fazer Upgrade'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Troca de Plano */}
      {showConfirmPlanModal.open && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPlanModal({ open: false, planId: null })}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#343A40' }}>Confirmar Alteração de Plano</h4>
            <p className="mb-4" style={{ color: '#6C757D' }}>
              {showConfirmPlanModal.planId === 'team' && 'Ao fazer upgrade, a cobrança será ajustada proporcionalmente para o novo plano.'}
              {showConfirmPlanModal.planId === 'basic' && 'Ao fazer downgrade, a mudança terá efeito no próximo ciclo de faturação.'}
              {showConfirmPlanModal.planId === 'pro' && 'Você está migrando para o Plano Profissional.'}
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50" onClick={() => setShowConfirmPlanModal({ open: false, planId: null })}>
                Voltar
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363]" onClick={() => { setShowConfirmPlanModal({ open: false, planId: null }); setShowPlanModal(false); }}>
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Gerir Métodos de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowPaymentModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#343A40' }}>Gerenciar Métodos de Pagamento</h4>
            <ul className="mb-4 divide-y divide-[#DEE2E6]">
              {cards.map(card => (
                <li key={card.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} />
                    <span className="font-medium">{card.brand} •••• {card.last4}</span>
                    <span className="text-xs text-[#6C757D]">Exp: {card.exp}</span>
                    {mainCardId === card.id && <span className="ml-2 px-2 py-0.5 rounded bg-[#347474] text-white text-xs">Principal</span>}
                  </div>
                  <div className="relative">
                    <button onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)} className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={18} />
                    </button>
                    {selectedCard === card.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-[#DEE2E6] rounded-lg shadow-lg z-10">
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => { handleSetMain(card.id); setSelectedCard(null); }}>
                          Tornar principal
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600" onClick={() => { handleRemoveCard(card.id); setSelectedCard(null); }}>
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {addingCard ? (
              <form onSubmit={handleAddCard} className="mb-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 rounded border border-[#DEE2E6]" placeholder="Bandeira" value={newCard.brand} onChange={e => setNewCard(c => ({ ...c, brand: e.target.value }))} required />
                  <input className="w-24 px-3 py-2 rounded border border-[#DEE2E6]" placeholder="Final" value={newCard.last4} onChange={e => setNewCard(c => ({ ...c, last4: e.target.value }))} maxLength={4} required />
                  <input className="w-20 px-3 py-2 rounded border border-[#DEE2E6]" placeholder="Exp" value={newCard.exp} onChange={e => setNewCard(c => ({ ...c, exp: e.target.value }))} maxLength={5} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-3 py-1 rounded border border-gray-300 text-gray-700" onClick={() => setAddingCard(false)}>Cancelar</button>
                  <button type="submit" className="px-3 py-1 rounded bg-[#347474] text-white font-semibold">Adicionar</button>
                </div>
              </form>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#347474] text-[#347474] font-semibold hover:bg-[#F8F9FA] transition-colors" onClick={() => setAddingCard(true)}>
                <Plus size={18} /> Adicionar novo método de pagamento
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal Cancelar Assinatura */}
      {showCancelModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowCancelModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#E76F51' }}>Cancelar Assinatura</h4>
            <p className="mb-4" style={{ color: '#343A40' }}>
              Tem certeza de que deseja cancelar sua assinatura?<br />
              <span className="text-sm" style={{ color: '#6C757D' }}>
                Você perderá o acesso às funcionalidades do Plano Profissional no final do seu ciclo de faturação em <b>{nextBillingDate}</b>.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50" onClick={() => setShowCancelModal(false)}>
                Voltar
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#E76F51] text-white font-semibold hover:bg-[#c94c2b]" onClick={() => { setShowCancelModal(false); /* ação real de cancelamento */ }}>
                Sim, cancelar assinatura
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Histórico de Pagamentos */}
      {showHistoryModal && (
        <div className="fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowHistoryModal(false)}>
              <X size={20} />
            </button>
            <h4 className="text-xl font-bold mb-6" style={{ color: '#343A40' }}>Histórico de Pagamentos</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DEE2E6]">
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Descrição</th>
                  <th className="py-2 px-3">Valor</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Recibo</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map(item => (
                  <tr key={item.id} className="border-b border-[#F1F1F1]">
                    <td className="py-2 px-3 whitespace-nowrap">{item.date}</td>
                    <td className="py-2 px-3">{item.desc}</td>
                    <td className="py-2 px-3">{item.value}</td>
                    <td className="py-2 px-3">{item.status}</td>
                    <td className="py-2 px-3">
                      <a href={item.receipt} className="underline text-[#347474]">Ver Recibo</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;
