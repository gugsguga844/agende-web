import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, ArrowLeft, Save, X, Edit, CreditCard, Crown, Calendar, Camera, Upload } from 'lucide-react';

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
          <div className="space-y-8">
            {/* Header do Perfil */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar/Foto */}
                  <div className="relative group">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold relative overflow-hidden"
                      style={{ backgroundColor: profileData.photo ? 'transparent' : '#347474' }}
                    >
                      {profileData.photo ? (
                        <img 
                          src={profileData.photo} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(profileData.name)
                      )}
                    </div>
                    
                    {/* Overlay de upload */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <label className="cursor-pointer">
                          <Camera size={20} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Informações de Identificação */}
                  <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: '#343A40' }}>
                      {profileData.name}
                    </h2>
                    <p className="text-lg" style={{ color: '#6C757D' }}>
                      {profileData.specialty}
                    </p>
                  </div>
                </div>

                {/* Ação Principal */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: '#347474' }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d6363';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#347474';
                  }}
                >
                  <Edit size={16} />
                    <span>Editar Perfil</span>
                </button>
                )}
              </div>
            </div>

            {/* Seção: Informações de Contato */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: '#343A40' }}>
                Informações de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                  />
                ) : (
                    <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
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
                  />
                ) : (
                    <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.phone}</p>
                )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Endereço do Consultório
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg transition-colors resize-none"
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
                ) : (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#F8F9FA' }}>
                    <p className="leading-relaxed" style={{ color: '#6C757D' }}>
                      {profileData.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Informações Profissionais */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #DEE2E6' }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: '#343A40' }}>
                Informações Profissionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                    Especialidade
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
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
                  />
                ) : (
                    <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.specialty}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  Registro Profissional
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.crp}
                    onChange={(e) => setProfileData({ ...profileData, crp: e.target.value })}
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
                  />
                ) : (
                    <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.crp}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
                  CPF/NIF <span className="text-sm font-normal" style={{ color: '#6C757D' }}>(para recibos)</span>
              </label>
              {isEditing ? (
                  <input
                    type="text"
                    value={profileData.cpf}
                    onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
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
                    placeholder="000.000.000-00"
                />
              ) : (
                  <p className="py-2 font-medium" style={{ color: '#343A40' }}>{profileData.cpf}</p>
                )}
                </div>
            </div>

            {/* Botões de Ação */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid #DEE2E6' }}>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    color: '#343A40',
                    border: '1px solid #DEE2E6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#347474' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6363';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#347474';
                  }}
                >
                  <Save size={16} />
                  <span>Salvar</span>
                </button>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
              Segurança da Conta
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Senha</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Última alteração há 3 meses</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Alterar Senha
                </button>
              </div>
              
              <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Autenticação em Duas Etapas</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Adicione uma camada extra de segurança</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Configurar
                </button>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Sessões Ativas</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Gerencie dispositivos conectados</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Ver Sessões
                </button>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
              Plano e Faturamento
            </h3>
            
            <div className="bg-gradient-to-r from-[#347474] to-[#2d6363] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2">Plano Profissional</h4>
                  <p className="opacity-90">R$ 49,90/mês • Renovação em 15 dias</p>
                </div>
                <Crown size={32} className="opacity-80" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Método de Pagamento</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Cartão terminado em 4532</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Atualizar
                </button>
              </div>
              
              <div className="flex justify-between items-center py-4" style={{ borderBottom: '1px solid #DEE2E6' }}>
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Histórico de Pagamentos</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Ver faturas e recibos</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Ver Histórico
                </button>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <div>
                  <h4 className="font-medium" style={{ color: '#343A40' }}>Cancelar Assinatura</h4>
                  <p className="text-sm" style={{ color: '#6C757D' }}>Cancele a qualquer momento</p>
                </div>
                <button className="font-medium hover:underline" style={{ color: '#F4A261' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );

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