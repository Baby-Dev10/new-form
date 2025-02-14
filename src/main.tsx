import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import GoogleAuthProvider from "./auth/GoogleAuthProvider";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
  </StrictMode>
);
