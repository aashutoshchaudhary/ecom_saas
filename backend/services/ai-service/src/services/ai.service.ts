import { PrismaClient } from '@prisma/client';
import {
  generateId, AppError, NotFoundError,
  parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';
import { promptBuilderService } from './prompt-builder.service';

const prisma = new PrismaClient();

export class AiService {
  async generateWebsite(tenantId: string, data: {
    websiteId: string; industry: string; businessName: string;
    description?: string; preferences?: Record<string, unknown>;
  }) {
    const job = await this.createJob(tenantId, 'WEBSITE', data);

    await EventProducer.publish(
      KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_STARTED,
      { jobId: job.id, tenantId, type: 'WEBSITE', websiteId: data.websiteId },
      tenantId
    );

    return job;
  }

  async generatePage(tenantId: string, data: {
    websiteId: string; pageType: string; industry: string;
    context?: Record<string, unknown>;
  }) {
    return this.createJob(tenantId, 'PAGE', data);
  }

  async generateSection(tenantId: string, data: {
    websiteId: string; pageId: string; sectionType: string;
    industry: string; context?: Record<string, unknown>;
  }) {
    return this.createJob(tenantId, 'SECTION', data);
  }

  async generateContent(tenantId: string, data: {
    type: string; industry: string; topic: string;
    tone?: string; length?: string;
  }) {
    return this.createJob(tenantId, 'CONTENT', data);
  }

  async generateImage(tenantId: string, data: {
    prompt: string; style?: string; size?: string;
  }) {
    return this.createJob(tenantId, 'IMAGE', data);
  }

  async regenerate(tenantId: string, jobId: string) {
    const originalJob = await this.getJob(tenantId, jobId);
    return this.createJob(tenantId, originalJob.type, originalJob.input as Record<string, unknown>);
  }

  async listJobs(tenantId: string, query: { page?: string; limit?: string; status?: string; type?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [jobs, total] = await Promise.all([
      prisma.aiJob.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.aiJob.count({ where }),
    ]);

    return paginationHelper(jobs, total, page, limit);
  }

  async getJob(tenantId: string, jobId: string) {
    const job = await prisma.aiJob.findUnique({ where: { id: jobId } });
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundError('AI Job', jobId);
    }
    return job;
  }

  async processJob(jobId: string) {
    const job = await prisma.aiJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError('AI Job', jobId);

    try {
      await prisma.aiJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', startedAt: new Date() },
      });

      const prompt = promptBuilderService.buildPrompt(job.type, job.input as Record<string, unknown>);

      // In production, call OpenAI/Anthropic API with the prompt
      const result = { prompt, generated: true, timestamp: new Date().toISOString() };

      await prisma.aiJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          output: result as any,
          completedAt: new Date(),
          creditsUsed: this.calculateCredits(job.type),
        },
      });

      await EventProducer.publish(
        KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_COMPLETED,
        { jobId, tenantId: job.tenantId, type: job.type, creditsUsed: this.calculateCredits(job.type) },
        job.tenantId
      );
    } catch (error) {
      await prisma.aiJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
      });

      await EventProducer.publish(
        KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_FAILED,
        { jobId, tenantId: job.tenantId, error: error instanceof Error ? error.message : 'Unknown' },
        job.tenantId
      );
    }
  }

  private async createJob(tenantId: string, type: string, input: Record<string, unknown>) {
    const job = await prisma.aiJob.create({
      data: {
        id: generateId(),
        tenantId,
        type,
        status: 'QUEUED',
        input: input as any,
      },
    });

    // In production, push to Bull queue for async processing
    // await aiQueue.add('process', { jobId: job.id });

    return job;
  }

  private calculateCredits(type: string): number {
    const creditMap: Record<string, number> = {
      WEBSITE: 50,
      PAGE: 10,
      SECTION: 5,
      CONTENT: 3,
      IMAGE: 8,
    };
    return creditMap[type] || 5;
  }
}

export const aiService = new AiService();
