// src/components/billing/BillingModule.jsx

import React, { useState, useMemo } from 'react';
import { Search, FileText } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import BillPreview from './BillPreview';

const BillingModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIndent, setSelectedIndent] = useState(null); // Changed variable name
  const itemsPerPage = 10;
// FIX: Renamed variable to match what the rest of the code expects
  const completedIndents = state.indents.filter(indent => indent.status === 'Completed');
  
  const filteredEntries = useMemo(() => {
    return completedIndents.filter(entry =>
      // Use indentNo/dwaNo instead of woNumber
      (entry.indentNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [completedIndents, searchTerm]);
  
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage]);
  
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  
  if (selectedIndent) {
    return <BillPreview indent={selectedIndent} onBack={() => setSelectedIndent(null)} />;
  }

  // Update columns to show the right data
const columns = [
    { header: 'Indent Number', key: 'indentNo' }, // Changed key
    { header: 'Date', key: 'date' },
    { 
      header: 'DWA Number', 
      render: (row) => row.dwaNo || '-' // Direct read from indent
    },
    { 
      header: 'Items', 
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          {row.items.length} items
        </span>
      )
    },
     
      (!readOnly ? [{ 
      header: 'Action', 
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIndent(row);
          }}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <FileText size={16} />
          Generate Bill
        </button>
      )
    }] : [])
  ];

  if (selectedIndent) {
    return <BillPreview indent={selectedIndent} onBack={() => setSelectedIndent(null)} />;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Billing</h2>
        <p className="text-gray-600 mt-1">Generate bills for completed work orders</p>
      </div>
      
      {completedIndents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-amber-100 p-4 rounded-full">
              <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No completed work orders</p>
            <p className="text-gray-500 text-sm">Complete work orders to generate bills</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by WO Number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <Table
            columns={columns}
            data={paginatedEntries}
          />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BillingModule;