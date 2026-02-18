import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const AddSupplierModal = ({ isOpen, onClose }) => {
  const { dispatch } = useStock();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (!name || !address) return;
    dispatch({ type: 'ADD_SUPPLIER', payload: { name, address } });
    setName('');
    setAddress('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Supplier">
      <div>
        <Input
          label="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Supplier</Button>
        </div>
      </div>
    </Modal>
  );
};

const InwardForm = ({ onBack }) => {
  const { state, addInward } = useStock();
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ho';

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dcNo: '',
    lrNo: '',
    vehicleNo: '',
    supplierId: ''
  });
  const [items, setItems] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const addItem = () => {
    if (isReadOnly) return;
    setItems([...items, {
      itemId: '',
      asPerChallan: 0,
      actualReceipt: 0,
      short: 0,
      reject: 0,
      accepted: 0,
      remarks: ''
    }]);
  };

  const removeItem = (index) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    if (isReadOnly) return;
    const newItems = [...items];

    // FIX: Ensure value is not negative for numeric fields
    const sanitizedValue = (field !== 'itemId' && field !== 'remarks') ? Math.max(0, value) : value;
    newItems[index][field] = sanitizedValue;

    const challan = Number(newItems[index].asPerChallan) || 0;
    const actual = Number(newItems[index].actualReceipt) || 0;
    const reject = Number(newItems[index].reject) || 0;

    if (actual > 0 || challan > 0) {
      // FIX: Use Math.max(0, ...) to prevent negative results
      newItems[index].short = Math.max(0, challan - actual);
      newItems[index].accepted = Math.max(0, actual - reject);
    } else {
      newItems[index].short = 0;
      newItems[index].accepted = 0;
    }

    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (!formData.date || !formData.supplierId || items.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    // Validate that all items have material selected and accepted quantity > 0
    const invalidItems = items.filter(item => !item.itemId || item.accepted <= 0);
    if (invalidItems.length > 0) {
      alert('Please ensure all items have a material selected and accepted quantity is greater than 0');
      return;
    }

    const payload = {
      supplier: formData.supplierId,
      date: formData.date,
      dcNo: formData.dcNo,
      lrNo: formData.lrNo,
      vehicleNo: formData.vehicleNo,
      items: items.map(item => ({
        material: item.itemId,
        asPerChallan: item.asPerChallan,
        actualReceipt: item.actualReceipt,
        short: item.short,
        reject: item.reject,
        accepted: item.accepted,
        quantity: item.accepted,
        remarks: item.remarks
      }))
    };

    try {
      await addInward(payload);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Error saving to database. Check if your backend is running.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Inward Entry</h2>
        {isReadOnly && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
            <ShieldAlert size={16} /> Read Only Mode (Head Office)
          </span>
        )}
      </div>

      <div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={isReadOnly}
            required
          />
          <Input
            label="DC No"
            value={formData.dcNo}
            onChange={(e) => setFormData({ ...formData, dcNo: e.target.value })}
            disabled={isReadOnly}
            required
          />
          <Input
            label="LR No"
            value={formData.lrNo}
            onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
            disabled={isReadOnly}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Vehicle No"
            value={formData.vehicleNo}
            onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
            disabled={isReadOnly}
            required
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier <span className="text-danger-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
              value={formData.supplierId || ""}
              disabled={isReadOnly}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'add-new') {
                  setShowSupplierModal(true);
                } else {
                  setFormData({ ...formData, supplierId: val });
                }
              }}
              required
            >
              <option value="">Select Supplier</option>
              {state.suppliers.map(s => (
                <option key={s.supplier_id || s.id} value={s.supplier_id || s.id}>{s.name}</option>
              ))}
              {!isReadOnly && <option value="add-new">+ Add New Supplier</option>}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Items</h3>
            {!isReadOnly && (
              <Button onClick={addItem}>
                <Plus size={20} /> Add Item
              </Button>
            )}
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Item</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">As Per Challan</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Actual Receipt</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Short</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Reject</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Accepted</th>
                  <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Remarks</th>
                  {!isReadOnly && <th className="border-r border-blue-200 px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Action</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="border-r border-gray-200 px-4 py-2">
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50"
                        value={item.itemId || ""}
                        disabled={isReadOnly}
                        onChange={(e) => updateItem(idx, 'itemId', e.target.value)}
                        required
                      >
                        <option value="">Select Item</option>
                        {state.items.map(i => (
                          <option key={i.material_id || i.id} value={i.material_id || i.id}>{i.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded disabled:bg-gray-50"
                        value={item.asPerChallan}
                        disabled={isReadOnly}
                        onChange={(e) => updateItem(idx, 'asPerChallan', Number(e.target.value))}
                        required
                      />
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded disabled:bg-gray-50"
                        value={item.actualReceipt}
                        disabled={isReadOnly}
                        onChange={(e) => updateItem(idx, 'actualReceipt', Number(e.target.value))}
                        required
                      />
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-100 font-semibold text-gray-600"
                        value={item.short > 0 ? item.short : ''}
                        readOnly
                      />
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded disabled:bg-gray-50"
                        value={item.reject}
                        disabled={isReadOnly}
                        onChange={(e) => updateItem(idx, 'reject', Number(e.target.value))}
                      />
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded bg-green-50 font-bold text-green-700"
                        value={item.accepted}
                        readOnly
                      />
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded disabled:bg-gray-50"
                        value={item.remarks}
                        disabled={isReadOnly}
                        onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 p-1.5 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onBack}>{isReadOnly ? 'Close' : 'Cancel'}</Button>
          {!isReadOnly && <Button onClick={handleSubmit}>Submit Inward Entry</Button>}
        </div>
      </div>

      <AddSupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
      />
    </div>
  );
};

export default InwardForm;