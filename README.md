# 💰 Expense Tracker API (Django REST Framework)

A full-featured backend API for managing personal expenses, budgets, and analytics.

---

## 🚀 Features

### 🔐 Authentication
- User login required
- Data is user-specific (no data leakage)

### 📁 Category Management
- Create, update, delete categories
- Income / Expense types supported

### 💸 Transactions
- Add income & expenses
- Recurring transactions support
- Validation (amount > 0)

### 💰 Budget System
- Set monthly budget per category
- Automatic **budget exceeded warning**

### 🔍 Search, Filter & Sorting
- Search by description & category
- Filter by date range
- Sort by amount/date
- Pagination enabled

### 📊 Analytics APIs
- Monthly summary (income, expense, balance)
- Top spending category
- Category-wise expense chart
- Category percentage distribution

---

## 🛠️ Tech Stack

- Python
- Django
- Django REST Framework
- SQLite
- drf-yasg (Swagger API docs)

---

## 📌 API Endpoints

### 🔹 Transactions
- `GET /api/transactions/`
- `POST /api/transactions/`

### 🔹 Categories
- `GET /api/categories/`
- `POST /api/categories/`

### 🔹 Budgets
- `GET /api/budgets/`
- `POST /api/budgets/`

### 🔹 Analytics
- `GET /api/summary/`
- `GET /api/top-category/`
- `GET /api/category-chart/`
- `GET /api/category-percentage/`

---

## 🧪 Sample Request

### Create Transaction

```json
{
  "category_id": 1,
  "amount": 500,
  "date": "2026-03-18",
  "description": "Dinner",
  "is_recurring": false
}