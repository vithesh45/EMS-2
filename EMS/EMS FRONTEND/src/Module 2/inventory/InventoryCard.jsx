import React from 'react';
import { useStock } from '../../hooks/useStock';
import { MapPin, Package } from 'lucide-react';

const InventoryCard = ({ data, type, onClick }) => {
  const { state } = useStock();
  
  // LOGIC: If it's an Indent OR if it's a Work Order marked 'In Progress', show Blue.
  const isActive = type === 'INDENT' || data.status === 'In Progress';
  const title = type === 'INDENT' ? data.indentNo : data.woNumber;

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:scale-[1.01] ${
        isActive 
          ? 'border-blue-400 bg-blue-50/20' 
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
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}>
          {isActive ? 'Active' : 'Pending'}
        </span>
      </div>
      
      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap gap-2">
          {data.items.slice(0, 3).map((item, idx) => {
            const itemDetails = state.items.find(i => i.id === item.itemId);
            return (
              <span key={idx} className="text-[10px] bg-white/50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                {itemDetails?.name}
              </span>
            );
          })}
          {data.items.length > 3 && <span className="text-[10px] text-gray-400">+{data.items.length - 3} more</span>}
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;