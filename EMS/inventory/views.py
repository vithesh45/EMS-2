from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import *
from .serializers import *


# ---------------- MATERIAL ----------------
class MaterialListCreateAPIView(APIView):
    def get(self, request):
        return Response(MaterialSerializer(Material.objects.all(), many=True).data)

    def post(self, request):
        serializer = MaterialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------- SUPPLIER ----------------
class SupplierListCreateAPIView(APIView):
    def get(self, request):
        return Response(SupplierSerializer(Supplier.objects.all(), many=True).data)

    def post(self, request):
        serializer = SupplierSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------- SUBCONTRACTOR ----------------
class SubContractorListCreateAPIView(APIView):
    def get(self, request):
        return Response(SubContractorSerializer(SubContractor.objects.all(), many=True).data)

    def post(self, request):
        serializer = SubContractorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------- INWARD ----------------
class InwardListCreateAPIView(APIView):
    def get(self, request):
        return Response(InwardSerializer(Inward.objects.all(), many=True).data)

    @transaction.atomic
    def post(self, request):
        data = request.data or {}

        # ---------- BASIC FIELD NORMALIZATION (camelCase + snake_case) ----------
        # Support both supplier / supplier_id / supplierId coming from frontend
        supplier_id = (
            data.get("supplier")
            or data.get("supplier_id")
            or data.get("supplierId")
        )

        # Validate supplier exists
        if not supplier_id:
            return Response({"error": "Supplier is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(supplier_id=supplier_id)
        except Supplier.DoesNotExist:
            return Response({"error": f"Supplier with ID {supplier_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Invalid supplier ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate date
        date = data.get("date")
        if not date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert date string to date object if needed (supports string or Date object)
        from django.utils.dateparse import parse_date
        if isinstance(date, str):
            date_obj = parse_date(date)
            if not date_obj:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
            date = date_obj

        # Validate items BEFORE creating Inward so we don't leave orphan records
        items = data.get("items") or []
        if not items:
            return Response({"error": "At least one item is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Map frontend camelCase + snake_case to backend snake_case
        inward = Inward.objects.create(
            supplier_id=supplier_id,
            date=date,
            # Accept both dcNo and dc_no
            dc_no=data.get("dc_no") or data.get("dcNo"),
            lr_no=data.get("lr_no") or data.get("lrNo"),
            vehicle_no=data.get("vehicle_no") or data.get("vehicleNo")
        )

        for item in items:
            # ---------- ITEM FIELD NORMALIZATION ----------
            material_id = (
                item.get("material")
                or item.get("material_id")
                or item.get("materialId")
            )

            # Use accepted value as quantity if provided, otherwise use quantity
            quantity = item.get("accepted") or item.get("accepted_qty") or item.get("quantity")
            
            if not material_id:
                return Response({"error": "Material ID is required for all items"}, status=status.HTTP_400_BAD_REQUEST)
            
            if quantity is None or quantity <= 0:
                return Response({"error": "Quantity must be greater than 0 for all items"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate material exists
            try:
                material = Material.objects.get(material_id=material_id)
            except Material.DoesNotExist:
                return Response({"error": f"Material with ID {material_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": f"Invalid material ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure quantity is numeric to avoid Decimal errors
            try:
                quantity = float(quantity)
            except (TypeError, ValueError):
                return Response({"error": "Quantity must be a valid number for all items"}, status=status.HTTP_400_BAD_REQUEST)

            # Map frontend camelCase + snake_case for item fields
            InwardItem.objects.create(
                inward=inward,
                material_id=material_id,
                quantity=quantity,
                as_per_challan=item.get('as_per_challan') or item.get('asPerChallan'),
                actual_receipt=item.get('actual_receipt') or item.get('actualReceipt'),
                short=item.get('short'),
                reject=item.get('reject'),
                accepted=item.get('accepted'),
                remarks=item.get('remarks')
            )

            stock, _ = StoreStock.objects.get_or_create(material_id=material_id)
            stock.quantity += quantity
            stock.save()

        # Return the created Inward with all related data
        serializer = InwardSerializer(inward)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------- OUTWARD ----------------
class OutwardListCreateAPIView(APIView):
    def get(self, request):
        return Response(OutwardSerializer(Outward.objects.all(), many=True).data)

    @transaction.atomic
    def post(self, request):
        data = request.data or {}

        # ---------- BASIC FIELD NORMALIZATION (camelCase + snake_case) ----------
        # Validate and convert date
        date = data.get("date")
        if not date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils.dateparse import parse_date
        if isinstance(date, str):
            date_obj = parse_date(date)
            if not date_obj:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
            date = date_obj

        # Normalize main foreign keys: subcontractor / indent
        subcontractor_id = (
            data.get("subcontractor")
            or data.get("subcontractor_id")
            or data.get("subcontractorId")
        )
        indent_id = (
            data.get("indent")
            or data.get("indent_id")
            or data.get("indentId")
        )

        if not subcontractor_id:
            return Response({"error": "Subcontractor is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not indent_id:
            return Response({"error": "Indent is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate subcontractor exists explicitly to avoid 500s on bad UUIDs
        try:
            subcontractor = SubContractor.objects.get(subcontractor_id=subcontractor_id)
        except SubContractor.DoesNotExist:
            return Response({"error": f"Subcontractor with ID {subcontractor_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Invalid subcontractor ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate indent exists explicitly to avoid 500s on bad UUIDs
        try:
            indent = Indent.objects.get(indent_id=indent_id)
        except Indent.DoesNotExist:
            return Response({"error": f"Indent with ID {indent_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Invalid indent ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate items BEFORE creating Outward
        items = data.get("items") or []
        if not items:
            return Response({"error": "At least one item is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Map frontend camelCase + snake_case to backend snake_case
        outward = Outward.objects.create(
            subcontractor=subcontractor,  # we already resolved and validated
            indent=indent,  # we already resolved and validated
            date=date,
            vehicle_no=data.get("vehicle_no") or data.get("vehicleNo"),
            remarks=data.get('remarks')
        )

        for item in items:
            # ---------- ITEM FIELD NORMALIZATION ----------
            material_id = (
                item.get("material")
                or item.get("material_id")
                or item.get("materialId")
            )
            qty = item.get("quantity")

            if not material_id:
                return Response({"error": "Material ID is required for all items"}, status=status.HTTP_400_BAD_REQUEST)

            if qty is None:
                return Response({"error": "Quantity is required for all items"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                qty = float(qty)
            except (TypeError, ValueError):
                return Response({"error": "Quantity must be a valid number for all items"}, status=status.HTTP_400_BAD_REQUEST)

            if qty <= 0:
                return Response({"error": "Quantity must be greater than 0 for all items"}, status=status.HTTP_400_BAD_REQUEST)

            stock = get_object_or_404(StoreStock, material_id=material_id)
            if stock.quantity < qty:
                return Response({"error": "Insufficient stock"}, status=status.HTTP_400_BAD_REQUEST)

            stock.quantity -= qty
            stock.save()

            sub_stock, _ = SubContractorStock.objects.get_or_create(
                subcontractor=outward.subcontractor,
                material_id=material_id
            )
            sub_stock.quantity += qty
            sub_stock.save()

            # Map frontend camelCase to backend snake_case for item fields
            OutwardItem.objects.create(
                outward=outward,
                material_id=material_id,
                quantity=qty,
                remarks=item.get('remarks')
            )

        # NEW CODE ADDED (work order status update)
        if outward.indent:
            for work_order in outward.indent.wo.all():
                work_order.status = "in_progress"
                work_order.save()

        # Return the created Outward with all related data
        serializer = OutwardSerializer(outward)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

# ---------------- STORE STOCK ----------------
class StoreStockListAPIView(APIView):
    def get(self, request):
        stocks = StoreStock.objects.select_related("material")
        serializer = StoreStockSerializer(stocks, many=True)
        return Response(serializer.data)


# ---------------- WORK ORDER ----------------
class WorkOrderListCreateAPIView(APIView):
    def get(self, request):
        work_orders = WorkOrder.objects.prefetch_related("materials")
        
        data = []
        for wo in work_orders:
            data.append({
                "wo_id": wo.wo_id,
                "work_order_number": wo.wo_number,
                "region": wo.bescom_office,
                "village": wo.village,
                "status": wo.status,
                "materials": [
                    {
                        "material": item.material.name,
                        "quantity": str(item.quantity)
                    }
                    for item in wo.materials.all()
                ]
            })
        
        return Response(data)
    
    @transaction.atomic
    def post(self, request):
        work_order = WorkOrder.objects.create(
            wo_number=request.data.get("work_order_number"),
            bescom_office=request.data.get("region", ""),
            village=request.data.get("village", ""),
            status=request.data.get("status", "pending")
        )
        
        for item in request.data.get("materials", []):
            WorkOrderMaterial.objects.create(
                wo=work_order,
                material_id=item["material"],
                quantity=item["quantity"]
            )
        
        return Response({
            "message": "Work Order created successfully",
            "wo_id": work_order.wo_id,
            "work_order_number": work_order.wo_number
        }, status=status.HTTP_201_CREATED)


# ---------------- WORK ORDER STATUS ----------------
class WorkOrderStatusAPIView(APIView):
    def patch(self, request, wo_id):
        work_order = get_object_or_404(WorkOrder, wo_id=wo_id)
        new_status = request.data.get("status")
        
        if not new_status:
            return Response({"error": "Status is required"}, status=400)
        
        valid_statuses = ["pending", "in_progress", "closed"]
        if new_status not in valid_statuses:
            return Response({
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }, status=400)
        
        work_order.status = new_status
        work_order.save()
        
        return Response({
            "message": f"Work Order status updated to {new_status}",
            "wo_id": work_order.wo_id,
            "wo_number": work_order.wo_number,
            "status": work_order.status
        }, status=200)


# ---------------- INDENT ----------------
class IndentAPIView(APIView):

    @transaction.atomic
    def post(self, request):
        data = request.data or {}

        # Normalize field names for camelCase + snake_case
        wo_numbers = data.get("wo_numbers") or data.get("woNumbers") or []
        subcontractor_id = (
            data.get("subcontractor")
            or data.get("subcontractor_id")
            or data.get("subcontractorId")
        )

        # #region agent log
        try:
            import json, time
            with open(r"d:\EMS SOFTWARE\.cursor\debug.log", "a", encoding="utf-8") as _f:
                _f.write(json.dumps({
                    "id": f"log_{int(time.time()*1000)}_indent_pre",
                    "timestamp": int(time.time()*1000),
                    "runId": "pre-fix",
                    "hypothesisId": "A",
                    "location": "inventory/views.py:365",
                    "message": "Indent POST received",
                    "data": {
                        "wo_numbers_raw": data.get("wo_numbers") or data.get("woNumbers"),
                        "wo_numbers_norm": wo_numbers,
                        "subcontractor_raw": subcontractor_id,
                    },
                }) + "\n")
        except Exception:
            pass
        # #endregion

        if not isinstance(wo_numbers, (list, tuple)) or not wo_numbers:
            return Response({"error": "At least one work order number is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not subcontractor_id:
            return Response({"error": "Subcontractor is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate subcontractor exists to avoid 500s on bad IDs
        try:
            SubContractor.objects.get(subcontractor_id=subcontractor_id)
        except SubContractor.DoesNotExist:
            return Response({"error": f"Subcontractor with ID {subcontractor_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Invalid subcontractor ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        work_orders = WorkOrder.objects.filter(wo_number__in=wo_numbers)

        # #region agent log
        try:
            import json, time
            with open(r"d:\EMS SOFTWARE\.cursor\debug.log", "a", encoding="utf-8") as _f:
                _f.write(json.dumps({
                    "id": f"log_{int(time.time()*1000)}_indent_wo_lookup",
                    "timestamp": int(time.time()*1000),
                    "runId": "pre-fix",
                    "hypothesisId": "B",
                    "location": "inventory/views.py:390",
                    "message": "Indent work order lookup",
                    "data": {
                        "wo_numbers_norm": wo_numbers,
                        "work_orders_count": work_orders.count(),
                    },
                }) + "\n")
        except Exception:
            pass
        # #endregion

        if not work_orders.exists():
            return Response({"error": "No valid work orders found"}, status=status.HTTP_400_BAD_REQUEST)

        indent = Indent.objects.create(
            indent_no=f"IND-{work_orders.first().wo_number}",
            subcontractor_id=subcontractor_id
        )
        indent.wo.set(work_orders)
        return Response(
            {"message": "Indent created successfully", "indent_id": indent.indent_id},
            status=201
        )
    
    def get(self, request):
        indents = Indent.objects.prefetch_related("wo").select_related("subcontractor")

        data = []
        for indent in indents:
            data.append({
                "indent_id": indent.indent_id,
                "indent_no": indent.indent_no,
                "work_orders": [wo.wo_number for wo in indent.wo.all()],
                "subcontractor": indent.subcontractor.name,
            })

        return Response(data)