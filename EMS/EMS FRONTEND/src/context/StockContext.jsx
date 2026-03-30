import React, { createContext, useReducer, useEffect } from 'react';
import { initialMockData } from '../data/mockData';
import { BASE_URL } from '../api/base';

export const StockContext = createContext();

/* ===================== REDUCER ===================== */
const stockReducer = (state, action) => {
  if (!action.payload && action.type !== 'INIT_BACKEND_DATA') return state;

  switch (action.type) {

    /* ===== BACKEND SYNC (ONLY THESE) ===== */
   /* ===== BACKEND SYNC (ONLY THESE) ===== */
case 'INIT_BACKEND_DATA':
  return {
    ...state,
    // Replace with backend data - use empty arrays if backend returns empty (not mock data)
    suppliers: action.payload.suppliers !== undefined ? action.payload.suppliers : (state.suppliers || []),
    subContractors: action.payload.subcontractors !== undefined ? action.payload.subcontractors : (state.subContractors || []),
    items: action.payload.materials !== undefined ? action.payload.materials : [],
    inwardEntries: action.payload.inwards !== undefined ? action.payload.inwards : [],
    outwardEntries: action.payload.outwards !== undefined ? action.payload.outwards : [],
    workOrders: action.payload.workOrders !== undefined ? action.payload.workOrders : [],
    indents: action.payload.indents !== undefined ? action.payload.indents : [],
    stock: action.payload.stock !== undefined ? action.payload.stock : {}
  };

    /* ===== KEEP OLD MOCK LOGIC AS-IS ===== */
    case 'ADD_SUPPLIER':
      return {
        ...state,
        suppliers: [...state.suppliers, { id: Date.now(), ...action.payload }]
      };

    case 'ADD_SUBCONTRACTOR':
      return {
        ...state,
        subContractors: [...state.subContractors, { id: Date.now(), ...action.payload }]
      };

    case 'ADD_INWARD':
      return {
        ...state,
        inwardEntries: [...state.inwardEntries, action.payload]
      };

    case 'ADD_OUTWARD':
      return {
        ...state,
        outwardEntries: [...state.outwardEntries, action.payload]
      };

    /* ===== MODULE-2 (UNCHANGED MOCK) ===== */
    case 'ADD_DWA': {
      const newDWA = {
        ...action.payload,
        id: Date.now(),
        dwaNumber: action.payload.dwaNumber
          ? action.payload.dwaNumber
          : `DWA-2026-${String(state.dwaEntries.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString()
      };
      return { ...state, dwaEntries: [newDWA, ...state.dwaEntries] };
    }

    case 'ADD_DI': {
      const newDI = {
        ...action.payload,
        id: Date.now(),
        diNumber: action.payload.diNumber
          ? action.payload.diNumber
          : `DI-2026-${String(state.deliveryInstructions.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString()
      };
      return { ...state, deliveryInstructions: [newDI, ...state.deliveryInstructions] };
    }

    case 'ADD_WORK_ORDER': {
      const newWO = {
        ...action.payload,
        id: Date.now(),
        woNumber: action.payload.woNumber
          ? action.payload.woNumber
          : `WO-2026-${String(state.workOrders.length + 1).padStart(3, '0')}`,
        status: 'Todo',
        createdAt: new Date().toISOString()
      };
      return { ...state, workOrders: [newWO, ...state.workOrders] };
    }

    case 'UPDATE_WO_STATUS':
      return {
        ...state,
        workOrders: state.workOrders.map(wo =>
          wo.id === action.payload.woId
            ? { ...wo, status: action.payload.status }
            : wo
        )
      };

    case 'ADD_INDENT': {
      const newIndent = {
        ...action.payload,
        id: Date.now(),
        status: 'In Progress',
        createdAt: new Date().toISOString()
      };

      const updatedWOs = state.workOrders.map(wo => {
        if (action.payload.workOrderIds.includes(wo.id)) {
          return {
            ...wo,
            status: wo.status === 'Todo' ? 'In Progress' : wo.status,
            items: wo.items.map(item => {
              const match = newIndent.items.find(
                i => i.itemId === item.itemId && i.woNumber === wo.woNumber
              );
              return match
                ? { ...item, issued: (item.issued || 0) + match.currentIssuing }
                : item;
            })
          };
        }
        return wo;
      });

      return {
        ...state,
        indents: [newIndent, ...state.indents],
        workOrders: updatedWOs
      };
    }

    case 'COMPLETE_INDENT': {
      const indent = state.indents.find(i => i.id === action.payload.indentId);
      if (!indent) return state;

      const updatedStock = { ...state.stock };
      indent.items.forEach(item => {
        updatedStock[item.itemId] = Math.max(
          0,
          (updatedStock[item.itemId] || 0) - item.currentIssuing
        );
      });

      return {
        ...state,
        indents: state.indents.map(i =>
          i.id === indent.id ? { ...i, status: 'Completed' } : i
        ),
        workOrders: state.workOrders.map(wo =>
          indent.workOrderIds.includes(wo.id)
            ? { ...wo, status: 'Completed' }
            : wo
        ),
        stock: updatedStock
      };
    }

    default:
      return state;
  }
};

/* ===================== PROVIDER ===================== */
import api from '../api/base'; // Import your axios instance

export const StockProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stockReducer, initialMockData);

  // 1. Function to Refresh Data from DB
  const loadBackendData = async () => {
    try {
      // Fetch ALL endpoints - note the trailing slashes!
      const [materials, suppliers, subcontractors, inwards, outwards, storeStock, workOrders, indents] = await Promise.all([
        api.get('/materials/').then(res => res.data).catch(() => []),
        api.get('/suppliers/').then(res => res.data).catch(() => []),
        api.get('/subcontractors/').then(res => res.data).catch(() => []),
        api.get('/inwards/').then(res => res.data).catch(() => []),
        api.get('/outwards/').then(res => res.data).catch(() => []),
        api.get('/store-stock/').then(res => res.data).catch(() => []),
        api.get('/work-orders/').then(res => res.data).catch(() => []),
        api.get('/indents/').then(res => res.data).catch(() => [])
      ]);

      const stockMap = {};
      if (storeStock && Array.isArray(storeStock)) {
        storeStock.forEach(s => {
          // Use s.material.material_id to match what the Dashboard expects
          const materialId = s.material?.material_id || s.material?.id || s.material;
          if (materialId) {
            stockMap[materialId] = s.quantity;
          }
        });
      }

      dispatch({
        type: 'INIT_BACKEND_DATA',
        payload: { 
          materials, 
          suppliers, 
          subcontractors, 
          inwards, 
          outwards, 
          stock: stockMap,
          workOrders: workOrders || [],
          indents: indents || []
        }
      });
    } catch (err) {
      console.error('Backend not reachable:', err);
      // Don't use mock data - show empty state instead
      dispatch({
        type: 'INIT_BACKEND_DATA',
        payload: { 
          materials: [], 
          suppliers: [], 
          subcontractors: [], 
          inwards: [], 
          outwards: [],
          workOrders: [],
          indents: [], 
          stock: {} 
        }
      });
    }
  };

  // 2. Initial load
  useEffect(() => {
    loadBackendData();
  }, []);

  // 3. Inward Function (Using Axios)
  const addInward = async (payload) => {
    try {
      await api.post('/inwards/', payload);
      await loadBackendData(); 
    } catch (err) {
      throw err;
    }
  };

  // 4. Outward Function (Using Axios)
  const addOutward = async (payload) => {
    try {
      await api.post('/outwards/', payload);
      await loadBackendData();
    } catch (err) {
      throw err;
    }
  };

  // 5. Work Order Function (Using Axios)
  const addWorkOrder = async (payload) => {
    try {
      await api.post('/work-orders/', payload);
      await loadBackendData();
    } catch (err) {
      throw err;
    }
  };

  // 6. Indent Function (Using Axios)
  const addIndent = async (payload) => {
    try {
      await api.post('/indents/', payload);
      await loadBackendData();
    } catch (err) {
      throw err;
    }
  };

  return (
    <StockContext.Provider value={{ state, dispatch, addInward, addOutward, addWorkOrder, addIndent }}>
      {children}
    </StockContext.Provider>
  );
};