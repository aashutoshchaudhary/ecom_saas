// Builder data - plugins, sections, templates, and mock data

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  price: number;
  isPaid: boolean;
  requiredPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  installed: boolean;
  features: string[];
  sections: string[];
  components: string[];
}

export interface BuilderSection {
  id: string;
  type: string;
  name: string;
  category: string;
  thumbnail: string;
  component: string;
  props: Record<string, any>;
  animations?: string[];
  requiredPlugin?: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Animation {
  id: string;
  name: string;
  type: string;
  duration: number;
  delay: number;
  easing: string;
}

export const industryPlugins: Plugin[] = [
  {
    id: 'ecommerce-pro',
    name: 'E-commerce Pro',
    description: 'Complete e-commerce solution with product catalog, cart, checkout, and payment processing',
    category: 'E-commerce',
    icon: '🛍️',
    price: 49,
    isPaid: true,
    requiredPlan: 'pro',
    installed: true,
    features: [
      'Product catalog',
      'Shopping cart',
      'Checkout flow',
      'Payment processing',
      'Inventory management',
      'Order tracking'
    ],
    sections: ['product-grid', 'product-hero', 'cart', 'checkout', 'product-details'],
    components: ['ProductCard', 'AddToCart', 'CheckoutForm', 'OrderSummary']
  },
  {
    id: 'restaurant-suite',
    name: 'Restaurant Suite',
    description: 'Full restaurant website with menu, reservations, online ordering, and delivery integration',
    category: 'Restaurant',
    icon: '🍽️',
    price: 39,
    isPaid: true,
    requiredPlan: 'starter',
    installed: false,
    features: [
      'Digital menu',
      'Table reservations',
      'Online ordering',
      'Delivery integration',
      'Reviews & ratings',
      'Location maps'
    ],
    sections: ['menu-display', 'reservation-form', 'delivery-tracking', 'chef-showcase'],
    components: ['MenuCard', 'ReservationForm', 'OrderTracker', 'ReviewCard']
  },
  {
    id: 'real-estate-pro',
    name: 'Real Estate Pro',
    description: 'Property listings, virtual tours, mortgage calculator, and agent management',
    category: 'Real Estate',
    icon: '🏠',
    price: 59,
    isPaid: true,
    requiredPlan: 'pro',
    installed: false,
    features: [
      'Property listings',
      'Virtual tours',
      'Mortgage calculator',
      'Agent profiles',
      'Search filters',
      'Map integration'
    ],
    sections: ['property-grid', 'property-hero', 'agent-list', 'mortgage-calc'],
    components: ['PropertyCard', 'VirtualTour', 'MortgageCalc', 'AgentCard']
  },
  {
    id: 'fitness-wellness',
    name: 'Fitness & Wellness',
    description: 'Class scheduling, membership management, trainer profiles, and booking system',
    category: 'Fitness',
    icon: '💪',
    price: 45,
    isPaid: true,
    requiredPlan: 'starter',
    installed: true,
    features: [
      'Class schedules',
      'Membership plans',
      'Trainer profiles',
      'Booking system',
      'Workout library',
      'Progress tracking'
    ],
    sections: ['class-schedule', 'trainer-grid', 'membership-plans', 'workout-library'],
    components: ['ClassCard', 'TrainerProfile', 'MembershipPlan', 'BookingForm']
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare & Medical',
    description: 'Appointment booking, doctor profiles, patient portal, and telehealth integration',
    category: 'Healthcare',
    icon: '⚕️',
    price: 69,
    isPaid: true,
    requiredPlan: 'enterprise',
    installed: false,
    features: [
      'Appointment booking',
      'Doctor profiles',
      'Patient portal',
      'Telehealth',
      'Prescription refills',
      'Medical records'
    ],
    sections: ['doctor-grid', 'appointment-form', 'patient-portal', 'services-list'],
    components: ['DoctorCard', 'AppointmentForm', 'PatientDashboard', 'ServiceCard']
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    description: 'Course catalog, student portal, assignments, and video lessons',
    category: 'Education',
    icon: '📚',
    price: 55,
    isPaid: true,
    requiredPlan: 'pro',
    installed: false,
    features: [
      'Course catalog',
      'Student portal',
      'Video lessons',
      'Assignments',
      'Progress tracking',
      'Certificates'
    ],
    sections: ['course-grid', 'lesson-player', 'student-dashboard', 'instructor-list'],
    components: ['CourseCard', 'VideoPlayer', 'AssignmentCard', 'InstructorProfile']
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'SaaS landing pages, pricing tables, user dashboard, and subscription management',
    category: 'SaaS',
    icon: '💼',
    price: 0,
    isPaid: false,
    requiredPlan: 'free',
    installed: true,
    features: [
      'Landing pages',
      'Pricing tables',
      'Feature comparison',
      'User dashboard',
      'Subscription management',
      'Analytics'
    ],
    sections: ['saas-hero', 'pricing-table', 'feature-comparison', 'testimonials'],
    components: ['PricingCard', 'FeatureList', 'TestimonialCard', 'CTAButton']
  },
  {
    id: 'portfolio-creative',
    name: 'Portfolio & Creative',
    description: 'Portfolio showcase, project galleries, client testimonials, and contact forms',
    category: 'Creative',
    icon: '🎨',
    price: 29,
    isPaid: true,
    requiredPlan: 'starter',
    installed: true,
    features: [
      'Portfolio showcase',
      'Project galleries',
      'Case studies',
      'Client logos',
      'Testimonials',
      'Contact forms'
    ],
    sections: ['portfolio-grid', 'project-showcase', 'case-study', 'client-logos'],
    components: ['ProjectCard', 'CaseStudy', 'ClientLogo', 'ContactForm']
  },
  {
    id: 'events-booking',
    name: 'Events & Booking',
    description: 'Event calendar, ticket sales, venue management, and attendee tracking',
    category: 'Events',
    icon: '🎉',
    price: 42,
    isPaid: true,
    requiredPlan: 'starter',
    installed: false,
    features: [
      'Event calendar',
      'Ticket sales',
      'Venue management',
      'Attendee tracking',
      'Seating charts',
      'Check-in system'
    ],
    sections: ['event-calendar', 'ticket-form', 'venue-info', 'attendee-list'],
    components: ['EventCard', 'TicketForm', 'VenueMap', 'AttendeeCard']
  },
  {
    id: 'testimonials-manager',
    name: 'Testimonials Manager',
    description: 'Collect, manage, and display customer testimonials with review requests, approval workflows, and rich display widgets',
    category: 'Social Proof',
    icon: '⭐',
    price: 0,
    isPaid: false,
    requiredPlan: 'free',
    installed: true,
    features: [
      'Testimonial collection forms',
      'Approval workflow',
      'Star ratings & rich media',
      'Widget customization',
      'Email review requests',
      'Import from Google/Yelp',
      'Video testimonials',
      'Social proof widgets'
    ],
    sections: ['testimonials-grid', 'testimonials-carousel', 'review-wall', 'trust-badges'],
    components: ['TestimonialCard', 'ReviewForm', 'TrustBadge', 'RatingWidget', 'VideoTestimonial']
  }
];

export const builderSections: BuilderSection[] = [
  // Hero Sections
  {
    id: 'hero-gradient',
    type: 'hero',
    name: 'Gradient Hero',
    category: 'Hero',
    thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop',
    component: 'HeroGradient',
    props: {
      title: 'Build Your Dream Website',
      subtitle: 'Create stunning websites with AI-powered tools',
      ctaText: 'Get Started',
      backgroundGradient: 'from-purple-600 to-blue-600'
    },
    animations: ['fade-in', 'slide-up']
  },
  {
    id: 'hero-image',
    type: 'hero',
    name: 'Hero with Image',
    category: 'Hero',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    component: 'HeroImage',
    props: {
      title: 'Premium Products',
      subtitle: 'Discover our collection',
      ctaText: 'Shop Now',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop'
    },
    animations: ['fade-in', 'zoom-in']
  },
  {
    id: 'hero-video',
    type: 'hero',
    name: 'Video Hero',
    category: 'Hero',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop',
    component: 'HeroVideo',
    props: {
      title: 'Experience Innovation',
      subtitle: 'Watch our story',
      ctaText: 'Learn More',
      videoUrl: 'https://example.com/video.mp4'
    }
  },
  
  // Feature Sections
  {
    id: 'features-grid',
    type: 'features',
    name: 'Feature Grid',
    category: 'Features',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    component: 'FeaturesGrid',
    props: {
      title: 'Amazing Features',
      features: [
        { icon: '⚡', title: 'Fast Performance', description: 'Lightning fast load times' },
        { icon: '🔒', title: 'Secure', description: 'Bank-level security' },
        { icon: '📱', title: 'Mobile Ready', description: 'Works on all devices' }
      ]
    },
    animations: ['fade-in', 'slide-up']
  },
  {
    id: 'features-cards',
    type: 'features',
    name: 'Feature Cards',
    category: 'Features',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=300&fit=crop',
    component: 'FeaturesCards',
    props: {
      title: 'Why Choose Us',
      subtitle: 'Everything you need to succeed',
      features: []
    },
    animations: ['fade-in', 'scale-in']
  },

  // Product Sections
  {
    id: 'product-grid-3',
    type: 'products',
    name: 'Product Grid (3 columns)',
    category: 'Products',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    component: 'ProductGrid3',
    props: {
      title: 'Featured Products',
      columns: 3,
      products: []
    },
    requiredPlugin: 'ecommerce-pro',
    animations: ['fade-in', 'slide-up']
  },
  {
    id: 'product-grid-4',
    type: 'products',
    name: 'Product Grid (4 columns)',
    category: 'Products',
    thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
    component: 'ProductGrid4',
    props: {
      title: 'All Products',
      columns: 4,
      products: []
    },
    requiredPlugin: 'ecommerce-pro'
  },
  {
    id: 'product-showcase',
    type: 'products',
    name: 'Product Showcase',
    category: 'Products',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    component: 'ProductShowcase',
    props: {
      title: 'Featured Product',
      layout: 'split'
    },
    requiredPlugin: 'ecommerce-pro',
    animations: ['fade-in', 'slide-left']
  },

  // Testimonials
  {
    id: 'testimonials-grid',
    type: 'testimonials',
    name: 'Testimonials Grid',
    category: 'Social Proof',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    component: 'TestimonialsGrid',
    props: {
      title: 'What Our Customers Say',
      testimonials: []
    },
    animations: ['fade-in', 'zoom-in']
  },
  {
    id: 'testimonials-carousel',
    type: 'testimonials',
    name: 'Testimonials Carousel',
    category: 'Social Proof',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    component: 'TestimonialsCarousel',
    props: {
      title: 'Customer Stories',
      autoplay: true
    }
  },

  // Pricing
  {
    id: 'pricing-3-tier',
    type: 'pricing',
    name: 'Pricing (3 tiers)',
    category: 'Pricing',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    component: 'Pricing3Tier',
    props: {
      title: 'Simple Pricing',
      plans: []
    },
    animations: ['fade-in', 'slide-up']
  },
  {
    id: 'pricing-comparison',
    type: 'pricing',
    name: 'Pricing Comparison',
    category: 'Pricing',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
    component: 'PricingComparison',
    props: {
      title: 'Compare Plans',
      showFeatures: true
    }
  },

  // Contact
  {
    id: 'contact-form',
    type: 'contact',
    name: 'Contact Form',
    category: 'Contact',
    thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=300&fit=crop',
    component: 'ContactForm',
    props: {
      title: 'Get In Touch',
      fields: ['name', 'email', 'message']
    }
  },
  {
    id: 'contact-map',
    type: 'contact',
    name: 'Contact with Map',
    category: 'Contact',
    thumbnail: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=400&h=300&fit=crop',
    component: 'ContactMap',
    props: {
      title: 'Visit Us',
      showMap: true,
      location: { lat: 40.7128, lng: -74.0060 }
    }
  },

  // Gallery
  {
    id: 'gallery-masonry',
    type: 'gallery',
    name: 'Masonry Gallery',
    category: 'Gallery',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    component: 'GalleryMasonry',
    props: {
      images: []
    },
    animations: ['fade-in', 'scale-in']
  },
  {
    id: 'gallery-grid',
    type: 'gallery',
    name: 'Grid Gallery',
    category: 'Gallery',
    thumbnail: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=300&fit=crop',
    component: 'GalleryGrid',
    props: {
      columns: 3,
      images: []
    }
  },

  // CTA Sections
  {
    id: 'cta-centered',
    type: 'cta',
    name: 'Centered CTA',
    category: 'CTA',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    component: 'CTACentered',
    props: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of satisfied customers',
      ctaText: 'Sign Up Now'
    },
    animations: ['fade-in', 'bounce-in']
  },
  {
    id: 'cta-split',
    type: 'cta',
    name: 'Split CTA',
    category: 'CTA',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
    component: 'CTASplit',
    props: {
      title: 'Start Your Free Trial',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
    }
  },

