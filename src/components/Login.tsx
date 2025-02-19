import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, AlertCircle, Mail, Settings } from "lucide-react";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";

interface LoginProps {
  setIsCustomerLoggedIn: (value: boolean) => void;
}

function Login({ setIsCustomerLoggedIn }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async () => {
      try {
        setIsLoading(true);
        // In a real app, you would:
        // 1. Send the access token to your backend
        // 2. Verify the token
        // 3. Create a session
        // For demo, we'll just simulate success
        localStorage.setItem("isCustomerLoggedIn", "true");
        setIsCustomerLoggedIn(true);
        toast.success("Login successful!");
        navigate("/");
      } catch (err) {
        toast.error("Failed to login with Google");
        console.error("Google login error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (showAdminLogin) {
        // Demo credentials for admin
        if (email === "admin@example.com" && password === "admin123") {
          localStorage.setItem("isAdminLoggedIn", "true");
          toast.success("Admin login successful!");
          navigate("/admin");
        } else {
          throw new Error("Invalid admin credentials");
        }
      } else {
        // Demo credentials for customer
        if (email === "customer@example.com" && password === "customer123") {
          localStorage.setItem("isCustomerLoggedIn", "true");
          setIsCustomerLoggedIn(true);
          toast.success("Login successful!");
          navigate("/");
        } else {
          throw new Error("Invalid email or password");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        {/* Admin Login Toggle */}
        <button
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title={
            showAdminLogin
              ? "Switch to Customer Login"
              : "Switch to Admin Login"
          }
        >
          <Settings
            size={20}
            className={showAdminLogin ? "text-purple-600" : ""}
          />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {showAdminLogin ? "Admin Login" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 mt-2">
            {showAdminLogin
              ? "Access admin dashboard"
              : "Please sign in to continue"}
          </p>
        </div>

        {!showAdminLogin && (
          <>
            {/* Google Login Button */}
            <button
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full mb-6 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <Mail className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder={
                  showAdminLogin ? "admin@example.com" : "customer@example.com"
                }
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition
              ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
