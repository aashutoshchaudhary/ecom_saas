import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { config } from '../config';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? {
        user: config.smtp.user,
        pass: config.smtp.pass,
      } : undefined,
    });
  }

  async sendEmail(data: {
    tenantId: string;
    to: string;
    subject: string;
    body?: string;
    templateId?: string;
    templateData?: Record<string, unknown>;
  }) {
    let emailBody = data.body || '';
    let emailSubject = data.subject;

    if (data.templateId) {
      const template = await prisma.emailTemplate.findUnique({ where: { id: data.templateId } });
      if (!template) throw new AppError('Email template not found', StatusCodes.NOT_FOUND);

      const bodyTemplate = Handlebars.compile(template.body);
      const subjectTemplate = Handlebars.compile(template.subject);
      emailBody = bodyTemplate(data.templateData || {});
      emailSubject = subjectTemplate(data.templateData || {});
    }

    const log = await prisma.emailLog.create({
      data: {
        tenantId: data.tenantId,
        to: data.to,
        subject: emailSubject,
        templateId: data.templateId,
        status: 'QUEUED',
        provider: 'SMTP',
      },
    });

    try {
      await this.transporter.sendMail({
        from: config.aws.sesFromEmail,
        to: data.to,
        subject: emailSubject,
        html: emailBody,
      });

      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      return { ...log, status: 'SENT' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', error: errorMessage },
      });
      throw new AppError(`Failed to send email: ${errorMessage}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async sendBulkEmail(data: {
    tenantId: string;
    recipients: Array<{ to: string; templateData?: Record<string, unknown> }>;
    subject?: string;
    body?: string;
    templateId?: string;
  }) {
    const results = [];
    for (const recipient of data.recipients) {
      try {
        const result = await this.sendEmail({
          tenantId: data.tenantId,
          to: recipient.to,
          subject: data.subject || '',
          body: data.body,
          templateId: data.templateId,
          templateData: recipient.templateData,
        });
        results.push({ to: recipient.to, status: 'SENT', id: result.id });
      } catch (error) {
        results.push({
          to: recipient.to,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    return results;
  }

  async createTemplate(data: {
    tenantId?: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
  }) {
    return prisma.emailTemplate.create({ data });
  }

  async listTemplates(tenantId?: string) {
    const where = tenantId ? { OR: [{ tenantId }, { tenantId: null }] } : { tenantId: null };
    return prisma.emailTemplate.findMany({ where: where as any });
  }

  async listLogs(tenantId: string, filters: { status?: string; limit?: number; offset?: number }) {
    const where: any = { tenantId };
    if (filters.status) where.status = filters.status;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const emailService = new EmailService();
