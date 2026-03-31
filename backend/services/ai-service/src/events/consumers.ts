import { EventConsumer, KafkaTopics, EventTypes, logger } from '@siteforge/shared';
import { aiService } from '../services/ai.service';

export async function startConsumers() {
  const consumer = new EventConsumer('ai-service-group');

  consumer.on(EventTypes.USER_SIGNED_UP, async (payload) => {
    const { userId } = payload.data as any;
    logger.info('Processing user.signed_up - preparing AI generation capabilities', { userId });
    // AI generation is triggered after tenant and website are created
    // This consumer can be used to pre-warm caches or set up defaults
  });

  consumer.on(EventTypes.TENANT_INDUSTRY_ADDED, async (payload) => {
    const { tenantId, industry } = payload.data as any;
    logger.info('Industry added to tenant - ready for AI generation', { tenantId, industry });
  });

  await consumer.subscribe([KafkaTopics.USER_EVENTS, KafkaTopics.TENANT_EVENTS]);
  logger.info('AI service consumers started');
}
