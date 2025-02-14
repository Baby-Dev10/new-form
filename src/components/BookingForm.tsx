import { useForm } from "react-hook-form";
import {
  CreditCard,
  Building2,
  AlertCircle,
  IndianRupee,
  Crown,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import axios from "axios";

interface FormData {
  name: string;
  age: number;
  sessions: number;
  paymentMethod: "card" | "bank";
  premiumPlan?: "gold" | "platinum";
}

interface BookingFormProps {
  sessionPrice: number;
}

function BookingForm({ sessionPrice }: BookingFormProps) {
  const [showPremiumPlans, setShowPremiumPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"gold" | "platinum" | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      sessions: 1,
      paymentMethod: "card",
    },
  });

  const numberOfSessions = watch("sessions", 1);
  const baseAmount = numberOfSessions * sessionPrice;

  // Premium plan prices
  const premiumPlans = {
    gold: {
      price: 999,
      features: [
        "Priority Booking",
        "Dedicated Support",
        "Flexible Rescheduling",
        "Basic Health Assessment",
      ],
    },
    platinum: {
      price: 1999,
      features: [
        "All Gold Features",
        "24/7 Support Access",
        "Personalized Program",
        "Monthly Health Review",
        "Nutrition Consultation",
      ],
    },
  };

  const totalAmount =
    baseAmount + (selectedPlan ? premiumPlans[selectedPlan].price : 0);

  const receiptGen = async (id: string) => {
    try {
      const response = await axios.get(
        `https://form-session-back.vercel.app/api/receipt/${id}`,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Receipt.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const submitData = {
        ...data,
        premiumPlan: selectedPlan,
        totalAmount,
      };

      const response = await axios.post(
        "https://form-session-back.vercel.app/api/submit",
        submitData
      );

      if (selectedPlan) {
        // Notify admin about premium plan selection
        await axios.post(
          "https://form-session-back.vercel.app/api/notify-admin",
          {
            type: "premium_plan",
            plan: selectedPlan,
            userName: data.name,
          }
        );
      }

      toast.success("Booking successful!");
      await receiptGen(response.data.id);
      reset();
      setSelectedPlan(null);
      setShowPremiumPlans(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  const handlePlanSelection = (plan: "gold" | "platinum") => {
    setSelectedPlan(plan);
    setValue("premiumPlan", plan);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Book a Session
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\s]*$/,
                  message: "Name can only contain letters and spaces",
                },
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
              placeholder="John Doe"
            />
            {errors.name && (
              <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.name.message}
              </div>
            )}
          </div>

          {/* Age Field */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age
            </label>
            <input
              type="number"
              id="age"
              {...register("age", {
                required: "Age is required",
                min: { value: 18, message: "Must be at least 18 years old" },
                max: { value: 120, message: "Invalid age" },
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.age ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
              placeholder="25"
            />
            {errors.age && (
              <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.age.message}
              </div>
            )}
          </div>

          {/* Number of Sessions Field */}
          <div>
            <label
              htmlFor="sessions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Sessions
            </label>
            <input
              type="number"
              id="sessions"
              {...register("sessions", {
                required: "Number of sessions is required",
                min: { value: 1, message: "Minimum 1 session required" },
                max: { value: 10, message: "Maximum 10 sessions allowed" },
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.sessions ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
              placeholder="1"
            />
            {errors.sessions && (
              <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.sessions.message}
              </div>
            )}
          </div>

          {/* Total Amount Display */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Amount:</span>
              <div className="flex items-center gap-1 text-lg font-semibold text-purple-700">
                <IndianRupee size={20} />
                {totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {numberOfSessions}{" "}
              {numberOfSessions === 1 ? "session" : "sessions"} × ₹
              {sessionPrice}
              {selectedPlan && (
                <span className="block">
                  + Premium{" "}
                  {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}{" "}
                  Plan (₹{premiumPlans[selectedPlan].price})
                </span>
              )}
            </p>
          </div>

          {/* Premium Plans Button */}
          <button
            type="button"
            onClick={() => setShowPremiumPlans(!showPremiumPlans)}
            className="w-full py-3 px-4 rounded-lg border-2 border-yellow-500 text-yellow-700 font-medium flex items-center justify-center gap-2 hover:bg-yellow-50 transition"
          >
            <Crown className="text-yellow-500" size={20} />
            {showPremiumPlans ? "Hide Premium Plans" : "View Premium Plans"}
          </button>

          {/* Premium Plans Modal */}
          {showPremiumPlans && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
                <button
                  onClick={() => setShowPremiumPlans(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Crown className="text-yellow-500" size={24} />
                  Premium Plans
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Gold Plan */}
                  <div
                    className={`border-2 rounded-xl p-6 transition-all ${
                      selectedPlan === "gold"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Gold Plan
                      </h3>
                      <span className="text-yellow-600 font-bold">₹999</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {premiumPlans.gold.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="text-yellow-500">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handlePlanSelection("gold")}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        selectedPlan === "gold"
                          ? "bg-yellow-500 text-white"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      {selectedPlan === "gold" ? "Selected" : "Choose Gold"}
                    </button>
                  </div>

                  {/* Platinum Plan */}
                  <div
                    className={`border-2 rounded-xl p-6 transition-all ${
                      selectedPlan === "platinum"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Platinum Plan
                      </h3>
                      <span className="text-purple-600 font-bold">₹1999</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {premiumPlans.platinum.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="text-purple-500">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handlePlanSelection("platinum")}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        selectedPlan === "platinum"
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {selectedPlan === "platinum"
                        ? "Selected"
                        : "Choose Platinum"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  value="card"
                  {...register("paymentMethod")}
                  className="peer sr-only"
                />
                <div
                  className="p-4 border rounded-lg cursor-pointer flex items-center gap-2
                  peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition"
                >
                  <CreditCard className="text-gray-600" size={20} />
                  <span className="font-medium text-gray-700">
                    Card Payment
                  </span>
                </div>
              </label>

              <label className="relative">
                <input
                  type="radio"
                  value="bank"
                  {...register("paymentMethod")}
                  className="peer sr-only"
                />
                <div
                  className="p-4 border rounded-lg cursor-pointer flex items-center gap-2
                  peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition"
                >
                  <Building2 className="text-gray-600" size={20} />
                  <span className="font-medium text-gray-700">
                    Bank Transfer
                  </span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition
              ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Book Sessions"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
