import { useState, useEffect } from "react";
import {
  Check,
  X,
  Download,
  DollarSign,
  Users,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  X as Close,
  Crown,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

interface Session {
  id: string;
  name: string;
  age: number;
  sessions: number;
  paymentMethod: string;
  status: "pending" | "approved" | "cancelled";
  createdAt: string;
  premiumPlan?: "gold" | "platinum";
}

interface PremiumPlan {
  name: string;
  price: number;
  features: string[];
}

function AdminDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pricePerSession, setPricePerSession] = useState<number>(500);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "cancelled" | "premium"
  >("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [premiumPlans, setPremiumPlans] = useState<{
    gold: PremiumPlan;
    platinum: PremiumPlan;
  }>({
    gold: {
      name: "Gold",
      price: 999,
      features: [
        "Priority Booking",
        "Dedicated Support",
        "Flexible Rescheduling",
        "Basic Health Assessment",
      ],
    },
    platinum: {
      name: "Platinum",
      price: 1999,
      features: [
        "All Gold Features",
        "24/7 Support Access",
        "Personalized Program",
        "Monthly Health Review",
        "Nutrition Consultation",
      ],
    },
  });
  const [isEditingPremiumPlans, setIsEditingPremiumPlans] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        "https://form-session-back.vercel.app/api/sessions"
      );
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "approved" | "cancelled"
  ) => {
    try {
      await axios.patch(
        `https://form-session-back.vercel.app/api/sessions/${id}`,
        { status }
      );
      toast.success(`Session ${status} successfully`);
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session status");
    }
  };

  const handleDownloadReceipt = async (id: string) => {
    try {
      const response = await axios.get(
        `https://form-session-back.vercel.app/api/receipt/${id}`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  const handlePriceUpdate = async () => {
    try {
      await axios.patch("https://form-session-back.vercel.app/api/settings", {
        pricePerSession,
      });
      toast.success("Price updated successfully");
      setIsEditingPrice(false);
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    }
  };

  const handlePremiumPlanUpdate = async () => {
    try {
      await axios.patch(
        "https://form-session-back.vercel.app/api/premium-plans",
        {
          plans: premiumPlans,
        }
      );
      toast.success("Premium plans updated successfully");
      setIsEditingPremiumPlans(false);
    } catch (error) {
      console.error("Error updating premium plans:", error);
      toast.error("Failed to update premium plans");
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (activeTab === "all") return true;
    if (activeTab === "premium") return session.premiumPlan;
    return session.status === activeTab;
  });

  const totalSessions = sessions.reduce(
    (acc, session) => acc + session.sessions,
    0
  );
  const totalCustomers = sessions.length;
  const totalRevenue = sessions
    .filter((session) => session.status === "approved")
    .reduce((acc, session) => {
      const sessionCost = session.sessions * pricePerSession;
      const premiumCost = session.premiumPlan
        ? premiumPlans[session.premiumPlan].price
        : 0;
      return acc + sessionCost + premiumCost;
    }, 0);

  const stats = [
    {
      title: "Total Sessions",
      value: totalSessions,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "bg-purple-500",
    },
  ];

  const tabs = [
    { id: "all", label: "All Sessions", icon: Calendar },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "approved", label: "Approved", icon: CheckCircle },
    { id: "cancelled", label: "Cancelled", icon: XCircle },
    { id: "premium", label: "Premium", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Close size={24} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
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
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 lg:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Session Price Settings */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <DollarSign size={20} className="text-gray-600" />
                <span className="font-medium">Price per Session:</span>
                {isEditingPrice ? (
                  <div className="flex items-center gap-2 flex-1 lg:flex-initial">
                    <input
                      type="number"
                      value={pricePerSession}
                      onChange={(e) =>
                        setPricePerSession(Number(e.target.value))
                      }
                      className="w-24 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={handlePriceUpdate}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>₹{pricePerSession}</span>
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Premium Plans Settings */}
              {activeTab === "premium" && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Premium Plans
                    </h3>
                    <button
                      onClick={() =>
                        setIsEditingPremiumPlans(!isEditingPremiumPlans)
                      }
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {isEditingPremiumPlans ? "Cancel" : "Edit Plans"}
                    </button>
                  </div>

                  {isEditingPremiumPlans ? (
                    <div className="space-y-4">
                      {Object.entries(premiumPlans).map(([key, plan]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-2">
                            {plan.name} Plan
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm text-gray-600">
                                Price
                              </label>
                              <input
                                type="number"
                                value={plan.price}
                                onChange={(e) =>
                                  setPremiumPlans((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...plan,
                                      price: Number(e.target.value),
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600">
                                Features (one per line)
                              </label>
                              <textarea
                                value={plan.features.join("\n")}
                                onChange={(e) =>
                                  setPremiumPlans((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...plan,
                                      features: e.target.value.split("\n"),
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 border rounded h-24"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handlePremiumPlanUpdate}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Save Premium Plans
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(premiumPlans).map(([key, plan]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-800">
                              {plan.name} Plan
                            </h4>
                            <span className="text-purple-600 font-bold">
                              ₹{plan.price}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sessions Table/Cards */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Age: {session.age}
                      </p>
                      {session.premiumPlan && (
                        <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                          <Crown size={14} />
                          {session.premiumPlan.charAt(0).toUpperCase() +
                            session.premiumPlan.slice(1)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${
                        session.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : session.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Sessions</p>
                      <p className="font-medium">{session.sessions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Method</p>
                      <p className="font-medium">{session.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium">
                        ₹
                        {(
                          session.sessions * pricePerSession +
                          (session.premiumPlan
                            ? premiumPlans[session.premiumPlan].price
                            : 0)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {session.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(session.id, "approved")
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(session.id, "cancelled")
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownloadReceipt(session.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.age}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.sessions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.premiumPlan ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <Crown size={16} />
                            {session.premiumPlan.charAt(0).toUpperCase() +
                              session.premiumPlan.slice(1)}
                          </span>
                        ) : (
                          <span className="text-gray-500">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            session.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : session.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹
                          {(
                            session.sessions * pricePerSession +
                            (session.premiumPlan
                              ? premiumPlans[session.premiumPlan].price
                              : 0)
                          ).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {session.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(session.id, "approved")
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(session.id, "cancelled")
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <X size={20} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDownloadReceipt(session.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
