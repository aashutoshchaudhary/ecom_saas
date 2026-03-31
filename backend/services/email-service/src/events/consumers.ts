import amqplib from 'amqplib';
import { config } from '../config';
import { emailQueue } from '../workers/email.worker';

let connection: any = null;
let channel: any = null;
const EXCHANGE = 'siteforge.events';
const QUEUE = 'email-service.events';

export async function startConsumers(): Promise<void> {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });

    await channel.bindQueue(QUEUE, EXCHANGE, 'order.created');
    await channel.bindQueue(QUEUE, EXCHANGE, 'payment.succeeded');
    await channel.bindQueue(QUEUE, EXCHANGE, 'user.registered');
    await channel.bindQueue(QUEUE, EXCHANGE, 'user.password-reset');

    channel.consume(QUEUE, async (msg: any) => {
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
    console.log('Email service consumers started');
  } catch (error) {
    console.error('Failed to start consumers:', error);
  }
}

async function handleEvent(event: { event: string; data: Record<string, unknown> }): Promise<void> {
  switch (event.event) {
    case 'order.created':
      await emailQueue.add('order-confirmation', {
        type: 'send',
        data: {
          tenantId: event.data.tenantId,
          to: event.data.customerEmail,
          subject: 'Order Confirmation',
          templateId: 'order-confirmation',
          templateData: event.data,
        },
      });
      break;
    case 'user.registered':
      await emailQueue.add('welcome-email', {
        type: 'send',
        data: {
          tenantId: event.data.tenantId,
          to: event.data.email,
          subject: 'Welcome to SiteForge',
          templateId: 'welcome',
          templateData: event.data,
        },
      });
      break;
    default:
      console.log('Unhandled event:', event.event);
  }
}
