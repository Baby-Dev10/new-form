import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Clock, CheckCircle, Menu, X, Crown } from "lucide-react";
import BookingForm from "./BookingForm";

const TABS = [
  { id: "form", label: "Book Session", icon: User },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
];

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("form");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const sessionPrice = 200;

  useEffect(() => {
    // In a real app, fetch user profile from Google
    const mockProfile = {
      name: "John Doe",
      email: "john@example.com",
      picture:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces",
    };
    setUserProfile(mockProfile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isCustomerLoggedIn");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "form":
        return <BookingForm sessionPrice={sessionPrice} />;
      case "pending":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Sessions</h2>
            {/* Add pending sessions list here */}
          </div>
        );
      case "approved":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Approved Sessions</h2>
            {/* Add approved sessions list here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-purple-600">
              Session Booking
            </h1>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <img
                src={userProfile?.picture}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm font-medium">
                {userProfile?.name}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.name}
                  </p>
                  <p className="text-sm text-gray-500">{userProfile?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform pt-14
            lg:translate-x-0 lg:static lg:inset-0
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition
                    ${
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}

            {/* Premium Plan Section (if user has premium) */}
            <div className="pt-4 mt-4 border-t">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition">
                <Crown size={20} />
                Premium Benefits
              </button>
            </div>
          </nav>

          {/* Mobile Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t lg:hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            >
              <LogOut size={20} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4">{renderContent()}</main>
      </div>
    </div>
  );
}

export default CustomerDashboard;
