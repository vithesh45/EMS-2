import React, { useState } from 'react';
import { Plus, Search, MapPin } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import WorkOrderForm from './WorkOrderForm';
import WorkOrderList from './WorkOrderList';

// Accept readOnly prop from App.js
const WorkOrderModule = ({ readOnly = false }) => {
  const { state } = useStock();
  const [view, setView] = useState('list'); 
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWO = (state.workOrders || []).filter(wo => 
    wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wo.region && wo.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pass readOnly down to children so they can hide Save/Submit buttons
  if (view === 'add') return <WorkOrderForm onBack={() => setView('list')} readOnly={readOnly} />;
  if (view === 'details' && selectedEntry) return <WorkOrderList entry={selectedEntry} onBack={() => setView('list')} readOnly={readOnly} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Work Orders</h2>
          <p className="text-gray-600 mt-1">Status: <span className="text-indigo-600 font-bold uppercase">To-Do</span></p>
        </div>
        
        {/* HIDE ADD BUTTON IF READONLY IS TRUE */}
        {!readOnly && (
          <Button onClick={() => setView('add')}>
            <Plus size={20} /> Add Work Order
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search WO or Region..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">WO Number</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWO.length > 0 ? (
                filteredWO.map(wo => (
                  <tr 
                    key={wo.id} 
                    onClick={() => { setSelectedEntry(wo); setView('details'); }}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-black-600 group-hover:text-indigo-900">{wo.woNumber}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {wo.region || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{wo.date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        wo.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {wo.status || 'Todo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No work orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderModule;