import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import dns from 'dns';
import { promisify } from 'util';

const prisma = new PrismaClient();
const resolveCname = promisify(dns.resolveCname);
const resolveTxt = promisify(dns.resolveTxt);

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class DomainService {
  async addDomain(data: { tenantId: string; websiteId: string; domain: string; type: 'SUBDOMAIN' | 'CUSTOM' }) {
    const existing = await prisma.domain.findUnique({ where: { domain: data.domain } });
    if (existing) {
      throw new AppError('Domain already registered', StatusCodes.CONFLICT);
    }

    const verificationToken = `siteforge-verify-${Buffer.from(data.tenantId).toString('base64').substring(0, 16)}`;
    const dnsRecords = data.type === 'CUSTOM'
      ? [
          { type: 'CNAME', name: data.domain, value: 'proxy.siteforge.app', status: 'pending' },
          { type: 'TXT', name: `_siteforge.${data.domain}`, value: verificationToken, status: 'pending' },
        ]
      : [{ type: 'CNAME', name: data.domain, value: 'proxy.siteforge.app', status: 'active' }];

    return prisma.domain.create({
      data: {
        tenantId: data.tenantId,
        websiteId: data.websiteId,
        domain: data.domain,
        type: data.type,
        status: data.type === 'SUBDOMAIN' ? 'ACTIVE' : 'PENDING',
        sslStatus: 'PENDING',
        dnsRecords,
      },
    });
  }

  async verifyDomain(domainId: string) {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) throw new AppError('Domain not found', StatusCodes.NOT_FOUND);

    try {
      const records = domain.dnsRecords as Array<{ type: string; name: string; value: string }>;
      const cnameRecord = records.find((r) => r.type === 'CNAME');
      const txtRecord = records.find((r) => r.type === 'TXT');

      let cnameVerified = false;
      let txtVerified = false;

      if (cnameRecord) {
        try {
          const results = await resolveCname(cnameRecord.name);
          cnameVerified = results.some((r) => r === cnameRecord.value);
        } catch { cnameVerified = false; }
      }

      if (txtRecord) {
        try {
          const results = await resolveTxt(txtRecord.name);
          txtVerified = results.flat().some((r) => r === txtRecord.value);
        } catch { txtVerified = false; }
      }

      const isVerified = cnameVerified && (txtRecord ? txtVerified : true);

      return prisma.domain.update({
        where: { id: domainId },
        data: {
          status: isVerified ? 'ACTIVE' : 'PENDING',
          verifiedAt: isVerified ? new Date() : null,
          dnsRecords: records.map((r) => ({
            ...r,
            status: (r.type === 'CNAME' && cnameVerified) || (r.type === 'TXT' && txtVerified) ? 'active' : 'pending',
          })),
        },
      });
    } catch (error) {
      return prisma.domain.update({
        where: { id: domainId },
        data: { status: 'FAILED' },
      });
    }
  }

  async removeDomain(domainId: string, tenantId: string) {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain || domain.tenantId !== tenantId) {
      throw new AppError('Domain not found', StatusCodes.NOT_FOUND);
    }
    await prisma.domain.delete({ where: { id: domainId } });
    return { success: true };
  }

  async checkDns(domainId: string) {
    return this.verifyDomain(domainId);
  }

  async renewSsl(domainId: string) {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) throw new AppError('Domain not found', StatusCodes.NOT_FOUND);
    if (domain.status !== 'ACTIVE') {
      throw new AppError('Domain must be active to renew SSL', StatusCodes.BAD_REQUEST);
    }

    // In production, trigger SSL certificate renewal via ACME/Let's Encrypt
    return prisma.domain.update({
      where: { id: domainId },
      data: {
        sslStatus: 'ACTIVE',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }

  async listDomains(tenantId: string, websiteId?: string) {
    const where: { tenantId: string; websiteId?: string } = { tenantId };
    if (websiteId) where.websiteId = websiteId;
    return prisma.domain.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}

export const domainService = new DomainService();
