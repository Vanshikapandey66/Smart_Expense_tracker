import React, { useEffect, useState } from "react";
import API from "../services/api";
import AddTransaction from "./AddTransaction";
import Modal from "react-modal";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

Modal.setAppElement("#root");

function TransactionList({ darkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const heading = darkMode ? "text-white" : "text-black";
  const helpText = darkMode ? "text-gray-300" : "text-gray-500";
  const axisStroke = darkMode ? "#ffffff" : "#000000";
  const gridStroke = darkMode ? "#4b5563" : "#d1d5db";

  const sortTransactions = (data) => {
    return [...data].sort((a, b) => {
      if (b.id !== a.id) return b.id - a.id;
      return new Date(b.date) - new Date(a.date);
    });
  };

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

  const fetchTransactions = () => {
    setLoading(true);
    setError("");

    API.get("transactions/")
      .then((res) => {
        const responseData = res.data;
        const data = responseData.results || responseData;
        const sortedData = sortTransactions(data);

        setTransactions(sortedData);
        setNextPage(responseData.next || null);
        setPrevPage(responseData.previous || null);
        setCurrentPage(1);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(
            err.response?.data?.detail ||
              JSON.stringify(err.response?.data) ||
              "Failed to load transactions"
          );
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchPage = (url, pageNumber) => {
    if (!url) return;

    setLoading(true);
    setError("");

    API.get(url)
      .then((res) => {
        const responseData = res.data;
        const data = responseData.results || responseData;
        const sortedData = sortTransactions(data);

        setTransactions(sortedData);
        setNextPage(responseData.next || null);
        setPrevPage(responseData.previous || null);
        setCurrentPage(pageNumber);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(
            err.response?.data?.detail ||
              JSON.stringify(err.response?.data) ||
              "Failed to load transactions"
          );
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    API.get("categories/")
      .then((res) => {
        setCategories(res.data.results || res.data);
      })
      .catch(() => setError("Failed to load categories"));
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    return (
      (searchTerm
        ? t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase())
        : true) &&
      (filterCategory ? t.category === filterCategory : true) &&
      (filterDate ? t.date === filterDate : true) &&
      (filterMonth ? t.date?.slice(0, 7) === filterMonth : true) &&
      (minAmount ? Number(t.amount) >= Number(minAmount) : true) &&
      (maxAmount ? Number(t.amount) <= Number(maxAmount) : true)
    );
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      API.delete(`transactions/${id}/`)
        .then(() => {
          setSuccess("Transaction deleted successfully");
          fetchTransactions();
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            setError("Session expired. Please login again.");
          } else {
            setError(
              err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                "Failed to delete transaction"
            );
          }
        });
    }
  };

  const openEditModal = (transaction) => {
    const matchedCategory = categories.find(
      (c) => (c.name || c.title || c.category_name) === transaction.category
    );

    setEditTransaction({
      ...transaction,
      category_id: matchedCategory ? matchedCategory.id : "",
    });

    setModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !editTransaction.category_id ||
      !editTransaction.amount ||
      !editTransaction.description ||
      !editTransaction.date
    ) {
      setError("All edit fields are required");
      return;
    }

    if (Number(editTransaction.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    API.put(`transactions/${editTransaction.id}/`, {
      category_id: editTransaction.category_id,
      amount: editTransaction.amount,
      description: editTransaction.description,
      date: editTransaction.date,
    })
      .then(() => {
        setSuccess("Transaction updated successfully");
        fetchTransactions();
        setModalOpen(false);
        setEditTransaction(null);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(
            err.response?.data?.detail ||
              JSON.stringify(err.response?.data) ||
              "Failed to update transaction"
          );
        }
      });
  };

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      setError("No data available to export");
      return;
    }

    const headers = ["Category,Amount,Description,Date"];
    const rows = filteredTransactions.map(
      (t) => `${t.category},${t.amount},"${t.description}",${t.date}`
    );

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("CSV exported successfully");
  };

  const chartData = filteredTransactions.reduce((acc, t) => {
    const existing = acc.find((c) => c.name === t.category);
    if (existing) {
      existing.value += Number(t.amount);
    } else {
      acc.push({ name: t.category, value: Number(t.amount) });
    }
    return acc;
  }, []);

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterDate("");
    setFilterMonth("");
    setMinAmount("");
    setMaxAmount("");
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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

      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Transactions</h2>

      <AddTransaction
        onAdd={(newTransaction) => {
          setTransactions((prev) => [newTransaction, ...prev]);
          setSuccess("Transaction added successfully");
        }}
      />

      <div className="mb-4 border p-4 rounded-lg shadow-sm bg-white text-black">
        <h3 className="text-xl font-bold mb-3">Filters</h3>

        <div className="flex gap-2 flex-wrap mb-3">
          <input
            type="text"
            placeholder="Search description or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name || c.title || c.category_name}>
                {c.name || c.title || c.category_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black"
          />

          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black"
          />

          <input
            type="number"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <input
            type="number"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setFilterDate(today);
              setFilterMonth("");
            }}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg"
          >
            Today
          </button>

          <button
            onClick={() => {
              setFilterMonth(thisMonth);
              setFilterDate("");
            }}
            className="bg-indigo-500 text-white px-3 py-2 rounded-lg"
          >
            This Month
          </button>

          <button
            onClick={clearAllFilters}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg"
          >
            Clear All
          </button>

          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-3 py-2 rounded-lg"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className={`animate-pulse font-semibold mb-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
          Loading transactions...
        </div>
      )}

      {filteredTransactions.length === 0 && !loading && (
        <p className={helpText}>
          No matching transactions found 😢 Add your first expense!
        </p>
      )}

      {filteredTransactions.map((t) => (
        <div
          key={t.id}
          className="border p-3 mb-2 rounded-lg shadow-sm flex justify-between items-center flex-wrap gap-3 bg-white text-black"
        >
          <div>
            <p className="font-semibold">{t.category}</p>
            <p>₹{t.amount}</p>
            <p className="text-gray-500">{t.description}</p>
            <p className="text-gray-400 text-sm">{t.date}</p>
          </div>

          <div>
            <button
              onClick={() => openEditModal(t)}
              className="bg-yellow-500 text-white px-3 py-2 rounded-lg mr-2"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(t.id)}
              className="bg-red-500 text-white px-3 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-2 mt-4 mb-6 flex-wrap">
        <button
          disabled={!prevPage}
          onClick={() => fetchPage(prevPage, currentPage - 1)}
          className={`px-3 py-2 rounded-lg ${
            prevPage
              ? "bg-gray-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Previous
        </button>

        <span className="px-3 py-2 border rounded-lg bg-white text-black">
          Page {currentPage}
        </span>

        <button
          disabled={!nextPage}
          onClick={() => fetchPage(nextPage, currentPage + 1)}
          className={`px-3 py-2 rounded-lg ${
            nextPage
              ? "bg-gray-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>

      {editTransaction && (
        <Modal
          isOpen={modalOpen}
          onRequestClose={() => {
            setModalOpen(false);
            setEditTransaction(null);
          }}
          className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-lg text-black"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start px-4"
        >
          <h2 className="text-2xl font-bold mb-4">Edit Transaction</h2>

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
            <select
              value={editTransaction.category_id || ""}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  category_id: e.target.value,
                })
              }
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
              value={editTransaction.amount}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  amount: e.target.value,
                })
              }
              className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
              placeholder="Amount"
            />

            <input
              type="text"
              value={editTransaction.description}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  description: e.target.value,
                })
              }
              className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
              placeholder="Description"
            />

            <input
              type="date"
              value={editTransaction.date}
              onChange={(e) =>
                setEditTransaction({
                  ...editTransaction,
                  date: e.target.value,
                })
              }
              className="border p-2 rounded-lg bg-white text-black"
            />

            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditTransaction(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {chartData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className={`text-2xl font-bold mb-2 ${heading}`}>Expenses Summary</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className={`text-2xl font-bold mb-2 ${heading}`}>
            Category-wise Expense Bar Chart
          </h3>
          <BarChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </div>
      )}
    </div>
  );
}

export default TransactionList;