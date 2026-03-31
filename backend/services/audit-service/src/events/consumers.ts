import { Kafka, Consumer } from 'kafkajs';
import { config } from '../config';
import { auditService } from '../services/audit.service';

let consumer: Consumer | null = null;

export async function startConsumers(): Promise<void> {
  try {
    const kafka = new Kafka({
      clientId: config.serviceName,
      brokers: config.kafka.brokers,
    });

    consumer = kafka.consumer({ groupId: config.kafka.groupId });
    await consumer.connect();

    // Subscribe to all mutation events across services
    await consumer.subscribe({
      topics: [
        'user.created', 'user.updated', 'user.deleted',
        'order.created', 'order.updated', 'order.cancelled',
        'product.created', 'product.updated', 'product.deleted',
        'payment.succeeded', 'payment.refunded',
        'tenant.created', 'tenant.updated', 'tenant.deleted',
        'website.created', 'website.updated', 'website.deleted',
        'plugin.installed', 'plugin.uninstalled',
        'domain.added', 'domain.removed',
        'config.updated', 'feature-flag.toggled',
      ],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          await handleEvent(topic, event);
        } catch (error) {
          console.error('Error processing audit event:', error);
        }
      },
    });

    console.log('Audit service consumers started - listening to all mutation events');
  } catch (error) {
    console.error('Failed to start audit consumers:', error);
  }
}

async function handleEvent(topic: string, event: {
  data: Record<string, unknown>;
  service?: string;
}): Promise<void> {
  const parts = topic.split('.');
  const resource = parts[0] || 'unknown';
  const action = parts[1] || 'unknown';

  if (event.data?.tenantId && event.data?.userId) {
    await auditService.createLog({
      tenantId: event.data.tenantId as string,
      userId: event.data.userId as string,
      action,
      resource,
      resourceId: (event.data.resourceId || event.data.id) as string | undefined,
      before: event.data.before as Record<string, unknown> | undefined,
      after: event.data.after as Record<string, unknown> | undefined,
      metadata: {
        source: event.service || 'unknown',
        eventTopic: topic,
      },
    });
  }
}

export async function stopConsumers(): Promise<void> {
  if (consumer) await consumer.disconnect();
}
