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
        # Validate supplier exists
        supplier_id = request.data.get("supplier")
        if not supplier_id:
            return Response({"error": "Supplier is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(supplier_id=supplier_id)
        except Supplier.DoesNotExist:
            return Response({"error": f"Supplier with ID {supplier_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Invalid supplier ID format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate date
        date = request.data.get("date")
        if not date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert date string to date object if needed
        from django.utils.dateparse import parse_date
        if isinstance(date, str):
            date_obj = parse_date(date)
            if not date_obj:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
            date = date_obj

        # Map frontend camelCase to backend snake_case
        inward = Inward.objects.create(
            supplier_id=supplier_id,
            date=date,
            dc_no=request.data.get('dcNo'),
            lr_no=request.data.get('lrNo'),
            vehicle_no=request.data.get('vehicleNo')
        )

        # Validate items
        items = request.data.get("items", [])
        if not items:
            return Response({"error": "At least one item is required"}, status=status.HTTP_400_BAD_REQUEST)

        for item in items:
            material_id = item.get("material")
            # Use accepted value as quantity if provided, otherwise use quantity
            quantity = item.get("accepted") or item.get("quantity")
            
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

            # Map frontend camelCase to backend snake_case for item fields
            InwardItem.objects.create(
                inward=inward,
                material_id=material_id,
                quantity=quantity,
                as_per_challan=item.get('asPerChallan'),
                actual_receipt=item.get('actualReceipt'),
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
        # Validate and convert date
        date = request.data.get("date")
        if not date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils.dateparse import parse_date
        if isinstance(date, str):
            date_obj = parse_date(date)
            if not date_obj:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
            date = date_obj
        
        # Map frontend camelCase to backend snake_case
        outward = Outward.objects.create(
            subcontractor_id=request.data.get("subcontractor"),
            indent_id=request.data.get("indent"),
            date=date,
            vehicle_no=request.data.get('vehicleNo'),
            remarks=request.data.get('remarks')
        )

        for item in request.data.get("items", []):
            material_id = item.get("material")
            qty = item.get("quantity")

            stock = get_object_or_404(StoreStock, material_id=material_id)
            if stock.quantity < qty:
                return Response({"error": "Insufficient stock"}, status=400)

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
        return Response(WorkOrderSerializer(WorkOrder.objects.all(), many=True).data)

    def post(self, request):
        try:
            # Extract basic work order data
            wo_number = request.data.get("woNumber") or request.data.get("wo_number")
            bescom_office = request.data.get("region", "")
            village = request.data.get("village", "")
            status_val = request.data.get("status", "Todo")
            
            if not wo_number:
                return Response({"error": "WO Number is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create work order
            work_order = WorkOrder.objects.create(
                wo_number=wo_number,
                bescom_office=bescom_office,
                village=village,
                status=status_val
            )
            
            # Create work order materials
            items = request.data.get("items", [])
            for item in items:
                material_id = item.get("itemId") or item.get("material")
                estimated = item.get("estimated") or item.get("quantity")
                
                if not material_id or not estimated:
                    continue
                
                try:
                    material = Material.objects.get(material_id=material_id)
                    WorkOrderMaterial.objects.create(
                        wo=work_order,
                        material=material,
                        quantity=estimated
                    )
                except Material.DoesNotExist:
                    pass
            
            return Response(WorkOrderSerializer(work_order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WorkOrderDetailAPIView(APIView):
    def get(self, request, wo_id):
        try:
            work_order = WorkOrder.objects.get(wo_id=wo_id)
            return Response(WorkOrderSerializer(work_order).data)
        except WorkOrder.DoesNotExist:
            return Response({"error": "Work Order not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, wo_id):
        try:
            work_order = WorkOrder.objects.get(wo_id=wo_id)
            work_order.wo_number = request.data.get("woNumber", work_order.wo_number)
            work_order.bescom_office = request.data.get("region", work_order.bescom_office)
            work_order.village = request.data.get("village", work_order.village)
            work_order.status = request.data.get("status", work_order.status)
            work_order.save()
            return Response(WorkOrderSerializer(work_order).data)
        except WorkOrder.DoesNotExist:
            return Response({"error": "Work Order not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- INDENT ----------------
class IndentListCreateAPIView(APIView):
    def get(self, request):
        return Response(IndentSerializer(Indent.objects.all().select_related('wo', 'subcontractor'), many=True).data)

    @transaction.atomic
    def post(self, request):
        try:
            # Validate required fields
            indent_no = request.data.get("indentNo") or request.data.get("indent_no")
            wo_id = request.data.get("workOrderId") or request.data.get("wo")
            subcontractor_id = request.data.get("subContractorId") or request.data.get("subcontractor")
            
            if not indent_no:
                return Response({"error": "Indent Number is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not wo_id:
                return Response({"error": "Work Order is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not subcontractor_id:
                return Response({"error": "SubContractor is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or validate work order
            try:
                work_order = WorkOrder.objects.get(wo_id=wo_id)
            except WorkOrder.DoesNotExist:
                return Response({"error": f"Work Order with ID {wo_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or validate subcontractor
            try:
                subcontractor = SubContractor.objects.get(subcontractor_id=subcontractor_id)
            except SubContractor.DoesNotExist:
                return Response({"error": f"SubContractor with ID {subcontractor_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create indent
            indent = Indent.objects.create(
                indent_no=indent_no,
                wo=work_order,
                subcontractor=subcontractor,
                status=request.data.get("status", "Todo")
            )
            
            # Create indent items
            items = request.data.get("items", [])
            for item in items:
                material_id = item.get("itemId") or item.get("material")
                quantity = item.get("quantity") or item.get("estimated")
                
                if not material_id or not quantity:
                    continue
                
                try:
                    material = Material.objects.get(material_id=material_id)
                    IndentItem.objects.create(
                        indent=indent,
                        material=material,
                        quantity=quantity,
                        issued=0
                    )
                except Material.DoesNotExist:
                    pass
            
            return Response(IndentSerializer(indent).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class IndentDetailAPIView(APIView):
    def get(self, request, indent_id):
        try:
            indent = Indent.objects.get(indent_id=indent_id)
            return Response(IndentSerializer(indent).data)
        except Indent.DoesNotExist:
            return Response({"error": "Indent not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, indent_id):
        try:
            indent = Indent.objects.get(indent_id=indent_id)
            indent.status = request.data.get("status", indent.status)
            indent.save()
            return Response(IndentSerializer(indent).data)
        except Indent.DoesNotExist:
            return Response({"error": "Indent not found"}, status=status.HTTP_404_NOT_FOUND)