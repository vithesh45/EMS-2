import React from 'react';
// Added Package and FileText to the import list below
import { ChevronLeft, CheckCircle, User, Calendar, Package, FileText,  MapPin } from 'lucide-react'; 
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';

const IndentDetails = ({ indent, onBack }) => {
  const { state, dispatch } = useStock();
  const sub = state.subContractors.find(s => s.id === indent.subContractorId);

  const handleComplete = () => {
    if (window.confirm('Are you sure? This will deduct materials from Warehouse Inventory and mark the Indent/Work Orders as Completed.')) {
      dispatch({ 
        type: 'COMPLETE_INDENT', 
        payload: { indentId: indent.id } 
      });
      onBack();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button onClick={onBack} className="mb-6 flex items-center text-black font-bold">
        <ChevronLeft size={20} /> Back to List
      </button>

      {/* SYNCED HEADER STYLE */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{indent.indentNo}</h2>
          <div className="flex gap-4 text-sm font-bold text-indigo-600 uppercase">
            <span className="flex items-center gap-1"><User size={16}/> {sub?.name}</span>
            <span className="flex items-center gap-1"><Calendar size={16}/> {indent.date}</span>
            <span className="flex items-center gap-1"><MapPin size={16}/> {indent.region}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1 text-center">Status</p>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg text-white ${indent.status === 'In Progress' ? 'bg-indigo-600' : 'bg-green-600'}`}>
              {indent.status}
            </span>
          </div>
          
          {indent.status === 'In Progress' && (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white flex gap-2 shadow-md border-none">
              <CheckCircle size={18} /> Complete & Deduct Stock
            </Button>
          )}
        </div>
      </div>

      <h3 className="font-black text-gray-900 mb-4 uppercase text-sm tracking-widest flex items-center gap-2">
        <Package size={18} className="text-indigo-600"/> Materials Issued in this Indent
      </h3>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider">
              <th className="px-6 py-4 text-left">Sl</th>
              <th className="px-6 py-4 text-left"> Work Order</th>
              <th className="px-6 py-4 text-left">Material Description</th>
              <th className="px-6 py-4 text-center text-blue-900">Quantity Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {indent.items.map((item, idx) => {
              const itemInfo = state.items.find(i => i.id === Number(item.itemId));
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-black text-indigo-600">
                    {item.woNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{itemInfo?.name}</div>
                    <div className="text-xs text-gray-500 italic">{itemInfo?.unit}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-blue-700 bg-blue-50/30">
                    {item.currentIssuing}
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

export default IndentDetails;