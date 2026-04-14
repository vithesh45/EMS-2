import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { useStock } from '../../hooks/useStock';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../api/base';

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
  const { state, dispatch, addIndent } = useStock();
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
      const sub = state.subContractors.find(s =>
        String(s.subcontractor_id || s.id) === String(e.target.value)
      );
      setFormData({
        ...formData,
        subContractorId: e.target.value,
        region: sub?.region || formData.region
      });
    }
  };

  const handleWOSelection = (woId) => {
    if (readOnly) return;
    setError('');

    // Support both backend (wo_id) and mock (id) shapes safely
    const wo = (state.workOrders || []).find(w =>
      String(w.wo_id || w.id) === String(woId)
    );
    if (!wo) return;

    const woKey = String(wo.wo_id || wo.id);

    if (selectedWOs.some(id => String(id) === woKey)) {
      const updatedWOs = selectedWOs.filter(id => String(id) !== woKey);
      setSelectedWOs(updatedWOs);

      setItems(items.filter(item => {
        const itemWo = item.wo_number || item.woNumber || item.work_order_number;
        const currentWo = wo.wo_number || wo.woNumber || wo.work_order_number;
        return String(itemWo) !== String(currentWo);
      }));

      const remainingRegions = (state.workOrders || [])
        .filter(w => updatedWOs.some(id => String(id) === String(w.wo_id || w.id)))
        .map(w => w.region)
        .filter(Boolean);

      setFormData(prev => ({
        ...prev,
        region: [...new Set(remainingRegions)].join(', ')
      }));
    } else {
      const updatedWOs = [...selectedWOs, wo.wo_id || wo.id];
      setSelectedWOs(updatedWOs);

      const allSelectedRegions = (state.workOrders || [])
        .filter(w => updatedWOs.some(id => String(id) === String(w.wo_id || w.id)))
        .map(w => w.region)
        .filter(Boolean);

      setFormData(prev => ({
        ...prev,
        region: [...new Set(allSelectedRegions)].join(', ')
      }));
const newItems = Array.isArray(wo.items || wo.materials)
  ? (wo.items || wo.materials).map(mat => ({
      itemId: mat.itemId || mat.material, // ✅ supports both
      wo_number:  wo.work_order_number,
      estimated: mat.estimated || mat.quantity, // ✅ supports both
      issued: mat.issued || 0,
      currentIssuing: 0
    }))
  : [];

      setItems(prev => [...prev, ...newItems]);
    }
  };

  const updateQty = (woNo, itemId, val) => {
    if (readOnly) return;
    setError('');
    setItems(items.map(i => (String(i.wo_number) === String(woNo) && i.itemId === itemId) ? { ...i, currentIssuing: Number(val) } : i));
  };

  const handleSubmit = async () => {
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

    // 4. EDGE CASE: Ensure we can derive valid work order numbers for backend
    const woNumbers = selectedWOs
      .map(id => {
        const wo = (state.workOrders || []).find(w =>
          String(w.wo_id || w.id) === String(id)
        );

        const val = (wo?.work_order_number || wo?.wo_number || '').toString().trim();

        if (!val) {
          console.error("❌ INVALID WO:", wo);
          return null;
        }

        return val;
      })
      .filter(Boolean);

    console.log("✅ FINAL WO NUMBERS:", woNumbers);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a4296404-738f-4161-8b56-9be5b2040536', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `log_${Date.now()}_indent_handleSubmit`,
        timestamp: Date.now(),
        runId: 'post-fix',
        hypothesisId: 'A',
        location: 'IndentForm.jsx:144',
        message: 'Indent handleSubmit woNumbers build',
        data: {
          selectedWOs,
          woNumbers,
          woNumbersLength: woNumbers.length,
        },
      }),
    }).catch(() => { });
    // #endregion

    if (!woNumbers.length) {
      setError('Error: Unable to derive valid Work Order numbers. Please re-select the Work Orders.');
      return;
    }

    try {
      // Call backend API
const payload = {
  indent_no: formData.indentNo,          
  wo: selectedWOs,                       
  subcontractor: formData.subContractorId, 
  status: 'Todo',
  items: itemsToIssue.map(item => ({
    material: item.itemId,               
    quantity: Number(item.currentIssuing || 0)
  }))
};

      await addIndent(payload);
      onBack();
    } catch (error) {
      console.error('Error creating indent:', error);
      alert('Failed to create indent. Please check the backend connection.');
    }
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
            {state.subContractors.map(s => {
              const value = s.subcontractor_id || s.id;
              return (
                <option key={value} value={value}>
                  {s.name}
                </option>
              );
            })}
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
              .filter(w => {
                const status = (w.status || '').toLowerCase();
                return status === 'todo' || status === 'pending';
              })
              .map(wo => (
                <div
                  key={wo.wo_id}
                  onClick={() => handleWOSelection(wo.wo_id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedWOs.includes(wo.wo_id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <p className="font-bold text-sm">{wo.wo_number || wo.woNumber}</p>
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
                    <td className="p-3 text-gray-700">{item.wo_number || item.woNumber || item.work_order_number ||  '-'}</td>
                    <td className="p-3 text-gray-700">
   {(() => {
  const itemInfo = state.items.find(i =>
    String(i.name).toLowerCase() === String(item.itemId || item.material).toLowerCase()
  );

  return itemInfo?.name || item.material || 'Unknown';
})()}
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
                          onChange={(e) => updateQty(item.wo_number, item.itemId, e.target.value)}
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