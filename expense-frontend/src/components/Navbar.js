import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar({ onLogout, darkMode, setDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-yellow-300 font-bold"
      : "text-white hover:text-gray-300";

  return (
    <div className="bg-gray-800 text-white p-4 mb-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">💸 Expense Tracker</h1>

        <div className="hidden md:flex gap-4 items-center flex-wrap">
          <NavLink to="/" className={linkClasses}>
            Dashboard
          </NavLink>

          <NavLink to="/categories" className={linkClasses}>
            Categories
          </NavLink>

          <NavLink to="/transactions" className={linkClasses}>
            Transactions
          </NavLink>

          <NavLink to="/budgets" className={linkClasses}>
            Budgets
          </NavLink>

          <NavLink to="/reports" className={linkClasses}>
            Reports
          </NavLink>

          <NavLink to="/profile" className={linkClasses}>
            Profile
          </NavLink>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-600 px-3 py-2 rounded-lg hover:bg-gray-700"
          >
            {darkMode ? "Light" : "Dark"}
          </button>

          <button
            onClick={onLogout}
            className="bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <button
          className="md:hidden bg-gray-700 px-3 py-2 rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 mt-4">
          <NavLink to="/" className={linkClasses} onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>

          <NavLink
            to="/categories"
            className={linkClasses}
            onClick={() => setMenuOpen(false)}
          >
            Categories
          </NavLink>

          <NavLink
            to="/transactions"
            className={linkClasses}
            onClick={() => setMenuOpen(false)}
          >
            Transactions
          </NavLink>

          <NavLink
            to="/budgets"
            className={linkClasses}
            onClick={() => setMenuOpen(false)}
          >
            Budgets
          </NavLink>

          <NavLink
            to="/reports"
            className={linkClasses}
            onClick={() => setMenuOpen(false)}
          >
            Reports
          </NavLink>

          <NavLink
            to="/profile"
            className={linkClasses}
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </NavLink>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-600 px-3 py-2 rounded-lg hover:bg-gray-700 text-left"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={onLogout}
            className="bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 text-left"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;