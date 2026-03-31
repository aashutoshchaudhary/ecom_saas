import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Sparkles, Check, Loader2, Globe, Key, Palette, Shield, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProvisioningStep {
  id: string;
  label: string;
  icon: React.ElementType;
  duration: number;
}

const steps: ProvisioningStep[] = [
  { id: "account", label: "Creating your account", icon: Shield, duration: 800 },
  { id: "tenant", label: "Setting up your workspace", icon: Key, duration: 1200 },
  { id: "website", label: "Building your website", icon: Palette, duration: 1500 },
  { id: "domain", label: "Configuring your subdomain", icon: Globe, duration: 1000 },
  { id: "keys", label: "Generating API keys", icon: Key, duration: 800 },
  { id: "email", label: "Sending welcome email", icon: Mail, duration: 600 },
];

export function ProvisioningPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "pro";
  const business = searchParams.get("business") || "My Business";
  const email = searchParams.get("email") || "user@example.com";

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= steps.length) {
        // Generate fake keys and redirect to welcome
        const apiKey = "wn_live_" + generateRandomString(32);
        const secretKey = "wn_secret_" + generateRandomString(40);
        const subdomain = business
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 30);

        setTimeout(() => {
          navigate("/welcome?" + new URLSearchParams({
            plan: planId,
            business,
            email,
            subdomain,
            apiKey,
            secretKey,
          }).toString());
        }, 800);
        return;
      }

      setCurrentStep(stepIndex);

      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, steps[stepIndex].id]);
        stepIndex++;
        runStep();
      }, steps[stepIndex].duration);
    };

    // Small delay before starting
    const timeout = setTimeout(runStep, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Ambient particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const next = [...prev, {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        }];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
          transition={{ duration: 3 }}
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        />
      ))}

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg text-center text-white z-10">
        {/* Logo spinner */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-xl" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ top: -6, left: "50%", marginLeft: -6 }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          Setting Up{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {business}
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mb-10"
        >
          Your website will be live in just a moment...
        </motion.p>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% complete</span>
            <span>{completedSteps.length}/{steps.length} steps</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === index && !isCompleted;
            const isPending = !isCompleted && !isCurrent;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? "bg-purple-900/30 border border-purple-500/30"
                    : isCompleted
                    ? "bg-green-900/10 border border-transparent"
                    : "border border-transparent opacity-40"
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : isCurrent ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCompleted
                      ? "text-green-400"
                      : isCurrent
                      ? "text-white"
                      : "text-gray-600"
                  }`}>
                    {step.label}
                    {isCompleted && " — Done"}
                  </p>
                </div>

                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-xs text-gray-600"
        >
          This usually takes less than 10 seconds
        </motion.div>
      </div>
    </div>
  );
}

function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
