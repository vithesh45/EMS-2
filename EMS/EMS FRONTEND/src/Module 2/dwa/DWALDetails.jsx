import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStock } from '../../hooks/useStock';

const DWADetails = ({ entry, onBack }) => {
  const { state } = useStock();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-gray-900 hover:text-black font-bold transition-colors"
      >
        <ChevronLeft size={20} /> Back to List
      </button>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-900">DWA Entry Details</h2>
      
      {/* Removed Section and Consumer Name - Only core info remains */}
      <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm text-gray-600 font-medium">DWA Number</p>
          <p className="text-lg font-bold text-gray-900">{entry.dwaNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Date</p>
          <p className="text-lg font-bold text-gray-900">{entry.date}</p>
        </div>
      </div>
      
      <h3 className="text-lg font-bold mb-4 text-gray-900">Items Specification</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Item Name</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {entry.items.map((item, idx) => {
              const itemInfo = state.items.find(i => i.id === Number(item.itemId));
              return (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="border-r border-gray-200 px-4 py-3 font-medium text-gray-900">
                    {itemInfo?.name || 'Unknown Item'}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3 text-gray-600">
                    {itemInfo?.unit || '-'}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-bold text-lg">
                    {item.quantity}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DWADetails;