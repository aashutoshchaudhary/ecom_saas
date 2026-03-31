import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Lock,
  CreditCard,
  Shield,
  Check,
  Building,
  Globe,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const planDetails: Record<string, {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  gradient: string;
  highlights: string[];
}> = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    gradient: "from-gray-500 to-gray-600",
    highlights: ["1 Website", "500 Monthly Visitors", "5 Pages", "Basic Templates"],
  },
  starter: {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    gradient: "from-blue-500 to-cyan-500",
    highlights: ["3 Websites", "10K Visitors", "Custom Domain", "Basic E-commerce"],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 39,
    gradient: "from-purple-600 to-blue-600",
    highlights: ["10 Websites", "100K Visitors", "Full E-commerce", "Full AI Features"],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 149,
    yearlyPrice: 119,
    gradient: "from-orange-500 to-red-500",
    highlights: ["Unlimited Everything", "24/7 Support", "White-label", "Custom AI Models"],
  },
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "pro";
  const billingCycle = (searchParams.get("billing") as "monthly" | "yearly") || "monthly";

  const plan = planDetails[planId] || planDetails.pro;
  const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const yearlyTotal = plan.yearlyPrice * 12;
  const monthlySavings = plan.monthlyPrice - plan.yearlyPrice;

  const [step, setStep] = useState<"account" | "payment">(price === 0 ? "account" : "account");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    country: "US",
    zip: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 16);
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + "/" + v.slice(2);
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "account" && price > 0) {
      setStep("payment");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigate("/provisioning?" + new URLSearchParams({
        plan: planId,
        billing: billingCycle,
        business: formData.businessName || formData.firstName + "'s Business",
        email: formData.email,
      }).toString());
    }, 1500);
  };

  const accountValid = formData.firstName && formData.email && formData.password && formData.password.length >= 8;
  const paymentValid = price === 0 || (
    formData.cardNumber.replace(/\s/g, "").length === 16 &&
    formData.cardExpiry.length === 5 &&
    formData.cardCvc.length >= 3 &&
    formData.cardName &&
    formData.zip
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/pricing" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to plans
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">SiteForge AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5" />
            Secure checkout
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Steps Indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 ${step === "account" ? "text-purple-600 font-semibold" : "text-green-600"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "account"
                      ? "bg-purple-600 text-white"
                      : "bg-green-500 text-white"
                  }`}>
                    {step === "account" ? "1" : <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-sm">Account</span>
                </div>

                {price > 0 && (
                  <>
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
                    <div className={`flex items-center gap-2 ${step === "payment" ? "text-purple-600 font-semibold" : "text-gray-400"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step === "payment"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                      }`}>
                        2
                      </div>
                      <span className="text-sm">Payment</span>
                    </div>
                  </>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {step === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Create your account</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {price === 0 ? "Get started with your free account" : "First, let's set up your account"}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => updateField("firstName", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => updateField("lastName", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={(e) => updateField("password", e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 8 characters with a number and special character
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="businessName">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            Business Name (Optional)
                          </span>
                        </Label>
                        <Input
                          id="businessName"
                          placeholder="e.g., Acme Corp"
                          value={formData.businessName}
                          onChange={(e) => updateField("businessName", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* OAuth options */}
                    <div>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 text-gray-500">
                            Or sign up with
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" className="bg-white dark:bg-gray-900">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>
                        <Button type="button" variant="outline" className="bg-white dark:bg-gray-900">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                          GitHub
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      disabled={!accountValid}
                    >
                      {price === 0 ? "Create Free Account" : "Continue to Payment"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By creating an account, you agree to our{" "}
                      <a href="#" className="text-purple-600 hover:underline">Terms</a> and{" "}
                      <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
                    </p>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Payment details</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Complete your subscription setup
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("account")}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Edit account
                      </button>
                    </div>

                    {/* Account summary */}
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg px-4 py-3 flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800 dark:text-green-400">
                        Account: <strong>{formData.email}</strong>
                      </span>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-sm">Card Information</span>
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="cardNumber"
                            placeholder="4242 4242 4242 4242"
                            value={formData.cardNumber}
                            onChange={(e) => updateField("cardNumber", formatCardNumber(e.target.value))}
                            className="pl-9 font-mono"
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Expiry</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={(e) => updateField("cardExpiry", formatExpiry(e.target.value))}
                            className="font-mono"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input
                            id="cardCvc"
                            placeholder="123"
                            value={formData.cardCvc}
                            onChange={(e) => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="font-mono"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) => updateField("cardName", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <select
                            id="country"
                            value={formData.country}
                            onChange={(e) => updateField("country", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IN">India</option>
                            <option value="JP">Japan</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP / Postal Code</Label>
                          <Input
                            id="zip"
                            placeholder="10001"
                            value={formData.zip}
                            onChange={(e) => updateField("zip", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="w-3.5 h-3.5" />
                      Your payment is encrypted and processed securely via Stripe. We never store your card details.
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      disabled={!paymentValid || loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          Start {plan.name} Plan &mdash; ${price}/mo
                          <Lock className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      14-day free trial. Cancel anytime. You won't be charged today.
                    </p>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Plan header */}
                <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">{plan.name} Plan</h3>
                    {planId === "pro" && (
                      <Badge className="bg-white/20 text-white text-xs">Most Popular</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="opacity-80">/month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-sm mt-1 opacity-80">
                      Billed ${yearlyTotal}/year (save ${monthlySavings * 12}/year)
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan includes</p>
                  {plan.highlights.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{plan.name} Plan ({billingCycle})</span>
                    <span>${price}/mo</span>
                  </div>
                  {price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">14-day free trial</span>
                      <span className="text-green-600">-${price}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-bold">
                    <span>Due today</span>
                    <span className="text-lg">$0.00</span>
                  </div>
                  {price > 0 && (
                    <p className="text-xs text-gray-500">
                      First charge of ${price} on {new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              {/* Trust */}
              <div className="mt-4 space-y-2.5 px-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Website live in seconds after signup</span>
                </div>
              </div>

              {/* Change plan */}
              <div className="mt-4 text-center">
                <Link
                  to="/pricing"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Change plan
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
