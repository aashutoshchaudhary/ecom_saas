import { Kafka, Consumer } from 'kafkajs';
import { config } from '../config';
import { notificationService } from '../services/notification.service';

let consumer: Consumer | null = null;

export async function startConsumers(): Promise<void> {
  try {
    const kafka = new Kafka({
      clientId: config.serviceName,
      brokers: config.kafka.brokers,
    });

    consumer = kafka.consumer({ groupId: config.kafka.groupId });
    await consumer.connect();

    await consumer.subscribe({ topics: ['order.created', 'payment.succeeded', 'user.registered'], fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          await handleEvent(topic, event);
        } catch (error) {
          console.error('Error processing event:', error);
        }
      },
    });

    console.log('Notification service consumers started');
  } catch (error) {
    console.error('Failed to start consumers:', error);
  }
}

async function handleEvent(topic: string, data: Record<string, unknown>): Promise<void> {
  switch (topic) {
    case 'order.created':
      if (data.userId && data.tenantId) {
        await notificationService.send({
          tenantId: data.tenantId as string,
          userId: data.userId as string,
          type: 'IN_APP',
          channel: 'orders',
          title: 'New Order',
          body: `Order #${data.orderId || 'N/A'} has been placed`,
          data,
        });
      }
      break;
    case 'payment.succeeded':
      if (data.userId && data.tenantId) {
        await notificationService.send({
          tenantId: data.tenantId as string,
          userId: data.userId as string,
          type: 'IN_APP',
          channel: 'payments',
          title: 'Payment Received',
          body: `Payment of ${data.amount || '0'} has been processed`,
          data,
        });
      }
      break;
    default:
      console.log('Unhandled topic:', topic);
  }
}
