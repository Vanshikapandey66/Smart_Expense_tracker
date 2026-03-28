# 💸 Smart Expense Tracker

A full-stack web application to manage daily expenses, budgets, and financial insights.  
Built using **Django REST Framework** and **React**, with secure authentication and real-time data visualization.

---

## 🚀 Live Demo

- 🔗 Frontend: https://smart-expense-tracker-hazel.vercel.app  
- 🔗 Backend API: https://expense-tracker-backend-vpac.onrender.com/api/

---

## ✨ Features

- 🔐 User Authentication (JWT-based login & register)
- 📊 Dashboard with income, expense, and balance
- 💰 Add, edit, delete transactions
- 🗂 Category management (income & expense types)
- 🎯 Budget tracking with alerts
- 📈 Reports with charts (Pie, Bar, Line)
- 🔍 Filtering, searching, and pagination
- 🌙 Dark / Light mode UI
- 📱 Responsive design

---

## 🛠 Tech Stack

### Frontend
- React
- Axios
- React Router DOM
- Recharts

### Backend
- Django
- Django REST Framework
- Simple JWT (Authentication)
- Django Filter
- drf_yasg (API documentation)

### Database
- PostgreSQL (Production)
- SQLite (Development)

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Render PostgreSQL

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Vanshikapandey66/Smart_Expense_tracker
cd Expense_Tracker_DRF_Project


2️⃣ Backend Setup
python -m venv env
env\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver



3️⃣ Frontend Setup
cd expense-frontend
npm install
npm start



📡 API Endpoints
Authentication
POST /api/register/
POST /api/token/
POST /api/token/refresh/

Categories
GET /api/categories/
POST /api/categories/
DELETE /api/categories/<id>/

Transactions
GET /api/transactions/
POST /api/transactions/
PUT /api/transactions/<id>/
DELETE /api/transactions/<id>/

Budgets
GET /api/budgets/
POST /api/budgets/
PUT /api/budgets/<id>/
DELETE /api/budgets/<id>/



🧠 Key Highlights
🔁 Implemented JWT token refresh flow using Axios interceptors
🔒 Secured API endpoints with authentication
🌐 Successfully deployed full-stack app (Vercel + Render)
📊 Integrated dynamic charts using Recharts
⚡ Optimized API calls with filtering & pagination


⚠️ Challenges Faced
Handling JWT authentication and token refresh
Fixing CORS issues during deployment
Managing separate frontend & backend deployments
Database migration from SQLite to PostgreSQL



🔮 Future Improvements
Forgot password via email
Profile management
Export reports (PDF/CSV)
Notifications for budget alerts
Advanced analytics dashboard



👩‍💻 Author
Vanshika Pandey



📌 Project Status
✅ Completed
✅ Fully deployed
✅ Production ready