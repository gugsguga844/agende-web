import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, ArrowLeft, Save, X, Edit, CreditCard, Crown, Calendar, Camera, Upload } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import SubscriptionSettings from './SubscriptionSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PreferencesSettings from './PreferencesSettings';
import IntegrationsSettings from './IntegrationsSettings';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Dr(a). Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    specialty: 'Psicóloga Clínica',
    crp: 'CRP 06/123456',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    cpf: '123.456.789-00',
    photo: null as string | null
  });

  const settingsCategories = [
    {
      id: 'profile',
      icon: User,
      title: 'Perfil',
      description: 'Gerencie suas informações pessoais e profissionais',
      items: ['Informações básicas', 'Credenciais profissionais', 'Endereço do consultório']
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Segurança',
      description: 'Mantenha sua conta segura e protegida',
      items: ['Senha', 'Autenticação em duas etapas', 'Sessões ativas']
    },
    {
      id: 'subscription',
      icon: Crown,
      title: 'Assinatura',
      description: 'Gerencie seu plano e faturamento',
      items: ['Plano atual', 'Histórico de pagamentos', 'Dados de cobrança']
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notificações',
      description: 'Configure como você deseja receber notificações',
      items: ['E-mail', 'Notificações push', 'Lembretes de sessões']
    },
    {
      id: 'preferences',
      icon: Palette,
      title: 'Preferências',
      description: 'Personalize a interface do sistema',
      items: ['Tema', 'Densidade de informações', 'Idioma']
    },
    {
      id: 'integrations',
      icon: Globe,
      title: 'Integrações',
      description: 'Conecte com outras ferramentas e serviços',
      items: ['Calendário', 'Ferramentas de pagamento', 'Exportação de dados']
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsEditing(false);
  };

  const handleBackToMain = () => {
    setActiveSection(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Aqui salvaria os dados
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset data to original values
    setProfileData({
      name: 'Dr(a). Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-9999',
      specialty: 'Psicóloga Clínica',
      crp: 'CRP 06/123456',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      cpf: '123.456.789-00',
      photo: null
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderMainGrid = () => (
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
              <button
                key={category.id}
                onClick={() => handleSectionClick(category.id)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
                style={{ border: '1px solid #DEE2E6' }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: 'rgba(52, 116, 116, 0.1)' }}>
                    <Icon size={24} style={{ color: '#347474' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-[#347474] transition-colors" style={{ color: '#343A40' }}>
                      {category.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: '#6C757D' }}>{category.description}</p>
                    <ul className="space-y-1">
                      {category.items.map((item) => (
                        <li key={item} className="text-xs flex items-center" style={{ color: '#6C757D' }}>
                          <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#6C757D' }}></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    const currentSection = settingsCategories.find(cat => cat.id === activeSection);
    if (!currentSection) return null;

    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSettings
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleCancel={handleCancel}
            handleSave={handleSave}
            getInitials={getInitials}
            handlePhotoUpload={handlePhotoUpload}
          />
        );

      case 'security':
        return <SecuritySettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      case 'integrations':
        return <IntegrationsSettings />;

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F8F9FA' }}>
              {React.createElement(currentSection.icon, { size: 32, style: { color: '#6C757D' } })}
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>
              {currentSection.title} em Breve
            </h3>
            <p className="max-w-md mx-auto leading-relaxed" style={{ color: '#6C757D' }}>
              Esta seção estará disponível em breve com todas as configurações de {currentSection.title.toLowerCase()}.
            </p>
          </div>
        );
    }
  };

  const renderSectionView = () => (
    <div className="flex h-screen">
      {/* Secondary Navigation */}
      <div className="w-64 bg-white shadow-sm flex flex-col h-full" style={{ borderRight: '1px solid #DEE2E6' }}>
        <div className="p-6">
          <button
            onClick={handleBackToMain}
            className="flex items-center space-x-2 text-sm font-medium mb-6 hover:underline"
            style={{ color: '#347474' }}
          >
            <ArrowLeft size={16} />
            <span>Voltar às Configurações</span>
          </button>
          
          <nav className="space-y-1">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              const isActive = activeSection === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleSectionClick(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive 
                      ? 'text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#347474' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#343A40'
                  }}
                >
                  <Icon size={18} />
                  <span className="font-medium">{category.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#343A40' }}>
              {settingsCategories.find(cat => cat.id === activeSection)?.title}
            </h2>
            <p style={{ color: '#6C757D' }}>
              {settingsCategories.find(cat => cat.id === activeSection)?.description}
            </p>
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {activeSection ? renderSectionView() : renderMainGrid()}
    </div>
  );
};

export default Settings;