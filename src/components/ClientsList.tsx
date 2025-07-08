import React, { useState } from 'react';
import { Search, User, Plus, MoreHorizontal, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import AddClientModal from './AddClientModal';

interface ClientsListProps {
  onNavigateToClient: () => void;
}

type SortField = 'name' | 'email' | 'status' | 'nextSession';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

const ClientsList: React.FC<ClientsListProps> = ({ onNavigateToClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

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
      status: 'Inativo',
      nextSession: null
    }
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const sortClients = (clientsToSort: typeof clients) => {
    return [...clientsToSort].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values for nextSession
      if (sortField === 'nextSession') {
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === 'asc' ? 1 : -1;
        if (!bValue) return sortDirection === 'asc' ? -1 : 1;
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterClients = (clientsToFilter: typeof clients) => {
    let filtered = clientsToFilter;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const targetStatus = statusFilter === 'active' ? 'Ativo' : 'Inativo';
      filtered = filtered.filter(client => client.status === targetStatus);
    }

    return filtered;
  };

  const filteredAndSortedClients = sortClients(filterClients(clients));

  const handleDropdownToggle = (clientId: number) => {
    setOpenDropdown(openDropdown === clientId ? null : clientId);
  };

  const handleRowClick = (clientId: number, event: React.MouseEvent) => {
    // Don't navigate if clicking on the dropdown button
    if ((event.target as Element).closest('[data-dropdown-trigger]')) {
      return;
    }
    onNavigateToClient();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#343A40' }}>Meus Clientes</h1>
        <button 
          onClick={() => setIsAddClientModalOpen(true)}
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

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
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

        {/* Filters Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              statusFilter !== 'all' ? 'text-white' : ''
            }`}
            style={{ 
              border: '1px solid #DEE2E6',
              backgroundColor: statusFilter !== 'all' ? '#347474' : '#FFFFFF',
              color: statusFilter !== 'all' ? '#FFFFFF' : '#343A40'
            }}
            onMouseEnter={(e) => {
              if (statusFilter === 'all') {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
              }
            }}
            onMouseLeave={(e) => {
              if (statusFilter === 'all') {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            <Filter size={20} />
            <span>Filtros</span>
            {statusFilter !== 'all' && (
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                1
              </span>
            )}
          </button>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10" style={{ border: '1px solid #DEE2E6' }}>
              <div className="py-2">
                <div className="px-4 py-2 text-sm font-medium" style={{ color: '#343A40', borderBottom: '1px solid #F8F9FA' }}>
                  Status do Cliente
                </div>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    statusFilter === 'all' ? 'font-medium' : 'hover:bg-gray-50'
                  }`}
                  style={{ 
                    color: statusFilter === 'all' ? '#347474' : '#343A40',
                    backgroundColor: statusFilter === 'all' ? 'rgba(52, 116, 116, 0.05)' : 'transparent'
                  }}
                >
                  Todos
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    statusFilter === 'active' ? 'font-medium' : 'hover:bg-gray-50'
                  }`}
                  style={{ 
                    color: statusFilter === 'active' ? '#347474' : '#343A40',
                    backgroundColor: statusFilter === 'active' ? 'rgba(52, 116, 116, 0.05)' : 'transparent'
                  }}
                >
                  Apenas Ativos
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('inactive');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    statusFilter === 'inactive' ? 'font-medium' : 'hover:bg-gray-50'
                  }`}
                  style={{ 
                    color: statusFilter === 'inactive' ? '#347474' : '#343A40',
                    backgroundColor: statusFilter === 'inactive' ? 'rgba(52, 116, 116, 0.05)' : 'transparent'
                  }}
                >
                  Apenas Inativos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #DEE2E6' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '1px solid #DEE2E6' }}>
            <tr>
              <th 
                className="text-left py-4 px-6 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: sortField === 'name' ? '#347474' : '#343A40' }}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span>Nome do Cliente</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-6 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: sortField === 'email' ? '#347474' : '#343A40' }}
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-2">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-6 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: sortField === 'status' ? '#347474' : '#343A40' }}
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-6 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                style={{ color: sortField === 'nextSession' ? '#347474' : '#343A40' }}
                onClick={() => handleSort('nextSession')}
              >
                <div className="flex items-center space-x-2">
                  <span>Próxima Sessão</span>
                  {getSortIcon('nextSession')}
                </div>
              </th>
              <th className="text-left py-4 px-6 font-semibold" style={{ color: '#343A40' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClients.map((client, index) => (
              <tr 
                key={client.id} 
                className={`${index !== filteredAndSortedClients.length - 1 ? 'border-b' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                style={{ borderColor: '#DEE2E6' }}
                onClick={(e) => handleRowClick(client.id, e)}
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
                      data-dropdown-trigger
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

        {filteredAndSortedClients.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4" style={{ color: '#6C757D' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#343A40' }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum cliente encontrado' 
                : 'Nenhum cliente cadastrado'
              }
            </h3>
            <p style={{ color: '#6C757D' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar sua busca ou filtros.'
                : 'Adicione seu primeiro cliente para começar.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
      />
    </div>
  );
};

export default ClientsList;