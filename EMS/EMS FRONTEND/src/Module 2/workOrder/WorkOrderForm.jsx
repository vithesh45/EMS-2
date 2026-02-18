import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const WorkOrderForm = ({ onBack, readOnly = false, initialData = null }) => {
  const { state, dispatch } = useStock();
  
  const [formData, setFormData] = useState({
    woNumber: initialData?.woNumber || '',
    region: initialData?.region || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [tempItem, setTempItem] = useState({ itemId: '', estimated: '' });
  const [addedItems, setAddedItems] = useState(initialData?.items || []);

  const handleAddClick = () => {
    if (!tempItem.itemId || !tempItem.estimated || tempItem.estimated <= 0) return;
    
    setAddedItems([...addedItems, { 
      itemId: Number(tempItem.itemId), 
      estimated: Number(tempItem.estimated),
      issued: 0 
    }]);

    setTempItem({ itemId: '', estimated: '' });
  };

 const handleCreate = () => {
    if (!formData.woNumber || !formData.region || addedItems.length === 0) {
      alert("Please fill WO Number, Region and add at least one item.");
      return;
    }

    dispatch({
      type: 'ADD_WORK_ORDER',
      payload: { 
        woNumber: formData.woNumber, 
        region: formData.region,
        date: formData.date,
        items: addedItems
      }
    });
    
    // This was missing! It takes you back to the list
    onBack(); 
  }; 

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button onClick={onBack} className="mb-6 flex items-center text-gray-900 hover:text-black font-bold transition-colors">
        <ChevronLeft size={20} /> Back to List
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-900">{readOnly ? 'View Work Order' : 'New Work Order'}</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Input 
          label="WO Number" 
          placeholder="WO/2026/..." 
          value={formData.woNumber} 
          onChange={e => !readOnly && setFormData({...formData, woNumber: e.target.value})} 
          disabled={readOnly}
        />
        <Input 
          label="Region / Location" 
          placeholder="Enter Region" 
          value={formData.region} 
          onChange={e => !readOnly && setFormData({...formData, region: e.target.value})} 
          disabled={readOnly}
        />
        <Input 
          label="Date" 
          type="date" 
          value={formData.date} 
          onChange={e => !readOnly && setFormData({...formData, date: e.target.value})} 
          disabled={readOnly}
        />
      </div>

      {/* Material Input Row */}
      {!readOnly && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Select Item</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={tempItem.itemId}
                onChange={(e) => {
                  setTempItem({...tempItem, itemId: e.target.value});
                  e.target.blur();
                }}
                onFocus={(e) => (e.target.size = 6)}
                onBlur={(e) => (e.target.size = 1)}
              >
                <option value="">-- Choose Material --</option>
                {state.items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Estimated Qty</label>
              <input 
                type="number" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="0"
                value={tempItem.estimated}
                onChange={e => setTempItem({...tempItem, estimated: e.target.value})}
              />
            </div>
            <Button onClick={handleAddClick} type="button">
              <Plus size={20}/> Add Item
            </Button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-50 border-b-2 border-indigo-100 text-indigo-900 font-bold uppercase text-xs">
              <th className="px-6 py-3 text-left">Item Name</th>
              <th className="px-6 py-3 text-left">Unit</th>
              <th className="px-6 py-3 text-left">Estimated Qty</th>
              {!readOnly && <th className="px-6 py-3 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {addedItems.length > 0 ? (
              addedItems.map((item, idx) => {
                const itemInfo = state.items.find(i => i.id === item.itemId);
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-bold text-gray-900">{itemInfo?.name}</td>
                    <td className="px-6 py-3 text-gray-500 italic text-sm">{itemInfo?.unit}</td>
                    <td className="px-6 py-3 font-black text-indigo-700">{item.estimated}</td>
                    {!readOnly && (
                      <td className="px-6 py-3 text-center">
                        <button onClick={() => setAddedItems(addedItems.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={readOnly ? "3" : "4"} className="px-6 py-8 text-center text-gray-400 italic">No materials added to estimate yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button variant="secondary" onClick={onBack}>Cancel</Button>
          <Button onClick={handleCreate}>Create Work Order</Button>
        </div>
      )}
    </div>
  );
};

export default WorkOrderForm;