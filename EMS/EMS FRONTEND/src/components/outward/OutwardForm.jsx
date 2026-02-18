import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useStock } from '../../hooks/useStock';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/base';

const AddSubContractorModal = ({ isOpen, onClose }) => {
  const { dispatch } = useStock();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (!name || !address) return;
    dispatch({ type: 'ADD_SUBCONTRACTOR', payload: { name, address } });
    setName('');
    setAddress('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Sub-contractor">
      <div className="space-y-4">
        <Input
          label="Sub-contractor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
        <Input
          label="Address / Location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
          required
        />
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Sub-contractor</Button>
        </div>
      </div>
    </Modal>
  );
};

const OutwardForm = ({ onBack }) => {
  const { state, addOutward } = useStock();
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ho';
  const [showModal, setShowModal] = useState(false);

  // Fetching real Indents from Backend to avoid UUID Validation errors
  const [indents, setIndents] = useState([]);
  const [loadingIndents, setLoadingIndents] = useState(true);

  useEffect(() => {
    const fetchIndents = async () => {
      try {
        const response = await api.get('/inventory/indents/');
        setIndents(response.data);
      } catch (err) {
        console.error("Failed to fetch indents", err);
      } finally {
        setLoadingIndents(false);
      }
    };
    fetchIndents();
  }, []);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    indentId: '', // Now stores the UUID from DB
    vehicleNo: '',
    subContractorId: ''
  });
  const [items, setItems] = useState([{ itemId: '', quantity: 0, remarks: '' }]);

  const updateItem = (index, field, value) => {
    if (isReadOnly) return;
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (!formData.indentId || !formData.subContractorId || items.some(i => !i.itemId)) {
      alert('Please fill all required fields and select items');
      return;
    }

    const payload = {
      subcontractor: formData.subContractorId,
      indent: formData.indentId, 
      date: formData.date,
      vehicle_no: formData.vehicleNo,
      items: items.map(item => ({
        material: item.itemId,
        quantity: item.quantity,
        remarks: item.remarks
      }))
    };

    try {
      await addOutward(payload);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to save outward entry. Check console for details.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add Outward Entry</h2>
        {isReadOnly && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
            <ShieldAlert size={16} /> View Only
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          disabled={isReadOnly}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Indent No</label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50"
            value={formData.indentId}
            disabled={isReadOnly || loadingIndents}
            onChange={(e) => setFormData({ ...formData, indentId: e.target.value })}
            required
          >
            <option value="">{loadingIndents ? 'Loading Indents...' : 'Select Indent No'}</option>
            {indents.map((ind) => (
              <option key={ind.indent_id} value={ind.indent_id}>{ind.indent_no}</option>
            ))}
          </select>
        </div>

        <Input
          label="Vehicle No"
          value={formData.vehicleNo}
          disabled={isReadOnly}
          onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
          placeholder="KA-00-XX-0000"
          required
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-contractor</label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50"
            value={formData.subContractorId || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'add-new') {
                setShowModal(true);
              } else {
                setFormData({ ...formData, subContractorId: val });
              }
            }}
          >
            <option value="">Select Sub-contractor</option>
            {state.subContractors.map(s => (
              <option key={s.subcontractor_id} value={s.subcontractor_id}>{s.name}</option>
            ))}
            {!isReadOnly && <option value="add-new">+ Add New Sub-contractor</option>}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Items Dispatched</h3>
          {!isReadOnly && (
            <Button onClick={() => setItems([...items, { itemId: '', quantity: 0, remarks: '' }])}>
              <Plus size={18} /> Add Item
            </Button>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-blue-900">Item</th>
                <th className="px-4 py-3 text-left font-bold text-blue-900 w-32">Quantity</th>
                <th className="px-4 py-3 text-left font-bold text-blue-900">Remarks</th>
                {!isReadOnly && <th className="px-4 py-3 text-center w-16"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      value={item.itemId || ""}
                      disabled={isReadOnly}
                      onChange={(e) => updateItem(idx, 'itemId', e.target.value)}
                      required
                    >
                      <option value="">Select Item</option>
                      {state.items.map(i => (
                        <option key={i.material_id} value={i.material_id}>{i.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      value={item.quantity}
                      disabled={isReadOnly}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                      value={item.remarks}
                      disabled={isReadOnly}
                      onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                    />
                  </td>
                  {!isReadOnly && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full"
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

      <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>{isReadOnly ? 'Back' : 'Cancel'}</Button>
        {!isReadOnly && <Button onClick={handleSubmit} className="px-8 shadow-md">Save Outward Entry</Button>}
      </div>

      <AddSubContractorModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default OutwardForm;