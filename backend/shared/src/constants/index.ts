export enum Industry {
  ECOMMERCE = 'ecommerce',
  RESTAURANT = 'restaurant',
  BOOKING = 'booking',
  EVENTS = 'events',
  DONATION = 'donation',
  SERVICES = 'services',
  RETAIL = 'retail',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  CLOVER = 'CLOVER',
  NMI = 'NMI',
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

export enum Permission {
  // Products
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',
  // Orders
  ORDERS_CREATE = 'orders:create',
  ORDERS_READ = 'orders:read',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_CANCEL = 'orders:cancel',
  // Payments
  PAYMENTS_READ = 'payments:read',
  PAYMENTS_PROCESS = 'payments:process',
  PAYMENTS_REFUND = 'payments:refund',
  // Website
  WEBSITE_READ = 'website:read',
  WEBSITE_EDIT = 'website:edit',
  WEBSITE_PUBLISH = 'website:publish',
  // Users
  USERS_READ = 'users:read',
  USERS_MANAGE = 'users:manage',
  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_MANAGE = 'settings:manage',
  // Analytics
  ANALYTICS_READ = 'analytics:read',
  // Plugins
  PLUGINS_MANAGE = 'plugins:manage',
  // Wallet
  WALLET_READ = 'wallet:read',
  WALLET_MANAGE = 'wallet:manage',
}

export const EventTypes = {
  // Auth
  USER_SIGNED_UP: 'user.signed_up',
  USER_LOGGED_IN: 'user.logged_in',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  // User
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  // Tenant
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_INDUSTRY_ADDED: 'tenant.industry_added',
  // AI
  AI_GENERATION_STARTED: 'ai.generation_started',
  AI_GENERATION_COMPLETED: 'ai.generation_completed',
  AI_GENERATION_FAILED: 'ai.generation_failed',
  // Website
  WEBSITE_CREATED: 'website.created',
  WEBSITE_PUBLISHED: 'website.published',
  WEBSITE_UPDATED: 'website.updated',
  PAGE_UPDATED: 'page.updated',
  // Order
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  // Payment
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  // Refund
  REFUND_REQUESTED: 'refund.requested',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_FAILED: 'refund.failed',
  // POS
  POS_ORDER_SYNCED: 'pos.order_synced',
  POS_INVENTORY_SYNCED: 'pos.inventory_synced',
  // Bulk
  BULK_UPLOAD_PROCESSED: 'bulk.upload_processed',
  // Plugin
  PLUGIN_INSTALLED: 'plugin.installed',
  PLUGIN_UNINSTALLED: 'plugin.uninstalled',
  // Notification
  NOTIFICATION_SENT: 'notification.sent',
} as const;

export const KafkaTopics = {
  USER_EVENTS: 'siteforge.user.events',
  TENANT_EVENTS: 'siteforge.tenant.events',
  AI_EVENTS: 'siteforge.ai.events',
  WEBSITE_EVENTS: 'siteforge.website.events',
  ORDER_EVENTS: 'siteforge.order.events',
  PAYMENT_EVENTS: 'siteforge.payment.events',
  REFUND_EVENTS: 'siteforge.refund.events',
  POS_EVENTS: 'siteforge.pos.events',
  BULK_EVENTS: 'siteforge.bulk.events',
  PLUGIN_EVENTS: 'siteforge.plugin.events',
  NOTIFICATION_EVENTS: 'siteforge.notification.events',
  AUDIT_EVENTS: 'siteforge.audit.events',
} as const;

export const RedisKeys = {
  RATE_LIMIT: (key: string, window: string) => `sf:ratelimit:${key}:${window}`,
  SESSION: (sessionId: string) => `sf:session:${sessionId}`,
  TOKEN_BLACKLIST: (jti: string) => `sf:blacklist:${jti}`,
  MFA_PENDING: (userId: string) => `sf:mfa:${userId}`,
  CACHE_PRODUCT: (id: string) => `sf:cache:product:${id}`,
  CACHE_TEMPLATE: (id: string) => `sf:cache:template:${id}`,
  CACHE_PAGE: (id: string) => `sf:cache:page:${id}`,
  CACHE_THEME: (id: string) => `sf:cache:theme:${id}`,
  CACHE_PERMISSIONS: (userId: string, tenantId: string) => `sf:cache:permissions:${userId}:${tenantId}`,
  WALLET_BALANCE: (tenantId: string) => `sf:wallet:${tenantId}`,
  WALLET_LOCK: (tenantId: string) => `sf:wallet:lock:${tenantId}`,
} as const;

export const S3Paths = {
  PRODUCTS: (tenantId: string, productId: string) => `${tenantId}/products/${productId}`,
  WEBSITES: (tenantId: string, websiteId: string) => `${tenantId}/websites/${websiteId}`,
  ASSETS: (tenantId: string) => `${tenantId}/assets`,
  EXPORTS: (tenantId: string) => `${tenantId}/exports`,
  BULK_UPLOADS: (tenantId: string) => `${tenantId}/bulk-uploads`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
