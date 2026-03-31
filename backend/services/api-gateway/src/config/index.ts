import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    algorithms: ['HS256'] as const,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  },

  rateLimits: {
    public: { windowMs: 60_000, maxRequests: 30 },
    authenticated: { windowMs: 60_000, maxRequests: 100 },
    premium: { windowMs: 60_000, maxRequests: 500 },
  },
};

export interface ServiceRoute {
  path: string;
  target: string;
  authRequired: boolean;
  rateLimitTier: 'public' | 'authenticated' | 'premium';
  allowedRoles?: string[];
}

export const serviceRoutes: ServiceRoute[] = [
  // Auth (public endpoints)
  { path: '/api/v1/auth', target: 'http://auth-service:3001', authRequired: false, rateLimitTier: 'public' },
  // User
  { path: '/api/v1/users', target: 'http://user-service:3002', authRequired: true, rateLimitTier: 'authenticated' },
  // Roles
  { path: '/api/v1/roles', target: 'http://role-service:3003', authRequired: true, rateLimitTier: 'authenticated' },
  { path: '/api/v1/permissions', target: 'http://role-service:3003', authRequired: true, rateLimitTier: 'authenticated' },
  // Tenants
  { path: '/api/v1/tenants', target: 'http://tenant-service:3004', authRequired: true, rateLimitTier: 'authenticated' },
  // Industries
  { path: '/api/v1/industries', target: 'http://industry-service:3005', authRequired: false, rateLimitTier: 'public' },
  // Website
  { path: '/api/v1/websites', target: 'http://website-builder-service:3006', authRequired: true, rateLimitTier: 'authenticated' },
  // Templates
  { path: '/api/v1/templates', target: 'http://template-service:3007', authRequired: true, rateLimitTier: 'authenticated' },
  // Themes
  { path: '/api/v1/themes', target: 'http://theme-service:3008', authRequired: true, rateLimitTier: 'authenticated' },
  // AI
  { path: '/api/v1/ai', target: 'http://ai-service:3009', authRequired: true, rateLimitTier: 'premium' },
  // AI Versions
  { path: '/api/v1/ai-versions', target: 'http://ai-versioning-service:3010', authRequired: true, rateLimitTier: 'authenticated' },
  // Products
  { path: '/api/v1/products', target: 'http://product-service:3011', authRequired: true, rateLimitTier: 'authenticated' },
  // Inventory
  { path: '/api/v1/inventory', target: 'http://inventory-service:3012', authRequired: true, rateLimitTier: 'authenticated' },
  // Pricing
  { path: '/api/v1/pricing', target: 'http://pricing-service:3013', authRequired: true, rateLimitTier: 'authenticated' },
  // Orders
  { path: '/api/v1/orders', target: 'http://order-service:3014', authRequired: true, rateLimitTier: 'authenticated' },
  // Payments
  { path: '/api/v1/payments', target: 'http://payment-service:3015', authRequired: true, rateLimitTier: 'authenticated' },
  // Refunds
  { path: '/api/v1/refunds', target: 'http://refund-service:3016', authRequired: true, rateLimitTier: 'authenticated' },
  // Wallet
  { path: '/api/v1/wallet', target: 'http://wallet-service:3017', authRequired: true, rateLimitTier: 'authenticated' },
  // Plugins
  { path: '/api/v1/plugins', target: 'http://plugin-service:3018', authRequired: true, rateLimitTier: 'authenticated' },
  // Domains
  { path: '/api/v1/domains', target: 'http://domain-service:3019', authRequired: true, rateLimitTier: 'authenticated' },
  // Emails
  { path: '/api/v1/emails', target: 'http://email-service:3020', authRequired: true, rateLimitTier: 'authenticated' },
  // POS
  { path: '/api/v1/pos', target: 'http://pos-service:3021', authRequired: true, rateLimitTier: 'authenticated' },
  // Analytics
  { path: '/api/v1/analytics', target: 'http://analytics-service:3022', authRequired: true, rateLimitTier: 'authenticated' },
  // Reports
  { path: '/api/v1/reports', target: 'http://reporting-service:3023', authRequired: true, rateLimitTier: 'authenticated' },
  // Notifications
  { path: '/api/v1/notifications', target: 'http://notification-service:3024', authRequired: true, rateLimitTier: 'authenticated' },
  // Media
  { path: '/api/v1/media', target: 'http://media-service:3025', authRequired: true, rateLimitTier: 'premium' },
  // Config
  { path: '/api/v1/config', target: 'http://config-service:3026', authRequired: true, rateLimitTier: 'authenticated', allowedRoles: ['OWNER', 'ADMIN'] },
  // Audit
  { path: '/api/v1/audit', target: 'http://audit-service:3027', authRequired: true, rateLimitTier: 'authenticated', allowedRoles: ['OWNER', 'ADMIN'] },
];
