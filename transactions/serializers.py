from rest_framework import serializers
from .models import Category, Transaction, Budget

# ---------------- CATEGORY ----------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

    def validate_type(self, value):
        if value not in ['income', 'expense']:
            raise serializers.ValidationError("Type must be income or expense")
        return value


# ---------------- TRANSACTION ----------------
class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user']
        
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


# ---------------- BUDGET ----------------
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        extra_kwargs = {
            'user':{'read_only':True}
        }

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget must be positive")
        return value