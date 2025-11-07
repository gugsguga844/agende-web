import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  // Estado dos toggles
  const [prefs, setPrefs] = useState({
    // Lembretes de Agendamento
    reminder24h: true,
    reminder1h: true,
    patientConfirm: true,
    patient24h: true,
    // Gestão Financeira
    paymentConfirmation: true,
    financialSummary: false,
    // Comunicações do AgendeWeb
    productUpdates: true,
    tipsAndArticles: true,
    // Alertas importantes (sempre on)
    accountAlerts: true,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleToggle = (key: keyof typeof prefs) => {
    if (key === 'accountAlerts') return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setToast({ show: true, message: 'Preferências de notificação salvas.', type: 'success' });
  };

  // Switch visual
  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      className={`w-12 h-6 rounded-full flex items-center transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#347474]' : 'bg-gray-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      tabIndex={0}
    >
      <span
        className={`inline-block w-5 h-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-4 right-4 z-[100] transition-all duration-300 ease-in-out transform"
          style={{ animation: 'slideInFromRight 0.3s ease-out' }}
        >
          <div 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg max-w-sm min-w-[300px]"
            style={{ backgroundColor: toast.type === 'success' ? '#347474' : '#E76F51', color: '#FFFFFF' }}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0" />
            )}
            <p className="font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors flex-shrink-0"
            >
              <span className="sr-only">Fechar</span>
              ×
            </button>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>Notificações</h2>
      <p className="mb-6 text-[#6C757D]">Gerencie como e quando você recebe comunicações do AgendeWeb.</p>
      {/* Lembretes de Agendamento */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Mail size={18} className="text-[#347474]" /> Lembretes de Agendamento
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Lembrete de agendamento (24h antes)</span>
              <p className="text-sm text-[#6C757D]">Receba um lembrete por e-mail dos agendamentos do dia seguinte.</p>
            </div>
            <Switch checked={prefs.reminder24h} onChange={() => handleToggle('reminder24h')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Lembrete de agendamento (1h antes)</span>
              <p className="text-sm text-[#6C757D]">Receba um lembrete próximo ao horário do agendamento.</p>
            </div>
            <Switch checked={prefs.reminder1h} onChange={() => handleToggle('reminder1h')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Enviar lembrete de confirmação ao agendar</span>
              <p className="text-sm text-[#6C757D]">Envia um e-mail ao cliente assim que o agendamento é marcado. (Plano Profissional)</p>
            </div>
            <Switch checked={prefs.patientConfirm} onChange={() => handleToggle('patientConfirm')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Enviar lembrete de agendamento ao cliente (24h antes)</span>
              <p className="text-sm text-[#6C757D]">Ajuda a reduzir faltas. (Plano Profissional)</p>
            </div>
            <Switch checked={prefs.patient24h} onChange={() => handleToggle('patient24h')} />
          </div>
        </div>
      </section>
      {/* Gestão Financeira */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Mail size={18} className="text-[#347474]" /> Gestão Financeira
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Confirmação de pagamento registado</span>
              <p className="text-sm text-[#6C757D]">Receba um e-mail sempre que um pagamento for marcado como "Paga".</p>
            </div>
            <Switch checked={prefs.paymentConfirmation} onChange={() => handleToggle('paymentConfirmation')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Resumo financeiro semanal/mensal</span>
              <p className="text-sm text-[#6C757D]">Receba um relatório simples por e-mail com as métricas financeiras do período.</p>
            </div>
            <Switch checked={prefs.financialSummary} onChange={() => handleToggle('financialSummary')} />
          </div>
        </div>
      </section>
      {/* Comunicações do AgendeWeb */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#343A40' }}>
          <Mail size={18} className="text-[#347474]" /> Comunicações do AgendeWeb
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Novidades e atualizações do produto</span>
              <p className="text-sm text-[#6C757D]">Fique por dentro das novas funcionalidades e melhorias do AgendeWeb.</p>
            </div>
            <Switch checked={prefs.productUpdates} onChange={() => handleToggle('productUpdates')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Dicas e artigos para a prática profissional</span>
              <p className="text-sm text-[#6C757D]">Receba conteúdos e dicas para aprimorar sua atuação.</p>
            </div>
            <Switch checked={prefs.tipsAndArticles} onChange={() => handleToggle('tipsAndArticles')} />
          </div>
        </div>
      </section>
      <div className="flex justify-end pt-4">
        <button
          className="px-6 py-2 rounded-lg bg-[#347474] text-white font-semibold hover:bg-[#2d6363] transition-colors"
          onClick={handleSave}
        >
          Salvar Preferências
        </button>
      </div>
      {/* CSS Animation para toast */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings; 