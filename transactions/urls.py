from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet,monthly_summary, top_spending_category, BudgetViewSet
from .views import category_expense_chart, category_percentage

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('transactions',TransactionViewSet)
router.register('budgets',BudgetViewSet, basename='budget')

urlpatterns = [
  path('', include(router.urls)),
  path('summary/',monthly_summary),
  path('top-category/',top_spending_category),
  path('category-chart/',category_expense_chart),
  path('category-percentage/', category_percentage),
]