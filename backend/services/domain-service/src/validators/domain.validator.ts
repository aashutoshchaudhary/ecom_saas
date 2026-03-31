import { z } from 'zod';

export const addDomainSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    websiteId: z.string().uuid(),
    domain: z.string().min(3).max(253).regex(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/),
    type: z.enum(['SUBDOMAIN', 'CUSTOM']).default('CUSTOM'),
  }),
});

export const verifyDomainSchema = z.object({
  params: z.object({
    domainId: z.string().uuid(),
  }),
});

export const removeDomainSchema = z.object({
  params: z.object({
    domainId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const checkDnsSchema = z.object({
  params: z.object({
    domainId: z.string().uuid(),
  }),
});

export const renewSslSchema = z.object({
  params: z.object({
    domainId: z.string().uuid(),
  }),
});

export const listDomainsSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    websiteId: z.string().uuid().optional(),
  }),
});
