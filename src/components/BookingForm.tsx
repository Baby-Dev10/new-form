import { useForm } from "react-hook-form";
import {
  CreditCard,
  Building2,
  AlertCircle,
  IndianRupee,
  Crown,
  X,
  Sparkles,
  Calendar,
  User,
  Clock,
  Star,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        { responseType: "blob" }
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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelection = (plan: "gold" | "platinum") => {
    setSelectedPlan(plan);
    setValue("premiumPlan", plan);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-xl p-8 w-full max-w-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-200 rounded-full opacity-50"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-indigo-200 rounded-full opacity-50"></div>

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-12 hover:rotate-0 transition-all duration-500 group">
              <Calendar className="w-12 h-12 text-white transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star size={14} className="text-white" />
              </div>
            </div>
            {/* Animated rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-200 rounded-full animate-ping opacity-20"></div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-indigo-200 rounded-full animate-ping opacity-20"
              style={{ animationDelay: "200ms" }}
            ></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Book Your Session
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to schedule your personalized session
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field with Animation */}
          <div className="group">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
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
                className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 focus:bg-white backdrop-blur-sm`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.name.message}
              </div>
            )}
          </div>

          {/* Age and Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.age ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 focus:bg-white backdrop-blur-sm`}
                placeholder="25"
              />
              {errors.age && (
                <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.age.message}
                </div>
              )}
            </div>

            {/* Sessions Field */}
            <div>
              <label
                htmlFor="sessions"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Sessions
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="sessions"
                  {...register("sessions", {
                    required: "Number of sessions is required",
                    min: { value: 1, message: "Minimum 1 session required" },
                    max: { value: 10, message: "Maximum 10 sessions allowed" },
                  })}
                  className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                    errors.sessions ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/50 focus:bg-white backdrop-blur-sm`}
                  placeholder="1"
                />
              </div>
              {errors.sessions && (
                <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.sessions.message}
                </div>
              )}
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-sm p-6 rounded-xl border border-purple-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <div className="flex items-center gap-1 text-2xl font-bold text-purple-700">
                  <IndianRupee size={24} />
                  {totalAmount.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  {numberOfSessions}{" "}
                  {numberOfSessions === 1 ? "session" : "sessions"} × ₹
                  {sessionPrice}
                </p>
                {selectedPlan && (
                  <p className="text-sm text-purple-600 flex items-center gap-1">
                    <Sparkles size={16} className="animate-pulse" />
                    Premium{" "}
                    {selectedPlan.charAt(0).toUpperCase() +
                      selectedPlan.slice(1)}{" "}
                    Plan (₹{premiumPlans[selectedPlan].price})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Premium Plans Button */}
          <button
            type="button"
            onClick={() => setShowPremiumPlans(!showPremiumPlans)}
            className="w-full py-4 px-6 rounded-xl border-2 border-yellow-500 text-yellow-700 font-medium flex items-center justify-center gap-2 hover:bg-yellow-50/50 backdrop-blur-sm transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-yellow-100/50 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Crown
              className="text-yellow-500 group-hover:rotate-12 transition-transform duration-300"
              size={24}
            />
            <span className="relative">
              {showPremiumPlans ? "Hide Premium Plans" : "View Premium Plans"}
            </span>
          </button>

          {/* Premium Plans Modal */}
          {showPremiumPlans && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-3xl w-full relative">
                <button
                  onClick={() => setShowPremiumPlans(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Premium Plans
                  </h2>
                  <p className="text-gray-600">
                    Unlock exclusive benefits with our premium plans
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Gold Plan */}
                  <div
                    className={`border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                      selectedPlan === "gold"
                        ? "border-yellow-500 bg-yellow-50/80 backdrop-blur-sm"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Gold Plan
                      </h3>
                      <span className="text-yellow-600 font-bold">₹999</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {premiumPlans.gold.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Sparkles className="text-yellow-500" size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handlePlanSelection("gold")}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
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
                    className={`border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                      selectedPlan === "platinum"
                        ? "border-purple-500 bg-purple-50/80 backdrop-blur-sm"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Platinum Plan
                      </h3>
                      <span className="text-purple-600 font-bold">₹1999</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {premiumPlans.platinum.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Sparkles className="text-purple-500" size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handlePlanSelection("platinum")}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
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

          {/* Payment Method */}
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
                  className="p-4 border rounded-xl cursor-pointer flex items-center gap-2
                  peer-checked:border-purple-500 peer-checked:bg-purple-50/80 hover:bg-gray-50/80 
                  transition-all duration-300 backdrop-blur-sm"
                >
                  <CreditCard
                    className="text-gray-600 peer-checked:text-purple-500"
                    size={20}
                  />
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
                  className="p-4 border rounded-xl cursor-pointer flex items-center gap-2
                  peer-checked:border-purple-500 peer-checked:bg-purple-50/80 hover:bg-gray-50/80 
                  transition-all duration-300 backdrop-blur-sm"
                >
                  <Building2
                    className="text-gray-600 peer-checked:text-purple-500"
                    size={20}
                  />
                  <span className="font-medium text-gray-700">
                    Bank Transfer
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl text-white font-medium flex items-center justify-center gap-2 
              transition-all duration-300 transform hover:scale-105 relative overflow-hidden group ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 active:scale-95"
              }`}
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span className="relative">Book Sessions</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
