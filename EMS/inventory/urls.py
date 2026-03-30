from django.urls import path
from .views import *

urlpatterns = [
    # Basic Resources
    path("materials/", MaterialListCreateAPIView.as_view()),
    path("suppliers/", SupplierListCreateAPIView.as_view()),
    path("subcontractors/", SubContractorListCreateAPIView.as_view()),

    # Inward/Outward
    path("inwards/", InwardListCreateAPIView.as_view()),
    path("outwards/", OutwardListCreateAPIView.as_view()),
    path("store-stock/", StoreStockListAPIView.as_view()),
    
    # Work Order
    path("work-orders/", WorkOrderListCreateAPIView.as_view()),
    path("work-orders/<uuid:wo_id>/", WorkOrderDetailAPIView.as_view()),
    
    # Indent
    path("indents/", IndentListCreateAPIView.as_view()),
    path("indents/<uuid:indent_id>/", IndentDetailAPIView.as_view()),]