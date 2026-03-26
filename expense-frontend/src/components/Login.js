import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login({ darkMode }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    API.post("token/", { username, password })
      .then((res) => {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        navigate("/");
      })
      .catch(() => setError("Invalid credentials"))
      .finally(() => setSubmitting(false));
  };

  const outerText = darkMode ? "text-white" : "text-black";

  return (
    <div className="max-w-sm mx-auto mt-20">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {error}
        </div>
      )}

      <div className="p-6 border rounded-lg shadow-sm bg-white text-black">
        <h2 className={`text-2xl font-bold mb-4 ${outerText === "text-white" ? "text-black" : "text-black"}`}>
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded-lg bg-white text-black placeholder-gray-500"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          New user?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;