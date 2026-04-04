import React, { useState } from 'react';
import { Search, PackageSearch, AlertTriangle, XCircle, List } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import StockCard from './StockCard';

const StockDashboard = () => {
  const { state } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 

  // FIX 1: Add optional chaining ?. so it doesn't crash while loading
  const totalItems = state?.items?.length || 0; 
  
  // FIX 2: Add safety check to return empty array if state.items doesn't exist yet
  const items = state?.items || [];
  // Always work against a safe stock map to avoid undefined access
  const stockMap = state?.stock || {};

  // Stats Calculation - Use material_id || id for keys
  const lowStockItems = items.filter(i => {
    const itemId = i.material_id || i.id;
    const qty = stockMap[itemId] || 0;
    return qty < 50 && qty > 0;
  });
  
  const outOfStockItems = items.filter(i => {
    const itemId = i.material_id || i.id;
    return (stockMap[itemId] || 0) === 0;
  });

  // Filtering Logic - Use material_id || id for keys
  const filteredItems = items.filter(item => {
    const itemId = item.material_id || item.id;
    const qty = stockMap[itemId] || 0;
    // FIX 3: Safety check for item.name
    const matchesSearch = (item?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'low') return matchesSearch && qty < 50 && qty > 0;
    if (filterStatus === 'out') return matchesSearch && qty === 0;
    return matchesSearch;
  });

  return (
    <div className="pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <button 
            onClick={() => setFilterStatus('all')}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Stock Inventory {filterStatus !== 'all' && <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2 py-1 rounded-md">/ {filterStatus.toUpperCase()}</span>}
            </h2>
            <p className="text-gray-500 font-medium">Monitoring {totalItems} total items</p>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus(filterStatus === 'low' ? 'all' : 'low')}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
                filterStatus === 'low' 
                ? 'bg-amber-100 border-amber-500 shadow-inner scale-95' 
                : 'bg-white border-amber-100 hover:border-amber-300'
              }`}
            >
              <AlertTriangle size={20} className="text-amber-600" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-amber-600 uppercase leading-none">Low Stock</p>
                <p className="text-xl font-black text-amber-900 leading-none">{lowStockItems.length}</p>
              </div>
            </button>

            <button 
              onClick={() => setFilterStatus(filterStatus === 'out' ? 'all' : 'out')}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
                filterStatus === 'out' 
                ? 'bg-red-100 border-red-500 shadow-inner scale-95' 
                : 'bg-white border-red-100 hover:border-red-300'
              }`}
            >
              <XCircle size={20} className="text-red-600" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-red-600 uppercase leading-none">Out Of Stock</p>
                <p className="text-xl font-black text-red-900 leading-none">{outOfStockItems.length}</p>
              </div>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map(item => {
            const itemId = item.material_id || item.id;
            return (
              <StockCard
                key={itemId} // Use material_id || id for unique key
                item={item}
                quantity={stockMap[itemId] || 0}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <PackageSearch size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold text-lg">
            No {filterStatus !== 'all' ? filterStatus : ''} items match your search
          </p>
          <button 
            onClick={() => {setSearchTerm(''); setFilterStatus('all');}} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 mt-4 shadow-lg shadow-blue-200 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StockDashboard;