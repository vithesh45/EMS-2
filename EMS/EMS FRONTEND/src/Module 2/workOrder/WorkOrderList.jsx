import React from 'react';
import { ChevronLeft, MapPin, Calendar, Package } from 'lucide-react';
import { useStock } from '../../hooks/useStock';

const WorkOrderList = ({ entry, onBack }) => {
  const { state } = useStock();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button onClick={onBack} className="mb-6 flex items-center text-black font-bold">
        <ChevronLeft size={20} /> Back to List
      </button>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{entry.woNumber || entry.wo_number}</h2>
          <div className="flex gap-4 text-sm font-bold text-indigo-600 uppercase">
            <span className="flex items-center gap-1"><MapPin size={16} /> {entry.region}</span>
            <span className="flex items-center gap-1"><Calendar size={16} /> {entry.date}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
          <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg">
            {entry.status}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider">
              <th className="px-6 py-4 text-left">Sl</th>
              <th className="px-6 py-4 text-left">Material Description</th>
              <th className="px-6 py-4 text-center text-indigo-900">Estimated</th>
              <th className="px-6 py-4 text-center text-blue-900">Issued</th>
              <th className="px-6 py-4 text-center text-amber-900">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {((entry.items || entry.materials) || []).length > 0 ? (
              (entry.items || entry.materials).map((item, idx) => {
                const itemInfo = state.items.find(i =>
                  String(i.name).toLowerCase() === String(item.itemId || item.material).toLowerCase()
                );

                const displayName = itemInfo?.name || item.material || 'Unknown';
                const displayUnit = itemInfo?.unit || item.unit || '-';
                const estimated = item.estimated || item.quantity || 0;
                const issued = item.issued || 0;
                const balance = estimated - issued;

                return (
                  <tr key={item.itemId || item.material || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-500 italic">{displayUnit}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-black text-indigo-700 bg-indigo-50/30">
                      {estimated}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-700">
                      {issued}
                    </td>
                    <td className={`px-6 py-4 text-center text-sm font-black ${balance > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {balance}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkOrderList;