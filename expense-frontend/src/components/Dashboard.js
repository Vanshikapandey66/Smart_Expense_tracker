import React, { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard({ darkMode }) {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });

  const [topCategory, setTopCategory] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [budgetCount, setBudgetCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  const [error, setError] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    API.get("summary/")
      .then((res) => {
        setSummary(res.data);
      })
      .catch(() => {
        setError("Failed to load summary");
      })
      .finally(() => setLoadingSummary(false));

    API.get("top-category/")
      .then((res) => {
        setTopCategory(res.data.top_category || "");
      })
      .catch(() => {});

    API.get("transactions/")
      .then((res) => {
        const data = res.data.results || res.data;
        setRecentTransactions(data.slice(0, 5));
        setTransactionCount(data.length);
      })
      .catch(() => {});

    API.get("budget-alert/")
      .then((res) => {
        setAlerts(res.data);
      })
      .catch(() => {});

    API.get("budgets/")
      .then((res) => {
        const data = res.data.results || res.data;
        setBudgetCount(data.length);
      })
      .catch(() => {});

    API.get("categories/")
      .then((res) => {
        const data = res.data.results || res.data;
        setCategoryCount(data.length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const heading = darkMode ? "text-white" : "text-black";
  const helpText = darkMode ? "text-gray-300" : "text-gray-500";
  const successText = darkMode ? "text-green-400" : "text-green-600";

  return (
    <div className="p-4">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {error}
        </div>
      )}

      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Dashboard</h2>

      {loadingSummary && (
        <div className={`animate-pulse font-semibold mb-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
          Loading dashboard...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Total Income</h3>
          <p className="text-2xl font-bold text-green-700">
            ₹{summary.total_income}
          </p>
        </div>

        <div className="bg-red-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Total Expense</h3>
          <p className="text-2xl font-bold text-red-700">
            ₹{summary.total_expense}
          </p>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Balance</h3>
          <p className="text-2xl font-bold text-blue-700">₹{summary.balance}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Total Transactions</h3>
          <p className="text-2xl font-bold text-purple-700">{transactionCount}</p>
        </div>

        <div className="bg-pink-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Total Budgets</h3>
          <p className="text-2xl font-bold text-pink-700">{budgetCount}</p>
        </div>

        <div className="bg-orange-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-black">Total Categories</h3>
          <p className="text-2xl font-bold text-orange-700">{categoryCount}</p>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-xl font-bold mb-2 text-black">Top Spending Category</h3>
        <p className="text-xl font-bold text-yellow-700">
          {topCategory ? topCategory : "No spending data yet"}
        </p>
      </div>

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-2 ${heading}`}>Recent Transactions</h3>

        {recentTransactions.length === 0 ? (
          <p className={helpText}>No transactions yet 😢 Add your first expense!</p>
        ) : (
          recentTransactions.map((t) => (
            <div
              key={t.id}
              className="border p-3 mb-2 rounded-lg shadow-sm flex justify-between items-center flex-wrap gap-3 bg-white text-black"
            >
              <div>
                <p className="font-semibold">{t.category}</p>
                <p className="text-gray-500 text-sm">{t.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{t.amount}</p>
                <p className="text-gray-400 text-sm">{t.date}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className={`text-xl font-bold mb-2 ${heading}`}>Budget Alerts</h3>

        {alerts.length === 0 ? (
          <p className={successText}>All budgets are safe 👍</p>
        ) : (
          alerts.map((a, index) => (
            <div
              key={index}
              className="bg-red-100 border border-red-400 p-3 rounded-lg mb-2 text-black"
            >
              ⚠️ {a.category} budget exceeded (Spent: ₹{a.spent}, Budget: ₹
              {a.budget})
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;