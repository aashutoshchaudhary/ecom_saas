# SiteForge AI - Enterprise Microservices Architecture

> **Version:** 2.0.0
> **Last Updated:** 2026-03-31
> **Classification:** Internal - Engineering
> **Platform:** AI-Powered SaaS Website Builder

---

## Table of Contents

1. [Microservices Architecture Diagram](#1-microservices-architecture-diagram)
2. [Service-to-Service Communication Flow](#2-service-to-service-communication-flow)
3. [Database Per Service Design](#3-database-per-service-design)
4. [Redis Usage Architecture](#4-redis-usage-architecture)
5. [S3 Storage Design](#5-s3-storage-design)
6. [API Structure Per Service](#6-api-structure-per-service)
7. [Event-Driven Workflows](#7-event-driven-workflows)
8. [Security Vulnerabilities and Mitigation](#8-security-vulnerabilities-and-mitigation)
9. [PCI and SOC2 Checklist](#9-pci-and-soc2-checklist)
10. [Deployment Architecture (AWS EKS)](#10-deployment-architecture-aws-eks)

---

## 1. Microservices Architecture Diagram

### High-Level System Overview

```
                              +---------------------------+
                              |      CloudFront CDN       |
                              |   (Static Assets + API)   |
                              +------------+--------------+
                                           |
                              +------------+--------------+
                              |     AWS ALB (Ingress)     |
                              |   TLS Termination / WAF   |
                              +------------+--------------+
                                           |
                              +------------+--------------+
                              |   Istio Ingress Gateway   |
                              +------------+--------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
          +---------+---------+                       +-----------+---------+
          |   API Gateway     |                       |   WebSocket Gateway |
          |  (Kong / Custom)  |                       |  (Socket.io cluster)|
          |  Rate Limiting    |                       |  Real-time events   |
          |  Auth Validation  |                       +---------------------+
          |  Request Routing  |
          +--------+----------+
                   |
    +--------------+---------------+------------------+------------------+
    |              |               |                  |                  |
    v              v               v                  v                  v
+--------+   +----------+   +-----------+   +-------------+   +------------+
| DOMAIN | | DOMAIN   |   | DOMAIN    |   | DOMAIN      |   | DOMAIN     |
| IAM    | | WEBSITE  |   | COMMERCE  |   | AI ENGINE   |   | PLATFORM   |
+--------+   +----------+   +-----------+   +-------------+   +------------+
```

### All 28 Services Organized by Domain

```
+==============================================================================+
|                        SITEFORGE AI - SERVICE MAP                            |
+==============================================================================+

DOMAIN: IAM (Identity & Access Management)
+--------------------+--------------------+--------------------+----------------+
| 1. Auth Service    | 2. User Service    | 3. Role Service    | 4. Tenant Svc  |
|    Port: 3001      |    Port: 3002      |    Port: 3003      |    Port: 3004  |
|    DB: auth_db     |    DB: user_db     |    DB: role_db     |    DB: tenant_db|
|    JWT, OAuth2     |    Profile, Prefs  |    RBAC, Perms     |    Multi-tenant|
+--------------------+--------------------+--------------------+----------------+

DOMAIN: WEBSITE BUILDER
+--------------------+--------------------+--------------------+----------------+
| 5. Website Svc     | 6. Template Svc    | 7. Theme Service   | 8. Industry Svc|
|    Port: 3005      |    Port: 3006      |    Port: 3007      |    Port: 3008  |
|    DB: website_db  |    DB: template_db |    DB: theme_db    |    DB:industry_db|
|    Pages, SEO      |    JSONB layouts   |    Colors, Fonts   |    Verticals   |
+--------------------+--------------------+--------------------+----------------+

DOMAIN: AI ENGINE
+--------------------+--------------------+
| 9. AI Service      | 10. AI Version Svc |
|    Port: 3009      |     Port: 3010     |
|    DB: ai_db       |     DB:ai_version_db|
|    Generation,     |     Model versions,|
|    Content, Images |     A/B, Rollback  |
+--------------------+--------------------+

DOMAIN: COMMERCE
+--------------------+--------------------+--------------------+----------------+
| 11. Product Svc    | 12. Inventory Svc  | 13. Pricing Svc    | 14. Order Svc  |
|     Port: 3011     |     Port: 3012     |     Port: 3013     |     Port: 3014 |
|     DB: product_db |     DB:inventory_db|     DB: pricing_db |     DB:order_db|
|     Catalog, Vars  |     Stock, Reserve |     Rules, Tiers   |     Cart,Order |
+--------------------+--------------------+--------------------+----------------+
| 15. Payment Svc    | 16. Refund Svc     | 17. Wallet Svc     | 18. POS Svc    |
|     Port: 3015     |     Port: 3016     |     Port: 3017     |     Port: 3018 |
|     DB: payment_db |     DB: refund_db  |     DB: wallet_db  |     DB: pos_db |
|     Stripe, PSP    |     Returns, Cred  |     Balance, Txn   |     In-store   |
+--------------------+--------------------+--------------------+----------------+

DOMAIN: PLATFORM SERVICES
+--------------------+--------------------+--------------------+----------------+
| 19. Plugin Svc     | 20. Domain Svc     | 21. Email Svc      | 22. Notif Svc  |
|     Port: 3019     |     Port: 3020     |     Port: 3021     |     Port: 3022 |
|     DB: plugin_db  |     DB: domain_db  |     DB: email_db   |     DB:notif_db|
|     Marketplace    |     DNS, SSL       |     Transactional  |     Push,SMS   |
+--------------------+--------------------+--------------------+----------------+
| 23. Analytics Svc  | 24. Reporting Svc  | 25. Media Svc      | 26. Config Svc |
|     Port: 3023     |     Port: 3024     |     Port: 3025     |     Port: 3026 |
|     DB:analytics_db|     DB:reporting_db|     DB: media_db   |     DB:config_db|
|     Events, Funnels|     Export, Sched  |     Upload, CDN    |     Feature flg|
+--------------------+--------------------+--------------------+----------------+
| 27. Audit Svc      | 28. Search Svc     |
|     Port: 3027     |     Port: 3028     |
|     DB: audit_db   |     Elasticsearch  |
|     Compliance log |     Full-text      |
+--------------------+--------------------+

INFRASTRUCTURE LAYER
+==============================================================================+
|  Kafka Cluster (3 brokers)  |  Redis Cluster (6 nodes)  |  PostgreSQL (RDS) |
|  Schema Registry            |  Sentinel                 |  Read Replicas    |
+-----------------------------+---------------------------+-------------------+
|  S3 (Media Storage)  |  CloudFront CDN  |  ElasticSearch  |  Vault / SSM    |
+-----------------------+------------------+-----------------+-----------------+
```

### Communication Topology

```
                         SYNCHRONOUS (REST over mTLS)
                         ============================

  Auth ──REST──> User ──REST──> Role ──REST──> Tenant
    |                                            |
    +──────────── JWT validation ────────────────+

  Website ──REST──> Template ──REST──> Theme
     |                  |
     +──REST──> AI ─────+
     |
     +──REST──> Industry

  Order ──REST──> Payment ──REST──> Wallet
    |                |
    +──REST──> Pricing
    |
    +──REST──> Product ──REST──> Inventory

  POS ──REST──> Order
  POS ──REST──> Inventory
  POS ──REST──> Payment

  Plugin ──REST──> Config
  Domain ──REST──> Config
  Media  ──REST──> Config


                       ASYNCHRONOUS (Kafka Events)
                       ===========================

  Auth ──event──> [user.signed_up] ──> Template, AI, Notification, Analytics
  Order ──event──> [order.created] ──> Payment, Inventory, Analytics
  Payment ──event──> [payment.succeeded] ──> Order, Notification, Wallet, Analytics
  AI ──event──> [ai.generation_completed] ──> Template, Notification
  POS ──event──> [pos.order_synced] ──> Order, Inventory
  Media ──event──> [media.uploaded] ──> Website, Product, Analytics
  Audit ──consumes all domain events for compliance logging──
```

---

## 2. Service-to-Service Communication Flow

### Communication Patterns

| Pattern | Technology | Use Case |
|---------|-----------|----------|
| Synchronous Request/Response | REST over HTTP/2 + mTLS | Service queries, data fetching |
| Asynchronous Event Streaming | Apache Kafka | Domain events, eventual consistency |
| Real-time Push | Redis Pub/Sub + WebSocket | Live notifications, dashboard updates |
| Background Jobs | Bull (Redis-backed queues) | AI generation, bulk imports, emails |
| Service Discovery | Kubernetes internal DNS | `{service}.{namespace}.svc.cluster.local` |
| Circuit Breaker | Istio + custom middleware | Fault tolerance between services |

### Internal DNS Resolution (Kubernetes)

```
# Service-to-service calls use K8s internal DNS
# Pattern: http://{service-name}.{namespace}.svc.cluster.local:{port}

http://auth-service.siteforge.svc.cluster.local:3001
http://user-service.siteforge.svc.cluster.local:3002
http://template-service.siteforge.svc.cluster.local:3006
http://payment-service.siteforge-pci.svc.cluster.local:3015   # PCI-isolated namespace
```

### Key Communication Flows

#### Flow 1: User Signup to Template Generation

```
Client                Auth         User        Tenant       Template       AI          Notification
  |                     |            |            |            |            |              |
  |── POST /signup ────>|            |            |            |            |              |
  |                     |──create──> |            |            |            |              |
  |                     |            |──assign───>|            |            |              |
  |                     |<──user_id──|            |            |            |              |
  |                     |                         |            |            |              |
  |                     |──KAFKA: user.signed_up──+───────────>|            |              |
  |                     |                                      |──generate─>|              |
  |                     |                                      |            |              |
  |                     |                                      |<──content──|              |
  |                     |                                      |            |              |
  |                     |                                      |──KAFKA: ai.generation_completed──>|
  |                     |                                      |                           |
  |<── 201 Created ─────|                                      |            |──KAFKA:notify|
  |                     |                                      |            |              |
```

#### Flow 2: Order Creation to Payment to Inventory

```
Client          Order        Payment       Inventory      Wallet       Notification
  |               |             |              |            |              |
  |──POST /order─>|             |              |            |              |
  |               |──KAFKA: order.created──────+───────────>|              |
  |               |             |              |            |              |
  |               |             |<──reserve────|            |              |
  |               |──REST──────>|              |            |              |
  |               |             |──process───> PSP (Stripe) |              |
  |               |             |<──webhook────PSP          |              |
  |               |             |                           |              |
  |               |             |──KAFKA: payment.succeeded─+─────────────>|
  |               |<──confirm───|              |            |              |
  |               |             |              |──deduct───>|              |
  |               |             |              |            |──debit──>DB  |
  |               |             |              |            |              |──send email──>
  |<──200 OK──────|             |              |            |              |
```

#### Flow 3: POS Order Sync

```
POS Terminal       POS Service      Order        Inventory      Payment      Analytics
    |                  |              |              |              |            |
    |──sync order─────>|              |              |              |            |
    |                  |──KAFKA: pos.order_synced──>|              |            |
    |                  |              |──create──>DB |              |            |
    |                  |              |              |              |            |
    |                  |──KAFKA: pos.payment_synced─+─────────────>|            |
    |                  |              |              |──update──>DB |            |
    |                  |              |              |              |──record──>DB
    |                  |              |              |              |            |
    |                  |──KAFKA: pos.order_synced──────────────────+───────────>|
    |<──ack────────────|              |              |              |            |
```

#### Flow 4: AI Content Generation Pipeline

```
Client       Website Svc     AI Service      AI Version     Template     Media Svc     S3
  |              |               |               |             |            |           |
  |──generate──> |               |               |             |            |           |
  |              |──REST────────>|               |             |            |           |
  |              |               |──get model──> |             |            |           |
  |              |               |<──config──────|             |            |           |
  |              |               |                             |            |           |
  |              |               |──Bull Queue: ai.generate──> |            |           |
  |              |               |  (GPU worker picks up)      |            |           |
  |              |               |                             |            |           |
  |              |               |──generate images───────────>|──upload──> |──PUT────> |
  |              |               |                             |<──CDN URL──|<──ack─────|
  |              |               |                             |            |           |
  |              |               |──KAFKA: ai.generation_completed────────> |           |
  |              |<──update──────|               |             |            |           |
  |<──WS push────|               |               |             |            |           |
```

#### Flow 5: Bulk Product Upload

```
Client       Media Svc       S3          Bull Queue       Product Svc      Inventory    Search
  |             |             |              |                |               |            |
  |──upload CSV>|             |              |                |               |            |
  |             |──PUT───────>|              |                |               |            |
  |             |<──ack───────|              |                |               |            |
  |             |──enqueue──────────────────>|                |               |            |
  |<──202 Accepted                          |                |               |            |
  |             |                           |──process rows─>|               |            |
  |             |                           |                |──batch create─>DB          |
  |             |                           |                |               |            |
  |             |                           |                |──KAFKA: product.batch_created──>
  |             |                           |                |               |──update──>DB
  |             |                           |                |               |            |──index
  |             |                           |──KAFKA: bulk.upload_processed──+            |
  |<──WS: upload complete                   |                |               |            |
```

### Retry and Dead Letter Queue Strategy

```
+-----------------------+     +------------------+     +------------------+
| Kafka Topic           |────>| Consumer Group   |────>| Processing Logic |
| (e.g. order.created)  |     | (3 partitions)   |     |                  |
+-----------------------+     +------------------+     +-------+----------+
                                                               |
                                                        [On Failure]
                                                               |
                                                    +----------v----------+
                                                    | Retry Topic          |
                                                    | (order.created.retry)|
                                                    | Max 3 retries        |
                                                    | Exponential backoff  |
                                                    +----------+----------+
                                                               |
                                                        [Still Failing]
                                                               |
                                                    +----------v----------+
                                                    | DLQ Topic            |
                                                    | (order.created.dlq)  |
                                                    | Manual intervention  |
                                                    | Alert via PagerDuty  |
                                                    +----------------------+
```

---

## 3. Database Per Service Design

### Overview

Each microservice owns its database exclusively. No service may directly query another service's database. Cross-service data access happens only via REST APIs or Kafka events.

```
+------------------+     +------------------+     +------------------+
| Auth Service     |     | User Service     |     | Role Service     |
|   auth_db (RDS)  |     |   user_db (RDS)  |     |   role_db (RDS)  |
+------------------+     +------------------+     +------------------+

All databases:
  - AWS RDS PostgreSQL 15
  - Multi-AZ deployment
  - Automated backups (35-day retention)
  - Read replicas for heavy-read services (analytics, reporting, product)
  - Connection pooling via PgBouncer sidecar
  - Row-Level Security (RLS) for tenant isolation
```

### Database Schemas

#### 1. auth_db (Auth Service)

```sql
-- Credentials and authentication state
CREATE TABLE auth_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE,
    tenant_id       UUID NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,       -- bcrypt, 12 rounds
    mfa_enabled     BOOLEAN DEFAULT FALSE,
    mfa_secret      VARCHAR(255),                -- TOTP secret, encrypted at rest
    status          VARCHAR(20) DEFAULT 'active', -- active, locked, suspended
    failed_attempts INT DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    tenant_id       UUID NOT NULL,
    refresh_token   VARCHAR(512) NOT NULL UNIQUE,
    device_info     JSONB,                        -- user agent, IP, device fingerprint
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE oauth_connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    provider        VARCHAR(50) NOT NULL,          -- google, github, microsoft
    provider_id     VARCHAR(255) NOT NULL,
    access_token    TEXT,                           -- encrypted
    refresh_token   TEXT,                           -- encrypted
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_auth_cred_email ON auth_credentials(email);
CREATE INDEX idx_auth_cred_tenant ON auth_credentials(tenant_id);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id) WHERE revoked_at IS NULL;
```

#### 2. user_db (User Service)

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    email           VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    display_name    VARCHAR(200),
    avatar_url      VARCHAR(500),
    phone           VARCHAR(20),
    timezone        VARCHAR(50) DEFAULT 'UTC',
    locale          VARCHAR(10) DEFAULT 'en-US',
    metadata        JSONB DEFAULT '{}',
    status          VARCHAR(20) DEFAULT 'active',
    email_verified  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    tenant_id       UUID NOT NULL,
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    dashboard_layout      JSONB DEFAULT '{}',
    theme_preference      VARCHAR(20) DEFAULT 'system',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    tenant_id       UUID NOT NULL,
    type            VARCHAR(20) DEFAULT 'billing', -- billing, shipping
    line1           VARCHAR(255),
    line2           VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    postal_code     VARCHAR(20),
    country         VARCHAR(2),                     -- ISO 3166-1 alpha-2
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

CREATE UNIQUE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
```

#### 3. role_db (Role Service)

```sql
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN DEFAULT FALSE,         -- system roles cannot be deleted
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource        VARCHAR(100) NOT NULL,          -- e.g., 'website', 'product', 'order'
    action          VARCHAR(50) NOT NULL,            -- create, read, update, delete, manage
    description     TEXT,
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    conditions      JSONB DEFAULT '{}',              -- conditional permissions (e.g., own resources only)
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL,
    assigned_by     UUID,
    assigned_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Default system roles seeded on tenant creation:
-- super_admin, admin, editor, viewer, customer
```

#### 4. tenant_db (Tenant Service)

```sql
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    domain          VARCHAR(255),                    -- custom domain if configured
    plan            VARCHAR(50) DEFAULT 'free',      -- free, starter, pro, enterprise
    status          VARCHAR(20) DEFAULT 'active',    -- active, suspended, cancelled
    owner_user_id   UUID NOT NULL,
    settings        JSONB DEFAULT '{}',
    billing_email   VARCHAR(255),
    trial_ends_at   TIMESTAMPTZ,
    subscription_id VARCHAR(255),                    -- Stripe subscription ID
    max_users       INT DEFAULT 5,
    max_websites    INT DEFAULT 1,
    max_products    INT DEFAULT 100,
    storage_limit_gb INT DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    plan            VARCHAR(50) NOT NULL,
    stripe_sub_id   VARCHAR(255),
    status          VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    cancel_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    metric          VARCHAR(50) NOT NULL,             -- api_calls, storage_bytes, ai_generations
    value           BIGINT DEFAULT 0,
    period          DATE NOT NULL,                    -- monthly period
    UNIQUE(tenant_id, metric, period)
);
```

#### 5. industry_db (Industry Service)

```sql
CREATE TABLE industries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon            VARCHAR(100),
    parent_id       UUID REFERENCES industries(id),  -- hierarchical categories
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE industry_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id     UUID NOT NULL REFERENCES industries(id),
    template_id     UUID NOT NULL,                    -- references template_db
    is_default      BOOLEAN DEFAULT FALSE,
    sort_order      INT DEFAULT 0
);

CREATE TABLE industry_content_prompts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id     UUID NOT NULL REFERENCES industries(id),
    section_type    VARCHAR(50) NOT NULL,              -- hero, about, services, testimonials
    prompt_template TEXT NOT NULL,                      -- AI prompt template for this industry
    sample_content  JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. website_db (Website Service)

```sql
CREATE TABLE websites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    domain          VARCHAR(255),
    template_id     UUID,
    theme_id        UUID,
    industry_id     UUID,
    status          VARCHAR(20) DEFAULT 'draft',       -- draft, published, archived
    seo_settings    JSONB DEFAULT '{}',
    analytics_id    VARCHAR(100),                       -- GA tracking ID
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id      UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    content         JSONB NOT NULL DEFAULT '{}',        -- page builder blocks
    seo_title       VARCHAR(255),
    seo_description TEXT,
    og_image        VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'draft',
    sort_order      INT DEFAULT 0,
    is_homepage     BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(website_id, slug)
);

CREATE TABLE page_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id         UUID NOT NULL REFERENCES pages(id),
    tenant_id       UUID NOT NULL,
    version         INT NOT NULL,
    content         JSONB NOT NULL,
    created_by      UUID NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, version)
);

CREATE TABLE navigation_menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id      UUID NOT NULL REFERENCES websites(id),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    items           JSONB NOT NULL DEFAULT '[]',
    location        VARCHAR(50) DEFAULT 'header',       -- header, footer, sidebar
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. template_db (Template Service)

```sql
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    preview_url     VARCHAR(500),
    category        VARCHAR(50),
    industry_id     UUID,
    is_premium      BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',
    usage_count     INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB structure for flexible template definitions
CREATE TABLE template_layouts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    page_type       VARCHAR(50) NOT NULL,               -- home, about, product, contact, blog
    layout          JSONB NOT NULL,                      -- full page builder structure
    -- Example JSONB:
    -- {
    --   "sections": [
    --     {
    --       "type": "hero",
    --       "config": { "style": "fullwidth", "overlay": true },
    --       "blocks": [
    --         { "type": "heading", "content": "{{business_name}}" },
    --         { "type": "text", "content": "{{tagline}}" },
    --         { "type": "cta_button", "text": "Get Started", "link": "/contact" }
    --       ]
    --     }
    --   ]
    -- }
    responsive      JSONB DEFAULT '{}',                  -- breakpoint overrides
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_variables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID NOT NULL REFERENCES templates(id),
    key             VARCHAR(100) NOT NULL,               -- e.g., business_name, tagline
    type            VARCHAR(20) NOT NULL,                 -- text, image, color, array
    default_value   TEXT,
    required        BOOLEAN DEFAULT FALSE,
    UNIQUE(template_id, key)
);
```

#### 8. theme_db (Theme Service)

```sql
CREATE TABLE themes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    colors          JSONB NOT NULL DEFAULT '{}',
    -- {
    --   "primary": "#2563eb", "secondary": "#7c3aed",
    --   "background": "#ffffff", "surface": "#f8fafc",
    --   "text": "#0f172a", "text_secondary": "#64748b",
    --   "success": "#16a34a", "warning": "#eab308", "error": "#dc2626"
    -- }
    typography      JSONB NOT NULL DEFAULT '{}',
    -- {
    --   "heading_font": "Inter", "body_font": "Inter",
    --   "base_size": "16px", "scale_ratio": 1.25,
    --   "heading_weight": 700, "body_weight": 400
    -- }
    spacing         JSONB DEFAULT '{}',
    border_radius   JSONB DEFAULT '{}',
    shadows         JSONB DEFAULT '{}',
    is_dark         BOOLEAN DEFAULT FALSE,
    is_premium      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_theme_overrides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    website_id      UUID NOT NULL,
    base_theme_id   UUID NOT NULL REFERENCES themes(id),
    color_overrides JSONB DEFAULT '{}',
    typography_overrides JSONB DEFAULT '{}',
    custom_css      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, website_id)
);
```

#### 9. ai_db (AI Service)

```sql
CREATE TABLE ai_generations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    type            VARCHAR(50) NOT NULL,               -- website, content, image, seo, product_desc
    status          VARCHAR(20) DEFAULT 'pending',      -- pending, processing, completed, failed
    input_params    JSONB NOT NULL,
    -- {
    --   "business_name": "...", "industry": "...",
    --   "tone": "professional", "target_audience": "...",
    --   "content_sections": ["hero", "about", "services"]
    -- }
    output          JSONB,
    model_version   VARCHAR(50),
    tokens_used     INT,
    processing_time_ms INT,
    error           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE TABLE ai_prompts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    system_prompt   TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    model           VARCHAR(50) DEFAULT 'gpt-4',
    temperature     DECIMAL(3,2) DEFAULT 0.7,
    max_tokens      INT DEFAULT 4096,
    is_active       BOOLEAN DEFAULT TRUE,
    version         INT DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id   UUID NOT NULL REFERENCES ai_generations(id),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    rating          INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_gen_tenant ON ai_generations(tenant_id);
CREATE INDEX idx_ai_gen_status ON ai_generations(status) WHERE status = 'pending';
```

#### 10. ai_version_db (AI Version Service)

```sql
CREATE TABLE ai_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    provider        VARCHAR(50) NOT NULL,              -- openai, anthropic, stability
    model_id        VARCHAR(100) NOT NULL,
    type            VARCHAR(50) NOT NULL,              -- text, image, embedding
    config          JSONB NOT NULL DEFAULT '{}',
    -- {
    --   "max_tokens": 8192, "supports_vision": true,
    --   "cost_per_1k_input": 0.03, "cost_per_1k_output": 0.06
    -- }
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_model_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id        UUID NOT NULL REFERENCES ai_models(id),
    version         VARCHAR(50) NOT NULL,
    changelog       TEXT,
    config_overrides JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    -- {
    --   "avg_latency_ms": 1200, "avg_tokens": 850,
    --   "success_rate": 0.987, "avg_rating": 4.2
    -- }
    status          VARCHAR(20) DEFAULT 'staging',     -- staging, canary, active, deprecated
    traffic_weight  DECIMAL(5,2) DEFAULT 0,            -- for canary/A-B testing
    promoted_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_ab_tests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    model_version_a UUID NOT NULL REFERENCES ai_model_versions(id),
    model_version_b UUID NOT NULL REFERENCES ai_model_versions(id),
    traffic_split   DECIMAL(3,2) DEFAULT 0.50,
    status          VARCHAR(20) DEFAULT 'running',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    results         JSONB DEFAULT '{}'
);
```

#### 11. product_db (Product Service)

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT,
    short_description VARCHAR(500),
    sku             VARCHAR(100),
    type            VARCHAR(20) DEFAULT 'physical',     -- physical, digital, service
    status          VARCHAR(20) DEFAULT 'draft',        -- draft, active, archived
    images          JSONB DEFAULT '[]',
    -- [{ "url": "...", "alt": "...", "sort_order": 0 }]
    attributes      JSONB DEFAULT '{}',
    -- { "color": ["Red", "Blue"], "size": ["S", "M", "L"] }
    seo             JSONB DEFAULT '{}',
    category_id     UUID,
    brand           VARCHAR(100),
    weight          DECIMAL(10,2),
    dimensions      JSONB,
    is_featured     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL,
    sku             VARCHAR(100) NOT NULL,
    name            VARCHAR(255),
    attributes      JSONB NOT NULL DEFAULT '{}',        -- { "color": "Red", "size": "M" }
    price           DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost_price      DECIMAL(12,2),
    weight          DECIMAL(10,2),
    image_url       VARCHAR(500),
    barcode         VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE product_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES product_categories(id),
    image_url       VARCHAR(500),
    sort_order      INT DEFAULT 0,
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
```

#### 12. inventory_db (Inventory Service)

```sql
CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    product_id      UUID NOT NULL,
    variant_id      UUID NOT NULL,
    sku             VARCHAR(100) NOT NULL,
    location_id     UUID NOT NULL,
    quantity         INT NOT NULL DEFAULT 0,
    reserved        INT NOT NULL DEFAULT 0,             -- reserved by pending orders
    reorder_point   INT DEFAULT 10,
    reorder_quantity INT DEFAULT 50,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, variant_id, location_id)
);

CREATE TABLE inventory_locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) DEFAULT 'warehouse',    -- warehouse, store, dropship
    address         JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    inventory_id    UUID NOT NULL REFERENCES inventory_items(id),
    type            VARCHAR(20) NOT NULL,               -- adjustment, sale, return, transfer, restock
    quantity         INT NOT NULL,                       -- positive = increase, negative = decrease
    reason          VARCHAR(255),
    reference_type  VARCHAR(50),                         -- order, transfer, manual
    reference_id    UUID,
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update inventory_items.quantity on movement insert
-- Implemented in application layer via Prisma middleware
```

#### 13. pricing_db (Pricing Service)

```sql
CREATE TABLE price_lists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_default      BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    price_list_id   UUID REFERENCES price_lists(id),
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) NOT NULL,               -- percentage, fixed, buy_x_get_y
    value           DECIMAL(12,2) NOT NULL,
    conditions      JSONB DEFAULT '{}',
    -- {
    --   "min_quantity": 10, "customer_group": "wholesale",
    --   "product_ids": [...], "category_ids": [...]
    -- }
    priority        INT DEFAULT 0,
    stackable       BOOLEAN DEFAULT FALSE,
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    usage_limit     INT,
    usage_count     INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discount_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(50) NOT NULL,
    price_rule_id   UUID NOT NULL REFERENCES price_rules(id),
    usage_limit     INT,
    usage_count     INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE tax_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    rate            DECIMAL(5,4) NOT NULL,              -- e.g., 0.0825 for 8.25%
    country         VARCHAR(2) NOT NULL,
    state           VARCHAR(100),
    category        VARCHAR(50) DEFAULT 'general',
    is_inclusive     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. order_db (Order Service)

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    order_number    VARCHAR(50) NOT NULL,
    customer_id     UUID NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    subtotal        DECIMAL(12,2) NOT NULL,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    shipping_address JSONB,
    billing_address JSONB,
    notes           TEXT,
    source          VARCHAR(20) DEFAULT 'web',          -- web, pos, api
    payment_status  VARCHAR(20) DEFAULT 'unpaid',
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled',
    idempotency_key VARCHAR(100) UNIQUE,
    metadata        JSONB DEFAULT '{}',
    placed_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    tenant_id       UUID NOT NULL,
    product_id      UUID NOT NULL,
    variant_id      UUID,
    sku             VARCHAR(100),
    name            VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount      DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    metadata        JSONB DEFAULT '{}'
);

CREATE TABLE order_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    tenant_id       UUID NOT NULL,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    changed_by      UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

#### 15. payment_db (Payment Service)

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    order_id        UUID NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    method          VARCHAR(30) NOT NULL,               -- card, bank_transfer, wallet, cod
    provider        VARCHAR(30) NOT NULL,               -- stripe, razorpay, paypal
    provider_payment_id VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, processing, succeeded, failed, cancelled
    idempotency_key VARCHAR(100) UNIQUE,
    metadata        JSONB DEFAULT '{}',
    failure_reason  TEXT,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    customer_id     UUID NOT NULL,
    provider        VARCHAR(30) NOT NULL,
    provider_method_id VARCHAR(255) NOT NULL,           -- Stripe PaymentMethod ID
    type            VARCHAR(20) NOT NULL,               -- card, bank_account
    last4           VARCHAR(4),
    brand           VARCHAR(20),                        -- visa, mastercard
    exp_month       INT,
    exp_year        INT,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
    -- NO full card numbers stored - PCI compliance
);

CREATE TABLE webhook_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID,
    provider        VARCHAR(30) NOT NULL,
    event_id        VARCHAR(255) NOT NULL UNIQUE,       -- provider's event ID for deduplication
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    status          VARCHAR(20) DEFAULT 'received',     -- received, processed, failed
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 16. refund_db (Refund Service)

```sql
CREATE TABLE refunds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    order_id        UUID NOT NULL,
    payment_id      UUID NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    reason          VARCHAR(50) NOT NULL,               -- customer_request, defective, wrong_item, other
    reason_detail   TEXT,
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, approved, processing, completed, rejected
    provider_refund_id VARCHAR(255),
    refund_method   VARCHAR(20) DEFAULT 'original',     -- original, wallet, store_credit
    approved_by     UUID,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refund_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id       UUID NOT NULL REFERENCES refunds(id),
    order_item_id   UUID NOT NULL,
    quantity        INT NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    restock         BOOLEAN DEFAULT TRUE
);
```

#### 17. wallet_db (Wallet Service)

```sql
CREATE TABLE wallets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    customer_id     UUID NOT NULL,
    balance         DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) DEFAULT 'USD',
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, customer_id)
);

