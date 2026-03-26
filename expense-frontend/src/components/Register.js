import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register({ darkMode }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    API.post("register/", formData)
      .then(() => {
        setSuccess("Registration successful. Redirecting to login...");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirm_password: "",
        });
      })
      .catch((err) => {
        setError(
          err.response?.data?.username?.[0] ||
            err.response?.data?.email?.[0] ||
            err.response?.data?.password?.[0] ||
            err.response?.data?.confirm_password?.[0] ||
            err.response?.data?.detail ||
            "Registration failed"
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-md mx-auto mt-16">
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

      <div className="p-6 border rounded-lg shadow-sm bg-white text-black">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;