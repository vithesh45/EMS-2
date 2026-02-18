import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DWAForm from './DWAForm';
import DWADetails from './DWALDetails';

const DWAModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const itemsPerPage = 10;

  const filteredEntries = useMemo(() => {
    return (state.dwaEntries || []).filter(entry =>
      entry.dwaNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.dwaEntries, searchTerm]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;

 if (showForm) return <DWAForm onBack={() => setShowForm(false)} readOnly={readOnly} />;
  if (selectedEntry) return <DWADetails entry={selectedEntry} onBack={() => setSelectedEntry(null)} readOnly={readOnly} />;

  const columns = [
    { 
      header: 'NO.', 
      render: (row, idx) => ((currentPage - 1) * itemsPerPage) + (idx !== undefined ? idx : paginatedEntries.indexOf(row)) + 1
    },
    { header: 'DWA Number', key: 'dwaNumber' },
    { header: 'Date Created', key: 'date' },
    { 
      header: 'Items', 
      render: (row) => (
        <span className="text-blue-600 font-bold">
          {row.items.length} Materials
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">DWA Entries</h2>
          <p className="text-gray-600 mt-1">Manage work authorization records</p>
        </div>
        {!readOnly && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} /> Add DWA
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by DWA Number..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={paginatedEntries}
          onRowClick={setSelectedEntry}
        />

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default DWAModule;