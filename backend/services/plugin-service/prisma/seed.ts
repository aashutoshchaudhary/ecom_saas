import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plugins = [
  {
    name: 'Restaurant Menu Builder',
    slug: 'restaurant-menu-builder',
    description: 'Create beautiful digital menus with categories, modifiers, and dietary labels',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'content',
    icon: 'utensils',
    features: ['menu-categories', 'dietary-labels', 'price-variants', 'qr-code-menu'],
    config: { currency: 'USD', showImages: true },
    industry: 'restaurant',
    plan: 'STARTER',
  },
  {
    name: 'Table Reservation System',
    slug: 'table-reservation',
    description: 'Online table booking with real-time availability and confirmation',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'booking',
    icon: 'calendar-check',
    features: ['real-time-availability', 'email-confirmation', 'party-size', 'special-requests'],
    config: { maxPartySize: 20, advanceBookingDays: 30 },
    industry: 'restaurant',
    plan: 'STARTER',
  },
  {
    name: 'Appointment Scheduler',
    slug: 'appointment-scheduler',
    description: 'Full-featured appointment booking for salons, clinics, and service businesses',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'booking',
    icon: 'clock',
    features: ['staff-calendars', 'service-duration', 'buffer-time', 'recurring-appointments'],
    config: { timezone: 'America/New_York', slotDuration: 30 },
    industry: 'salon',
    plan: 'STARTER',
  },
  {
    name: 'E-Commerce Storefront',
    slug: 'ecommerce-storefront',
    description: 'Complete online store with cart, checkout, and inventory management',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'commerce',
    icon: 'shopping-cart',
    features: ['product-catalog', 'shopping-cart', 'checkout', 'inventory-tracking'],
    config: { currency: 'USD', taxRate: 0 },
    industry: 'retail',
    plan: 'STARTER',
  },
  {
    name: 'Real Estate Listings',
    slug: 'real-estate-listings',
    description: 'Property listing management with search filters and virtual tours',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'listings',
    icon: 'home',
    features: ['property-search', 'map-integration', 'virtual-tours', 'mortgage-calculator'],
    config: { currency: 'USD', measurementUnit: 'sqft' },
    industry: 'realestate',
    plan: 'PRO',
  },
  {
    name: 'Fitness Class Booking',
    slug: 'fitness-class-booking',
    description: 'Class scheduling, membership management, and trainer profiles',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'booking',
    icon: 'dumbbell',
    features: ['class-schedule', 'membership-tiers', 'trainer-profiles', 'waitlist'],
    config: { maxClassSize: 30, cancellationWindow: 24 },
    industry: 'fitness',
    plan: 'STARTER',
  },
  {
    name: 'Blog & Content Manager',
    slug: 'blog-content-manager',
    description: 'Rich blog with categories, tags, SEO optimization, and social sharing',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'content',
    icon: 'pen-tool',
    features: ['rich-editor', 'categories-tags', 'seo-meta', 'social-sharing'],
    config: { postsPerPage: 10, enableComments: true },
    industry: null,
    plan: 'FREE',
  },
  {
    name: 'SEO Toolkit',
    slug: 'seo-toolkit',
    description: 'Advanced SEO tools including sitemap generation, meta tags, and analytics',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'marketing',
    icon: 'search',
    features: ['sitemap-generation', 'meta-tags', 'schema-markup', 'keyword-tracking'],
    config: { autoSitemap: true },
    industry: null,
    plan: 'FREE',
  },
  {
    name: 'WhatsApp Business Chat',
    slug: 'whatsapp-business-chat',
    description: 'Integrate WhatsApp Business for customer support and order notifications',
    version: '1.0.0',
    author: 'SiteForge',
    category: 'communication',
    icon: 'message-circle',
    features: ['live-chat-widget', 'order-notifications', 'auto-replies', 'broadcast-messages'],
    config: { greeting: 'Hello! How can we help you today?' },
    industry: null,
    plan: 'STARTER',
  },
];

async function main() {
  console.log('Seeding plugins...');
  for (const plugin of plugins) {
    await prisma.plugin.upsert({
      where: { slug: plugin.slug },
      update: plugin,
      create: plugin,
    });
  }
  console.log(`Seeded ${plugins.length} plugins`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
