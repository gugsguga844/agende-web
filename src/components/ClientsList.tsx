import React, { useState } from 'react';
import { Search, User, Plus, MoreHorizontal } from 'lucide-react';

interface ClientsListProps {
  onNavigateToClient: () => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ onNavigateToClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const clients = [
    {
      id: 1,
      name: 'Juliana Costa',
      email: 'juliana@email.com',
      status: 'Ativo',
      nextSession: '2024-01-20'
    },
    {
      id: 2,
      name: 'Carlos Mendes',
      email: 'carlos@email.com',
      status: 'Ativo',
      nextSession: '2024-01-22'
    },
    {
      id: 3,
      name: 'Maria Santos',
      email: 'maria@email.com',
      status: 'Ativo',
      nextSession: '2024-01-21'
    },
    {
      id: 4,
      name: 'Pedro Oliveira',
      email: 'pedro@email.com',
      status: 'Inativo',
      nextSession: null
    },
    {
      id: 5,
      name: 'Ana Rodrigues',
      email: 'ana@email.com',
      status: 'Ativo',
      nextSession: '2024-01-23'
    },
    {
      id: 6,
      name: 'João Silva',
      email: 'joao@email.com',
      status: 'Ativo',
      nextSession: '2024-01-24'
    },
    {
      id: 7,
      name: 'Carla Ferreira',
      email: 'carla@email.com',
      status: 'Ativo',
      nextSession: '2024-01-25'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDropdownToggle = (clientId: number) => {
    setOpenDropdown(openDropdown === clientId ? null : clientId);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Meus Clientes</h1>
        <button 
          className="px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
          style={{ backgroundColor: '#347474' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d6363';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#347474';
          }}
        >
          <Plus size={20} />
          <span>Adicionar Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg transition-colors"
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '1px solid #DEE2E6' }}>
            <tr>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Nome do Cliente</th>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Email</th>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Status</th>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Próxima Sessão</th>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, index) => (
              <tr 
                key={client.id} 
                className={`${index !== filteredClients.length - 1 ? 'border-b' : ''} hover:bg-gray-50 transition-colors`}
                style={{ borderColor: '#DEE2E6' }}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
                      <User size={16} style={{ color: '#6C757D' }} />
                    </div>
                    <span className="font-medium" style={{ color: '#343A40' }}>{client.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6" style={{ color: '#6C757D' }}>{client.email}</td>
                <td className="py-4 px-6">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === 'Ativo' 
                        ? 'text-white' 
                        : 'text-white'
                    }`}
                    style={{
                      backgroundColor: client.status === 'Ativo' ? '#347474' : '#6C757D'
                    }}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="py-4 px-6" style={{ color: '#6C757D' }}>
                  {client.nextSession 
                    ? new Date(client.nextSession).toLocaleDateString('pt-BR')
                    : '-'
                  }
                </td>
                <td className="py-4 px-6">
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(client.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{ color: '#6C757D' }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {openDropdown === client.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10" style={{ border: '1px solid #DEE2E6' }}>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onNavigateToClient();
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: '#343A40' }}
                          >
                            Ver Perfil
                          </button>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: '#343A40' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: '#343A40' }}
                          >
                            Arquivar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4" style={{ color: '#6C757D' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>Nenhum cliente encontrado</h3>
            <p style={{ color: '#6C757D' }}>Tente ajustar sua busca ou adicione um novo cliente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsList;