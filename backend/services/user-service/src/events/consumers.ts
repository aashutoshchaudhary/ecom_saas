import { EventConsumer, KafkaTopics, EventTypes, logger } from '@siteforge/shared';
import { userService } from '../services/user.service';

export async function startConsumers() {
  const consumer = new EventConsumer('user-service-group');

  consumer.on(EventTypes.USER_SIGNED_UP, async (payload) => {
    const { userId, email, firstName, lastName } = payload.data as any;
    logger.info('Processing user.signed_up', { userId });

    await userService.createUser({ userId, email, firstName, lastName });
  });

  await consumer.subscribe([KafkaTopics.USER_EVENTS]);
  logger.info('User service consumers started');
}
