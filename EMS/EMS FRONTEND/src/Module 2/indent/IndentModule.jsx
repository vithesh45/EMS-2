import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import IndentForm from './IndentForm';
import IndentDetails from './IndentDetails';

const IndentModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);

  const filteredEntries = useMemo(() => {
    return (state.indents || []).filter(entry =>
      entry.indentNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.indents, searchTerm]);

  if (showForm) return <IndentForm onBack={() => setShowForm(false)} readOnly={readOnly} />;
  if (selectedIndent) return <IndentDetails indent={selectedIndent} onBack={() => setSelectedIndent(null)} readOnly={readOnly} />;

  const columns = [
    { header: 'Indent No', key: 'indentNo' },
    // Replaced Sub-contractor and Date with Region
    { 
      header: 'Region', 
      render: (row) => row.region || '-' 
    },
    { 
      header: 'Work Orders', 
      render: (row) => `${row.workOrderIds.length} Linked WOs`
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          row.status === 'In Progress' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Indent Management</h2>
        {!readOnly && <Button onClick={() => setShowForm(true)}><Plus size={20} /> Add Indent</Button>}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Indent Number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table columns={columns} data={filteredEntries} onRowClick={setSelectedIndent} />
      </div>
    </div>
  );
};

export default IndentModule;