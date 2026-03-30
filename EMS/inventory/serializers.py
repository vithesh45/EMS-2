from rest_framework import serializers
from .models import *


# -------- BASIC SERIALIZERS --------
class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


class SubContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubContractor
        fields = "__all__"


class StoreStockSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)

    class Meta:
        model = StoreStock
        fields = "__all__"


# -------- WORK ORDER --------
class WorkOrderMaterialSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_name = serializers.ReadOnlyField(source='material.name')
    material_id = serializers.ReadOnlyField(source='material.material_id')

    class Meta:
        model = WorkOrderMaterial
        fields = "__all__"


class WorkOrderSerializer(serializers.ModelSerializer):
    materials = WorkOrderMaterialSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = "__all__"


# -------- INDENT --------
class IndentItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_name = serializers.ReadOnlyField(source='material.name')
    material_id = serializers.ReadOnlyField(source='material.material_id')

    class Meta:
        model = IndentItem
        fields = "__all__"


class IndentSerializer(serializers.ModelSerializer):
    wo = WorkOrderSerializer(read_only=True)
    subcontractor = SubContractorSerializer(read_only=True)
    items = IndentItemSerializer(many=True, read_only=True)
    indent_no = serializers.ReadOnlyField(source='indent_id')
    indentNo = serializers.ReadOnlyField(source='indent_id')

    class Meta:
        model = Indent
        fields = "__all__"


# -------- INWARD --------
class InwardItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_name = serializers.ReadOnlyField(source='material.name')
    material_id = serializers.ReadOnlyField(source='material.material_id')

    class Meta:
        model = InwardItem
        fields = "__all__"


class InwardSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    supplier_id = serializers.ReadOnlyField(source='supplier.supplier_id')
    items = InwardItemSerializer(many=True, read_only=True)
    inward_no = serializers.ReadOnlyField(source='inward_id')  # Use inward_id as inward_no
    inwardNo = serializers.ReadOnlyField(source='inward_id')  # Alias for frontend compatibility

    class Meta:
        model = Inward
        fields = "__all__"


# -------- OUTWARD --------
class OutwardItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_name = serializers.ReadOnlyField(source='material.name')
    material_id = serializers.ReadOnlyField(source='material.material_id')

    class Meta:
        model = OutwardItem
        fields = "__all__"


class OutwardSerializer(serializers.ModelSerializer):
    subcontractor = SubContractorSerializer(read_only=True)
    subcontractor_name = serializers.ReadOnlyField(source='subcontractor.name')
    subcontractor_id = serializers.ReadOnlyField(source='subcontractor.subcontractor_id')
    indent = IndentSerializer(read_only=True)
    items = OutwardItemSerializer(many=True, read_only=True)
    outward_no = serializers.ReadOnlyField(source='outward_id')  # Use outward_id as outward_no
    outwardNo = serializers.ReadOnlyField(source='outward_id')  # Alias for frontend compatibility

    class Meta:
        model = Outward
        fields = "__all__"


# -------- DELIVERY INSTRUCTIONS & DWA (For future modules) --------
class DeliveryInstructionSerializer(serializers.Serializer):
    """Placeholder for DI module - stores in memory/mock for now"""
    pass


class DWASerializer(serializers.Serializer):
    """Placeholder for DWA module - stores in memory/mock for now"""
    pass
