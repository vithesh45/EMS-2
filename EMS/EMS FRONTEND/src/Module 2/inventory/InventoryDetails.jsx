import React from 'react';
import { ChevronLeft, Package, Clock, MapPin } from 'lucide-react';
import { useStock } from '../../hooks/useStock';

const InventoryDetails = ({ data, type, onBack }) => {
  const { state } = useStock();
  const title = type === 'INDENT' ? data.indentNo : data.woNumber;

  return (
    <div className="bg-white min-h-screen rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 font-medium">{type} Reference Detail</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
          data.status === 'In Progress' || type === 'INDENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {data.status}
        </span>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20}/></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Region</p>
              <p className="font-semibold text-gray-900">{data.region}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20}/></div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Created Date</p>
              <p className="font-semibold text-gray-900">{new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-gray-400" />
          Material Breakdown
        </h3>
        
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-6 py-4 font-bold text-gray-600">Material Name</th>
                <th className="px-6 py-4 text-center font-bold text-gray-600">
                  {type === 'INDENT' ? 'Current Issuing' : 'Estimated'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item, idx) => {
                const itemDetails = state.items.find(i => i.id === item.itemId);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{itemDetails?.name}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold">
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
  );
};

export default InventoryDetails;