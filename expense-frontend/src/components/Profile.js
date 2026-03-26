import React, { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ darkMode }) {
  const [transactionCount, setTransactionCount] = useState(0);
  const [budgetCount, setBudgetCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("access_token"));

    API.get("transactions/")
      .then((res) => {
        const data = res.data.results || res.data;
        setTransactionCount(data.length);
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

  const heading = darkMode ? "text-white" : "text-black";

  return (
    <div className="p-4">
      <h2 className={`text-2xl font-bold mb-4 ${heading}`}>Profile</h2>

      <div className="border p-4 rounded-lg shadow-sm bg-white space-y-3 text-black">
        <p>
          <span className="font-semibold">Login Status:</span>{" "}
          {hasToken ? "Logged In ✅" : "Not Logged In ❌"}
        </p>

        <p>
          <span className="font-semibold">Total Transactions:</span>{" "}
          {transactionCount}
        </p>

        <p>
          <span className="font-semibold">Total Budgets:</span> {budgetCount}
        </p>

        <p>
          <span className="font-semibold">Total Categories:</span>{" "}
          {categoryCount}
        </p>

        
      </div>
    </div>
  );
}

export default Profile;