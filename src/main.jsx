import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WindowSizeProvider } from "./contexts/WindowSizeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WindowSizeProvider>
      <App />
    </WindowSizeProvider>
  </StrictMode>,
);
