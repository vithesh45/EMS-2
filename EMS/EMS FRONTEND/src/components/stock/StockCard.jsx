import React from 'react';
import { Package, TrendingDown, AlertCircle } from 'lucide-react';
import { getStockStatus } from '../../utils/calculations';

const StockCard = ({ item, quantity }) => {
  const status = getStockStatus(quantity);
  
  const getIcon = () => {
    if (quantity === 0) return AlertCircle;
    if (quantity < 50) return TrendingDown;
    return Package;
  };

  const Icon = getIcon();

  const getStyles = () => {
    // We removed the background (bg-red-50, etc.) and kept only text/border colors
    if (quantity === 0) return { card: "border-gray-200", text: "text-red-600", badge: "bg-red-50 text-red-700 border-red-100" };
    if (quantity < 50) return { card: "border-gray-200", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-100" };
    return { card: "border-gray-200", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  };

  const s = getStyles();

  return (
    // Card is now bg-white and side-by-side (handled by your dashboard grid)
    <div className={`rounded-xl border bg-white px-4 py-3 transition-all shadow-sm hover:shadow-md ${s.card} flex items-center justify-between h-24`}>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.unit}</p>
        <h3 className="text-sm font-bold text-gray-800 truncate mb-1" title={item.name}>
          {item.name}
        </h3>
        {/* Badge is now subtle with light background and colored text */}
        <div className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${s.badge}`}>
          {status.label}
        </div>
      </div>
      
      <div className="flex flex-col items-end justify-center">
        {/* Only the icon and number carry the status color now */}
        <Icon className={`${s.text} mb-1`} size={18} />
        <span className={`text-3xl font-bold leading-none ${s.text}`}>{quantity}</span>
      </div>
    </div>
  );
};

export default StockCard;