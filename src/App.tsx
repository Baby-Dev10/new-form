import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { Settings } from "lucide-react";
import { ToastContainer } from "react-toastify";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(
    localStorage.getItem("isCustomerLoggedIn") === "true"
  );
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        {/* Main Content */}
        <Routes>
          <Route
            path="/"
            element={
              isCustomerLoggedIn ? (
                <CustomerDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={<Login setIsCustomerLoggedIn={setIsCustomerLoggedIn} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Admin Login Button (Fixed at bottom) */}
        {!isAdminLoggedIn && !isCustomerLoggedIn && (
          <div className="fixed bottom-8 right-8">
            <a
              href="/admin"
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center"
              title="Admin Login"
            >
              <Settings size={24} className="text-gray-600" />
            </a>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
