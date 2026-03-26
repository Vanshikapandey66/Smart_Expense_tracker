from rest_framework import serializers
from django.db.models import Sum
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Category, Transaction, Budget


# ---------------- REGISTER (NEW USER SIGNUP) ----------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        return user


# ---------------- CATEGORY ----------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_type(self, value):
        if value not in ["income", "expense"]:
            raise serializers.ValidationError("Type must be income or expense")
        return value


# ---------------- TRANSACTION ----------------
class TransactionSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True
    )

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


# ---------------- BUDGET ----------------
class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            "id",
            "category",
            "category_name",
            "amount",
            "month",
            "year",
            "spent",
            "remaining",
        ]
        read_only_fields = ["user"]

    def get_spent(self, obj):
        total_spent = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            date__month=obj.month,
            date__year=obj.year
        ).aggregate(total=Sum("amount"))["total"] or 0

        return total_spent

    def get_remaining(self, obj):
        total_spent = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            date__month=obj.month,
            date__year=obj.year
        ).aggregate(total=Sum("amount"))["total"] or 0

        return obj.amount - total_spent