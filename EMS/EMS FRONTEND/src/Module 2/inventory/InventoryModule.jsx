import React, { useState } from 'react';
import { useStock } from '../../hooks/useStock';
import { ChevronLeft, Package, Clock, MapPin, ArrowRight } from 'lucide-react';
import api from '../../api/base';

// --- SUB-COMPONENT: INVENTORY CARD ---
const InventoryCard = ({ data, type, onClick }) => {
  const { state } = useStock();
  
  // Blue if it's an Indent or an In-Progress Work Order
  const isInProgress = type === 'INDENT' || data.status === 'In Progress';
  const title = type === 'INDENT' ? data.indentNo : data.woNumber;

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md ${
        isInProgress 
          ? 'border-blue-400 bg-blue-50/30' 
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-1">
            <MapPin size={12} />
            <span>{data.region}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          isInProgress ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}>
          {isInProgress ? 'In Progress' : 'Todo'}
        </span>
      </div>
      
      <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between items-center">
        <span className="text-[11px] text-gray-500 font-medium">
          {data.items?.length || 0} Materials linked
        </span>
        <ArrowRight size={14} className={isInProgress ? 'text-blue-500' : 'text-gray-300'} />
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: DETAILS VIEW ---
const InventoryDetails = ({ data, type, onBack }) => {
  const { state } = useStock();
  const title = type === 'INDENT' ? data.indentNo : data.woNumber;
  const isInProgress = type === 'INDENT' || data.status === 'In Progress';

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 font-medium">{type === 'INDENT' ? 'Indent' : 'Work Order'} Detail</p>
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            isInProgress ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {data.status}
          </span>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20}/></div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Region / Location</p>
                <p className="font-semibold text-gray-900">{data.region}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20}/></div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Created On</p>
                <p className="font-semibold text-gray-900">{new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-gray-400" />
            Material Breakdown
          </h3>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-tight text-xs">Material Name</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-600 uppercase tracking-tight text-xs">
                    {type === 'INDENT' ? 'Current Issuing' : 'Estimated Requirement'}
                  </th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {data.items.map((item, idx) => {
                const itemDetails = state.items.find(i => 
                  String(i.material_id || i.id) === String(item.itemId)
                );
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {itemDetails?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-gray-900">
                      {type === 'INDENT' ? item.currentIssuing : item.estimated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN MODULE ---
const InventoryModule = ({ readOnly = false }) => {
  const { state, reloadInventory } = useStock();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleMarkComplete = async (wo) => {
    if (readOnly) return;
    if (!wo?.wo_id) return;
    if (!window.confirm('Mark this Work Order as complete and update backend status?')) return;

    try {
      await api.patch(`/workorders/${wo.wo_id}/status/`, { status: 'closed' });
      if (typeof reloadInventory === 'function') {
        await reloadInventory();
      }
    } catch (err) {
      console.error('Failed to mark WO complete', err?.response?.data || err);
      alert('Failed to update Work Order status. Check console for details.');
    }
  };

  // Filter items specifically for the "In Progress" section
  const inProgressItems = [
    ...(state.indents || []).map(i => ({ ...i, displayType: 'INDENT' })),
    ...(state.workOrders || [])
      .filter(wo => wo.status === 'in_progress' || wo.status === 'In Progress')
      .map(w => ({ ...w, displayType: 'WO' }))
  ];

  // Filter items specifically for the "Todo" section
  const todoItems = (state.workOrders || [])
    .filter(wo => wo.status === 'pending' || wo.status === 'Todo')
    .map(w => ({ ...w, displayType: 'WO' }));

  if (selectedItem) {
    return (
      <InventoryDetails 
        data={selectedItem.data} 
        type={selectedItem.type} 
        onBack={() => setSelectedItem(null)} 
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Work Order Tracking</h2>
        <p className="text-gray-500">View In Progress and Todo material issuances</p>
      </div>
      
      <div className="space-y-12">
        {/* IN PROGRESS SECTION */}
        <section>
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
            Currently Issuing (In Progress)
          </h3>
          {inProgressItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressItems.map((item, idx) => (
                <InventoryCard 
                  key={`progress-${item.id}-${idx}`} 
                  data={item} 
                  type={item.displayType} 
                  onClick={() => setSelectedItem({ data: item, type: item.displayType })}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center text-gray-400 italic">
              No work orders currently in progress.
            </div>
          )}
        </section>

        {/* TODO SECTION */}
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
            Pending Work Orders (Todo)
          </h3>
          {todoItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todoItems.map((item, idx) => (
                <div key={`todo-${item.wo_id || item.id || idx}`} className="space-y-2">
                  <InventoryCard 
                    data={item} 
                    type={item.displayType} 
                    onClick={() => setSelectedItem({ data: item, type: item.displayType })}
                  />
                  {!readOnly && item.displayType === 'WO' && item.wo_id && (
                    <button
                      type="button"
                      onClick={() => handleMarkComplete(item)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center text-gray-400 italic">
              No pending work orders.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default InventoryModule;