import React from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const settingsCategories = [
    {
      icon: User,
      title: 'Perfil',
      description: 'Gerencie suas informações pessoais e profissionais',
      items: ['Informações básicas', 'Credenciais profissionais', 'Foto de perfil']
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Configure como você deseja receber notificações',
      items: ['E-mail', 'Notificações push', 'Lembretes de sessões']
    },
    {
      icon: Shield,
      title: 'Privacidade e Segurança',
      description: 'Mantenha suas informações e dados seguros',
      items: ['Senha', 'Autenticação em duas etapas', 'Backup de dados']
    },
    {
      icon: Palette,
      title: 'Aparência',
      description: 'Personalize a interface do sistema',
      items: ['Tema', 'Densidade de informações', 'Idioma']
    },
    {
      icon: Globe,
      title: 'Integração',
      description: 'Conecte com outras ferramentas e serviços',
      items: ['Calendário', 'Ferramentas de pagamento', 'Exportação de dados']
    },
    {
      icon: HelpCircle,
      title: 'Suporte',
      description: 'Obtenha ajuda e suporte técnico',
      items: ['Central de ajuda', 'Contato', 'Reportar problema']
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#343A40' }}>Configurações</h1>
          <p style={{ color: '#6C757D' }}>Gerencie suas preferências e configurações do sistema</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.title} 
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                style={{ border: '1px solid #DEE2E6' }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                    <Icon size={24} style={{ color: '#347474' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#343A40' }}>{category.title}</h3>
                    <p className="text-sm mb-3" style={{ color: '#6C757D' }}>{category.description}</p>
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item} className="text-xs" style={{ color: '#6C757D' }}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#343A40' }}>Conta</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #DEE2E6' }}>
              <div>
                <h3 className="font-medium" style={{ color: '#343A40' }}>Plano Atual</h3>
                <p className="text-sm" style={{ color: '#6C757D' }}>Profissional - R$ 49,90/mês</p>
              </div>
              <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                Gerenciar Plano
              </button>
            </div>
            <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #DEE2E6' }}>
              <div>
                <h3 className="font-medium" style={{ color: '#343A40' }}>Dados de Cobrança</h3>
                <p className="text-sm" style={{ color: '#6C757D' }}>Cartão terminado em 4532</p>
              </div>
              <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                Atualizar
              </button>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium" style={{ color: '#343A40' }}>Excluir Conta</h3>
                <p className="text-sm" style={{ color: '#6C757D' }}>Remover permanentemente sua conta e dados</p>
              </div>
              <button className="font-medium hover:underline" style={{ color: '#F4A261' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;