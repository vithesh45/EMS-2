import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const DIForm = ({ onBack, readOnly = false, initialData = null }) => {
  const { state, dispatch } = useStock();
  
  const [formData, setFormData] = useState({
    diNumber: initialData?.diNumber || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const [tempItem, setTempItem] = useState({ itemId: '', quantity: '' });
  const [addedItems, setAddedItems] = useState(initialData?.items || []);

  const handleAddClick = () => {
    if (!tempItem.itemId || !tempItem.quantity || tempItem.quantity <= 0) return;
    setAddedItems([...addedItems, { 
      itemId: Number(tempItem.itemId), 
      quantity: Number(tempItem.quantity) 
    }]);
    setTempItem({ itemId: '', quantity: '' });
  };

  const handleCreate = () => {
    if (!formData.diNumber || addedItems.length === 0) {
      alert("Please provide a DI Number and add items.");
      return;
    }
    dispatch({
      type: 'ADD_DI',
      payload: { 
        ...formData, 
        items: addedItems, 
        id: Date.now(),
        createdAt: new Date().toISOString() 
      }
    });
    onBack();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <button onClick={onBack} className="mb-6 flex items-center text-gray-900 hover:text-black font-bold transition-colors">
        <ChevronLeft size={20} /> Back to List
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {readOnly ? 'View Delivery Instruction' : 'Create Delivery Instruction'}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Input 
          label="DI Number" 
          value={formData.diNumber} 
          onChange={e => !readOnly && setFormData({...formData, diNumber: e.target.value})} 
          required 
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

      {!readOnly && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 text-indigo-600">Add Materials</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Select Item</label>
              <select 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={tempItem.itemId}
                onChange={(e) => {
                  setTempItem({...tempItem, itemId: e.target.value});
                  e.target.blur(); 
                }}
                onFocus={(e) => (e.target.size = 6)}
                onBlur={(e) => (e.target.size = 1)}
              >
                <option value="">-- Choose Item --</option>
                {state.items.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Quantity</label>
              <input 
                type="number" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                value={tempItem.quantity}
                onChange={e => setTempItem({...tempItem, quantity: e.target.value})}
              />
            </div>
            <Button onClick={handleAddClick} type="button">
              <Plus size={20}/> Add to List
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Item Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Qty</th>
              {!readOnly && <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase w-24">Action</th>}
            </tr>
          </thead>
          <tbody>
            {addedItems.length > 0 ? (
              addedItems.map((item, idx) => {
                const itemInfo = state.items.find(i => i.id === item.itemId);
                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{itemInfo?.name}</td>
                    <td className="px-4 py-3 text-gray-600 italic text-sm">{itemInfo?.unit}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{item.quantity}</td>
                    {!readOnly && (
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setAddedItems(addedItems.filter((_, i) => i !== idx))} 
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={readOnly ? "3" : "4"} className="px-4 py-10 text-center text-gray-400 italic">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
          <Button variant="secondary" onClick={onBack}>Cancel</Button>
          <Button onClick={handleCreate}>Create DI Record</Button>
        </div>
      )}
    </div>
  );
};

export default DIForm;