
# EMS Frontend-Backend API Analysis & Implementation Report

## Overview
This document analyzes the EMS (Equipment Management System) frontend architecture and identifies pending APIs required for full functionality.

---

## 1. FRONTEND MODULES ANALYSIS

### Module 1 (Core):
- **InwardModule**: Manages inward stock entries ✅ API EXISTS
- **OutwardModule**: Manages outward stock distribution ✅ API EXISTS  
- **StockDashboard**: Displays inventory stock levels ✅ API EXISTS
- **Dashboard**: Analytics and reporting ⚠️ Partial (needs WorkOrder/Indent data)

### Module 2 (Manager/Head Office):
- **WorkOrderModule**: Manages work orders ❌ PENDING (Created)
- **IndentModule**: Manages indents from work orders ❌ PENDING (Created)
- **DWAModule**: DWA record management ⚠️ Mock only
- **DeliveryInstructionsModule**: Delivery instructions ⚠️ Mock only
- **BillingModule**: Billing from completed indents ⚠️ Mock only
- **InventoryModule**: Inventory dashboard ⚠️ Partial

---

## 2. EXISTING BACKEND API ENDPOINTS

### Base URL: `http://127.0.0.1:8000/api/inventory`

#### Working Endpoints:
```
GET    /materials/              - List all materials
POST   /materials/              - Create material

GET    /suppliers/              - List all suppliers
POST   /suppliers/              - Create supplier

GET    /subcontractors/         - List all subcontractors
POST   /subcontractors/         - Create subcontractor

GET    /inwards/                - List all inwards ✅
POST   /inwards/                - Create inward entry ✅

GET    /outwards/               - List all outwards ✅
POST   /outwards/               - Create outward entry ✅

GET    /store-stock/            - List store stock ✅
```

---

## 3. NEWLY CREATED API ENDPOINTS

### Work Order APIs:
```
GET    /work-orders/            - List all work orders
POST   /work-orders/            - Create work order
GET    /work-orders/<uuid>/     - Get work order details
PUT    /work-orders/<uuid>/     - Update work order
```

**Frontend Usage**: `src/Module 2/workOrder/WorkOrderForm.jsx`  
**Expected Payload**:
```json
{
  "woNumber": "WO/2026/001",
  "region": "Bangalore",
  "date": "2026-03-03",
  "items": [
    {
      "itemId": "uuid-here",
      "estimated": 100,
      "issued": 0
    }
  ]
}
```

---

### Indent APIs:
```
GET    /indents/                - List all indents
POST   /indents/                - Create indent
GET    /indents/<uuid>/         - Get indent details
PUT    /indents/<uuid>/         - Update indent
```

**Frontend Usage**: `src/Module 2/indent/IndentForm.jsx`, `OutwardForm.jsx`  
**Expected Payload**:
```json
{
  "indentNo": "IND/2026/001",
  "workOrderId": "uuid-here",
  "subContractorId": "uuid-here",
  "status": "Todo",
  "items": [
    {
      "itemId": "uuid-here",
      "quantity": 50
    }
  ]
}
```

**Important**: `OutwardForm.jsx` calls `/inventory/indents/` which maps to this endpoint.

---

## 4. PENDING API ENDPOINTS (Mock Implementation)

### DWA Module APIs:
```
GET    /dwa/                    - List DWA records (Currently in mock state)
POST   /dwa/                    - Create DWA record
```

**Status**: Frontend code uses local dispatch (mock). No backend integration needed yet.

---

### Delivery Instructions APIs:
```
GET    /delivery-instructions/  - List DI records
POST   /delivery-instructions/  - Create DI record
```

**Status**: Frontend code uses local dispatch (mock). Can be implemented later.

---

### Billing/Invoice APIs:
```
GET    /billing/indents/completed - Get completed indents for billing
POST   /billing/generate-invoice   - Generate invoice from indent
```

**Status**: Currently reads from mock `state.indents`. Can be implemented using completed indents.