  // Team
  {
    id: 'team-grid',
    type: 'team',
    name: 'Team Grid',
    category: 'Team',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    component: 'TeamGrid',
    props: {
      title: 'Meet Our Team',
      members: []
    },
    animations: ['fade-in', 'slide-up']
  },

  // Stats
  {
    id: 'stats-4-col',
    type: 'stats',
    name: 'Stats (4 columns)',
    category: 'Stats',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    component: 'Stats4Col',
    props: {
      stats: [
        { label: 'Users', value: '10K+' },
        { label: 'Projects', value: '50K+' },
        { label: 'Countries', value: '100+' },
        { label: 'Revenue', value: '$5M+' }
      ]
    },
    animations: ['fade-in', 'counter']
  }
];

export const colorSchemes: ColorScheme[] = [
  {
    id: 'purple-blue',
    name: 'Purple & Blue',
    primary: '#7c3aed',
    secondary: '#2563eb',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    id: 'emerald-teal',
    name: 'Emerald & Teal',
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    id: 'rose-pink',
    name: 'Rose & Pink',
    primary: '#f43f5e',
    secondary: '#ec4899',
    accent: '#a855f7',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    id: 'orange-amber',
    name: 'Orange & Amber',
    primary: '#f97316',
    secondary: '#f59e0b',
    accent: '#eab308',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    id: 'indigo-violet',
    name: 'Indigo & Violet',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a855f7',
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#c084fc',
    background: '#0f172a',
    text: '#f1f5f9'
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    background: '#0f172a',
    text: '#f1f5f9'
  }
];

