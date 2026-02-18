import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../common/Button';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import OutwardForm from './OutwardForm';
import OutwardDetails from './OutwardDetails';

const OutwardModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const itemsPerPage = 10;
  
  const filteredEntries = useMemo(() => {
    if (!state.outwardEntries) return [];

    return state.outwardEntries.filter(entry => {
      // Use subcontractor_name from backend or fallback to finding subcontractor
      const subcontractorName = entry.subcontractor_name || 
        (state.subContractors?.find(s => 
          (s.subcontractor_id || s.id) === (entry.subcontractor || entry.subContractorId || entry.subcontractor_id)
        )?.name) || "";
      
      const search = searchTerm.toLowerCase();
      const outwardNo = (entry.outward_no || entry.outwardNo || "").toLowerCase();
      const subName = subcontractorName.toLowerCase();

      return outwardNo.includes(search) || subName.includes(search);
    });
  }, [state.outwardEntries, state.subContractors, searchTerm]);
  
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage).map((entry, index) => ({
      ...entry,
      slNo: start + index + 1
    }));
  }, [filteredEntries, currentPage]);

  if (showForm) return <OutwardForm onBack={() => setShowForm(false)} readOnly={readOnly} />;
  if (selectedEntry) return <OutwardDetails entry={selectedEntry} onBack={() => setSelectedEntry(null)} readOnly={readOnly} />;

  const columns = [
    { 
      header: 'NO.', 
      key: 'slNo',
      render: (row) => row.slNo || ((currentPage - 1) * itemsPerPage) + 1
    },
    { 
      header: 'Outward No', 
      render: (row) => row.outward_no || row.outwardNo || 'N/A'
    },
    { 
      header: 'Sub-contractor', 
      render: (row) => {
        // Use subcontractor_name from backend first, then fallback to lookup
        if (row.subcontractor_name) return row.subcontractor_name;
        const subcontractor = state.subContractors?.find(s => 
          (s.subcontractor_id || s.id) === (row.subcontractor || row.subContractorId || row.subcontractor_id)
        );
        return subcontractor?.name || 'N/A';
      }
    },
    { header: 'Date', key: 'date' },
    { 
      header: 'Items', 
      render: (row) => <span className="text-blue-600 font-bold">{(row.items || []).length} Units</span>
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Outward Entries</h2>
          <p className="text-gray-600 mt-1">Manage outgoing stock dispatches</p>
        </div>
        {/* HIDE ADD BUTTON IN READ-ONLY MODE */}
        {!readOnly && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} /> Add Outward
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Outward No or Sub-contractor..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table columns={columns} data={paginatedEntries} onRowClick={setSelectedEntry} />
        
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEntries.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default OutwardModule;