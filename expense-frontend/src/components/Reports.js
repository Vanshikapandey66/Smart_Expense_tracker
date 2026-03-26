import React, { useEffect, useState } from "react";
import API from "../services/api";
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
  LineChart,
  Line,
} from "recharts";

function Reports({ darkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    API.get("transactions/")
      .then((res) => {
        setTransactions(res.data.results || res.data);
      })
      .catch(() => setError("Failed to load reports data"))
      .finally(() => setLoading(false));

    API.get("categories/")
      .then((res) => {
        setCategories(res.data.results || res.data);
      })
      .catch(() => {});
  }, []);

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

  const filteredTransactions = transactions.filter((t) => {
    return (
      (filterCategory ? t.category === filterCategory : true) &&
      (filterMonth ? t.date?.slice(0, 7) === filterMonth : true)
    );
  });

  const totalExpense = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  const totalTransactions = filteredTransactions.length;

  const chartData = filteredTransactions.reduce((acc, t) => {
    const existing = acc.find((c) => c.name === t.category);
    if (existing) existing.value += Number(t.amount);
    else acc.push({ name: t.category, value: Number(t.amount) });
    return acc;
  }, []);

  const lineChartData = filteredTransactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    const existing = acc.find((item) => item.month === month);

    if (existing) existing.value += Number(t.amount);
    else acc.push({ month, value: Number(t.amount) });

    return acc;
  }, []);

  lineChartData.sort((a, b) => a.month.localeCompare(b.month));

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      setError("No report data available to export");
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
    link.setAttribute("download", "reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("Reports CSV exported successfully");
  };

  const heading = darkMode ? "text-white" : "text-black";
  const helpText = darkMode ? "text-gray-300" : "text-gray-500";
  const axisStroke = darkMode ? "#ffffff" : "#000000";
  const gridStroke = darkMode ? "#4b5563" : "#d1d5db";

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

      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Reports</h2>

      {loading && (
        <div className={`animate-pulse font-semibold mb-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
          Loading reports...
        </div>
      )}

      <div className="mb-4 border p-4 rounded-lg shadow-sm flex gap-2 flex-wrap bg-white text-black">
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
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black"
        />

        <button
          onClick={() => {
            setFilterCategory("");
            setFilterMonth("");
          }}
          className="bg-gray-500 text-white px-3 py-2 rounded-lg"
        >
          Clear
        </button>

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-3 py-2 rounded-lg"
        >
          Export CSV
        </button>
      </div>

      {filteredTransactions.length === 0 && !loading && (
        <p className={helpText}>No report data found 😢 Add some transactions first.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold mb-2 text-black">Filtered Transactions</h3>
          <p className="text-2xl font-bold text-blue-700">
            {totalTransactions}
          </p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold mb-2 text-black">Filtered Expense</h3>
          <p className="text-2xl font-bold text-green-700">₹{totalExpense}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className={`text-2xl font-bold mb-2 ${heading}`}>Pie Chart</h3>
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
          <h3 className={`text-2xl font-bold mb-2 ${heading}`}>Bar Chart</h3>
          <BarChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="name" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </div>
      )}

      {lineChartData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className={`text-2xl font-bold mb-2 ${heading}`}>Line Chart</h3>
          <LineChart width={500} height={300} data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" stroke={axisStroke} />
            <YAxis stroke={axisStroke} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6, fill: "#3b82f6" }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </div>
      )}
    </div>
  );
}

export default Reports;