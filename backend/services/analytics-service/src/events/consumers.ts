import amqplib, { Channel, Connection } from 'amqplib';
import { config } from '../config';
import { analyticsService } from '../services/analytics.service';

let connection: Connection | null = null;
let channel: Channel | null = null;
const EXCHANGE = 'siteforge.events';
const QUEUE = 'analytics-service.events';

export async function startConsumers(): Promise<void> {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });

    await channel.bindQueue(QUEUE, EXCHANGE, 'order.created');
    await channel.bindQueue(QUEUE, EXCHANGE, 'payment.succeeded');

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        await handleEvent(event);
        channel!.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        channel!.nack(msg, false, false);
      }
    });
    console.log('Analytics service consumers started');
  } catch (error) {
    console.error('Failed to start consumers:', error);
  }
}

async function handleEvent(event: { event: string; data: Record<string, unknown> }): Promise<void> {
  switch (event.event) {
    case 'order.created':
      await analyticsService.trackEvent({
        tenantId: event.data.tenantId as string,
        eventType: 'purchase',
        eventData: event.data,
      });
      break;
    case 'payment.succeeded':
      await analyticsService.trackEvent({
        tenantId: event.data.tenantId as string,
        eventType: 'payment_success',
        eventData: event.data,
      });
      break;
    default:
      console.log('Unhandled event:', event.event);
  }
}
