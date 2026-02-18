import React from 'react';
import { useStock } from '../../hooks/useStock';
import { Calendar, Package } from 'lucide-react';

const DITable = ({ di }) => {
  const { state } = useStock();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Indigo/Blue Gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900">{di.diNumber}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-blue-700">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{di.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>{di.items.length} items</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">DI Document</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sl No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {di.items.map((item, idx) => {
              // Lookup from state to ensure name/unit shows for new items
              const itemDetails = state.items.find(i => i.id === Number(item.itemId));
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{itemDetails?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 italic">{itemDetails?.unit}</td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-700">{item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DITable;