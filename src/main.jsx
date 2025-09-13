import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WindowSizeProvider } from "./contexts/WindowSizeContext";
import { AppProvider } from "./contexts/AppContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WindowSizeProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </WindowSizeProvider>
  </StrictMode>,
);
