import { Industry, OrderStatus, PaymentStatus, PaymentProvider } from '../constants';

// ─── Base Types ───────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: Record<string, unknown>;
}

export interface EventPayload<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: string;
  tenantId: string;
  userId?: string;
  data: T;
  metadata?: Record<string, unknown>;
}

// ─── Auth Types ───────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  tenantId?: string;
  roles?: string[];
  jti: string;       // token ID for blacklisting
  iat: number;
  exp: number;
}

// ─── User Types ───────────────────────────────────────────

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  timezone: string;
  language: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  onboardingCompleted: boolean;
  lastActiveAt?: Date;
}

// ─── Tenant Types ─────────────────────────────────────────

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  ownerId: string;
  logo?: string;
  description?: string;
  businessType?: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  settings: TenantSettings;
  subscription: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  language: string;
  taxRate?: number;
  [key: string]: unknown;
}

// ─── Website Types ────────────────────────────────────────

export interface WebsiteStructure {
  version: string;
  globalStyles: Record<string, unknown>;
  navigation: NavigationConfig;
  pages: PageReference[];
  metadata: Record<string, unknown>;
}

export interface NavigationConfig {
  logo?: string;
  links: Array<{ label: string; path: string; children?: Array<{ label: string; path: string }> }>;
  style: Record<string, unknown>;
}

export interface PageReference {
  id: string;
  title: string;
  slug: string;
  path: string;
  isHomepage: boolean;
}

export interface SectionConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles: Record<string, unknown>;
  children?: SectionConfig[];
  animation?: AnimationConfig;
}

export interface AnimationConfig {
  type: string;
  duration: number;
  delay: number;
  easing: string;
  trigger: 'load' | 'scroll' | 'hover' | 'click';
}

// ─── Template Types ───────────────────────────────────────

export interface TemplateConfig {
  structure: WebsiteStructure;
  pages: Array<{
    title: string;
    slug: string;
    sections: SectionConfig[];
  }>;
  theme: ThemeConfig;
  components: Array<{
    type: string;
    name: string;
    defaultProps: Record<string, unknown>;
  }>;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
    headingSizes: Record<string, string>;
  };
  header: Record<string, unknown>;
  footer: Record<string, unknown>;
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
}

// ─── Commerce Types ──────────────────────────────────────

export interface Product extends BaseEntity {
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  category?: string;
  tags: string[];
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  images: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  isDefault: boolean;
}

export interface Order extends BaseEntity {
  tenantId: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  source: 'WEBSITE' | 'POS_CLOVER' | 'POS_SQUARE' | 'ADMIN' | 'API';
  externalId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment extends BaseEntity {
  tenantId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  status: PaymentStatus;
  method?: string;
  cardLast4?: string;
  idempotencyKey: string;
}

// ─── AI Types ─────────────────────────────────────────────

export interface AiGenerationInput {
  businessName: string;
  industry: Industry;
  description: string;
  goals: string[];
  preferences?: {
    colorScheme?: string;
    style?: string;
    sections?: string[];
  };
}

export interface AiGenerationOutput {
  template: TemplateConfig;
  pages: Array<{
    title: string;
    slug: string;
    sections: SectionConfig[];
  }>;
  theme: ThemeConfig;
  seoConfig: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// ─── Wallet Types ─────────────────────────────────────────

export interface WalletBalance {
  tenantId: string;
  balance: number;
  currency: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}

// ─── Express Extensions ──────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      userRoles?: string[];
      userPermissions?: string[];
      correlationId?: string;
    }
  }
}