CREATE TABLE wallet_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL REFERENCES wallets(id),
    tenant_id       UUID NOT NULL,
    type            VARCHAR(20) NOT NULL,               -- credit, debit
    amount          DECIMAL(12,2) NOT NULL,
    balance_after   DECIMAL(12,2) NOT NULL,
    reference_type  VARCHAR(50),                         -- refund, reward, payment, topup
    reference_id    UUID,
    description     VARCHAR(255),
    idempotency_key VARCHAR(100) UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Optimistic locking for concurrent balance updates
-- Application uses: UPDATE wallets SET balance = balance + $1, updated_at = NOW()
--   WHERE id = $2 AND balance + $1 >= 0 RETURNING balance;
```

#### 18. pos_db (POS Service)

```sql
CREATE TABLE pos_devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    location_id     UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    device_type     VARCHAR(50) NOT NULL,               -- terminal, tablet, mobile
    serial_number   VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'active',
    last_seen_at    TIMESTAMPTZ,
    config          JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    device_id       UUID NOT NULL REFERENCES pos_devices(id),
    cashier_id      UUID NOT NULL,
    opening_balance DECIMAL(12,2) NOT NULL,
    closing_balance DECIMAL(12,2),
    status          VARCHAR(20) DEFAULT 'open',         -- open, closed
    opened_at       TIMESTAMPTZ DEFAULT NOW(),
    closed_at       TIMESTAMPTZ
);

CREATE TABLE pos_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    session_id      UUID NOT NULL REFERENCES pos_sessions(id),
    order_id        UUID,                                -- linked online order once synced
    items           JSONB NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    tax             DECIMAL(12,2) DEFAULT 0,
    discount        DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,
    status          VARCHAR(20) DEFAULT 'completed',
    synced          BOOLEAN DEFAULT FALSE,
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 19. plugin_db (Plugin Service)

```sql
CREATE TABLE plugins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    author          VARCHAR(100),
    version         VARCHAR(20) NOT NULL,
    category        VARCHAR(50),                         -- seo, marketing, analytics, shipping
    icon_url        VARCHAR(500),
    manifest        JSONB NOT NULL,                      -- hooks, permissions, settings schema
    is_official     BOOLEAN DEFAULT FALSE,
    is_premium      BOOLEAN DEFAULT FALSE,
    price           DECIMAL(8,2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_plugins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    plugin_id       UUID NOT NULL REFERENCES plugins(id),
    status          VARCHAR(20) DEFAULT 'active',        -- active, inactive, error
    settings        JSONB DEFAULT '{}',
    installed_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, plugin_id)
);
```

