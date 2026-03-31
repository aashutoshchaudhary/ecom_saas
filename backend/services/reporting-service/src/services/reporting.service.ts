import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
const PDFDocument = require('pdfkit');
import { Readable } from 'stream';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class ReportingService {
  async generateReport(data: {
    tenantId: string;
    name: string;
    type: string;
    parameters: { startDate: string; endDate: string; filters?: Record<string, unknown> };
    format: string;
  }) {
    const report = await prisma.report.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        type: data.type,
        parameters: data.parameters as any,
        format: data.format,
        status: 'PROCESSING',
      },
    });

    // Generate report asynchronously
    this.processReport(report.id, data).catch((error) => {
      console.error(`Failed to process report ${report.id}:`, error);
    });

    return report;
  }

  private async processReport(reportId: string, data: {
    tenantId: string;
    type: string;
    parameters: { startDate: string; endDate: string; filters?: Record<string, unknown> };
    format: string;
  }) {
    try {
      let fileUrl: string;

      if (data.format === 'PDF') {
        fileUrl = await this.generatePdfReport(data);
      } else if (data.format === 'CSV') {
        fileUrl = await this.generateCsvReport(data);
      } else {
        fileUrl = await this.generateCsvReport(data); // Fallback
      }

      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'COMPLETED', fileUrl, generatedAt: new Date() },
      });
    } catch (error) {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async generatePdfReport(data: {
    tenantId: string;
    type: string;
    parameters: { startDate: string; endDate: string };
  }): Promise<string> {
    // In production, generate PDF and upload to S3
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        // Upload to S3 and return URL
        resolve(`/reports/${data.tenantId}/${Date.now()}.pdf`);
      });

      doc.fontSize(20).text(`${data.type.toUpperCase()} Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Tenant: ${data.tenantId}`);
      doc.text(`Period: ${data.parameters.startDate} to ${data.parameters.endDate}`);
      doc.text(`Generated: ${new Date().toISOString()}`);
      doc.end();
    });
  }

  private async generateCsvReport(data: {
    tenantId: string;
    type: string;
    parameters: { startDate: string; endDate: string };
  }): Promise<string> {
    // In production, generate CSV and upload to S3
    return `/reports/${data.tenantId}/${Date.now()}.csv`;
  }

  async getReport(reportId: string) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError('Report not found', StatusCodes.NOT_FOUND);
    return report;
  }

  async listReports(tenantId: string, filters: { type?: string; status?: string; limit?: number; offset?: number }) {
    const where: any = { tenantId };
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total };
  }

  async scheduleReport(data: {
    tenantId: string;
    reportType: string;
    schedule: string;
    recipients: string[];
  }) {
    return prisma.scheduledReport.create({ data });
  }

  async updateSchedule(scheduleId: string, tenantId: string, updates: {
    schedule?: string;
    recipients?: string[];
    isActive?: boolean;
  }) {
    const existing = await prisma.scheduledReport.findUnique({ where: { id: scheduleId } });
    if (!existing || existing.tenantId !== tenantId) {
      throw new AppError('Scheduled report not found', StatusCodes.NOT_FOUND);
    }
    return prisma.scheduledReport.update({
      where: { id: scheduleId },
      data: updates,
    });
  }

  async listSchedules(tenantId: string) {
    return prisma.scheduledReport.findMany({
      where: { tenantId },
      orderBy: { reportType: 'asc' },
    });
  }
}

export const reportingService = new ReportingService();
