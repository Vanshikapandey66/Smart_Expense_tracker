import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import TransactionList from "./components/TransactionList";
import Dashboard from "./components/Dashboard";
import Budget from "./components/Budget";
import Reports from "./components/Reports";
import Profile from "./components/Profile";
import Categories from "./components/Categories";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  const showNavbar =
    location.pathname !== "/login" && location.pathname !== "/register";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto p-4">
        {showNavbar && (
          <Navbar
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        <Routes>
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/register" element={<Register darkMode={darkMode} />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard darkMode={darkMode} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories darkMode={darkMode} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionList darkMode={darkMode} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budget darkMode={darkMode} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports darkMode={darkMode} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;