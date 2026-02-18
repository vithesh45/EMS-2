import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../common/Button';

const InwardDetails = ({ entry, onBack }) => {
  const { state } = useStock();
  
  // Handle both Frontend (supplierId) and Backend (supplier) keys
  // Use supplier_name from backend first, then fallback to lookup
  const supplierName = entry.supplier_name || 
    (state.suppliers?.find(s => 
      (s.supplier_id || s.id) === (entry.supplier || entry.supplierId || entry.supplier_id)
    )?.name) || 'N/A';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-primary-600 hover:text-primary-700 font-medium"
      >
        <ChevronLeft size={20} /> Back to List
      </button>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Inward Entry Details</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm text-gray-600 font-medium">Inward No</p>
          <p className="text-lg font-bold text-gray-900">{entry.inwardNo || entry.inward_no}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Date</p>
          <p className="text-lg font-bold text-gray-900">{entry.date}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">DC No</p>
          <p className="text-lg font-bold text-gray-900">{entry.dcNo || entry.dc_no}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">LR No</p>
          <p className="text-lg font-bold text-gray-900">{entry.lrNo || entry.lr_no}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Vehicle No</p>
          <p className="text-lg font-bold text-gray-900">{entry.vehicleNo || entry.vehicle_no}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Supplier</p>
          <p className="text-lg font-bold text-gray-900">{supplierName}</p>
        </div>
      </div>
      
      <h3 className="text-lg font-bold mb-4 text-gray-900">Items Received</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Item Name</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">As Per Challan</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Actual Receipt</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Short</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Reject</th>
              <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Accepted</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-primary-900 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {(entry.items || []).map((item, idx) => {
              // Use material_name from backend first, then fallback to lookup
              const materialName = item.material_name || 
                (item.material && typeof item.material === 'object' ? item.material.name : null) ||
                (state.items?.find(i => 
                  (i.material_id || i.id) === (item.material?.material_id || item.material || item.itemId)
                )?.name) ||
                'Unknown Item';
              
              return (
                <tr key={item.id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="border-r border-gray-200 px-4 py-3 font-medium">{materialName}</td>
                  <td className="border-r border-gray-200 px-4 py-3">{item.as_per_challan || item.asPerChallan || '-'}</td>
                  <td className="border-r border-gray-200 px-4 py-3">{item.actual_receipt || item.actualReceipt || '-'}</td>
                  <td className="border-r border-gray-200 px-4 py-3 text-orange-600 font-semibold">{item.short || '-'}</td>
                  <td className="border-r border-gray-200 px-4 py-3 text-red-600 font-semibold">{item.reject || '-'}</td>
                  <td className="border-r border-gray-200 px-4 py-3 text-green-600 font-bold text-lg">{item.accepted || item.quantity || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 italic">{item.remarks || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InwardDetails;