export const animations: Animation[] = [
  { id: 'fade-in', name: 'Fade In', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'fade-out', name: 'Fade Out', type: 'exit', duration: 400, delay: 0, easing: 'ease-in' },
  { id: 'slide-up', name: 'Slide Up', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'slide-down', name: 'Slide Down', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'slide-left', name: 'Slide Left', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'slide-right', name: 'Slide Right', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'zoom-in', name: 'Zoom In', type: 'entrance', duration: 500, delay: 0, easing: 'ease-out' },
  { id: 'zoom-out', name: 'Zoom Out', type: 'exit', duration: 400, delay: 0, easing: 'ease-in' },
  { id: 'scale-in', name: 'Scale In', type: 'entrance', duration: 500, delay: 0, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { id: 'bounce-in', name: 'Bounce In', type: 'entrance', duration: 800, delay: 0, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  { id: 'rotate-in', name: 'Rotate In', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' },
  { id: 'flip-in', name: 'Flip In', type: 'entrance', duration: 600, delay: 0, easing: 'ease-out' }
];

export const paymentProcessors = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments with Stripe',
    icon: '💳',
    features: ['Credit cards', 'ACH', 'Apple Pay', 'Google Pay'],
    setupFee: 0,
    transactionFee: '2.9% + $0.30',
    monthlyFee: 0
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'PayPal payment processing',
    icon: '💰',
    features: ['PayPal', 'Credit cards', 'Venmo', 'Pay in 4'],
    setupFee: 0,
    transactionFee: '2.9% + $0.30',
    monthlyFee: 0
  },
  {
    id: 'clover',
    name: 'Clover',
    description: 'Clover POS integration',
    icon: '🍀',
    features: ['POS', 'Online payments', 'Invoicing', 'Inventory'],
    setupFee: 99,
    transactionFee: '2.3% + $0.10',
    monthlyFee: 14.95
  },
  {
    id: 'nmi',
    name: 'NMI',
    description: 'Network Merchants Inc.',
    icon: '🔐',
    features: ['Gateway', 'Virtual terminal', 'Recurring', 'Fraud tools'],
    setupFee: 199,
    transactionFee: '2.5% + $0.25',
    monthlyFee: 25
  }
];

export const recurringBillingOptions = [
  { id: 'daily', name: 'Daily', description: 'Charge every day' },
  { id: 'weekly', name: 'Weekly', description: 'Charge every week' },
  { id: 'monthly', name: 'Monthly', description: 'Charge every month' },
  { id: 'quarterly', name: 'Quarterly', description: 'Charge every 3 months' },
  { id: 'yearly', name: 'Yearly', description: 'Charge every year' },
  { id: 'custom', name: 'Custom', description: 'Set custom interval' }
];