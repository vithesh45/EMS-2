import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'; 
import { useStock } from '../../hooks/useStock';
import Button from '../common/Button';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import InwardForm from './InwardForm';
import InwardDetails from './InwardDetails';

const InwardModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const itemsPerPage = 10;
  
  const filteredEntries = useMemo(() => {
    // Add check to ensure arrays exist
    if (!state.inwardEntries) return [];

    return state.inwardEntries.filter(entry => {
      // Use supplier_name from backend or fallback to finding supplier
      const supplierName = entry.supplier_name || 
        (state.suppliers && state.suppliers.find(s => 
          (s.supplier_id || s.id) === (entry.supplier || entry.supplierId)
        )?.name) || "";
      
      const search = searchTerm.toLowerCase();
      const inwardNo = (entry.inward_no || entry.inwardNo || "").toLowerCase();
      const supplierNameLower = supplierName.toLowerCase();

      return inwardNo.includes(search) || supplierNameLower.includes(search);
    });
  }, [state.inwardEntries, state.suppliers, searchTerm]);
  
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage).map((entry, index) => ({
      ...entry,
      slNo: start + index + 1
    }));
  }, [filteredEntries, currentPage]);
  
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  
  if (showForm) return <InwardForm onBack={() => setShowForm(false)} readOnly={readOnly} />;
  if (selectedEntry) return <InwardDetails entry={selectedEntry} onBack={() => setSelectedEntry(null)} readOnly={readOnly} />;

  const columns = [
    { 
      header: 'NO.', 
      key: 'slNo',
      render: (row) => row.slNo || ((currentPage - 1) * itemsPerPage) + 1
    },
    { 
      header: 'Inward No', 
      render: (row) => row.inward_no || row.inwardNo || '-'
    },
    { header: 'Date', key: 'date' },
    { 
      header: 'Supplier', 
      render: (row) => {
        // Use supplier_name from backend first, then fallback to lookup
        if (row.supplier_name) return row.supplier_name;
        const supplier = state.suppliers?.find(s => 
          (s.supplier_id || s.id) === (row.supplier || row.supplierId)
        );
        return supplier?.name || 'N/A';
      }
    },
    { header: 'DC No', render: (row) => row.dc_no || row.dcNo || '-' },
    { header: 'Vehicle No', render: (row) => row.vehicle_no || row.vehicleNo || '-' },
    { 
      header: 'Items', 
      render: (row) => {
        const itemCount = (row.items || []).length;
        return (
          <span className="text-blue-600 font-bold">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </span>
        );
      }
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Inward Entries</h2>
          <p className="text-gray-600 mt-1">Manage incoming stock entries</p>
        </div>
        {/* HIDE ADD BUTTON IN READ-ONLY MODE */}
        {!readOnly && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} /> Add Inward
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Inward No or Supplier..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

export default InwardModule;