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

// Hero Sections
export function HeroGradient({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText, backgroundGradient } = data;
  
  return (
    <div className={`relative bg-gradient-to-r ${backgroundGradient} text-white p-12 md:p-20`}>
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
        <Button size="lg" variant="secondary">{ctaText}</Button>
      </div>
    </div>
  );
}

export function HeroImage({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText, image } = data;
  
  return (
    <div className="relative h-[600px] overflow-hidden">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none z-10" />}
      <ImageWithFallback 
        src={image} 
        alt="Hero" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full flex items-center justify-center text-white text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
          <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
          <Button size="lg">{ctaText}</Button>
        </div>
      </div>
    </div>
  );
}

export function HeroVideo({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText } = data;
  
  return (
    <div className="relative h-[600px] overflow-hidden bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none z-10" />}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50" />
      <div className="relative h-full flex items-center justify-center text-white text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
          <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
          <Button size="lg">{ctaText}</Button>
        </div>
      </div>
    </div>
  );
}

// Feature Sections
export function FeaturesGrid({ data, isEditing }: SectionProps) {
  const { title, features } = data;
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature: any, idx: number) => (
            <div key={idx} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeaturesCards({ data, isEditing }: SectionProps) {
  const { title, subtitle, features } = data;
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Amazing feature description goes here
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Product Sections
export function ProductGrid3({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  const products = [
    {
      id: 1,
      name: 'Premium Product',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Best Seller',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      rating: 4.9
    },
    {
      id: 3,
      name: 'New Arrival',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      rating: 4.7
    }
  ];
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <ImageWithFallback 
                src={product.image} 
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <Button size="sm">Add to Cart</Button>
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
  const { title } = data;
  
  const products = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 29.99,
    image: `https://images.unsplash.com/photo-${1523275335684 + i}?w=400&h=400&fit=crop`
  }));
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <Button size="sm" variant="outline">View</Button>
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
  const { title } = data;
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4">Featured</Badge>
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Experience the pinnacle of quality and design with our flagship product.
              Crafted with precision and care.
            </p>
            <ul className="space-y-3 mb-8">
              {['Premium materials', 'Lifetime warranty', 'Free shipping'].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">$299.99</span>
              <Button size="lg">Shop Now</Button>
            </div>
          </div>
          <div>
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"
              alt="Product"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Testimonials
export function TestimonialsGrid({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'CEO, TechCorp',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      text: 'This platform has transformed how we do business online. Highly recommended!'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Founder, StartupXYZ',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      text: 'The best investment we made this year. Results exceeded our expectations.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Designer, Creative Co',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      text: 'Beautiful design and powerful features. Everything we needed in one place.'
    }
  ];
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <ImageWithFallback 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
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
  const { title } = data;
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">{title}</h2>
        <Card className="p-12">
          <div className="flex gap-1 justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            "This is hands down the best solution we've ever used. The team is fantastic
            and the results speak for themselves."
          </p>
          <div className="flex items-center justify-center gap-4">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Testimonial"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <div className="font-semibold text-lg">Alex Thompson</div>
              <div className="text-gray-500">VP of Operations, BigCorp</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Pricing
export function Pricing3Tier({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  const plans = [
    {
      name: 'Starter',
      price: 29,
      features: ['10 Projects', '5GB Storage', 'Basic Support', 'Core Features']
    },
    {
      name: 'Pro',
      price: 79,
      popular: true,
      features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Features', 'API Access']
    },
    {
      name: 'Enterprise',
      price: 199,
      features: ['Unlimited Everything', 'Unlimited Storage', '24/7 Support', 'Custom Features', 'Dedicated Manager']
    }
  ];
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-8 ${plan.popular ? 'ring-2 ring-purple-600 scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="mb-4 bg-purple-600">Most Popular</Badge>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
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
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <Card className="p-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Detailed pricing comparison table coming soon
          </p>
        </Card>
      </div>
    </div>
  );
}

// Contact
export function ContactForm({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <Card className="p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                placeholder="Your message"
              />
            </div>
            <Button className="w-full" size="lg">Send Message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ContactMap({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  return (
    <div className="relative">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none z-10" />}
      <div className="grid md:grid-cols-2">
        <div className="p-12 flex items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">{title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              123 Business Street<br />
              San Francisco, CA 94102<br />
              United States
            </p>
            <Button size="lg" className="gap-2">
              Get Directions <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="h-[500px] bg-gray-200 dark:bg-gray-800">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Map Integration
          </div>
        </div>
      </div>
    </div>
  );
}

// Gallery
export function GalleryMasonry({ data, isEditing }: SectionProps) {
  const images = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=700&fit=crop',
    'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=500&h=800&fit=crop',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=500&h=700&fit=crop'
  ];
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg">
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
  const images = Array.from({ length: 6 }, (_, i) => 
    `https://images.unsplash.com/photo-${1618005182384 + i}?w=500&h=500&fit=crop`
  );
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((image, idx) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-lg">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CTA Sections
export function CTACentered({ data, isEditing }: SectionProps) {
  const { title, subtitle, ctaText } = data;
  
  return (
    <div className="relative py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      {isEditing && <div className="absolute inset-0 border-2 border-yellow-400 pointer-events-none" />}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold mb-6">{title}</h2>
        <p className="text-2xl mb-8 opacity-90">{subtitle}</p>
        <Button size="lg" variant="secondary">{ctaText}</Button>
      </div>
    </div>
  );
}

export function CTASplit({ data, isEditing }: SectionProps) {
  const { title, image } = data;
  
  return (
    <div className="relative">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none z-10" />}
      <div className="grid md:grid-cols-2">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-12 md:p-20 flex items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6">{title}</h2>
            <p className="text-xl mb-8 opacity-90">
              No credit card required. Cancel anytime.
            </p>
            <Button size="lg" variant="secondary">Start Free Trial</Button>
          </div>
        </div>
        <div className="h-[500px]">
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

// Team
export function TeamGrid({ data, isEditing }: SectionProps) {
  const { title } = data;
  
  const team = [
    { name: 'John Doe', role: 'CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
    { name: 'Jane Smith', role: 'CTO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
    { name: 'Mike Johnson', role: 'Designer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { name: 'Sarah Wilson', role: 'Developer', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' }
  ];
  
  return (
    <div className="relative py-20 px-4">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <ImageWithFallback 
                src={member.image}
                alt={member.name}
                className="w-full aspect-square rounded-2xl mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats
export function Stats4Col({ data, isEditing }: SectionProps) {
  const { stats } = data;
  
  return (
    <div className="relative py-20 px-4 bg-gray-50 dark:bg-gray-900">
      {isEditing && <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" />}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat: any) => (
            <div key={stat.label} className="text-center">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component registry
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
  Stats4Col
};
