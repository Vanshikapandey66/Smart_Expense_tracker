import React, { useEffect, useState } from "react";
import API from "../services/api";

function Categories({ darkMode }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const heading = darkMode ? "text-white" : "text-black";
  const helpText = darkMode ? "text-gray-300" : "text-gray-500";

  const fetchCategories = () => {
    setLoading(true);
    API.get("categories/")
      .then((res) => {
        setCategories(res.data.results || res.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            "Failed to load categories"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);

    API.post("categories/", {
      name: name.trim(),
      type,
    })
      .then(() => {
        setSuccess("Category added successfully");
        setName("");
        setType("expense");
        fetchCategories();
      })
      .catch((err) => {
        setError(
          err.response?.data?.name?.[0] ||
            err.response?.data?.type?.[0] ||
            err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            "Failed to add category"
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      API.delete(`categories/${id}/`)
        .then(() => {
          setSuccess("Category deleted successfully");
          fetchCategories();
        })
        .catch((err) => {
          setError(
            err.response?.data?.detail ||
              JSON.stringify(err.response?.data) ||
              "Failed to delete category"
          );
        });
    }
  };

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

      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Categories</h2>

      <div className="mb-6 border p-4 rounded-lg shadow-sm bg-white text-black">
        <h3 className="text-xl font-bold mb-3">Add Category</h3>

        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {loading && (
        <div className={`animate-pulse font-semibold mb-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
          Loading categories...
        </div>
      )}

      {!loading && categories.length === 0 && (
        <p className={helpText}>No categories yet. Add your first category.</p>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border p-4 rounded-lg shadow-sm bg-white text-black flex justify-between items-center flex-wrap gap-3"
          >
            <div>
              <p className="font-semibold text-lg">{category.name}</p>
              <p
                className={`text-sm font-medium ${
                  category.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {category.type}
              </p>
            </div>

            <button
              onClick={() => handleDelete(category.id)}
              className="bg-red-500 text-white px-3 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;