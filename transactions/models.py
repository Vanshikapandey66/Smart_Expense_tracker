from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
  name = models.CharField(max_length=50)
  type = models.CharField(max_length=10)
  user = models.ForeignKey(User, on_delete=models.CASCADE)

  def __str__(self):
    return self.name
  class Meta:
    verbose_name_plural = "Categories"
  
class Transaction(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  category = models.ForeignKey(Category, on_delete=models.CASCADE)
  amount = models.FloatField()
  date = models.DateField()
  description = models.TextField(blank=True)
  is_recurring = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.amount} - {self.category.name}"

class Budget(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  category = models.ForeignKey(Category, on_delete=models.CASCADE)
  amount = models.FloatField()
  month = models.IntegerField()
  year = models.IntegerField()

  def __str__(self):
    return f"{self.category.name} - {self.amount}"