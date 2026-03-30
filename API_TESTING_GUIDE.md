# EMS API Integration Guide & Testing Instructions

## Quick Start for API Testing

### 1. Database Setup

First, ensure Django migrations are applied:

```bash
cd d:\EMS-2\EMS
python manage.py makemigrations inventory
python manage.py migrate
```

### 2. Start the Django Backend

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/api/inventory`

---

## Complete API Endpoints Reference

### BASE_URL: `http://127.0.0.1:8000/api/inventory`

---

## 1. MATERIALS ENDPOINTS

### List All Materials
```
GET /materials/
```

**Response (200 OK)**:
```json
[
  {
    "material_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Steel Rod",
    "description": "High-grade steel rod",
    "unit": "kg"
  }
]
```

### Create Material
```
POST /materials/
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Copper Wire",
  "description": "Insulated copper wire",
  "unit": "meter"
}
```

**Response (201 Created)**:
```json
{
  "material_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Copper Wire",
  "description": "Insulated copper wire",
  "unit": "meter"
}
```

---

## 2. SUPPLIERS ENDPOINTS

### List All Suppliers
```
GET /suppliers/
```

### Create Supplier
```
POST /suppliers/
```

**Request Body**:
```json
{
  "name": "ABC Suppliers Ltd",
  "contact_info": "9876543210",
  "address": "123 Industrial Road, Bangalore"
}
```

---

## 3. SUBCONTRACTORS ENDPOINTS

### List All SubContractors
```
GET /subcontractors/
```

### Create SubContractor
```
POST /subcontractors/
```

**Request Body**:
```json
{
  "name": "XYZ Construction Co",
  "contact_info": "9123456789"
}
```

---

## 4. WORK ORDERS ENDPOINTS ✨ NEW

### List All Work Orders
```
GET /work-orders/
```

**Response**:
```json
[
  {
    "wo_id": "550e8400-e29b-41d4-a716-446655440000",
    "wo_number": "WO/2026/001",
    "bescom_office": "Bangalore",
    "village": "Domlur",
    "status": "Todo",
    "materials": [
      {
        "material": {
          "material_id": "...",
          "name": "Steel Rod",
          "unit": "kg"
        },
        "quantity": "100.00"
      }
    ]
  }
]
```

### Create Work Order
```
POST /work-orders/
Content-Type: application/json
```

**Request Body**:
```json
{
  "woNumber": "WO/2026/001",
  "region": "Bangalore",
  "village": "Domlur",
  "status": "Todo",
  "items": [
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440000",
      "estimated": 100,
      "issued": 0
    },
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440001",
      "estimated": 50,
      "issued": 0
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "wo_id": "550e8400-e29b-41d4-a716-446655440000",
  "wo_number": "WO/2026/001",
  "bescom_office": "Bangalore",
  "village": "Domlur",
  "status": "Todo",
  "materials": [...]
}
```

### Get Work Order Details
```
GET /work-orders/{wo_id}/
```

### Update Work Order
```
PUT /work-orders/{wo_id}/
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "In Progress"
}
```

---

## 5. INDENTS ENDPOINTS ✨ NEW

### List All Indents
```
GET /indents/
```

**Response**:
```json
[
  {
    "indent_id": "550e8400-e29b-41d4-a716-446655440000",
    "indent_no": "IND/2026/001",
    "date": "2026-03-03",
    "status": "Todo",
    "wo": {
      "wo_id": "...",
      "wo_number": "WO/2026/001",
      ...
    },
    "subcontractor": {
      "subcontractor_id": "...",
      "name": "XYZ Construction Co",
      ...
    },
    "items": [
      {
        "indent_item_id": 1,
        "material": {
          "material_id": "...",
          "name": "Steel Rod"
        },
        "quantity": "50.00",
        "issued": "0.00"
      }
    ]
  }
]
```

### Create Indent
```
POST /indents/
Content-Type: application/json
```

**Request Body**:
```json
{
  "indentNo": "IND/2026/001",
  "workOrderId": "550e8400-e29b-41d4-a716-446655440000",
  "subContractorId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "Todo",
  "items": [
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 50
    },
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 25
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "indent_id": "550e8400-e29b-41d4-a716-446655440000",
  "indent_no": "IND/2026/001",
  "date": "2026-03-03",
  "status": "Todo",
  "items": [...]
}
```

### Get Indent Details
```
GET /indents/{indent_id}/
```

### Update Indent
```
PUT /indents/{indent_id}/
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "Completed"
}
```

---

## 6. INWARDS ENDPOINTS

### List All Inwards
```
GET /inwards/
```