#### 20. domain_db (Domain Service)

```sql
CREATE TABLE domains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    website_id      UUID NOT NULL,
    domain_name     VARCHAR(255) NOT NULL UNIQUE,
    type            VARCHAR(20) DEFAULT 'custom',        -- subdomain, custom
    dns_status      VARCHAR(20) DEFAULT 'pending',       -- pending, verified, failed
    ssl_status      VARCHAR(20) DEFAULT 'pending',       -- pending, provisioning, active, expired
    ssl_expires_at  TIMESTAMPTZ,
    dns_records     JSONB DEFAULT '[]',
    -- [{ "type": "CNAME", "name": "www", "value": "proxy.siteforge.io" }]
    is_primary      BOOLEAN DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ssl_certificates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id       UUID NOT NULL REFERENCES domains(id),
    provider        VARCHAR(50) DEFAULT 'letsencrypt',
    certificate     TEXT,                                -- PEM encoded (encrypted at rest)
    private_key     TEXT,                                -- PEM encoded (encrypted at rest)
    issued_at       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    auto_renew      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 21. email_db (Email Service)

```sql
CREATE TABLE email_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID,                                -- NULL = system template
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    html_body       TEXT NOT NULL,
    text_body       TEXT,
    variables       JSONB DEFAULT '[]',                  -- expected template variables
    category        VARCHAR(50) NOT NULL,                -- transactional, marketing, system
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_sends (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    template_id     UUID REFERENCES email_templates(id),
    from_email      VARCHAR(255) NOT NULL,
    to_email        VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    status          VARCHAR(20) DEFAULT 'queued',        -- queued, sent, delivered, bounced, failed
    provider        VARCHAR(30) DEFAULT 'ses',           -- ses, sendgrid, resend
    provider_msg_id VARCHAR(255),
    opened_at       TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_suppressions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    email           VARCHAR(255) NOT NULL,
    reason          VARCHAR(20) NOT NULL,                -- bounce, complaint, unsubscribe
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
```

#### 22. notification_db (Notification Service)

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    type            VARCHAR(50) NOT NULL,                -- order_update, ai_complete, system, marketing
    channel         VARCHAR(20) NOT NULL,                -- in_app, email, push, sms
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    data            JSONB DEFAULT '{}',                  -- deep link, action buttons
    status          VARCHAR(20) DEFAULT 'pending',       -- pending, sent, delivered, read
    read_at         TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    type            VARCHAR(50) NOT NULL,
    email_enabled   BOOLEAN DEFAULT TRUE,
    push_enabled    BOOLEAN DEFAULT TRUE,
    sms_enabled     BOOLEAN DEFAULT FALSE,
    in_app_enabled  BOOLEAN DEFAULT TRUE,
    UNIQUE(tenant_id, user_id, type)
);

CREATE TABLE push_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    endpoint        TEXT NOT NULL,
    p256dh          TEXT NOT NULL,
    auth            TEXT NOT NULL,
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications(user_id)
    WHERE status != 'read';
```

#### 23. analytics_db (Analytics Service)

```sql
-- TimescaleDB extension recommended for time-series data
CREATE TABLE page_views (
    id              UUID DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    website_id      UUID NOT NULL,
    session_id      VARCHAR(100) NOT NULL,
    visitor_id      VARCHAR(100) NOT NULL,
    page_path       VARCHAR(500) NOT NULL,
    referrer        VARCHAR(500),
    user_agent      VARCHAR(500),
    country         VARCHAR(2),
    device_type     VARCHAR(20),
    duration_ms     INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- SELECT create_hypertable('page_views', 'created_at');

CREATE TABLE events (
    id              UUID DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    website_id      UUID NOT NULL,
    session_id      VARCHAR(100) NOT NULL,
    visitor_id      VARCHAR(100) NOT NULL,
    event_name      VARCHAR(100) NOT NULL,              -- add_to_cart, checkout, purchase, signup
    event_data      JSONB DEFAULT '{}',
    page_path       VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- SELECT create_hypertable('events', 'created_at');

CREATE TABLE daily_aggregates (
    tenant_id       UUID NOT NULL,
    website_id      UUID NOT NULL,
    date            DATE NOT NULL,
    total_views     INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    total_sessions  INT DEFAULT 0,
    avg_duration_ms INT DEFAULT 0,
    bounce_rate     DECIMAL(5,4) DEFAULT 0,
    top_pages       JSONB DEFAULT '[]',
    top_referrers   JSONB DEFAULT '[]',
    device_breakdown JSONB DEFAULT '{}',
    PRIMARY KEY (tenant_id, website_id, date)
);
```

#### 24. reporting_db (Reporting Service)

```sql
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,                -- sales, inventory, traffic, customers
    config          JSONB NOT NULL,
    -- {
    --   "date_range": "last_30_days",
    --   "metrics": ["revenue", "orders", "aov"],
    --   "dimensions": ["product_category", "channel"],
    --   "filters": { "status": "completed" }
    -- }
    created_by      UUID NOT NULL,
    is_scheduled    BOOLEAN DEFAULT FALSE,
    schedule        VARCHAR(50),                         -- daily, weekly, monthly
    last_run_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_exports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID NOT NULL REFERENCES reports(id),
    tenant_id       UUID NOT NULL,
    format          VARCHAR(10) NOT NULL,                -- csv, pdf, xlsx
    file_url        VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'pending',
    row_count       INT,
    file_size_bytes BIGINT,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scheduled_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID NOT NULL REFERENCES reports(id),
    tenant_id       UUID NOT NULL,
    cron_expression VARCHAR(50) NOT NULL,
    recipients      JSONB NOT NULL,                      -- [{ "email": "..." }]
    format          VARCHAR(10) DEFAULT 'pdf',
    is_active       BOOLEAN DEFAULT TRUE,
    next_run_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 25. media_db (Media Service)

```sql
CREATE TABLE media_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    filename        VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT NOT NULL,
    storage_key     VARCHAR(500) NOT NULL,               -- S3 key
    cdn_url         VARCHAR(500),
    width           INT,
    height          INT,
    alt_text        VARCHAR(500),
    folder          VARCHAR(255) DEFAULT '/',
    thumbnails      JSONB DEFAULT '{}',
    -- { "sm": "url", "md": "url", "lg": "url" }
    metadata        JSONB DEFAULT '{}',
    uploaded_by     UUID NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    parent_id       UUID REFERENCES media_folders(id),
    path            VARCHAR(500) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, path)
);

CREATE INDEX idx_media_tenant_folder ON media_files(tenant_id, folder);
```

#### 26. config_db (Config Service)

```sql
CREATE TABLE feature_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    is_enabled      BOOLEAN DEFAULT FALSE,
    conditions      JSONB DEFAULT '{}',
    -- {
    --   "tenant_ids": [...],        -- allowlist
    --   "percentage": 10,            -- gradual rollout
    --   "plans": ["pro", "enterprise"]
    -- }
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace       VARCHAR(50) NOT NULL,
    key             VARCHAR(100) NOT NULL,
    value           JSONB NOT NULL,
    description     TEXT,
    is_secret       BOOLEAN DEFAULT FALSE,
    updated_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(namespace, key)
);

CREATE TABLE tenant_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    key             VARCHAR(100) NOT NULL,
    value           JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, key)
);
```

#### 27. audit_db (Audit Service)

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID,
    action          VARCHAR(50) NOT NULL,                -- create, update, delete, login, export
    resource_type   VARCHAR(50) NOT NULL,                -- order, product, user, website, payment
    resource_id     UUID,
    changes         JSONB DEFAULT '{}',
    -- { "field": { "old": "...", "new": "..." } }
    ip_address      INET,
    user_agent      VARCHAR(500),
    request_id      VARCHAR(100),
    service         VARCHAR(50),
    severity        VARCHAR(10) DEFAULT 'info',          -- info, warning, critical
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by month for performance
-- CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
--   FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_audit_tenant_resource ON audit_logs(tenant_id, resource_type, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
```

#### 28. Search Service (Elasticsearch - no PostgreSQL)

```json
// Elasticsearch index mappings

// products index
{
  "mappings": {
    "properties": {
      "tenant_id":    { "type": "keyword" },
      "name":         { "type": "text", "analyzer": "standard" },
      "description":  { "type": "text", "analyzer": "standard" },
      "sku":          { "type": "keyword" },
      "category":     { "type": "keyword" },
      "brand":        { "type": "keyword" },
      "price":        { "type": "float" },
      "status":       { "type": "keyword" },
      "attributes":   { "type": "object", "enabled": true },
      "created_at":   { "type": "date" }
    }
  }
}

// websites index
{
  "mappings": {
    "properties": {
      "tenant_id":    { "type": "keyword" },
      "title":        { "type": "text" },
      "content":      { "type": "text" },
      "page_type":    { "type": "keyword" },
      "status":       { "type": "keyword" },
      "url":          { "type": "keyword" }
    }
  }
}
```

---

## 4. Redis Usage Architecture

### Cluster Topology

```
+---------------------------+
|    Redis Cluster (6 nodes) |
|    3 masters + 3 replicas  |
+---------------------------+
|                           |
|  Master 1 ──> Replica 1  |  Slots 0-5460
|  Master 2 ──> Replica 2  |  Slots 5461-10922
|  Master 3 ──> Replica 3  |  Slots 10923-16383
|                           |
|  Sentinel for failover    |
+---------------------------+
```

### 4.1 API Gateway Rate Limiting (Sliding Window)

```
Purpose: Protect APIs from abuse, enforce per-tenant rate limits

Algorithm: Sliding Window Log

Key Pattern: rate:{tenant_id}:{endpoint}:{window}

Implementation:
+-----------------------------------------------------------------+
|  SLIDING WINDOW RATE LIMITER                                    |
|                                                                 |
|  Key: rate:tenant-123:/api/products:60                          |
|  Type: Sorted Set                                               |
|  Score: Unix timestamp (ms)                                     |
|  Value: Unique request ID                                       |
|                                                                 |
|  On each request:                                               |
|    1. ZREMRANGEBYSCORE key 0 (now - window_ms)  // prune old   |
|    2. ZCARD key                                  // count       |
|    3. If count < limit: ZADD key now request_id  // allow      |
|    4. EXPIRE key window_seconds                  // TTL         |
|                                                                 |
|  Rate Limits (per minute):                                      |
|    Free:       60  requests                                     |
|    Starter:    300 requests                                     |
|    Pro:        1000 requests                                    |
|    Enterprise: 5000 requests                                    |
|                                                                 |
|  Headers Returned:                                              |
|    X-RateLimit-Limit: 300                                       |
|    X-RateLimit-Remaining: 247                                   |
|    X-RateLimit-Reset: 1711843260                                |
+-----------------------------------------------------------------+
```

### 4.2 Session Store and JWT Blacklist

```
Purpose: Store active sessions, maintain JWT blacklist for revocation

KEY PATTERNS:

  session:{session_id}
    Type: Hash
    TTL: 24 hours (access) / 7 days (refresh)
    Fields:
      user_id, tenant_id, roles, device_info, created_at
    Usage: Validate session without DB hit

  jwt:blacklist:{jti}
    Type: String (value: "1")
    TTL: Matches JWT expiry time
    Usage: On logout or token rotation, blacklist the old JWT
    Check: On every authenticated request, check if JTI is blacklisted

  user:sessions:{user_id}
    Type: Set
    Values: session IDs
    Usage: List all active sessions for a user, enable "logout all devices"

  auth:lockout:{email}
    Type: String (counter)
    TTL: 15 minutes
    Usage: Track failed login attempts, lock after 5 failures
```

```typescript
// JWT Blacklist Check Middleware (pseudo-code)
async function validateToken(token: DecodedJWT): Promise<boolean> {
  const isBlacklisted = await redis.exists(`jwt:blacklist:${token.jti}`);
  if (isBlacklisted) throw new UnauthorizedException('Token revoked');

  const session = await redis.hgetall(`session:${token.sid}`);
  if (!session) throw new UnauthorizedException('Session expired');

  return true;
}
```

### 4.3 Cache Layer

```
Purpose: Reduce database load for frequently accessed data

CACHING STRATEGIES:

+--------------------------------------------------------------+
|  Cache-Aside (Lazy Loading)                                  |
|                                                              |
|  1. Check Redis for key                                      |
|  2. If HIT: return cached data                               |
|  3. If MISS: query DB, store in Redis, return                |
|  4. On UPDATE: invalidate cache key                          |
|                                                              |
|  Used for: Products, Templates, Themes, Config               |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Write-Through                                               |
|                                                              |
|  1. Write to DB                                              |
|  2. Write to Redis                                           |
|  3. Return                                                   |
|                                                              |
|  Used for: Feature Flags, Tenant Config, Pricing Rules       |
+--------------------------------------------------------------+

KEY PATTERNS AND TTLs:

  product:{tenant_id}:{product_id}       TTL: 15 min    Type: JSON string
  product:list:{tenant_id}:{hash}        TTL: 5 min     Type: JSON string (paginated)
  template:{template_id}                 TTL: 1 hour    Type: JSON string
  theme:{theme_id}                       TTL: 1 hour    Type: JSON string
  page:{tenant_id}:{website_id}:{slug}   TTL: 10 min    Type: JSON string
  config:feature:{flag_key}              TTL: 5 min     Type: JSON string
  tenant:{tenant_id}:plan                TTL: 30 min    Type: String
  pricing:rules:{tenant_id}              TTL: 10 min    Type: JSON string
  industry:list                          TTL: 24 hours  Type: JSON string

CACHE INVALIDATION:
  - On mutation: Delete specific key + related list keys
  - Pattern-based: SCAN + DEL for tenant-scoped invalidation
  - Event-driven: Kafka consumer invalidates cache on domain events
  - Versioned keys: product:{tenant_id}:{product_id}:v{version}
```

### 4.4 Queue Processing (Bull Queues)

```
Purpose: Background job processing for async workloads

+-----------------------------------------------------------------+
|                     BULL QUEUE ARCHITECTURE                      |
|                                                                 |
|  Queue: ai:generation                                           |
|    Concurrency: 5 (per worker pod)                              |
|    Workers: 3 pods (GPU-enabled nodes)                          |
|    Max retries: 3                                               |
|    Backoff: exponential (2s, 8s, 32s)                           |
|    Jobs: website generation, content generation, image gen      |
|    Priority: 1 (enterprise) -> 5 (free tier)                    |
|                                                                 |
|  Queue: bulk:upload                                             |
|    Concurrency: 10                                              |
|    Workers: 2 pods                                              |
|    Jobs: CSV product import, bulk image upload                  |
|    Rate limit: 100 products/sec per tenant                      |
|                                                                 |
|  Queue: email:send                                              |
|    Concurrency: 20                                              |
|    Workers: 2 pods                                              |
|    Jobs: transactional emails, marketing campaigns              |
|    Rate limit: 50/sec (SES limit)                               |
|    Priority: 1 (transactional) -> 3 (marketing)                 |
|                                                                 |
|  Queue: report:generate                                         |
|    Concurrency: 3                                               |
|    Workers: 1 pod                                               |
|    Jobs: PDF/CSV export, scheduled reports                      |
|                                                                 |
|  Queue: media:process                                           |
|    Concurrency: 10                                              |
|    Workers: 2 pods                                              |
|    Jobs: image resize, thumbnail gen, virus scan                |
|                                                                 |
|  Queue: domain:ssl                                              |
|    Concurrency: 5                                               |
|    Workers: 1 pod                                               |
|    Jobs: SSL provisioning, DNS verification, renewal            |
|                                                                 |
|  Redis Keys (per queue):                                        |
|    bull:{queue}:waiting    - List of waiting job IDs            |
|    bull:{queue}:active     - List of active job IDs             |
|    bull:{queue}:completed  - Set of completed job IDs           |
|    bull:{queue}:failed     - Set of failed job IDs              |
|    bull:{queue}:{id}       - Hash with job data                 |
+-----------------------------------------------------------------+
```

### 4.5 Pub/Sub for Real-time Events

```
Purpose: Push real-time updates to connected WebSocket clients

CHANNELS:

  tenant:{tenant_id}:notifications
    -> New notification created, read status updates
    -> Consumed by WebSocket gateway, pushed to connected clients

  tenant:{tenant_id}:orders
    -> Order status changes (confirmed, shipped, delivered)
    -> Consumed by dashboard WebSocket connections

  tenant:{tenant_id}:ai:progress:{job_id}
    -> AI generation progress updates (0% -> 100%)
    -> Consumed by frontend progress indicators

  tenant:{tenant_id}:inventory
    -> Low stock alerts, stock updates
    -> Consumed by POS terminals and dashboard

  system:deployments
    -> System-wide maintenance notifications
    -> Consumed by all connected clients

FLOW:
  Service --PUBLISH--> Redis Pub/Sub Channel --> WebSocket Gateway --> Client
```

