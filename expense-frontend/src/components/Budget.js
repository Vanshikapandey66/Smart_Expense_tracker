import React, { useEffect, useState } from "react";
import API from "../services/api";

function Budget({ darkMode }) {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editBudget, setEditBudget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const yearOptions = ["2025", "2026", "2027", "2028"];

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchBudgets = () => {
    API.get("budgets/")
      .then((res) => setBudgets(res.data.results || res.data))
      .catch(() => setError("Failed to load budgets"));
  };

  useEffect(() => {
    fetchBudgets();

    API.get("categories/")
      .then((res) => setCategories(res.data.results || res.data))
      .catch(() => setError("Failed to load categories"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!categoryId || !amount || !month || !year) {
      setError("All fields are required");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Budget amount must be greater than 0");
      return;
    }

    API.post("budgets/", {
      category: categoryId,
      amount,
      month,
      year,
    })
      .then(() => {
        setSuccess("Budget added successfully");
        setCategoryId("");
        setAmount("");
        setMonth("");
        setYear("");
        fetchBudgets();
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            "Failed to add budget"
        );
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      API.delete(`budgets/${id}/`)
        .then(() => {
          setSuccess("Budget deleted successfully");
          fetchBudgets();
        })
        .catch((err) => {
          setError(
            err.response?.data?.detail ||
              JSON.stringify(err.response?.data) ||
              "Failed to delete budget"
          );
        });
    }
  };

  const handleEdit = () => {
    if (!editBudget.amount || !editBudget.month || !editBudget.year) {
      setError("All edit fields are required");
      return;
    }

    if (Number(editBudget.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    API.put(`budgets/${editBudget.id}/`, {
      category: editBudget.category,
      amount: editBudget.amount,
      month: editBudget.month,
      year: editBudget.year,
    })
      .then(() => {
        setSuccess("Budget updated successfully");
        setModalOpen(false);
        setEditBudget(null);
        fetchBudgets();
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            "Failed to update budget"
        );
      });
  };

  const heading = darkMode ? "text-white" : "text-black";
  const helpText = darkMode ? "text-gray-300" : "text-gray-500";

  return (
    <div className="p-4">
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {error}
        </div>
      )}

      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Budgets</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap mb-6">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || c.title || c.category_name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Budget Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
        />

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black"
        >
          <option value="">Select Month</option>
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black"
        >
          <option value="">Select Year</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Add Budget
        </button>
      </form>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className={helpText}>No budgets added yet 💸</p>
        ) : (
          budgets.map((budget) => {
            const spent = Number(budget.spent || 0);
            const totalBudget = Number(budget.amount || 0);
            const remaining = totalBudget - spent;
            const isOverBudget = spent > totalBudget;
            const progress =
              totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;

            return (
              <div
                key={budget.id}
                className={`border p-4 rounded-lg shadow-sm text-black ${
                  isOverBudget ? "border-red-500 bg-red-50" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-lg">
                      {budget.category_name || budget.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      {monthOptions.find((m) => m.value === String(budget.month))
                        ?.label || budget.month}{" "}
                      / {budget.year}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setEditBudget(budget);
                        setModalOpen(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p>Budget: ₹{totalBudget}</p>
                  <p>Spent: ₹{spent}</p>
                  <p>Remaining: ₹{remaining}</p>
                  <p className="text-sm font-medium">
                    ₹{spent} spent out of ₹{totalBudget}
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-lg h-3 mt-3">
                  <div
                    className={`h-3 rounded-lg ${
                      isOverBudget ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-sm mt-1">{progress.toFixed(0)}% budget used</p>

                {isOverBudget && (
                  <p className="text-red-500 font-bold mt-1">⚠️ Over budget</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {modalOpen && editBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center px-4">
          <div className="bg-white text-black p-6 rounded-lg w-80 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Budget</h2>

            <input
              type="number"
              value={editBudget.amount}
              onChange={(e) =>
                setEditBudget({ ...editBudget, amount: e.target.value })
              }
              className="border p-2 rounded-lg w-full mb-2 bg-white text-black placeholder-gray-500"
              placeholder="Amount"
            />

            <select
              value={editBudget.month}
              onChange={(e) =>
                setEditBudget({ ...editBudget, month: e.target.value })
              }
              className="border p-2 rounded-lg w-full mb-2 bg-white text-black"
            >
              <option value="">Select Month</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={editBudget.year}
              onChange={(e) =>
                setEditBudget({ ...editBudget, year: e.target.value })
              }
              className="border p-2 rounded-lg w-full mb-4 bg-white text-black"
            >
              <option value="">Select Year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 flex-wrap">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditBudget(null);
                }}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;