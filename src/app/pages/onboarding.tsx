import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Store, 
  Coffee, 
  Calendar, 
  GraduationCap,
  Heart,
  Wrench,
  Check,
  Loader2
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { motion, AnimatePresence } from "motion/react";

const industries = [
  { id: "ecommerce", name: "E-commerce", icon: Store, description: "Sell products online" },
  { id: "restaurant", name: "Restaurant", icon: Coffee, description: "Menu & ordering" },
  { id: "booking", name: "Booking", icon: Calendar, description: "Appointments & reservations" },
  { id: "education", name: "Education", icon: GraduationCap, description: "Courses & learning" },
  { id: "nonprofit", name: "Non-Profit", icon: Heart, description: "Donations & campaigns" },
  { id: "services", name: "Services", icon: Wrench, description: "Professional services" },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    description: "",
    location: "",
    goals: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Let's Build Your Website</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about your business and AI will create a perfect website for you
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">What's your business called?</h2>
                  <p className="text-gray-600 dark:text-gray-400">This will be displayed on your website</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Bella's Boutique"
                      value={formData.businessName}
                      onChange={(e) => updateFormData("businessName", e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New York, USA"
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">What type of business is it?</h2>
                  <p className="text-gray-600 dark:text-gray-400">We'll customize features for your industry</p>
                </div>

                <RadioGroup
                  value={formData.industry}
                  onValueChange={(value) => updateFormData("industry", value)}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {industries.map((industry) => {
                      const Icon = industry.icon;
                      const isSelected = formData.industry === industry.id;
                      
                      return (
                        <label
                          key={industry.id}
                          className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                              : "border-gray-200 dark:border-gray-800 hover:border-purple-300"
                          }`}
                        >
                          <RadioGroupItem value={industry.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <span className="font-semibold">{industry.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {industry.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="absolute top-4 right-4 w-5 h-5 text-purple-600" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI will use this to create relevant content
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., We sell premium organic skincare products made from natural ingredients..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The more details you provide, the better your website will be
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && !generating && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">What are your main goals?</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    We'll optimize your website to help you achieve them
                  </p>
                </div>

                <div>
                  <Label htmlFor="goals">Primary Goals</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., Increase online sales, build brand awareness, generate leads..."
                    value={formData.goals}
                    onChange={(e) => updateFormData("goals", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Ready to generate your website
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our AI will create a custom website with:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4">
                    <li>• Professional layout and design</li>
                    <li>• Industry-specific features</li>
                    <li>• AI-generated content</li>
                    <li>• Mobile-optimized pages</li>
                    <li>• SEO-friendly structure</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {generating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Creating Your Website...</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  AI is generating a beautiful website tailored to your business
                </p>
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Analyzing business requirements</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Generating layout and design</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin flex-shrink-0" />
                    <span className="text-sm">Creating content and pages</span>
                  </div>
                  <div className="flex items-center gap-3 text-left opacity-50">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    <span className="text-sm">Optimizing for SEO and mobile</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {!generating && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < totalSteps && (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={
                    (step === 1 && !formData.businessName) ||
                    (step === 2 && !formData.industry) ||
                    (step === 3 && !formData.description)
                  }
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === totalSteps && (
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={!formData.goals}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Website
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Skip option */}
        {!generating && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