```typescript
// WebSocket Gateway Subscriber (pseudo-code)
redis.subscribe(`tenant:${tenantId}:notifications`);
redis.subscribe(`tenant:${tenantId}:orders`);

redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  const room = `tenant:${tenantId}`;
  io.to(room).emit(channel.split(':').pop(), data);
});
```

### 4.6 Wallet Balance Cache

```
Purpose: Fast wallet balance lookups without DB query

KEY PATTERN:

  wallet:balance:{tenant_id}:{customer_id}
    Type: String (decimal value)
    TTL: None (invalidated on mutation)

UPDATE STRATEGY:
  1. All wallet mutations go through Wallet Service
  2. After DB transaction commits:
     - WATCH key (optimistic locking)
     - SET wallet:balance:{tenant_id}:{customer_id} {new_balance}
  3. On cache miss: query wallet_db, populate cache
  4. Double-write: DB is source of truth, Redis is read cache

CONSISTENCY:
  - Use Redis WATCH/MULTI/EXEC for atomic updates
  - On discrepancy: DB value always wins
  - Periodic reconciliation job (every 5 min) compares Redis vs DB
```

---

## 5. S3 Storage Design

### Bucket Structure

```
siteforge-media-{environment}                          # Primary bucket
+-- {tenant-id}/
|   +-- products/
|   |   +-- {product-id}/
|   |   |   +-- original/                              # Original uploads
|   |   |   |   +-- image-001.jpg
|   |   |   +-- thumbnails/                            # Auto-generated
|   |   |   |   +-- sm-150x150.webp
|   |   |   |   +-- md-400x400.webp
|   |   |   |   +-- lg-800x800.webp
|   |   |   +-- variants/
|   |   |       +-- color-red.jpg
|   |   +-- bulk-imports/
|   |       +-- {upload-id}/
|   |           +-- products.csv
|   +-- websites/
|   |   +-- {website-id}/
|   |   |   +-- pages/
|   |   |   |   +-- hero-background.jpg
|   |   |   +-- favicon.ico
|   |   |   +-- og-image.jpg
|   |   |   +-- generated/                             # AI-generated content
|   |   |       +-- hero-v1.png
|   |   |       +-- about-v1.png
|   |   +-- exports/
|   |       +-- {export-id}.zip
|   +-- assets/
|   |   +-- logos/
|   |   |   +-- logo-primary.svg
|   |   |   +-- logo-dark.svg
|   |   +-- brand/
|   |   |   +-- brand-guidelines.pdf
|   |   +-- general/
|   |       +-- uploaded-file.png
|   +-- reports/
|   |   +-- {report-id}.pdf
|   +-- backups/
|       +-- {date}/
|           +-- website-export.json

siteforge-templates-{environment}                      # Templates bucket (shared)
+-- templates/
|   +-- {template-id}/
|   |   +-- thumbnail.jpg
|   |   +-- preview.jpg
|   |   +-- assets/
|   |       +-- placeholder-hero.jpg
|   |       +-- placeholder-product.jpg
|   +-- themes/
|       +-- {theme-id}/
|           +-- preview.jpg

siteforge-system-{environment}                         # System bucket (internal)
+-- ai-models/
|   +-- custom/
+-- email-templates/
|   +-- rendered/
+-- audit-exports/
    +-- {date}/
```

### Signed URL Generation

```typescript
// Media Service - Signed URL Generation

// UPLOAD: Pre-signed PUT URL (client uploads directly to S3)
async function generateUploadUrl(params: {
  tenantId: string;
  folder: 'products' | 'websites' | 'assets';
  filename: string;
  contentType: string;
  maxSizeBytes: number;
}): Promise<{ uploadUrl: string; key: string }> {
  const key = `${params.tenantId}/${params.folder}/${uuidv4()}/${sanitize(params.filename)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_MEDIA_BUCKET,
    Key: key,
    ContentType: params.contentType,
    // Server-side encryption
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: process.env.KMS_KEY_ID,
    // Metadata
    Metadata: {
      'tenant-id': params.tenantId,
      'original-name': params.filename,
    },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  return { uploadUrl, key };
}

