from rest_framework import viewsets
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime
from rest_framework.response import Response
from rest_framework import status

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all() 
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionFilter(filters.FilterSet):
  start_date = filters.DateFilter(field_name="date",lookup_expr='gte')
  end_date = filters.DateFilter(field_name="date",lookup_expr='lte')

  class Meta:
    model = Transaction
    fields = ['category','start_date','end_date']

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all() 
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['description', 'category__name']
    ordering_fields = ['amount','date']
    filterset_class = TransactionFilter

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
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
        ).aggregate(total=Sum('amount'))['total'] or 0

        if total_spent > budget.amount:
            response_data['warning'] = "⚠️ Budget exceeded!"
            return Response(response_data, status=status.HTTP_201_CREATED)

    # def perform_create(self, serializer):
    #    transaction = serializer.save(user=self.request.user)

    #    user = self.request.user
    #    category=transaction.category
    #    date=transaction.date 
    #    month=date.month 
    #    year=date.year 
    #    budget = Budget.objects.filter(
    #       user=user,
    #       category=category,
    #       month=month,
    #       year=year
    #    ).first()

    #    if budget:
    #       total_spent = Transaction.objects.filter(
    #          user=user,
    #          category=category,
    #          date__month=month,
    #          date__year=year
    #       ).aggregate(total=Sum('amount'))['total'] or 0

    #       if total_spent > budget.amount:
    #          print("🚨 Budget Exceeded!")
        # serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
   queryset = Budget.objects.all() 
   serializer_class = BudgetSerializer
   permission_classes = [IsAuthenticated]

   def get_queryset(self):
      return Budget.objects.filter(user=self.request.user)
   def perform_create(self,serializer):
      serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
  income = Transaction.objects.filter(user=request.user,category__type__iexact="income").aggregate(Sum("amount"))

  expense = Transaction.objects.filter(
     user=request.user,
     category__type__iexact="expense"
     ).aggregate(Sum("amount"))

  total_income = income["amount__sum"] or 0
  total_expense = expense["amount__sum"] or 0

  balance = total_income - total_expense

  return Response({
    "total_income":total_income,
    "total_expense":total_expense,
    "balance":balance
  })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_spending_category(request):
  data = (
    Transaction.objects
    .filter(user=request.user)
    .values('category__name')
    .annotate(total_spent=Sum('amount'))
    .order_by('-total_spent')
    .first()
  )
  if not data:
    return Response({"message":"No transactions found"})
  return Response({
    "top_category": data["category__name"],
    "total_spent":data["total_spent"]
  })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_expense_chart(request):
  data = (
    Transaction.objects
    .filter(user=request.user)
    .values('category__name')
    .annotate(total=Sum('amount'))
  )
  if not data:
    return Response({"message": "No data available"})
  result = {}

  for item in data:
    result[item['category__name']] = item['total']
  return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def budget_status(request):
   from datetime import datetime

   month = datetime.now().month
   year = datetime.now().year

   budget = Budget.objects.filter(user=request.user, month=month, year=year).first()

   if not budget:
      return Response({"message":"No budget set"})
   
   total_spent = Transaction.objects.filter(
      user=request.user,
      date__month=month,
      date__year=year
   ).aggregate(Sum("amount"))["amount__sum"] or 0

   return Response({
      "budget":budget.amount,
      "spent":total_spent,
      "remaining":budget.amount - total_spent
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def budget_alert(request):
   alerts = []

   budgets = Budget.objects.filter(user=request.user)

   for budget in budgets:
      spent = Transaction.objects.filter(
         user = request.user,
         category=budget.category,
         date__month=budget.month,
         date__year=budget.year
      ).aggregate(Sum('amount'))['amount__sum'] or 0

      if spent > budget.amount:
         alerts.append({
            "category":budget.category.name,
            "budget":budget.amount,
            "spent":spent,
            "status":"Exceeded"
         })
   return Response(alerts)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_percentage(request):
   data = (
      Transaction.objects
      .filter(user=request.user)
      .values('category__name')
      .annotate(total=Sum('amount'))
   )

   total_sum = sum(item['total'] for item in data)
   if total_sum == 0:
      return Response({
         "status":"error",
         "message": "No Data Available"
         })
   
   result = {}

   for item in data:
      percent = (item['total'] / total_sum)*100 if total_sum > 0 else 0
      result[item['category__name']] = round(percent,2)

   return Response(result)