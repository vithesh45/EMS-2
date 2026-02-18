import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const AddSubContractorModal = ({ isOpen, onClose, onAdd }) => {
  const { dispatch } = useStock();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = () => {
    if (!name || !region) return;
    const newId = Date.now();
    dispatch({ type: 'ADD_SUBCONTRACTOR', payload: { id: newId, name, region } });
    onAdd(newId, region);
    setName(''); setRegion(''); onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Sub-contractor">
      <div className="space-y-4">
        <Input label="Sub-contractor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" required />
        <Input label="Region / Location" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Enter region" required />
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Sub-contractor</Button>
        </div>
      </div>
    </Modal>
  );
};

const IndentForm = ({ onBack, readOnly = false, initialData = null }) => {
  const { state, dispatch } = useStock();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(''); // Added local error state
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    indentNo: initialData?.indentNo || '',
    subContractorId: initialData?.subContractorId || '',
    region: initialData?.region || ''
  });
  const [selectedWOs, setSelectedWOs] = useState(initialData?.workOrderIds || []);
  const [items, setItems] = useState(initialData?.items || []);

  const handleSubChange = (e) => {
    if (readOnly) return;
    if (e.target.value === 'add-new') {
      setShowModal(true);
    } else {
      const sub = state.subContractors.find(s => s.id === Number(e.target.value));
      setFormData({ ...formData, subContractorId: Number(e.target.value), region: sub?.region || formData.region });
    }
  };

  const handleWOSelection = (woId) => {
    if (readOnly) return;
    setError(''); // Clear error when user interacts
    const wo = state.workOrders.find(w => w.id === Number(woId));
    
    if (selectedWOs.includes(wo.id)) {
      const updatedWOs = selectedWOs.filter(id => id !== wo.id);
      setSelectedWOs(updatedWOs);
      setItems(items.filter(item => item.woNumber !== wo.woNumber));
      
      const remainingRegions = state.workOrders
        .filter(w => updatedWOs.includes(w.id))
        .map(w => w.region);
      setFormData(prev => ({ ...prev, region: [...new Set(remainingRegions)].join(', ') }));
      
    } else {
      const updatedWOs = [...selectedWOs, wo.id];
      setSelectedWOs(updatedWOs);

      const allSelectedRegions = state.workOrders
        .filter(w => updatedWOs.includes(w.id))
        .map(w => w.region);
      
      setFormData(prev => ({
        ...prev,
        region: [...new Set(allSelectedRegions)].join(', ')
      }));

      const newItems = wo.items.map(woItem => ({
        itemId: woItem.itemId,
        woNumber: wo.woNumber,
        estimated: woItem.estimated,
        issued: woItem.issued || 0, 
        currentIssuing: 0
      }));
      setItems([...items, ...newItems]);
    }
  };

  const updateQty = (woNo, itemId, val) => {
    if (readOnly) return;
    setError(''); 
    setItems(items.map(i => (i.woNumber === woNo && i.itemId === itemId) ? { ...i, currentIssuing: Number(val) } : i));
  };

  const handleSubmit = () => {
    // 1. Check Header Fields
    if (!formData.indentNo || !formData.subContractorId) {
      setError('Please provide Indent Number and Select Sub-contractor.');
      return;
    }

    // 2. EDGE CASE: Check if at least one Work Order is selected
    if (selectedWOs.length === 0) {
      setError('Error: You must select at least one Work Order to create an Indent.');
      return;
    }

    // 3. EDGE CASE: Check if at least one item has a quantity > 0
    const itemsToIssue = items.filter(i => i.currentIssuing > 0);
    if (itemsToIssue.length === 0) {
      setError('Error: No materials have been issued. Please enter quantities in "Current Issuing".');
      return;
    }

    // --- LOCAL STORAGE SYNC ---
    const existingIndents = JSON.parse(localStorage.getItem('indents') || '[]');
    if (!existingIndents.includes(formData.indentNo)) {
        localStorage.setItem('indents', JSON.stringify([...existingIndents, formData.indentNo]));
    }
    // -------------------------

    dispatch({ 
      type: 'ADD_INDENT', 
      payload: { 
        ...formData, 
        workOrderIds: selectedWOs, 
        items: itemsToIssue 
      } 
    });
    onBack();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{readOnly ? 'View Indent Entry' : 'Create Indent Entry'}</h2>
        </div>
      </div>

      {/* Validation Alert UI */}
      {error && !readOnly && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Input label="Indent No" value={formData.indentNo} onChange={(e) => !readOnly && setFormData({ ...formData, indentNo: e.target.value })} placeholder="IND-0000" required disabled={readOnly} />
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-contractor</label>
          <select
            disabled={readOnly}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={formData.subContractorId}
            onChange={handleSubChange}
          >
            <option value="">Select Sub-contractor</option>
            {state.subContractors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            {!readOnly && <option value="add-new" className="text-blue-600 font-bold italic">+ Add New Sub-contractor</option>}
          </select>
        </div>

        <Input 
          label="Region(s)" 
          value={formData.region} 
          onChange={(e) => !readOnly && setFormData({ ...formData, region: e.target.value })} 
          placeholder="Regions auto-filled" 
          disabled
        />
      </div>

      {!readOnly && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Linked Work Orders <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {state.workOrders
              .filter(w => w.status === 'Todo')
              .map(wo => (
                <div
                  key={wo.id}
                  onClick={() => handleWOSelection(wo.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedWOs.includes(wo.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-sm">{wo.woNumber}</p>
                  <p className="text-xs text-gray-500">{wo.region}</p>
                </div>
            ))}
          </div>
          {state.workOrders.filter(w => w.status === 'Todo').length === 0 && (
            <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center">
              <p className="text-gray-400 text-sm italic">No pending Work Orders available.</p>
            </div>
          )}
        </div>
      )}

      {(selectedWOs.length > 0 || items.length > 0) && (
        <div className="mb-6 animate-in fade-in duration-500">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Items to Issue</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-blue-900 uppercase">WO Number</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-900 uppercase">Material</th>
                  <th className="px-4 py-3 text-center font-bold text-blue-900 uppercase">Estimated</th>
                  <th className="px-4 py-3 text-center font-bold text-blue-900 uppercase">Issued</th>
                  <th className="px-4 py-3 text-center font-bold text-blue-900 uppercase w-40">Current Issuing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">{item.woNumber}</td>
                    <td className="p-3 text-gray-700">
                      {state.items.find(i => i.id === item.itemId)?.name}
                    </td>
                    <td className="p-3 text-center text-gray-700">{item.estimated}</td>
                    <td className="p-3 text-center text-gray-700 font-semibold">{item.issued}</td>
                    <td className="p-3">
                      {readOnly ? (
                        <div className="text-center font-black text-blue-700 text-lg">{item.currentIssuing}</div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-center font-bold"
                          value={item.currentIssuing}
                          onChange={(e) => updateQty(item.woNumber, item.itemId, e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
          <Button variant="secondary" onClick={onBack}>Cancel</Button>
          <Button onClick={handleSubmit} className="px-8 shadow-md shadow-blue-100">
            Save Indent Entry
          </Button>
        </div>
      )}

      <AddSubContractorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={(id, reg) => setFormData({ ...formData, subContractorId: id, region: reg })}
      />
    </div>
  );
};

export default IndentForm;