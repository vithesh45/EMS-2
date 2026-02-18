import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import DIForm from './DIForm';
import DITable from './DITable';

const DIModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [view, setView] = useState('list'); // 'list' or 'add'

  if (view === 'add') {
    return <DIForm onBack={() => setView('list')} readOnly={readOnly} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Delivery Instructions</h2>
          <p className="text-gray-600 mt-1">Manage delivery instruction records</p>
        </div>
        {!readOnly && (
          <Button onClick={() => setView('add')}>
            <Plus size={20} /> Add DI
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {state.deliveryInstructions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No delivery instructions found.</p>
          </div>
        ) : (
          state.deliveryInstructions.map(di => (
            <DITable key={di.id} di={di} />
          ))
        )}
      </div>
    </div>
  );
};

export default DIModule;