from django.contrib import admin
from .models import (
    Material, Supplier, SubContractor,
    Inward, InwardItem,
    Outward, OutwardItem,
    StoreStock, SubContractorStock
)

# ---------------- MATERIAL ----------------
@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "unit","material_id")
    search_fields = ("name",)


# ---------------- SUPPLIER ----------------
@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_info", "supplier_id")
    search_fields = ("name",)


# ---------------- SUB CONTRACTOR ----------------
@admin.register(SubContractor)
class SubContractorAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_info")
    search_fields = ("name",)


# ---------------- INWARD ----------------
class InwardItemInline(admin.TabularInline):
    model = InwardItem
    extra = 1


@admin.register(Inward)
class InwardAdmin(admin.ModelAdmin):
    list_display = ('supplier', 'date')
    inlines = [InwardItemInline]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        inward = form.instance

        for item in inward.InwardItem.all():
            stock, created = StoreStock.objects.get_or_create(
                material=item.material
            )
            stock.quantity += item.quantity
            stock.save()



# ---------------- OUTWARD ----------------
class OutwardItemInline(admin.TabularInline):
    model = OutwardItem
    extra = 1


@admin.register(Outward)
class OutwardAdmin(admin.ModelAdmin):
    inlines = [OutwardItemInline]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        outward = form.instance

        for item in outward.outwarditem.all():
            # Central stock
            stock = StoreStock.objects.get(material=item.material)
            stock.quantity -= item.quantity
            stock.save()

            # Subcontractor stock
            sub_stock, _ = SubContractorStock.objects.get_or_create(
                subcontractor=outward.subcontractor_id,
                material=item.material
            )
            sub_stock.quantity += item.quantity
            sub_stock.save()



# ---------------- STORE STOCK ----------------
@admin.register(StoreStock)
class StoreStockAdmin(admin.ModelAdmin):
    list_display = ("material", "quantity")
    search_fields = ("material__name",)


# ---------------- SUB CONTRACTOR STOCK ----------------
@admin.register(SubContractorStock)
class SubContractorStockAdmin(admin.ModelAdmin):
    list_display = ("subcontractor", "material", "quantity")
    search_fields = ("subcontractor__name", "material__name")
