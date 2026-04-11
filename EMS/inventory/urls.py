from django.urls import path
from .views import *

urlpatterns = [
    path("materials/", MaterialListCreateAPIView.as_view()),
    path("suppliers/", SupplierListCreateAPIView.as_view()),
    path("subcontractors/", SubContractorListCreateAPIView.as_view()),

    path("inwards/", InwardListCreateAPIView.as_view()),
    path("outwards/", OutwardListCreateAPIView.as_view()),
    path("store-stock/", StoreStockListAPIView.as_view()),

        path("work-orders/", WorkOrderListCreateAPIView.as_view()),
    path("workorders/<uuid:wo_id>/status/", WorkOrderStatusAPIView.as_view()),
    path("indents/", IndentAPIView.as_view()),
]
