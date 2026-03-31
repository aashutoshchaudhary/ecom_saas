import amqplib from 'amqplib';
import { config } from '../config';

let connection: any = null;
let channel: any = null;

const EXCHANGE = 'siteforge.events';
const QUEUE = 'plugin-service.events';

export async function startConsumers(): Promise<void> {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });

    // Listen for tenant events
    await channel.bindQueue(QUEUE, EXCHANGE, 'tenant.deleted');

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

    console.log('Plugin service consumers started');
  } catch (error) {
    console.error('Failed to start consumers:', error);
  }
}

async function handleEvent(event: { event: string; data: Record<string, unknown> }): Promise<void> {
  switch (event.event) {
    case 'tenant.deleted':
      console.log('Tenant deleted, cleaning up plugin installations:', event.data);
      // Clean up installations for deleted tenant
      break;
    default:
      console.log('Unhandled event:', event.event);
  }
}
