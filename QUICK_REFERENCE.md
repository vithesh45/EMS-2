# EMS API Quick Reference

## 🚀 Quick Start

```bash
# Setup
cd d:\EMS-2\EMS
python manage.py makemigrations inventory
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd d:\EMS-2\EMS\"EMS FRONTEND"
npm run dev
```

---

## 📍 Base URL
```
http://127.0.0.1:8000/api/inventory
```

---

## 🔌 All Endpoints

### Materials
```
GET  /materials/
POST /materials/
```

### Suppliers
```
GET  /suppliers/
POST /suppliers/
```

### SubContractors
```
GET  /subcontractors/
POST /subcontractors/
```

### Work Orders ✨ NEW
```
GET    /work-orders/
POST   /work-orders/
GET    /work-orders/<uuid>/
PUT    /work-orders/<uuid>/
```

### Indents ✨ NEW
```
GET    /indents/
POST   /indents/
GET    /indents/<uuid>/
PUT    /indents/<uuid>/
```

### Inwards
```
GET  /inwards/
POST /inwards/
```

### Outwards
```
GET  /outwards/
POST /outwards/
```

### Store Stock
```
GET /store-stock/
```

---

## 📝 Example: Create Work Order

```bash
curl -X POST http://127.0.0.1:8000/api/inventory/work-orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "woNumber": "WO/2026/001",
    "region": "Bangalore",
    "items": [
      {
        "itemId": "550e8400-e29b-41d4-a716-446655440000",
        "estimated": 100
      }
    ]
  }'
```

---

## 📝 Example: Create Indent

```bash
curl -X POST http://127.0.0.1:8000/api/inventory/indents/ \
  -H "Content-Type: application/json" \
  -d '{
    "indentNo": "IND/2026/001",
    "workOrderId": "550e8400-e29b-41d4-a716-446655440000",
    "subContractorId": "550e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "itemId": "550e8400-e29b-41d4-a716-446655440000",
        "quantity": 50
      }
    ]
  }'
```

---

## 🗂️ Database Flow

```
Material → Supplier → SubContractor → WorkOrder → Indent → Inward → Outward
                                         ↓         ↓        ↓
                                    WorkOrderMaterial  IndentItem  InwardItem/OutwardItem
```

---

## ✅ Field Mapping

| Module | Frontend | Backend |
|--------|----------|---------|
| Work Order | `woNumber` | `wo_number` |
| Work Order | `itemId` | `material` |
| Indent | `indentNo` | `indent_no` |
| Indent | `workOrderId` | `wo_id` |
| Indent | `subContractorId` | `subcontractor_id` |
| Inward | `supplierId` | `supplier` |
| Outward | `indentId` | `indent` |

---

## 🔧 Common Tasks

### Get all indents
```javascript
const response = await api.get('/indents/');
console.log(response.data);
```

### Create indent from frontend
```javascript
const { addIndent } = useStock();
await addIndent({
  indentNo: "IND/2026/001",
  workOrderId: "uuid",
  subContractorId: "uuid",
  items: [...]
});
```

### Update indent status
```javascript
await api.put('/indents/uuid/', { status: 'Completed' });
```

---

## 📊 State in Frontend

```javascript
import { useStock } from './hooks/useStock';

const { state, dispatch } = useStock();

// Available data
state.materials
state.suppliers
state.subContractors
state.workOrders      // ✨ NEW
state.indents         // ✨ NEW
state.inwardEntries
state.outwardEntries
state.stock
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Wrong endpoint | Check URL spelling |
| 400 Bad Request | Missing field | Include all required fields |
| ValueError: UUID invalid | Bad UUID format | Pass valid UUID strings |
| "Supplier does not exist" | Invalid ID | Create supplier first |
| "Insufficient stock" | Not enough stock | Create inward entries |

---

## 📋 Files Modified

✅ `inventory/models.py` - Added IndentItem model  
✅ `inventory/serializers.py` - Added IndentItemSerializer  
✅ `inventory/views.py` - Added WorkOrder & Indent APIs  
✅ `inventory/urls.py` - Added new endpoints  
✅ `context/StockContext.jsx` - Load workOrders & indents  
✅ `components/outward/OutwardForm.jsx` - Fixed API path  

---

## 🧪 Testing in Postman

1. Import JSON (create requests in Postman)
2. Set variable: `base_url` = `http://127.0.0.1:8000/api/inventory`
3. Test each endpoint

---

## 📚 Documentation

- 📖 `API_IMPLEMENTATION_REPORT.md` - Full analysis
- 📖 `API_TESTING_GUIDE.md` - Detailed testing guide
- 📖 `DEVELOPMENT_SUMMARY.md` - Complete summary

---

## ✨ What's New

- ✅ Work Order API (CRUD)
- ✅ Indent API (CRUD)
- ✅ IndentItem model
- ✅ Frontend context updated
- ✅ OutwardForm API path fixed
- ✅ Full error handling
- ✅ Transaction atomicity

---

## 🎯 Next Steps

1. Test all endpoints with Postman
2. Verify frontend loads data
3. Test create flows end-to-end
4. Check browser console for errors
5. Implement DWA backend (optional)

---

## 💡 Tips

- Use UUID from response for subsequent requests
- Always include `Content-Type: application/json`
- Check network tab for failed requests
- Test material → supplier → indent flow first

---

**Last Updated**: March 3, 2026  
**Status**: ✅ Complete  
**Ready for**: Testing