### Create Inward
```
POST /inwards/
Content-Type: application/json
```

**Request Body**:
```json
{
  "supplier": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-03-03",
  "dcNo": "DC/2026/001",
  "lrNo": "LR/2026/001",
  "vehicleNo": "KA-01-AB-1234",
  "items": [
    {
      "material": "550e8400-e29b-41d4-a716-446655440000",
      "asPerChallan": 100,
      "actualReceipt": 98,
      "short": 2,
      "reject": 0,
      "accepted": 98,
      "remarks": "Minor shortage"
    }
  ]
}
```

---

## 7. OUTWARDS ENDPOINTS

### List All Outwards
```
GET /outwards/
```

### Create Outward
```
POST /outwards/
Content-Type: application/json
```

**Request Body**:
```json
{
  "subcontractor": "550e8400-e29b-41d4-a716-446655440000",
  "indent": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-03-03",
  "vehicleNo": "KA-01-XY-5678",
  "remarks": "Delivery for WO/2026/001",
  "items": [
    {
      "material": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 50,
      "remarks": "As per indent"
    }
  ]
}
```

---

## 8. STORE STOCK ENDPOINTS

### List Store Stock
```
GET /store-stock/
```

**Response**:
```json
[
  {
    "id": 1,
    "material": {
      "material_id": "...",
      "name": "Steel Rod",
      "unit": "kg"
    },
    "quantity": "950.00"
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Supplier with ID xyz does not exist"
}
```

### 404 Not Found
```json
{
  "error": "Indent not found"
}
```

---

## Testing with cURL

### Create a Material
```bash
curl -X POST http://127.0.0.1:8000/api/inventory/materials/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Material",
    "description": "Test",
    "unit": "kg"
  }'
```

### List Materials
```bash
curl http://127.0.0.1:8000/api/inventory/materials/
```

### Create a Supplier
```bash
curl -X POST http://127.0.0.1:8000/api/inventory/suppliers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Supplier",
    "contact_info": "9876543210",
    "address": "Test Address"
  }'
```

### Create a Work Order
```bash
curl -X POST http://127.0.0.1:8000/api/inventory/work-orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "woNumber": "WO/2026/001",
    "region": "Bangalore",
    "status": "Todo",
    "items": []
  }'
```

---

## Testing with Postman

1. Create a new Collection called "EMS API"
2. Set the base URL variable: `{{base_url}}` = `http://127.0.0.1:8000/api/inventory`
3. Create requests for each endpoint
4. Use the request bodies provided above

---

## Frontend Integration Updates

### StockContext.jsx
The context now loads:
- `workOrders` - from `/work-orders/`
- `indents` - from `/indents/`

### Components Updated
- ✅ `OutwardForm.jsx` - Fixed API endpoint from `/inventory/indents/` to `/indents/`
- ✅ `StockContext.jsx` - Added workOrder and indent loading

### Available in State
```javascript
const { state } = useStock();

console.log(state.workOrders);  // All work orders from backend
console.log(state.indents);     // All indents from backend
```

---

## Common Issues & Solutions

### Issue: "Module not found: django"
**Solution**: Activate Python virtual environment or install Django:
```bash
pip install django djangorestframework
```

### Issue: "Indent not found" on Outward creation
**Solution**: Ensure you create an Indent first before creating an Outward that references it

### Issue: "Supplier with ID xyz does not exist"
**Solution**: Create a Supplier first and use the returned UUID in subsequent requests

### Issue: "Insufficient stock"
**Solution**: Create Inward entries to populate store stock before creating Outward

---

## Database Tables Created

1. `inventory_material` - Materials master
2. `inventory_supplier` - Suppliers master
3. `inventory_subcontractor` - SubContractors master
4. `inventory_workorder` - Work Orders
5. `inventory_workordermaterial` - Work Order materials (many-to-many)
6. `inventory_indent` - Indents
7. `inventory_indentitem` - Indent items (many-to-many)
8. `inventory_inward` - Inward entries
9. `inventory_inwarditem` - Inward line items
10. `inventory_outward` - Outward entries
11. `inventory_outwarditem` - Outward line items
12. `inventory_storestock` - Store inventory stock
13. `inventory_subcontractorstock` - SubContractor inventory stock

---

## Next Steps

1. ✅ Run migrations
2. ✅ Start Django server
3. ✅ Test all endpoints with Postman
4. ✅ Verify frontend loads data correctly
5. Create DWA and DI backend models (when needed)
6. Add authentication (JWT tokens)
7. Add pagination for large datasets
8. Add filtering and search functionality

