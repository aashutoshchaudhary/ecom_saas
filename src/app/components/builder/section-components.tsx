import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Star, ArrowRight, Check } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export interface SectionProps {
  data: any;
  isEditing?: boolean;
  onEdit?: () => void;
}

// ─── Editing Overlay ─────────────────────────────────────────────────────────

function EditOverlay({ isEditing }: { isEditing?: boolean }) {
  if (!isEditing) return null;
  return <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none z-10 rounded-lg" />;
}

// ─── Hero Sections ───────────────────────────────────────────────────────────

export function HeroGradient({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText, backgroundGradient } = data;

  return (
    <div className={`relative bg-gradient-to-r ${backgroundGradient} text-white`}>
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 lg:py-36 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
          {subtitle}
        </p>
        <Button size="lg" variant="secondary" className="text-sm sm:text-base px-6 sm:px-8">
          {ctaText}
        </Button>
      </div>
    </div>
  );
}

export function HeroImage({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText, image } = data;

  return (
    <div className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden flex items-center">
      <EditOverlay isEditing={isEditing} />
      <ImageWithFallback
        src={image}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full text-center text-white px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8">
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HeroVideo({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText } = data;

  return (
    <div className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden bg-gray-900 flex items-center">
      <EditOverlay isEditing={isEditing} />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50" />
      <div className="relative w-full text-center text-white px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
          <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8">
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Sections ────────────────────────────────────────────────────────

export function FeaturesGrid({ data, isEditing }: SectionProps) {
  const { title, subtitle, features = [] } = data;

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature: any, idx: number) => (
            <div key={idx} className="text-center p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeaturesCards({ data, isEditing }: SectionProps) {
  const { title, subtitle, features = [] } = data;

  const items = features.length > 0
    ? features
    : Array.from({ length: 6 }, (_, i) => ({
        icon: "\u2728",
        title: `Feature ${i + 1}`,
        description: "Amazing feature description goes here",
      }));

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((feature: any, i: number) => (
            <Card key={i} className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon || "\u2728"}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product Sections ────────────────────────────────────────────────────────

export function ProductGrid3({ data, isEditing }: SectionProps) {
  const { title, products: customProducts } = data;

  const products = customProducts || [
    {
      id: 1,
      name: "Premium Product",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Best Seller",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4.9,
    },
    {
      id: 3,
      name: "New Arrival",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
      rating: 4.7,
    },
  ];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {products.map((product: any) => (
            <Card key={product.id || product.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl sm:text-2xl font-bold">${product.price}</span>
                  <Button size="sm" className="text-xs sm:text-sm">Add to Cart</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductGrid4({ data, isEditing }: SectionProps) {
  const { title, products: customProducts } = data;

  const products = customProducts || Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 29.99,
  }));

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product: any) => (
            <Card key={product.id || product.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              {product.image ? (
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              )}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-xl font-bold">
                    ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                  </span>
                  <Button size="sm" variant="outline" className="text-xs">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductShowcase({ data, isEditing }: SectionProps) {
  const { title, description, image, price, features: customFeatures } = data;

  const features = customFeatures || ["Premium materials", "Lifetime warranty", "Free shipping"];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <Badge className="mb-3 sm:mb-4">Featured</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">
              {description || "Experience the pinnacle of quality and design with our flagship product. Crafted with precision and care."}
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl font-bold">{price || "$299.99"}</span>
              <Button size="lg" className="w-full sm:w-auto">Shop Now</Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <ImageWithFallback
              src={image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"}
              alt="Product"
              className="w-full rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

export function TestimonialsGrid({ data, isEditing }: SectionProps) {
  const { title, testimonials: customTestimonials } = data;

  const testimonials = customTestimonials || [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      text: "This platform has transformed how we do business online. Highly recommended!",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Founder, StartupXYZ",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      text: "The best investment we made this year. Results exceeded our expectations.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Designer, Creative Co",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      text: "Beautiful design and powerful features. Everything we needed in one place.",
    },
  ];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial: any) => (
            <Card key={testimonial.id || testimonial.name} className="p-5 sm:p-6">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsCarousel({ data, isEditing }: SectionProps) {
  const { title, testimonial } = data;

  const t = testimonial || {
    name: "Alex Thompson",
    role: "VP of Operations, BigCorp",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    text: "This is hands down the best solution we've ever used. The team is fantastic and the results speak for themselves.",
  };

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 md:mb-12">{title}</h2>
        <Card className="p-6 sm:p-8 md:p-12">
          <div className="flex gap-1 justify-center mb-4 sm:mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
            &ldquo;{t.text}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <ImageWithFallback
              src={t.image}
              alt={t.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
            />
            <div className="text-left">
              <div className="font-semibold text-base sm:text-lg">{t.name}</div>
              <div className="text-xs sm:text-sm text-gray-500">{t.role}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export function Pricing3Tier({ data, isEditing }: SectionProps) {
  const { title, plans: customPlans } = data;

  const plans = customPlans || [
    {
      name: "Starter",
      price: 29,
      features: ["10 Projects", "5GB Storage", "Basic Support", "Core Features"],
    },
    {
      name: "Pro",
      price: 79,
      popular: true,
      features: ["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Features", "API Access"],
    },
    {
      name: "Enterprise",
      price: 199,
      features: ["Unlimited Everything", "Unlimited Storage", "24/7 Support", "Custom Features", "Dedicated Manager"],
    },
  ];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {plans.map((plan: any) => (
            <Card
              key={plan.name}
              className={`p-5 sm:p-6 md:p-8 flex flex-col ${
                plan.popular ? "ring-2 ring-purple-600 sm:scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="mb-3 sm:mb-4 bg-purple-600 w-fit">Most Popular</Badge>
              )}
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold">${plan.price}</span>
                <span className="text-gray-500 text-sm sm:text-base">/month</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingComparison({ data, isEditing }: SectionProps) {
  const { title } = data;

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <Card className="p-6 sm:p-8">
          <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Detailed pricing comparison table coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export function ContactForm({ data, isEditing }: SectionProps) {
  const { title, subtitle } = data;

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">{title}</h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <Card className="p-5 sm:p-6 md:p-8">
          <form className="space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-y"
                placeholder="How can we help?"
              />
            </div>
            <Button className="w-full" size="lg">
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ContactMap({ data, isEditing }: SectionProps) {
  const { title, address } = data;

  return (
    <div className="relative">
      <EditOverlay isEditing={isEditing} />
      <div className="grid md:grid-cols-2">
        <div className="p-8 sm:p-10 md:p-12 flex items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{title}</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 whitespace-pre-line">
              {address || "123 Business Street\nSan Francisco, CA 94102\nUnited States"}
            </p>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Get Directions <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
        <div className="h-[300px] sm:h-[400px] md:h-[500px] bg-gray-200 dark:bg-gray-800">
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
            Map Integration
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function GalleryMasonry({ data, isEditing }: SectionProps) {
  const { title, images: customImages } = data;

  const images = customImages || [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=700&fit=crop",
    "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=500&h=800&fit=crop",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=500&h=700&fit=crop",
  ];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {images.map((image: string, idx: number) => (
            <div key={idx} className="overflow-hidden rounded-lg aspect-square sm:aspect-auto">
              <ImageWithFallback
                src={image}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({ data, isEditing }: SectionProps) {
  const { title, images: customImages } = data;

  const images = customImages || Array.from({ length: 6 }, () => "");

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {images.map((image: string, idx: number) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-lg">
              {image ? (
                <ImageWithFallback
                  src={image}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CTA Sections ────────────────────────────────────────────────────────────

export function CTACentered({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText } = data;

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{title}</h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <Button size="lg" variant="secondary" className="text-sm sm:text-base px-6 sm:px-8">
          {ctaText}
        </Button>
      </div>
    </div>
  );
}

export function CTASplit({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText, image } = data;

  return (
    <div className="relative">
      <EditOverlay isEditing={isEditing} />
      <div className="grid md:grid-cols-2">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 sm:p-10 md:p-12 lg:p-20 flex items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{title}</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
              {subtitle || "No credit card required. Cancel anytime."}
            </p>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              {ctaText || "Start Free Trial"}
            </Button>
          </div>
        </div>
        <div className="h-[250px] sm:h-[350px] md:h-[500px]">
          <ImageWithFallback
            src={image}
            alt="CTA"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Team ────────────────────────────────────────────────────────────────────

export function TeamGrid({ data, isEditing }: SectionProps) {
  const { title, members: customMembers } = data;

  const team = customMembers || [
    { name: "John Doe", role: "CEO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
    { name: "Jane Smith", role: "CTO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { name: "Mike Johnson", role: "Designer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
    { name: "Sarah Wilson", role: "Developer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
  ];

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {team.map((member: any) => (
            <div key={member.name} className="text-center">
              <ImageWithFallback
                src={member.image}
                alt={member.name}
                className="w-full aspect-square rounded-xl sm:rounded-2xl mb-3 sm:mb-4 object-cover"
              />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-0.5 sm:mb-1">
                {member.name}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function Stats4Col({ data, isEditing }: SectionProps) {
  const { title, stats = [] } = data;

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <EditOverlay isEditing={isEditing} />
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat: any) => (
            <div key={stat.label} className="text-center p-3 sm:p-4 md:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Component Registry ──────────────────────────────────────────────────────

export const sectionComponents = {
  HeroGradient,
  HeroImage,
  HeroVideo,
  FeaturesGrid,
  FeaturesCards,
  ProductGrid3,
  ProductGrid4,
  ProductShowcase,
  TestimonialsGrid,
  TestimonialsCarousel,
  Pricing3Tier,
  PricingComparison,
  ContactForm,
  ContactMap,
  GalleryMasonry,
  GalleryGrid,
  CTACentered,
  CTASplit,
  TeamGrid,
  Stats4Col,
};
