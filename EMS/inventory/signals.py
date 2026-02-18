# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import InwardItem, OutwardItem, StoreStock, SubContractorStock

# @receiver(post_save, sender=InwardItem)
# def update_stock_on_inward(sender, instance, created, **kwargs):
#     if created:
#         material = instance.material
#         accepted_qty = instance.accepted

#         stock, _ = Stock.objects.get_or_create(material=material)
#         stock.quantity += accepted_qty
#         stock.save()

# @receiver(post_save, sender=OutwardItem)
# def update_stock_on_outward(sender, instance, created, **kwargs):
#     if created:
#         material = instance.material
#         quantity = instance.quantity
#         sub_contractor = instance.outward.sub_contractor

#         # Decrease central stock
#         stock, _ = Stock.objects.get_or_create(material=material)
#         stock.quantity -= quantity
#         stock.save()

#         # Update subcontractor stock
#         sub_stock, _ = SubContractorStock.objects.get_or_create(
#             material=material, sub_contractor=sub_contractor
#         )
#         sub_stock.quantity += quantity
#         sub_stock.save()