---

## 5. DATABASE MODELS CREATED/UPDATED

### New Models:
```python
class IndentItem(models.Model):
    indent = ForeignKey(Indent)
    material = ForeignKey(Material)
    quantity = DecimalField
    issued = DecimalField (default=0)
```

### Updated Models:
```python
class Indent(models.Model):
    # Added fields:
    date = DateField(auto_now_add=True)
    status = CharField(max_length=50, default='Todo')
    
    # Added relation:
    items = ForeignKey(IndentItem, related_name='items')
```

---

## 6. SERIALIZERS IMPLEMENTED

### New Serializers:
- `IndentItemSerializer` - For serializing indent items
- `IndentSerializer` - Updated with items and nested data
- `WorkOrderSerializer` - Includes materials and nested data
- `OutwardSerializer` - Updated to include indent details

---

## 7. API IMPLEMENTATION STATUS

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| /materials/ | GET, POST | ✅ Complete | - |
| /suppliers/ | GET, POST | ✅ Complete | - |
| /subcontractors/ | GET, POST | ✅ Complete | - |
| /inwards/ | GET, POST | ✅ Complete | - |
| /outwards/ | GET, POST | ✅ Complete | - |
| /store-stock/ | GET | ✅ Complete | - |
| /work-orders/ | GET, POST | ✅ New | High |
| /work-orders/<id>/ | GET, PUT | ✅ New | High |
| /indents/ | GET, POST | ✅ New | High |
| /indents/<id>/ | GET, PUT | ✅ New | High |
| /dwa/ | GET, POST | ⚠️ Mock | Medium |
| /delivery-instructions/ | GET, POST | ⚠️ Mock | Medium |
| /billing/completed-indents | GET | ⚠️ Mock | Low |

---

## 8. FRONTEND API CALLS TO IMPLEMENT

### OutwardForm.jsx (CRITICAL FIX):
```javascript
// Line 62: Currently calls /inventory/indents/
const response = await api.get('/inventory/indents/');
// This now maps to the new endpoint: /indents/
```

---

## 9. NEXT STEPS

1. **Run Migrations**: 
   ```bash
   python manage.py makemigrations inventory
   python manage.py migrate
   ```

2. **Test All Endpoints** using Postman/Thunder Client

3. **Update Frontend Context** (`StockContext.jsx`):
   ```javascript
   // Add to loadBackendData():
   const [workOrders, indents] = await Promise.all([
     api.get('/work-orders/'),
     api.get('/indents/')
   ]);
   ```

4. **Update frontend hook** to fetch indents for OutwardForm

5. **Implement Mock modules** (DWA, DI, Billing) when ready

---

## 10. FIELD MAPPING (Frontend ↔ Backend)

### Inward:
- `supplierId` → `supplier`
- `dcNo` → `dc_no`
- `lrNo` → `lr_no`
- `vehicleNo` → `vehicle_no`

### Outward:
- `subContractorId` → `subcontractor`
- `indentId` → `indent`
- `vehicleNo` → `vehicle_no`

### Indent:
- `indentNo` → `indent_no`
- `workOrderId` → `wo`
- `subContractorId` → `subcontractor`

### WorkOrder:
- `woNumber` → `wo_number`

---

## 11. ERROR HANDLING

All endpoints return:
- **201 Created**: On successful POST
- **200 OK**: On successful GET/PUT
- **400 Bad Request**: On validation errors (missing fields, invalid IDs)
- **404 Not Found**: On resource not found

---

## 12. AUTHENTICATION

Currently NO authentication implemented. All endpoints are public.  
Add authentication layer when needed using Django REST framework's permission classes.

---

## Files Modified:
- ✅ `inventory/models.py` - Added IndentItem model
- ✅ `inventory/serializers.py` - Added new serializers
- ✅ `inventory/views.py` - Added WorkOrder and Indent APIs
- ✅ `inventory/urls.py` - Updated URL patterns

