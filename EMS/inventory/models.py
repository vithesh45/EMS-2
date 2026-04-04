from django.db import models
import uuid
from django.utils.dateparse import parse_date


class Material(models.Model):
    material_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    supplier_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    contact_info = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class SubContractor(models.Model):
    subcontractor_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    contact_info = models.CharField(max_length=200,default='000')

    def __str__(self):
        return self.name


# ------------------ STOCK ------------------
class StoreStock(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ("material",)

    def __str__(self):
        return f"{self.material.name} - {self.quantity}"


class SubContractorStock(models.Model):
    subcontractor = models.ForeignKey(SubContractor, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ("subcontractor", "material")


# ------------------ WORK ORDER ------------------
class WorkOrder(models.Model):
    wo_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wo_number = models.CharField(max_length=100)
    bescom_office = models.CharField(max_length=100)
    village = models.CharField(max_length=100)
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.wo_number


class WorkOrderMaterial(models.Model):
    wo = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name="materials")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)


# ------------------ INDENT ------------------
class Indent(models.Model):
    indent_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    indent_no = models.CharField(max_length=100)
    wo = models.ManyToManyField(WorkOrder)
    subcontractor = models.ForeignKey(SubContractor, on_delete=models.CASCADE)
    date = models.DateField(default='2026-03-06')
    status = models.CharField(max_length=50, default='Todo')

    def __str__(self):
        return self.indent_no

class IndentItem(models.Model):
    indent = models.ForeignKey(Indent, on_delete=models.CASCADE, related_name="items")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    issued = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ("indent", "material")

    def __str__(self):
        return f"{self.indent.indent_no} - {self.material.name}"



# ------------------ INWARD ------------------
class Inward(models.Model):
    inward_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    date = models.DateField()
    dc_no = models.CharField(max_length=100, blank=True, null=True)
    lr_no = models.CharField(max_length=100, blank=True, null=True)
    vehicle_no = models.CharField(max_length=100, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Handle date if it's a string - use parse_date from django.utils.dateparse
        if isinstance(self.date, str):
            date_obj = parse_date(self.date)
            if date_obj:
                self.date = date_obj
        super().save(*args, **kwargs)


class InwardItem(models.Model):
    inward = models.ForeignKey(Inward, on_delete=models.CASCADE, related_name="items")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    as_per_challan = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actual_receipt = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    short = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reject = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    accepted = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)


# ------------------ OUTWARD ------------------
class Outward(models.Model):
    outward_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subcontractor = models.ForeignKey(SubContractor, on_delete=models.CASCADE)
    indent = models.ForeignKey(Indent, on_delete=models.CASCADE)
    date = models.DateField()
    vehicle_no = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Handle date if it's a string - use parse_date from django.utils.dateparse
        if isinstance(self.date, str):
            date_obj = parse_date(self.date)
            if date_obj:
                self.date = date_obj
        super().save(*args, **kwargs)


class OutwardItem(models.Model):
    outward = models.ForeignKey(Outward, on_delete=models.CASCADE, related_name="items")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)
