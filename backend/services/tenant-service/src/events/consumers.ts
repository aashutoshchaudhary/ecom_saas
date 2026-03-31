import { EventConsumer, KafkaTopics, EventTypes, logger } from '@siteforge/shared';
import { tenantService } from '../services/tenant.service';

export async function startConsumers() {
  const consumer = new EventConsumer('tenant-service-group');

  consumer.on(EventTypes.USER_SIGNED_UP, async (payload) => {
    const { userId, email, firstName, lastName } = payload.data as any;
    logger.info('Processing user.signed_up - creating default tenant', { userId });

    const tenantName = `${firstName || email.split('@')[0]}'s Business`;
    await tenantService.create({
      name: tenantName,
      ownerId: userId,
    });
  });

  await consumer.subscribe([KafkaTopics.USER_EVENTS]);
  logger.info('Tenant service consumers started');
}