// DOWNLOAD: Pre-signed GET URL (for private assets)
async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_MEDIA_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });
}
```

### CloudFront CDN Integration

```
                     +-------------------+
                     |   Client Browser  |
                     +--------+----------+
                              |
                     +--------v----------+
                     |   CloudFront      |
                     |   Distribution    |
                     |                   |
                     |   Behaviors:      |
                     |   /media/* -> S3  |
                     |   /api/*  -> ALB  |
                     +--------+----------+
                              |
              +---------------+--------------+
              |               |              |
    +---------v----+  +------v------+  +----v--------------+
    | Edge Cache   |  | Regional    |  | Origin (S3)       |
    | (300+ PoPs)  |  | Edge Cache  |  |                   |
    | TTL: 24h     |  | TTL: 1h     |  | OAI policy        |
    | Images, CSS  |  |             |  | (no public access)|
    +--------------+  +-------------+  +-------------------+

CloudFront Configuration:
  - Origin Access Identity (OAI): S3 bucket is not publicly accessible
  - Cache Policy: CachingOptimized for media, CachingDisabled for API
  - Response Headers Policy: SecurityHeadersPolicy
  - WAF: AWS WAF WebACL attached
  - SSL: ACM certificate (*.siteforge.io)
  - Custom domain: media.siteforge.io
  - Price class: PriceClass_100 (US, Europe, Asia)
  - Lambda@Edge: Image resizing on-the-fly
```

### Access Control Per Tenant

```
S3 Bucket Policy (tenant isolation):

+-----------------------------------------------------------------+
|  TENANT ISOLATION STRATEGY                                      |
|                                                                 |
|  1. All S3 operations go through Media Service (never direct)   |
|  2. Media Service validates tenant_id from JWT                  |
|  3. S3 key prefix always starts with {tenant_id}/               |
|  4. Application-level check: key.startsWith(req.tenantId)       |
|  5. S3 bucket policy restricts to service role only             |
|                                                                 |
|  IAM Role: siteforge-media-service-role                         |
|    - s3:PutObject, s3:GetObject, s3:DeleteObject                |
|    - Condition: StringLike s3:prefix "${tenant_id}/*"           |
|    - No ListBucket at root level                                |
|                                                                 |
|  Signed URLs are scoped:                                        |
|    - tenant A cannot access tenant B's files                    |
|    - URLs expire (15 min upload, 1 hour download)               |
|    - Content-Type restriction on uploads                        |
+-----------------------------------------------------------------+
```

### Upload Flow via Media Service

```
+------+      +--------------+      +-------------+      +-----+
|Client|      | Media Service|      | Bull Queue  |      | S3  |
+--+---+      +------+-------+      +------+------+      +--+--+
   |                 |                     |                  |
   | 1. POST /media/upload-url            |                  |
   |    { folder, filename, type }        |                  |
   |---------------->|                     |                  |
   |                 |                     |                  |
   |                 | 2. Validate:                           |
   |                 |    - File type allowed?                |
   |                 |    - Tenant storage quota?             |
   |                 |    - File size within limit?           |
   |                 |                     |                  |
   |                 | 3. Generate presigned PUT URL          |
   |                 |------------------------------------->  |
   |                 |<-------------------------------- URL --|
   |                 |                     |                  |
   |<----------------|                     |                  |
   |  { uploadUrl, key, mediaId }         |                  |
   |                 |                     |                  |
   | 4. PUT (direct upload to S3)         |                  |
   |---------------------------------------------------->   |
   |<------------------------------------------------ 200 --|
   |                 |                     |                  |
   | 5. POST /media/confirm               |                  |
   |    { mediaId, key }                  |                  |
   |---------------->|                     |                  |
   |                 | 6. Verify file exists in S3            |
   |                 |------------------------------------->  |
   |                 |                     |                  |
   |                 | 7. Enqueue processing                  |
   |                 |------------------->|                   |
   |                 |                     |                  |
   |                 | 8. Save to media_db |                  |
   |                 |                     |                  |
   |<----------------|                     |                  |
   |  { mediaId, cdnUrl, status: processing }                |
   |                 |                     |                  |
   |                 |      9. Worker processes:              |
   |                 |         - Virus scan (ClamAV)          |
   |                 |         - Generate thumbnails          |
   |                 |         - Extract metadata             |
   |                 |         - Update media_db              |
   |                 |                     |                  |
   |<---- WS: media.processed ------------|                  |
```

---

## 6. API Structure Per Service

### Service 1: Auth Service (Port 3001)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user with email/password |
| POST | `/auth/login` | Authenticate and return JWT tokens |
| POST | `/auth/logout` | Revoke current session, blacklist JWT |
| POST | `/auth/refresh` | Refresh access token using refresh token |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/verify-email` | Verify email address with token |
| POST | `/auth/mfa/enable` | Enable MFA, return TOTP secret and QR |
| POST | `/auth/mfa/verify` | Verify MFA TOTP code |
| POST | `/auth/mfa/disable` | Disable MFA (requires current TOTP) |
| POST | `/auth/oauth/{provider}` | Initiate OAuth flow (Google, GitHub) |
| GET | `/auth/oauth/{provider}/callback` | OAuth callback handler |
| POST | `/auth/change-password` | Change password (requires current) |
| GET | `/auth/sessions` | List active sessions for current user |
| DELETE | `/auth/sessions/{id}` | Revoke specific session |
| DELETE | `/auth/sessions` | Revoke all sessions (logout everywhere) |

### Service 2: User Service (Port 3002)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update current user profile |
| GET | `/users` | List users (admin, paginated) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user (admin) |
| PATCH | `/users/:id` | Update user (admin) |
| DELETE | `/users/:id` | Soft-delete user |
| GET | `/users/:id/preferences` | Get user preferences |
| PATCH | `/users/:id/preferences` | Update user preferences |
| GET | `/users/:id/addresses` | List user addresses |
| POST | `/users/:id/addresses` | Add address |
| PATCH | `/users/:id/addresses/:addressId` | Update address |
| DELETE | `/users/:id/addresses/:addressId` | Delete address |
| POST | `/users/avatar` | Upload avatar image |

### Service 3: Role Service (Port 3003)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/roles` | List roles for current tenant |
| POST | `/roles` | Create custom role |
| GET | `/roles/:id` | Get role with permissions |
| PATCH | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role (non-system only) |
| GET | `/roles/:id/permissions` | List role permissions |
| PUT | `/roles/:id/permissions` | Set role permissions (full replace) |
| GET | `/permissions` | List all available permissions |
| POST | `/users/:userId/roles` | Assign role to user |
| DELETE | `/users/:userId/roles/:roleId` | Remove role from user |
| GET | `/users/:userId/roles` | List user's roles |
| POST | `/roles/check` | Check if user has specific permission |

### Service 4: Tenant Service (Port 3004)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/tenants` | Create new tenant (on signup) |
| GET | `/tenants/current` | Get current tenant details |
| PATCH | `/tenants/current` | Update tenant settings |
| GET | `/tenants/current/usage` | Get current usage metrics |
| GET | `/tenants/current/subscription` | Get subscription details |
| POST | `/tenants/current/subscription` | Create/change subscription |
| DELETE | `/tenants/current/subscription` | Cancel subscription |
| GET | `/tenants/current/limits` | Get plan limits and current usage |
| POST | `/tenants/current/billing` | Update billing information |
| GET | `/tenants` | List tenants (super-admin) |
| GET | `/tenants/:id` | Get tenant by ID (super-admin) |
| PATCH | `/tenants/:id/status` | Suspend/activate tenant (super-admin) |

### Service 5: Website Service (Port 3005)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/websites` | List tenant's websites |
| POST | `/websites` | Create new website |
| GET | `/websites/:id` | Get website details |
| PATCH | `/websites/:id` | Update website settings |
| DELETE | `/websites/:id` | Delete website |
| POST | `/websites/:id/publish` | Publish website |
| POST | `/websites/:id/unpublish` | Unpublish website |
| GET | `/websites/:id/pages` | List website pages |
| POST | `/websites/:id/pages` | Create page |
| GET | `/websites/:id/pages/:pageId` | Get page with content (JSONB) |
| PATCH | `/websites/:id/pages/:pageId` | Update page content |
| DELETE | `/websites/:id/pages/:pageId` | Delete page |
| GET | `/websites/:id/pages/:pageId/versions` | List page versions |
| POST | `/websites/:id/pages/:pageId/restore/:version` | Restore page version |
| GET | `/websites/:id/navigation` | Get navigation menus |
| PUT | `/websites/:id/navigation` | Update navigation menus |
| POST | `/websites/:id/duplicate` | Duplicate website |
| GET | `/websites/:id/seo` | Get SEO settings |
| PATCH | `/websites/:id/seo` | Update SEO settings |

### Service 6: Template Service (Port 3006)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List templates (filterable by category, industry) |
| GET | `/templates/:id` | Get template with layouts |
| POST | `/templates` | Create template (admin) |
| PATCH | `/templates/:id` | Update template |
| DELETE | `/templates/:id` | Delete template |
| GET | `/templates/:id/layouts` | Get template layouts (JSONB) |
| PUT | `/templates/:id/layouts/:pageType` | Update layout for page type |
| GET | `/templates/:id/variables` | Get template variables |
| POST | `/templates/:id/preview` | Generate preview with custom variables |
| POST | `/templates/:id/apply` | Apply template to website |
| GET | `/templates/categories` | List template categories |

### Service 7: Theme Service (Port 3007)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/themes` | List available themes |
| GET | `/themes/:id` | Get theme details (colors, typography) |
| POST | `/themes` | Create theme (admin) |
| PATCH | `/themes/:id` | Update theme |
| DELETE | `/themes/:id` | Delete theme |
| POST | `/themes/:id/preview` | Generate CSS preview |
| GET | `/websites/:websiteId/theme` | Get website's active theme + overrides |
| PUT | `/websites/:websiteId/theme` | Set website theme |
| PATCH | `/websites/:websiteId/theme/overrides` | Update theme overrides |
| POST | `/themes/generate` | AI-generate theme from brand colors |

### Service 8: Industry Service (Port 3008)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/industries` | List all industries (tree structure) |
| GET | `/industries/:id` | Get industry details |
| POST | `/industries` | Create industry (admin) |
| PATCH | `/industries/:id` | Update industry |
| DELETE | `/industries/:id` | Delete industry |
| GET | `/industries/:id/templates` | List templates for industry |
| POST | `/industries/:id/templates` | Associate template with industry |
| GET | `/industries/:id/prompts` | Get AI content prompts for industry |
| PUT | `/industries/:id/prompts` | Update AI prompts |
| GET | `/industries/suggest` | Suggest industry from business description |

### Service 9: AI Service (Port 3009)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/generate/website` | Generate full website content |
| POST | `/ai/generate/content` | Generate section content (hero, about, etc.) |
| POST | `/ai/generate/image` | Generate image (AI model) |
| POST | `/ai/generate/seo` | Generate SEO metadata |
| POST | `/ai/generate/product-description` | Generate product descriptions |
| GET | `/ai/generations` | List generation history |
| GET | `/ai/generations/:id` | Get generation result |
| GET | `/ai/generations/:id/status` | Poll generation status |
| POST | `/ai/generations/:id/feedback` | Submit feedback on generation |
| POST | `/ai/generate/variations` | Generate content variations |
| POST | `/ai/chat` | Interactive AI chat for website building |
| GET | `/ai/prompts` | List available prompt templates |
| GET | `/ai/usage` | Get AI usage for current tenant |

### Service 10: AI Version Service (Port 3010)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ai-models` | List all AI models |
| POST | `/ai-models` | Register new AI model |
| GET | `/ai-models/:id` | Get model details |
| PATCH | `/ai-models/:id` | Update model config |
| GET | `/ai-models/:id/versions` | List model versions |
| POST | `/ai-models/:id/versions` | Create new version |
| PATCH | `/ai-models/:id/versions/:versionId` | Update version config |
| POST | `/ai-models/:id/versions/:versionId/promote` | Promote version to active |
| POST | `/ai-models/:id/versions/:versionId/rollback` | Rollback to previous version |
| GET | `/ai-ab-tests` | List A/B tests |
| POST | `/ai-ab-tests` | Create A/B test |
| PATCH | `/ai-ab-tests/:id` | Update test (end, adjust traffic) |
| GET | `/ai-ab-tests/:id/results` | Get test results |

### Service 11: Product Service (Port 3011)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products (paginated, filterable) |
| POST | `/products` | Create product |
| GET | `/products/:id` | Get product details |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/batch` | Batch create products (from CSV) |
| PATCH | `/products/batch` | Batch update products |
| GET | `/products/:id/variants` | List product variants |
| POST | `/products/:id/variants` | Create variant |
| PATCH | `/products/:id/variants/:variantId` | Update variant |
| DELETE | `/products/:id/variants/:variantId` | Delete variant |
| GET | `/categories` | List product categories (tree) |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/products/:id/images` | Add product image |
| DELETE | `/products/:id/images/:imageId` | Remove product image |

### Service 12: Inventory Service (Port 3012)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/inventory` | List inventory (by location, product) |
| GET | `/inventory/:variantId` | Get inventory for variant |
| PATCH | `/inventory/:variantId` | Update inventory quantity |
| POST | `/inventory/adjust` | Create inventory adjustment |
| POST | `/inventory/reserve` | Reserve inventory for order |
| POST | `/inventory/release` | Release reserved inventory |
| POST | `/inventory/transfer` | Transfer between locations |
| GET | `/inventory/low-stock` | Get low-stock alerts |
| GET | `/inventory/movements` | List inventory movements |
| GET | `/locations` | List inventory locations |
| POST | `/locations` | Create location |
| PATCH | `/locations/:id` | Update location |
| DELETE | `/locations/:id` | Delete location |

### Service 13: Pricing Service (Port 3013)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/price-lists` | List price lists |
| POST | `/price-lists` | Create price list |
| PATCH | `/price-lists/:id` | Update price list |
| DELETE | `/price-lists/:id` | Delete price list |
| POST | `/pricing/calculate` | Calculate final price for cart |
| GET | `/price-rules` | List price rules |
| POST | `/price-rules` | Create price rule |
| PATCH | `/price-rules/:id` | Update price rule |
| DELETE | `/price-rules/:id` | Delete price rule |
| GET | `/discount-codes` | List discount codes |
| POST | `/discount-codes` | Create discount code |
| POST | `/discount-codes/validate` | Validate discount code |
| PATCH | `/discount-codes/:id` | Update discount code |
| DELETE | `/discount-codes/:id` | Delete discount code |
| GET | `/tax-rates` | List tax rates |
| POST | `/tax-rates` | Create tax rate |
| POST | `/tax-rates/calculate` | Calculate tax for order |

### Service 14: Order Service (Port 3014)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List orders (paginated, filterable) |
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order details |
| PATCH | `/orders/:id` | Update order |
| POST | `/orders/:id/cancel` | Cancel order |
| POST | `/orders/:id/confirm` | Confirm order |
| PATCH | `/orders/:id/fulfillment` | Update fulfillment status |
| GET | `/orders/:id/history` | Get order status history |
| GET | `/orders/:id/items` | Get order items |
| POST | `/orders/:id/notes` | Add note to order |
| GET | `/orders/stats` | Get order statistics |
| POST | `/orders/export` | Export orders to CSV |
| GET | `/cart` | Get current cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/cart/items/:itemId` | Remove item from cart |
| POST | `/cart/checkout` | Convert cart to order |

### Service 15: Payment Service (Port 3015)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payments/intent` | Create payment intent (Stripe) |
| POST | `/payments/confirm` | Confirm payment |
| GET | `/payments/:id` | Get payment details |
| GET | `/payments` | List payments for tenant |
| POST | `/payments/webhook/stripe` | Stripe webhook handler |
| POST | `/payments/webhook/razorpay` | Razorpay webhook handler |
| GET | `/payment-methods` | List saved payment methods |
| POST | `/payment-methods` | Save payment method |
| DELETE | `/payment-methods/:id` | Delete payment method |
| POST | `/payment-methods/:id/default` | Set as default |
| POST | `/payments/:id/capture` | Capture authorized payment |
| POST | `/payments/:id/void` | Void authorized payment |

### Service 16: Refund Service (Port 3016)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/refunds` | Create refund request |
| GET | `/refunds` | List refunds |
| GET | `/refunds/:id` | Get refund details |
| POST | `/refunds/:id/approve` | Approve refund |
| POST | `/refunds/:id/reject` | Reject refund |
| POST | `/refunds/:id/process` | Process approved refund |
| GET | `/orders/:orderId/refunds` | List refunds for order |
| GET | `/refunds/stats` | Get refund statistics |

### Service 17: Wallet Service (Port 3017)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wallets/me` | Get current user wallet |
| GET | `/wallets/:customerId` | Get wallet by customer (admin) |
| POST | `/wallets` | Create wallet for customer |
| POST | `/wallets/:id/credit` | Credit wallet (refund, reward) |
| POST | `/wallets/:id/debit` | Debit wallet (payment) |
| GET | `/wallets/:id/transactions` | List wallet transactions |
| GET | `/wallets/:id/balance` | Get current balance (cached) |
| POST | `/wallets/topup` | Top up wallet (via payment) |

### Service 18: POS Service (Port 3018)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/pos/devices` | List POS devices |
| POST | `/pos/devices` | Register POS device |
| PATCH | `/pos/devices/:id` | Update device config |
| DELETE | `/pos/devices/:id` | Deactivate device |
| POST | `/pos/sessions/open` | Open POS session |
| POST | `/pos/sessions/:id/close` | Close POS session |
| GET | `/pos/sessions/:id` | Get session details |
| POST | `/pos/transactions` | Create POS transaction |
| GET | `/pos/transactions` | List POS transactions |
| POST | `/pos/transactions/:id/sync` | Sync transaction to online |
| POST | `/pos/sync/batch` | Batch sync transactions |
| GET | `/pos/sessions/:id/report` | Get session summary report |

### Service 19: Plugin Service (Port 3019)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/plugins` | List available plugins (marketplace) |
| GET | `/plugins/:id` | Get plugin details |
| POST | `/plugins` | Register plugin (admin) |
| PATCH | `/plugins/:id` | Update plugin |
| GET | `/plugins/installed` | List installed plugins for tenant |
| POST | `/plugins/:id/install` | Install plugin |
| POST | `/plugins/:id/uninstall` | Uninstall plugin |
| PATCH | `/plugins/:id/settings` | Update plugin settings |
| POST | `/plugins/:id/activate` | Activate plugin |
| POST | `/plugins/:id/deactivate` | Deactivate plugin |
| GET | `/plugins/:id/hooks` | Get plugin hook configurations |

### Service 20: Domain Service (Port 3020)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/domains` | List domains for tenant |
| POST | `/domains` | Add custom domain |
| GET | `/domains/:id` | Get domain details |
| DELETE | `/domains/:id` | Remove domain |
| POST | `/domains/:id/verify` | Trigger DNS verification |
| GET | `/domains/:id/dns-records` | Get required DNS records |
| POST | `/domains/:id/ssl/provision` | Provision SSL certificate |
| GET | `/domains/:id/ssl/status` | Get SSL status |
| POST | `/domains/:id/primary` | Set as primary domain |
| GET | `/domains/check-availability` | Check domain availability |

### Service 21: Email Service (Port 3021)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/emails/send` | Send transactional email |
| POST | `/emails/send/batch` | Send batch emails |
| GET | `/email-templates` | List email templates |
| POST | `/email-templates` | Create email template |
| GET | `/email-templates/:id` | Get template |
| PATCH | `/email-templates/:id` | Update template |
| DELETE | `/email-templates/:id` | Delete template |
| POST | `/email-templates/:id/preview` | Preview template with data |
| GET | `/emails/sends` | List sent emails (history) |
| GET | `/emails/sends/:id` | Get email send details |
| GET | `/emails/stats` | Get email statistics |
| GET | `/emails/suppressions` | List suppressed emails |
| DELETE | `/emails/suppressions/:email` | Remove from suppression list |

### Service 22: Notification Service (Port 3022)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications for current user |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/:id/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |
| POST | `/notifications/send` | Send notification (internal) |
| GET | `/notifications/preferences` | Get notification preferences |
| PATCH | `/notifications/preferences` | Update preferences |
| POST | `/push/subscribe` | Register push subscription |
| DELETE | `/push/subscribe` | Unsubscribe from push |

### Service 23: Analytics Service (Port 3023)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/analytics/track` | Track page view or event |
| POST | `/analytics/track/batch` | Batch track events |
| GET | `/analytics/dashboard` | Get dashboard overview metrics |
| GET | `/analytics/pageviews` | Get page view analytics |
| GET | `/analytics/visitors` | Get visitor analytics |
| GET | `/analytics/events` | Get event analytics |
| GET | `/analytics/funnels/:funnelId` | Get funnel analytics |
| POST | `/analytics/funnels` | Create funnel definition |
| GET | `/analytics/realtime` | Get real-time visitor count |
| GET | `/analytics/top-pages` | Get top pages by views |
| GET | `/analytics/traffic-sources` | Get traffic source breakdown |
| GET | `/analytics/conversions` | Get conversion metrics |

### Service 24: Reporting Service (Port 3024)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/reports` | List reports |
| POST | `/reports` | Create report definition |
| GET | `/reports/:id` | Get report |
| PATCH | `/reports/:id` | Update report |
| DELETE | `/reports/:id` | Delete report |
| POST | `/reports/:id/run` | Run report (generate data) |
| POST | `/reports/:id/export` | Export report (CSV, PDF, XLSX) |
| GET | `/reports/:id/exports` | List exports for report |
| GET | `/reports/:id/exports/:exportId/download` | Download export file |
| GET | `/reports/scheduled` | List scheduled reports |
| POST | `/reports/:id/schedule` | Schedule report |
| DELETE | `/reports/:id/schedule` | Cancel scheduled report |

### Service 25: Media Service (Port 3025)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/media/upload-url` | Get pre-signed upload URL |
| POST | `/media/confirm` | Confirm upload and start processing |
| GET | `/media` | List media files (paginated) |
| GET | `/media/:id` | Get media file details |
| PATCH | `/media/:id` | Update media metadata (alt text) |
| DELETE | `/media/:id` | Delete media file |
| POST | `/media/bulk-delete` | Bulk delete media files |
| GET | `/media/folders` | List folders |
| POST | `/media/folders` | Create folder |
| PATCH | `/media/folders/:id` | Rename folder |
| DELETE | `/media/folders/:id` | Delete folder |
| POST | `/media/:id/move` | Move file to folder |
| GET | `/media/:id/download-url` | Get signed download URL |
| GET | `/media/usage` | Get storage usage for tenant |

### Service 26: Config Service (Port 3026)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/config/features` | List feature flags |
| GET | `/config/features/:key` | Get feature flag status |
| POST | `/config/features` | Create feature flag (admin) |
| PATCH | `/config/features/:key` | Update feature flag |
| DELETE | `/config/features/:key` | Delete feature flag |
| POST | `/config/features/:key/evaluate` | Evaluate flag for tenant |
| GET | `/config/system` | List system configs |
| GET | `/config/system/:namespace/:key` | Get system config value |
| PUT | `/config/system/:namespace/:key` | Set system config |
| GET | `/config/tenant` | List tenant configs |
| GET | `/config/tenant/:key` | Get tenant config |
| PUT | `/config/tenant/:key` | Set tenant config |

### Service 27: Audit Service (Port 3027)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/audit/logs` | List audit logs (filterable) |
| GET | `/audit/logs/:id` | Get audit log entry |
| GET | `/audit/logs/resource/:type/:id` | Get logs for resource |
| GET | `/audit/logs/user/:userId` | Get logs for user |
| POST | `/audit/export` | Export audit logs |
| GET | `/audit/export/:exportId` | Get export status/download |
| GET | `/audit/stats` | Get audit statistics |
| POST | `/audit/log` | Create audit log (internal) |

### Service 28: Search Service (Port 3028)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search` | Global search across resources |
| GET | `/search/products` | Search products |
| GET | `/search/pages` | Search website pages |
| GET | `/search/orders` | Search orders |
| POST | `/search/reindex/:resource` | Trigger reindex (admin) |
| GET | `/search/suggestions` | Get search suggestions |

---

## 7. Event-Driven Workflows

### Kafka Cluster Configuration

```
Kafka Cluster: 3 brokers
Replication Factor: 3
Min ISR: 2
Retention: 7 days (domain events), 30 days (audit events)
Schema Registry: Confluent Schema Registry (Avro)
Partitioning Strategy: tenant_id hash for ordering guarantee per tenant
```

### Kafka Topics

```
TOPIC                              PARTITIONS   RETENTION   CONSUMERS
----------------------------------------------------------------------
user.signed_up                     6            7 days      template, ai, notification, analytics, audit
user.updated                       6            7 days      search, notification, audit
user.deleted                       6            7 days      all services (GDPR cascade)

tenant.created                     3            7 days      role, config, audit
tenant.plan_changed                3            7 days      config, notification, audit

website.created                    6            7 days      analytics, search, audit
website.published                  6            7 days      domain, search, notification, audit
website.updated                    6            7 days      search, audit

template.applied                   6            7 days      website, analytics, audit
template.generated                 3            7 days      notification, audit

ai.generation_requested            12           7 days      ai (workers)
ai.generation_completed            6            7 days      template, website, notification, audit
ai.generation_failed               6            7 days      notification, audit

product.created                    12           7 days      search, inventory, analytics, audit
product.updated                    12           7 days      search, pricing, audit
product.deleted                    12           7 days      search, inventory, audit
product.batch_created              6            7 days      search, inventory, audit

inventory.updated                  6            7 days      product, notification, analytics, audit
inventory.low_stock                3            7 days      notification, audit
inventory.reserved                 6            7 days      order, audit
inventory.released                 6            7 days      order, audit

order.created                      12           7 days      payment, inventory, analytics, notification, audit
order.confirmed                    6            7 days      inventory, notification, analytics, audit
order.cancelled                    6            7 days      inventory, payment, notification, audit
order.fulfilled                    6            7 days      notification, analytics, audit

payment.processing                 6            7 days      order, audit
payment.succeeded                  6            7 days      order, wallet, notification, analytics, audit
payment.failed                     6            7 days      order, notification, audit

refund.requested                   3            7 days      notification, audit
refund.approved                    3            7 days      payment, notification, audit
refund.completed                   3            7 days      wallet, inventory, notification, audit

wallet.credited                    3            7 days      notification, audit
wallet.debited                     3            7 days      notification, audit

pos.order_synced                   6            7 days      order, inventory, analytics, audit
pos.payment_synced                 6            7 days      payment, audit

domain.verified                    3            7 days      website, notification, audit
domain.ssl_provisioned             3            7 days      notification, audit

media.uploaded                     6            7 days      website, product, audit
media.processed                    6            7 days      notification, audit

plugin.installed                   3            7 days      config, notification, audit
plugin.uninstalled                 3            7 days      config, audit

bulk.upload_processed              3            7 days      product, notification, audit

notification.send                  12           3 days      email, push (internal routing)

audit.event                        12           30 days     audit (all domain events mirrored)
```

### Event Flow Diagrams

#### Event Flow 1: User Signup Cascade

```
user.signed_up
  |
  +---> Template Service
  |      +-- Select default template for user's industry
  |      +-- Publish: template.applied
  |
  +---> AI Service
  |      +-- Enqueue website generation job (Bull queue)
  |      +-- Generate initial content based on industry
  |      +-- Publish: ai.generation_completed
  |
  +---> Notification Service
  |      +-- Send welcome email
  |      +-- Create in-app onboarding notification
  |
  +---> Analytics Service
  |      +-- Track signup event
  |      +-- Initialize user analytics profile
  |
  +---> Audit Service
         +-- Log: user registration event
```

#### Event Flow 2: Order to Payment to Inventory

```
order.created
  |
  +---> Payment Service
  |      +-- Create payment intent
  |      +-- Process payment via PSP
  |      +-- Publish: payment.succeeded OR payment.failed
  |
  +---> Inventory Service
  |      +-- Reserve stock for order items
  |      +-- Publish: inventory.reserved
  |
  +---> Analytics Service
  |      +-- Track order creation
  |      +-- Update conversion metrics
  |
  +---> Notification Service
         +-- Send order confirmation email
         +-- Push notification to merchant

payment.succeeded
  |
  +---> Order Service
  |      +-- Update order status to 'confirmed'
  |      +-- Publish: order.confirmed
  |
  +---> Wallet Service
  |      +-- If wallet payment: debit balance
  |      +-- Publish: wallet.debited
  |
  +---> Notification Service
  |      +-- Send payment receipt to customer
  |      +-- Notify merchant of new paid order
  |
  +---> Analytics Service
         +-- Track revenue event

payment.failed
  |
  +---> Order Service
  |      +-- Update payment status to 'failed'
  |
  +---> Inventory Service
  |      +-- Release reserved stock
  |      +-- Publish: inventory.released
  |
  +---> Notification Service
         +-- Send payment failure email to customer
```

#### Event Flow 3: POS Sync Pipeline

```
pos.order_synced
  |
  +---> Order Service
  |      +-- Create online order record from POS transaction
  |      +-- Link POS transaction ID
  |      +-- Publish: order.created (source: 'pos')
  |
  +---> Inventory Service
  |      +-- Deduct stock at POS location
  |      +-- Publish: inventory.updated
  |      +-- Check reorder point -> publish: inventory.low_stock
  |
  +---> Analytics Service
         +-- Track POS sale
         +-- Update omnichannel metrics
```

#### Event Flow 4: AI Generation Pipeline

```
ai.generation_requested
  |
  +---> AI Service (Bull Queue Worker)
         +-- Fetch model version config (AI Version Service)
         +-- Execute AI generation (OpenAI/Anthropic API)
         +-- Generate images (Stability AI / DALL-E)
         +-- Upload assets to S3 (Media Service)
         +-- Publish: ai.generation_completed OR ai.generation_failed

ai.generation_completed
  |
  +---> Template Service
  |      +-- Apply generated content to template
  |      +-- Update template JSONB with AI content
  |
  +---> Notification Service
  |      +-- Notify user: "Your website is ready!"
  |      +-- In-app + email + push
  |
  +---> Audit Service
         +-- Log generation details and cost
```

#### Event Flow 5: Bulk Upload Pipeline

```
bulk.upload_processed
  |
  +---> Product Service
  |      +-- Batch create products from parsed CSV
  |      +-- Validate each row, collect errors
  |      +-- Publish: product.batch_created
  |
  +---> Notification Service
  |      +-- Send upload complete notification
  |      +-- Include success/error counts
  |
  +---> Audit Service
         +-- Log bulk operation details

product.batch_created
  |
  +---> Search Service
  |      +-- Bulk index products in Elasticsearch
  |
  +---> Inventory Service
  |      +-- Create initial inventory records
  |
  +---> Analytics Service
         +-- Track product catalog growth
```

### Event Schema (Avro)

```json
// Example: order.created event
{
  "namespace": "com.siteforge.events",
  "type": "record",
  "name": "OrderCreated",
  "fields": [
    { "name": "event_id",    "type": "string" },
    { "name": "event_type",  "type": "string", "default": "order.created" },
    { "name": "timestamp",   "type": "long", "logicalType": "timestamp-millis" },
    { "name": "tenant_id",   "type": "string" },
    { "name": "correlation_id", "type": "string" },
    { "name": "payload", "type": {
      "type": "record",
      "name": "OrderPayload",
      "fields": [
        { "name": "order_id",     "type": "string" },
        { "name": "order_number", "type": "string" },
        { "name": "customer_id",  "type": "string" },
        { "name": "total",        "type": "double" },
        { "name": "currency",     "type": "string" },
        { "name": "items",        "type": { "type": "array", "items": {
          "type": "record",
          "name": "OrderItem",
          "fields": [
            { "name": "product_id",  "type": "string" },
            { "name": "variant_id",  "type": ["null", "string"] },
            { "name": "quantity",    "type": "int" },
            { "name": "unit_price",  "type": "double" }
          ]
        }}},
        { "name": "source",       "type": "string", "default": "web" }
      ]
    }}
  ]
}
```

---

## 8. Security Vulnerabilities and Mitigation

### OWASP Top 10 Analysis for SiteForge AI

#### 8.1 SQL Injection (A03:2021 - Injection)

```
RISK: Malicious SQL through user input fields (product names, search queries, etc.)

MITIGATIONS:

  1. Parameterized Queries via Prisma ORM
     - All database access through Prisma Client (never raw SQL in application code)
     - Prisma generates parameterized queries automatically

     // SAFE: Prisma parameterized query
     const product = await prisma.product.findMany({
       where: { tenantId, name: { contains: searchTerm } }
     });

     // NEVER: Raw string concatenation
     // const result = await db.query(`SELECT * FROM products WHERE name = '${input}'`);

  2. Input Validation Layer
     - Zod schemas for all API request validation
     - Max length enforcement on all string fields
     - Regex patterns for structured fields (email, phone, SKU)

  3. Database-Level Protections
     - Least-privilege DB users (no DDL permissions for app user)
     - Prepared statements enforced at connection pool level
     - pg_stat_statements monitoring for anomalous queries

  4. Rare Raw Query Protection
     - When raw SQL is unavoidable (e.g., complex analytics):
       prisma.$queryRaw`SELECT * FROM events WHERE tenant_id = ${tenantId}`
       // Prisma tagged template literals auto-parameterize
```

#### 8.2 Cross-Site Scripting (XSS) (A03:2021 - Injection)

```
RISK: Stored XSS via website builder content, product descriptions, user-generated HTML

MITIGATIONS:

  1. Input Sanitization
     - DOMPurify for all HTML content (website pages, product descriptions)
     - Strict allowlist of HTML tags and attributes for rich text fields

     // Sanitize on write
     const clean = DOMPurify.sanitize(userHtml, {
       ALLOWED_TAGS: ['p', 'b', 'i', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'img'],
       ALLOWED_ATTR: ['href', 'src', 'alt', 'class'],
       ALLOW_DATA_ATTR: false,
     });

  2. Content Security Policy (CSP) Headers
     Content-Security-Policy:
       default-src 'self';
       script-src 'self' 'nonce-{random}';
       style-src 'self' 'unsafe-inline' fonts.googleapis.com;
       img-src 'self' data: media.siteforge.io *.cloudfront.net;
       connect-src 'self' api.siteforge.io wss://ws.siteforge.io;
       font-src 'self' fonts.gstatic.com;
       frame-ancestors 'none';
       base-uri 'self';
       form-action 'self';

  3. Output Encoding
     - React frontend auto-escapes by default (JSX)
     - Server-side: encode HTML entities for non-HTML contexts
     - JSON responses: proper Content-Type headers

  4. Template Content Sandboxing
     - AI-generated content sanitized before storage
     - User website content rendered in sandboxed iframe on preview
     - Custom CSS scoped to prevent breakout
```

#### 8.3 Cross-Site Request Forgery (CSRF) (A01:2021)

```
RISK: Unauthorized actions via forged requests (especially for state-changing operations)

MITIGATIONS:

  1. SameSite Cookie Policy
     Set-Cookie: session=...; SameSite=Strict; Secure; HttpOnly; Path=/

  2. CSRF Token (Double Submit Pattern)
     - Server generates CSRF token, stored in cookie + response header
     - Client includes token in X-CSRF-Token header on mutations
     - Server validates cookie token matches header token

     // Middleware
     if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
       const cookieToken = req.cookies['csrf-token'];
       const headerToken = req.headers['x-csrf-token'];
       if (!cookieToken || cookieToken !== headerToken) {
         throw new ForbiddenException('CSRF validation failed');
       }
     }

  3. Origin Validation
     - Check Origin and Referer headers against allowlist
     - Reject requests from unexpected origins

  4. Custom Headers Requirement
     - All API requests must include X-Requested-With: XMLHttpRequest
     - Simple form submissions blocked by CORS
```

#### 8.4 Server-Side Request Forgery (SSRF) (A10:2021)

```
RISK: URL inputs (webhook URLs, image URLs, import URLs) used to probe internal network

MITIGATIONS:

  1. URL Allowlisting
     const BLOCKED_RANGES = [
       '10.0.0.0/8',       // Private
       '172.16.0.0/12',    // Private
       '192.168.0.0/16',   // Private
       '169.254.0.0/16',   // Link-local
       '127.0.0.0/8',      // Loopback
       '0.0.0.0/8',        // Current network
       'fd00::/8',          // IPv6 private
     ];

  2. DNS Resolution Validation
     - Resolve hostname BEFORE making request
     - Verify resolved IP is not in blocked ranges
     - Prevent DNS rebinding: pin resolved IP

  3. Network Segmentation
     - Payment service in isolated VPC subnet
     - Outbound traffic filtered by security groups
     - No direct internet access from internal services (NAT Gateway only)

  4. Webhook URL Validation
     - Validate URL scheme (https only)
     - DNS resolution check
     - Response timeout: 5 seconds
     - No redirect following
     - Response body size limit: 1MB
```

#### 8.5 Insecure Direct Object Reference (IDOR) (A01:2021)

```
RISK: User A accesses User B's data by manipulating resource IDs in URLs

MITIGATIONS:

  1. Tenant-Scoped Queries (MANDATORY)
     // Every database query MUST include tenant_id filter
     const order = await prisma.order.findFirst({
       where: {
         id: orderId,
         tenantId: req.tenantId,   // From JWT, never from request body
       },
     });
     if (!order) throw new NotFoundException();

  2. Row-Level Security (PostgreSQL)
     -- Applied at DB level as defense-in-depth
     ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
     CREATE POLICY tenant_isolation ON orders
       USING (tenant_id = current_setting('app.current_tenant')::UUID);

  3. Ownership Validation
     // For customer-facing endpoints, validate resource ownership
     if (order.customerId !== req.userId && !req.isAdmin) {
       throw new ForbiddenException();
     }

  4. UUID Resource IDs
     - Never use sequential integer IDs (prevents enumeration)
     - All resource IDs are UUIDv4

  5. Middleware Enforcement
     - TenantGuard middleware extracts tenant_id from JWT
     - Sets PostgreSQL session variable: SET app.current_tenant = '{id}'
     - Impossible to bypass at application level
```

#### 8.6 File Upload Exploits (A04:2021 - Insecure Design)

```
RISK: Malicious file uploads (web shells, malware, oversized files, polyglot files)

MITIGATIONS:

  1. File Type Validation (Defense in Depth)
     // Layer 1: Extension check
     const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.csv'];

     // Layer 2: MIME type check (from Content-Type header)
     const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

     // Layer 3: Magic bytes validation (file signature check)
     const fileType = await fileTypeFromBuffer(buffer);
     if (!ALLOWED_MIMES.includes(fileType.mime)) {
       throw new BadRequestException('Invalid file type');
     }

  2. Virus Scanning
     - ClamAV integration via Bull queue
     - Every upload scanned before becoming accessible
     - Quarantine bucket for suspicious files
     - Webhook to security team for detected threats

  3. Size Limits
     Per-plan upload limits:
       Free:       5MB per file,  1GB total storage
       Starter:    10MB per file, 10GB total storage
       Pro:        25MB per file, 50GB total storage
       Enterprise: 100MB per file, 500GB total storage

  4. SVG Sanitization
     - SVGs can contain JavaScript
     - Strip all <script>, event handlers, and external references
     - Use svg-sanitize library

  5. Image Processing
     - Re-encode all uploaded images (strips EXIF metadata, embedded payloads)
     - Generate thumbnails server-side (Sharp library)
     - Serve from separate CDN domain (media.siteforge.io)
```

#### 8.7 Payment Fraud (A04:2021 - Insecure Design)

```
RISK: Double charges, payment manipulation, webhook spoofing

MITIGATIONS:

  1. Idempotency Keys
     // Every payment request requires unique idempotency key
     POST /payments/intent
     Idempotency-Key: ord_abc123_pay_1711843200

     // Server checks if key already processed
     const existing = await prisma.payment.findUnique({
       where: { idempotencyKey }
     });
     if (existing) return existing; // Return cached result

  2. Webhook Signature Verification
     // Stripe webhook verification
     const event = stripe.webhooks.constructEvent(
       req.rawBody,
       req.headers['stripe-signature'],
       process.env.STRIPE_WEBHOOK_SECRET
     );
     // Rejects if signature invalid

  3. Amount Verification
     // After payment webhook, verify amount matches order
     if (payment.amount !== order.total) {
       await flagForReview(payment);
       throw new PaymentMismatchException();
     }

  4. Race Condition Prevention
     // Use database advisory locks for payment processing
     SELECT pg_advisory_xact_lock(hashtext(order_id::text));

  5. Fraud Detection Rules
     - Velocity checks: max 5 payment attempts per order
     - Amount anomaly: flag orders > 2x average order value
     - Card BIN checks: flag high-risk BIN ranges
     - Geographic mismatch: IP location vs billing address
```

#### 8.8 API Abuse (A06:2021 - Vulnerable Components)

```
RISK: Brute force, credential stuffing, DDoS, bot attacks, scraping

MITIGATIONS:

  1. Multi-Layer Rate Limiting
     Layer 1: AWS WAF (network level)
       - 2000 req/5min per IP (global)
       - Bot detection rules
       - Geo-blocking for high-risk regions (configurable)

     Layer 2: API Gateway (application level)
       - Per-tenant sliding window (see Redis section)
       - Per-endpoint limits (e.g., /auth/login: 10/min per IP)

     Layer 3: Service Level
       - Business logic throttling (e.g., 50 AI generations/day for free tier)

  2. AWS WAF Rules
     - AWS Managed Rules: AWSManagedRulesCommonRuleSet
     - AWS Managed Rules: AWSManagedRulesKnownBadInputsRuleSet
     - AWS Managed Rules: AWSManagedRulesBotControlRuleSet
     - Custom rules for API-specific patterns

  3. Bot Detection
     - CAPTCHA on signup, login (after 3 failed attempts)
     - Device fingerprinting
     - Behavioral analysis (request timing patterns)

  4. API Key Management
     - API keys for external integrations (hashed in DB)
     - Key rotation support
     - Scope-limited keys (read-only, specific resources)
```

#### 8.9 Broken Authentication (A07:2021)

```
RISK: Credential compromise, session hijacking, weak passwords

MITIGATIONS:

  1. Multi-Factor Authentication (MFA)
     - TOTP-based (Google Authenticator, Authy)
     - Required for admin roles on Enterprise plans
     - Backup codes (10 single-use codes, bcrypt hashed)

  2. JWT Token Architecture
     Access Token:
       - Short-lived: 15 minutes
       - Contains: userId, tenantId, roles
       - Signed with RS256 (asymmetric)
       - Stored: memory only (not localStorage)

     Refresh Token:
       - Long-lived: 7 days
       - Stored: HttpOnly, Secure, SameSite cookie
       - Rotated on each use (old one blacklisted)
       - Tied to device fingerprint

     Token Rotation:
       - On refresh: issue new access + refresh tokens
       - Blacklist old refresh token in Redis
       - Detect reuse of old refresh token -> revoke all sessions

  3. Password Policy
     - Minimum 10 characters
     - Check against Have I Been Pwned API (k-anonymity)
     - bcrypt with cost factor 12
     - No password reuse (last 5 passwords)

  4. Session Management
     - Concurrent session limit: 5 devices
     - Session listing and individual revocation
     - Automatic logout after 30 min inactivity
     - IP change detection -> require re-authentication
```

#### 8.10 Broken Access Control (A01:2021)

```
RISK: Privilege escalation, unauthorized data access across tenants

MITIGATIONS:

  1. RBAC Implementation
     Roles: super_admin > admin > editor > viewer > customer

     Permission Check Flow:
       Request -> AuthGuard -> RoleGuard -> TenantGuard -> Handler

     // RoleGuard decorator
     @Roles('admin', 'editor')
     @UseGuards(AuthGuard, RoleGuard)
     async updateProduct() { ... }

     // RoleGuard checks user's role permissions against required permissions

  2. Tenant Isolation (Zero Trust)
     - Every request carries tenant_id in JWT (set at login)
     - Middleware sets DB session: SET app.current_tenant = '{tenant_id}'
     - RLS policies enforce at database level
     - Services NEVER accept tenant_id from request body
     - Cross-tenant queries impossible even with code bugs

  3. Resource-Level Authorization
     - Beyond RBAC: check ownership for customer-facing operations
     - Admin of Tenant A cannot access Tenant B resources
     - Super-admin access logged and alerted

  4. API Gateway Enforcement
     - Route-level auth requirements (no unauthenticated state-changing endpoints)
     - Internal service endpoints not exposed externally
     - Istio mTLS between services (services authenticate each other)

  5. Privilege Escalation Prevention
     - Users cannot assign roles higher than their own
     - Role changes require admin approval + audit log
     - System roles cannot be modified
```

### Security Headers (All Responses)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0     # Disabled in favor of CSP
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
Content-Security-Policy: [see XSS section]
```

---

## 9. PCI and SOC2 Checklist

### PCI DSS v4.0 Requirements

SiteForge AI processes payments via Stripe (PCI Level 1 Service Provider) with Stripe Elements / Payment Intents on the frontend. This puts SiteForge under **SAQ A** scope (card data never touches our servers).

| Req | PCI DSS Requirement | Implementation | Status |
|-----|---------------------|----------------|--------|
| **1** | **Network Security Controls** | | |
| 1.1 | Install and maintain network security controls | AWS VPC with public/private subnets, Security Groups, NACLs | Required |
| 1.2 | Network segmentation for CDE | Payment Service in dedicated `siteforge-pci` namespace with NetworkPolicy | Required |
| 1.3 | Restrict inbound/outbound traffic | Security Groups: payment service only accepts traffic from API Gateway and Stripe webhooks | Required |
| **2** | **Secure Configurations** | | |
| 2.1 | Change default passwords | All default credentials changed, enforced via IaC | Required |
| 2.2 | Harden system components | CIS Benchmark AMIs, minimal container images (distroless) | Required |
| **3** | **Protect Stored Account Data** | | |
| 3.1 | No storage of full PAN | Card data never reaches our servers (Stripe Elements) | Required |
| 3.2 | No storage of sensitive authentication data | Only last4, brand, expiry stored (from Stripe PaymentMethod) | Required |
| 3.3 | PAN display masking | Only last4 displayed, no full PAN available | Required |
| 3.4 | PAN rendered unreadable | N/A - no PAN stored | N/A |
| 3.5 | Protect cryptographic keys | AWS KMS for encryption keys, automatic rotation | Required |
| **4** | **Encrypt Transmission** | | |
| 4.1 | TLS 1.2+ for all transmissions | ALB terminates TLS 1.2+, Istio mTLS for service-to-service | Required |
| 4.2 | End-to-end encryption for PAN | N/A - Stripe handles card data encryption | N/A |
| **5** | **Malware Protection** | | |
| 5.1 | Anti-malware for systems | ClamAV for file uploads, container scanning via Trivy | Required |
| 5.2 | Regular scans | Weekly container image scans, continuous runtime monitoring (Falco) | Required |
| **6** | **Secure Development** | | |
| 6.1 | Vulnerability identification | Snyk for dependency scanning, SonarQube for SAST | Required |
| 6.2 | Custom software security | Secure SDLC, code review required, OWASP testing | Required |
| 6.3 | Protect web applications | WAF (AWS WAF), CSP headers, input validation | Required |
| **7** | **Restrict Access** | | |
| 7.1 | Need-to-know access | RBAC with least privilege, service-specific IAM roles | Required |
| 7.2 | Access control systems | AWS IAM, K8s RBAC, application-level RBAC | Required |
| **8** | **User Identification** | | |
| 8.1 | User identification and authentication | Unique user IDs, MFA for admin access | Required |
| 8.2 | MFA for CDE access | MFA required for all production access (AWS, K8s, DB) | Required |
| 8.3 | Strong password policies | Min 10 chars, complexity, rotation for system accounts | Required |
| **9** | **Physical Access** | | |
| 9.1 | Restrict physical access | AWS manages physical security (SOC2 Type II certified) | AWS |
| **10** | **Logging and Monitoring** | | |
| 10.1 | Audit trail for all access | Audit Service logs all mutations, CloudTrail for AWS | Required |
| 10.2 | Automated audit trails | All payment events logged with correlation IDs | Required |
| 10.3 | Protect audit logs | Immutable log storage (S3 with Object Lock), separate from app data | Required |
| 10.4 | Time synchronization | NTP configured on all nodes, timestamps in UTC | Required |
| 10.5 | Timely detection of failures | PagerDuty alerts for security events, 24/7 on-call | Required |
| **11** | **Regular Testing** | | |
| 11.1 | Wireless AP detection | N/A - cloud environment | N/A |
| 11.2 | Vulnerability scans | Quarterly external scans (ASV), monthly internal scans | Required |
| 11.3 | Penetration testing | Annual pentest by qualified third party | Required |
| **12** | **Security Policies** | | |
| 12.1 | Information security policy | Documented and reviewed annually | Required |
| 12.2 | Risk assessment | Annual risk assessment, threat modeling per service | Required |

### Payment Service Network Isolation

```
+--------------------------------------------------------------+
|  Kubernetes Namespace: siteforge-pci                         |
|                                                              |
|  NetworkPolicy:                                              |
|  +------------------------------------------------------+   |
|  |  INGRESS:                                             |   |
|  |    - From: siteforge namespace (API Gateway only)     |   |
|  |    - From: Stripe webhook IPs (allowlist)             |   |
|  |                                                       |   |
|  |  EGRESS:                                              |   |
|  |    - To: Stripe API (api.stripe.com)                  |   |
|  |    - To: payment_db (RDS endpoint)                    |   |
|  |    - To: Redis (for idempotency checks)               |   |
|  |    - To: Kafka (payment events)                       |   |
|  |    - Block all other egress                           |   |
|  +------------------------------------------------------+   |
|                                                              |
|  +------------------+                                        |
|  | Payment Service  |  Separate service account              |
|  | payment-db (RDS) |  Encrypted connections only            |
|  +------------------+  No shell access in container          |
|                        Read-only root filesystem             |
|                        No privilege escalation               |
+--------------------------------------------------------------+
```

### SOC2 Type II Compliance

#### Trust Service Criteria

**Security (Common Criteria)**

| Control | Description | Implementation |
|---------|-------------|----------------|
| CC1.1 | COSO Principle 1: Integrity and Ethics | Code of conduct, security training, background checks |
| CC2.1 | Information Communication | Incident response runbooks, status page (Statuspage.io) |
| CC3.1 | Risk Assessment | Quarterly risk assessment, threat modeling for new services |
| CC4.1 | Monitoring Activities | Continuous monitoring via Prometheus/Grafana, PagerDuty alerts |
| CC5.1 | Control Activities | Automated compliance checks, infrastructure as code (Terraform) |
| CC6.1 | Logical Access | AWS IAM, K8s RBAC, SSO with MFA, principle of least privilege |
| CC6.2 | Access Provisioning | JIT access via Teleport, approval workflows for production |
| CC6.3 | Access Removal | Automated deprovisioning on employee offboarding |
| CC7.1 | System Operations | Runbooks, change management, CI/CD with approval gates |
| CC7.2 | Change Management | Git-based IaC, PR reviews, staging -> canary -> production |
| CC7.3 | Vulnerability Management | Snyk, Trivy, quarterly pentests, responsible disclosure program |
| CC8.1 | Incident Management | PagerDuty, incident commander rotation, postmortems |
| CC9.1 | Risk Mitigation | Multi-AZ deployment, automated backups, disaster recovery plan |

**Availability**

| Control | Description | Implementation |
|---------|-------------|----------------|
| A1.1 | Capacity Planning | Auto-scaling (HPA + Cluster Autoscaler), load testing |
| A1.2 | Recovery Procedures | RTO: 1 hour, RPO: 5 minutes. Automated failover for RDS, Redis |
| A1.3 | Environmental Safeguards | AWS manages physical infrastructure |
| A1.4 | Business Continuity | Multi-region failover plan, regular DR drills |

**Confidentiality**

| Control | Description | Implementation |
|---------|-------------|----------------|
| C1.1 | Confidential Information | Data classification policy (public, internal, confidential, restricted) |
| C1.2 | Disposal | Data retention policies, automated deletion, secure wipe |

#### Audit Logging Requirements

```
WHAT IS LOGGED (all mutations):

  Authentication Events:
    - Login success/failure (IP, device, user agent)
    - Password changes
    - MFA enable/disable
    - Session creation/revocation
    - OAuth connections

  Data Mutations:
    - CREATE: resource type, ID, tenant, user, timestamp
    - UPDATE: resource type, ID, field changes (old -> new), tenant, user, timestamp
    - DELETE: resource type, ID, tenant, user, timestamp

  Administrative Actions:
    - Role assignments
    - Permission changes
    - Tenant status changes
    - Feature flag changes
    - Config changes

  Payment Events:
    - Payment intents created
    - Payments processed (amount, method, status)
    - Refunds initiated/completed
    - Webhook events received

  Access Events:
    - Sensitive data access (PII export, report download)
    - API key creation/revocation
    - Admin access to tenant data

LOG FORMAT (structured JSON):
  {
    "timestamp": "2026-03-31T12:00:00.000Z",
    "event_id": "uuid",
    "tenant_id": "uuid",
    "user_id": "uuid",
    "action": "update",
    "resource_type": "product",
    "resource_id": "uuid",
    "changes": { "price": { "old": 29.99, "new": 39.99 } },
    "ip_address": "203.0.113.45",
    "user_agent": "Mozilla/5.0...",
    "request_id": "req-uuid",
    "service": "product-service",
    "severity": "info"
  }

LOG STORAGE:
  - Primary: audit_db (PostgreSQL, partitioned by month)
  - Archive: S3 with Object Lock (WORM, 7-year retention)
  - Search: Elasticsearch (90-day hot storage)
  - Never deleted or modified (immutable audit trail)
```

#### Data Retention Policies

| Data Category | Active Retention | Archive | Deletion |
|---------------|-----------------|---------|----------|
| Audit Logs | 90 days (hot) | 7 years (S3 cold) | After 7 years |
| Payment Records | 2 years | 7 years | After 7 years |
| Order Data | Indefinite | N/A | On tenant deletion + 90 days |
| User PII | While active | 30 days after deletion request | GDPR-compliant erasure |
| Session Data | While active | None | On expiry/revocation |
| Analytics Data | 2 years | 5 years (aggregated) | Raw data after 2 years |
| AI Generations | 1 year | None | After 1 year |
| Media Files | While active | 30 days after deletion | After grace period |
| Backups | 35 days (RDS) | None | Automatic rotation |

#### Incident Response Procedures

```
SEVERITY LEVELS:

  SEV1 (Critical): Data breach, complete service outage, payment system compromise
    -> Response: 15 min acknowledge, 1 hour mitigation
    -> Team: Incident Commander + Engineering Lead + Security + CTO

  SEV2 (High): Partial outage, single service failure, suspected breach attempt
    -> Response: 30 min acknowledge, 4 hour mitigation
    -> Team: Incident Commander + Engineering Lead

  SEV3 (Medium): Degraded performance, non-critical bug, failed deploy
    -> Response: 2 hours acknowledge, 24 hour resolution
    -> Team: On-call engineer

  SEV4 (Low): Minor issues, improvement opportunities
    -> Response: Next business day
    -> Team: Assigned engineer

INCIDENT FLOW:
  1. DETECT    -> Automated alert (PagerDuty) or manual report
  2. TRIAGE    -> Assign severity, notify response team
  3. CONTAIN   -> Isolate affected systems, block attack vectors
  4. MITIGATE  -> Apply fix, restore service
  5. RECOVER   -> Verify full recovery, monitor for recurrence
  6. REVIEW    -> Blameless postmortem within 48 hours
  7. IMPROVE   -> Action items tracked to completion
```

---

## 10. Deployment Architecture (AWS EKS)

### EKS Cluster Layout

```
+----------------------------------------------------------------------+
|                        AWS REGION: us-east-1                          |
|                                                                      |
|  +------------------------------------------------------------------+|
|  |                     VPC: 10.0.0.0/16                              ||
|  |                                                                   ||
|  |  +-------------------------------------------------------------+ ||
|  |  |              EKS CLUSTER: siteforge-prod                     | ||
|  |  |              Kubernetes: 1.29                                | ||
|  |  |              Control Plane: AWS Managed (Multi-AZ)           | ||
|  |  +-------------------------------------------------------------+ ||
|  |                                                                   ||
|  |  PUBLIC SUBNETS (3 AZs)                                          ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |  | 10.0.1.0/24  | | 10.0.2.0/24  | | 10.0.3.0/24  |              ||
|  |  | us-east-1a   | | us-east-1b   | | us-east-1c   |              ||
|  |  | ALB, NAT GW  | | ALB          | | ALB          |              ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |                                                                   ||
|  |  PRIVATE SUBNETS (Application - 3 AZs)                           ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |  | 10.0.11.0/24 | | 10.0.12.0/24 | | 10.0.13.0/24 |              ||
|  |  | App Nodes    | | App Nodes    | | App Nodes    |              ||
|  |  | System Nodes | | System Nodes | | System Nodes |              ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |                                                                   ||
|  |  PRIVATE SUBNETS (Data - 3 AZs)                                  ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |  | 10.0.21.0/24 | | 10.0.22.0/24 | | 10.0.23.0/24 |              ||
|  |  | RDS Primary  | | RDS Standby  | | RDS Read     |              ||
|  |  | Redis Primary| | Redis Replica| | Redis Replica|              ||
|  |  | Kafka Broker | | Kafka Broker | | Kafka Broker |              ||
|  |  +--------------+ +--------------+ +--------------+              ||
|  |                                                                   ||
|  |  ISOLATED SUBNETS (PCI Zone - 2 AZs)                             ||
|  |  +--------------+ +--------------+                               ||
|  |  | 10.0.31.0/24 | | 10.0.32.0/24 |                               ||
|  |  | Payment Svc  | | Payment Svc  |                               ||
|  |  | payment_db   | | (standby)    |                               ||
|  |  +--------------+ +--------------+                               ||
|  +------------------------------------------------------------------+|
+----------------------------------------------------------------------+
```

### Node Groups

```
NODE GROUP: system
  Instance Type: m6i.xlarge (4 vCPU, 16 GB)
  Min/Max/Desired: 2 / 4 / 3
  AZs: us-east-1a, us-east-1b, us-east-1c
  Taints: CriticalAddonsOnly=true:NoSchedule
  Components:
    - Istio control plane (istiod)
    - CoreDNS
    - AWS Load Balancer Controller
    - Cluster Autoscaler
    - Karpenter
    - Metrics Server
    - External DNS
    - cert-manager
    - ArgoCD

NODE GROUP: application
  Instance Type: m6i.2xlarge (8 vCPU, 32 GB)
  Min/Max/Desired: 3 / 12 / 5
  AZs: us-east-1a, us-east-1b, us-east-1c
  Labels: workload=application
  Components:
    - All 28 microservices (except AI workers)
    - API Gateway
    - WebSocket Gateway
    - Bull Queue workers (non-AI)
    - PgBouncer sidecars

NODE GROUP: ai-workloads
  Instance Type: g5.2xlarge (1 GPU, 8 vCPU, 32 GB)
  Min/Max/Desired: 0 / 6 / 1
  AZs: us-east-1a, us-east-1b
  Taints: nvidia.com/gpu=true:NoSchedule
  Labels: workload=ai
  Components:
    - AI generation workers
    - Image generation workers
    - Model inference containers
  Scaling: Scale to 0 when no AI jobs pending

NODE GROUP: observability
  Instance Type: r6i.xlarge (4 vCPU, 32 GB)  -- memory optimized
  Min/Max/Desired: 2 / 4 / 2
  AZs: us-east-1a, us-east-1b
  Labels: workload=observability
  Components:
    - Prometheus
    - Grafana
    - Jaeger
    - Elasticsearch (for logs)
    - Kibana
```

### Service Mesh (Istio)

```
ISTIO CONFIGURATION:

  Version: 1.21
  Profile: production

  +-------------------------------------------------------------+
  |                    ISTIO MESH TOPOLOGY                       |
  |                                                              |
  |   Ingress Gateway                                            |
  |      +-- VirtualService: api.siteforge.io                   |
  |      |     +-- /api/v1/auth/*    -> auth-service             |
  |      |     +-- /api/v1/users/*   -> user-service             |
  |      |     +-- /api/v1/websites/* -> website-service         |
  |      |     +-- /api/v1/products/* -> product-service         |
  |      |     +-- /api/v1/orders/*  -> order-service            |
  |      |     +-- ...all 28 services                            |
  |      |                                                       |
  |      +-- VirtualService: ws.siteforge.io                     |
  |            +-- WebSocket upgrade -> ws-gateway               |
  |                                                              |
  |   mTLS: STRICT (all service-to-service)                      |
  |   PeerAuthentication: mtls.mode = STRICT                     |
  |                                                              |
  |   DestinationRules (per service):                            |
  |     connectionPool:                                          |
  |       tcp: { maxConnections: 100 }                           |
  |       http: { h2UpgradePolicy: UPGRADE }                    |
  |     outlierDetection:                                        |
  |       consecutiveErrors: 5                                   |
  |       interval: 30s                                          |
  |       baseEjectionTime: 30s                                  |
  |       maxEjectionPercent: 50                                 |
  |                                                              |
  |   Circuit Breaker:                                           |
  |     If 5 consecutive 5xx errors -> eject pod for 30s         |
  |     Max 50% of pods can be ejected                           |
  |                                                              |
  |   Retry Policy:                                              |
  |     attempts: 3                                              |
  |     retryOn: 5xx,reset,connect-failure                       |
  |     perTryTimeout: 5s                                        |
  |                                                              |
  |   Traffic Management:                                        |
  |     Canary deployments via traffic splitting                 |
  |     Header-based routing for testing                         |
  +--------------------------------------------------------------+
```

### Ingress (AWS ALB)

```yaml
# ALB Ingress Configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: siteforge-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:xxx:certificate/xxx
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS13-1-2-2021-06
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/wafv2-acl-arn: arn:aws:wafv2:us-east-1:xxx:regional/webacl/xxx
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "15"
    alb.ingress.kubernetes.io/group.name: siteforge
spec:
  ingressClassName: alb
  rules:
    - host: api.siteforge.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: istio-ingressgateway
                port:
                  number: 80
```

### Secrets Management (AWS Secrets Manager)

```
SECRET ORGANIZATION:

  siteforge/prod/database/
    +-- auth-db          -> { host, port, user, password, dbname }
    +-- user-db          -> { host, port, user, password, dbname }
    +-- ... (28 databases)
    +-- payment-db       -> { host, port, user, password, dbname } [PCI tagged]

  siteforge/prod/services/
    +-- stripe           -> { secret_key, webhook_secret, publishable_key }
    +-- openai           -> { api_key, org_id }
    +-- anthropic        -> { api_key }
    +-- sendgrid         -> { api_key }
    +-- aws-ses          -> { access_key, secret_key }
    +-- cloudflare       -> { api_token, zone_id }

  siteforge/prod/infrastructure/
    +-- redis            -> { host, port, password }
    +-- kafka            -> { brokers, sasl_username, sasl_password }
    +-- elasticsearch    -> { host, username, password }
    +-- s3               -> { bucket, region, kms_key_id }

  siteforge/prod/auth/
    +-- jwt-keys         -> { private_key, public_key }  [RSA 4096]
    +-- encryption-key   -> { key }                       [AES-256]

INTEGRATION WITH K8S:
  - External Secrets Operator (ESO) syncs Secrets Manager -> K8s Secrets
  - Auto-rotation: 90-day rotation for DB passwords
  - Secrets never stored in container images or env vars in manifests
  - ESO SecretStore per namespace (PCI namespace has restricted access)

ROTATION STRATEGY:
  1. AWS Secrets Manager triggers Lambda on rotation schedule
  2. Lambda creates new credential in database
  3. Lambda updates secret in Secrets Manager
  4. ESO detects change, updates K8s Secret
  5. Pods pick up new secret (via volume mount, not env var)
  6. Old credential revoked after grace period (5 min)
```

### Blue/Green Deployment Strategy

```
DEPLOYMENT PIPELINE:

  Developer -> Git Push -> GitHub Actions -> Build -> Test -> Deploy

  +-----------------------------------------------------------------+
  |                     DEPLOYMENT FLOW                              |
  |                                                                  |
  |  1. BUILD PHASE                                                  |
  |     +-- Run unit tests                                          |
  |     +-- Run integration tests                                   |
  |     +-- SAST scan (SonarQube)                                   |
  |     +-- Dependency scan (Snyk)                                  |
  |     +-- Build Docker image                                      |
  |     +-- Container scan (Trivy)                                  |
  |     +-- Push to ECR                                             |
  |                                                                  |
  |  2. STAGING DEPLOYMENT                                           |
  |     +-- Deploy to staging cluster                               |
  |     +-- Run E2E tests                                           |
  |     +-- Run load tests (k6)                                     |
  |     +-- Manual QA approval gate                                 |
  |                                                                  |
  |  3. PRODUCTION DEPLOYMENT (Blue/Green via Argo Rollouts)         |
  |                                                                  |
  |     Step 1: Deploy GREEN (new version)                           |
  |     +----------------+    +----------------+                     |
  |     | BLUE (current) |    | GREEN (new)    |                     |
  |     | 100% traffic   |    | 0% traffic     |                     |
  |     | v2.3.0         |    | v2.4.0         |                     |
  |     +----------------+    +----------------+                     |
  |                                                                  |
  |     Step 2: Canary (10% traffic to GREEN)                        |
  |     +----------------+    +----------------+                     |
  |     | BLUE           |    | GREEN          |                     |
  |     | 90% traffic    |    | 10% traffic    |                     |
  |     +----------------+    +----------------+                     |
  |     -> Monitor: error rate, latency, saturation (5 min)          |
  |                                                                  |
  |     Step 3: Ramp up (50% traffic to GREEN)                       |
  |     +----------------+    +----------------+                     |
  |     | BLUE           |    | GREEN          |                     |
  |     | 50% traffic    |    | 50% traffic    |                     |
  |     +----------------+    +----------------+                     |
  |     -> Monitor (5 min)                                           |
  |                                                                  |
  |     Step 4: Full promotion (100% to GREEN)                       |
  |     +----------------+    +----------------+                     |
  |     | BLUE (standby) |    | GREEN          |                     |
  |     | 0% traffic     |    | 100% traffic   |                     |
  |     +----------------+    +----------------+                     |
  |     -> Keep BLUE for 30 min for instant rollback                 |
  |                                                                  |
  |  4. AUTOMATIC ROLLBACK TRIGGERS                                  |
  |     +-- Error rate > 1% (5xx responses)                         |
  |     +-- P99 latency > 2x baseline                              |
  |     +-- Health check failures > 3 consecutive                   |
  |     +-- Custom metrics breach (e.g., payment failure rate)      |
  |                                                                  |
  |  5. DATABASE MIGRATIONS                                          |
  |     +-- Forward-only migrations (never destructive)             |
  |     +-- Expand-contract pattern for schema changes              |
  |     +-- Run BEFORE deployment (Prisma migrate deploy)           |
  |     +-- Backward compatible (old code works with new schema)    |
  +-----------------------------------------------------------------+
```

### Auto-Scaling

```
HORIZONTAL POD AUTOSCALER (HPA):

  Per-Service Configuration:
  +-------------------------+--------+--------+-------------------------+
  | Service                 | Min    | Max    | Target Metric           |
  +-------------------------+--------+--------+-------------------------+
  | API Gateway             | 3      | 20     | CPU 60%, RPS 1000      |
  | Auth Service            | 2      | 10     | CPU 70%, RPS 500       |
  | User Service            | 2      | 8      | CPU 70%                |
  | Website Service         | 2      | 10     | CPU 60%                |
  | Product Service         | 2      | 12     | CPU 60%, RPS 800       |
  | Order Service           | 2      | 10     | CPU 60%                |
  | Payment Service         | 2      | 8      | CPU 50% (conservative) |
  | AI Workers              | 0      | 6      | Queue depth (Bull)     |
  | WebSocket Gateway       | 2      | 8      | Connection count 5000  |
  | Search Service          | 2      | 6      | CPU 70%, RPS 500       |
  | Analytics Service       | 2      | 8      | CPU 70%                |
  | Notification Service    | 2      | 6      | Queue depth            |
  | Media Service           | 2      | 6      | CPU 70%                |
  | (Other services)        | 2      | 6      | CPU 70%                |
  +-------------------------+--------+--------+-------------------------+

CLUSTER AUTOSCALER + KARPENTER:

  Cluster Autoscaler:
    - Scale up: When pods are Pending due to insufficient resources
    - Scale down: When node utilization < 50% for 10 minutes
    - Cool down: 5 min after scale up, 10 min after scale down
    - Max nodes: 30

  Karpenter (for AI workloads):
    - Provisions GPU nodes on-demand
    - Selects optimal instance type (g5.xlarge -> g5.4xlarge)
    - Consolidation: moves workloads to fewer nodes when possible
    - TTL: Terminate empty nodes after 30 seconds
    - Spot instances for non-critical AI jobs (70% cost saving)

VERTICAL POD AUTOSCALER (VPA):
    - Mode: Recommendation only (not auto-apply)
    - Provides right-sizing recommendations
    - Applied during maintenance windows
```

```yaml
# Example HPA for Product Service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
  namespace: siteforge
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 2
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "800"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

### Observability Stack

```
+----------------------------------------------------------------------+
|                      OBSERVABILITY ARCHITECTURE                       |
|                                                                       |
|  +------------------------------------------------------------------+|
|  |                      APPLICATION LAYER                            ||
|  |                                                                   ||
|  |   Each Service Pod:                                               ||
|  |   +--------------+  +--------------+  +------------------+       ||
|  |   | App Container |  | Istio Sidecar|  | OTel Collector   |       ||
|  |   |              |  | (Envoy)      |  | (sidecar/agent)  |       ||
|  |   | Structured   |--| Access logs  |--| Traces + Metrics |       ||
|  |   | JSON logs    |  | mTLS metrics |  | + Logs           |       ||
|  |   +--------------+  +--------------+  +------------------+       ||
|  +------------------------------------------------------------------+|
|                                      |                                |
|                    +-----------------+------------------+             |
|                    |                 |                   |             |
|                    v                 v                   v             |
|  +------------------+  +------------------+  +---------------------+ |
|  |    TRACING        |  |    METRICS        |  |     LOGGING         | |
|  |                   |  |                   |  |                     | |
|  |  OpenTelemetry    |  |  Prometheus       |  |  Fluent Bit         | |
|  |  -> Jaeger        |  |  (scrape 15s)     |  |  -> Elasticsearch   | |
|  |                   |  |                   |  |  -> Kibana           | |
|  |  Features:        |  |  Features:        |  |                     | |
|  |  - Distributed    |  |  - Service RED    |  |  Features:          | |
|  |    trace across   |  |    metrics        |  |  - Structured JSON  | |
|  |    all 28 services|  |  - Node metrics   |  |  - Correlation IDs  | |
|  |  - Span context   |  |  - Custom biz     |  |  - Log levels       | |
|  |    propagation    |  |    metrics        |  |  - PII masking      | |
|  |  - Trace sampling |  |  - Alert rules    |  |  - 30-day retention | |
|  |    (10% normal,   |  |                   |  |    (hot), 1 year    | |
|  |     100% errors)  |  |                   |  |    (cold/S3)        | |
|  |  - 7-day retention|  |                   |  |                     | |
|  +------------------+  +--------+----------+  +---------------------+ |
|                                  |                                    |
|                         +--------v----------+                        |
|                         |     GRAFANA        |                        |
|                         |                    |                        |
|                         |  Dashboards:       |                        |
|                         |  - Service Health  |                        |
|                         |  - Business KPIs   |                        |
|                         |  - Infrastructure  |                        |
|                         |  - SLO Tracking    |                        |
|                         |                    |                        |
|                         |  Data Sources:     |                        |
|                         |  - Prometheus      |                        |
|                         |  - Jaeger          |                        |
|                         |  - Elasticsearch   |                        |
|                         |  - CloudWatch      |                        |
|                         +--------+----------+                        |
|                                  |                                    |
|                         +--------v----------+                        |
|                         |   ALERTING         |                        |
|                         |                    |                        |
|                         |  Prometheus ->     |                        |
|                         |  AlertManager ->   |                        |
|                         |  PagerDuty         |                        |
|                         |  + Slack           |                        |
|                         |  + Email           |                        |
|                         +-------------------+                        |
+----------------------------------------------------------------------+
```

### Key Prometheus Alert Rules

```yaml
# Critical SLO Alerts
groups:
  - name: siteforge-slos
    rules:
      # API Availability SLO: 99.9%
      - alert: APIAvailabilitySLOBreach
        expr: |
          (1 - (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          )) < 0.999
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API availability below 99.9% SLO"

      # API Latency SLO: P99 < 500ms
      - alert: APILatencySLOBreach
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 0.5
        for: 5m
        labels:
          severity: critical

      # Payment Service Error Rate
      - alert: PaymentErrorRateHigh
        expr: |
          sum(rate(http_requests_total{service="payment-service",status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total{service="payment-service"}[5m]))
          > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Payment service error rate > 1%"

      # Database Connection Pool Exhaustion
      - alert: DBConnectionPoolNearLimit
        expr: pgbouncer_pools_server_active / pgbouncer_pools_server_maxconn > 0.8
        for: 5m
        labels:
          severity: warning

      # Kafka Consumer Lag
      - alert: KafkaConsumerLagHigh
        expr: kafka_consumer_group_lag > 10000
        for: 10m
        labels:
          severity: warning

      # AI Queue Depth
      - alert: AIQueueBacklog
        expr: bull_queue_waiting{queue="ai:generation"} > 50
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "AI generation queue backlog > 50 jobs"

      # Node Memory Pressure
      - alert: NodeMemoryPressure
        expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1
        for: 5m
        labels:
          severity: critical

      # Pod Restart Loop
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
        for: 5m
        labels:
          severity: warning
```

### SLO Definitions

```
SERVICE LEVEL OBJECTIVES:

  +---------------------------+----------+-------------------------------+
  | SLO                       | Target   | Error Budget (30 days)        |
  +---------------------------+----------+-------------------------------+
  | API Availability          | 99.9%    | 43.2 minutes downtime         |
  | API Latency (P99)         | < 500ms  | 0.1% requests can exceed     |
  | Payment Processing        | 99.95%   | 21.6 minutes downtime         |
  | Website Availability      | 99.95%   | 21.6 minutes downtime         |
  | AI Generation Success     | 99%      | 1% failures allowed           |
  | AI Generation Time (P95)  | < 30s    | 5% can exceed                |
  | Data Durability           | 99.999%  | 0.001% data loss tolerance   |
  | Webhook Delivery          | 99.9%    | 0.1% can fail (with retry)   |
  +---------------------------+----------+-------------------------------+
```

### Full Infrastructure Diagram

```
+-----------------------------------------------------------------------------+
|                              COMPLETE ARCHITECTURE                           |
|                                                                              |
|   Internet                                                                   |
|      |                                                                       |
|   CloudFront --- WAF --- Shield Advanced                                     |
|      |                                                                       |
|   Route 53 (DNS)                                                            |
|      |                                                                       |
|   ALB (TLS 1.3)                                                             |
|      |                                                                       |
|   +----------------------------------------------------------------------+  |
|   |  EKS CLUSTER                                                          |  |
|   |                                                                       |  |
|   |  Namespace: istio-system                                              |  |
|   |    +-- Istio Control Plane, Ingress Gateway                          |  |
|   |                                                                       |  |
|   |  Namespace: siteforge                                                 |  |
|   |    +-- API Gateway (Kong)                                            |  |
|   |    +-- WebSocket Gateway                                             |  |
|   |    +-- Auth, User, Role, Tenant Services                             |  |
|   |    +-- Website, Template, Theme, Industry Services                   |  |
|   |    +-- AI, AI Version Services                                       |  |
|   |    +-- Product, Inventory, Pricing Services                          |  |
|   |    +-- Order, Refund, Wallet Services                                |  |
|   |    +-- Plugin, Domain, Email, Notification Services                  |  |
|   |    +-- Analytics, Reporting, Media, Config Services                  |  |
|   |    +-- Audit, Search Services                                        |  |
|   |    +-- Bull Queue Workers (email, media, reports, bulk)              |  |
|   |                                                                       |  |
|   |  Namespace: siteforge-pci                                             |  |
|   |    +-- Payment Service (isolated)                                    |  |
|   |                                                                       |  |
|   |  Namespace: siteforge-ai                                              |  |
|   |    +-- AI Workers (GPU nodes)                                        |  |
|   |                                                                       |  |
|   |  Namespace: observability                                             |  |
|   |    +-- Prometheus + AlertManager                                     |  |
|   |    +-- Grafana                                                       |  |
|   |    +-- Jaeger                                                        |  |
|   |    +-- Elasticsearch + Kibana                                        |  |
|   |    +-- Fluent Bit (DaemonSet)                                        |  |
|   |                                                                       |  |
|   |  Namespace: argocd                                                    |  |
|   |    +-- ArgoCD (GitOps)                                               |  |
|   +----------------------------------------------------------------------+  |
|                                                                              |
|   +----------------------------------------------------------------------+  |
|   |  MANAGED SERVICES                                                     |  |
|   |                                                                       |  |
|   |  RDS PostgreSQL 15 (Multi-AZ)                                        |  |
|   |    +-- 28 databases + read replicas for analytics, product, reporting|  |
|   |                                                                       |  |
|   |  ElastiCache Redis 7 (Cluster Mode)                                  |  |
|   |    +-- 3 masters + 3 replicas                                        |  |
|   |                                                                       |  |
|   |  MSK (Managed Kafka) 3.6                                             |  |
|   |    +-- 3 brokers + Schema Registry                                   |  |
|   |                                                                       |  |
|   |  S3 (3 buckets: media, templates, system)                            |  |
|   |    +-- KMS encryption, versioning, lifecycle policies                |  |
|   |                                                                       |  |
|   |  SES (Email sending)                                                 |  |
|   |  Secrets Manager (credential storage)                                |  |
|   |  KMS (encryption keys)                                               |  |
|   |  ECR (container registry)                                            |  |
|   |  CloudWatch (AWS metrics + logs backup)                              |  |
|   +----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Appendix: Service Resource Requirements

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|---------|-------------|-----------|----------------|--------------|----------|
| API Gateway | 500m | 2000m | 512Mi | 1Gi | 3-20 |
| Auth Service | 250m | 1000m | 256Mi | 512Mi | 2-10 |
| User Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Role Service | 100m | 500m | 128Mi | 256Mi | 2-6 |
| Tenant Service | 100m | 500m | 128Mi | 256Mi | 2-6 |
| Website Service | 250m | 1000m | 256Mi | 512Mi | 2-10 |
| Template Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Theme Service | 100m | 500m | 128Mi | 256Mi | 2-6 |
| Industry Service | 100m | 500m | 128Mi | 256Mi | 2-4 |
| AI Service | 500m | 2000m | 512Mi | 1Gi | 2-8 |
| AI Version Service | 100m | 500m | 128Mi | 256Mi | 2-4 |
| Product Service | 250m | 1000m | 256Mi | 512Mi | 2-12 |
| Inventory Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Pricing Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Order Service | 250m | 1000m | 256Mi | 512Mi | 2-10 |
| Payment Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Refund Service | 100m | 500m | 128Mi | 256Mi | 2-6 |
| Wallet Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| POS Service | 250m | 1000m | 256Mi | 512Mi | 2-8 |
| Plugin Service | 100m | 500m | 128Mi | 256Mi | 2-6 |
| Domain Service | 100m | 500m | 128Mi | 256Mi | 2-4 |
| Email Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| Notification Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| Analytics Service | 500m | 2000m | 512Mi | 1Gi | 2-8 |
| Reporting Service | 250m | 1000m | 256Mi | 512Mi | 2-4 |
| Media Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| Config Service | 100m | 500m | 128Mi | 256Mi | 2-4 |
| Audit Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| Search Service | 250m | 1000m | 256Mi | 512Mi | 2-6 |
| AI Workers (GPU) | 4000m | 8000m | 8Gi | 16Gi | 0-6 |
| WebSocket Gateway | 250m | 1000m | 512Mi | 1Gi | 2-8 |

---

*Document generated for SiteForge AI Platform. For questions, contact the Platform Engineering team.*
