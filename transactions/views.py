from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Transaction, Budget
from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    BudgetSerializer,
    RegisterSerializer,
)


# ---------------- REGISTER ----------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ---------------- CATEGORY ----------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-id")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------------- TRANSACTION FILTER ----------------
class TransactionFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name="date", lookup_expr="gte")
    end_date = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Transaction
        fields = ["category", "start_date", "end_date"]


# ---------------- TRANSACTION ----------------
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by("-date", "-id")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["description", "category__name"]
    ordering_fields = ["amount", "date"]
    filterset_class = TransactionFilter

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by("-date", "-id")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction = serializer.save(user=request.user)

        user = request.user
        category = transaction.category
        date = transaction.date
        month = date.month
        year = date.year

        budget = Budget.objects.filter(
            user=user,
            category=category,
            month=month,
            year=year
        ).first()

        response_data = serializer.data

        if budget:
            total_spent = Transaction.objects.filter(
                user=user,
                category=category,
                date__month=month,
                date__year=year
            ).aggregate(total=Sum("amount"))["total"] or 0

            if total_spent > budget.amount:
                response_data["warning"] = "⚠️ Budget exceeded!"

        return Response(response_data, status=status.HTTP_201_CREATED)


# ---------------- BUDGET ----------------
class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all().order_by("-id")
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------------- MONTHLY SUMMARY ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    income = Transaction.objects.filter(
        user=request.user,
        category__type__iexact="income"
    ).aggregate(Sum("amount"))

    expense = Transaction.objects.filter(
        user=request.user,
        category__type__iexact="expense"
    ).aggregate(Sum("amount"))

    total_income = income["amount__sum"] or 0
    total_expense = expense["amount__sum"] or 0
    balance = total_income - total_expense

    return Response({
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    })


# ---------------- TOP SPENDING CATEGORY ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_spending_category(request):
    data = (
        Transaction.objects
        .filter(user=request.user, category__type__iexact="expense")
        .values("category__name")
        .annotate(total_spent=Sum("amount"))
        .order_by("-total_spent")
        .first()
    )

    if not data:
        return Response({"top_category": "", "total_spent": 0})

    return Response({
        "top_category": data["category__name"],
        "total_spent": data["total_spent"]
    })


# ---------------- CATEGORY EXPENSE CHART ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_expense_chart(request):
    data = (
        Transaction.objects
        .filter(user=request.user, category__type__iexact="expense")
        .values("category__name")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )

    if not data:
        return Response({})

    result = {}
    for item in data:
        result[item["category__name"]] = item["total"]

    return Response(result)


# ---------------- BUDGET STATUS ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_status(request):
    from datetime import datetime

    month = datetime.now().month
    year = datetime.now().year

    budget = Budget.objects.filter(
        user=request.user,
        month=month,
        year=year
    ).first()

    if not budget:
        return Response({"message": "No budget set"})

    total_spent = Transaction.objects.filter(
        user=request.user,
        date__month=month,
        date__year=year
    ).aggregate(Sum("amount"))["amount__sum"] or 0

    return Response({
        "budget": budget.amount,
        "spent": total_spent,
        "remaining": budget.amount - total_spent
    })


# ---------------- BUDGET ALERT ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def budget_alert(request):
    alerts = []

    budgets = Budget.objects.filter(user=request.user).order_by("-id")

    for budget in budgets:
        spent = Transaction.objects.filter(
            user=request.user,
            category=budget.category,
            date__month=budget.month,
            date__year=budget.year,
            category__type__iexact="expense"
        ).aggregate(Sum("amount"))["amount__sum"] or 0

        if spent > budget.amount:
            alerts.append({
                "category": budget.category.name,
                "budget": budget.amount,
                "spent": spent,
                "status": "Exceeded"
            })

    return Response(alerts)


# ---------------- CATEGORY PERCENTAGE ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_percentage(request):
    data = (
        Transaction.objects
        .filter(user=request.user, category__type__iexact="expense")
        .values("category__name")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )

    total_sum = sum(item["total"] for item in data)

    if total_sum == 0:
        return Response({
            "status": "error",
            "message": "No Data Available"
        })

    result = {}
    for item in data:
        percent = (item["total"] / total_sum) * 100 if total_sum > 0 else 0
        result[item["category__name"]] = round(percent, 2)

    return Response(result)