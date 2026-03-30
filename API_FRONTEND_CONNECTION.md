# 🔗 Frontend-Backend API Connection Summary

## ✅ **All API Endpoints Connected**

### **1. Base Configuration**
- **File**: `src/api/base.js`
- **Base URL**: `http://127.0.0.1:8000/api/inventory`
- **Instance**: axios with automatic retries

### **2. Context Provider Functions**
**File**: `src/context/StockContext.jsx`

#### Data Loading (On App Start)
```javascript
loadBackendData() → Fetches all master data and lists
```

#### CRUD Operations
```javascript
addInward(payload)     → POST /inwards/
addOutward(payload)    → POST /outwards/
addWorkOrder(payload)  → POST /work-orders/     ✨ NEW
addIndent(payload)     → POST /indents/         ✨ NEW
```

### **3. Automatic Data Sync**
After creating any record, `loadBackendData()` is called to refresh all data from backend.

---

## 📊 **API Endpoint Connections**

| Endpoint | Method | Frontend Component | Function | Status |
|----------|--------|-------------------|----------|--------|
| `/materials/` | GET | All | Loaded on start | ✅ |
| `/suppliers/` | GET | All | Loaded on start | ✅ |
| `/subcontractors/` | GET | All | Loaded on start | ✅ |
| `/inwards/` | GET | InwardModule | Loaded on start | ✅ |
| `/inwards/` | POST | InwardForm | `addInward()` | ✅ |
| `/outwards/` | GET | OutwardModule | Loaded on start | ✅ |
| `/outwards/` | POST | OutwardForm | `addOutward()` | ✅ |
| `/store-stock/` | GET | Dashboard | Loaded on start | ✅ |
| `/work-orders/` | GET | WorkOrderModule | Loaded on start | ✅ |
| `/work-orders/` | POST | WorkOrderForm | `addWorkOrder()` | ✅ NEW |
| `/indents/` | GET | IndentModule | Loaded on start | ✅ |
| `/indents/` | POST | IndentForm | `addIndent()` | ✅ NEW |

---

## 🎯 **How to Use in Components**

### **Example 1: Create a Work Order**
```javascript
import { useStock } from '../../hooks/useStock';

const MyComponent = () => {
  const { addWorkOrder } = useStock();

  const handleCreateWO = async () => {
    try {
      await addWorkOrder({
        woNumber: "WO/2026/001",
        region: "Bangalore",
        date: "2026-03-30",
        items: [
          { itemId: "material-uuid", estimated: 100 },
          { itemId: "material-uuid-2", estimated: 50 }
        ]
      });
      console.log("Work Order created successfully!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleCreateWO}>Create WO</button>;
};
```

### **Example 2: Create an Indent**
```javascript
const handleCreateIndent = async () => {
  try {
    await addIndent({
      indentNo: "IND/2026/001",
      workOrderId: "wo-uuid",
      subContractorId: "subcontractor-uuid",
      status: "Todo",
      items: [
        { itemId: "material-uuid", quantity: 50 },
        { itemId: "material-uuid-2", quantity: 25 }
      ]
    });
    console.log("Indent created successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### **Example 3: Access Data from State**
```javascript
const MyComponent = () => {
  const { state } = useStock();

  return (
    <div>
      <h3>Work Orders: {state.workOrders.length}</h3>
      <h3>Indents: {state.indents.length}</h3>
      <h3>Materials: {state.items.length}</h3>
      <h3>Suppliers: {state.suppliers.length}</h3>
    </div>
  );
};
```

---

## 📝 **Updated Components**

### **WorkOrderForm** (Updated ✨)
- **File**: `src/Module 2/workOrder/WorkOrderForm.jsx`
- **Change**: Now calls `addWorkOrder()` instead of local dispatch
- **Features**:
  - Sends data to backend `/work-orders/` endpoint
  - Auto-refreshes data after creation
  - Error handling with user alerts

### **IndentForm** (Updated ✨)
- **File**: `src/Module 2/indent/IndentForm.jsx`
- **Change**: Now calls `addIndent()` instead of local dispatch
- **Features**:
  - Sends data to backend `/indents/` endpoint
  - Auto-refreshes data after creation
  - Error handling with user alerts

### **InwardForm** (Already Connected ✅)
- Uses `addInward()` function
- Integrated with backend

### **OutwardForm** (Already Connected ✅)
- Uses `addOutward()` function
- Integrated with backend

---

## 🔄 **Data Flow**

```
User Action (e.g., Create Work Order)
    ↓
WorkOrderForm Component
    ↓
handleCreate() calls addWorkOrder(payload)
    ↓
StockContext.addWorkOrder()
    ↓
api.post('/work-orders/', payload)
    ↓
Django Backend
    ↓
Validation & Database Save
    ↓
Success Response
    ↓
loadBackendData() - Refresh state
    ↓
All components re-render with new data
```

---

## ✨ **Key Features**

✅ **Automatic Synchronization**
- After any create operation, frontend automatically refreshes data

✅ **Error Handling**
- Try-catch blocks with user-friendly error messages
- Network errors are gracefully handled

✅ **Type Safety**
- Payload structure matches backend expectations
- Field mapping (camelCase → snake_case) handled in backend

✅ **Real-time Updates**
- State updates immediately after API response
- All components using state re-render automatically

✅ **Promise-based**
- Async/await pattern for clean code
- Can chain operations if needed

---

## 🧪 **Testing the Connections**

### **1. Test in Browser DevTools**
```javascript
// Open Console and test
import api from './api/base.js';
api.post('/work-orders/', {
  woNumber: "TEST/2026/001",
  region: "Test",
  items: []
}).then(res => console.log(res.data));
```

### **2. Test Component**
```bash
# Start frontend
npm run dev

# Create a work order in WorkOrderModule
# Check DevTools Network tab for POST /work-orders/
# Check Response to see created data
```

### **3. Verify Backend**
```bash
# In Django shell
python manage.py shell
from inventory.models import WorkOrder
WorkOrder.objects.all()  # Should have your newly created WO
```

---

## 🚀 **Quick Reference**

### **Import in Any Component**
```javascript
import { useStock } from '../../hooks/useStock';
const { state, dispatch, addInward, addOutward, addWorkOrder, addIndent } = useStock();
```

### **Available in State**
- `state.materials` - All materials
- `state.suppliers` - All suppliers
- `state.subContractors` - All subcontractors
- `state.items` - Same as materials (alias)
- `state.workOrders` - All work orders from backend
- `state.indents` - All indents from backend
- `state.inwardEntries` - All inwards
- `state.outwardEntries` - All outwards
- `state.stock` - Store stock levels (material_id → quantity)

---

## ⚠️ **Important Notes**

1. **Backend Must Be Running**
   ```bash
   python manage.py runserver
   ```

2. **CORS Headers Configured**
   - Django `INSTALLED_APPS` includes `corsheaders`
   - Frontend can access backend from different port

3. **UUIDs in Database**
   - All IDs are UUIDs
   - Frontend receives/sends as strings
   - Backend validates and validates UUIDs

4. **Error Boundaries**
   - Always wrap API calls in try-catch
   - Display errors to user
   - Log to console for debugging

---

## 📋 **Checklist**

- ✅ StockContext exports all API functions
- ✅ WorkOrderForm uses `addWorkOrder()`
- ✅ IndentForm uses `addIndent()`
- ✅ Both components have error handling
- ✅ Data automatically refreshes after create
- ✅ All endpoints properly mapped
- ✅ Field names mapped correctly

---

**Status**: ✅ **All API Endpoints Connected and Ready**

Last Updated: March 30, 2026

