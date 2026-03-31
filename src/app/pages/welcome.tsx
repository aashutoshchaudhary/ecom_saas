import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import {
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Rocket,
  Globe,
  Key,
  BookOpen,
  Headphones,
  Palette,
  Package,
} from "lucide-react";
import { motion } from "motion/react";

export function WelcomePage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "pro";
  const business = searchParams.get("business") || "My Business";
  const email = searchParams.get("email") || "user@example.com";
  const subdomain = searchParams.get("subdomain") || "my-business";
  const apiKey = searchParams.get("apiKey") || "wn_live_xxxxxxxxxxxxxxxx";
  const secretKey = searchParams.get("secretKey") || "wn_secret_xxxxxxxxxxxxxxxx";

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const siteUrl = `https://${subdomain}.siteforge.app`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const quickActions = [
    {
      icon: Palette,
      title: "Customize Your Site",
      description: "Edit templates, sections, and styles",
      link: "/dashboard/website",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Package,
      title: "Add Products",
      description: "Set up your product catalog",
      link: "/dashboard/inventory",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Globe,
      title: "Connect Domain",
      description: "Use your own custom domain",
      link: "/dashboard/domains",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Read the Docs",
      description: "API reference and guides",
      link: "#",
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Confetti-style celebration */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: "50vw",
                y: "40vh",
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: "easeOut",
                delay: Math.random() * 0.5,
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: [
                  "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
                  "#EF4444", "#EC4899", "#6366F1", "#14B8A6",
                ][i % 8],
              }}
            />
          ))}
        </div>
      )}

      {/* Top Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">SiteForge AI</span>
          </div>
          <Link to="/dashboard">
            <Button size="sm" variant="outline">
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Your Website is{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Live!
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            {business} is now online and ready for the world. Here's everything you need to get started.
          </p>
        </motion.div>

        {/* Site URL Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5" />
              <span className="font-medium text-sm opacity-80">Your Website URL</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-lg px-4 py-3 font-mono text-lg">
                {siteUrl}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(siteUrl, "url")}
                  className="flex-1 sm:flex-initial"
                >
                  {copiedField === "url" ? (
                    <><Check className="w-4 h-4 mr-1.5" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1.5" /> Copy</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => window.open(siteUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Visit
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Key className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold">Your API Keys</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 ml-11">
              Save these securely. The secret key won't be shown again.
            </p>

            <div className="space-y-4">
              {/* Publishable Key */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Publishable Key
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm break-all">
                    {apiKey}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey, "apiKey")}
                    className="flex-shrink-0"
                  >
                    {copiedField === "apiKey" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm break-all">
                    {showSecret ? secretKey : secretKey.slice(0, 12) + "•".repeat(28)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                    className="flex-shrink-0"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secretKey, "secretKey")}
                    className="flex-shrink-0"
                  >
                    {copiedField === "secretKey" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-400">
                <strong>Important:</strong> Your secret key is shown only once. Copy and store it in a secure location.
                You can regenerate keys from your dashboard settings if needed.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 mb-8"
        >
          <h2 className="text-lg font-bold mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="font-medium text-sm">{email}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Plan</p>
              <p className="font-medium text-sm capitalize">{planId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business</p>
              <p className="font-medium text-sm">{business}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subdomain</p>
              <p className="font-medium text-sm font-mono">{subdomain}.siteforge.app</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-lg font-bold mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg group-hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-0.5 group-hover:text-purple-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Go to Dashboard CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Link to="/dashboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg px-10"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Go to Your Dashboard
            </Button>
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            A confirmation email has been sent to <strong>{email}</strong>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
