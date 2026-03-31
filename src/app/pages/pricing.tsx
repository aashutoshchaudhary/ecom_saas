import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Sparkles,
  Check,
  X,
  ArrowRight,
  Star,
  Menu,
  X as XIcon,
  Zap,
  Shield,
  Globe,
  Users,
  HardDrive,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying things out",
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    gradient: "from-gray-500 to-gray-600",
    features: [
      { name: "1 Website", included: true },
      { name: "500 Monthly Visitors", included: true },
      { name: "Free Subdomain", included: true },
      { name: "5 Pages", included: true },
      { name: "Basic Templates", included: true },
      { name: "Community Support", included: true },
      { name: "Basic Analytics", included: true },
      { name: "SSL Certificate", included: true },
      { name: "Custom Domain", included: false },
      { name: "E-commerce", included: false },
      { name: "AI Features", included: false },
      { name: "Priority Support", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "Great for small businesses",
    monthlyPrice: 19,
    yearlyPrice: 15,
    badge: null,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      { name: "3 Websites", included: true },
      { name: "10K Monthly Visitors", included: true },
      { name: "Custom Domain", included: true },
      { name: "25 Pages", included: true },
      { name: "All Templates", included: true },
      { name: "Email Support", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "SSL Certificate", included: true },
      { name: "Basic E-commerce (50 products)", included: true },
      { name: "Basic AI Features", included: true },
      { name: "Blog & SEO Tools", included: true },
      { name: "Priority Support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    monthlyPrice: 49,
    yearlyPrice: 39,
    badge: "Most Popular",
    gradient: "from-purple-600 to-blue-600",
    features: [
      { name: "10 Websites", included: true },
      { name: "100K Monthly Visitors", included: true },
      { name: "Custom Domains", included: true },
      { name: "Unlimited Pages", included: true },
      { name: "All Templates + Premium", included: true },
      { name: "Priority Support", included: true },
      { name: "Full Analytics Suite", included: true },
      { name: "SSL Certificate", included: true },
      { name: "Full E-commerce (Unlimited)", included: true },
      { name: "Full AI Features", included: true },
      { name: "Blog, SEO & Marketing", included: true },
      { name: "Team Collaboration (5 users)", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large-scale operations",
    monthlyPrice: 149,
    yearlyPrice: 119,
    badge: null,
    gradient: "from-orange-500 to-red-500",
    features: [
      { name: "Unlimited Websites", included: true },
      { name: "Unlimited Visitors", included: true },
      { name: "Custom Domains", included: true },
      { name: "Unlimited Pages", included: true },
      { name: "All Templates + Custom", included: true },
      { name: "24/7 Dedicated Support", included: true },
      { name: "Custom Analytics", included: true },
      { name: "SSL + DDoS Protection", included: true },
      { name: "Full E-commerce + POS", included: true },
      { name: "Full AI + Custom Models", included: true },
      { name: "White-label Option", included: true },
      { name: "Unlimited Team Members", included: true },
    ],
  },
];

const comparisonCategories = [
  {
    name: "Core",
    icon: Globe,
    features: [
      { name: "Websites", values: ["1", "3", "10", "Unlimited"] },
      { name: "Pages per Site", values: ["5", "25", "Unlimited", "Unlimited"] },
      { name: "Monthly Visitors", values: ["500", "10K", "100K", "Unlimited"] },
      { name: "Storage", values: ["500MB", "5GB", "50GB", "Unlimited"] },
      { name: "Bandwidth", values: ["1GB", "20GB", "200GB", "Unlimited"] },
    ],
  },
  {
    name: "Features",
    icon: Zap,
    features: [
      { name: "Custom Domain", values: [false, true, true, true] },
      { name: "SSL Certificate", values: [true, true, true, true] },
      { name: "E-commerce", values: [false, "50 products", "Unlimited", "Unlimited"] },
      { name: "AI Website Builder", values: [false, "Basic", "Full", "Full + Custom"] },
      { name: "Blog & CMS", values: [false, true, true, true] },
      { name: "SEO Tools", values: ["Basic", "Standard", "Advanced", "Enterprise"] },
      { name: "Marketing Tools", values: [false, false, true, true] },
      { name: "POS Integration", values: [false, false, false, true] },
    ],
  },
  {
    name: "Team & Security",
    icon: Shield,
    features: [
      { name: "Team Members", values: ["1", "2", "5", "Unlimited"] },
      { name: "Role-Based Access", values: [false, false, true, true] },
      { name: "MFA / 2FA", values: [false, true, true, true] },
      { name: "Audit Logs", values: [false, false, true, true] },
      { name: "DDoS Protection", values: [false, false, false, true] },
    ],
  },
  {
    name: "Support",
    icon: Headphones,
    features: [
      { name: "Community Forum", values: [true, true, true, true] },
      { name: "Email Support", values: [false, true, true, true] },
      { name: "Priority Support", values: [false, false, true, true] },
      { name: "Dedicated Account Manager", values: [false, false, false, true] },
      { name: "Custom Onboarding", values: [false, false, false, true] },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the remaining credit will be applied to future invoices.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "All paid plans come with a 14-day free trial. No credit card required to start. You'll only be charged after the trial period ends.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. Your site will continue working until the end of your billing period. No cancellation fees.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 30 days for a full refund.",
  },
  {
    q: "What happens to my site if I downgrade?",
    a: "Your site will remain live. Features not included in your new plan will be gracefully disabled, and your data is always preserved. You can upgrade again anytime to re-enable them.",
  },
];

export function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">SiteForge AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm hover:text-purple-600 transition-colors">Home</Link>
              <a href="#comparison" className="text-sm hover:text-purple-600 transition-colors">Compare</a>
              <a href="#faq" className="text-sm hover:text-purple-600 transition-colors">FAQ</a>
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-800">
              <Link to="/" className="block py-2 text-sm">Home</Link>
              <a href="#comparison" className="block py-2 text-sm">Compare</a>
              <a href="#faq" className="block py-2 text-sm">FAQ</a>
              <Link to="/auth" className="block">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/auth" className="block">
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Simple, transparent pricing
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Start free and scale as you grow. No hidden fees. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full p-1.5">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billing === "monthly"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Yearly
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const isPopular = plan.badge === "Most Popular";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-2xl border-2 transition-all flex flex-col ${
                    isPopular
                      ? "border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02] lg:scale-105"
                      : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-xs font-semibold">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="p-6 lg:p-8 flex-1 flex flex-col">
                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className={`inline-flex w-10 h-10 rounded-lg bg-gradient-to-r ${plan.gradient} items-center justify-center mb-3`}>
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl lg:text-5xl font-bold">
                          ${price}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-500 dark:text-gray-400">/mo</span>
                        )}
                      </div>
                      {billing === "yearly" && price > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          ${price * 12}/year (save ${(plan.monthlyPrice - plan.yearlyPrice) * 12})
                        </p>
                      )}
                      {price === 0 && (
                        <p className="text-sm text-gray-500 mt-1">Free forever</p>
                      )}
                    </div>

                    {/* CTA */}
                    <Link to={`/auth?plan=${plan.id}&billing=${billing}`} className="block mb-6">
                      <Button
                        className={`w-full ${
                          isPopular
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : ""
                        }`}
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                      >
                        {price === 0 ? "Start Free" : "Start 14-Day Trial"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">What's included</p>
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 dark:text-gray-700 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? "" : "text-gray-400 dark:text-gray-600"}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>30-day money-back</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>99.9% uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>50K+ active users</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span>Global CDN included</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Plans in Detail</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See exactly what you get with each plan
            </p>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="mt-4 text-purple-600 dark:text-purple-400 font-medium text-sm hover:underline inline-flex items-center gap-1"
            >
              {showComparison ? "Hide" : "Show"} full comparison
              <ArrowRight className={`w-4 h-4 transition-transform ${showComparison ? "rotate-90" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[768px] px-4 sm:px-0">
                    {/* Header Row */}
                    <div className="grid grid-cols-5 gap-4 mb-2 sticky top-16 bg-gray-50 dark:bg-gray-900/50 py-4 z-10">
                      <div className="font-semibold text-gray-500 uppercase text-xs tracking-wide">Feature</div>
                      {plans.map((plan) => (
                        <div key={plan.id} className="text-center">
                          <div className="font-bold text-lg">{plan.name}</div>
                          <div className="text-sm text-gray-500">
                            ${billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}/mo
                          </div>
                        </div>
                      ))}
                    </div>

                    {comparisonCategories.map((category) => (
                      <div key={category.name} className="mb-6">
                        <div className="flex items-center gap-2 py-3 border-b-2 border-gray-300 dark:border-gray-700 mb-2">
                          <category.icon className="w-4 h-4 text-purple-600" />
                          <h3 className="font-bold text-sm uppercase tracking-wide">{category.name}</h3>
                        </div>
                        {category.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 transition-colors rounded"
                          >
                            <div className="text-sm font-medium">{feature.name}</div>
                            {feature.values.map((value, idx) => (
                              <div key={idx} className="text-center text-sm">
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ArrowRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch Your Website?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
              Join 50,000+ businesses. Start free, upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg px-8 w-full sm:w-auto">
                  Start Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth?plan=pro&billing=monthly">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  Try Pro Free for 14 Days
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm opacity-75">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">SiteForge AI</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The AI-powered platform for building and managing your online business.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/" className="hover:text-purple-600">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-purple-600">Pricing</Link></li>
                <li><a href="#" className="hover:text-purple-600">Templates</a></li>
                <li><a href="#" className="hover:text-purple-600">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600">About</a></li>
                <li><a href="#" className="hover:text-purple-600">Blog</a></li>
                <li><a href="#" className="hover:text-purple-600">Careers</a></li>
                <li><a href="#" className="hover:text-purple-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-600">Terms</a></li>
                <li><a href="#" className="hover:text-purple-600">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; 2026 SiteForge AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
