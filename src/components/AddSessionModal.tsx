import React, { useState } from 'react';
import { X, Calendar, FileText, Bold, Italic, List } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ isOpen, onClose, clientName }) => {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ date, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #DEE2E6' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#343A40' }}>
            Registrar Nova Sessão para {clientName}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-1 transition-colors"
            style={{ color: '#6C757D' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Data da Sessão
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Notas da Sessão
            </label>
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center space-x-2 p-2 rounded-t-lg" style={{ 
              border: '1px solid #DEE2E6',
              backgroundColor: '#F8F9FA'
            }}>
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-gray-200"
                style={{ color: '#6C757D' }}
                title="Negrito"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-gray-200"
                style={{ color: '#6C757D' }}
                title="Itálico"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-gray-200"
                style={{ color: '#6C757D' }}
                title="Lista"
              >
                <List size={16} />
              </button>
            </div>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-b-lg transition-colors resize-none"
              style={{ 
                border: '1px solid #DEE2E6',
                borderTop: 'none',
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
              placeholder="Descreva os pontos principais da sessão, evolução do paciente, técnicas utilizadas, observações importantes..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-50"
              style={{ 
                color: '#343A40',
                border: '1px solid #DEE2E6'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#347474' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d6363';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#347474';
              }}
            >
              Salvar Sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSessionModal;