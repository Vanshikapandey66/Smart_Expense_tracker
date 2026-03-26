import React, { useEffect, useState } from "react";
import API from "../services/api";

function AddTransaction({ onAdd }) {
  const today = new Date().toISOString().split("T")[0];

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get("categories/")
      .then((res) => setCategories(res.data.results || res.data))
      .catch(() => setError("Failed to load categories"));
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

    if (!categoryId || !amount || !description || !date) {
      setError("All fields are required");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setSubmitting(true);

    API.post("transactions/", {
      category_id: categoryId,
      amount,
      description,
      date,
    })
      .then((res) => {
        setSuccess("Transaction added successfully");
        onAdd(res.data);
        setCategoryId("");
        setAmount("");
        setDescription("");
        setDate(today);
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            "Failed to add transaction"
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="mb-4 border p-4 rounded-lg shadow-sm bg-white text-black">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
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
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded-lg bg-white text-black"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;