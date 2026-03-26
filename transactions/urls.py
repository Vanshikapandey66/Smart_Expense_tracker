from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    monthly_summary,
    top_spending_category,
    category_expense_chart,
    budget_status,
    budget_alert,
    category_percentage,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'budgets', BudgetViewSet, basename='budgets')

urlpatterns = [
    path('', include(router.urls)),

    path('summary/', monthly_summary, name='monthly-summary'),
    path('top-category/', top_spending_category, name='top-category'),
    path('category-chart/', category_expense_chart, name='category-chart'),
    path('budget-status/', budget_status, name='budget-status'),
    path('budget-alert/', budget_alert, name='budget-alert'),
    path('category-percentage/', category_percentage, name='category-percentage'),
]