import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";         // Tailwind
import "./styles/global.css"; // Custom global styles
import "./styles/modal.css";  // Optional modal tweaks
import "./styles/charts.css"; // Optional chart tweaks

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);